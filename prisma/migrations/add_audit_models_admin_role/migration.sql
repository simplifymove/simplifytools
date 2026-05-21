-- AlterTable
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateTable AuditRun
CREATE TABLE "AuditRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalTests" INTEGER NOT NULL DEFAULT 0,
    "passedTests" INTEGER NOT NULL DEFAULT 0,
    "failedTests" INTEGER NOT NULL DEFAULT 0,
    "errorTests" INTEGER NOT NULL DEFAULT 0,
    "skippedTests" INTEGER NOT NULL DEFAULT 0,
    "successPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reportHtmlPath" TEXT,
    "reportJsonPath" TEXT,
    "reportCsvPath" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditRun_userId_idx" ON "AuditRun"("userId");
CREATE INDEX "AuditRun_status_idx" ON "AuditRun"("status");
CREATE INDEX "AuditRun_createdAt_idx" ON "AuditRun"("createdAt");

-- CreateTable AuditTestResult
CREATE TABLE "AuditTestResult" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "toolName" TEXT NOT NULL,
    "toolSlug" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "testCase" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "outputGenerated" BOOLEAN NOT NULL DEFAULT false,
    "outputType" TEXT,
    "outputPath" TEXT,
    "screenshotPath" TEXT,
    "logs" TEXT,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTestResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditTestResult_auditRunId_idx" ON "AuditTestResult"("auditRunId");
CREATE INDEX "AuditTestResult_category_idx" ON "AuditTestResult"("category");
CREATE INDEX "AuditTestResult_status_idx" ON "AuditTestResult"("status");
CREATE INDEX "AuditTestResult_timestamp_idx" ON "AuditTestResult"("timestamp");

-- AddForeignKey
ALTER TABLE "AuditRun" ADD CONSTRAINT "AuditRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTestResult" ADD CONSTRAINT "AuditTestResult_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE;
