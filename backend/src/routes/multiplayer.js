const express = require('express')
const router = express.Router()

// @route   GET /api/multiplayer/rooms
// @desc    Get available multiplayer rooms
// @access  Private
router.get('/rooms', async (req, res) => {
  try {
    const Mission = require('../models/Mission')
    
    const multiplayerMissions = await Mission.find({
      type: { $in: ['cooperative', 'competitive'] },
      status: 'active',
      'availability.currentPlayers': { $lt: '$availability.maxPlayers' }
    })
    .select('title description difficulty type availability metadata')
    .populate('metadata.creator', 'username profile.displayName')
    
    res.json({
      success: true,
      data: { rooms: multiplayerMissions }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching multiplayer rooms'
    })
  }
})

// @route   POST /api/multiplayer/rooms/:id/join
// @desc    Join a multiplayer room
// @access  Private
router.post('/rooms/:id/join', async (req, res) => {
  try {
    const Mission = require('../models/Mission')
    
    const mission = await Mission.findById(req.params.id)
    if (!mission) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      })
    }
    
    if (mission.availability.currentPlayers >= mission.availability.maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Room is full'
      })
    }
    
    // Add player to room (this would integrate with Socket.IO)
    mission.availability.currentPlayers += 1
    await mission.save()
    
    res.json({
      success: true,
      message: 'Joined room successfully',
      data: {
        roomId: mission._id,
        currentPlayers: mission.availability.currentPlayers,
        maxPlayers: mission.availability.maxPlayers
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error joining room'
    })
  }
})

module.exports = router