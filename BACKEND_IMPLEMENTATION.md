# Backend Implementation Example

This directory contains example backend implementations for the Career Management API endpoints.

## Node.js/Express Implementation

### Prerequisites
```bash
npm install express multer cors bcryptjs jsonwebtoken uuid
```

### File Structure
```
backend/
├── app.js
├── routes/
│   ├── careers.js
│   └── admin/
│       ├── careers.js
│       └── applications.js
├── middleware/
│   ├── auth.js
│   └── upload.js
├── models/
│   ├── Job.js
│   └── Application.js
└── uploads/
    └── resumes/
```

### Example Implementation Files

See the following files for complete implementation examples:
- `backend-example/app.js` - Main Express server setup
- `backend-example/routes/careers.js` - Public career endpoints
- `backend-example/routes/admin/careers.js` - Admin job management
- `backend-example/routes/admin/applications.js` - Admin application management
- `backend-example/middleware/auth.js` - Authentication middleware
- `backend-example/middleware/upload.js` - File upload middleware

### Database Setup (MySQL)

```sql
-- Create database
CREATE DATABASE powershield_careers;
USE powershield_careers;

-- Jobs table
CREATE TABLE jobs (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  experience VARCHAR(100),
  requirements JSON,
  salary VARCHAR(100),
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Job applications table
CREATE TABLE job_applications (
  id VARCHAR(50) PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  position VARCHAR(255) NOT NULL,
  linkedin_url VARCHAR(500),
  cover_letter TEXT NOT NULL,
  resume_url VARCHAR(500) NOT NULL,
  resume_filename VARCHAR(255) NOT NULL,
  job_id VARCHAR(50) NOT NULL,
  status ENUM('pending', 'reviewed', 'shortlisted', 'rejected') DEFAULT 'pending',
  notes TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Admin users table (optional - for authentication)
CREATE TABLE admin_users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'hr') DEFAULT 'hr',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample admin user (password: 'admin123')
INSERT INTO admin_users (id, username, email, password_hash, role) VALUES 
('admin_001', 'admin', 'admin@powershield.ae', '$2a$10$rOOl1NkwT4pVTu4zGWr.5eD5zl7YtXqZ8vDy1fz0n6yMHnFyKyZgm', 'admin');

-- Sample jobs data
INSERT INTO jobs (id, title, description, location, type, experience, requirements, salary, status) VALUES 
('job_001', 'Fire Safety Engineer', 'We are seeking an experienced Fire Safety Engineer to join our team. The successful candidate will be responsible for designing, installing, and maintaining fire protection systems.', 'Dubai, UAE', 'Full-time', '3-5 years', '["Bachelor degree in Fire Engineering or related field", "3+ years experience in fire protection systems", "Civil Defence approval certificate", "Strong knowledge of NFPA standards"]', 'AED 8,000 - 12,000', 'active'),
('job_002', 'Electrical Technician', 'Looking for a skilled electrical technician with experience in emergency exit lighting and electrical installations in commercial buildings.', 'Abu Dhabi, UAE', 'Full-time', '2-4 years', '["ITI/Diploma in Electrical Engineering", "UAE driving license", "Experience with emergency lighting systems", "Basic English communication skills"]', 'AED 4,000 - 6,000', 'active');
```

### Environment Variables (.env)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=powershield_careers

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# File Upload Configuration
UPLOAD_DIR=uploads/resumes
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=.pdf,.doc,.docx

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@powershield.ae
SMTP_PASSWORD=your_email_password
```

### Package.json

```json
{
  "name": "powershield-careers-api",
  "version": "1.0.0",
  "description": "Career Management API for Power Shield Technical Service LLC",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.0",
    "multer": "^1.4.5-lts.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^9.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.10.0",
    "nodemailer": "^6.9.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### Running the Backend

1. Install dependencies:
```bash
npm install
```

2. Set up MySQL database and run the SQL setup script

3. Create `.env` file with your configuration

4. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Testing Endpoints

Use the provided Postman collection or test the endpoints manually:

1. **Get active jobs**: `GET http://localhost:3001/api/careers`
2. **Submit application**: `POST http://localhost:3001/api/job-applications` (with form data)
3. **Admin login**: `POST http://localhost:3001/api/admin/login`
4. **Admin get jobs**: `GET http://localhost:3001/api/admin/careers` (with Bearer token)

### Production Deployment

For production deployment:
1. Set `NODE_ENV=production` in environment variables
2. Use a process manager like PM2
3. Set up reverse proxy with Nginx
4. Configure SSL certificates
5. Set up database backup and monitoring
6. Configure log rotation
