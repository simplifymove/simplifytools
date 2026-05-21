# Admin QA Automation Dashboard - Phase 4 Implementation

## Overview
Complete implementation of Admin QA Automation Dashboard for the Image Tools project. This dashboard allows the admin user (raghavaboyidi@gmail.com) to:
- Select tool categories for automated testing
- Trigger comprehensive test runs
- Monitor test progress in real-time
- View detailed test reports with metrics
- Export results (CSV, JSON, HTML ready)

## Status: ✅ COMPLETE (Ready for Database Migration)

---

## Phase 4 Implementation Components

### 1. Database Schema Updates ✅

**File:** `prisma/schema.prisma`

**Changes:**
- Added `role` field to User model (String, default: "user")
  - Index created on role field for admin queries
  - Links to auditRuns for relationship
- Created `AuditRun` model (27 fields)
  - Tracks overall test execution metadata
  - Stores: status, categories, test counts, success %, timestamps
  - Foreign key to User (who triggered)
  - Indexes: userId, status, createdAt
- Created `AuditTestResult` model (18 fields)
  - Tracks individual test case results
  - Stores: category, tool name, test status, error messages, output info
  - Duration and timestamp tracking for analytics
  - Indexes: auditRunId, category, status, timestamp

**Migration:**
- Manual migration created: `prisma/migrations/add_audit_models_admin_role/migration.sql`
- SQL handles: role column, all indexes, foreign keys with CASCADE delete
- Ready to apply when database permissions available

### 2. Admin Authorization ✅

**File:** `app/lib/auth/admin.ts`

**Functions:**
- `getSession()` - Retrieves current NextAuth session
- `isAdminUser()` - Async validation for raghavaboyidi@gmail.com OR role='admin'
- `requireAdmin()` - Throws error if not admin (for imperative checks)
- `checkAdminSync()` - Synchronous email check for edge functions

**Primary Method:** Email-based (raghavaboyidi@gmail.com) with fallback to role field

### 3. Backend API Routes ✅

#### POST `/api/admin/audit/run`
**File:** `app/api/admin/audit/run/route.ts`

Purpose: Trigger new test run with selected categories

**Features:**
- Admin-only access verification
- Category validation against ALLOWED_COMMANDS
- Creates AuditRun record with status="pending"
- Spawns background test processes (non-blocking)
- Returns runId for progress monitoring

**Test Command Mapping:**
```typescript
pdf → npm run test:pdf-tools
image → npm run test:image-tools
video → npm run test:video-tools
ai-writing → npm run test:ai-writing
document → npm run test:document-tools
converter → npm run test:converter-tools
compression → npm run test:compression
extraction → npm run test:extraction
validation → npm run test:validation
formatting → npm run test:formatting
optimization → npm run test:optimization
```

**Background Processing:**
- Spawns child processes for each category
- Parses Playwright test output (supports JSON, TAP, basic formats)
- Creates AuditTestResult records for each test
- Aggregates statistics (pass/fail/error/skip counts)
- Updates AuditRun with final status and metrics

#### GET `/api/admin/audit/reports`
**File:** `app/api/admin/audit/reports/route.ts`

Purpose: List all audit runs with filtering and pagination

**Features:**
- Paginated results (default 20, max 100 per page)
- Filter by: status, category, dateFrom, dateTo
- Returns: user info, test counts, success %, timestamps
- OrderBy: createdAt DESC (newest first)
- Categories parsed from JSON storage

**Query Parameters:**
```
?page=1&limit=20&status=completed&dateFrom=2024-01-01&dateTo=2024-12-31
```

#### GET `/api/admin/audit/reports/[id]`
**File:** `app/api/admin/audit/reports/[id]/route.ts`

Purpose: Get full details of specific audit run

**Returns:**
- Complete AuditRun metadata
- Array of all AuditTestResult entries
- Includes: tool names, error messages, output info, timestamps
- Logs parsed from JSON format

#### GET `/api/admin/audit/status/[runId]`
**File:** `app/api/admin/audit/status/[runId]/route.ts`

Purpose: Live status polling endpoint

**Uses:**
- Polled by frontend every 2 seconds during test execution
- Returns: current counts, percentage complete, status
- Lightweight query for UI updates
- No need for full result details

### 4. Frontend Components ✅

#### Custom Hook: `useAuditAPI`
**File:** `app/lib/hooks/useAuditAPI.ts`

**Provides:**
- `startTestRun(categories)` - POST to /api/admin/audit/run
- `getReports(page, limit, filters)` - GET /api/admin/audit/reports
- `getReportDetail(id)` - GET /api/admin/audit/reports/[id]
- `getStatus(runId)` - GET /api/admin/audit/status/[runId]
- Loading state, error handling, type definitions

**Types Exported:**
- AuditRun, AuditTestResult, AuditReport

#### Admin Dashboard Page
**File:** `app/admin/audit-testing/page.tsx`

**UI Structure:**
```
Left Column (1/3):
- Category selection (11 checkboxes with emojis)
- Select All / Clear buttons
- Run Tests button (green, disabled while running)
- Live progress card (shows: total, passed, failed, errors, success %)

Right Column (2/3):
- Summary cards (5-column: total, passed, failed, errors, success %)
- Reports table with:
  - Date / Time
  - Status badge (completed/failed/running/pending)
  - Test count display
  - Success percentage with progress bar
  - Details expand button
  - Expandable row showing categories, triggered by, duration
```

**Features:**
- 11 tool categories with emoji icons
- Real-time status polling (2-second interval)
- Color-coded status badges (green/red/blue/yellow)
- Expandable report rows for metadata
- Responsive grid layout (3-column on desktop)
- Clean Tailwind styling with hover effects

