# Powershield API

Modular REST API for Powershield with comprehensive collection management including Users, Gallery, Contacts, and Career Management.

## Features

- **Users Collection**: Complete CRUD operations for user management
- **Gallery Collection**: Image gallery management with categories, likes, and search
- **Contact Collection**: Contact form management with status tracking and admin features
- **Career Management**: Job postings, applications, and admin user management
- **JWT Authentication**: Secure admin authentication for career management
- **Modular Architecture**: Clean separation of concerns with controllers, models, and routes
- **MongoDB Atlas integration** with connection caching for serverless
- **CORS configured** for production and development
- **Error handling** and request logging middleware
- **Pagination and filtering** for all collections

## Architecture

```
├── src/
│   ├── config/
│   │   └── database.js        # Database configuration and connection
│   ├── models/
│   │   ├── User.js           # User model with CRUD operations
│   │   ├── Gallery.js        # Gallery model with CRUD operations
│   │   ├── Contact.js        # Contact model with CRUD operations
│   │   ├── Job.js            # Job model for career management
│   │   ├── JobApplication.js # Job application model
│   │   └── AdminUser.js      # Admin user model for authentication
│   ├── controllers/
│   │   ├── userController.js # User business logic
│   │   ├── galleryController.js # Gallery business logic
│   │   ├── contactController.js # Contact business logic
│   │   ├── jobController.js  # Job management logic
│   │   ├── jobApplicationController.js # Application management logic
│   │   └── adminUserController.js # Admin user management logic
│   ├── routes/
│   │   ├── index.js          # Main router
│   │   ├── users.js          # User routes
│   │   ├── gallery.js        # Gallery routes
│   │   ├── contacts.js       # Contact routes
│   │   ├── jobs.js           # Job management routes
│   │   ├── applications.js   # Application management routes
│   │   └── admin.js          # Admin user routes
│   └── middleware/
│       ├── index.js          # Shared middleware
│       └── auth.js           # JWT authentication middleware
├── api/
│   └── index.js              # Vercel serverless function entry point
├── server.js                 # Local development server
├── create-admin.js           # Script to create initial admin user
└── package.json
```

## Local Development

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration:
# MONGODB_URI=your_mongodb_connection_string
# DB_NAME=powershield (optional, defaults to 'powershield')
# NODE_ENV=development
# JWT_SECRET=your_jwt_secret_key_here
```

3. **Create initial admin user:**
```bash
npm run create-admin
```

4. **Start development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:5001`

## API Endpoints

### General
- `GET /api/health` - Health check and database status

