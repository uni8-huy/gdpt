# GDPT - Gia Dinh Phat Tu Platform

A comprehensive community management platform for Buddhist Youth Organizations (Gia Dinh Phat Tu) built with Next.js 15.

## Features

### Admin Portal
- **Dashboard** - Overview statistics, pending registrations widget
- **Users Management** - Manage all users with role assignment
  - Integrated leader profile (Gia Pha) editing via user detail sheet
  - Role change with validation
  - Password reset functionality
- **Units Management** - Organizational unit hierarchy with class management
- **Classes** - Manage classes under each unit (Oanh Vu, Thieu, Thanh, etc.)
- **Students Management** - CRUD with class assignment and parent linking
- **Student Submissions** - Approve/reject parent registration requests
- **Events** - Event scheduling and management
- **Announcements** - Publish announcements to members
- **Data Import** - Bulk import students/leaders via CSV

### Youth Leader Portal
- **Dashboard** - Unit statistics overview
- **Profile (Gia Pha)** - View and edit personal genealogy data
  - Timeline: positions/roles history
  - Training records: camp attendance
- **Students** - Manage students in assigned unit
  - Add/edit students (unit-scoped)
  - Deactivate students (no delete)
- **Events** - Create and manage unit events
- **Calendar** - View events and activities

### Parent Portal
- **Dashboard** - Overview with linked children
- **Children** - View linked children details
- **Register Child** - Submit new child registration (admin approval required)
- **Submissions** - Track registration status (pending/approved/rejected)
  - Resubmit rejected applications
