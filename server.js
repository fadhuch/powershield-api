import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectToDatabase } from './src/config/database.js'
import apiRoutes from './src/routes/index.js'
import { errorHandler, notFoundHandler, requestLogger } from './src/middleware/index.js'

console.log('🔗 Initializing server...')

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

// Middleware
app.use(requestLogger)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.powershieldllc.com', 'https://powershieldllc.com']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5001']
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

export default app