### Users Collection (`/api/users`)
- `POST /api/users` - Create a new user
- `GET /api/users` - Get all users (with pagination)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/check-email` - Check if email exists
- `GET /api/users/stats` - Get user statistics

### Gallery Collection (`/api/gallery`)
- `POST /api/gallery` - Create a new gallery item
- `GET /api/gallery` - Get all gallery items (with pagination and filtering)
- `GET /api/gallery/:id` - Get gallery item by ID (increments view count)
- `PUT /api/gallery/:id` - Update gallery item
- `DELETE /api/gallery/:id` - Delete gallery item
- `GET /api/gallery/category/:category` - Get items by category
- `GET /api/gallery/featured` - Get featured items
- `GET /api/gallery/search?q=term` - Search gallery items
- `POST /api/gallery/:id/like` - Toggle like on gallery item
- `GET /api/gallery/stats` - Get gallery statistics

### Contact Collection (`/api/contacts`)
- `POST /api/contacts` - Send contact message (Public)
- `GET /api/contacts` - Get all contacts (Admin)
- `GET /api/contacts/:id` - Get contact by ID (Admin)
- `PUT /api/contacts/:id/status` - Update contact status (Admin)
- `PUT /api/contacts/:id/reply` - Mark contact as replied (Admin)
- `PUT /api/contacts/:id/archive` - Archive contact (Admin)
- `DELETE /api/contacts/:id` - Delete contact (Admin)
- `GET /api/contacts/status/:status` - Get contacts by status (Admin)
- `GET /api/contacts/search?q=term` - Search contacts (Admin)
- `GET /api/contacts/stats` - Get contact statistics (Admin)
- `GET /api/contacts/unread-count` - Get unread message count (Admin)

### Career Management

#### Jobs (`/api/jobs`)
**Public Routes:**
- `GET /api/jobs/public` - Get all active jobs (Public)
- `GET /api/jobs/public/:id` - Get job details by ID (Public)

**Admin Routes:** (Require Authentication)
- `GET /api/jobs` - Get all jobs with application counts (Admin)
- `GET /api/jobs/:id` - Get job by ID (Admin)
- `POST /api/jobs` - Create new job posting (Admin)
- `PUT /api/jobs/:id` - Update job posting (Admin)
- `PATCH /api/jobs/:id/status` - Update job status (Admin)
- `DELETE /api/jobs/:id` - Delete job posting (Admin)

#### Job Applications (`/api/applications`)
**Public Routes:**
- `POST /api/applications` - Submit job application (Public)

**Admin Routes:** (Require Authentication)
- `GET /api/applications` - Get all applications (Admin)
- `GET /api/applications/grouped-by-job` - Get applications grouped by job with statistics (Admin)
- `GET /api/applications/:id` - Get application by ID (Admin)
- `GET /api/applications/job/:jobId` - Get applications for specific job (Admin)
- `GET /api/applications/status/:status` - Get applications by status (Admin)
- `GET /api/applications/statistics` - Get application statistics (Admin)
- `PUT /api/applications/:id` - Update application (Admin)
- `PATCH /api/applications/:id/status` - Update application status (Admin)
- `DELETE /api/applications/:id` - Delete application (Admin)

#### Admin Users (`/api/admin`)
- `POST /api/admin/login` - Admin login (returns JWT token)
- `GET /api/admin/me` - Get current admin user info (Auth required)
- `POST /api/admin` - Create new admin user (Super Admin only)
- `GET /api/admin` - Get all admin users (Auth required)
- `GET /api/admin/:id` - Get admin user by ID (Auth required)
- `PUT /api/admin/:id` - Update admin user (Auth required)
- `PATCH /api/admin/:id/status` - Update admin user status (Super Admin only)
- `DELETE /api/admin/:id` - Delete admin user (Super Admin only)

## Authentication

Career management admin routes require JWT authentication. Include the token in the request header:

```
Authorization: Bearer <your_jwt_token>
```

```bash
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@1234"
}
```

## Query Parameters

### Pagination (Users, Gallery & Contacts)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50 for users/contacts, 20 for gallery, max: 100)
- `sortBy` - Field to sort by (default: 'createdAt')
- `sortOrder` - 'asc' or 'desc' (default: 'desc')

### Gallery Specific
- `category` - Filter by category
- `status` - Filter by status (default: 'active')
- `search` - Text search in title and description

### Contacts Specific
- `status` - Filter by status ('unread', 'read', 'replied', 'archived')
- `search` - Text search in name, email, and message

## Request/Response Examples

### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe"
}
```

### Create Gallery Item
```bash
POST /api/gallery
Content-Type: application/json

{
  "title": "Beautiful Sunset",
  "description": "A stunning sunset over the mountains",
  "imageUrl": "https://example.com/sunset.jpg",
  "category": "nature",
  "featured": true
}
```

### Send Contact Message
```bash
POST /api/contacts
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I would like to know more about your services. Please contact me back."
}
```

### Get Users with Pagination
```bash
GET /api/users?page=1&limit=25&sortBy=createdAt&sortOrder=desc
```

### Search Gallery Items
```bash
GET /api/gallery/search?q=sunset&page=1&limit=10
```

### Search Contact Messages (Admin)
```bash
GET /api/contacts/search?q=john&page=1&limit=10
```

