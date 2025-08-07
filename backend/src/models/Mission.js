const mongoose = require('mongoose')

const hackingStepSchema = new mongoose.Schema({
  stepId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['port_scan', 'vulnerability_scan', 'exploit', 'privilege_escalation', 'data_extraction', 'stealth_mode'],
    required: true 
  },
  description: { type: String, required: true },
  tools: [{ 
    name: String, 
    required: Boolean,
    alternatives: [String]
  }],
  difficulty: { type: Number, min: 1, max: 10, required: true },
  timeLimit: { type: Number }, // in seconds
  hints: [String],
  solution: {
    commands: [String],
    parameters: mongoose.Schema.Types.Mixed,
    expectedOutput: String
  },
  completed: { type: Boolean, default: false },
  startedAt: { type: Date },
  completedAt: { type: Date },
  attempts: { type: Number, default: 0 }
}, { _id: false })

const targetSystemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['web_server', 'database', 'network_device', 'workstation', 'mobile_device'],
    required: true 
  },
  ip: { type: String, required: true },
  ports: [{
    number: Number,
    service: String,
    version: String,
    state: { type: String, enum: ['open', 'closed', 'filtered'], default: 'open' }
  }],
  vulnerabilities: [{
    id: String,
    name: String,
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    description: String,
    exploitable: { type: Boolean, default: true }
  }],
  credentials: [{
    username: String,
    password: String,
    privilege: String
  }],
  defenses: [{
    type: String,
    level: Number,
    active: { type: Boolean, default: true }
  }]
}, { _id: false })

const arPuzzleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['qr_scan', 'object_recognition', 'pattern_matching', 'location_based'],
    required: true 
  },
  description: { type: String, required: true },
  triggerConditions: {
    location: { type: String },
    objects: [String],
    patterns: [String]
  },
  solution: {
    expectedInput: String,
    validAnswers: [String],
    tolerance: Number
  },
  rewards: {
    experience: Number,
    skillPoints: Number,
    tools: [String]
  },
  completed: { type: Boolean, default: false }
}, { _id: false })

const missionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  storyline: {
    background: { type: String, required: true },
    objective: { type: String, required: true },
    briefing: { type: String, required: true },
    debriefing: { type: String }
  },
  difficulty: { type: Number, min: 1, max: 10, required: true },
  category: { 
    type: String, 
    enum: ['tutorial', 'web_security', 'network_penetration', 'social_engineering', 'malware_analysis', 'forensics', 'mixed'],
    required: true 
  },
  type: {
    type: String,
    enum: ['single_player', 'cooperative', 'competitive'],
    default: 'single_player'
  },
  estimatedDuration: { type: Number, required: true }, // in minutes
  prerequisites: {
    level: { type: Number, default: 1 },
    skills: [{
      skill: String,
      minLevel: Number
    }],
    completedMissions: [String]
  },
  targets: [targetSystemSchema],
  steps: [hackingStepSchema],
  arPuzzles: [arPuzzleSchema],
  rewards: {
    experience: { type: Number, default: 0 },
    skillPoints: { type: Number, default: 0 },
    currency: { type: Number, default: 0 },
    tools: [String],
    achievements: [String]
  },
  penalties: {
    experienceLoss: { type: Number, default: 0 },
    timeoutDuration: { type: Number, default: 0 } // in seconds
  },
  settings: {
    allowHints: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 3 },
    timeLimit: { type: Number }, // total mission time limit in seconds
    dynamicDifficulty: { type: Boolean, default: true },
    recordSession: { type: Boolean, default: true }
  },
  generation: {
    isGenerated: { type: Boolean, default: false },
    generationSeed: { type: String },
    template: { type: String },
    parameters: mongoose.Schema.Types.Mixed,
    generatedAt: { type: Date }
  },
  availability: {
    startDate: { type: Date },
    endDate: { type: Date },
    maxPlayers: { type: Number },
    currentPlayers: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'active'
  },
  metadata: {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    tags: [String],
    featured: { type: Boolean, default: false },
    rating: { type: Number, min: 1, max: 5 },
    playCount: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  }
}, {
  timestamps: true
})

// Indexes
missionSchema.index({ difficulty: 1 })
missionSchema.index({ category: 1 })
missionSchema.index({ type: 1 })
missionSchema.index({ 'metadata.featured': -1 })
missionSchema.index({ 'metadata.rating': -1 })
missionSchema.index({ 'metadata.playCount': -1 })
missionSchema.index({ createdAt: -1 })
missionSchema.index({ 'availability.startDate': 1, 'availability.endDate': 1 })

// Virtual for completion percentage
missionSchema.virtual('completionPercentage').get(function() {
  if (!this.steps.length) return 0
  const completedSteps = this.steps.filter(step => step.completed).length
  return Math.round((completedSteps / this.steps.length) * 100)
})

// Method to check if mission is available for player
missionSchema.methods.isAvailableFor = function(player) {
  // Check level requirement
  if (player.profile.level < this.prerequisites.level) {
    return { available: false, reason: 'Insufficient level' }
  }
  
  // Check skill requirements
  for (const skillReq of this.prerequisites.skills) {
    if (player.skills[skillReq.skill] < skillReq.minLevel) {
      return { available: false, reason: `Insufficient ${skillReq.skill} skill` }
    }
  }
  
  // Check date availability
  const now = new Date()
  if (this.availability.startDate && now < this.availability.startDate) {
    return { available: false, reason: 'Mission not yet available' }
  }
  if (this.availability.endDate && now > this.availability.endDate) {
    return { available: false, reason: 'Mission has expired' }
  }
  
  // Check player capacity
  if (this.availability.maxPlayers && this.availability.currentPlayers >= this.availability.maxPlayers) {
    return { available: false, reason: 'Mission is full' }
  }
  
  return { available: true }
}

// Method to calculate mission score
missionSchema.methods.calculateScore = function(completionTime, hintsUsed, attempts) {
  let baseScore = 1000
  
  // Time bonus/penalty
  const timeRatio = completionTime / (this.estimatedDuration * 60)
  if (timeRatio < 0.8) {
    baseScore += 200 // Fast completion bonus
  } else if (timeRatio > 1.5) {
    baseScore -= 100 // Slow completion penalty
  }
  
  // Hints penalty
  baseScore -= hintsUsed * 50
  
  // Attempts penalty
  baseScore -= (attempts - 1) * 25
  
  // Difficulty multiplier
  baseScore *= (1 + (this.difficulty - 1) * 0.1)
  
  return Math.max(0, Math.round(baseScore))
}

// Static method to find missions for player
missionSchema.statics.findForPlayer = function(player, options = {}) {
  const query = { status: 'active' }
  
  // Filter by difficulty if specified
  if (options.difficulty) {
    query.difficulty = options.difficulty
  }
  
  // Filter by category if specified
  if (options.category) {
    query.category = options.category
  }
  
  // Filter by player level (don't show missions too difficult)
  if (!options.showAll) {
    query['prerequisites.level'] = { $lte: player.profile.level + 2 }
  }
  
  return this.find(query)
    .sort(options.sort || { 'metadata.featured': -1, 'metadata.rating': -1 })
    .limit(options.limit || 20)
}

module.exports = mongoose.model('Mission', missionSchema)