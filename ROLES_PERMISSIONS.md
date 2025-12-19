# Role-Based Permission System

## Overview

The Image Capture app now has a **role-based permission system** with two user roles:

### 📸 **Photographer Role**
- ✅ Access to camera
- ✅ Capture images
- ✅ Save images with custom names
- ✅ View gallery
- ✅ Download images
- ✅ Delete images

### 👁️ **Viewer Role**
- ❌ No camera access
- ❌ Cannot capture images
- ❌ Cannot save images
- ✅ View gallery
- ✅ Download images
- ❌ Cannot delete images (button disabled)

## Demo Users

**Login with these accounts to test:**

### Photographers (Full Access)
- **Username:** admin
- **Password:** 12345678
- **Role:** Photographer - Full camera and gallery control

- **Username:** Rukshan
- **Password:** 12345678
- **Role:** Photographer - Full camera and gallery control

### Viewer (Gallery Only)
- **Username:** viewer
- **Password:** viewer123
- **Role:** Viewer - Gallery viewing only, no camera, no delete

## How It Works

### 1. Authentication
When a user logs in, their **role and permissions** are stored in localStorage:
```javascript
localStorage.setItem('role', userRole);
localStorage.setItem('permissions', JSON.stringify(permissions));
```

### 2. UI Adaptation
- **Camera Section** - Hidden for viewers
- **Delete Button** - Disabled for viewers
- **Role Badge** - Shows in logout button (📸 for photographer, 👁️ for viewer)

### 3. Server-Side Protection
- Backend checks permissions on delete requests
- Returns 403 Forbidden if viewer tries to delete
- All requests are verified with token + permission check

## User Data Structure

```json
{
  "id": 1,
  "username": "admin",
  "password": "12345678",
  "email": "admin@example.com",
  "role": "photographer",
  "created": "2025-12-18"
}
```

## Roles Definition

Stored in `users.json`:
```json
{
  "photographer": {
    "permissions": {
      "camera_access": true,
      "view_gallery": true,
      "save_image": true,
      "delete_image": true,
      "download_image": true
    }
  },
  "viewer": {
    "permissions": {
      "camera_access": false,
      "view_gallery": true,
      "save_image": false,
      "delete_image": false,
      "download_image": true
    }
  }
}
```

## Adding New Users

### Via Registration (Default: Photographer)
1. Click "Register here" on login page
2. Fill in username, email, password
3. New users get **photographer** role by default

### Manual (Edit users.json)
Add to the users array:
```json
{
  "id": 6,
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com",
  "role": "viewer",
  "created": "2025-12-18"
}
```

## Changing User Roles

Edit `users.json` and change the role field:
```json
"role": "viewer"  // or "photographer"
```

Then restart the server for changes to take effect.

## API Endpoints

### Get User Permissions
**GET** `/auth/permissions`
- **Headers:** `Authorization: Bearer {token}`
- **Response:** User role and permissions

### Delete Image
**POST** `/delete-image`
- **Headers:** `Authorization: Bearer {token}`
- **Body:** `{ "filename": "image.png" }`
- **Returns 403** if user doesn't have delete_image permission

## Security

- ✅ Permissions verified on server side
- ✅ Token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Permission checking on delete operations
- ✅ UI hidden for restricted features

## Future Enhancements

- Admin role to manage user roles
- Edit user roles from UI
- View audit logs of who deleted what
- Custom roles configuration
- Permission inheritance
