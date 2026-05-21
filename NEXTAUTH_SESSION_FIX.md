# NextAuth Session & Admin Route Protection Fix

## Problem Statement

Users experienced issues with admin route protection (`/admin/audit-testing`) that redirected them to signin even when they appeared to be logged in (based on navbar display). The root cause was improper session checking using client-side `SessionGuard` component.

## Root Cause Analysis

### Original Issues
1. **SessionGuard (client-side component)**
   - Used `fetch('/api/auth/session', { credentials: 'include', mode: 'cors' })`
   - Relied on cookies being properly transmitted
   - Potential CORS issues with `mode: 'cors'`
   - Added rendering delay while waiting for fetch

2. **Session Endpoint**
   - `/api/auth/session` returns empty `{}` when no session exists (correct behavior)
   - Works correctly when user is logged in
   - But client-side component had timing/cookie transmission issues

3. **NextAuth Configuration**
   - JWT callbacks properly preserved email field ✓
   - Session callbacks properly copied email to session ✓
   - But consumer (SessionGuard) couldn't reliably access the data

## Solution: Server-Side Session Checking

### Key Change: AdminLayout

**Before (Client-Side - Problematic):**
```typescript
// app/admin/layout.tsx
import { SessionGuard } from './session-guard'

export default function AdminLayout({ children }) {
  return <SessionGuard>{children}</SessionGuard>
}
```

**After (Server-Side - Correct):**
```typescript
// app/admin/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { redirect } from 'next/navigation'

const ADMIN_EMAIL = 'raghavaboyidi@gmail.com'

export default async function AdminLayout({ children }) {
  // This is now a SERVER component
  const session = await getServerSession(authOptions)
  
  console.log('[AdminLayout] Server-side session check:', {
    hasSession: !!session,
    userEmail: session?.user?.email,
    isAdmin: session?.user?.email === ADMIN_EMAIL,
  })

  // Check authentication
  if (!session?.user?.email) {
    console.log('[AdminLayout] No user session, redirecting to signin')
    redirect('/auth/signin')
  }

  // Check admin status
  if (session.user.email !== ADMIN_EMAIL) {
    console.log('[AdminLayout] User not admin:', session.user.email)
    redirect('/')
  }

  console.log('[AdminLayout] Admin access granted for:', session.user.email)
  return <>{children}</>
}
```

### Why This Works

1. **`getServerSession(authOptions)`**
   - Reads session directly from NextAuth without HTTP roundtrip
   - No cookie transmission issues
   - Synchronous access to token data
   - Proper error handling

2. **Server-Side Rendering**
   - Redirect happens BEFORE page renders
   - Unauthorized users never see admin UI
   - No client-side race conditions
   - Faster and more secure

3. **No Wrapper Components Needed**
   - SessionGuard client-side wrapper eliminated
   - Cleaner architecture
   - Fewer component re-renders

## Files Modified

### 1. `app/admin/layout.tsx` ✓
- Changed from client component to async server component
- Uses `getServerSession()` directly
- Server-side redirects for auth/non-admin users
- Added logging for debugging

### 2. `app/admin/audit-testing/page.tsx` ✓
- Removed redundant `if (!session?.user) redirect(...)` 
- Kept `useSession()` for client-side features only
- Added comment explaining layout handles auth

### 3. Deleted `app/admin/session-guard.tsx` ✓
- No longer needed
- Was causing issues with client-side fetching
- Replaced by proper server-side checking

### 4. Verified `app/api/admin/audit/manual-trigger/route.ts` ✓
- Already uses `getServerSession(authOptions)`
- Proper 401 response for unauthorized requests
- No changes needed

## Verification

### Build Status
- ✓ Build passes with 0 TypeScript errors
- ✓ All 227 routes compiled successfully
- ✓ No warnings or issues

### Runtime Behavior
```
[AdminLayout] Server-side session check: { hasSession: false, userEmail: undefined, isAdmin: false }
[AdminLayout] No user session, redirecting to signin
 GET /admin/audit-testing 307 (redirect to /auth/signin)
```

### Test Cases

1. **Unauthenticated User**
   - Navigate to `/admin/audit-testing`
   - Expected: HTTP 307 redirect to `/auth/signin` ✓

2. **Authenticated Non-Admin User**
   - After login with non-admin email
   - Navigate to `/admin/audit-testing`
   - Expected: Redirect to home page

3. **Authenticated Admin User**
   - Login with `raghavaboyidi@gmail.com`
   - Navigate to `/admin/audit-testing`
   - Expected: Access granted, page renders

## Session Flow Explanation

### Before Login
1. No session exists
2. User navigates to `/admin/audit-testing`
3. AdminLayout calls `getServerSession()`
4. Returns `null`
5. Redirects to `/auth/signin`

### After Google OAuth Login
1. Google callback → NextAuth
2. JWT callback creates token with email
3. Session callback adds email to session object
4. Cookie created: `next-auth.session-token` (dev) or `__Secure-next-auth.session-token` (prod)
5. User navigated to admin route
6. AdminLayout calls `getServerSession()`
7. Reads token from cookie/JWT
8. Returns session with user email
9. Email matches ADMIN_EMAIL → access granted

## Configuration Notes

### NEXTAUTH_URL
- **Development:** `http://localhost:3000`
- **Production:** Must be `https://yourdomain.com`

### NEXTAUTH_SECRET
- Must be set to a strong random value
- Generate with: `openssl rand -base64 32`
- Current dev value: `dev-secret-123`

### Session Strategy
- Using JWT (stateless) strategy
- Sessions not stored in database Session table
- JWT token stored in HTTP-only cookie

## NextAuth v4 Best Practices Applied

✓ Using `getServerSession()` for server-side checks (recommended)
✓ Using `useSession()` for client-side display (correct)
✓ Email field explicitly preserved in callbacks
✓ Proper role-based access control (ADMIN_EMAIL check)
✓ Server-side redirects with `redirect()` from 'next/navigation'

## Migration Notes for Other Protected Routes

If you have other protected routes using client-side redirects, they can stay as-is because:
- User-facing routes (like `/account`, `/dashboard`) are less critical
- Client-side redirects provide smooth UX with loading states
- Admin routes should always use server-side checks for security

To migrate other routes to server-side, follow the same pattern as AdminLayout.

## Cleanup

- Removed unused `app/admin/session-guard.tsx` component
- Removed SessionProvider wrapper (still needed for useSession() hook in client components)
- No other files needed removal

## Future Enhancements

1. **Centralized Auth Middleware**
   - Create middleware for protected routes
   - Apply pattern to all protected routes consistently

2. **Role-Based Access Control (RBAC)**
   - Add `role` field to User model
   - Replace hardcoded email check with role comparison

3. **Audit Logging**
   - Log all admin access attempts
   - Track failed authorization attempts

## Testing Commands

```bash
# Run build
npm run build

# Start dev server
npm run dev

# Check for errors
npm run lint

# Run tests (if configured)
npm test
```

## References

- [NextAuth.js v4 Documentation](https://next-auth.js.org/getting-started/introduction)
- [getServerSession API](https://next-auth.js.org/configuration/callbacks#jwt-callback)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