### Career Management Examples

#### Create Job Posting (Admin)
```bash
POST /api/jobs
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Fire Safety Engineer",
  "description": "We are seeking an experienced Fire Safety Engineer to join our team. The successful candidate will be responsible for designing, installing, and maintaining fire protection systems.",
  "location": "Dubai, UAE",
  "type": "Full-time",
  "experience": "3-5 years",
  "requirements": [
    "Bachelor's degree in Fire Engineering or related field",
    "3+ years experience in fire protection systems",
    "Civil Defence approval certificate",
    "Strong knowledge of NFPA standards"
  ],
  "salary": "AED 8,000 - 12,000",
  "status": "active"
}
```

#### Submit Job Application (Public)
```bash
POST /api/applications
Content-Type: application/json

{
  "jobId": "job_001",
  "fullName": "Ahmed Al-Rashid",
  "email": "ahmed.rashid@email.com",
  "phone": "+971501234567",
  "location": "Dubai, UAE",
  "experience": "4 years",
  "skills": ["Fire Safety Systems", "NFPA Standards", "Risk Assessment"],
  "coverLetter": "I am writing to express my strong interest in the Fire Safety Engineer position...",
  "linkedinProfile": "https://linkedin.com/in/ahmed-rashid",
  "portfolioUrl": "https://ahmed-portfolio.com"
}
```

#### Admin Login
```bash
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@1234"
}

# Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "admin_001",
      "username": "admin",
      "email": "admin@powershield.ae",
      "role": "super_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Unread Contacts (Admin)
```bash
GET /api/contacts/status/unread?page=1&limit=25
```

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  email: String (required, unique),
  name: String,
  createdAt: Date,
  updatedAt: Date,
  ipAddress: String,
  userAgent: String
}
```

### Gallery Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  imageUrl: String (required),
  category: String (default: 'uncategorized'),
  featured: Boolean (default: false),
  status: String (default: 'active'),
  views: Number (default: 0),
  likes: Number (default: 0),
  uploadedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  ipAddress: String,
  userAgent: String
}
```

### Contact Model
```javascript
{
  _id: ObjectId,
  name: String (required, min: 2 chars),
  email: String (required, valid email),
  message: String (required, min: 10 chars),
  status: String (default: 'unread', values: 'unread', 'read', 'replied', 'archived'),
  createdAt: Date,
  updatedAt: Date,
  ipAddress: String,
  userAgent: String
}
```

## Database Indexes

The API automatically creates the following indexes for optimal performance:

### Users Collection
- `email` (unique index)

### Gallery Collection
- `createdAt` (descending)
- `title, description` (text index for search)
- `category` (single field index)

### Contacts Collection
- `createdAt` (descending)
- `status` (single field index)
- `email` (single field index)
- `name, email, message` (text index for search)

## Environment Variables

Required environment variables:

- `MONGODB_URI` - Your MongoDB Atlas connection string
- `DB_NAME` - Database name (optional, defaults to 'powershield')
- `NODE_ENV` - 'development' or 'production'
- `PORT` - Port number for local development (optional, defaults to 5001)

## Deployment

### Vercel (Serverless)

This project is configured for Vercel deployment with serverless functions.

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Set environment variables** in Vercel dashboard
3. **Deploy:**
```bash
vercel
```

### Traditional Hosting

For traditional hosting platforms, use:
```bash
npm start
```

## Error Handling

The API includes comprehensive error handling:

- **400** - Bad Request (validation errors)
- **404** - Not Found (resource doesn't exist)
- **409** - Conflict (duplicate entries)
- **500** - Internal Server Error

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

## Logging

The API includes request logging that logs all incoming requests with timestamps, methods, and paths.

## Performance Features

- Connection caching for serverless environments
- Database indexes for fast queries
- Pagination to limit response sizes
- Text search capabilities
- View and like tracking with atomic operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT
