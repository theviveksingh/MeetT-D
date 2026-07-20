import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cohostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    socketId: String,
    displayName: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  settings: {
    maxParticipants: { type: Number, default: 10 },
    timerDuration: { type: Number, default: 30 },
    categories: [{
      type: String,
      enum: ['funny', 'bold', 'personal', 'silly', 'mixed']
    }],
    isPrivate: { type: Boolean, default: false }
  },
  gameState: {
    isActive: { type: Boolean, default: false },
    currentPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    currentChallenge: {
      text: String,
      type: String,
      category: String
    },
    usedChallenges: [String],
    skipVotes: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    skipCount: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

roomSchema.index({ roomCode: 1 });
roomSchema.index({ hostId: 1 });
roomSchema.index({ 'participants.userId': 1 });

const Room = mongoose.model('Room', roomSchema);

export default Room;
