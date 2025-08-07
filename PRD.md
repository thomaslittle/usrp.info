# PENTA UNTITLED PROJECT RP EMS Resource Website - Product Requirements Document

## Project Overview

### Mission Statement
Create a comprehensive, editable resource website for the PENTA UNTITLED PROJECT RP GTA5 roleplay server's Emergency Medical Services (EMS/TacMed) department, with scalable architecture to support future departments (Police, DOJ, etc.).

### Project Goals
- Provide centralized access to SOPs, protocols, and reference materials
- Enable role-based content editing through WYSIWYG interface
- Establish scalable foundation for multi-department expansion
- Maintain professional, immersive design consistent with roleplay environment

## Technical Specifications

### Core Technology Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS (no inline CSS or global.css bloat)
- **Authentication**: Appwrite (server-side API calls)
- **Database**: Appwrite Collections
- **Editor**: TipTap or similar WYSIWYG editor
- **Deployment**: Coolify on private VPS

### Appwrite Configuration
```javascript
// Server Configuration
API_ENDPOINT: "http://appwrite-qswcko448k448gwkg0o8ookk.38.45.67.215.sslip.io/v1"
PROJECT_ID: "684492280037c88a3856"
API_KEY: "<REDACTED>" // Use environment variable APPWRITE_API_KEY instead
```

### Font Requirements
- **Primary Font**: Akrobat (from CDN)
- **Fallbacks**: 'Segoe UI', sans-serif
- Proper loading optimization and FOUT prevention

## Database Schema

### Collections Structure

#### Users Collection
```json
{
  "userId": "string",
  "email": "string",
  "username": "string",
  "department": "string", // "ems", "police", "doj", etc.
  "role": "string", // "viewer", "editor", "admin"
  "gameCharacterName": "string",
  "rank": "string",
  "lastLogin": "datetime",
  "createdAt": "datetime"
}
```

#### Departments Collection
```json
{
  "departmentId": "string",
  "name": "string", // "Emergency Medical Services"
  "slug": "string", // "ems"
  "color": "string", // "#753ace"
  "logo": "string", // URL to logo
  "isActive": "boolean",
  "createdAt": "datetime"
}
```

#### Content Collection
```json
{
  "contentId": "string",
  "departmentId": "string",
  "title": "string",
  "slug": "string",
  "content": "object", // Rich text JSON from editor
  "category": "string", // "sop", "codes", "protocols", "reference"
  "order": "number",
  "isPublished": "boolean",
  "lastEditedBy": "string",
  "lastEditedAt": "datetime",
  "createdAt": "datetime"
}
```

#### Audit Log Collection
```json
{
  "logId": "string",
  "userId": "string",
  "action": "string", // "create", "update", "delete"
  "resourceType": "string", // "content", "user"
  "resourceId": "string",
  "changes": "object",
  "timestamp": "datetime"
}
```

## User Roles & Permissions

### Role Hierarchy
1. **Viewer** - Read-only access to department content
2. **Editor** - Can edit content within their department
3. **Admin** - Full access to department content and user management
4. **Super Admin** - Cross-department access and system administration

### Permission Matrix
| Action | Viewer | Editor | Admin | Super Admin |
|--------|--------|--------|-------|-------------|
| View Content | ✓ | ✓ | ✓ | ✓ |
| Edit Content | ✗ | ✓ | ✓ | ✓ |
| Publish Content | ✗ | ✗ | ✓ | ✓ |
| Manage Users | ✗ | ✗ | ✓ | ✓ |
| System Settings | ✗ | ✗ | ✗ | ✓ |

## Feature Requirements

### Core Features

#### Authentication System
- Secure login/registration with Appwrite
- Role-based access control
- Session management
- Password reset functionality
- Email verification

#### Content Management
- WYSIWYG editor for rich content editing
- Version control/history tracking
- Draft and published states
- Content categorization (SOPs, Codes, Protocols, etc.)
- Search functionality across content

#### Department Management
- Multi-department support with isolated content
- Department-specific styling/branding
- Configurable navigation menus
- Department user management

#### Reference Tools
- Interactive code lookup (10-codes, priority codes)
- Treatment protocol quick reference
- Medication database (for doctors)
- Triage system guide

### Advanced Features

#### Real-time Collaboration
- Live editing indicators
- Conflict resolution for simultaneous edits
- Change notifications

