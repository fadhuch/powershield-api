const { getDb } = require('../config/database.js');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'users'

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

class UserModel {
  static getCollection() {
    return getDb().collection(COLLECTION_NAME)
  }

  // Create a new user
  static async create(userData) {
    const collection = this.getCollection()
    
    const newUser = {
      ...userData,
      email: userData.email?.trim().toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(newUser)
    return { ...newUser, _id: result.insertedId }
  }

  // Find user by email
  static async findByEmail(email) {
    const collection = this.getCollection()
    return await collection.findOne({ email: email.trim().toLowerCase() })
  }

  // Find user by ID
  static async findById(id) {
    const collection = this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  // Get all users with pagination
  static async findAll(options = {}) {
    const collection = this.getCollection()
    
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      filter = {}
    } = options

    const maxLimit = Math.min(limit, 100)
    const skip = (page - 1) * maxLimit
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    // Build sort object
    const sort = {}
    sort[sortBy] = sortDirection

    // Get total count for pagination info
    const totalCount = await collection.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / maxLimit)

    // Get users
    const users = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(maxLimit)
      .project({ password: 0 }) // Exclude sensitive fields
      .toArray()

    return {
      users,
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

  // Update user
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

  // Delete user
  static async deleteById(id) {
    const collection = this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  // Get user count
  static async getCount(filter = {}) {
    const collection = this.getCollection()
    return await collection.countDocuments(filter)
  }

  // Check if email exists
  static async emailExists(email) {
    const collection = this.getCollection()
    const user = await collection.findOne(
      { email: email.trim().toLowerCase() },
      { projection: { _id: 1 } }
    )
    return !!user
  }
}

module.exports = { UserModel, validateEmail };
