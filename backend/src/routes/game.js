const express = require('express')
const router = express.Router()

// @route   GET /api/game/skills
// @desc    Get player skills and skill tree
// @access  Private
router.get('/skills', (req, res) => {
  res.json({
    success: true,
    data: {
      skills: req.player.skills,
      skillPoints: req.player.skillPoints,
      skillTree: {
        cryptography: { maxLevel: 100, description: 'Encryption and decryption techniques' },
        networkAnalysis: { maxLevel: 100, description: 'Network reconnaissance and analysis' },
        malwareDevelopment: { maxLevel: 100, description: 'Malware creation and analysis' },
        socialEngineering: { maxLevel: 100, description: 'Human psychology and manipulation' },
        penetrationTesting: { maxLevel: 100, description: 'System penetration and exploitation' },
        forensics: { maxLevel: 100, description: 'Digital investigation and evidence analysis' }
      }
    }
  })
})

// @route   POST /api/game/skills/upgrade
// @desc    Upgrade a skill using skill points
// @access  Private
router.post('/skills/upgrade', async (req, res) => {
  try {
    const { skill, points } = req.body
    
    if (!req.player.skills.hasOwnProperty(skill)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid skill'
      })
    }
    
    if (points <= 0 || req.player.skillPoints < points) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient skill points'
      })
    }
    
    const currentLevel = req.player.skills[skill]
    const newLevel = Math.min(100, currentLevel + points)
    const pointsUsed = newLevel - currentLevel
    
    req.player.skills[skill] = newLevel
    req.player.skillPoints -= pointsUsed
    
    await req.player.save()
    
    res.json({
      success: true,
      message: 'Skill upgraded successfully',
      data: {
        skill,
        newLevel,
        pointsUsed,
        remainingPoints: req.player.skillPoints
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error upgrading skill'
    })
  }
})

// @route   GET /api/game/leaderboard
// @desc    Get game leaderboard
// @access  Private
router.get('/leaderboard', async (req, res) => {
  try {
    const Player = require('../models/Player')
    
    const topPlayers = await Player.find({ isActive: true })
      .select('username profile.displayName profile.level profile.reputation gameStats.missionsCompleted')
      .sort({ 'profile.reputation': -1, 'profile.level': -1 })
      .limit(50)
    
    res.json({
      success: true,
      data: { leaderboard: topPlayers }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard'
    })
  }
})

module.exports = router