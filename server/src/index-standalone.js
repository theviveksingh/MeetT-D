import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db/simpleDB.js';
import { truthChallenges as truths, dareChallenges as dares } from './data/challenges.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'meettd-super-secret-jwt-key-2024';
const CLIENT_URL = process.env.CLIENT_URL || '*';

// Serve static files from client dist
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// Serve index.html for all non-API routes (SPA support)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  } else {
    next();
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// In-memory room storage for real-time functionality
const rooms = new Map();

// Auth Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    
    const existing = await db.users.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      _id: uuidv4(),
      email,
      password: hashedPassword,
      displayName,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`,
      createdAt: new Date().toISOString()
    };
    
    await db.users.create(user);
    
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { _id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ token, user: { _id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ _id: user._id, email: user.email, displayName: user.displayName, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Challenge Routes
app.get('/api/challenges/random', authenticate, (req, res) => {
  const type = req.query.type;
  const category = req.query.category;
  
  let pool = type === 'truth' ? truths : dares;
  if (category) {
    pool = pool.filter(c => c.category === category);
  }
  
  const challenge = pool[Math.floor(Math.random() * pool.length)];
  res.json(challenge);
});

app.get('/api/challenges/custom', authenticate, async (req, res) => {
  try {
    const challenges = await db.customChallenges.find({ userId: req.user.userId, isActive: true });
    res.json({ challenges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/challenges/custom', authenticate, async (req, res) => {
  try {
    const { text, type, category } = req.body;
    const challenge = {
      _id: uuidv4(),
      userId: req.user.userId,
      text,
      type,
      category,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    await db.customChallenges.create(challenge);
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/challenges/custom/:id', authenticate, async (req, res) => {
  try {
    const challenge = await db.customChallenges.findByIdAndUpdate(req.params.id, req.body);
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    res.json(challenge);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/challenges/custom/:id', authenticate, async (req, res) => {
  try {
    await db.customChallenges.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('authenticate', ({ userId }) => {
    socket.userId = userId;
    console.log('User authenticated:', userId);
  });

  socket.on('create-room', async ({ userId, settings }) => {
    const user = await db.users.findById(userId);
    if (!user) return;

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room = {
      _id: uuidv4(),
      roomCode,
      hostId: userId,
      cohostId: null,
      participants: [{
        socketId: socket.id,
        userId: userId,
        displayName: user.displayName,
        avatar: user.avatar
      }],
      settings: settings || {
        maxParticipants: 10,
        timerDuration: 30,
        categories: ['funny', 'bold', 'personal', 'silly']
      },
      gameState: {
        isActive: false,
        currentChallenge: null,
        selectedPlayer: null,
        spinResult: null
      },
      chat: [],
      createdAt: new Date().toISOString()
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.roomCode = roomCode;

    socket.emit('room-created', { roomCode, room });
    console.log('Room created:', roomCode);
  });

  socket.on('join-room', async ({ roomCode, userId }) => {
    const user = await db.users.findById(userId);
    if (!user) return;

    const room = rooms.get(roomCode.toUpperCase());
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.participants.length >= room.settings.maxParticipants) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const participant = {
      socketId: socket.id,
      userId: userId,
      displayName: user.displayName,
      avatar: user.avatar
    };

    room.participants.push(participant);
    socket.join(roomCode);
    socket.roomCode = roomCode;
    socket.userId = userId;

    io.to(roomCode).emit('participant-joined', { participant, participants: room.participants });
    socket.emit('room-joined', { roomCode, room });
    console.log('User joined room:', roomCode);
  });

  socket.on('leave-room', ({ roomCode }) => {
    handleLeaveRoom(socket, roomCode);
  });

  socket.on('start-game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.gameState = {
      isActive: true,
      currentChallenge: null,
      selectedPlayer: null,
      spinResult: null
    };

    io.to(roomCode).emit('game-started', { gameState: room.gameState });
  });

  socket.on('spin-bottle', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const activeParticipants = room.participants;
    const currentIndex = activeParticipants.findIndex(p => p.userId === room.gameState.selectedPlayer?.userId);
    const nextIndex = (currentIndex + 1 + Math.floor(Math.random() * activeParticipants.length)) % activeParticipants.length;
    const selectedPlayer = activeParticipants[nextIndex];

    room.gameState.spinResult = selectedPlayer;
    room.gameState.selectedPlayer = selectedPlayer;

    io.to(roomCode).emit('bottle-spun', { selectedPlayer });
  });

  socket.on('select-truth-dare', ({ roomCode, selection }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const pool = selection === 'truth' ? truths : dares;
    const category = room.settings.categories[Math.floor(Math.random() * room.settings.categories.length)];
    const categoryChallenges = pool.filter(c => c.category === category);
    const challenge = categoryChallenges[Math.floor(Math.random() * categoryChallenges.length)] || pool[0];

    room.gameState.currentChallenge = {
      ...challenge,
      type: selection,
      timerDuration: room.settings.timerDuration,
      skipVotes: [],
      startTime: Date.now()
    };

    io.to(roomCode).emit('challenge-selected', { challenge: room.gameState.currentChallenge });
  });

  socket.on('skip-vote', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room || !room.gameState.currentChallenge) return;

    if (!room.gameState.currentChallenge.skipVotes.includes(socket.userId)) {
      room.gameState.currentChallenge.skipVotes.push(socket.userId);
    }

    const voteCount = room.gameState.currentChallenge.skipVotes.length;
    const totalParticipants = room.participants.length;
    const threshold = Math.ceil(totalParticipants / 2);

    if (voteCount >= threshold) {
      room.gameState.currentChallenge = null;
      room.gameState.selectedPlayer = null;
      io.to(roomCode).emit('challenge-skipped', { message: 'Challenge skipped by majority vote' });
    } else {
      io.to(roomCode).emit('skip-vote-update', { voteCount, threshold });
    }
  });

  socket.on('end-challenge', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.gameState.currentChallenge = null;
    room.gameState.selectedPlayer = null;
    io.to(roomCode).emit('challenge-ended', {});
  });

  socket.on('end-game', ({ roomCode }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.gameState = {
      isActive: false,
      currentChallenge: null,
      selectedPlayer: null,
      spinResult: null
    };

    io.to(roomCode).emit('game-ended', { gameState: room.gameState });
  });

  socket.on('send-chat-message', ({ roomCode, message, senderId, senderName }) => {
    io.to(roomCode).emit('chat-message', {
      id: uuidv4(),
      senderId,
      senderName,
      message,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send-reaction', ({ roomCode, emoji, senderId, senderName }) => {
    io.to(roomCode).emit('reaction', { emoji, senderId, senderName });
  });

  socket.on('screen-share-start', ({ roomCode, userId }) => {
    socket.to(roomCode).emit('screen-share-started', { userId });
  });

  socket.on('screen-share-stop', ({ roomCode, userId }) => {
    socket.to(roomCode).emit('screen-share-stopped', { userId });
  });

  socket.on('kick-participant', ({ roomCode, targetUserId }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const targetSocket = [...io.sockets.sockets.values()].find(s => s.userId === targetUserId && s.roomCode === roomCode);
    if (targetSocket) {
      room.participants = room.participants.filter(p => p.userId !== targetUserId);
      targetSocket.emit('kicked', { roomCode });
      targetSocket.leave(roomCode);
      io.to(roomCode).emit('participant-left', { userId: targetUserId, participants: room.participants });
    }
  });

  socket.on('assign-cohost', ({ roomCode, cohostId }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    room.cohostId = cohostId;
    io.to(roomCode).emit('cohost-assigned', { cohostId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (socket.roomCode) {
      handleLeaveRoom(socket, socket.roomCode);
    }
  });
});

function handleLeaveRoom(socket, roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;

  const participantIndex = room.participants.findIndex(p => p.socketId === socket.id);
  if (participantIndex === -1) return;

  const participant = room.participants[participantIndex];
  room.participants.splice(participantIndex, 1);
  socket.leave(roomCode);

  io.to(roomCode).emit('participant-left', { 
    userId: participant.userId, 
    participants: room.participants,
    newHost: room.hostId === participant.userId ? room.participants[0]?.userId : null
  });

  if (room.hostId === participant.userId && room.participants.length > 0) {
    room.hostId = room.participants[0].userId;
    io.to(roomCode).emit('host-changed', { newHostId: room.hostId });
  }

  if (room.participants.length === 0) {
    rooms.delete(roomCode);
    console.log('Room deleted:', roomCode);
  }
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Client URL: ${CLIENT_URL}`);
});
