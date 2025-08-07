const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const skillSchema = new mongoose.Schema({
  cryptography: { type: Number, default: 0, min: 0, max: 100 },
  networkAnalysis: { type: Number, default: 0, min: 0, max: 100 },
  malwareDevelopment: { type: Number, default: 0, min: 0, max: 100 },
  socialEngineering: { type: Number, default: 0, min: 0, max: 100 },
  penetrationTesting: { type: Number, default: 0, min: 0, max: 100 },
  forensics: { type: Number, default: 0, min: 0, max: 100 }
}, { _id: false })

const achievementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
  category: { 
    type: String, 
    enum: ['mission', 'skill', 'multiplayer', 'special'], 
    required: true 
  }
}, { _id: false })

const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  profile: {
    displayName: { type: String, trim: true, maxlength: 50 },
    avatar: { type: String, default: 'default_hacker.png' },
    bio: { type: String, maxlength: 200 },
    level: { type: Number, default: 1, min: 1, max: 100 },
    experience: { type: Number, default: 0, min: 0 },
    reputation: { type: Number, default: 0 },
    rank: { 
      type: String, 
      enum: ['Novice', 'Script Kiddie', 'Hacker', 'Elite Hacker', 'Cyber Warrior', 'Digital Ghost'],
      default: 'Novice'
    }
  },
  skills: {
    type: skillSchema,
    default: () => ({})
  },
  skillPoints: { type: Number, default: 0, min: 0 },
  gameStats: {
    missionsCompleted: { type: Number, default: 0 },
    missionsFailed: { type: Number, default: 0 },
    totalPlayTime: { type: Number, default: 0 }, // in minutes
    highestDifficulty: { type: Number, default: 1, min: 1, max: 10 },
    streakBest: { type: Number, default: 0 },
    streakCurrent: { type: Number, default: 0 },
    multiplayerWins: { type: Number, default: 0 },
    multiplayerLosses: { type: Number, default: 0 }
  },
  achievements: [achievementSchema],
  inventory: {
    tools: [{
      id: String,
      name: String,
      type: { type: String, enum: ['scanner', 'exploit', 'defense', 'stealth'] },
      level: { type: Number, default: 1 },
      unlocked: { type: Boolean, default: false }
    }],
    currency: { type: Number, default: 1000 } // In-game currency
  },
  preferences: {
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], default: 'easy' },
    notifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true }
  },
  security: {
    lastLogin: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    refreshTokens: [{ 
      token: String, 
      createdAt: { type: Date, default: Date.now } 
    }]
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true,
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password
      delete ret.security.refreshTokens
      delete ret.verificationToken
      delete ret.resetPasswordToken
      delete ret.resetPasswordExpires
      return ret
    }
  }
})

// Indexes
playerSchema.index({ username: 1 })
playerSchema.index({ email: 1 })
playerSchema.index({ 'profile.level': -1 })
playerSchema.index({ 'profile.reputation': -1 })
playerSchema.index({ createdAt: -1 })

// Virtual for account lock
playerSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now())
})

// Pre-save middleware to hash password
playerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
playerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Method to handle login attempts
playerSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock and it's expired, restart at 1
  if (this.security.lockUntil && this.security.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.lockUntil': 1 },
      $set: { 'security.loginAttempts': 1 }
    })
  }
  
  const updates = { $inc: { 'security.loginAttempts': 1 } }
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.security.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { 'security.lockUntil': Date.now() + 2 * 60 * 60 * 1000 }
  }
  
  return this.updateOne(updates)
}

// Method to calculate level from experience
playerSchema.methods.calculateLevel = function() {
  return Math.floor(Math.sqrt(this.profile.experience / 100)) + 1
}

// Method to add achievement
playerSchema.methods.addAchievement = function(achievementData) {
  const existingAchievement = this.achievements.find(a => a.id === achievementData.id)
  if (!existingAchievement) {
    this.achievements.push(achievementData)
    return true
  }
  return false
}

// Static method to find by username or email
playerSchema.statics.findByLogin = function(login) {
  return this.findOne({
    $or: [
      { username: login },
      { email: login }
    ]
  })
}

module.exports = mongoose.model('Player', playerSchema)