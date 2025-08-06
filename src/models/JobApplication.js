const { v4: uuidv4 } = require('uuid');

class JobApplication {
  constructor(data) {
    this.id = data.id || `app_${uuidv4().split('-')[0]}`;
    this.jobId = data.jobId;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.position = data.position;
    this.linkedinUrl = data.linkedinUrl;
    this.coverLetter = data.coverLetter;
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.reviewedAt = data.reviewedAt;
  }

  static async createIndexes(db) {
    const collection = db.collection('job_applications');
    await collection.createIndex({ jobId: 1 });
    await collection.createIndex({ email: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ firstName: "text", lastName: "text", email: "text", position: "text" });
  }

  static async create(db, applicationData) {
    const application = new JobApplication(applicationData);
    const collection = db.collection('job_applications');
    
    await collection.insertOne(application);
    return application;
  }

  static async findById(db, id) {
    const collection = db.collection('job_applications');
    const pipeline = [
      { $match: { id } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: 'id',
          as: 'jobDetails'
        }
      },
      {
        $addFields: {
          jobDetails: { $arrayElemAt: ['$jobDetails', 0] }
        }
      }
    ];
    
    const result = await collection.aggregate(pipeline).toArray();
    return result.length > 0 ? result[0] : null;
  }

  static async findAll(db, filter = {}) {
    const collection = db.collection('job_applications');
    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: 'id',
          as: 'jobDetails'
        }
      },
      {
        $addFields: {
          jobDetails: { $arrayElemAt: ['$jobDetails', 0] }
        }
      },
      { $sort: { createdAt: -1 } }
    ];
    
    return await collection.aggregate(pipeline).toArray();
  }

  static async findByJobId(db, jobId) {
    const collection = db.collection('job_applications');
    return await collection.find({ jobId }).sort({ createdAt: -1 }).toArray();
  }

  static async findByStatus(db, status) {
    const collection = db.collection('job_applications');
    const pipeline = [
      { $match: { status } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: 'id',
          as: 'jobDetails'
        }
      },
      {
        $addFields: {
          jobDetails: { $arrayElemAt: ['$jobDetails', 0] }
        }
      },
      { $sort: { createdAt: -1 } }
    ];
    
    return await collection.aggregate(pipeline).toArray();
  }

  static async update(db, id, updateData) {
    const collection = db.collection('job_applications');
    const updatedData = {
      ...updateData,
      updatedAt: new Date()
    };
    
    await collection.updateOne({ id }, { $set: updatedData });
    return await JobApplication.findById(db, id);
  }

  static async updateStatus(db, id, status) {
    const collection = db.collection('job_applications');
    const updatedData = {
      status,
      updatedAt: new Date(),
      reviewedAt: status !== 'pending' ? new Date() : null
    };
    
    await collection.updateOne({ id }, { $set: updatedData });
    return await JobApplication.findById(db, id);
  }

  static async delete(db, id) {
    const collection = db.collection('job_applications');
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async checkExistingApplication(db, email, jobId) {
    const collection = db.collection('job_applications');
    return await collection.findOne({ email, jobId });
  }

  static async getApplicationStatistics(db, jobId = null) {
    const collection = db.collection('job_applications');
    const matchStage = jobId ? { jobId } : {};
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ];
    
    const result = await collection.aggregate(pipeline).toArray();
    const stats = {
      pending: 0,
      reviewing: 0,
      accepted: 0,
      rejected: 0
    };
    
    result.forEach(item => {
      stats[item._id] = item.count;
    });
    
    return stats;
  }

  static async getApplicationsGroupedByJob(db) {
    const collection = db.collection('job_applications');
    const pipeline = [
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: 'id',
          as: 'jobDetails'
        }
      },
      {
        $addFields: {
          jobDetails: { $arrayElemAt: ['$jobDetails', 0] }
        }
      },
      {
        $group: {
          _id: '$jobId',
          jobDetails: { $first: '$jobDetails' },
          applications: {
            $push: {
              id: '$id',
              firstName: '$firstName',
              lastName: '$lastName',
              email: '$email',
              phone: '$phone',
              address: '$address',
              position: '$position',
              linkedinUrl: '$linkedinUrl',
              coverLetter: '$coverLetter',
              status: '$status',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              reviewedAt: '$reviewedAt'
            }
          },
          applicationCount: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          reviewingCount: {
            $sum: { $cond: [{ $eq: ['$status', 'reviewing'] }, 1, 0] }
          },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          jobId: '$_id',
          jobDetails: '$jobDetails',
          applications: {
            $sortArray: {
              input: '$applications',
              sortBy: { createdAt: -1 }
            }
          },
          statistics: {
            total: '$applicationCount',
            pending: '$pendingCount',
            reviewing: '$reviewingCount',
            accepted: '$acceptedCount',
            rejected: '$rejectedCount'
          }
        }
      },
      {
        $sort: {
          'jobDetails.createdAt': -1
        }
      }
    ];
    
    return await collection.aggregate(pipeline).toArray();
  }

  static validateApplicationData(data) {
    const errors = {};
    console.log('Validating job application data:', data);
    
    if (!data.jobId || data.jobId.trim().length === 0) {
      errors.jobId = 'Job ID is required';
    }

    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.firstName = 'First name is required';
    }
    
    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.lastName = 'Last name is required';
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Valid email is required';
      }
    }

    if (!data.phone || data.phone.trim().length === 0) {
      errors.phone = 'Phone number is required';
    }

    if (!data.address || data.address.trim().length === 0) {
      errors.address = 'Address is required';
    }

    if (!data.position || data.position.trim().length === 0) {
      errors.position = 'Position is required';
    }

    if (data.status && !['pending', 'reviewing', 'accepted', 'rejected'].includes(data.status)) {
      errors.status = 'Status must be one of: pending, reviewing, accepted, rejected';
    }

    if (data.linkedinUrl && data.linkedinUrl.trim().length > 0) {
      try {
        new URL(data.linkedinUrl);
      } catch {
        errors.linkedinUrl = 'LinkedIn URL must be a valid URL';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

module.exports = JobApplication;
