import { connectToDatabase } from '../config/database.js'

// Middleware to ensure database connection
export const ensureDBConnection = async (req, res, next) => {
  try {
    await connectToDatabase()
    next()
  } catch (error) {
    console.error('Database connection failed:', error.message)
    
    // Provide more specific error responses
    let errorMessage = 'Database connection failed'
    let statusCode = 500
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      errorMessage = 'Database SSL connection error. Please check server configuration.'
      console.error('💡 SSL Error - Check MongoDB Atlas settings and network connectivity')
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Database connection timeout. Please try again.'
      statusCode = 503
    } else if (error.message.includes('authentication')) {
      errorMessage = 'Database authentication failed. Please check credentials.'
      statusCode = 401
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      timestamp: new Date().toISOString()
    })
  }
}

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled error:', err)
  
  // Mongoose/MongoDB errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }

  // Duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry found'
    })
  }

  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    })
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  })
}

// Request logging middleware
export const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
}

export default {
  ensureDBConnection,
  errorHandler,
  notFoundHandler,
  requestLogger
}
