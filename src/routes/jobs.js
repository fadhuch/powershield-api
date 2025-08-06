const express = require('express');
const JobController = require('../controllers/jobController');
const { ensureDBConnection } = require('../middleware/index');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();
console.log('Job routes initialized');
// Apply database connection middleware to all routes
router.use(ensureDBConnection);

// Public routes
router.get('/public', JobController.getPublicJobs);
router.get('/public/:id', JobController.getPublicJobById);

// Admin routes (require authentication)
router.get('/admin/', authenticateAdmin, JobController.getAllJobs);
router.get('/admin/:id', authenticateAdmin, JobController.getJobById);
router.post('/admin/', authenticateAdmin, JobController.createJob);
router.put('/admin/:id', authenticateAdmin, JobController.updateJob);
router.patch('/admin/:id/status', authenticateAdmin, JobController.updateJobStatus);
router.delete('/admin/:id', authenticateAdmin, JobController.deleteJob);

module.exports = router;
