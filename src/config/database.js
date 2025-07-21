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
      serverSelectionTimeoutMS: 30000, // Increased timeout
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      w: 'majority',
      // SSL/TLS configuration
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      // Additional options for better connection stability
      compressors: ['snappy', 'zlib'],
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
      // Handle connection issues
    })
    
    console.log('🔗 Attempting to connect to MongoDB Atlas...')
    await client.connect()
    
    // Test the connection
    await client.db('admin').command({ ping: 1 })
    
    const db = client.db(DB_NAME)
    
    cachedClient = client
    cachedDb = db
    
    console.log('✅ Connected to MongoDB Atlas successfully')
    
    // Create indexes for better performance
    await createIndexes(db)
    
    return { client, db }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message)
    
    // Provide more specific error guidance
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('💡 SSL/TLS Error Troubleshooting:')
      console.error('   1. Check your MongoDB Atlas connection string')
      console.error('   2. Ensure your IP address is whitelisted in Atlas')
      console.error('   3. Verify your cluster is running and accessible')
      console.error('   4. Try using a different network connection')
    }
    
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
