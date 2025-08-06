const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');

class AdminUserController {
  static async login(req, res) {
    try {
      const validation = AdminUser.validateLoginData(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const { username, password } = req.body;
      const adminUser = await AdminUser.authenticate(req.db, username, password);
      
      if (!adminUser) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: adminUser.id, 
          username: adminUser.username,
          role: adminUser.role 
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: adminUser,
          token
        }
      });
    } catch (error) {
      console.error('Error during admin login:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  }

  static async createAdmin(req, res) {
    try {
      const validation = AdminUser.validateAdminData(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const adminUser = await AdminUser.create(req.db, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        data: adminUser
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      
      if (error.message === 'Username or email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create admin user',
        error: error.message
      });
    }
  }

  static async getAllAdmins(req, res) {
    try {
      const { role, isActive } = req.query;
      let filter = {};
      
      if (role) filter.role = role;
      if (isActive !== undefined) filter.isActive = isActive === 'true';

      const adminUsers = await AdminUser.findAll(req.db, filter);
      
      res.json({
        success: true,
        data: adminUsers
      });
    } catch (error) {
      console.error('Error fetching admin users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin users',
        error: error.message
      });
    }
  }

  static async getAdminById(req, res) {
    try {
        const { id } = req.params;
        console.log('Fetching admin user with ID:', id);
      const adminUser = await AdminUser.findById(req.db, id);
      
      if (!adminUser) {
        return res.status(404).json({
          success: false,
          message: 'Admin user not found 1'
        });
      }
      
      res.json({
        success: true,
        data: adminUser
      });
    } catch (error) {
      console.error('Error fetching admin user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin user',
        error: error.message
      });
    }
  }

  static async updateAdmin(req, res) {
    try {
      const { id } = req.params;
      
      const existingAdmin = await AdminUser.findById(req.db, id);
      if (!existingAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Admin user not found 2'
        });
      }

      // Validate updated data (excluding password validation if not provided)
      const dataToValidate = { ...existingAdmin, ...req.body };
      if (!req.body.password) {
        dataToValidate.password = 'dummy-password'; // Skip password validation
      }
      
      const validation = AdminUser.validateAdminData(dataToValidate);
      
      if (!validation.isValid) {
        // Remove password error if password wasn't provided
        if (!req.body.password && validation.errors.password) {
          delete validation.errors.password;
        }
        
        if (Object.keys(validation.errors).length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: validation.errors
          });
        }
      }

      const updatedAdmin = await AdminUser.update(req.db, id, req.body);
      
      res.json({
        success: true,
        message: 'Admin user updated successfully',
        data: updatedAdmin
      });
    } catch (error) {
      console.error('Error updating admin user:', error);
      
      if (error.message === 'Username or email already exists') {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to update admin user',
        error: error.message
      });
    }
  }

  static async updateAdminStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      if (isActive === undefined || typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive field is required and must be a boolean'
        });
      }

      const existingAdmin = await AdminUser.findById(req.db, id);
      if (!existingAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Admin user not found 3'
        });
      }

      const updatedAdmin = await AdminUser.updateStatus(req.db, id, isActive);
      
      res.json({
        success: true,
        message: 'Admin user status updated successfully',
        data: updatedAdmin
      });
    } catch (error) {
      console.error('Error updating admin user status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update admin user status',
        error: error.message
      });
    }
  }

  static async deleteAdmin(req, res) {
    try {
      const { id } = req.params;
      
      const existingAdmin = await AdminUser.findById(req.db, id);
      if (!existingAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Admin user not found 4'
        });
      }

      const deleted = await AdminUser.delete(req.db, id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete admin user'
        });
      }
      
      res.json({
        success: true,
        message: 'Admin user deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting admin user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete admin user',
        error: error.message
      });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      // This assumes you have authentication middleware that sets req.user
      const { id } = req.user;
      const adminUser = await AdminUser.findById(req.db, id);
      
      if (!adminUser) {
        return res.status(404).json({
          success: false,
          message: 'Admin user not found 5'
        });
      }
      
      res.json({
        success: true,
        data: adminUser
      });
    } catch (error) {
      console.error('Error fetching current admin user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch current admin user',
        error: error.message
      });
    }
  }
}

module.exports = AdminUserController;
