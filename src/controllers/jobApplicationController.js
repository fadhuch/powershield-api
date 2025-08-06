const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

class JobApplicationController {
  // Public endpoints
  static async createApplication(req, res) {
      try {
        console.log(req.body,'req.body')
        
      // Process FormData
      const processedData = { ...req.body };
      
      const validation = JobApplication.validateApplicationData(processedData);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Check if job exists and is active
      const job = await Job.findById(req.db, processedData.jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      if (job.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'This job is no longer accepting applications'
        });
      }

      // Check for existing application
      const existingApplication = await JobApplication.checkExistingApplication(
        req.db,
        processedData.email,
        processedData.jobId
      );

      if (existingApplication) {
        return res.status(409).json({
          success: false,
          message: 'You have already applied for this job'
        });
      }

      const application = await JobApplication.create(req.db, processedData);
      
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          id: application.id,
          jobId: application.jobId,
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          phone: application.phone,
          address: application.address,
          position: application.position,
          linkedinUrl: application.linkedinUrl,
          coverLetter: application.coverLetter,
          status: application.status,
          createdAt: application.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application',
        error: error.message
      });
    }
  }

  // Admin endpoints
  static async getAllApplications(req, res) {
    try {
      const { jobId, status } = req.query;
      let filter = {};
      
      if (jobId) filter.jobId = jobId;
      if (status) filter.status = status;

      const applications = await JobApplication.findAll(req.db, filter);
      
      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: error.message
      });
    }
  }

  static async getApplicationById(req, res) {
    try {
      const { id } = req.params;
      const application = await JobApplication.findById(req.db, id);
      
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }
      
      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      console.error('Error fetching application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch application',
        error: error.message
      });
    }
  }

  static async getApplicationsByJob(req, res) {
    try {
      const { jobId } = req.params;
      
      // Check if job exists
      const job = await Job.findById(req.db, jobId);
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      const applications = await JobApplication.findByJobId(req.db, jobId);
      
      res.json({
        success: true,
        data: applications,
        jobDetails: job
      });
    } catch (error) {
      console.error('Error fetching applications by job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: error.message
      });
    }
  }

  static async getApplicationsByStatus(req, res) {
    try {
      const { status } = req.params;
      
      if (!['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be one of: pending, reviewing, accepted, rejected'
        });
      }

      const applications = await JobApplication.findByStatus(req.db, status);
      
      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching applications by status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: error.message
      });
    }
  }

  static async updateApplication(req, res) {
    try {
      const { id } = req.params;
      
      const existingApplication = await JobApplication.findById(req.db, id);
      if (!existingApplication) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      // Validate updated data
      const validation = JobApplication.validateApplicationData({
        ...existingApplication,
        ...req.body
      });
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const updatedApplication = await JobApplication.update(req.db, id, req.body);
      
      res.json({
        success: true,
        message: 'Application updated successfully',
        data: updatedApplication
      });
    } catch (error) {
      console.error('Error updating application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application',
        error: error.message
      });
    }
  }

  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['pending', 'reviewing', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required (pending, reviewing, accepted, rejected)'
        });
      }

      const existingApplication = await JobApplication.findById(req.db, id);
      if (!existingApplication) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      const updatedApplication = await JobApplication.updateStatus(req.db, id, status);
      
      res.json({
        success: true,
        message: 'Application status updated successfully',
        data: updatedApplication
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status',
        error: error.message
      });
    }
  }

  static async deleteApplication(req, res) {
    try {
      const { id } = req.params;
      
      const existingApplication = await JobApplication.findById(req.db, id);
      if (!existingApplication) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      const deleted = await JobApplication.delete(req.db, id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete application'
        });
      }
      
      res.json({
        success: true,
        message: 'Application deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete application',
        error: error.message
      });
    }
  }

  static async getApplicationStatistics(req, res) {
    try {
      const { jobId } = req.query;
      const statistics = await JobApplication.getApplicationStatistics(req.db, jobId);
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error) {
      console.error('Error fetching application statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  }

  static async getApplicationsGroupedByJob(req, res) {
    try {
      const applications = await JobApplication.getApplicationsGroupedByJob(req.db);
      
      res.json({
        success: true,
        data: applications
      });
    } catch (error) {
      console.error('Error fetching applications grouped by job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications grouped by job',
        error: error.message
      });
    }
  }
}

module.exports = JobApplicationController;
