import express from 'express'
import userRoutes from './users.js'
import galleryRoutes from './gallery.js'
import contactRoutes from './contacts.js'
import { ensureDBConnection } from '../middleware/index.js'
import { getDb } from '../config/database.js'

const router = express.Router()

// Health check route
router.get('/health', ensureDBConnection, (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  })
})

// Mount collection routes
router.use('/users', userRoutes)
router.use('/gallery', galleryRoutes)
router.use('/contacts', contactRoutes)

export default router
