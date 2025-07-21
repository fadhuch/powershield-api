import express from 'express'
import GalleryController from '../controllers/galleryController.js'
import { ensureDBConnection } from '../middleware/index.js'

const router = express.Router()

// Apply database connection middleware to all routes
router.use(ensureDBConnection)

// Gallery routes
router.post('/', GalleryController.createGalleryItem)
router.get('/', GalleryController.getGalleryItems)
router.get('/stats', GalleryController.getGalleryStats)
router.get('/featured', GalleryController.getFeaturedItems)
router.get('/search', GalleryController.searchGalleryItems)
router.get('/category/:category', GalleryController.getGalleryItemsByCategory)
router.get('/:id', GalleryController.getGalleryItemById)
router.put('/:id', GalleryController.updateGalleryItem)
router.delete('/:id', GalleryController.deleteGalleryItem)
router.post('/:id/like', GalleryController.toggleLike)

export default router
