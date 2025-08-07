const express = require('express')
const Joi = require('joi')
const Mission = require('../models/Mission')
const Player = require('../models/Player')
const MissionGenerator = require('../utils/missionGenerator')

const router = express.Router()

// Validation schemas
const missionFilterSchema = Joi.object({
  difficulty: Joi.number().min(1).max(10).optional(),
  category: Joi.string().valid('tutorial', 'web_security', 'network_penetration', 'social_engineering', 'malware_analysis', 'forensics', 'mixed').optional(),
  type: Joi.string().valid('single_player', 'cooperative', 'competitive').optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(20)
})

// @route   GET /api/missions
// @desc    Get available missions for player
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { error, value } = missionFilterSchema.validate(req.query)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      })
    }

    const { difficulty, category, type, page, limit } = value
    const skip = (page - 1) * limit

    // Build query
    const query = { status: 'active' }
    if (difficulty) query.difficulty = difficulty
    if (category) query.category = category
    if (type) query.type = type

    // Don't show missions too difficult for player
    query['prerequisites.level'] = { $lte: req.player.profile.level + 2 }

    const missions = await Mission.find(query)
      .select('-steps.solution -arPuzzles.solution') // Hide solutions
      .populate('metadata.creator', 'username profile.displayName')
      .sort({ 'metadata.featured': -1, 'metadata.rating': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Mission.countDocuments(query)

    // Check availability for each mission
    const availableMissions = missions.map(mission => {
      const availability = mission.isAvailableFor(req.player)
      return {
        ...mission.toObject(),
        availability
      }
    })

    res.json({
      success: true,
      data: {
        missions: availableMissions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('Get missions error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching missions'
    })
  }
})

// @route   GET /api/missions/generate
// @desc    Generate a new mission for player
// @access  Private
router.get('/generate', async (req, res) => {
  try {
    const { difficulty, category } = req.query

    // Determine difficulty if not specified
    const targetDifficulty = difficulty ? parseInt(difficulty) : 
      Math.min(req.player.profile.level, 10)

    // Determine category if not specified
    const categories = ['web_security', 'network_penetration', 'social_engineering', 'malware_analysis', 'forensics']
    const targetCategory = category || categories[Math.floor(Math.random() * categories.length)]

    // Generate mission using AI/procedural generation
    const generatedMission = await MissionGenerator.generate({
      difficulty: targetDifficulty,
      category: targetCategory,
      playerLevel: req.player.profile.level,
      playerSkills: req.player.skills,
      preferences: req.player.preferences
    })

    // Create mission in database
    const mission = new Mission({
      ...generatedMission,
      generation: {
        isGenerated: true,
        generationSeed: Date.now().toString(),
        generatedAt: new Date()
      },
      metadata: {
        creator: req.player._id
      }
    })

    await mission.save()

    res.json({
      success: true,
      data: {
        mission: {
          ...mission.toObject(),
          availability: mission.isAvailableFor(req.player)
        }
      }
    })

  } catch (error) {
    console.error('Generate mission error:', error)
    res.status(500).json({
      success: false,
      message: 'Error generating mission'
    })
  }
})

// @route   GET /api/missions/:id
// @desc    Get specific mission details
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
      .populate('metadata.creator', 'username profile.displayName')

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      })
    }

    // Check if player can access this mission
    const availability = mission.isAvailableFor(req.player)
    if (!availability.available) {
      return res.status(403).json({
        success: false,
        message: availability.reason
      })
    }

    // Hide solutions unless player has completed the mission
    const missionData = mission.toObject()
    if (!req.player.gameStats.completedMissions?.includes(mission._id.toString())) {
      missionData.steps = missionData.steps.map(step => {
        const { solution, ...stepWithoutSolution } = step
        return stepWithoutSolution
      })
      missionData.arPuzzles = missionData.arPuzzles.map(puzzle => {
        const { solution, ...puzzleWithoutSolution } = puzzle
        return puzzleWithoutSolution
      })
    }

    res.json({
      success: true,
      data: {
        mission: {
          ...missionData,
          availability
        }
      }
    })

  } catch (error) {
    console.error('Get mission error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching mission'
    })
  }
})

