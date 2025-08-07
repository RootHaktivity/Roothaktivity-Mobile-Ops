const jwt = require('jsonwebtoken')
const Player = require('../models/Player')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const player = await Player.findById(decoded.id).select('-password')
    
    if (!player) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Player not found.'
      })
    }

    if (!player.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      })
    }

    if (player.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to failed login attempts.'
      })
    }

    req.player = player
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    })
  }
}

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const player = await Player.findById(decoded.id).select('-password')
      
      if (player && player.isActive && !player.isLocked) {
        req.player = player
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication
    next()
  }
}

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (!req.player || req.player.profile.rank !== 'Digital Ghost') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.'
    })
  }
  next()
}

module.exports = { auth, optionalAuth, requireAdmin }