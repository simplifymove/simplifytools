# Phase 5: Manual Testing Guide - Admin Dashboard Verification

**Purpose:** Complete manual verification of the Admin QA Dashboard after automated tests pass  
**Prerequisites:** Dev server running on localhost:3000 with all build errors fixed  
**Estimated Time:** 30 minutes  
**Admin Account:** raghavaboyidi@gmail.com (requires Google OAuth access)

---

## Pre-Test Checklist

Before starting manual tests, verify:

- [ ] Dev server is running (`npm run dev`)
- [ ] No build errors (`npm run build` passed)
- [ ] Database migration applied (`npx prisma migrate deploy` succeeded)
- [ ] Test commands added to package.json (`npm run test:pdf-tools` exists)
- [ ] Playwright installed (`npm list @playwright/test` shows version)
- [ ] PostgreSQL accessible and database created
- [ ] Environment variables set (.env.local exists)

---

## Test 1: Admin Login Flow

**Objective:** Verify authentication and dashboard loading

### Steps:
1. Open browser: `http://localhost:3000/admin/audit-testing`
2. Verify: Page redirects to Google sign-in
3. Click: "Sign In with Google"
4. Enter: `raghavaboyidi@gmail.com`
5. Complete OAuth authentication
6. Verify: Dashboard page loads successfully

### Expected Results:
```
✓ Google OAuth redirects correctly
✓ Admin email accepted without errors
✓ Dashboard displays after authentication
✓ URL changes back to http://localhost:3000/admin/audit-testing
✓ "Sign out" button visible (indicates authenticated)
```

### If Test Fails:
- Check Google OAuth credentials in .env.local
- Verify `NEXTAUTH_URL` matches deployed URL
- Check browser console for error messages
- Verify session cookie in browser DevTools

---

## Test 2: Dashboard UI Verification

**Objective:** Confirm all UI elements render correctly

### Step 1: Check Category Checkboxes
1. Verify 11 category checkboxes visible:
   - PDF Tools
   - Image Tools
   - Video Tools
   - AI Writing
   - Document Tools
   - Converter Tools
   - Compression
   - Extraction
   - Validation
   - Formatting
   - Optimization

### Step 2: Check Control Buttons
1. Find "Select All" button - click it
   - Result: All 11 checkboxes should become checked
2. Find "Clear All" button - click it
   - Result: All checkboxes should uncheck
3. Select "PDF Tools" checkbox only
4. Verify "Run Selected Tests" button is enabled (not grayed out)

### Step 3: Check Live Progress Section
1. Verify section visible but empty (no running tests)
2. Check for these display fields:
   - Status: (should be empty or "idle")
   - Total Tests:
   - Passed:
   - Failed:
   - Errors:
   - Success %:

### Step 4: Check Reports Table
1. Verify table visible with columns:
   - Timestamp
   - Status (badge)
   - Test Count
   - Success %
   - Expand button (arrow)
2. If previous test runs exist, verify rows display

### Expected Results:
```
✓ All 11 categories visible with descriptions
✓ Select All selects all checkboxes
✓ Clear All deselects all checkboxes
✓ Run Tests button toggles enabled/disabled based on selection
✓ Live progress section renders
✓ Reports table displays with correct columns
```

---

## Test 3: Single Category Test Run

**Objective:** Trigger test execution and monitor progress

### Steps:
1. Click "Clear All" to start fresh
2. Select only "PDF Tools" checkbox
3. Verify "Run Selected Tests" button is enabled
4. Click "Run Selected Tests"
5. Monitor for 5 seconds
6. Verify progress updates

### Expected Results:
```
✓ "Run Selected Tests" button becomes disabled
✓ Live progress section appears/becomes active
✓ Status shows: "RUNNING" with blue color and spinning icon
✓ Counts begin updating (Total Tests, Passed, etc.)
✓ Progress updates visible every 2 seconds
✓ No error messages appear
```

### If Test Stalls:
- Check browser console for JavaScript errors
- Verify backend logs for API errors
- Check if Playwright is installed: `npm list @playwright/test`
- Check if test command exists: `npm run test:pdf-tools`

---

## Test 4: Monitor Test Execution

