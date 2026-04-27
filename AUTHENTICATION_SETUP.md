# SimplifyConvert Authentication Setup Guide

## Overview

This document provides complete instructions for setting up and managing the NextAuth authentication system for SimplifyConvert.

**Commit**: 4b56473  
**Features Implemented**:
- ✅ Google OAuth 2.0 Sign-In
- ✅ Database-backed user management (Prisma ORM)
- ✅ Protected routes middleware
- ✅ User dashboard and account settings
- ✅ Automatic user profile creation on sign-up
- ✅ Session management with database persistence
- ✅ Responsive Sign In/Sign Up pages

---

## Prerequisites

Before proceeding, ensure you have:

1. **Google Cloud Console Access**
   - Go to https://console.cloud.google.com/
   - Create a new project or use existing one

2. **Database Server**
   - PostgreSQL 12+ (recommended for production)
   - OR MySQL 8.0+
   - OR SQLite (for local development only)

3. **Environment Variables Ready**
   - .env.local file configured (see section below)

---

## Step 1: Configure Environment Variables

Update `.env.local` with your configuration:

```env
# Database Configuration
# PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/simplifyconvert"

# OR MySQL
# DATABASE_URL="mysql://user:password@localhost:3306/simplifyconvert"

# OR SQLite (local development)
# DATABASE_URL="file:./dev.db"

# NextAuth Configuration (already set, but verify)
NEXTAUTH_URL="http://localhost:3000"              # Development
# NEXTAUTH_URL="https://simplifyconvert.com"     # Production

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"

# Google OAuth Credentials (from Cloud Console)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

### Important Security Notes:
- ✅ `.env.local` is already in `.gitignore` - **do not commit it**
- ✅ Generate a strong `NEXTAUTH_SECRET`: `openssl rand -base64 32`
- ✅ Use `https://` for production NEXTAUTH_URL
- ✅ Never share `GOOGLE_CLIENT_SECRET` publicly

---

## Step 2: Set Up Google OAuth

### Get Google Credentials:

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/

2. **Create OAuth 2.0 Credentials**
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Name: "SimplifyConvert"

3. **Configure Authorized Redirect URIs**
   
   For **Development**:
   ```
   http://localhost:3000/api/auth/callback/google
   ```

   For **Production**:
   ```
   https://simplifyconvert.com/api/auth/callback/google
   https://www.simplifyconvert.com/api/auth/callback/google
   ```

4. **Copy Credentials**
   - Copy `Client ID` → `GOOGLE_CLIENT_ID`
   - Copy `Client Secret` → `GOOGLE_CLIENT_SECRET`
   - Paste into `.env.local`

### Verify Setup:
```bash
echo $GOOGLE_CLIENT_ID      # Should show: xxx.apps.googleusercontent.com
echo $GOOGLE_CLIENT_SECRET  # Should show: gcs_xxxxx
```

---

## Step 3: Set Up Database

### PostgreSQL (Recommended for Production)

**Local Development Setup:**
```bash
# Windows - Use WSL or Docker
docker run --name simplifyconvert-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=simplifyconvert \
  -p 5432:5432 \
  -d postgres:15

# Verify connection
psql postgresql://postgres:password@localhost:5432/simplifyconvert
```

**Production Setup (Railway.app example):**
1. Go to https://railway.app/
2. Create new project → PostgreSQL
3. Copy connection string from "Connect" tab
4. Set as `DATABASE_URL` in production environment

### MySQL Setup

**Local Development:**
```bash
docker run --name simplifyconvert-mysql \
  -e MYSQL_ROOT_PASSWORD=password \
  -e MYSQL_DATABASE=simplifyconvert \
  -p 3306:3306 \
  -d mysql:8.0

# Verify connection
mysql -h localhost -u root -p simplifyconvert
```

### SQLite (Local Development Only)

```bash
# SQLite doesn't require setup, just set:
# DATABASE_URL="file:./dev.db"

# The database file will be created automatically
```

---

## Step 4: Initialize Database Schema

Run Prisma migrations to create tables:

```bash
# Generate Prisma Client
npx prisma generate

# Create database schema (creates tables)
npx prisma migrate dev --name init

# View/manage data (optional - opens Prisma Studio)
npx prisma studio
```

### What Gets Created:

```sql
-- User table
-- Stores authenticated users
CREATE TABLE "User" (
  id            TEXT PRIMARY KEY,
  name          TEXT,
  email         TEXT UNIQUE,
  emailVerified TIMESTAMP,
  image         TEXT,
  provider      TEXT,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastLoginAt   TIMESTAMP
);

-- Account table (OAuth tokens)
CREATE TABLE "Account" (
  id                    TEXT PRIMARY KEY,
  userId                TEXT NOT NULL,
  type                  TEXT,
  provider              TEXT,
  providerAccountId     TEXT,
  refresh_token         TEXT,
  access_token          TEXT,
  expires_at            INT,
  token_type            TEXT,
  scope                 TEXT,
  id_token              TEXT,
  session_state         TEXT,
  UNIQUE(provider, providerAccountId),
  FOREIGN KEY(userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Session table
CREATE TABLE "Session" (
  id           TEXT PRIMARY KEY UNIQUE,
  sessionToken TEXT UNIQUE,
  userId       TEXT,
  expires      TIMESTAMP,
  FOREIGN KEY(userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- VerificationToken table (for email verification)
CREATE TABLE "VerificationToken" (
  identifier TEXT,
  token      TEXT UNIQUE,
  expires    TIMESTAMP,
  UNIQUE(identifier, token)
);
```

---

## Step 5: Test Authentication Locally

```bash
# Start development server
npm run dev

# Test Sign Up
# 1. Go to http://localhost:3000/auth/signup
# 2. Click "Sign up with Google"
# 3. Complete Google authentication
# 4. Verify redirect to home page (logged in)

# Test Dashboard (Protected Route)
# 1. Go to http://localhost:3000/dashboard
# 2. Should see user information
# 3. Sign out from dropdown menu

# View Database
npx prisma studio
# Navigate to "User" table to see created users
```

---

## Features Implemented

### 1. **Sign In Page** (`/auth/signin`)
- Google OAuth button
- Error handling
- Link to Sign Up
- Responsive design

### 2. **Sign Up Page** (`/auth/signup`)
- Google OAuth button
- Benefits list
- Terms and Privacy links
- Responsive design

### 3. **Dashboard** (`/dashboard`)
- Protected route (redirects to sign in if not authenticated)
- User profile information
- Account creation date
- Last login time
- Quick action buttons

### 4. **Account Settings** (`/account`)
- Protected route
- Email display (verified)
- Password management (for future email/password auth)
- Two-factor authentication setup (placeholder)
- Account deletion option (placeholder)

### 5. **Header Component**
- Conditional rendering:
  - Logged out: "Sign In" and "Sign Up" buttons
  - Logged in: User avatar + dropdown menu
- Dropdown menu options:
  - Dashboard
  - Account Settings
  - Sign Out
- Mobile responsive

### 6. **Middleware Protection**
- Automatically redirects unauthenticated users from protected routes
- Routes protected: `/dashboard`, `/account`

---

## Database Schema

### User Table Fields:

| Field       | Type     | Description                          |
|-------------|----------|--------------------------------------|
| id          | String   | UUID/CUID (Primary Key)              |
| name        | String   | User's full name from Google         |
| email       | String   | Email address (unique)               |
| emailVerified | DateTime | Google verification status          |
| image       | String   | Avatar URL from Google               |
| provider    | String   | OAuth provider ("google")            |
| createdAt   | DateTime | Account creation timestamp           |
| updatedAt   | DateTime | Last update timestamp                |
| lastLoginAt | DateTime | Last successful login                |

---

## Deployment to Production

### Vercel (Recommended for Next.js)

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard:
# - DATABASE_URL (production database)
# - NEXTAUTH_URL=https://simplifyconvert.com
# - NEXTAUTH_SECRET (use new one: openssl rand -base64 32)
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
```

### Railway.app (Full Stack)

```bash
# 1. Create new project with PostgreSQL
# 2. Link GitHub repository
# 3. Set environment variables
# 4. Deploy automatically on push
```

### Traditional VPS/Cloud

```bash
# 1. SSH into server
ssh user@server.com

# 2. Clone repository
git clone https://github.com/simplifymove/simplifytools.git
cd simplifytools

