import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  authenticate(userId) {
    if (this.socket) {
      this.socket.emit('authenticate', { userId });
    }
  }

  createRoom(userId, settings) {
    return new Promise((resolve, reject) => {
      if (!this.socket) reject(new Error('Socket not connected'));
      
      this.socket.emit('create-room', { userId, settings });
      
      this.socket.once('room-created', (data) => {
        resolve(data);
      });
      
      this.socket.once('error', (error) => {
        reject(new Error(error.message));
      });
    });
  }

  joinRoom(roomCode, userId) {
    return new Promise((resolve, reject) => {
      if (!this.socket) reject(new Error('Socket not connected'));
      
      this.socket.emit('join-room', { roomCode, userId });
      
      this.socket.once('room-joined', (data) => {
        resolve(data);
      });
      
      this.socket.once('error', (error) => {
        reject(new Error(error.message));
      });
    });
  }

  leaveRoom(roomCode) {
    if (this.socket) {
      this.socket.emit('leave-room', { roomCode });
    }
  }

  assignCohost(roomCode, cohostId) {
    if (this.socket) {
      this.socket.emit('assign-cohost', { roomCode, cohostId });
    }
  }

  startGame(roomCode) {
    if (this.socket) {
      this.socket.emit('start-game', { roomCode });
    }
  }

  spinBottle(roomCode) {
    if (this.socket) {
      this.socket.emit('spin-bottle', { roomCode });
    }
  }

  selectTruthDare(roomCode, selection) {
    if (this.socket) {
      this.socket.emit('select-truth-dare', { roomCode, selection });
    }
  }

  skipVote(roomCode) {
    if (this.socket) {
      this.socket.emit('skip-vote', { roomCode });
    }
  }

  extendTime(roomCode, additionalSeconds = 15) {
    if (this.socket) {
      this.socket.emit('extend-time', { roomCode, additionalSeconds });
    }
  }

  endGame(roomCode) {
    if (this.socket) {
      this.socket.emit('end-game', { roomCode });
    }
  }

  sendChatMessage(roomCode, message, senderId, senderName) {
    if (this.socket) {
      this.socket.emit('send-chat-message', { roomCode, message, senderId, senderName });
    }
  }

  sendReaction(roomCode, emoji, senderId, senderName) {
    if (this.socket) {
      this.socket.emit('send-reaction', { roomCode, emoji, senderId, senderName });
    }
  }

  startScreenShare(roomCode, userId) {
    if (this.socket) {
      this.socket.emit('screen-share-start', { roomCode, userId });
    }
  }

  stopScreenShare(roomCode, userId) {
    if (this.socket) {
      this.socket.emit('screen-share-stop', { roomCode, userId });
    }
  }

  kickParticipant(roomCode, targetUserId) {
    if (this.socket) {
      this.socket.emit('kick-participant', { roomCode, targetUserId });
    }
  }

  getRoomState(roomCode) {
    if (this.socket) {
      this.socket.emit('get-room-state', { roomCode });
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      this.listeners.clear();
    }
  }
}

export const socketService = new SocketService();
export default socketService;
