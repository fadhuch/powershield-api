const express = require('express');
const GalleryController = require('../controllers/galleryController.js');
const { ensureDBConnection } = require('../middleware/index.js');

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

module.exports = router;
