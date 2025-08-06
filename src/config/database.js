const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME || 'powershield'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required')
  process.exit(1)
}

// Global connection variable for serverless
let cachedClient = null
let cachedDb = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    })
    await client.connect()
    const db = client.db(DB_NAME)
    
    cachedClient = client
    cachedDb = db
    
    console.log('✅ Connected to MongoDB Atlas')
    
    // Create indexes for better performance
    await createIndexes(db)
    console.log('✅ Database indexes created')
    
    return { client, db }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
}

async function createIndexes(db) {
  try {
    // Create indexes for users collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    
    // Create indexes for gallery collection
    await db.collection('gallery').createIndex({ createdAt: -1 })
    await db.collection('gallery').createIndex({ title: 'text', description: 'text' })
    await db.collection('gallery').createIndex({ category: 1 })
    
    // Create indexes for contacts collection
    await db.collection('contacts').createIndex({ createdAt: -1 })
    await db.collection('contacts').createIndex({ status: 1 })
    await db.collection('contacts').createIndex({ email: 1 })
    await db.collection('contacts').createIndex({ name: 'text', email: 'text', message: 'text' })
    
    // Create indexes for jobs collection
    await db.collection('jobs').createIndex({ status: 1 })
    await db.collection('jobs').createIndex({ createdAt: -1 })
    await db.collection('jobs').createIndex({ title: "text", description: "text" })
    
    // Create indexes for job_applications collection
    await db.collection('job_applications').createIndex({ jobId: 1 })
    await db.collection('job_applications').createIndex({ email: 1 })
    await db.collection('job_applications').createIndex({ status: 1 })
    await db.collection('job_applications').createIndex({ createdAt: -1 })
    await db.collection('job_applications').createIndex({ firstName: "text", lastName: "text", email: "text", skills: "text" })

    // Create indexes for admin_users collection
    await db.collection('admin_users').createIndex({ username: 1 }, { unique: true })
    await db.collection('admin_users').createIndex({ email: 1 }, { unique: true })
    await db.collection('admin_users').createIndex({ role: 1 })
    await db.collection('admin_users').createIndex({ isActive: 1 })
    
    console.log('✅ Database indexes created')
  } catch (error) {
    console.warn('⚠️ Index creation warning:', error.message)
  }
}

function getDb() {
  if (!cachedDb) {
    throw new Error('Database not connected. Call connectToDatabase first.')
  }
  return cachedDb
}

module.exports = { connectToDatabase, getDb };
