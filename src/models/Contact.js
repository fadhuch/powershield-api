const { getDb } = require('../config/database.js');
const { ObjectId } = require('mongodb');

const COLLECTION_NAME = 'contacts'

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateContactData = (data) => {
  const errors = []
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email address is required')
  }
  return errors
}

class ContactModel {
  static getCollection() {
    return getDb().collection(COLLECTION_NAME)
  }

  // Create a new contact message
  static async create(contactData) {
    const collection = this.getCollection()
    
    const newContact = {
      ...contactData,
      name: contactData.name?.trim(),
      email: contactData.email?.trim().toLowerCase(),
      message: contactData.message?.trim(),
      status: 'unread', // unread, read, replied, archived
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await collection.insertOne(newContact)
    return { ...newContact, _id: result.insertedId }
  }

  // Find contact by ID
  static async findById(id) {
    const collection = this.getCollection()
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  // Get all contacts with pagination and filtering
  static async findAll(options = {}) {
    const collection = this.getCollection()
    
    const {
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      search
    } = options

    const maxLimit = Math.min(limit, 100)
    const skip = (page - 1) * maxLimit
    const sortDirection = sortOrder === 'asc' ? 1 : -1

    // Build filter object
    const filter = {}
    if (status) filter.status = status
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ]
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortDirection

    // Get total count for pagination info
    const totalCount = await collection.countDocuments(filter)
    const totalPages = Math.ceil(totalCount / maxLimit)

    // Get contacts
    const contacts = await collection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(maxLimit)
      .toArray()

    return {
      contacts,
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

  // Get contacts by status
  static async findByStatus(status, options = {}) {
    return await this.findAll({ ...options, status })
  }

  // Update contact status
  static async updateStatus(id, status) {
    const collection = this.getCollection()
    
    const validStatuses = ['unread', 'read', 'replied', 'archived']
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status. Must be one of: ' + validStatuses.join(', '))
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        }
      }
    )

    return result.modifiedCount > 0
  }

  // Update contact
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

  // Delete contact
  static async deleteById(id) {
    const collection = this.getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(id) })
    return result.deletedCount > 0
  }

  // Get contact statistics
  static async getStats() {
    const collection = this.getCollection()
    
    const totalCount = await collection.countDocuments()
    
    const statusStats = await collection.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray()

    const recentContacts = await collection.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })

    return {
      totalCount,
      recentContacts,
      statusBreakdown: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {
        unread: 0,
        read: 0,
        replied: 0,
        archived: 0
      })
    }
  }

  // Mark as read
  static async markAsRead(id) {
    return await this.updateStatus(id, 'read')
  }

  // Mark as replied
  static async markAsReplied(id) {
    return await this.updateStatus(id, 'replied')
  }

  // Archive contact
  static async archive(id) {
    return await this.updateStatus(id, 'archived')
  }

  // Search contacts
  static async search(searchTerm, options = {}) {
    return await this.findAll({ ...options, search: searchTerm })
  }

  // Get unread count
  static async getUnreadCount() {
    const collection = this.getCollection()
    return await collection.countDocuments({ status: 'unread' })
  }
}

module.exports = { ContactModel, validateContactData };
