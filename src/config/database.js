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

  // Try multiple connection configurations for better compatibility
  const connectionConfigs = [
    // Configuration 1: Standard MongoDB Atlas with flexible SSL
    {
      name: 'Standard Atlas Connection',
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
        w: 'majority',
        // More flexible SSL settings for production
        tls: true,
        tlsInsecure: false, // Allow self-signed certificates in some environments
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
      }
    },
    // Configuration 2: Relaxed SSL for problematic environments
    {
      name: 'Relaxed SSL Connection',
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
        w: 'majority',
        // More lenient SSL settings
        ssl: true,
        sslValidate: false,
        tlsInsecure: true,
      }
    },
    // Configuration 3: Basic connection for environments with SSL issues
    {
      name: 'Basic Connection',
      options: {
        serverSelectionTimeoutMS: 30000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 30000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
        w: 'majority',
      }
    }
  ]

  let lastError = null

  for (const config of connectionConfigs) {
    try {
      console.log(`🔗 Attempting ${config.name}...`)
      
      const client = new MongoClient(MONGODB_URI, config.options)
      
      await client.connect()
      
      // Test the connection
      await client.db('admin').command({ ping: 1 })
      
      const db = client.db(DB_NAME)
      
      cachedClient = client
      cachedDb = db
      
      console.log(`✅ Connected to MongoDB Atlas successfully using ${config.name}`)
      
      // Create indexes for better performance
      await createIndexes(db)
      
      return { client, db }
    } catch (error) {
      console.warn(`⚠️ ${config.name} failed:`, error.message)
      lastError = error
      continue
    }
  }

  // If all configurations failed, provide comprehensive error info
  console.error('❌ All MongoDB connection attempts failed!')
  console.error('Last error:', lastError?.message)
  
  // Provide specific troubleshooting based on error type
  if (lastError?.message.includes('SSL') || lastError?.message.includes('TLS')) {
    console.error('\n💡 SSL/TLS Connection Troubleshooting:')
    console.error('1. 🔗 Check MongoDB Atlas Connection String:')
    console.error('   - Should start with mongodb+srv://')
    console.error('   - Include ?retryWrites=true&w=majority at the end')
    console.error('2. 🌐 Network Access in MongoDB Atlas:')
    console.error('   - Add 0.0.0.0/0 to IP whitelist for testing')
    console.error('   - Or add your server\'s specific IP address')
    console.error('3. 🔐 Database User Permissions:')
    console.error('   - Ensure user has readWrite permissions')
    console.error('   - Check username/password in connection string')
    console.error('4. 🏢 Production Environment Issues:')
    console.error('   - Some hosting providers block certain SSL configurations')
    console.error('   - Try adding &ssl_cert_reqs=CERT_NONE to your connection string')
    console.error('   - Contact your hosting provider about MongoDB Atlas connectivity')
    console.error('5. 🔄 Alternative Connection String Format:')
    console.error('   Try: mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE')
  } else if (lastError?.message.includes('authentication')) {
    console.error('\n💡 Authentication Error Troubleshooting:')
    console.error('1. Check username and password in connection string')
    console.error('2. Ensure database user exists in MongoDB Atlas')
    console.error('3. Verify user has correct database permissions')
  } else if (lastError?.message.includes('timeout') || lastError?.message.includes('ENOTFOUND')) {
    console.error('\n💡 Network/Timeout Error Troubleshooting:')
    console.error('1. Check internet connectivity')
    console.error('2. Verify MongoDB cluster is running (not paused)')
    console.error('3. Check firewall/security group settings')
    console.error('4. Try from a different network')
  }
  
  throw lastError
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
