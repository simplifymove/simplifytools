# Local Authentication & Development Setup Guide

## ✅ What Was Fixed

### 1. Environment Configuration (.env.local)
**Problem**: The `.env.local` file was configured for production, causing localhost requests to redirect to `https://www.simplifyconvert.com`

**Changes Made**:
- ✅ `NODE_ENV` changed from `production` to `development`
- ✅ `NEXTAUTH_URL` changed from `https://www.simplifyconvert.com` to `http://localhost:3000`
- ✅ Added `AUTH_URL=http://localhost:3000` for additional safety
- ✅ `DEBUG` changed from `false` to `true`

**Impact**: All auth redirects will now stay local at `http://localhost:3000` instead of going to production.

### 2. Admin Bootstrap Script
**Created**: `scripts/create-admin.ts`

This script allows you to create or update an admin user in the database with:
- Email: `raghavaboyi@gmail.com`
- Role: `admin`

**How to use**:
```bash
# Create/verify admin user
npm run create-admin
```

**What it does**:
- ✅ Checks if user with email `raghavaboyi@gmail.com` exists
- ✅ If user exists and is already admin → logs success, exits
- ✅ If user exists but is not admin → upgrades to admin role
- ✅ If user doesn't exist → creates new admin user

### 3. Added npm Script
Updated `package.json` to add:
```json
"create-admin": "npx ts-node scripts/create-admin.ts"
```

---

## 📋 Quick Start - Getting Admin Access

### Step 1: Fix Environment (DONE ✅)
The `.env.local` has been updated. You're ready to go.

### Step 2: Start Development Server
```bash
npm run dev
```

**Note**: If you see `Exit Code: 1`, see troubleshooting section below.

### Step 3: Create Admin User
In a **new terminal**, run:
```bash
npm run create-admin
```

Expected output:
```
[AdminBootstrap] Starting admin user creation...
[AdminBootstrap] Target email: raghavaboyi@gmail.com
[AdminBootstrap] ✅ Admin user created successfully: {
  id: 'xxxxx',
  email: 'raghavaboyi@gmail.com',
  name: 'Admin User',
  role: 'admin',
  createdAt: 2024-...
}
[AdminBootstrap] ✅ Script completed successfully
```

### Step 4: Test Local Admin Access

#### Via Google OAuth (if configured):
1. Visit `http://localhost:3000/admin`
2. You'll be redirected to `/auth/signin`
3. Click "Sign in with Google"
4. Sign in with the account associated with `raghavaboyi@gmail.com`
5. You should be redirected to the admin dashboard

#### Via Direct Database (for testing):
If you haven't configured Google OAuth, you can:
1. Manually create a session by updating the database
2. Or set up OAuth (see section below)

### Step 5: Verify Audit Dashboard Works
1. Visit `http://localhost:3000/admin/audit-testing`
2. You should see the audit dashboard (no 404 error)
3. The page should NOT redirect to production

---

## 🔧 Troubleshooting

### Issue: `npm run dev` fails with Exit Code 1

**Possible Causes**:
1. Missing dependencies
2. TypeScript compilation error
3. Database connection issue
4. Environment variable issue

**Solutions** (in order):

**A. Check Node version**
```bash
node --version  # Should be 18+ or 20+
npm --version   # Should be 10+ or higher
```

**B. Clean install**
```bash
rm -r node_modules package-lock.json
npm install
npm run dev
```

**C. Check database connection**
```bash
# Verify DATABASE_URL is set in .env.local
grep DATABASE_URL .env.local

# Test Prisma connection
npx prisma db push
```

**D. Check TypeScript errors**
```bash
# Look for compilation errors
npm run build
```

**E. View full error logs**
```bash
# Run with verbose output
DEBUG=* npm run dev
```

---

### Issue: "Unauthorized: Admin access required" at `/admin`

**Cause**: User doesn't have admin role

