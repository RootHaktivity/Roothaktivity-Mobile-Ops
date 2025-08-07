const jwt = require('jsonwebtoken')
const Player = require('../models/Player')

// Store active connections
const activeConnections = new Map()
const gameRooms = new Map()

function socketHandler(io) {
  io.on('connection', async (socket) => {
    console.log('New socket connection:', socket.id)
    
    try {
      // Authenticate socket connection
      const token = socket.handshake.auth.token
      if (!token) {
        socket.emit('error', { message: 'Authentication required' })
        socket.disconnect()
        return
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const player = await Player.findById(decoded.id).select('-password')
      
      if (!player) {
        socket.emit('error', { message: 'Player not found' })
        socket.disconnect()
        return
      }
      
      // Store player connection
      socket.playerId = player._id.toString()
      socket.playerData = player
      activeConnections.set(socket.playerId, socket)
      
      console.log(`Player ${player.username} connected via socket`)
      
      // Send connection confirmation
      socket.emit('connected', {
        message: 'Connected successfully',
        player: {
          id: player._id,
          username: player.username,
          profile: player.profile
        }
      })
      
      // Handle joining game rooms
      socket.on('join_room', (data) => {
        handleJoinRoom(socket, data)
      })
      
      // Handle leaving game rooms
      socket.on('leave_room', (data) => {
        handleLeaveRoom(socket, data)
      })
      
      // Handle mission progress updates
      socket.on('mission_progress', (data) => {
        handleMissionProgress(socket, data)
      })
      
      // Handle chat messages in multiplayer
      socket.on('chat_message', (data) => {
        handleChatMessage(socket, data)
      })
      
      // Handle real-time collaboration
      socket.on('collaboration_action', (data) => {
        handleCollaborationAction(socket, data)
      })
      
      // Handle AR session sharing
      socket.on('ar_session', (data) => {
        handleARSession(socket, data)
      })
      
      // Handle disconnect
      socket.on('disconnect', () => {
        handleDisconnect(socket)
      })
      
    } catch (error) {
      console.error('Socket authentication error:', error)
      socket.emit('error', { message: 'Authentication failed' })
      socket.disconnect()
    }
  })
}

function handleJoinRoom(socket, data) {
  const { roomId, roomType } = data
  
  if (!roomId) {
    socket.emit('error', { message: 'Room ID required' })
    return
  }
  
  // Leave current room if in one
  if (socket.currentRoom) {
    socket.leave(socket.currentRoom)
    removeFromGameRoom(socket.currentRoom, socket.playerId)
  }
  
  // Join new room
  socket.join(roomId)
  socket.currentRoom = roomId
  
  // Add to game room tracking
  if (!gameRooms.has(roomId)) {
    gameRooms.set(roomId, {
      id: roomId,
      type: roomType || 'mission',
      players: new Map(),
      created: Date.now()
    })
  }
  
  const room = gameRooms.get(roomId)
  room.players.set(socket.playerId, {
    id: socket.playerId,
    username: socket.playerData.username,
    profile: socket.playerData.profile,
    socket: socket,
    joinedAt: Date.now()
  })
  
  // Notify room members
  socket.to(roomId).emit('player_joined', {
    player: {
      id: socket.playerId,
      username: socket.playerData.username,
      profile: socket.playerData.profile
    },
    totalPlayers: room.players.size
  })
  
  // Send room state to new player
  socket.emit('room_joined', {
    roomId,
    players: Array.from(room.players.values()).map(p => ({
      id: p.id,
      username: p.username,
      profile: p.profile,
      joinedAt: p.joinedAt
    })),
    totalPlayers: room.players.size
  })
  
  console.log(`Player ${socket.playerData.username} joined room ${roomId}`)
}

function handleLeaveRoom(socket, data) {
  if (!socket.currentRoom) return
  
  const roomId = socket.currentRoom
  socket.leave(roomId)
  
  // Remove from game room tracking
  removeFromGameRoom(roomId, socket.playerId)
  
  // Notify remaining room members
  socket.to(roomId).emit('player_left', {
    playerId: socket.playerId,
    username: socket.playerData.username
  })
  
  socket.currentRoom = null
  socket.emit('room_left', { roomId })
  
  console.log(`Player ${socket.playerData.username} left room ${roomId}`)
}

function handleMissionProgress(socket, data) {
  if (!socket.currentRoom) return
  
  const { stepId, progress, action } = data
  
  // Broadcast progress to room members
  socket.to(socket.currentRoom).emit('mission_progress_update', {
    playerId: socket.playerId,
    username: socket.playerData.username,
    stepId,
    progress,
    action,
    timestamp: Date.now()
  })
  
  // Handle specific mission actions
  switch (action) {
    case 'step_completed':
      socket.to(socket.currentRoom).emit('step_completed', {
        playerId: socket.playerId,
        stepId,
        completedBy: socket.playerData.username
      })
      break
      
    case 'hint_used':
      socket.to(socket.currentRoom).emit('hint_used', {
        playerId: socket.playerId,
        stepId,
        hintsUsed: data.hintsUsed
      })
      break
      
    case 'tool_used':
      socket.to(socket.currentRoom).emit('tool_used', {
        playerId: socket.playerId,
        tool: data.tool,
        target: data.target
      })
      break
  }
}

function handleChatMessage(socket, data) {
  if (!socket.currentRoom) return
  
  const { message, type = 'text' } = data
  
  if (!message || message.trim().length === 0) return
  
  const chatMessage = {
    id: Date.now().toString(),
    playerId: socket.playerId,
    username: socket.playerData.username,
    message: message.trim(),
    type,
    timestamp: Date.now()
  }
  
  // Broadcast to room members
  io.to(socket.currentRoom).emit('chat_message', chatMessage)
}

function handleCollaborationAction(socket, data) {
  if (!socket.currentRoom) return
  
  const { action, target, params } = data
  
  // Handle different collaboration actions
  switch (action) {
    case 'share_screen':
      socket.to(socket.currentRoom).emit('screen_shared', {
        playerId: socket.playerId,
        username: socket.playerData.username,
        screenData: params.screenData
      })
      break
      
    case 'cursor_position':
      socket.to(socket.currentRoom).emit('cursor_update', {
        playerId: socket.playerId,
        position: params.position
      })
      break
      
    case 'highlight_element':
      socket.to(socket.currentRoom).emit('element_highlighted', {
        playerId: socket.playerId,
        element: target,
        duration: params.duration || 3000
      })
      break
      
    case 'share_tool_output':
      socket.to(socket.currentRoom).emit('tool_output_shared', {
        playerId: socket.playerId,
        tool: params.tool,
        output: params.output,
        timestamp: Date.now()
      })
      break
  }
}

function handleARSession(socket, data) {
  if (!socket.currentRoom) return
  
  const { sessionData, arAction, coordinates } = data
  
  // Handle AR-specific actions
  switch (arAction) {
    case 'share_ar_view':
      socket.to(socket.currentRoom).emit('ar_view_shared', {
        playerId: socket.playerId,
        sessionData,
        timestamp: Date.now()
      })
      break
      
    case 'place_ar_marker':
      socket.to(socket.currentRoom).emit('ar_marker_placed', {
        playerId: socket.playerId,
        coordinates,
        markerData: data.markerData
      })
      break
      
    case 'ar_object_found':
      socket.to(socket.currentRoom).emit('ar_object_found', {
        playerId: socket.playerId,
        objectType: data.objectType,
        coordinates,
        confidence: data.confidence
      })
      break
  }
}

function handleDisconnect(socket) {
  console.log(`Player ${socket.playerData?.username || 'Unknown'} disconnected`)
  
  // Leave current room
  if (socket.currentRoom) {
    removeFromGameRoom(socket.currentRoom, socket.playerId)
    socket.to(socket.currentRoom).emit('player_left', {
      playerId: socket.playerId,
      username: socket.playerData?.username
    })
  }
  
  // Remove from active connections
  if (socket.playerId) {
    activeConnections.delete(socket.playerId)
  }
}

function removeFromGameRoom(roomId, playerId) {
  const room = gameRooms.get(roomId)
  if (room) {
    room.players.delete(playerId)
    
    // Clean up empty rooms
    if (room.players.size === 0) {
      gameRooms.delete(roomId)
      console.log(`Room ${roomId} cleaned up - no players remaining`)
    }
  }
}

// Utility functions for external use
function sendToPlayer(playerId, event, data) {
  const connection = activeConnections.get(playerId)
  if (connection) {
    connection.emit(event, data)
    return true
  }
  return false
}

function sendToRoom(roomId, event, data) {
  const room = gameRooms.get(roomId)
  if (room) {
    room.players.forEach(player => {
      player.socket.emit(event, data)
    })
    return room.players.size
  }
  return 0
}

function getRoomPlayers(roomId) {
  const room = gameRooms.get(roomId)
  return room ? Array.from(room.players.values()) : []
}

module.exports = {
  socketHandler,
  sendToPlayer,
  sendToRoom,
  getRoomPlayers,
  getActiveConnections: () => activeConnections.size,
  getActiveRooms: () => gameRooms.size
}