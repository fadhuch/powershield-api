const { getDb } = require('../config/database.js');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'gallery'

class GalleryModel {
  static getCollection() {
    return getDb().collection(COLLECTION_NAME)
  }

  // Create a new gallery item
  static async create(galleryData) {
    const collection = this.getCollection()
    
    const newGalleryItem = {
      ...galleryData,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
      status: galleryData.status || 'active'
    }

    const result = await collection.insertOne(newGalleryItem)
    return { ...newGalleryItem, _id: result.insertedId }
  }

  // Find gallery item by ID
  static async findById(id) {
    const collection = this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  // Get all gallery items with pagination and filtering
  static async findAll(options = {}) {
    const collection = this.getCollection()
    
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      status = 'active',
      search
    } = options

    const maxLimit = Math.min(limit, 100)
    const skip = (page - 1) * maxLimit
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    // Build filter object
    const filter = { status }
    if (category) filter.category = category
    if (search) {
      filter.$text = { $search: search }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortDirection

    // Get total count for pagination info
    const totalCount = await collection.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / maxLimit)

    // Get gallery items
    const items = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(maxLimit)
      .toArray()

    return {
      items,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit: maxLimit
      }
    }
  }

  // Get gallery items by category
  static async findByCategory(category, options = {}) {
    return await this.findAll({ ...options, category })
  }

  // Search gallery items
  static async search(searchTerm, options = {}) {
    return await this.findAll({ ...options, search: searchTerm })
  }

  // Update gallery item
  static async updateById(id, updateData) {
    const collection = this.getCollection()
    
    const update = {
      ...updateData,
      updatedAt: new Date()
    }

    delete update._id // Remove _id from update data

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    )

    return result.modifiedCount > 0
  }

  // Delete gallery item
  static async deleteById(id) {
    const collection = this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  // Increment view count
  static async incrementViews(id) {
    const collection = this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $inc: { views: 1 },
        $set: { updatedAt: new Date() }
      }
    )
    return result.modifiedCount > 0
  }

  // Toggle like
  static async toggleLike(id, increment = true) {
    const collection = this.getCollection()
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $inc: { likes: increment ? 1 : -1 },
        $set: { updatedAt: new Date() }
      }
    )
    return result.modifiedCount > 0
  }

  // Get gallery statistics
  static async getStats() {
    const collection = this.getCollection()
    
    const stats = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          avgViews: { $avg: '$views' },
          avgLikes: { $avg: '$likes' }
        }
      }
    ]).toArray()

    const categoryStats = await collection.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    return {
      overall: stats[0] || {
        totalItems: 0,
        totalViews: 0,
        totalLikes: 0,
        avgViews: 0,
        avgLikes: 0
      },
      categories: categoryStats.reduce((acc, cat) => {
        acc[cat._id] = cat.count
        return acc
      }, {})
    }
  }

  // Get featured items
  static async getFeatured(limit = 5) {
    const collection = this.getCollection()
    return await collection
      .find({ 
        status: 'active',
        featured: true 
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
  }
}

module.exports = GalleryModel;
