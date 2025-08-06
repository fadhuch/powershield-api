const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./src/config/database.js');
const apiRoutes = require('./src/routes/index.js');
const { errorHandler, notFoundHandler, requestLogger } = require('./src/middleware/index.js');

console.log('🔗 Initializing server...')

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(requestLogger)
app.use(cors({
  origin: '*',  // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))

// API Routes
app.use('/api', apiRoutes)

// Error handling middleware
app.use(errorHandler)
app.use('*', notFoundHandler)

// Start server
async function startServer() {
  try {
    console.log('🔗 Starting server...')
    
    // Connect to database
    await connectToDatabase()
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
     
    })
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

module.exports = app;
