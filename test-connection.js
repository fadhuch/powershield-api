import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.DB_NAME || 'powershield'

async function testConnection() {
  console.log('🧪 Testing MongoDB Connection...')
  console.log('📋 Connection Details:')
  console.log(`   URI: ${MONGODB_URI ? MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'NOT SET'}`)
  console.log(`   Database: ${DB_NAME}`)
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set')
    console.error('💡 Please check your .env file')
    process.exit(1)
  }

  // Test multiple connection configurations
  const connectionConfigs = [
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
        tls: true,
        tlsInsecure: false,
        tlsAllowInvalidCertificates: false,
        tlsAllowInvalidHostnames: false,
      }
    },
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
        ssl: true,
        sslValidate: false,
        tlsInsecure: true,
      }
    },
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

  for (const config of connectionConfigs) {
    let client
    
    try {
      console.log(`\n🔗 Testing ${config.name}...`)
      
      client = new MongoClient(MONGODB_URI, config.options)
      
      await client.connect()
      console.log('✅ Successfully connected to MongoDB!')
      
      // Test database access
      console.log('📊 Testing database access...')
      const db = client.db(DB_NAME)
      await db.command({ ping: 1 })
      console.log('✅ Database ping successful!')
      
      // List collections
      console.log('📁 Available collections:')
      const collections = await db.listCollections().toArray()
      if (collections.length === 0) {
        console.log('   No collections found (this is normal for a new database)')
      } else {
        collections.forEach(col => console.log(`   - ${col.name}`))
      }
      
      // Test write operation
      console.log('✍️  Testing write operation...')
      const testCollection = db.collection('connection_test')
      const testDoc = { 
        message: 'Connection test', 
        timestamp: new Date(),
        testId: Math.random().toString(36).substr(2, 9),
        config: config.name
      }
      
      const result = await testCollection.insertOne(testDoc)
      console.log(`✅ Write test successful! Document ID: ${result.insertedId}`)
      
      // Clean up test document
      await testCollection.deleteOne({ _id: result.insertedId })
      console.log('🧹 Test document cleaned up')
      
      console.log(`\n🎉 Connection successful with ${config.name}!`)
      console.log('💡 Use this configuration in your production environment')
      
      await client.close()
      return // Exit on first successful connection
      
    } catch (error) {
      console.error(`❌ ${config.name} failed:`, error.message)
      
      if (client) {
        try {
          await client.close()
        } catch (closeError) {
          // Ignore close errors
        }
      }
      
      // Continue to next configuration
      continue
    }
  }

  // If we get here, all configurations failed
  console.error('\n💥 All connection configurations failed!')
  console.error('\n� Production SSL Troubleshooting Guide:')
  console.error('1. 🌐 Update your MongoDB connection string to include SSL parameters:')
  console.error('   mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE')
  console.error('\n2. 🏢 For hosting providers (Vercel, Heroku, etc.):')
  console.error('   - Some providers have strict SSL certificate validation')
  console.error('   - Try adding &tlsInsecure=true to your connection string')
  console.error('   - Contact support about MongoDB Atlas connectivity')
  console.error('\n3. � MongoDB Atlas Settings:')
  console.error('   - Network Access: Add 0.0.0.0/0 (allow all IPs) for testing')
  console.error('   - Database Access: Ensure user has readWrite permissions')
  console.error('   - Cluster: Make sure it\'s not paused')
  console.error('\n4. � Alternative: Try MongoDB connection string without srv:')
  console.error('   mongodb://user:pass@cluster-shard-00-00.mongodb.net:27017,cluster-shard-00-01.mongodb.net:27017,cluster-shard-00-02.mongodb.net:27017/dbname?ssl=true&replicaSet=atlas-xxx&authSource=admin&retryWrites=true&w=majority')
  
  process.exit(1)
}

// Run the test
testConnection().catch(console.error)
