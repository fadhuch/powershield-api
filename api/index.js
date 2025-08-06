const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectToDatabase } = require('../src/config/database.js');
const apiRoutes = require('../src/routes/index.js');
const { errorHandler, notFoundHandler, requestLogger } = require('../src/middleware/index.js');

console.log('🔗 Initializing server...')

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(requestLogger)
app.use(cors({
  origin: '*',  // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '10mb' }))

// Initialize database connection
connectToDatabase().catch(console.error)

// API Routes
app.use('/api', apiRoutes)

// Middleware for error handling
app.use(errorHandler)
app.use('*', notFoundHandler)

// Export for Vercel
module.exports = app;
