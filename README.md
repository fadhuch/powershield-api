# Powershield API

Modular REST API for Powershield with Users and Gallery collections management.

## Features

- **Users Collection**: Complete CRUD operations for user management
- **Gallery Collection**: Image gallery management with categories, likes, and search
- **Contact Collection**: Contact form management with status tracking and admin features
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
│   │   └── Contact.js        # Contact model with CRUD operations
│   ├── controllers/
│   │   ├── userController.js # User business logic
│   │   ├── galleryController.js # Gallery business logic
│   │   └── contactController.js # Contact business logic
│   ├── routes/
│   │   ├── index.js          # Main router
│   │   ├── users.js          # User routes
│   │   ├── gallery.js        # Gallery routes
│   │   └── contacts.js       # Contact routes
│   └── middleware/
│       └── index.js          # Shared middleware
├── api/
│   └── index.js              # Vercel serverless function entry point
├── server.js                 # Local development server
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
```

3. **Start development server:**
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
