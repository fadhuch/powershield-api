const Job = require('../models/Job');

class JobController {
  // Public endpoints
  static async getPublicJobs(req, res) {
    try {
      const jobs = await Job.findActiveJobs(req.db);
      
      // Remove sensitive information from public response
      const publicJobs = jobs.map(job => ({
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        type: job.type,
        experience: job.experience,
        requirements: job.requirements,
        salary: job.salary,
        createdAt: job.createdAt,
        status: job.status
      }));
      
      res.json({
        success: true,
        data: publicJobs
      });
    } catch (error) {
      console.error('Error fetching public jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch jobs',
        error: error.message
      });
    }
  }

  static async getPublicJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await Job.findById(req.db, id);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      // Check if job is active for public access
      if (job.status !== 'active') {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      // Remove sensitive information from public response
      const publicJob = {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        type: job.type,
        experience: job.experience,
        requirements: job.requirements,
        salary: job.salary,
        createdAt: job.createdAt
      };
      
      res.json({
        success: true,
        data: publicJob
      });
    } catch (error) {
      console.error('Error fetching public job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job',
        error: error.message
      });
    }
  }

  // Admin endpoints
  static async getAllJobs(req, res) {
    try {
      const jobs = await Job.getJobsWithApplicationCount(req.db);
      
      res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch jobs',
        error: error.message
      });
    }
  }

  static async getJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await Job.findById(req.db, id);
      
      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }
      
      res.json({
        success: true,
        data: job
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job',
        error: error.message
      });
    }
  }

  static async createJob(req, res) {
    try {
      const validation = Job.validateJobData(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const job = await Job.create(req.db, req.body);
      
      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job
      });
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create job',
        error: error.message
      });
    }
  }

  static async updateJob(req, res) {
    try {
      const { id } = req.params;
      
      const existingJob = await Job.findById(req.db, id);
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      const validation = Job.validateJobData({ ...existingJob, ...req.body });
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const updatedJob = await Job.update(req.db, id, req.body);
      
      res.json({
        success: true,
        message: 'Job updated successfully',
        data: updatedJob
      });
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update job',
        error: error.message
      });
    }
  }

  static async updateJobStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status is required (active or inactive)'
        });
      }

      const existingJob = await Job.findById(req.db, id);
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      const updatedJob = await Job.updateStatus(req.db, id, status);
      
      res.json({
        success: true,
        message: 'Job status updated successfully',
        data: updatedJob
      });
    } catch (error) {
      console.error('Error updating job status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update job status',
        error: error.message
      });
    }
  }

  static async deleteJob(req, res) {
    try {
      const { id } = req.params;
      
      const existingJob = await Job.findById(req.db, id);
      if (!existingJob) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      const deleted = await Job.delete(req.db, id);
      
      if (!deleted) {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete job'
        });
      }
      
      res.json({
        success: true,
        message: 'Job deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete job',
        error: error.message
      });
    }
  }
}

module.exports = JobController;
