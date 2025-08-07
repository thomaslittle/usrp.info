# ~~Unscripted~~ UNTITLED PENTA PROJECT RP BCSO/LSPD/EMS/DOJ Resource Website

A comprehensive, editable resource website for the ~~Unscripted~~ UPPRP GTA5 roleplay server, with scalable architecture to support future departments (Police, DOJ, etc.).

## 🚀 Features

### Core Features
- **Department-based Resource Portal** - Centralized access to SOPs, protocols, and reference materials
- **EMS Reference Guide** - Interactive medical protocols, treatment guides, and communication codes
- **Standard Operating Procedures** - Comprehensive SOPs with structured navigation
- **Role-based Access Control** - Viewer, Editor, Admin, and Super Admin roles
- **Responsive Design** - Mobile-optimized with professional EMS theme
- **Scalable Architecture** - Ready for multi-department expansion

### Technical Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4
- **Authentication**: Appwrite (server-side API calls)
- **Database**: Appwrite Collections
- **State Management**: Zustand for client state, React Query for server state

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ or Bun
- Appwrite instance (configured as per PRD)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd my-app
   bun install
   ```

2. **Environment Configuration**
   The Appwrite configuration is already set up in the codebase:
   - API Endpoint: `https://appwrite.usrp.info/v1`
   - Project ID: `684492280037c88a3856`
   - API Key: Configured in server files

3. **Run Development Server**
   ```bash
   bun dev
   ```

4. **Access the Application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── departments/   # Department management
│   │   └── content/       # Content management
│   ├── ems/               # EMS department pages
│   │   ├── sops/         # Standard Operating Procedures
│   │   └── page.tsx      # EMS main page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Homepage (department selection)
│   └── globals.css       # Global styles with EMS theme
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── department-layout.tsx
│   ├── ems-reference-guide.tsx
│   └── sop-content.tsx
├── hooks/                # Custom React hooks
│   ├── use-auth.ts       # Authentication hook
│   ├── use-content.ts    # Content management
│   └── use-departments.ts
├── lib/                  # Utilities and configurations
│   ├── appwrite.ts       # Client-side Appwrite config
│   ├── appwrite-server.ts # Server-side Appwrite config
│   └── auth.ts           # Authentication utilities
├── store/                # Zustand stores
│   └── auth.ts           # Authentication state
└── types/                # TypeScript type definitions
    └── index.ts
```

## 🎨 Design System

### Color Palette
- **Primary**: `#753ace` (Purple)
- **Secondary**: `#9d5ce8` (Light Purple)
- **Accent**: `#e879f9` (Pink)
- **Background**: `#0f0b1a` (Dark)
- **Foreground**: `#ffffff` (White)

### Typography
- **Primary Font**: Akrobat (from CDN)
- **Fallbacks**: 'Segoe UI', sans-serif

## 📊 Database Schema

### Collections
- **Users**: User profiles with roles and department assignments
- **Departments**: Department configurations (EMS, Police, DOJ, etc.)
- **Content**: Editable content with categories (SOPs, codes, protocols, reference)
- **Audit Log**: Change tracking and user activity

### User Roles
- **Viewer**: Read-only access to department content
- **Editor**: Can edit content within their department
- **Admin**: Full access to department content and user management
- **Super Admin**: Cross-department access and system administration

## 🚑 EMS Content

### Reference Guide
- **Communication Codes**: 10-codes for radio communication
- **Incident Codes**: Specific incident response codes
- **Priority Response Codes**: Code 1-4, Code White, Code Green
- **Treatment Protocols**: Medical procedures and equipment usage
- **How to Speak 10 Code**: Communication guidelines and protocols

### Standard Operating Procedures
- **Rules and Guidelines**: Core principles and conduct
- **Structure and Authority**: Chain of command and hierarchy
- **Disciplinary Process**: Warning/strike system and classifications
- **Equipment and Vehicles**: Authorized gear and vehicle access
- **Uniforms**: Dress code by rank and division

### Doctor Division
- **Hospital Triage System**: Red, Yellow, Green, Black classifications
- **Medication Guide**: Comprehensive drug reference by category
- **Treatment Protocols**: Hospital-specific procedures

## 🔧 Development

### Available Scripts
- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint

### Key Technologies
- **Next.js 15**: React framework with App Router
- **Tailwind CSS v4**: Utility-first CSS framework
- **Appwrite**: Backend-as-a-Service for auth and database
- **React Query**: Server state management
- **Zustand**: Client state management
- **TypeScript**: Type safety and developer experience

## 🚀 Deployment

The application is configured for deployment on Coolify with the following considerations:
- Server-side Appwrite operations for security
- Optimized build with Next.js
- Environment variables for configuration
- Static asset optimization

## 📈 Future Expansion

The architecture supports easy addition of new departments:
1. Add department configuration to `departmentConfig`
2. Create department-specific pages under `/app/[department]/`
3. Add department data to Appwrite collections
4. Implement department-specific components

### Planned Departments
- **Police Department (LSPD)**: Police procedures and protocols
- **Department of Justice (DOJ)**: Legal procedures and court protocols
- **Government/Mayor Office**: Administrative procedures

## 📝 License

This project is for the ~~Unscripted~~ UNTITLED PENTA PROJECT RP Community.
---
