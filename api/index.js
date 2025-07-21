import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectToDatabase } from '../src/config/database.js'
import apiRoutes from '../src/routes/index.js'
import { errorHandler, notFoundHandler, requestLogger } from '../src/middleware/index.js'

console.log('🔗 Initializing server...')

// Load environment variables
dotenv.config()

const app = express()

// Middleware
app.use(requestLogger)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.powershieldllc.com', 'https://powershieldllc.com']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5001']
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
export default app
