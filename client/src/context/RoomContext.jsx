import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import socketService from '../utils/socket';
import { useAuth } from './AuthContext';

const RoomContext = createContext(null);

export function RoomProvider({ children }) {
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [isCohost, setIsCohost] = useState(false);
  const [gameState, setGameState] = useState({
    isActive: false,
    currentPlayerId: null,
    currentChallenge: null,
    skipVotes: [],
    skipCount: 0
  });
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [timerDuration, setTimerDuration] = useState(30);
  const [screenSharing, setScreenSharing] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);

  useEffect(() => {
    if (!user) return;

    const handleRoomJoined = (data) => {
      setRoom(data.room);
      setParticipants(data.room.participants || []);
      setIsHost(data.room.hostId === user._id);
      setIsCohost(data.room.cohostId === user._id);
      setGameState(data.room.gameState || { isActive: false, currentPlayerId: null, currentChallenge: null });
    };

    const handleParticipantJoined = (data) => {
      setParticipants((prev) => {
        const exists = prev.find((p) => p.userId === data.participant.userId);
        if (exists) return prev;
        return [...prev, { ...data.participant, socketId: data.participant.socketId }];
      });
    };

    const handleParticipantLeft = (data) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
    };

    const handleParticipantKicked = (data) => {
      setParticipants((prev) => prev.filter((p) => p.userId !== data.userId));
    };

    const handleCohostAssigned = (data) => {
      setIsCohost(data.cohostId === user._id);
      setRoom((prev) => ({ ...prev, cohostId: data.cohostId }));
    };

    const handleHostChanged = (data) => {
      setIsHost(data.newHostId === user._id);
      setIsCohost(false);
      setRoom((prev) => ({ ...prev, hostId: data.newHostId, cohostId: null }));
    };

    const handleGameStarted = () => {
      setGameState((prev) => ({ ...prev, isActive: true }));
    };

    const handleGameEnded = () => {
      setGameState({
        isActive: false,
        currentPlayerId: null,
        currentChallenge: null,
        skipVotes: [],
        skipCount: 0
      });
      setSelectedPlayer(null);
    };

    const handleBottleStopped = (data) => {
      setSelectedPlayer(data.selectedPlayer);
      setGameState((prev) => ({
        ...prev,
        currentPlayerId: data.selectedPlayer.userId
      }));
    };

    const handleChallengeRevealed = (data) => {
      setGameState((prev) => ({
        ...prev,
        currentChallenge: data.challenge
      }));
      setTimerDuration(data.timerDuration || 30);
    };

    const handleChallengeSkipped = () => {
      setGameState((prev) => ({
        ...prev,
        currentChallenge: null,
        skipVotes: [],
        skipCount: 0
      }));
    };

    const handleSkipVoteUpdate = (data) => {
      setGameState((prev) => ({
        ...prev,
        skipVotes: data.skipCount,
        skipCount: data.skipCount
      }));
    };

    const handleTimeExtended = (data) => {
      setTimerDuration((prev) => prev + data.additionalSeconds);
    };

    const handleChatMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    const handleReaction = (data) => {
      const reaction = { ...data, id: Date.now() };
      setReactions((prev) => [...prev.slice(-20), reaction]);
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 2500);
    };

    const handleScreenShareStarted = (data) => {
      setScreenSharing(data.userId);
    };

    const handleScreenShareStopped = (data) => {
      setScreenSharing(null);
    };

    const handleKicked = () => {
      setRoom(null);
      setParticipants([]);
      setIsHost(false);
      setIsCohost(false);
    };

    socketService.on('room-joined', handleRoomJoined);
    socketService.on('room-created', handleRoomJoined);
    socketService.on('participant-joined', handleParticipantJoined);
    socketService.on('participant-left', handleParticipantLeft);
    socketService.on('participant-kicked', handleParticipantKicked);
    socketService.on('cohost-assigned', handleCohostAssigned);
    socketService.on('host-changed', handleHostChanged);
    socketService.on('game-started', handleGameStarted);
    socketService.on('game-ended', handleGameEnded);
    socketService.on('bottle-stopped', handleBottleStopped);
    socketService.on('challenge-revealed', handleChallengeRevealed);
    socketService.on('challenge-skipped', handleChallengeSkipped);
    socketService.on('skip-vote-update', handleSkipVoteUpdate);
    socketService.on('time-extended', handleTimeExtended);
    socketService.on('chat-message', handleChatMessage);
    socketService.on('reaction', handleReaction);
    socketService.on('screen-share-started', handleScreenShareStarted);
    socketService.on('screen-share-stopped', handleScreenShareStopped);
    socketService.on('kicked', handleKicked);

    return () => {
      socketService.off('room-joined', handleRoomJoined);
      socketService.off('room-created', handleRoomJoined);
      socketService.off('participant-joined', handleParticipantJoined);
      socketService.off('participant-left', handleParticipantLeft);
      socketService.off('participant-kicked', handleParticipantKicked);
      socketService.off('cohost-assigned', handleCohostAssigned);
      socketService.off('host-changed', handleHostChanged);
      socketService.off('game-started', handleGameStarted);
      socketService.off('game-ended', handleGameEnded);
      socketService.off('bottle-stopped', handleBottleStopped);
      socketService.off('challenge-revealed', handleChallengeRevealed);
      socketService.off('challenge-skipped', handleChallengeSkipped);
      socketService.off('skip-vote-update', handleSkipVoteUpdate);
      socketService.off('time-extended', handleTimeExtended);
      socketService.off('chat-message', handleChatMessage);
      socketService.off('reaction', handleReaction);
      socketService.off('screen-share-started', handleScreenShareStarted);
      socketService.off('screen-share-stopped', handleScreenShareStopped);
      socketService.off('kicked', handleKicked);
    };
  }, [user]);

  const createRoom = useCallback(async (settings) => {
    try {
      const data = await socketService.createRoom(user._id, settings);
      setRoom(data.room);
      setParticipants(data.room.participants);
      setIsHost(true);
      setIsCohost(false);
      return data.roomCode;
    } catch (error) {
      throw error;
    }
  }, [user]);

  const joinRoom = useCallback(async (roomCode) => {
    try {
      const data = await socketService.joinRoom(roomCode, user._id);
      setRoom(data.room);
      setParticipants(data.room.participants);
      setIsHost(data.room.hostId === user._id);
      setIsCohost(data.room.cohostId === user._id);
      return data.roomCode;
    } catch (error) {
      throw error;
    }
  }, [user]);

  const leaveRoom = useCallback(() => {
    if (room) {
      socketService.leaveRoom(room.roomCode);
    }
    setRoom(null);
    setParticipants([]);
    setIsHost(false);
    setIsCohost(false);
    setGameState({
      isActive: false,
      currentPlayerId: null,
      currentChallenge: null,
      skipVotes: [],
      skipCount: 0
    });
    setSelectedPlayer(null);
    setMessages([]);
    setReactions([]);
    setScreenSharing(null);
  }, [room]);

  const assignCohost = useCallback((cohostId) => {
    if (room) {
      socketService.assignCohost(room.roomCode, cohostId);
    }
  }, [room]);

  const startGame = useCallback(() => {
    if (room) {
      socketService.startGame(room.roomCode);
    }
  }, [room]);

  const spinBottle = useCallback(() => {
    if (room) {
      socketService.spinBottle(room.roomCode);
    }
  }, [room]);

  const selectTruthDare = useCallback((selection) => {
    if (room) {
      socketService.selectTruthDare(room.roomCode, selection);
    }
  }, [room]);

  const skipVote = useCallback(() => {
    if (room) {
      socketService.skipVote(room.roomCode);
    }
  }, [room]);

  const extendTime = useCallback((seconds = 15) => {
    if (room) {
      socketService.extendTime(room.roomCode, seconds);
    }
  }, [room]);

  const endGame = useCallback(() => {
    if (room) {
      socketService.endGame(room.roomCode);
    }
  }, [room]);

  const sendChatMessage = useCallback((message) => {
    if (room && user) {
      socketService.sendChatMessage(room.roomCode, message, user._id, user.displayName);
    }
  }, [room, user]);

  const sendReaction = useCallback((emoji) => {
    if (room && user) {
      socketService.sendReaction(room.roomCode, emoji, user._id, user.displayName);
    }
  }, [room, user]);

  const startScreenShare = useCallback(() => {
    if (room && user) {
      socketService.startScreenShare(room.roomCode, user._id);
    }
  }, [room, user]);

  const stopScreenShare = useCallback(() => {
    if (room && user) {
      socketService.stopScreenShare(room.roomCode, user._id);
    }
  }, [room, user]);

  const kickParticipant = useCallback((targetUserId) => {
    if (room) {
      socketService.kickParticipant(room.roomCode, targetUserId);
    }
  }, [room]);

  return (
    <RoomContext.Provider
      value={{
        room,
        participants,
        isHost,
        isCohost,
        gameState,
        selectedPlayer,
        timerDuration,
        screenSharing,
        messages,
        reactions,
        createRoom,
        joinRoom,
        leaveRoom,
        assignCohost,
        startGame,
        spinBottle,
        selectTruthDare,
        skipVote,
        extendTime,
        endGame,
        sendChatMessage,
        sendReaction,
        startScreenShare,
        stopScreenShare,
        kickParticipant
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}