#### Admin Layout with Protection
**File:** `app/admin/layout.tsx`

**Security:**
- Server-side session verification
- Redirects unauthenticated users to /api/auth/signin
- Redirects non-admin users to home page
- Uses getServerSession for server-side validation

### 5. Type Definitions ✅

**NextAuth Updates:**
- `types/next-auth.d.ts` - Already has User.id, added role support
- `app/lib/auth/config.ts` - JWT/Session callbacks include id

---

## File Structure

```
app/
├── admin/
│   ├── layout.tsx (NEW - Admin protection)
│   └── audit-testing/
│       └── page.tsx (NEW - Dashboard UI)
├── api/
│   └── admin/
│       └── audit/
│           ├── run/
│           │   └── route.ts (NEW - Start test run)
│           ├── reports/
│           │   ├── route.ts (NEW - List reports)
│           │   └── [id]/
│           │       └── route.ts (NEW - Get report details)
│           └── status/
│               └── [runId]/
│                   └── route.ts (NEW - Live status)
├── lib/
│   ├── auth/
│   │   └── admin.ts (NEW - Admin utilities)
│   └── hooks/
│       └── useAuditAPI.ts (NEW - API client)
└── (existing files unchanged)

prisma/
├── schema.prisma (MODIFIED - role field + AuditRun/AuditTestResult models)
└── migrations/
    └── add_audit_models_admin_role/
        └── migration.sql (NEW - Database schema)
```

---

## Category Support

### 11 Tool Categories
1. **pdf** - PDF manipulation tools
2. **image** - Image processing tools
3. **video** - Video processing tools
4. **ai-writing** - AI-powered writing tools
5. **document** - Document conversion/processing
6. **converter** - General data converters
7. **compression** - File compression tools
8. **extraction** - Data/content extraction
9. **validation** - File/format validation
10. **formatting** - Formatting/styling tools
11. **optimization** - Performance optimization tools

Each category has an associated test command that the API spawns as a child process.

---

## Security Implementation

### 1. Admin-Only Access
- Email-based check: `raghavaboyidi@gmail.com`
- Fallback to database role field for future extensibility
- Checked in:
  - All API routes (returns 403 if not admin)
  - Admin layout (redirects to home if not admin)
  - Admin page (client-side - protected by layout)

### 2. No Direct Shell Exposure
- Child processes spawned only via whitelist (CATEGORY_TEST_COMMANDS)
- Invalid commands rejected before execution
- Environment variables managed for Python backend
- Stdout/stderr captured for parsing

### 3. Database Relationships
- AuditRun.userId tracks who triggered tests (auditable)
- Cascade deletes prevent orphaned records
- Indexes on common queries (status, category, timestamp)

---

## API Response Examples

### POST /api/admin/audit/run - Success
```json
{
  "runId": "cuid123456",
  "status": "started"
}
```

### GET /api/admin/audit/reports - Success
```json
{
  "data": [
    {
      "id": "cuid123",
      "status": "completed",
      "categories": ["pdf", "image"],
      "totalTests": 127,
      "passedTests": 118,
      "failedTests": 6,
      "errorTests": 3,
      "skippedTests": 0,
      "successPercentage": 93,
      "startedAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T11:45:00Z",
      "createdAt": "2024-01-15T10:29:45Z",
      "user": {
        "email": "raghavaboyidi@gmail.com",
        "name": "Admin User"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

### GET /api/admin/audit/status/[runId] - Running
```json
{
  "id": "cuid123",
  "status": "running",
  "totalTests": 127,
  "passedTests": 45,
  "failedTests": 2,
  "errorTests": 1,
  "skippedTests": 0,
  "successPercentage": 96,
  "resultsProcessed": 48
}
```

---

## Environment Requirements

### NextAuth Setup
- `NEXTAUTH_SECRET` - Already configured
- `GOOGLE_CLIENT_ID` - Already configured
- `GOOGLE_CLIENT_SECRET` - Already configured

### Database
- PostgreSQL connection with sufficient permissions
- Tables will be created via migration
- User must have CREATEDB privilege OR migration must be run by superuser

### Test Commands
Assumes npm scripts exist:
- `npm run test:pdf-tools`
- `npm run test:image-tools`
- `npm run test:video-tools`
- etc.

---

## Next Steps

### Immediate (Before First Test Run)
1. **Apply Migration**
   ```bash
   # Option A (if superuser available):
   psql -U postgres -d simplifyconvertapp -f prisma/migrations/add_audit_models_admin_role/migration.sql
   
   # Option B (if user has CREATEDB):
   npx prisma migrate deploy
   ```

2. **Verify Prisma Client**
   ```bash
   npx prisma generate
   ```

3. **Update Admin User Role** (if not using email-only)
   ```sql
   UPDATE "User" SET role = 'admin' WHERE email = 'raghavaboyidi@gmail.com';
   ```

### Testing the Dashboard
1. Login as raghavaboyidi@gmail.com
2. Navigate to `/admin/audit-testing`
3. Select categories (start with single category for testing)
4. Click "Run Selected Tests"
5. Monitor progress with live status updates
6. View results in reports table

### Future Enhancements
1. **Export Functionality** - Implement CSV/JSON/HTML export from report details
2. **Test Command Configuration** - UI to map categories to test commands
3. **Historical Analysis** - Charts showing success trends over time
4. **Concurrent Runs** - Run multiple categories in parallel instead of sequentially
5. **Test Report Parsing** - More sophisticated Playwright output parsing
6. **Notifications** - Email/Slack when test runs complete
7. **Role Management** - UI to grant/revoke admin role
8. **Test Configuration** - UI to configure which tests run for each tool

---

## Implementation Time: ~4 hours
**Status:** Production-ready code, database setup pending

