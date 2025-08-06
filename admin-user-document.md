# Admin User MongoDB Document

This document shows the structure of an admin user document in MongoDB.

## Default Admin User

The system comes with a default admin user that can be created using the `create-admin.js` script.

### Credentials:
- **Username:** admin
- **Email:** admin@powershield.ae
- **Password:** Admin@1234
- **Role:** super_admin

### MongoDB Document Structure:

```json
{
  "id": "admin_1691234567890",
  "username": "admin",
  "email": "admin@powershield.ae",
  "hashedPassword": "$2b$10$XqjVkqhOtX5pYzX5pYzX5eJ5pYzX5pYzX5pYzX5pYzX5pYzX5pYzX5",
  "role": "super_admin",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "lastLoginAt": null
}
```

### Field Descriptions:

- **id**: Unique identifier with prefix "admin_" + timestamp
- **username**: Login username (must be unique)
- **email**: Email address (must be unique)
- **hashedPassword**: Bcrypt hash of the password (never store plain text)
- **role**: Admin role ("admin" or "super_admin")
- **isActive**: Boolean flag to enable/disable the account
- **createdAt**: Account creation timestamp
- **updatedAt**: Last update timestamp
- **lastLoginAt**: Last login timestamp (updated on each login)

### Creating the Admin User:

1. Run the creation script:
   ```bash
   npm run create-admin
   ```

2. Or manually insert the document into the `admin_users` collection with a properly hashed password.

### Security Notes:

- Passwords are hashed using bcrypt with salt rounds of 10
- The default password should be changed immediately after first login
- JWT tokens expire after 24 hours
- Inactive users cannot log in
- The system supports both username and email login

### Login Example:

```bash
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin@1234"
}
```

Or using email:

```bash
POST /api/admin/login
Content-Type: application/json

{
  "email": "admin@powershield.ae",
  "password": "Admin@1234"
}
```
