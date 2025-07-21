import ContactModel, { validateContactData } from '../models/Contact.js'

export class ContactController {
  // Create a new contact message
  static async createContact(req, res) {
    try {
      const { name, email, message } = req.body

      // Validation
      const validationErrors = validateContactData({ name, email, message })
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        })
      }

      // Create new contact
      const contactData = {
        name,
        email,
        message,
      }

      const newContact = await ContactModel.create(contactData)

      console.log(`✅ New contact message from: ${email}`)

      res.status(201).json({
        success: true,
        message: 'Contact message sent successfully',
        data: {
          id: newContact._id,
          name: newContact.name,
          email: newContact.email,
          createdAt: newContact.createdAt
        }
      })

    } catch (error) {
      console.error('Error creating contact:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to send contact message. Please try again later.'
      })
    }
  }

  // Get all contacts with pagination and filtering (Admin only)
  static async getContacts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 50
      const sortBy = req.query.sortBy || 'createdAt'
      const sortOrder = req.query.sortOrder || 'desc'
      const status = req.query.status
      const search = req.query.search

      const result = await ContactModel.findAll({
        page,
        limit,
        sortBy,
        sortOrder,
        status,
        search
      })

      res.json({
        success: true,
        data: result
      })

    } catch (error) {
      console.error('Error getting contacts:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get contacts'
      })
    }
  }

  // Get contact by ID
  static async getContactById(req, res) {
    try {
      const { id } = req.params
      const contact = await ContactModel.findById(id)

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        })
      }

      // Automatically mark as read when viewed
      if (contact.status === 'unread') {
        await ContactModel.markAsRead(id)
        contact.status = 'read'
        contact.updatedAt = new Date()
      }

      res.json({
        success: true,
        data: contact
      })

    } catch (error) {
      console.error('Error getting contact:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get contact'
      })
    }
  }

  // Update contact status
  static async updateContactStatus(req, res) {
    try {
      const { id } = req.params
      const { status } = req.body

      const updated = await ContactModel.updateStatus(id, status)

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        })
      }

      res.json({
        success: true,
        message: `Contact status updated to ${status}`
      })

    } catch (error) {
      console.error('Error updating contact status:', error)
      
      if (error.message.includes('Invalid status')) {
        return res.status(400).json({
          success: false,
          message: error.message
        })
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update contact status'
      })
    }
  }

  // Delete contact
  static async deleteContact(req, res) {
    try {
      const { id } = req.params
      const deleted = await ContactModel.deleteById(id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        })
      }

      res.json({
        success: true,
        message: 'Contact deleted successfully'
      })

    } catch (error) {
      console.error('Error deleting contact:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete contact'
      })
    }
  }

  // Get contacts by status
  static async getContactsByStatus(req, res) {
    try {
      const { status } = req.params
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 50
      const sortBy = req.query.sortBy || 'createdAt'
      const sortOrder = req.query.sortOrder || 'desc'

      const result = await ContactModel.findByStatus(status, {
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
      console.error('Error getting contacts by status:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get contacts by status'
      })
    }
  }

  // Search contacts
  static async searchContacts(req, res) {
    try {
      const { q: searchTerm } = req.query
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 50

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        })
      }

      const result = await ContactModel.search(searchTerm, { page, limit })

      res.json({
        success: true,
        data: result
      })

    } catch (error) {
      console.error('Error searching contacts:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to search contacts'
      })
    }
  }

  // Mark contact as replied
  static async markAsReplied(req, res) {
    try {
      const { id } = req.params
      const updated = await ContactModel.markAsReplied(id)

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        })
      }

      res.json({
        success: true,
        message: 'Contact marked as replied'
      })

    } catch (error) {
      console.error('Error marking contact as replied:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to mark contact as replied'
      })
    }
  }

  // Archive contact
  static async archiveContact(req, res) {
    try {
      const { id } = req.params
      const updated = await ContactModel.archive(id)

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Contact not found'
        })
      }

      res.json({
        success: true,
        message: 'Contact archived successfully'
      })

    } catch (error) {
      console.error('Error archiving contact:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to archive contact'
      })
    }
  }

  // Get contact statistics
  static async getContactStats(req, res) {
    try {
      const stats = await ContactModel.getStats()

      res.json({
        success: true,
        data: {
          ...stats,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('Error getting contact stats:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get contact statistics'
      })
    }
  }

  // Get unread count
  static async getUnreadCount(req, res) {
    try {
      const count = await ContactModel.getUnreadCount()

      res.json({
        success: true,
        data: {
          unreadCount: count,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('Error getting unread count:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count'
      })
    }
  }
}

export default ContactController