**Objective:** Verify live progress polling and real-time updates

### Steps:
1. Watch the Live Progress Card for 30-60 seconds
2. Monitor these fields:
   - Total Tests: Should increase
   - Passed: Should increase
   - Failed: May increase
   - Success %: Should update based on passed/total
   - Status: Should remain "RUNNING"

### Data Points to Track:
- Time between updates (should be ~2 seconds)
- Smooth progression (not erratic jumps)
- Logical order (Passed ≤ Total, Failed ≤ Total)
- Percentage calculation: (Passed / Total) * 100 = Success %

### Expected Results:
```
✓ Progress updates every 2-3 seconds
✓ Total tests increase smoothly
✓ Passed count increases logically
✓ Success % updates accordingly
✓ No long delays between updates
✓ Status remains "RUNNING"
✓ No JavaScript errors in console
```

### If Updates Stop:
- Wait 10 seconds (may be processing)
- Check browser console for fetch errors
- Verify backend is still running (`npm run dev` output)
- Check /api/admin/audit/status API response in Network tab

---

## Test 5: Test Completion and Results

**Objective:** Verify test completion and result persistence

### Steps:
1. Wait for Status to change to "COMPLETED" (green)
2. Observe final statistics:
   - Total Tests: Final count
   - Passed: Completed count
   - Failed: Any failures
   - Success %: Final percentage
3. Verify "Run Selected Tests" button becomes enabled again
4. Check Reports Table for new entry
5. Click the expand arrow on the new report

### Expected Results:
```
✓ Status changes to "COMPLETED" with green background
✓ Final statistics display (should match last live update)
✓ "Run Selected Tests" button becomes enabled
✓ New row appears in Reports Table
✓ Row shows today's date/time
✓ Status badge shows "COMPLETED" in green
✓ Test count matches: (Passed + Failed + Errors)
✓ Success % calculates correctly
```

### Expanded Report Details:
When you click expand arrow, should show:
```
Categories Selected: PDF Tools
Triggered By: raghavaboyidi@gmail.com
Duration: X minutes Y seconds
Test Breakdown:
  - Passed: N
  - Failed: N
  - Errors: N
  - Skipped: N
```

### If Results Don't Appear:
- Refresh page manually (F5)
- Wait 5 seconds for database sync
- Check browser Network tab for /api/admin/audit/reports
- Verify PostgreSQL connection in backend logs

---

## Test 6: Database Persistence

**Objective:** Verify test results are saved to PostgreSQL

### Steps:
1. Open PostgreSQL client (psql or DBeaver)
2. Connect to your database
3. Run query:
```sql
SELECT id, "userId", status, "totalTests", "passedTests", "failedTests", "createdAt"
FROM "AuditRun"
ORDER BY "createdAt" DESC
LIMIT 1;
```
4. Verify the most recent run matches your test:
   - Status: COMPLETED
   - totalTests: Matches dashboard
   - passedTests: Matches dashboard
5. Get the `id` from that row
6. Run detailed query:
```sql
SELECT category, status, "testName", "durationMs"
FROM "AuditTestResult"
WHERE "auditRunId" = '<copy-id-here>'
LIMIT 10;
```

### Expected Results:
```
✓ AuditRun record exists in database
✓ Status: COMPLETED
✓ Test counts match dashboard display
✓ createdAt timestamp is recent (within 1 minute)
✓ userId matches authenticated user
✓ AuditTestResult rows exist for the run
✓ Category matches selected (e.g., "pdf")
✓ Individual test names populated
✓ Status for each test is PASS, FAIL, ERROR, or SKIPPED
✓ durationMs is numeric > 0
```

### If Query Returns Empty:
- Verify database URL in .env.local is correct
- Check backend logs for database connection errors
- Verify migration was applied: `npx prisma migrate status`
- Verify tables exist: `\dt` in psql

---

## Test 7: Non-Admin Access Control

**Objective:** Verify authorization blocks non-admin users

### Steps:
1. Logout from admin account (find sign out button)
2. Login with a different email (non-admin)
   - Create a new Google account or use existing non-admin email
3. Try to access: `http://localhost:3000/admin/audit-testing`
4. Check what happens

