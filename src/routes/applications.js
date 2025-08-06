const express = require('express');
const multer = require('multer');
const JobApplicationController = require('../controllers/jobApplicationController');
const { ensureDBConnection } = require('../middleware/index');
const { authenticateAdmin } = require('../middleware/auth');

// Configure multer for handling FormData (memory storage for simple fields)
const upload = multer();

const router = express.Router();

// Apply database connection middleware to all routes
router.use(ensureDBConnection);

// Public routes - use upload.any() to accept any FormData fields
router.post('/', upload.any(), JobApplicationController.createApplication);

// Admin routes (require authentication)
router.get('/', authenticateAdmin, JobApplicationController.getAllApplications);
router.get('/grouped-by-job', authenticateAdmin, JobApplicationController.getApplicationsGroupedByJob);
router.get('/statistics', authenticateAdmin, JobApplicationController.getApplicationStatistics);
router.get('/job/:jobId', authenticateAdmin, JobApplicationController.getApplicationsByJob);
router.get('/status/:status', authenticateAdmin, JobApplicationController.getApplicationsByStatus);
router.get('/:id', authenticateAdmin, JobApplicationController.getApplicationById);
router.put('/:id', authenticateAdmin, JobApplicationController.updateApplication);
router.patch('/:id/status', authenticateAdmin, JobApplicationController.updateApplicationStatus);
router.delete('/:id', authenticateAdmin, JobApplicationController.deleteApplication);

module.exports = router;
