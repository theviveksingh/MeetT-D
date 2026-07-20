import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: null
  },
  roomHistory: [{
    roomCode: String,
    joinedAt: { type: Date, default: Date.now },
    role: { type: String, enum: ['host', 'participant'] }
  }],
  customChallenges: [{
    text: { type: String, required: true },
    type: { type: String, enum: ['truth', 'dare'], required: true },
    category: { type: String, enum: ['funny', 'bold', 'personal', 'silly'], required: true },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
