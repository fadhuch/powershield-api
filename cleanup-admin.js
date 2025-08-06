const { connectToDatabase } = require('./src/config/database');

async function cleanupAndRecreate() {
  try {
    const { db } = await connectToDatabase();
    console.log('🔧 Connected to database');
    
    // Delete existing admin users
    const deleteResult = await db.collection('admin_users').deleteMany({});
    console.log(`🗑️ Deleted ${deleteResult.deletedCount} existing admin users`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanupAndRecreate();
