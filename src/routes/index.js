const express = require('express');
const userRoutes = require('./users.js');
const galleryRoutes = require('./gallery.js');
const contactRoutes = require('./contacts.js');
const jobRoutes = require('./jobs.js');
const applicationRoutes = require('./applications.js');
const adminRoutes = require('./admin.js');
const { ensureDBConnection } = require('../middleware/index.js');
const { authenticateAdmin } = require('../middleware/auth.js');

const router = express.Router();

// Health check route
router.get('/health', ensureDBConnection, (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  })
})

// Mount collection routes
router.use('/users', userRoutes);
router.use('/gallery', galleryRoutes);
router.use('/contacts', contactRoutes);

// Career management routes
router.use('/careers', jobRoutes);
router.use('/job-applications', applicationRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