### Expected Results - Option 1: Redirect
```
✓ Redirected to home page (http://localhost:3000/)
✓ No dashboard visible
✓ No access to admin features
```

### Expected Results - Option 2: 403 Forbidden
```
✓ Error page displays: "403 Forbidden" or "Unauthorized"
✓ Message explains admin access required
✓ Option to sign in as different user
```

### If Non-Admin Can Access:
- Check `lib/auth/admin.ts` - admin verification logic
- Check `app/admin/layout.tsx` - layout protection
- Verify email is NOT added to admin whitelist
- Restart dev server

---

## Test 8: API Security Verification

**Objective:** Verify API endpoints return 403 for non-authenticated requests

### Steps:
1. Open terminal/PowerShell
2. Run curl command (or use Postman):

```bash
curl -X POST http://localhost:3000/api/admin/audit/run \
  -H "Content-Type: application/json" \
  -d '{"categories":["pdf"]}'
```

3. Verify response

### Expected Results:
```
HTTP 403 Forbidden
Response: {"error":"Unauthorized: Admin access required"}
```

### Additional API Tests:
```bash
# Test reports endpoint
curl http://localhost:3000/api/admin/audit/reports

# Test report detail endpoint
curl http://localhost:3000/api/admin/audit/reports/invalid-id

# Test status endpoint
curl http://localhost:3000/api/admin/audit/status/invalid-id
```

All should return HTTP 403 with similar error message.

---

## Test 9: Concurrent Test Prevention

**Objective:** Verify active-run lock prevents duplicate executions

### Steps:
1. Login as admin (raghavaboyidi@gmail.com)
2. Select "PDF Tools" category
3. Click "Run Selected Tests"
4. While test is RUNNING (status = RUNNING), quickly click "Run Selected Tests" again
5. Check for error or behavior

### Expected Results:
```
✓ Second click has no effect or shows error
✓ Error message: "A test run is already in progress"
✓ Only one test executes
✓ Button remains disabled during entire first run
✓ After first run completes, can start new run
```

### If Lock Fails:
- Check `app/api/admin/audit/run/route.ts` for active-run check
- Verify database query: `AuditRun.findFirst({ where: { status: 'RUNNING' } })`
- Check if multiple runs are creating multiple database records (should not happen)

---

## Test 10: Multi-Category Execution

**Objective:** Verify multiple categories can be selected and executed

### Steps:
1. Login as admin
2. Select 3 categories:
   - PDF Tools
   - Image Tools
   - AI Writing
3. Click "Run Selected Tests"
4. Monitor progress
5. Wait for completion

### Expected Results:
```
✓ All 3 categories execute
✓ Progress updates show combined test count
✓ Dashboard shows all 3 in "Categories Selected"
✓ Database record shows all 3 categories
✓ Each category's tests run (may be sequential)
✓ Final success % reflects all tests combined
```

### If One Category Fails:
- Check test command exists in package.json: `npm run test:image-tools`
- Check test file exists: `tests/image-tools.spec.ts`
- Check test file syntax: `npm run build` should catch errors
- Run command manually: `npm run test:image-tools`

---

## Test 11: Error Handling

**Objective:** Verify graceful error handling for edge cases

### Scenario 1: No Categories Selected
**Steps:**
1. Click "Clear All"
2. Try to click "Run Selected Tests"
3. Check if button is disabled

**Expected:** Button disabled, no action taken

### Scenario 2: Missing Test Command
**Steps:**
1. Try to run "Optimization" category (if not implemented)
2. Observe error handling

**Expected:**
```
✓ Error captured gracefully
✓ Dashboard shows error in log
✓ Status changes to FAILED
✓ Button re-enables for retry
✓ Error message is user-friendly (no stack traces)
```

### Scenario 3: Database Connection Error
**Steps:**
1. Simulate by stopping PostgreSQL (advanced test)
2. Try to run test
3. Observe error response

**Expected:**
```
✓ Graceful error message
✓ No server crash
✓ Error logged for debugging
✓ User can retry when database is back online
```

---

## Test 12: Performance & Stability

**Objective:** Verify dashboard remains responsive during long test runs

### Steps:
1. Run a 5+ minute test (if available: "Converter Tools" or "Compression")
2. While running:
   - Scroll dashboard
   - Click on previous reports
   - Refresh page
