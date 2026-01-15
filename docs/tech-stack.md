# GDPT Platform Tech Stack

## Core Framework
- **Next.js 15** (App Router) - React framework with SSR, server actions
- **TypeScript** - Type safety across codebase

## Database
- **PostgreSQL** - Relational database for genealogy data
- **Prisma ORM** - Type-safe database client with migrations
- **Fly.io Postgres** - Managed PostgreSQL with automated backups

## Authentication
- **Better Auth** - Framework-agnostic auth with RBAC plugin
  - OAuth providers: Google, Facebook
  - Credential auth for Admins
  - Role-based access: Parent, Youth Leader, Admin
  - Session management with password change enforcement

## UI/Frontend
- **shadcn/ui** - Copy-paste components built on Radix UI
- **Radix UI Primitives** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **TanStack React Table** - Data tables for admin dashboard
- **Lucide React** - Icons

## Internationalization
- **next-intl** - App Router native i18n
  - Languages: Vietnamese (primary), English
  - Vietnamese locale support (vi-VN date/number formatting)

## Deployment & Infrastructure
- **Fly.io** - Edge deployment platform
  - Managed PostgreSQL
  - Auto SSL (Let's Encrypt)
  - Global edge regions
- **GitHub Actions** - CI/CD pipeline
  - Auto-deploy on merge to main
  - Tests run on PRs

## Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Project Structure
```
gdpt/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (parent)/          # Parent dashboard routes
│   ├── (leader)/          # Youth Leader routes
│   ├── (admin)/           # Admin dashboard routes
│   └── api/               # API routes
├── components/            # Shared UI components
├── lib/                   # Utilities, db client
├── prisma/               # Prisma schema & migrations
├── locales/              # i18n translation files
├── public/               # Static assets
└── docs/                 # Documentation
```

## Database Schema (High-Level)
- **users** - All users (parents, leaders, admins)
- **students** - Student profiles
- **parent_student** - Parent-child relationships
- **youth_leaders** - Leader profiles with Gia Phả data
- **leader_timeline** - Historical involvement records
- **training_records** - Training camp history
- **events** - Calendar events
- **announcements** - System announcements
- **units** - GDPT organizational units

## Security
- OAuth 2.0 (Google, Facebook)
- Password hashing (bcrypt)
- HTTPS enforced
- RBAC at middleware + API level
- Environment-based secrets
