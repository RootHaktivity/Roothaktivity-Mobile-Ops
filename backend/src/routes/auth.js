const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const Joi = require('joi')
const Player = require('../models/Player')
const { auth } = require('../middleware/auth')

const router = express.Router()

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    }),
  displayName: Joi.string().min(1).max(50).optional()
})

const loginSchema = Joi.object({
  login: Joi.string().required(), // username or email
  password: Joi.string().required()
})

// Helper function to generate JWT
const generateTokens = (playerId) => {
  const accessToken = jwt.sign(
    { id: playerId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
  
  const refreshToken = jwt.sign(
    { id: playerId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  )
  
  return { accessToken, refreshToken }
}

// @route   POST /api/auth/register
// @desc    Register a new player
// @access  Public
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      })
    }

    const { username, email, password, displayName } = value

    // Check if player already exists
    const existingPlayer = await Player.findOne({
      $or: [{ email }, { username }]
    })

    if (existingPlayer) {
      const field = existingPlayer.email === email ? 'email' : 'username'
      return res.status(400).json({
        success: false,
        message: `Player with this ${field} already exists`
      })
    }

    // Create new player
    const player = new Player({
      username,
      email,
      password,
      profile: {
        displayName: displayName || username
      },
      verificationToken: uuidv4()
    })

    await player.save()

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(player._id)

    // Save refresh token
    player.security.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    })
    await player.save()

    res.status(201).json({
      success: true,
      message: 'Player registered successfully',
      data: {
        player: {
          id: player._id,
          username: player.username,
          email: player.email,
          profile: player.profile,
          isVerified: player.isVerified
        },
        accessToken,
        refreshToken
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating player account'
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login player
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      })
    }

    const { login, password } = value

    // Find player by username or email
    const player = await Player.findByLogin(login)
    if (!player) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if account is locked
    if (player.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to failed login attempts'
      })
    }

    // Check if account is active
    if (!player.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // Check password
    const isMatch = await player.comparePassword(password)
    if (!isMatch) {
      await player.incLoginAttempts()
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Reset login attempts on successful login
    if (player.security.loginAttempts > 0) {
      await player.updateOne({
        $unset: { 'security.lockUntil': 1, 'security.loginAttempts': 1 }
      })
    }

    // Update last login
    player.security.lastLogin = new Date()

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(player._id)

    // Clean old refresh tokens (keep only last 5)
    if (player.security.refreshTokens.length >= 5) {
      player.security.refreshTokens = player.security.refreshTokens
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 4)
    }

    // Add new refresh token
    player.security.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date()
    })

    await player.save()

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        player: {
          id: player._id,
          username: player.username,
          email: player.email,
          profile: player.profile,
          skills: player.skills,
          gameStats: player.gameStats,
          isVerified: player.isVerified
        },
        accessToken,
        refreshToken
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Error during login'
    })
  }
})

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      })
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      })
    }

    // Find player and check if refresh token exists
    const player = await Player.findById(decoded.id)
    if (!player || !player.security.refreshTokens.some(rt => rt.token === refreshToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: player._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    res.json({
      success: true,
      data: { accessToken }
    })

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      })
    }

    console.error('Token refresh error:', error)
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout player (invalidate refresh token)
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (refreshToken) {
      // Remove specific refresh token
      await Player.findByIdAndUpdate(req.player._id, {
        $pull: { 'security.refreshTokens': { token: refreshToken } }
      })
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    })
  }
})

// @route   POST /api/auth/logout-all
// @desc    Logout from all devices
// @access  Private
router.post('/logout-all', auth, async (req, res) => {
  try {
    await Player.findByIdAndUpdate(req.player._id, {
      $set: { 'security.refreshTokens': [] }
    })

    res.json({
      success: true,
      message: 'Logged out from all devices successfully'
    })

  } catch (error) {
    console.error('Logout all error:', error)
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current player info
// @access  Private
router.get('/me', auth, (req, res) => {
  res.json({
    success: true,
    data: {
      player: req.player
    }
  })
})

module.exports = router