// @route   POST /api/missions/:id/start
// @desc    Start a mission
// @access  Private
router.post('/:id/start', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
    
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      })
    }

    // Check availability
    const availability = mission.isAvailableFor(req.player)
    if (!availability.available) {
      return res.status(403).json({
        success: false,
        message: availability.reason
      })
    }

    // Check if player already has too many active missions
    const activeMissions = await Mission.countDocuments({
      'metadata.creator': req.player._id,
      status: 'active'
    })

    if (activeMissions >= (process.env.MAX_MISSIONS_PER_PLAYER || 5)) {
      return res.status(400).json({
        success: false,
        message: 'Too many active missions. Complete some first.'
      })
    }

    // Initialize mission steps
    mission.steps.forEach(step => {
      step.startedAt = new Date()
      step.completed = false
      step.attempts = 0
    })

    // Update player count for multiplayer missions
    if (mission.type !== 'single_player') {
      mission.availability.currentPlayers += 1
    }

    await mission.save()

    // Update player stats
    req.player.gameStats.currentMission = mission._id
    await req.player.save()

    res.json({
      success: true,
      message: 'Mission started successfully',
      data: {
        mission: {
          id: mission._id,
          title: mission.title,
          startedAt: new Date(),
          estimatedDuration: mission.estimatedDuration,
          steps: mission.steps.map(step => ({
            stepId: step.stepId,
            type: step.type,
            description: step.description,
            difficulty: step.difficulty,
            tools: step.tools,
            hints: step.hints,
            completed: step.completed
          }))
        }
      }
    })

  } catch (error) {
    console.error('Start mission error:', error)
    res.status(500).json({
      success: false,
      message: 'Error starting mission'
    })
  }
})

