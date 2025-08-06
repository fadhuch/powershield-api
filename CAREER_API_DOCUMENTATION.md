# Power Shield Career Management API Documentation

This document provides comprehensive API specifications for the Career Management System backend implementation.

## Base URL
```
https://api.powershield.ae
```

## Authentication
Admin endpoints require authentication. Implementation can use JWT tokens, session-based auth, or API keys.

```javascript
// Example header for authenticated requests
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

---

## Public Endpoints

### 1. Get All Active Jobs
**GET** `/api/careers`

Fetches all active job listings for the public careers page.

**Response (200 OK):**
```json
[
  {
    "id": "job_001",
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
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "job_002",
    "title": "Electrical Technician",
    "description": "Looking for a skilled electrical technician with experience in emergency exit lighting and electrical installations in commercial buildings.",
    "location": "Abu Dhabi, UAE",
    "type": "Full-time",
    "experience": "2-4 years",
    "requirements": [
      "ITI/Diploma in Electrical Engineering",
      "UAE driving license",
      "Experience with emergency lighting systems",
      "Basic English communication skills"
    ],
    "salary": "AED 4,000 - 6,000",
    "status": "active",
    "createdAt": "2024-01-10T09:15:00Z",
    "updatedAt": "2024-01-10T09:15:00Z"
  }
]
```

### 2. Get Job Details
**GET** `/api/careers/{jobId}`

Fetches details of a specific job by ID.

**Response (200 OK):**
```json
{
  "id": "job_001",
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
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Job not found",
  "message": "No job found with the provided ID"
}
```

### 3. Submit Job Application
**POST** `/api/job-applications`

Submits a new job application with resume file upload.

**Content-Type:** `multipart/form-data`

**Request Body:**
```
firstName: "Ahmed"
lastName: "Al-Rashid"
email: "ahmed.rashid@email.com"
phone: "+971501234567"
address: "Dubai Marina, Dubai, UAE"
position: "Fire Safety Engineer"
linkedinUrl: "https://linkedin.com/in/ahmed-rashid"
coverLetter: "I am writing to express my strong interest in the Fire Safety Engineer position at Power Shield Technical Service LLC. With over 4 years of experience in fire protection systems and a Bachelor's degree in Fire Engineering, I am confident that I would be a valuable addition to your team..."
resume: [FILE] // PDF or DOC file
jobId: "job_001"
```

**Response (201 Created):**
```json
{
  "id": "app_001",
  "message": "Application submitted successfully",
  "applicationId": "app_001",
  "jobTitle": "Fire Safety Engineer",
  "submittedAt": "2024-01-20T14:30:00Z"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "message": "Invalid input data",
  "details": {
    "email": "Invalid email format",
    "resume": "Resume file is required"
  }
}
```

---

## Admin Endpoints

### 4. Get All Jobs (Admin)
**GET** `/api/admin/careers`

Fetches all jobs (active and inactive) for admin management.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
[
  {
    "id": "job_001",
    "title": "Fire Safety Engineer",
    "description": "We are seeking an experienced Fire Safety Engineer...",
    "location": "Dubai, UAE",
    "type": "Full-time",
    "experience": "3-5 years",
    "requirements": [
      "Bachelor's degree in Fire Engineering or related field",
      "3+ years experience in fire protection systems"
    ],
    "salary": "AED 8,000 - 12,000",
    "status": "active",
    "applicationsCount": 15,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "job_002",
    "title": "Electrical Technician",
    "description": "Looking for a skilled electrical technician...",
    "location": "Abu Dhabi, UAE",
    "type": "Full-time",
    "experience": "2-4 years",
    "requirements": [
      "ITI/Diploma in Electrical Engineering",
      "UAE driving license"
    ],
    "salary": "AED 4,000 - 6,000",
    "status": "inactive",
    "applicationsCount": 8,
    "createdAt": "2024-01-10T09:15:00Z",
    "updatedAt": "2024-01-18T16:45:00Z"
  }
]
```

### 5. Create New Job
**POST** `/api/admin/careers`

