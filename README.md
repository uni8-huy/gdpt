# GDPT - Gia Đình Phật Tử Platform

A comprehensive community management platform for Buddhist Youth Organizations (Gia Đình Phật Tử) built with Next.js 15.

## Features

### Admin Portal
- **Dashboard** - Overview statistics and quick actions
- **Students Management** - CRUD operations for student records
- **Units Management** - Organizational unit hierarchy
- **Leaders Management** - Youth leader profiles with Gia Phả (genealogy) data
- **Events** - Event scheduling and management
- **Announcements** - Publish announcements to members
- **Data Import** - Bulk import students/leaders via CSV

### Youth Leader Portal
- Personal dashboard with unit statistics
- Gia Phả (genealogy) profile view
- Students list within their unit
- Events calendar

### Parent Portal
- Dashboard with linked children information
- Children details view
- Events calendar
- Announcements feed
- Contact information

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

# Configure your .env file with:
# - DATABASE_URL
# - BETTER_AUTH_SECRET (min 32 characters)
# - OAuth credentials (optional)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gdpt"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-at-least-32-characters"
BETTER_AUTH_URL="http://localhost:4004"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:4004"
```

## Deployment

### Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
flyctl auth login

# Launch app (first time)
flyctl launch --no-deploy

# Set secrets
flyctl secrets set \
  DATABASE_URL="..." \
  BETTER_AUTH_SECRET="..." \
  BETTER_AUTH_URL="https://your-app.fly.dev" \
  NEXT_PUBLIC_APP_URL="https://your-app.fly.dev"

# Deploy
flyctl deploy
```

### GitHub Actions

The project includes CI/CD pipeline that:
1. Runs type checking and linting on PRs
2. Auto-deploys to Fly.io on main branch push

Required secrets:
- `FLY_API_TOKEN` - Get from `flyctl auth token`

## Project Structure

```
├── app/
│   ├── [locale]/
│   │   ├── (admin)/admin/    # Admin routes
│   │   ├── (leader)/leader/  # Leader routes
│   │   ├── (parent)/parent/  # Parent routes
│   │   └── (auth)/           # Auth routes
│   └── api/                  # API routes
├── components/
│   ├── admin/                # Admin components
│   ├── auth/                 # Auth components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── actions/              # Server actions
│   ├── auth.ts               # Better Auth config
│   └── db.ts                 # Prisma client
├── prisma/
│   └── schema.prisma         # Database schema
└── locales/                  # i18n translations
```

## User Roles

| Role | Access |
|------|--------|
| ADMIN | Full access to admin portal |
| LEADER | Leader portal + assigned unit data |
| PARENT | Parent portal + linked children data |

## Database Schema

Key models:
- **User** - Authentication and profile
- **Student** - Student records
- **YouthLeader** - Leader profiles with Gia Phả
- **Unit** - Organizational units (hierarchical)
- **Event** - Events and activities
- **Announcement** - Published announcements

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