// @route   POST /api/missions/:id/submit
// @desc    Submit mission solution/step
// @access  Private
router.post('/:id/submit', async (req, res) => {
  try {
    const { stepId, solution, timeSpent } = req.body

    const mission = await Mission.findById(req.params.id)
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      })
    }

    const step = mission.steps.find(s => s.stepId === stepId)
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found'
      })
    }

    if (step.completed) {
      return res.status(400).json({
        success: false,
        message: 'Step already completed'
      })
    }

    // Increment attempts
    step.attempts += 1

    // Check solution
    const isCorrect = MissionGenerator.validateSolution(step, solution)
    
    if (isCorrect) {
      step.completed = true
      step.completedAt = new Date()

      // Calculate rewards
      const stepReward = {
        experience: Math.floor(step.difficulty * 10),
        skillPoints: Math.floor(step.difficulty * 2),
        currency: Math.floor(step.difficulty * 5)
      }

      // Update player progress
      req.player.profile.experience += stepReward.experience
      req.player.skillPoints += stepReward.skillPoints
      req.player.inventory.currency += stepReward.currency

      // Update relevant skill based on step type
      const skillMap = {
        'port_scan': 'networkAnalysis',
        'vulnerability_scan': 'penetrationTesting',
        'exploit': 'malwareDevelopment',
        'privilege_escalation': 'penetrationTesting',
        'data_extraction': 'forensics',
        'stealth_mode': 'socialEngineering'
      }

      const relevantSkill = skillMap[step.type]
      if (relevantSkill && req.player.skills[relevantSkill] < 100) {
        req.player.skills[relevantSkill] = Math.min(
          req.player.skills[relevantSkill] + Math.floor(step.difficulty * 0.5),
          100
        )
      }

      await mission.save()
      await req.player.save()

      // Check if mission is complete
      const allStepsCompleted = mission.steps.every(s => s.completed)
      if (allStepsCompleted) {
        // Mission completed logic
        mission.status = 'completed'
        
        // Calculate final score and rewards
        const completionTime = timeSpent || mission.estimatedDuration * 60
        const hintsUsed = mission.steps.reduce((sum, s) => sum + (s.hintsUsed || 0), 0)
        const totalAttempts = mission.steps.reduce((sum, s) => sum + s.attempts, 0)
        
        const score = mission.calculateScore(completionTime, hintsUsed, totalAttempts)
        
        // Final rewards
        req.player.profile.experience += mission.rewards.experience
        req.player.skillPoints += mission.rewards.skillPoints
        req.player.inventory.currency += mission.rewards.currency
        req.player.gameStats.missionsCompleted += 1
        req.player.gameStats.streakCurrent += 1
        req.player.gameStats.streakBest = Math.max(
          req.player.gameStats.streakBest, 
          req.player.gameStats.streakCurrent
        )

        // Update level
        const newLevel = req.player.calculateLevel()
        if (newLevel > req.player.profile.level) {
          req.player.profile.level = newLevel
          // Level up rewards
          req.player.skillPoints += 5
        }

        await mission.save()
        await req.player.save()

        return res.json({
          success: true,
          message: 'Mission completed!',
          data: {
            stepComplete: true,
            missionComplete: true,
            score,
            rewards: {
              experience: stepReward.experience + mission.rewards.experience,
              skillPoints: stepReward.skillPoints + mission.rewards.skillPoints,
              currency: stepReward.currency + mission.rewards.currency
            },
            newLevel: newLevel > req.player.profile.level - 1
          }
        })
      }

      res.json({
        success: true,
        message: 'Step completed successfully!',
        data: {
          stepComplete: true,
          missionComplete: false,
          rewards: stepReward,
          nextStep: mission.steps.find(s => !s.completed)?.stepId
        }
      })

    } else {
      // Wrong solution
      const maxAttempts = mission.settings.maxAttempts || 3
      
      if (step.attempts >= maxAttempts) {
        // Mission failed
        mission.status = 'completed'
        req.player.gameStats.missionsFailed += 1
        req.player.gameStats.streakCurrent = 0
        
        await mission.save()
        await req.player.save()

        return res.json({
          success: false,
          message: 'Mission failed - maximum attempts exceeded',
          data: {
            missionFailed: true,
            attemptsRemaining: 0
          }
        })
      }

      await mission.save()

      res.status(400).json({
        success: false,
        message: 'Incorrect solution',
        data: {
          attemptsRemaining: maxAttempts - step.attempts,
          hint: step.hints && step.hints.length > step.attempts - 1 ? 
            step.hints[step.attempts - 1] : null
        }
      })
    }

  } catch (error) {
    console.error('Submit mission error:', error)
    res.status(500).json({
      success: false,
      message: 'Error submitting solution'
    })
  }
})

// @route   GET /api/missions/:id/hint
// @desc    Get hint for current step
// @access  Private
router.get('/:id/hint/:stepId', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id)
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Mission not found'
      })
    }

    if (!mission.settings.allowHints) {
      return res.status(403).json({
        success: false,
        message: 'Hints are not allowed for this mission'
      })
    }

    const step = mission.steps.find(s => s.stepId === req.params.stepId)
    if (!step) {
      return res.status(404).json({
        success: false,
        message: 'Step not found'
      })
    }

    if (step.completed) {
      return res.status(400).json({
        success: false,
        message: 'Step already completed'
      })
    }

    const hintsUsed = step.hintsUsed || 0
    if (hintsUsed >= step.hints.length) {
      return res.status(400).json({
        success: false,
        message: 'No more hints available'
      })
    }

    // Increment hints used
    step.hintsUsed = hintsUsed + 1
    await mission.save()

    res.json({
      success: true,
      data: {
        hint: step.hints[hintsUsed],
        hintsRemaining: step.hints.length - step.hintsUsed
      }
    })

  } catch (error) {
    console.error('Get hint error:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting hint'
    })
  }
})

module.exports = router