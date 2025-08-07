const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { createServer } = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

// Import routes
const authRoutes = require('./routes/auth')
const playerRoutes = require('./routes/players')
const missionRoutes = require('./routes/missions')
const gameRoutes = require('./routes/game')
const multiplayerRoutes = require('./routes/multiplayer')

// Import middleware
const auth = require('./middleware/auth')
const errorHandler = require('./middleware/errorHandler')

// Import socket handlers
const socketHandler = require('./socket/socketHandler')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
})

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roothaktivity', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error))

// Security middleware
app.use(helmet())
app.use(compression())

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/players', auth, playerRoutes)
app.use('/api/missions', auth, missionRoutes)
app.use('/api/game', auth, gameRoutes)
app.use('/api/multiplayer', auth, multiplayerRoutes)

// Socket.IO setup
io.use((socket, next) => {
  // Socket authentication middleware
  const token = socket.handshake.auth.token
  if (token) {
    // Verify JWT token here
    next()
  } else {
    next(new Error('Authentication error'))
  }
})

socketHandler(io)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
  console.log(`🚀 Roothaktivity server running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔌 Socket.IO enabled for real-time features`)
})

module.exports = { app, server, io }