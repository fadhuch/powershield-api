const { connectToDatabase } = require('./src/config/database');
const AdminUser = require('./src/models/AdminUser');

async function createInitialAdmin() {
  try {
    console.log('🔧 Creating initial admin user...');
    
    const { db } = await connectToDatabase();
    
    // Check if any admin users exist
    const existingAdmins = await AdminUser.findAll(db);
    
    if (existingAdmins.length > 0) {
      console.log('✅ Admin users already exist. Skipping creation.');
      console.log('Existing admins:', existingAdmins.map(admin => ({
        username: admin.username,
        email: admin.email,
        role: admin.role
      })));
      process.exit(0);
    }
    
    // Create initial admin user
    const initialAdmin = await AdminUser.create(db, {
      username: 'admin',
      email: 'admin@powershield.ae',
      password: 'Admin@1234',
      role: 'super_admin'
    });
    
    console.log('✅ Initial admin user created successfully!');
    console.log('📋 Admin Details:');
    console.log(`   Username: ${initialAdmin.username}`);
    console.log(`   Email: ${initialAdmin.email}`);
    console.log(`   Role: ${initialAdmin.role}`);
    console.log('   Password: Admin@1234');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    console.log('');
    console.log('🔑 Login endpoint: POST /api/admin/login');
    console.log('   Body: { "username": "admin", "password": "Admin@1234" }');
    console.log('   Or:   { "email": "admin@powershield.ae", "password": "Admin@1234" }');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating initial admin:', error.message);
    process.exit(1);
  }
}

createInitialAdmin();
