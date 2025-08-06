const GalleryModel = require('../models/Gallery.js');

class GalleryController {
  // Create a new gallery item
  static async createGalleryItem(req, res) {
    try {
      const { title, description, imageUrl, category, featured = false } = req.body

      // Validation
      if (!title || !imageUrl) {
        return res.status(400).json({
          success: false,
          message: 'Title and image URL are required'
        })
      }

      const galleryData = {
        title: title.trim(),
        description: description?.trim() || '',
        imageUrl,
        category: category?.trim() || 'uncategorized',
        featured,
        uploadedBy: req.user?.id, // If you have authentication
      }

      const newItem = await GalleryModel.create(galleryData)

      console.log(`✅ New gallery item created: ${title}`)

      res.status(201).json({
        success: true,
        message: 'Gallery item created successfully',
        data: newItem
      })

    } catch (error) {
      console.error('Error creating gallery item:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create gallery item'
      })
    }
  }

  // Get all gallery items with pagination and filtering
  static async getGalleryItems(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const sortBy = req.query.sortBy || 'createdAt'
      const sortOrder = req.query.sortOrder || 'desc'
      const category = req.query.category
      const status = req.query.status || 'active'
      const search = req.query.search

      const result = await GalleryModel.findAll({
        page,
        limit,
        sortBy,
        sortOrder,
        category,
        status,
        search
      })

      res.json({
        success: true,
        data: result
      })

    } catch (error) {
      console.error('Error getting gallery items:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get gallery items'
      })
    }
  }

  // Get gallery item by ID
  static async getGalleryItemById(req, res) {
    try {
      const { id } = req.params
      const item = await GalleryModel.findById(id)

      if (!item) {
        return res.status(404).json({
          success: false,
          message: 'Gallery item not found'
        })
      }

      // Increment view count
      await GalleryModel.incrementViews(id)

      res.json({
        success: true,
        data: { ...item, views: item.views + 1 }
      })

    } catch (error) {
      console.error('Error getting gallery item:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get gallery item'
      })
    }
  }

  // Update gallery item
  static async updateGalleryItem(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body

      // Remove system fields from update
      delete updateData._id
      delete updateData.views
      delete updateData.likes
      delete updateData.createdAt

      const updated = await GalleryModel.updateById(id, updateData)

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Gallery item not found'
        })
      }

      res.json({
        success: true,
        message: 'Gallery item updated successfully'
      })

    } catch (error) {
      console.error('Error updating gallery item:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update gallery item'
      })
    }
  }

  // Delete gallery item
  static async deleteGalleryItem(req, res) {
    try {
      const { id } = req.params
      const deleted = await GalleryModel.deleteById(id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Gallery item not found'
        })
      }

      res.json({
        success: true,
        message: 'Gallery item deleted successfully'
      })

    } catch (error) {
      console.error('Error deleting gallery item:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete gallery item'
      })
    }
  }

  // Get gallery items by category
  static async getGalleryItemsByCategory(req, res) {
    try {
      const { category } = req.params
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20
      const sortBy = req.query.sortBy || 'createdAt'
      const sortOrder = req.query.sortOrder || 'desc'

      const result = await GalleryModel.findByCategory(category, {
        page,
        limit,
        sortBy,
        sortOrder
      })

      res.json({
        success: true,
        data: result
      })

    } catch (error) {
      console.error('Error getting gallery items by category:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get gallery items by category'
      })
    }
  }

  // Search gallery items
  static async searchGalleryItems(req, res) {
    try {
      const { q: searchTerm } = req.query
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 20

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        })
      }

      const result = await GalleryModel.search(searchTerm, { page, limit })

      res.json({
        success: true,
        data: result
      })

    } catch (error) {
      console.error('Error searching gallery items:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to search gallery items'
      })
    }
  }

  // Toggle like on gallery item
  static async toggleLike(req, res) {
    try {
      const { id } = req.params
      const { increment = true } = req.body

      const updated = await GalleryModel.toggleLike(id, increment)

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Gallery item not found'
        })
      }

      res.json({
        success: true,
        message: increment ? 'Like added' : 'Like removed'
      })

    } catch (error) {
      console.error('Error toggling like:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to toggle like'
      })
    }
  }

  // Get gallery statistics
  static async getGalleryStats(req, res) {
    try {
      const stats = await GalleryModel.getStats()

      res.json({
        success: true,
        data: {
          ...stats,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('Error getting gallery stats:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get gallery statistics'
      })
    }
  }

  // Get featured gallery items
  static async getFeaturedItems(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5
      const items = await GalleryModel.getFeatured(limit)

      res.json({
        success: true,
        data: {
          items,
          count: items.length
        }
      })

    } catch (error) {
      console.error('Error getting featured items:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get featured items'
      })
    }
  }
}

module.exports = GalleryController;