Creates a new job posting.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Plumbing Supervisor",
  "description": "We are seeking an experienced Plumbing Supervisor to oversee plumbing installations and maintenance projects in commercial buildings.",
  "location": "Sharjah, UAE",
  "type": "Full-time",
  "experience": "5-7 years",
  "requirements": [
    "Diploma in Plumbing or Mechanical Engineering",
    "5+ years supervisory experience in plumbing",
    "Knowledge of UAE plumbing codes and standards",
    "Valid UAE driving license"
  ],
  "salary": "AED 6,000 - 9,000",
  "status": "active"
}
```

**Response (201 Created):**
```json
{
  "id": "job_003",
  "title": "Plumbing Supervisor",
  "description": "We are seeking an experienced Plumbing Supervisor...",
  "location": "Sharjah, UAE",
  "type": "Full-time",
  "experience": "5-7 years",
  "requirements": [
    "Diploma in Plumbing or Mechanical Engineering",
    "5+ years supervisory experience in plumbing",
    "Knowledge of UAE plumbing codes and standards",
    "Valid UAE driving license"
  ],
  "salary": "AED 6,000 - 9,000",
  "status": "active",
  "createdAt": "2024-01-20T11:15:00Z",
  "updatedAt": "2024-01-20T11:15:00Z"
}
```

### 6. Update Job
**PUT** `/api/admin/careers/{jobId}`

Updates an existing job posting.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Senior Fire Safety Engineer",
  "description": "Updated job description with new responsibilities...",
  "location": "Dubai, UAE",
  "type": "Full-time",
  "experience": "5-8 years",
  "requirements": [
    "Bachelor's degree in Fire Engineering or related field",
    "5+ years experience in fire protection systems",
    "Civil Defence approval certificate",
    "Strong knowledge of NFPA standards",
    "Project management experience"
  ],
  "salary": "AED 10,000 - 15,000",
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "id": "job_001",
  "title": "Senior Fire Safety Engineer",
  "description": "Updated job description with new responsibilities...",
  "location": "Dubai, UAE",
  "type": "Full-time",
  "experience": "5-8 years",
  "requirements": [
    "Bachelor's degree in Fire Engineering or related field",
    "5+ years experience in fire protection systems",
    "Civil Defence approval certificate",
    "Strong knowledge of NFPA standards",
    "Project management experience"
  ],
  "salary": "AED 10,000 - 15,000",
  "status": "active",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:20:00Z"
}
```

### 7. Delete Job
**DELETE** `/api/admin/careers/{jobId}`

Deletes a job posting.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "message": "Job deleted successfully",
  "deletedJobId": "job_003"
}
```

**Response (404 Not Found):**
```json
{
  "error": "Job not found",
  "message": "No job found with the provided ID"
}
```

### 8. Update Job Status
**PATCH** `/api/admin/careers/{jobId}/status`

Updates the status of a job posting (active/inactive).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "inactive"
}
```

**Response (200 OK):**
```json
{
  "id": "job_001",
  "title": "Fire Safety Engineer",
  "status": "inactive",
  "message": "Job status updated successfully",
  "updatedAt": "2024-01-20T15:30:00Z"
}
```

### 9. Get All Applications (Admin)
**GET** `/api/admin/job-applications`

Fetches all job applications for admin review.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by application status (`pending`, `reviewed`, `shortlisted`, `rejected`)
- `jobId` (optional): Filter applications for a specific job
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example:** `/api/admin/job-applications?status=pending&page=1&limit=10`