#### Mobile Optimization
- Responsive design for tablet/mobile use
- Progressive Web App capabilities
- Offline content caching

#### Analytics & Reporting
- Content usage statistics
- User activity tracking
- Popular content identification

## UI/UX Requirements

### Design System
- **Color Scheme**: Purple gradient theme (#753ace primary)
- **Dark Theme**: Primary interface (#0f0b1a background)
- **Typography**: Akrobat font family
- **Components**: Consistent with provided design mockup

### Navigation Structure
```
/ (Home/Department Selection)
├── /ems/
│   ├── /sops
│   ├── /codes
│   ├── /protocols
│   ├── /reference
│   └── /admin (role-restricted)
├── /police/ (future)
├── /doj/ (future)
└── /admin (super admin only)
```

### Key Pages

#### Public Pages
- Landing page with department selection
- Department home pages
- Content viewing pages
- Search results

#### Authenticated Pages
- User dashboard
- Content editor
- User management (admin)
- System settings (super admin)

## Technical Architecture

### Server-Side API Strategy
- All Appwrite operations through server actions/API routes
- Client-side minimal Appwrite SDK usage
- Secure API key handling
- Proper error handling and logging

### Component Structure
```
/components
├── /ui (shared components)
├── /auth (authentication components)
├── /content (content display/editing)
├── /navigation (department navigation)
└── /admin (admin interfaces)

/app
├── /(public)
│   ├── /[department]
│   └── /search
├── /(authenticated)
│   ├── /dashboard
│   ├── /editor
│   └── /admin
└── /api
    ├── /auth
    ├── /content
    └── /admin
```

### Security Considerations
- Server-side authentication validation
- Input sanitization for rich text content
- Rate limiting on API endpoints
- CSRF protection
- Secure session management

## Migration Plan

### Phase 1: Foundation (Week 1-2)
- Set up Next.js project with Tailwind
- Configure Appwrite integration
- Implement authentication system
- Create basic component library

### Phase 2: Core Features (Week 2-3)
- Build content management system
- Implement WYSIWYG editor
- Create department structure
- Migrate EMS content from provided markup

### Phase 3: Advanced Features (Week 3-4)
- Add user management
- Implement search functionality
- Create admin interfaces
- Performance optimization

### Phase 4: Polish & Launch (Week 4)
- Testing and bug fixes
- Documentation
- Deployment setup
- User onboarding

## Content Migration

### EMS Department Initial Content
1. **Standard Operating Procedures**
   - Rules and conduct guidelines
   - Structure and hierarchy
   - Disciplinary procedures
   - Promotion/demotion policies

2. **Communication Codes**
   - 10-codes reference
   - Priority response codes
   - Tactical communications

3. **Treatment Protocols**
   - EMS field protocols
   - Hospital procedures
   - Medication guidelines
   - Triage system

4. **Equipment & Vehicles**
   - Authorized equipment lists
   - Vehicle access by rank
   - Certification requirements
   - Uniform specifications

## Success Metrics

### User Engagement
- Monthly active users
- Content page views
- Time spent on reference materials
- Search query success rate

### Content Quality
- Content update frequency
- Editor participation rate
- User feedback scores
- Error report resolution time

### System Performance
- Page load times < 2 seconds
- 99.9% uptime
- Mobile performance scores > 90
- Search response time < 500ms

## Future Expansion

### Additional Departments
- Police Department (LSPD)
- Department of Justice (DOJ)
- Fire Department
- Government/Mayor Office

### Advanced Features
- Mobile app development
- Integration with game servers
- Real-time notifications
- Advanced analytics dashboard
- API for third-party integrations

## Risks & Mitigation

### Technical Risks
- **Appwrite dependency**: Implement proper error handling and fallbacks
- **Content loss**: Regular automated backups
- **Performance issues**: Implement caching strategies
- **Security vulnerabilities**: Regular security audits

### User Adoption Risks
- **Low engagement**: Gamification elements and user feedback
- **Content quality**: Editorial review processes
- **Training requirements**: Comprehensive documentation and tutorials

## Conclusion

This PRD provides a comprehensive roadmap for creating a scalable, professional resource website for the PENTA UNTITLED PROJECT RP roleplay community's EMS department, with clear expansion paths for future departments and features.
