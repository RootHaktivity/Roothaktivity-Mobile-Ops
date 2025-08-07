const express = require('express')
const router = express.Router()

// @route   GET /api/players/profile
// @desc    Get player profile
// @access  Private
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: { player: req.player }
  })
})

// @route   PUT /api/players/profile
// @desc    Update player profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const updates = req.body
    const allowedUpdates = ['profile.displayName', 'profile.bio', 'preferences']
    
    // Apply updates
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.some(allowed => key.startsWith(allowed))) {
        req.player[key] = updates[key]
      }
    })
    
    await req.player.save()
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { player: req.player }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    })
  }
})

module.exports = router