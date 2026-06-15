# 404 Error Debug: PDF Tools Audit Failing

## Problem Statement

When running "PDF Tools" from `/admin/audit-testing`:
- Frontend shows: FAILED, 0 tests, 0 passed, 0 failed, duration 0s
- Browser console shows: 404 error on API call

## Root Cause Analysis

A 404 error means the API route is not being found. Let's trace through all possibilities.

---

## Step 1: Verify Route Exists

### File Structure Check
```
app/
  └── api/
      └── admin/
          └── audit/
              └── manual-trigger/
                  └── route.ts  ← This file must exist
```

### Verify the file exists:
```bash
ls -la c:\simplifytools\app\api\admin\audit\manual-trigger\route.ts
# Should return the file, not "file not found"
```

### If not found:
- Create the directory structure first:
  ```bash
  mkdir -p c:\simplifytools\app\api\admin\audit\manual-trigger
  ```

### If found, check the file contains a POST handler:
```bash
grep "export async function POST" c:\simplifytools\app\api\admin\audit\manual-trigger\route.ts
# Should return the export statement
```

---

## Step 2: Verify Import/Export Syntax

The route file must export async functions named POST and GET.

**Correct format:**
```typescript
export async function POST(req: NextRequest) {
  // implementation
}

export async function GET() {
  // implementation
}
```

**Common mistakes:**
- ❌ `function POST()` - missing `export async`
- ❌ `export default function POST` - must use `export async function`
- ❌ `export const POST` - must be `export async function`

### Check yours:
```bash
grep -A2 "export.*function.*POST" c:\simplifytools\app\api\admin\audit\manual-trigger\route.ts
```

---

## Step 3: Verify Next.js App Router

Next.js 14 uses the App Router (not Pages Router).

### Check app router is enabled:
```bash
# File should exist:
ls c:\simplifytools\app

# app/layout.tsx should exist:
ls c:\simplifytools\app\layout.tsx
```

### If using app router, routes must be under `app/api/` (not `pages/api/`)

**Correct path:**
```
app/api/admin/audit/manual-trigger/route.ts
```

**Incorrect path:**
```
pages/api/admin/audit/manual-trigger.ts  ← WRONG! This is Pages Router
```

---

## Step 4: Verify Next.js Build

The 404 might be because the app needs rebuilding.

### Rebuild:
```bash
cd c:\simplifytools
npm run build
npm run dev
```

### Check for build errors:
```bash
npm run build 2>&1 | grep -i error
```

---

## Step 5: Verify Frontend URL

The frontend must call the correct URL.

### Check what URL the frontend is using:

**Browser DevTools:**
1. Open DevTools → Network tab
2. Click "Run Selected Audits"
3. Look for the POST request
4. Check the request URL

**Should be:**
```
POST /api/admin/audit/manual-trigger
```

**Not:**
```
POST /api/admin/audit/run
POST /admin/audit/manual-trigger
POST /audit/manual-trigger
POST /api/audit/trigger
```

### Find the frontend code:
```bash
grep -r "manual-trigger" c:\simplifytools\app --include="*.tsx" --include="*.ts"
```

### Should find something like:
```typescript
const response = await fetch('/api/admin/audit/manual-trigger', {
  method: 'POST',
  ...
})
```

---

## Step 6: Verify Middleware Doesn't Block Route

Check if any middleware is blocking the route:

```bash
# Look for middleware:
ls c:\simplifytools\middleware.ts

# If exists, check if it allows /api/admin/audit:
cat c:\simplifytools\middleware.ts | grep -i admin
```

**Common middleware issues:**
```typescript
// ❌ Wrong - blocks all /admin routes
export const config = {
  matcher: ['/admin/:path*']
}

// ✅ Correct - only blocks specific paths
export const config = {
  matcher: ['/admin/dashboard/:path*'] // Allows /api/admin/*
}
```

---

## Step 7: Clear Cache & Restart

Next.js sometimes caches routes incorrectly.

