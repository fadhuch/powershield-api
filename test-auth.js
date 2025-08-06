const { connectToDatabase } = require('./src/config/database');
const AdminUser = require('./src/models/AdminUser');

async function testAuth() {
  try {
    const { db } = await connectToDatabase();
    console.log('Connected to DB');
    
    // Find the admin user
    const adminUser = await db.collection('admin_users').findOne({ username: 'admin' });
    console.log('Found admin user:', {
      id: adminUser?.id,
      username: adminUser?.username,
      email: adminUser?.email,
      role: adminUser?.role,
      isActive: adminUser?.isActive,
      hasPassword: !!adminUser?.hashedPassword
    });
    
    // Test authentication
    const authResult = await AdminUser.authenticate(db, 'admin', 'Admin@1234');
    console.log('Authentication result:', authResult);
    
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

testAuth();
