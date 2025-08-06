const { UserModel, validateEmail } = require('../models/User.js');

class UserController {
  // Create a new user
  static async createUser(req, res) {
    try {
      const { email, name, ...otherData } = req.body

      // Validation
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        })
      }

      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        })
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email)
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        })
      }

      // Create new user
      const userData = {
        email,
        name,
        ...otherData,
      }

      const newUser = await UserModel.create(userData)
      
      // Remove sensitive data from response
      const { password, ...userResponse } = newUser

      console.log(`✅ New user created: ${email}`)

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: userResponse
      })

    } catch (error) {
      console.error('Error creating user:', error)
      
      // Handle duplicate key error (race condition)
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        })
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error. Please try again later.'
      })
    }
  }

  // Get all users with pagination
  static async getUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 50
      const sortBy = req.query.sortBy || 'createdAt'
      const sortOrder = req.query.sortOrder || 'desc'

      const result = await UserModel.findAll({
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
      console.error('Error getting users:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      })
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params
      const user = await UserModel.findById(id)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      // Remove sensitive data
      const { password, ...userResponse } = user

      res.json({
        success: true,
        data: userResponse
      })

    } catch (error) {
      console.error('Error getting user:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get user'
      })
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { id } = req.params
      const updateData = req.body

      // Remove sensitive fields from update
      delete updateData.password
      delete updateData._id

      const updated = await UserModel.updateById(id, updateData)

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      res.json({
        success: true,
        message: 'User updated successfully'
      })

    } catch (error) {
      console.error('Error updating user:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      })
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params
      const deleted = await UserModel.deleteById(id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        })
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      })

    } catch (error) {
      console.error('Error deleting user:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      })
    }
  }

  // Check if email exists
  static async checkEmail(req, res) {
    try {
      const { email } = req.body

      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        })
      }

      const exists = await UserModel.emailExists(email)

      res.json({
        success: true,
        exists
      })

    } catch (error) {
      console.error('Error checking email:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to check email'
      })
    }
  }

  // Get user statistics
  static async getUserStats(req, res) {
    try {
      const totalCount = await UserModel.getCount()

      res.json({
        success: true,
        data: {
          totalCount,
          timestamp: new Date().toISOString()
        }
      })

    } catch (error) {
      console.error('Error getting user stats:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to get user statistics'
      })
    }
  }
}

module.exports = UserController;