**Solution**:
```bash
# Recreate admin user
npm run create-admin
```

---

### Issue: Redirects to production (`simplifyconvert.com`)

**Cause**: `.env.local` has wrong `NEXTAUTH_URL`

**Solution**:
Verify `.env.local` contains:
```
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
```

Then restart the server:
```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

---

## 🔐 Setting Up Google OAuth (Optional)

If you want to use Google Sign-In locally, you need to set up Google OAuth credentials:

### Step 1: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:3000` to authorized redirect URIs
6. Copy Client ID and Client Secret

### Step 2: Add to `.env.local`
```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

### Step 3: Restart Dev Server
```bash
npm run dev
```

### Step 4: Test Sign-In
1. Visit `http://localhost:3000/auth/signin`
2. Click "Sign in with Google"
3. You'll be redirected to Google login
4. After signing in, you should be redirected to account page or admin dashboard

---

## 📊 Testing Checklist

- [ ] `npm run dev` starts without Exit Code 1
- [ ] Visiting `http://localhost:3000` shows homepage
- [ ] Running `npm run create-admin` completes successfully
- [ ] Admin user shows in database with role = "admin"
- [ ] Visiting `http://localhost:3000/admin` doesn't redirect to production
- [ ] Visiting `http://localhost:3000/admin` either shows admin dashboard or redirects to signin (OK)
- [ ] `/auth/signin` page loads without errors
- [ ] Google Sign-In button is clickable (if OAuth configured)
- [ ] After signing in, `/admin/audit-testing` loads without 404 errors
- [ ] Audit dashboard shows test triggers and results
- [ ] NO redirects to `simplifyconvert.com` occur during local development

---

## 🚨 Important Environment Safety Checks

The following safeguards are now in place to prevent production redirects during local development:

### In `.env.local` (Protected):
```bash
# ❌ WRONG for local development:
NODE_ENV=production
NEXTAUTH_URL=https://simplifyconvert.com

# ✅ CORRECT for local development:
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
```

### Never Do This:
❌ Don't use production URLs in local development environment
❌ Don't commit `.env.local` with production settings
❌ Don't set `NODE_ENV=production` for `npm run dev`

### Always Do This:
✅ Use `http://localhost:3000` for `NEXTAUTH_URL` locally
✅ Use `NODE_ENV=development` for development
✅ Keep separate `.env.local` for development and `.env.production` for production

---

## 📝 File Changes Summary

| File | Change | Status |
|------|--------|--------|
| `.env.local` | Updated to use localhost, set NODE_ENV=development | ✅ Complete |
| `scripts/create-admin.ts` | Created new admin bootstrap script | ✅ Complete |
| `package.json` | Added `"create-admin"` npm script | ✅ Complete |
| `lib/auth/admin.ts` | No changes needed (already configured) | ✅ Ready |
| `lib/auth/config.ts` | No changes needed (already configured) | ✅ Ready |
| `app/admin/layout.tsx` | No changes needed (already configured) | ✅ Ready |

---

## 🔗 Related Files

- Auth config: [lib/auth/config.ts](lib/auth/config.ts)
- Admin utilities: [lib/auth/admin.ts](lib/auth/admin.ts)
- Admin layout: [app/admin/layout.tsx](app/admin/layout.tsx)
- Sign-in page: [app/auth/signin/page.tsx](app/auth/signin/page.tsx)
- Bootstrap script: [scripts/create-admin.ts](scripts/create-admin.ts)

---

## ✅ Next Steps

1. **Verify dev server starts**: `npm run dev`
2. **Create admin user**: `npm run create-admin`
3. **Test admin access**: Visit `http://localhost:3000/admin`
4. **Test audit dashboard**: Visit `http://localhost:3000/admin/audit-testing`
5. **Review audit logs**: Check for [AUDIT], [QUEUE], [WORKER] prefixed logs in console

---

**Last Updated**: 2024
**Status**: ✅ Ready for testing