# 3. Install dependencies
npm install

# 4. Set up database (PostgreSQL)
# Install PostgreSQL, create database and user

# 5. Configure .env
nano .env.local
# Set all variables (DATABASE_URL, NEXTAUTH_URL, etc.)

# 6. Run migrations
npx prisma migrate deploy

# 7. Build and start
npm run build
npm run start

# 8. Use PM2 or systemd for process management
npm install -g pm2
pm2 start "npm start" --name simplifyconvert
```

---

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is generated with `openssl rand -base64 32`
- [ ] `.env.local` is in `.gitignore` and not committed
- [ ] Google OAuth credentials are from a trusted Google Cloud project
- [ ] `NEXTAUTH_URL` is `https://` in production
- [ ] Database has strong password
- [ ] Database connections use encrypted (SSL/TLS) connections in production
- [ ] Environment variables are set in production platform (Vercel, Railway, etc.)
- [ ] Google OAuth redirect URIs are correct and only include your domain
- [ ] CSRF protection is enabled (default in NextAuth)
- [ ] Secure session cookies (default in production with https)

---

## Troubleshooting

### "Google Sign-In not working"
**Solution:**
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
2. Check Google Cloud Console → Credentials are for "Web application"
3. Verify redirect URI matches: `http://localhost:3000/api/auth/callback/google`
4. Restart development server: `npm run dev`

### "Database connection refused"
**Solution:**
1. Verify PostgreSQL/MySQL server is running
2. Check `DATABASE_URL` is correct
3. Test connection: `psql postgresql://...` or `mysql -h...`
4. Verify firewall allows connection

### "Session data not persisting"
**Solution:**
1. Run `npx prisma migrate dev` to ensure Session table exists
2. Clear browser cookies
3. Check `NEXTAUTH_SECRET` is set in `.env.local`

### "Redirect loop on login"
**Solution:**
1. Verify `NEXTAUTH_URL` matches your domain
2. Check `NEXTAUTH_SECRET` is set and consistent
3. Clear `.next` build cache: `rm -rf .next && npm run build`

### "Dashboard shows "Loading..." forever"
**Solution:**
1. Check browser console for errors
2. Verify user is created in database: `npx prisma studio`
3. Check `lastLoginAt` is being updated

---

## Session Data

When user is logged in, `session` object contains:

```typescript
{
  user: {
    id: "clxxxxxxxxxx",
    name: "John Doe",
    email: "john@example.com",
    image: "https://lh3.googleusercontent.com/...",
    provider: "google",
    createdAt: "2026-04-27T12:00:00Z",
    lastLoginAt: "2026-04-27T14:30:00Z"
  },
  expires: "2026-05-27T14:30:00Z"
}
```

---

## Future Enhancements

- [ ] Email/Password authentication
- [ ] GitHub OAuth provider
- [ ] Two-factor authentication (2FA)
- [ ] Social account linking
- [ ] Password reset flow
- [ ] Email verification flow
- [ ] User roles (admin, moderator, user)
- [ ] API authentication tokens
- [ ] OAuth token refresh handling
- [ ] Account suspension/deletion workflow

---

## File Structure

```
simplifyconvertapp/
├── app/
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx          # Sign In page
│   │   └── signup/
│   │       └── page.tsx          # Sign Up page
│   ├── dashboard/
│   │   └── page.tsx              # Protected dashboard
│   ├── account/
│   │   └── page.tsx              # Protected account settings
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts      # NextAuth handler
│   ├── components/
│   │   └── Header.tsx            # Updated with auth UI
│   ├── layout.tsx
│   └── providers.tsx             # SessionProvider wrapper
├── lib/
│   └── prisma.ts                 # Prisma client singleton
├── prisma/
│   └── schema.prisma             # Database schema
├── types/
│   └── next-auth.d.ts            # TypeScript extensions
├── middleware.ts                 # Route protection
├── .env.local                    # Environment variables (not committed)
└── package.json
```

---

## Support

For issues or questions:
1. Check Troubleshooting section above
2. Review NextAuth documentation: https://next-auth.js.org/
3. Check Prisma documentation: https://www.prisma.io/docs/
4. Create GitHub issue with error logs

---

**Last Updated**: April 27, 2026  
**Version**: 1.0.0
