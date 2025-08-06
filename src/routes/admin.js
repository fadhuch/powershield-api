const express = require('express');
const AdminUserController = require('../controllers/adminUserController');
const JobController = require('../controllers/jobController');
const JobApplicationController = require('../controllers/jobApplicationController');
const { ensureDBConnection } = require('../middleware/index');
const { authenticateAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply database connection middleware to all routes
router.use(ensureDBConnection);

// Authentication routes (no auth required)
router.post('/login', AdminUserController.login);

// Career management routes (require authentication)
router.get('/careers', authenticateAdmin, JobController.getAllJobs);
router.get('/careers/:id', authenticateAdmin, JobController.getJobById);
router.post('/careers', authenticateAdmin, JobController.createJob);
router.put('/careers/:id', authenticateAdmin, JobController.updateJob);
router.patch('/careers/:id/status', authenticateAdmin, JobController.updateJobStatus);
router.delete('/careers/:id', authenticateAdmin, JobController.deleteJob);

router.get('/job-applications', authenticateAdmin, JobApplicationController.getAllApplications);
router.get('/job-applications/:id', authenticateAdmin, JobApplicationController.getApplicationById);
router.get('/job-applications/job/:jobId', authenticateAdmin, JobApplicationController.getApplicationsByJob);
router.get('/job-applications/status/:status', authenticateAdmin, JobApplicationController.getApplicationsByStatus);
router.get('/job-applications/statistics', authenticateAdmin, JobApplicationController.getApplicationStatistics);
router.put('/job-applications/:id', authenticateAdmin, JobApplicationController.updateApplication);
router.patch('/job-applications/:id/status', authenticateAdmin, JobApplicationController.updateApplicationStatus);
router.delete('/job-applications/:id', authenticateAdmin, JobApplicationController.deleteApplication);

// Specific admin user management routes (require authentication) - these must come BEFORE /:id route
router.get('/me', authenticateAdmin, AdminUserController.getCurrentUser); // Get current logged-in admin
router.post('/', authenticateAdmin, requireSuperAdmin, AdminUserController.createAdmin);
router.get('/', authenticateAdmin, AdminUserController.getAllAdmins);

// Generic admin user routes with ID parameter - these must come LAST
router.get('/:id', authenticateAdmin, AdminUserController.getAdminById);
router.put('/:id', authenticateAdmin, AdminUserController.updateAdmin);
router.patch('/:id/status', authenticateAdmin, requireSuperAdmin, AdminUserController.updateAdminStatus);
router.delete('/:id', authenticateAdmin, requireSuperAdmin, AdminUserController.deleteAdmin);

module.exports = router;
