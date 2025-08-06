const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    
      // Verify user still exists and is active
      const adminUser = await AdminUser.findById(req.db, decoded.id);
        console.log('Decoded JWT:', adminUser);
      if (!adminUser || !adminUser.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Invalid or inactive user.'
        });
      }

      req.user = decoded;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
};

module.exports = {
  authenticateAdmin,
  requireSuperAdmin
};
