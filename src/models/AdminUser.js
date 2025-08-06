const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

class AdminUser {
  constructor(data) {
    this.id = data.id || `admin_${uuidv4().split('-')[0]}`;
    this.username = data.username;
    this.email = data.email;
    this.hashedPassword = data.hashedPassword;
    this.role = data.role || 'admin';
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastLoginAt = data.lastLoginAt;
  }

  static async createIndexes(db) {
    const collection = db.collection('admin_users');
    await collection.createIndex({ username: 1 }, { unique: true });
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ role: 1 });
    await collection.createIndex({ isActive: 1 });
  }

  static async create(db, adminData) {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const adminUser = new AdminUser({
      ...adminData,
      hashedPassword
    });
    
    // Remove the plain password field
    delete adminUser.password;
    
    const collection = db.collection('admin_users');
    
    try {
      await collection.insertOne(adminUser);
      return adminUser;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  static async findById(db, id) {
    const collection = db.collection('admin_users');
    const admin = await collection.findOne({ id });
    if (admin) {
      delete admin.hashedPassword;
    }
    return admin;
  }

  static async findByUsername(db, username) {
    const collection = db.collection('admin_users');
    return await collection.findOne({ username });
  }

  static async findByEmail(db, email) {
    const collection = db.collection('admin_users');
    return await collection.findOne({ email });
  }

  static async findAll(db, filter = {}) {
    const collection = db.collection('admin_users');
    const admins = await collection.find(filter).sort({ createdAt: -1 }).toArray();
    
    // Remove password hashes from results
    return admins.map(admin => {
      delete admin.hashedPassword;
      return admin;
    });
  }

  static async update(db, id, updateData) {
    const collection = db.collection('admin_users');
    
    // If password is being updated, hash it
    if (updateData.password) {
      updateData.hashedPassword = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }
    
    const updatedData = {
      ...updateData,
      updatedAt: new Date()
    };
    
    try {
      await collection.updateOne({ id }, { $set: updatedData });
      return await AdminUser.findById(db, id);
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Username or email already exists');
      }
      throw error;
    }
  }

  static async updateLastLogin(db, id) {
    const collection = db.collection('admin_users');
    await collection.updateOne(
      { id }, 
      { 
        $set: { 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
  }

  static async updateStatus(db, id, isActive) {
    const collection = db.collection('admin_users');
    await collection.updateOne(
      { id }, 
      { 
        $set: { 
          isActive,
          updatedAt: new Date()
        } 
      }
    );
    return await AdminUser.findById(db, id);
  }

  static async delete(db, id) {
    const collection = db.collection('admin_users');
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async authenticate(db, usernameOrEmail, password) {
    try {
      const collection = db.collection('admin_users');
      
      // Find admin by username or email
      const adminUser = await collection.findOne({
        $or: [
          { username: usernameOrEmail },
          { email: usernameOrEmail }
        ]
      });
      
      if (!adminUser || !adminUser.isActive) {
        return null;
      }
      
      // Verify password
      const isValid = await bcrypt.compare(password, adminUser.hashedPassword);
      
      if (!isValid) {
        return null;
      }
      
      // Update last login
      await AdminUser.updateLastLogin(db, adminUser.id);
      
      // Remove password hash before returning
      delete adminUser.hashedPassword;
      return adminUser;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  static validateAdminData(data) {
    const errors = {};

    if (!data.username || data.username.trim().length === 0) {
      errors.username = 'Username is required';
    } else if (data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Valid email is required';
      }
    }

    if (!data.password || data.password.length === 0) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (data.role && !['admin', 'super_admin'].includes(data.role)) {
      errors.role = 'Role must be either admin or super_admin';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static validateLoginData(data) {
    const errors = {};

    if (!data.username || data.username.trim().length === 0) {
      errors.username = 'Username is required';
    }

    if (!data.password || data.password.length === 0) {
      errors.password = 'Password is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

module.exports = AdminUser;
