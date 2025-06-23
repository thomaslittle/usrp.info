# User Management System Documentation

## Overview

The User Management System has been enhanced to support comprehensive department-specific user profiles, with full support for EMS department structure including ranks, assignments, certifications, and contact information.

## Features

### 🔐 **Role-Based Access Control**
- **Super Admin**: Full system access across all departments
- **Admin**: Can manage users within their department
- **Editor**: Can create and edit content
- **Viewer**: Read-only access

### 👥 **Comprehensive User Profiles**
Each user profile includes:

#### Basic Information
- **Username**: System username
- **Character Name**: In-game character name
- **Email**: Contact email address
- **Department**: ems, police, doj, fire, government

#### EMS Department Fields
- **Rank**: User's rank (e.g., Chief of Staff, Captain, EMT)
- **Job Title**: Specific job title (e.g., Head of Doctors, Captain (Doctor))
- **Callsign**: Radio callsign (e.g., M-1, E-23)
- **Assignment**: Current assignment (e.g., Command, Medic Supervisor)
- **Activity Level**: Active, Moderate, Inactive
- **Employment Status**: Full-Time, Part-Time, On-Call

#### Contact Information
- **Phone Number**: Contact phone number
- **Discord Username**: Discord username for communication
- **Timezone**: User's timezone

#### Certifications
- **FTO (Field Training Officer)**: Boolean certification status
- **Solo Cleared**: Boolean solo operation clearance

## User Interface

### 🎛️ **Advanced Filtering System**
- Search by username, email, character name, callsign, or rank
- Filter by department (Super Admin only)
- Filter by role (Viewer, Editor, Admin, Super Admin)
- Filter by activity level (Active, Moderate, Inactive)
- Clear all filters with one click

### 🏷️ **Visual Status Indicators**
- **Role Badges**: Color-coded role indicators with tooltips
- **Activity Badges**: Green/Yellow/Red activity status
- **Status Badges**: Employment status indicators
- **Certification Badges**: FTO and Solo Cleared indicators

### ✏️ **Comprehensive Edit Dialog**
Two-column layout with organized sections:

#### Left Column - Basic Information
- Username
- Character Name
- Rank
- Job Title
- Assignment
- System Role

#### Right Column - Contact & Status
- Callsign
- Phone Number
- Discord Username
- Timezone
- Activity Level
- Employment Status
- Certifications (FTO, Solo Cleared)

## Database Schema

### New Attributes Added
```typescript
interface User {
  // Existing fields...
  jobTitle?: string;           // Job title in department
  phoneNumber?: string;        // Contact phone number
  callsign?: string;          // Radio callsign
  assignment?: string;        // Current assignment
  activity?: 'Active' | 'Moderate' | 'Inactive';  // Activity level
  status?: 'Full-Time' | 'Part-Time' | 'On-Call'; // Employment status
  timezone?: string;          // User timezone
  discordUsername?: string;   // Discord username
  isFTO?: boolean;           // Field Training Officer status
  isSoloCleared?: boolean;   // Solo operation clearance
}
```

### Appwrite Database Attributes
- `jobTitle` (String, 255 chars, optional)
- `phoneNumber` (String, 50 chars, optional)
- `callsign` (String, 20 chars, optional)
- `assignment` (String, 255 chars, optional)
- `activity` (Enum: Active, Moderate, Inactive, optional)
- `status` (Enum: Full-Time, Part-Time, On-Call, optional)
- `timezone` (String, 100 chars, optional)
- `discordUsername` (String, 100 chars, optional)
- `isFTO` (Boolean, default: false)
- `isSoloCleared` (Boolean, default: false)

## API Endpoints

### GET `/api/users`
Retrieve all users (with permission filtering)
- Query params: `email` (current user email for auth)
- Returns: Array of users with full profile data

### PUT `/api/users/[id]`
Update user profile
- Body: User data + `currentUserEmail`
- Validates permissions before updating
- Logs activity for audit trail

### POST `/api/seed`
Seed database with EMS department users
- Creates 33+ sample users with realistic data
- Includes full organizational structure

## Permission System

### Admin Permissions
- Can edit users in their department only
- Cannot modify other admins or super admins
- Cannot promote users to super admin
- Can modify: Viewers and Editors in same department

### Super Admin Permissions
- Full access to all users across departments
- Can promote/demote any user
- Can modify any profile field
- Cross-department management

## Sample EMS Department Structure

### Command Staff (M-1 to M-3)
- **Chief of Staff** (M-1) - Admin role
- **Head of Doctors** (M-2) - Admin role  
- **Head of Paramedics** (E-3) - Admin role

### Supervisors (M-4 to E-11)
- **Captains** (M-4, M-5, E-6, E-7) - Editor role
- **Lieutenants** (M-8, M-9, E-10, E-11) - Editor role

### Field Staff (E-23+)
- **Paramedics** (E-23 to E-32) - Viewer role
- **EMTs** (E-33 to E-50) - Viewer role
- **Interns** (M-70+) - Viewer role
- **Residents** (M-51+) - Viewer role
- **Specialists** (M-21+) - Viewer role

## Usage Instructions

### For Department Admins

1. **Access User Management**
   - Navigate to Dashboard → Users
   - System will show users in your department

2. **Edit User Profiles**
   - Click "Edit" button next to any user you can modify
   - Update all relevant fields in the comprehensive form
   - Save changes to update profile and log activity

3. **Filter and Search**
   - Use search box for quick user lookup
   - Apply filters to narrow down user lists
   - Clear filters to see all users

### For Super Admins

1. **Cross-Department Management**
   - View and edit users from all departments
   - Department filter available for focused management
   - Full role promotion/demotion capabilities

2. **System Administration**
   - Promote first super admin via setup interface
   - Manage admin roles across departments
   - Override department restrictions when needed

## Security Features

- **Authentication bypass temporarily enabled** for testing
- **Permission validation** on all operations
- **Activity logging** for audit trails
- **Role-based access control** prevents unauthorized modifications
- **Department isolation** for admin-level users

## Testing

### Seed Sample Data
```bash
curl -X POST http://localhost:3000/api/seed
```

### Test User Update
```bash
curl -X PUT http://localhost:3000/api/users/[user-id] \
  -H "Content-Type: application/json" \
  -d '{
    "currentUserEmail": "admin@example.com",
    "phoneNumber": "(555) 123-4567",
    "callsign": "M-1",
    "isFTO": true
  }'
```

## Future Enhancements

- **Photo Upload**: User profile pictures
- **Department Transfer**: Workflow for moving users between departments
- **Bulk Operations**: Import/export user data
- **Advanced Reporting**: User activity and certification reports
- **Integration**: Connect with Discord API for automatic role sync
- **Mobile Optimization**: Responsive design improvements

---

*This system provides a comprehensive foundation for managing department personnel with all necessary fields and permissions for effective EMS operations.* 