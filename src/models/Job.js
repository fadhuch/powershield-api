const { v4: uuidv4 } = require('uuid');

class Job {
  constructor(data) {
    this.id = data.id || `job_${uuidv4().split('-')[0]}`;
    this.title = data.title;
    this.description = data.description;
    this.location = data.location;
    this.type = data.type;
    this.experience = data.experience;
    this.requirements = data.requirements || [];
    this.salary = data.salary;
    this.status = data.status || 'active';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static async createIndexes(db) {
    const collection = db.collection('jobs');
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ createdAt: -1 });
    await collection.createIndex({ title: "text", description: "text" });
  }

  static async create(db, jobData) {
    const job = new Job(jobData);
    const collection = db.collection('jobs');
    
    await collection.insertOne(job);
    return job;
  }

  static async findById(db, id) {
    const collection = db.collection('jobs');
    return await collection.findOne({ id });
  }

  static async findAll(db, filter = {}) {
    const collection = db.collection('jobs');
    return await collection.find(filter).sort({ createdAt: -1 }).toArray();
  }

  static async findActiveJobs(db) {
    const collection = db.collection('jobs');
    return await collection.find({ status: 'active' }).sort({ createdAt: -1 }).toArray();
  }

  static async update(db, id, updateData) {
    const collection = db.collection('jobs');
    const updatedData = {
      ...updateData,
      updatedAt: new Date()
    };
    
    await collection.updateOne({ id }, { $set: updatedData });
    return await Job.findById(db, id);
  }

  static async updateStatus(db, id, status) {
    const collection = db.collection('jobs');
    const updatedData = {
      status,
      updatedAt: new Date()
    };
    
    await collection.updateOne({ id }, { $set: updatedData });
    return await Job.findById(db, id);
  }

  static async delete(db, id) {
    const collection = db.collection('jobs');
    const result = await collection.deleteOne({ id });
    return result.deletedCount > 0;
  }

  static async getJobsWithApplicationCount(db) {
    const collection = db.collection('jobs');
    const pipeline = [
      {
        $lookup: {
          from: 'job_applications',
          localField: 'id',
          foreignField: 'jobId',
          as: 'applications'
        }
      },
      {
        $addFields: {
          applicationsCount: { $size: '$applications' }
        }
      },
      {
        $project: {
          applications: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ];
    
    return await collection.aggregate(pipeline).toArray();
  }

  static validateJobData(data) {
    const errors = {};

    if (!data.title || data.title.trim().length === 0) {
      errors.title = 'Title is required';
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.description = 'Description is required';
    }

    if (!data.location || data.location.trim().length === 0) {
      errors.location = 'Location is required';
    }

    if (!data.type || data.type.trim().length === 0) {
      errors.type = 'Job type is required';
    }

    if (data.status && !['active', 'inactive'].includes(data.status)) {
      errors.status = 'Status must be either active or inactive';
    }

    if (data.requirements && !Array.isArray(data.requirements)) {
      errors.requirements = 'Requirements must be an array';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

module.exports = Job;