### Clear cache and rebuild:
```bash
cd c:\simplifytools
rm -rf .next node_modules/.cache
npm run dev
```

### If using Docker:
```bash
docker-compose down
docker-compose up --build
```

---

## Step 8: Check Authorization

A 404 might actually be a 401 disguised as 404 due to redirects.

### Check browser Network tab carefully:
1. Right-click the POST request
2. Look at "Response" tab
3. Check status code

**If 401 (Unauthorized):**
```json
{"error": "Unauthorized"}
```

**Fix:** Email must be `raghavaboyidi@gmail.com`

**If 404 (Not Found):**
```json
// Empty or HTML 404 page
```

**Fix:** Route doesn't exist

---

## Step 9: Verify Database Connection

If route exists but returns errors, database might not be connected.

### Check Prisma migrations:
```bash
npm run prisma:migrate:dev
```

### Check database connection:
```bash
npm run prisma:studio
# If this fails, database isn't connected
```

---

## Step 10: Enable Debug Logging

To see what's happening behind the scenes:

### Add temporary logging to API route:

```typescript
export async function POST(req: NextRequest) {
  console.log('[DEBUG] Route hit!');
  console.log('[DEBUG] Method:', req.method);
  console.log('[DEBUG] URL:', req.url);
  
  try {
    const body = await req.json();
    console.log('[DEBUG] Body:', body);
  } catch (e) {
    console.log('[DEBUG] Body parsing error:', e);
  }
  
  // ... rest of implementation
}
```

### Check logs:
```bash
npm run dev
# Watch terminal for [DEBUG] messages
```

---

## Step 11: Test with curl

Bypass the frontend and test the API directly:

```bash
curl -X POST http://localhost:3000/api/admin/audit/manual-trigger \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{"categories":["pdf-tools"],"sequential":true}' \
  -v
```

**Check response:**
- `200` = Success
- `401` = Authentication failed
- `404` = Route not found
- `500` = Server error

---

## Quick Fixes

### Most Common Issues (in order of likelihood):

**1. Route file doesn't exist**
```bash
# Solution: Create it
mkdir -p app/api/admin/audit/manual-trigger
cat > app/api/admin/audit/manual-trigger/route.ts << 'EOF'
export async function POST() {
  return Response.json({ message: 'OK' })
}
EOF
```

**2. Route hasn't been deployed**
```bash
# Solution: Rebuild
npm run build && npm run dev
```

**3. Using Pages Router instead of App Router**
```bash
# Solution: Move from pages/api/ to app/api/
# Or check if using pages vs app correctly
```

**4. Middleware blocking route**
```bash
# Solution: Update middleware to allow /api/admin/audit
```

**5. Wrong authentication email**
```bash
# Solution: Login with raghavaboyidi@gmail.com
```

---

## Verification Checklist

Use this checklist to verify each requirement:

- [ ] File exists: `app/api/admin/audit/manual-trigger/route.ts`
- [ ] Has `export async function POST`
- [ ] Has `export async function GET`
- [ ] Next.js is in app router mode (uses `app/` not `pages/`)
- [ ] No middleware blocking `/api/admin/*`
- [ ] Database connection works (`npm run prisma:studio`)
- [ ] npm has been run: `npm run build`
- [ ] Dev server running: `npm run dev`
- [ ] Authentication email is correct
- [ ] Browser can access route via curl

If all pass but still getting 404, the issue is likely in the build or caching system.

---

## Nuclear Option: Reset Everything

If nothing works, reset the entire audit system:

```bash
# 1. Clear Next.js build
rm -rf .next

# 2. Clear cache
rm -rf node_modules/.cache

# 3. Rebuild
npm run build

# 4. Start fresh
npm run dev

# 5. Test again
curl http://localhost:3000/api/admin/audit/manual-trigger
```

If this still doesn't work, check:
- Node.js version (should be 18+)
- Next.js version (should be 14+)
- TypeScript configuration