**Response (200 OK):**
```json
{
  "applications": [
    {
      "id": "app_001",
      "firstName": "Ahmed",
      "lastName": "Al-Rashid",
      "email": "ahmed.rashid@email.com",
      "phone": "+971501234567",
      "address": "Dubai Marina, Dubai, UAE",
      "position": "Fire Safety Engineer",
      "linkedinUrl": "https://linkedin.com/in/ahmed-rashid",
      "coverLetter": "I am writing to express my strong interest...",
      "resumeUrl": "/uploads/resumes/app_001_resume.pdf",
      "jobId": "job_001",
      "jobTitle": "Fire Safety Engineer",
      "status": "pending",
      "submittedAt": "2024-01-20T14:30:00Z",
      "updatedAt": "2024-01-20T14:30:00Z"
    },
    {
      "id": "app_002",
      "firstName": "Sara",
      "lastName": "Mohammed",
      "email": "sara.mohammed@email.com",
      "phone": "+971509876543",
      "address": "Business Bay, Dubai, UAE",
      "position": "Electrical Technician",
      "linkedinUrl": "https://linkedin.com/in/sara-mohammed",
      "coverLetter": "With 3 years of experience in electrical systems...",
      "resumeUrl": "/uploads/resumes/app_002_resume.pdf",
      "jobId": "job_002",
      "jobTitle": "Electrical Technician",
      "status": "reviewed",
      "submittedAt": "2024-01-18T09:45:00Z",
      "updatedAt": "2024-01-19T11:20:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 10. Get Application Details
**GET** `/api/admin/job-applications/{applicationId}`

Fetches detailed information about a specific application.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
```json
{
  "id": "app_001",
  "firstName": "Ahmed",
  "lastName": "Al-Rashid",
  "email": "ahmed.rashid@email.com",
  "phone": "+971501234567",
  "address": "Dubai Marina, Dubai, UAE",
  "position": "Fire Safety Engineer",
  "linkedinUrl": "https://linkedin.com/in/ahmed-rashid",
  "coverLetter": "I am writing to express my strong interest in the Fire Safety Engineer position at Power Shield Technical Service LLC. With over 4 years of experience in fire protection systems and a Bachelor's degree in Fire Engineering, I am confident that I would be a valuable addition to your team. My experience includes designing and installing fire alarm systems, conducting fire risk assessments, and ensuring compliance with local fire safety regulations.",
  "resumeUrl": "/uploads/resumes/app_001_resume.pdf",
  "resumeFilename": "Ahmed_AlRashid_Resume.pdf",
  "jobId": "job_001",
  "jobTitle": "Fire Safety Engineer",
  "status": "pending",
  "submittedAt": "2024-01-20T14:30:00Z",
  "updatedAt": "2024-01-20T14:30:00Z",
  "notes": []
}
```

### 11. Update Application Status
**PATCH** `/api/admin/job-applications/{applicationId}/status`

Updates the status of a job application.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "shortlisted",
  "notes": "Candidate has excellent qualifications and experience. Schedule for interview."
}
```

**Response (200 OK):**
```json
{
  "id": "app_001",
  "status": "shortlisted",
  "notes": "Candidate has excellent qualifications and experience. Schedule for interview.",
  "message": "Application status updated successfully",
  "updatedAt": "2024-01-21T10:15:00Z"
}
```

### 12. Download Resume
**GET** `/api/admin/job-applications/{applicationId}/resume`

Downloads the resume file for a specific application.

**Headers:** `Authorization: Bearer <token>`

**Response (200 OK):**
- Content-Type: `application/pdf` or `application/msword`
- Content-Disposition: `attachment; filename="Ahmed_AlRashid_Resume.pdf"`
- Binary file data

**Response (404 Not Found):**
```json
{
  "error": "Resume not found",
  "message": "Resume file not found for this application"
}
```

---

## Database Schema

### Jobs Table
```sql
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
```

### Job Applications Table
```sql
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
```

---

## File Upload Configuration

### Resume Upload Requirements
- **Allowed formats:** PDF, DOC, DOCX
- **Maximum file size:** 5MB
- **Storage location:** `/uploads/resumes/`
- **Naming convention:** `{applicationId}_resume.{extension}`

### File Validation
```javascript
const allowedExtensions = ['.pdf', '.doc', '.docx'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

function validateResumeFile(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    throw new Error('Invalid file format. Only PDF, DOC, and DOCX files are allowed.');
  }
  if (file.size > maxFileSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": {
    "field": "Specific field error message"
  },
  "timestamp": "2024-01-20T15:30:00Z"
}
```

### HTTP Status Codes
- `200` OK - Request successful
- `201` Created - Resource created successfully
- `400` Bad Request - Invalid input data
- `401` Unauthorized - Authentication required
- `403` Forbidden - Insufficient permissions
- `404` Not Found - Resource not found
- `500` Internal Server Error - Server error

---

## Security Considerations

1. **File Upload Security**
   - Validate file types and sizes
   - Scan uploaded files for malware
   - Store files outside web root
   - Generate unique filenames

2. **Data Validation**
   - Sanitize all input data
   - Validate email formats
   - Validate phone numbers
   - Prevent SQL injection

3. **Authentication**
   - Implement JWT or session-based auth for admin routes
   - Use HTTPS for all communications
   - Implement rate limiting

4. **Privacy**
   - Hash or encrypt sensitive data
   - Implement data retention policies
   - Provide GDPR compliance features

---

## Implementation Notes

1. **Database Indexing**
   - Index job status for faster public queries
   - Index application status and job_id for admin queries
   - Index email for duplicate prevention

2. **Caching**
   - Cache active jobs for public API
   - Implement Redis for session management

3. **Email Notifications**
   - Send confirmation email to applicants
   - Notify admin of new applications
   - Send status updates to applicants

4. **Logging**
   - Log all admin actions
   - Monitor failed login attempts
   - Track application submissions

This API documentation provides a comprehensive guide for implementing the backend services for the Power Shield Career Management System.
