#!/usr/bin/env node

console.log('🔧 MongoDB Atlas Production SSL Configuration Helper')
console.log('='.repeat(60))

const solutions = [
  {
    title: '1. 🌐 Connection String with SSL Bypass',
    description: 'Add SSL parameters to bypass certificate validation',
    solution: 'Add these parameters to your connection string:',
    example: '&ssl_cert_reqs=CERT_NONE&tlsInsecure=true&tlsAllowInvalidCertificates=true',
    fullExample: 'mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE&tlsInsecure=true'
  },
  {
    title: '2. 🏢 Vercel/Netlify Specific Configuration',
    description: 'For serverless deployments that have SSL issues',
    solution: 'Set these environment variables in your hosting platform:',
    example: 'MONGODB_URI with additional parameters',
    fullExample: 'mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority&ssl=true&sslValidate=false'
  },
  {
    title: '3. 🔄 Alternative Connection Format',
    description: 'Use direct connection instead of SRV record',
    solution: 'Replace mongodb+srv:// with mongodb:// and specify all nodes:',
    example: 'Get connection details from MongoDB Atlas',
    fullExample: 'mongodb://user:pass@shard1.mongodb.net:27017,shard2.mongodb.net:27017/dbname?ssl=true&replicaSet=atlas-xxx&authSource=admin'
  },
  {
    title: '4. 📱 Environment Variables for Production',
    description: 'Set these in your production environment',
    solution: 'Add these environment variables:',
    example: `
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority&ssl_cert_reqs=CERT_NONE
DB_NAME=powershield
NODE_ENV=production
    `,
    fullExample: 'Use your hosting platform\'s environment variable settings'
  }
]

console.log('\n🚨 Production SSL Issues - Common Solutions:\n')

solutions.forEach(solution => {
  console.log(solution.title)
  console.log('-'.repeat(solution.title.length - 4)) // Adjust for emoji
  console.log(`📝 ${solution.description}`)
  console.log(`💡 ${solution.solution}`)
  if (solution.example && !solution.example.includes('MONGODB_URI=')) {
    console.log(`📋 Parameters: ${solution.example}`)
  }
  console.log(`🔗 Example: ${solution.fullExample}`)
  console.log('')
})

console.log('🔍 MongoDB Atlas Checklist:')
console.log('  ✓ Network Access: 0.0.0.0/0 added (for testing)')
console.log('  ✓ Database User: Has readWrite permissions')
console.log('  ✓ Cluster Status: Running (not paused)')
console.log('  ✓ Connection String: Includes database name')
console.log('')

console.log('🏃‍♂️ Quick Test Commands:')
console.log('  npm run test-connection  # Test your current configuration')
console.log('  npm run dev              # Start development server')
console.log('')

console.log('🆘 If nothing works:')
console.log('  1. Contact your hosting provider about MongoDB Atlas connectivity')
console.log('  2. Try a different MongoDB hosting service temporarily')
console.log('  3. Use MongoDB Community Edition locally for development')
console.log('  4. Check MongoDB Atlas status page for service issues')
console.log('')

console.log('📧 Need more help? Check MongoDB documentation:')
console.log('  https://docs.mongodb.com/manual/reference/connection-string/')
console.log('  https://docs.atlas.mongodb.com/troubleshoot-connection/')