- **Calendar** - Events and activities
- **Announcements** - Organization news
- **Contact** - Contact information

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth (OAuth + Credentials)
- **UI**: shadcn/ui + Tailwind CSS
- **i18n**: next-intl (Vietnamese/English)
- **Deployment**: Fly.io with Docker

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Google/Facebook OAuth credentials (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/uni8-huy/gdpt.git
cd gdpt

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file (see Environment Variables below)

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed sample data - requires running dev server for auth
npm run dev &
npx prisma db seed

# Start development server
npm run dev
```

### Environment Variables

```env
# Database (required)
DATABASE_URL="postgresql://user:password@localhost:5432/gdpt"

# Better Auth (required)
BETTER_AUTH_SECRET="your-secret-key-at-least-32-characters"
BETTER_AUTH_URL="http://localhost:4004"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# App URL (required)
NEXT_PUBLIC_APP_URL="http://localhost:4004"
```

## Deployment

### Fly.io

**Prerequisites:**
- Fly.io account
- PostgreSQL database (Fly Postgres, Neon, Supabase, etc.)

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app (first time only)
fly launch --no-deploy

# Create Fly Postgres (optional - or use external DB)
fly postgres create --name gdpt-db
fly postgres attach gdpt-db

# Set secrets (required)
fly secrets set \
  DATABASE_URL="postgresql://..." \
  BETTER_AUTH_SECRET="your-secret-at-least-32-chars" \
  BETTER_AUTH_URL="https://gdpt-platform.fly.dev" \
  NEXT_PUBLIC_APP_URL="https://gdpt-platform.fly.dev"

# Deploy
fly deploy

# Run database migrations after deploy
fly ssh console -C "npx prisma db push"
```

### Docker (Self-hosted)

```bash
# Build image
docker build -t gdpt-platform .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e BETTER_AUTH_SECRET="..." \
  -e BETTER_AUTH_URL="https://your-domain.com" \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.com" \
  gdpt-platform
```

### GitHub Actions CI/CD

The project includes automated CI/CD:
1. **PR Checks** - Type checking and linting
2. **Auto Deploy** - Deploys to Fly.io on main branch push

**Required GitHub Secrets:**
- `FLY_API_TOKEN` - Get from `fly tokens create deploy`

## Project Structure

```
├── app/
│   ├── [locale]/
│   │   ├── (admin)/admin/     # Admin routes
│   │   │   ├── dashboard/     # Stats + pending widget
│   │   │   ├── users/         # User management + leader profiles
│   │   │   ├── units/         # Units + classes
│   │   │   ├── students/      # Student management
│   │   │   ├── submissions/   # Registration approvals
│   │   │   ├── events/        # Event management
│   │   │   └── announcements/ # Announcements
│   │   ├── (leader)/leader/   # Leader routes
│   │   │   ├── dashboard/     # Unit overview
│   │   │   ├── profile/       # Gia Pha management
│   │   │   ├── students/      # Unit students CRUD
│   │   │   ├── events/        # Unit events CRUD
│   │   │   └── calendar/      # Calendar view
│   │   ├── (parent)/parent/   # Parent routes
│   │   │   ├── dashboard/     # Overview
│   │   │   ├── children/      # View children + register
│   │   │   └── submissions/   # Track registrations
│   │   └── (auth)/            # Auth routes
│   └── api/                   # API routes
├── components/
│   ├── admin/                 # Admin components
│   ├── auth/                  # Auth components
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── actions/               # Server actions
│   │   ├── user-actions.ts    # User + leader profile CRUD
│   │   ├── student-actions.ts # Student CRUD
│   │   ├── class-actions.ts   # Class CRUD
│   │   ├── submission-actions.ts # Registration workflow
│   │   ├── leader-student-actions.ts # Leader-scoped student ops
│   │   └── leader-event-actions.ts   # Leader-scoped event ops
│   ├── auth/                  # Auth utilities
│   └── db.ts                  # Prisma client
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data
└── locales/                   # i18n translations (en, vi)
```

## User Roles & Permissions

### Role Definitions

| Role | Portal | Access |
|------|--------|--------|
| **ADMIN** | `/admin/*` | Full platform access. Manage users, units, classes, students, events, announcements. Approve registrations. Can access leader/parent portals. |
| **LEADER** | `/leader/*` | Youth leader portal. Manage Gia Pha profile. CRUD students/events in assigned unit. View announcements. |
| **PARENT** | `/parent/*` | Parent portal (default role). View children, submit registrations, view events/announcements. |

### Authentication Flow

```
Request → Middleware → Layout → Page
           ↓            ↓        ↓
     Session check  Role check  Content
           ↓            ↓
     No session?    Wrong role?
           ↓            ↓
     → /login       → /[role]/dashboard
```

1. **Middleware** (`middleware.ts`) - Checks session cookie, redirects unauthenticated users to `/login`
2. **Layout** (`(admin|leader|parent)/layout.tsx`) - Verifies role via `requireRole()`, ADMIN can access all portals
3. **Session Helpers** (`lib/session.ts`):
   - `getSession()` - Get current session
   - `requireSession(locale)` - Require authentication
   - `requireRole(role | Role[], locale)` - Require specific role(s)

### Role-Based Features

| Feature | ADMIN | LEADER | PARENT |
|---------|:-----:|:------:|:------:|
| User Management | ✅ | ❌ | ❌ |
| Unit/Class Management | ✅ | ❌ | ❌ |
| All Students CRUD | ✅ | ❌ | ❌ |
| Unit Students CRUD | ✅ | ✅ | ❌ |
| Approve Registrations | ✅ | ❌ | ❌ |
| Submit Registrations | ❌ | ❌ | ✅ |
| Gia Pha Profile | ✅ | ✅ | ❌ |
| Create Events | ✅ | ✅ | ❌ |
| View Events | ✅ | ✅ | ✅ |
| View Announcements | ✅ | ✅ | ✅ |
| View Children | ❌ | ❌ | ✅ |

## Database Schema

### Core Models
- **User** - Authentication, profile, role (ADMIN/LEADER/PARENT)
- **YouthLeader** - Gia Pha profile linked to User
- **Unit** - Organizational units (hierarchical)
- **Class** - Classes under units (unique name per unit)
- **Student** - Student records with class and unit assignment
- **Event** - Events with optional unit scope
- **Announcement** - Published announcements

### Relationship Models
- **ParentStudent** - Links parents to students
- **StudentSubmission** - Parent registration requests (pending/approved/rejected/revised)
- **LeaderTimeline** - Leader position history
- **TrainingRecord** - Leader training/camp records

## Scripts

```bash
npm run dev        # Start development server (port 4004)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npx prisma studio  # Open Prisma database browser
npx prisma db push # Push schema changes to database
npx prisma db seed # Seed sample data
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run build` to verify
5. Submit a pull request
