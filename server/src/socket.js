import { Server } from 'socket.io';
import Room from './models/Room.js';
import User from './models/User.js';
import { getRandomChallenge } from './data/challenges.js';
import { v4 as uuidv4 } from 'uuid';

const rooms = new Map();
const userSockets = new Map();

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('authenticate', async (data) => {
      try {
        const user = await User.findById(data.userId);
        if (user) {
          socket.userId = user._id.toString();
          socket.userData = { _id: user._id, displayName: user.displayName, avatar: user.avatar };
          userSockets.set(socket.userId, socket);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    });

    socket.on('create-room', async (data) => {
      try {
        const { userId, settings } = data;
        const user = await User.findById(userId);
        if (!user) return;

        const roomCode = generateRoomCode();
        const roomData = {
          roomCode,
          hostId: userId,
          cohostId: null,
          participants: [{
            userId,
            socketId: socket.id,
            displayName: user.displayName,
            avatar: user.avatar
          }],
          settings: {
            maxParticipants: settings?.maxParticipants || 10,
            timerDuration: settings?.timerDuration || 30,
            categories: settings?.categories || ['funny', 'bold', 'personal', 'silly'],
            isPrivate: settings?.isPrivate || false
          },
          gameState: {
            isActive: false,
            currentPlayerId: null,
            currentChallenge: null,
            usedChallenges: [],
            skipVotes: [],
            skipCount: 0
          }
        };

        const room = new Room(roomData);
        await room.save();

        rooms.set(roomCode, {
          ...roomData,
          _id: room._id,
          socket: socket
        });

        socket.join(roomCode);
        socket.currentRoom = roomCode;

        await User.findByIdAndUpdate(userId, {
          $push: { roomHistory: { roomCode, role: 'host' } }
        });

        socket.emit('room-created', { roomCode, room: roomData });
      } catch (error) {
        console.error('Create room error:', error);
        socket.emit('error', { message: 'Failed to create room' });
      }
    });

    socket.on('join-room', async (data) => {
      try {
        const { roomCode, userId } = data;
        const room = await Room.findOne({ roomCode: roomCode.toUpperCase() });
        
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (room.participants.length >= room.settings.maxParticipants) {
          socket.emit('error', { message: 'Room is full' });
          return;
        }

        const user = await User.findById(userId);
        if (!user) return;

        const existingParticipant = room.participants.find(p => p.userId.toString() === userId);
        if (!existingParticipant) {
          room.participants.push({
            userId,
            socketId: socket.id,
            displayName: user.displayName,
            avatar: user.avatar
          });
          await room.save();
        }

        const roomData = rooms.get(roomCode.toUpperCase());
        if (roomData) {
          roomData.participants = room.participants;
          roomData.socket = socket;
        } else {
          rooms.set(roomCode.toUpperCase(), {
            ...room.toObject(),
            socket
          });
        }

        socket.join(roomCode.toUpperCase());
        socket.currentRoom = roomCode.toUpperCase();

        await User.findByIdAndUpdate(userId, {
          $push: { roomHistory: { roomCode, role: 'participant' } }
        });

        socket.emit('room-joined', { roomCode, room: room.toObject() });
        socket.to(roomCode.toUpperCase()).emit('participant-joined', {
          participant: { userId, displayName: user.displayName, avatar: user.avatar }
        });
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    socket.on('leave-room', async (data) => {
      await handleLeaveRoom(socket, data.roomCode, 'left');
    });

    socket.on('assign-cohost', async (data) => {
      try {
        const { roomCode, cohostId } = data;
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        if (room.hostId.toString() !== socket.userId) {
          socket.emit('error', { message: 'Only host can assign cohost' });
          return;
        }

        room.cohostId = cohostId;
        await room.save();

        const roomData = rooms.get(roomCode);
        if (roomData) {
          roomData.cohostId = cohostId;
        }

        io.to(roomCode).emit('cohost-assigned', { cohostId });
      } catch (error) {
        console.error('Assign cohost error:', error);
      }
    });

    socket.on('start-game', async (data) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        const isHost = room.hostId.toString() === socket.userId;
        const isCohost = room.cohostId && room.cohostId.toString() === socket.userId;

        if (!isHost && !isCohost) {
          socket.emit('error', { message: 'Only host or cohost can start the game' });
          return;
        }

        room.gameState.isActive = true;
        room.gameState.usedChallenges = [];
        room.gameState.skipVotes = [];
        room.gameState.skipCount = 0;
        await room.save();

        const roomData = rooms.get(roomCode);
        if (roomData) {
          roomData.gameState = room.gameState;
        }

        io.to(roomCode).emit('game-started');
      } catch (error) {
        console.error('Start game error:', error);
      }
    });

    socket.on('spin-bottle', async (data) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ roomCode });
        if (!room || !room.gameState.isActive) return;

        if (room.participants.length < 2) {
          socket.emit('error', { message: 'Need at least 2 participants to spin' });
          return;
        }

        const selectedIndex = Math.floor(Math.random() * room.participants.length);
        const selectedParticipant = room.participants[selectedIndex];

        room.gameState.currentPlayerId = selectedParticipant.userId;
        room.gameState.currentChallenge = null;
        room.gameState.skipVotes = [];
        room.gameState.skipCount = 0;
        await room.save();

        const roomData = rooms.get(roomCode);
        if (roomData) {
          roomData.gameState = room.gameState;
        }

        io.to(roomCode).emit('bottle-stopped', {
          selectedPlayer: {
            userId: selectedParticipant.userId,
            displayName: selectedParticipant.displayName,
            avatar: selectedParticipant.avatar
          }
        });
      } catch (error) {
        console.error('Spin bottle error:', error);
      }
    });

    socket.on('select-truth-dare', async (data) => {
      try {
        const { roomCode, selection } = data;
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        if (room.gameState.currentPlayerId.toString() !== socket.userId) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        const user = await User.findById(socket.userId);
        const challenge = getRandomChallenge(
          selection,
          room.settings.categories.includes('mixed') ? null : room.settings.categories[0],
          room.gameState.usedChallenges,
          user?.customChallenges || []
        );

        if (challenge) {
          room.gameState.currentChallenge = challenge;
          room.gameState.usedChallenges.push(challenge.id);
          await room.save();

          const roomData = rooms.get(roomCode);
          if (roomData) {
            roomData.gameState = room.gameState;
          }

          io.to(roomCode).emit('challenge-revealed', {
            challenge,
            timerDuration: room.settings.timerDuration,
            playerName: user?.displayName || 'Unknown'
          });
        }
      } catch (error) {
        console.error('Select truth/dare error:', error);
      }
    });

    socket.on('skip-vote', async (data) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ roomCode });
        if (!room || !room.gameState.currentChallenge) return;

        const alreadyVoted = room.gameState.skipVotes.some(v => v.userId.toString() === socket.userId);
        if (alreadyVoted) {
          socket.emit('error', { message: 'Already voted' });
          return;
        }

        room.gameState.skipVotes.push({ userId: socket.userId });
        room.gameState.skipCount = room.gameState.skipVotes.length;
        await room.save();

        const roomData = rooms.get(roomCode);
        if (roomData) {
          roomData.gameState = room.gameState;
        }

        const majority = Math.ceil(room.participants.length / 2);
        io.to(roomCode).emit('skip-vote-update', {
          skipCount: room.gameState.skipCount,
          totalParticipants: room.participants.length,
          votesNeeded: majority
        });

        if (room.gameState.skipCount >= majority) {
          room.gameState.currentChallenge = null;
          room.gameState.skipVotes = [];
          room.gameState.skipCount = 0;
          await room.save();

          io.to(roomCode).emit('challenge-skipped');
        }
      } catch (error) {
        console.error('Skip vote error:', error);
      }
    });

    socket.on('extend-time', async (data) => {
      try {
        const { roomCode, additionalSeconds } = data;
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        const isHost = room.hostId.toString() === socket.userId;
        const isCohost = room.cohostId && room.cohostId.toString() === socket.userId;

        if (!isHost && !isCohost) {
          socket.emit('error', { message: 'Only host or cohost can extend time' });
          return;
        }

        io.to(roomCode).emit('time-extended', { additionalSeconds });
      } catch (error) {
        console.error('Extend time error:', error);
      }
    });

    socket.on('end-game', async (data) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        const isHost = room.hostId.toString() === socket.userId;
        const isCohost = room.cohostId && room.cohostId.toString() === socket.userId;

        if (!isHost && !isCohost) {
          socket.emit('error', { message: 'Only host or cohost can end the game' });
          return;
        }

        room.gameState.isActive = false;
        room.gameState.currentPlayerId = null;
        room.gameState.currentChallenge = null;
        await room.save();

        const roomData = rooms.get(roomCode);
        if (roomData) {
          roomData.gameState = room.gameState;
        }

        io.to(roomCode).emit('game-ended');
      } catch (error) {
        console.error('End game error:', error);
      }
    });

    socket.on('send-chat-message', (data) => {
      const { roomCode, message, senderId, senderName } = data;
      io.to(roomCode).emit('chat-message', {
        senderId,
        senderName,
        message,
        timestamp: new Date()
      });
    });

    socket.on('send-reaction', (data) => {
      const { roomCode, emoji, senderId, senderName } = data;
      io.to(roomCode).emit('reaction', {
        emoji,
        senderId,
        senderName,
        timestamp: Date.now()
      });
    });

    socket.on('screen-share-start', (data) => {
      const { roomCode, userId } = data;
      socket.to(roomCode).emit('screen-share-started', { userId });
    });

    socket.on('screen-share-stop', (data) => {
      const { roomCode, userId } = data;
      socket.to(roomCode).emit('screen-share-stopped', { userId });
    });

    socket.on('kick-participant', async (data) => {
      try {
        const { roomCode, targetUserId } = data;
        const room = await Room.findOne({ roomCode });
        if (!room) return;

        const isHost = room.hostId.toString() === socket.userId;
        const isCohost = room.cohostId && room.cohostId.toString() === socket.userId;

        if (!isHost && !isCohost) {
          socket.emit('error', { message: 'Only host or cohost can kick participants' });
          return;
        }

        if (targetUserId === room.hostId.toString()) {
          socket.emit('error', { message: 'Cannot kick the host' });
          return;
        }

        room.participants = room.participants.filter(p => p.userId.toString() !== targetUserId);
        await room.save();

        const targetSocket = userSockets.get(targetUserId);
        if (targetSocket) {
          targetSocket.leave(roomCode);
          targetSocket.emit('kicked', { roomCode });
        }

        io.to(roomCode).emit('participant-kicked', { userId: targetUserId });
      } catch (error) {
        console.error('Kick participant error:', error);
      }
    });

    socket.on('get-room-state', async (data) => {
      try {
        const { roomCode } = data;
        const room = await Room.findOne({ roomCode }).populate('participants.userId', 'displayName avatar');
        if (room) {
          socket.emit('room-state', { room: room.toObject() });
        }
      } catch (error) {
        console.error('Get room state error:', error);
      }
    });

    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);
      await handleLeaveRoom(socket, socket.currentRoom, 'disconnected');
      userSockets.delete(socket.userId);
    });
  });

  async function handleLeaveRoom(socket, roomCode, reason) {
    if (!roomCode) return;

    try {
      const room = await Room.findOne({ roomCode });
      if (!room) return;

      room.participants = room.participants.filter(p => p.socketId !== socket.id);
      
      const leftParticipant = room.participants.find(p => p.userId.toString() === socket.userId);
      
      if (leftParticipant) {
        leftParticipant.socketId = null;
      }

      if (room.hostId.toString() === socket.userId) {
        if (room.cohostId) {
          room.hostId = room.cohostId;
          room.cohostId = null;
          io.to(roomCode).emit('host-changed', { newHostId: room.hostId.toString() });
        } else {
          if (room.participants.length === 0) {
            room.isActive = false;
            rooms.delete(roomCode);
            await Room.deleteOne({ _id: room._id });
            return;
          }
          const newHost = room.participants[0];
          room.hostId = newHost.userId;
          io.to(roomCode).emit('host-changed', { newHostId: newHost.userId.toString() });
        }
      }

      if (room.cohostId && room.cohostId.toString() === socket.userId) {
        room.cohostId = null;
      }

      await room.save();

      const roomData = rooms.get(roomCode);
      if (roomData) {
        roomData.participants = room.participants;
        roomData.hostId = room.hostId;
        roomData.cohostId = room.cohostId;
      }

      socket.leave(roomCode);
      socket.currentRoom = null;

      io.to(roomCode).emit('participant-left', {
        userId: socket.userId,
        reason
      });
    } catch (error) {
      console.error('Handle leave room error:', error);
    }
  }
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export { rooms, userSockets };
