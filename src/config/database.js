import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME || 'powershield'

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required')
  process.exit(1)
}

// Global connection variable for serverless
let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      minPoolSize: 2,
    })
    
    await client.connect()
    const db = client.db(DB_NAME)
    
    cachedClient = client
    cachedDb = db
    
    console.log('✅ Connected to MongoDB Atlas')
    
    // Create indexes for better performance
    await createIndexes(db)
    
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
    
    console.log('✅ Database indexes created')
  } catch (error) {
    console.warn('⚠️ Index creation warning:', error.message)
  }
}

export function getDb() {
  if (!cachedDb) {
    throw new Error('Database not connected. Call connectToDatabase first.')
  }
  return cachedDb
}

export default { connectToDatabase, getDb }