3. Monitor responsiveness

### Expected Results:
```
✓ Dashboard remains responsive while test runs
✓ Scrolling smooth (no freezing)
✓ Progress updates continue every 2-3 seconds
✓ Can navigate to other reports without stopping test
✓ Refresh doesn't interrupt test execution (continues in background)
✓ Browser memory usage stable (check DevTools)
```

### If Performance Degrades:
- Check browser console for errors
- Monitor Network tab for excessive API calls
- Check backend logs for slow database queries
- Consider reducing polling frequency if CPU usage high

---

## Test 13: Report History Navigation

**Objective:** Verify can view previous test runs

### Steps:
1. After multiple test runs, scroll Reports Table
2. Check if pagination controls visible (next/previous)
3. Click on older reports
4. Expand each report to see details

### Expected Results:
```
✓ Multiple reports visible in table
✓ Sorted by date (newest first)
✓ Can expand any report to see details
✓ Details show correct: categories, timestamp, counts
✓ Pagination works if more than 20 reports
✓ Search/filter functions (if implemented)
```

---

## Troubleshooting Guide

### Issue: 403 Unauthorized on API
**Solution:**
- Verify authenticated: Check for "Sign out" button
- Check cookie: Open DevTools → Application → Cookies
- Verify admin email: raghavaboyidi@gmail.com
- Try logging out and back in

### Issue: Progress Updates Stop
**Solution:**
- Check browser console: Open DevTools → Console
- Check Network tab: Look for failed fetch calls to /api/admin/audit/status
- Verify backend: Check `npm run dev` terminal for errors
- Check database: Verify PostgreSQL still connected

### Issue: Test Never Starts
**Solution:**
- Verify test command: `npm run test:pdf-tools` works manually
- Check Playwright: `npm list @playwright/test`
- Check test file exists: Look for `tests/pdf-tools.spec.ts`
- Check error logs: Look in browser console and backend

### Issue: Database Shows No Data
**Solution:**
- Verify migration: `npx prisma migrate status`
- Check database URL: Verify .env.local correct
- Check connection: Test manually with `psql`
- Verify tables: `\dt` in psql should list `AuditRun` and `AuditTestResult`

### Issue: Non-Admin Can Access Admin Page
**Solution:**
- Check admin email: Verify your email in `lib/auth/admin.ts`
- Clear cookies: Logout completely and back in
- Check role: Query database: `SELECT "role" FROM "User" WHERE email = 'your@email.com'`
- Restart dev server: Kill and restart `npm run dev`

---

## Success Criteria

All of the following must be TRUE for Phase 5 verification to be complete:

- [ ] Admin login successful with raghavaboyidi@gmail.com
- [ ] Dashboard loads without errors
- [ ] All 11 categories visible and selectable
- [ ] Test execution starts and completes successfully
- [ ] Live progress updates every 2-3 seconds
- [ ] Final results display correctly
- [ ] New report appears in database
- [ ] Non-admin users cannot access admin dashboard
- [ ] API returns 403 for unauthenticated requests
- [ ] Active-run lock prevents concurrent execution
- [ ] Multiple category execution works
- [ ] Error handling is graceful
- [ ] Dashboard remains responsive during tests
- [ ] Report history navigation works

**Status: PASS when 13/13 criteria met ✅**

---

## Sign-Off

| Component | Status | Tester | Date |
|-----------|--------|--------|------|
| Admin Auth | ⏳ | | |
| Dashboard UI | ⏳ | | |
| Single Category Run | ⏳ | | |
| Progress Monitoring | ⏳ | | |
| Completion & Results | ⏳ | | |
| Database Persistence | ⏳ | | |
| Non-Admin Access | ⏳ | | |
| API Security | ⏳ | | |
| Concurrent Prevention | ⏳ | | |
| Multi-Category | ⏳ | | |
| Error Handling | ⏳ | | |
| Performance | ⏳ | | |
| Report History | ⏳ | | |

**Final Status:** ⏳ Awaiting Manual Testing

---

**Document Version:** 1.0  
**Created:** May 20, 2026  
**Last Updated:** May 20, 2026
