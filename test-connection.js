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

  let client

  try {
    console.log('\n🔗 Attempting connection with enhanced settings...')
    
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority',
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
      compressors: ['snappy', 'zlib'],
      maxIdleTimeMS: 30000,
      heartbeatFrequencyMS: 10000,
    })
    
    await client.connect()
    console.log('✅ Successfully connected to MongoDB!')
    
    // Test database access
    console.log('\n📊 Testing database access...')
    const db = client.db(DB_NAME)
    await db.command({ ping: 1 })
    console.log('✅ Database ping successful!')
    
    // List collections
    console.log('\n📁 Available collections:')
    const collections = await db.listCollections().toArray()
    if (collections.length === 0) {
      console.log('   No collections found (this is normal for a new database)')
    } else {
      collections.forEach(col => console.log(`   - ${col.name}`))
    }
    
    // Test write operation
    console.log('\n✍️  Testing write operation...')
    const testCollection = db.collection('connection_test')
    const testDoc = { 
      message: 'Connection test', 
      timestamp: new Date(),
      testId: Math.random().toString(36).substr(2, 9)
    }
    
    const result = await testCollection.insertOne(testDoc)
    console.log(`✅ Write test successful! Document ID: ${result.insertedId}`)
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId })
    console.log('🧹 Test document cleaned up')
    
    console.log('\n🎉 All tests passed! Your MongoDB connection is working properly.')
    
  } catch (error) {
    console.error('\n❌ Connection test failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.error('\n💡 SSL/TLS Troubleshooting Tips:')
      console.error('1. Verify your MongoDB Atlas connection string is correct')
      console.error('2. Check that your IP address is whitelisted in MongoDB Atlas')
      console.error('3. Ensure your cluster is running and not paused')
      console.error('4. Try connecting from a different network')
      console.error('5. Check if your firewall/antivirus is blocking the connection')
    } else if (error.message.includes('authentication')) {
      console.error('\n💡 Authentication Troubleshooting Tips:')
      console.error('1. Check your username and password in the connection string')
      console.error('2. Verify the database user has the correct permissions')
      console.error('3. Ensure the user is assigned to the correct database')
    } else if (error.message.includes('timeout')) {
      console.error('\n💡 Timeout Troubleshooting Tips:')
      console.error('1. Check your internet connection')
      console.error('2. Try increasing the timeout values')
      console.error('3. Verify MongoDB Atlas cluster is accessible')
    }
    
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
      console.log('🔐 Connection closed')
    }
  }
}

// Run the test
testConnection().catch(console.error)
