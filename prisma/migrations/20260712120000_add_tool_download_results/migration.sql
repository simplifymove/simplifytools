CREATE TYPE "ToolDownloadResultStatus" AS ENUM ('READY', 'EXPIRED', 'DELETED', 'FAILED');

CREATE TABLE "ToolDownloadResult" (
    "id" TEXT NOT NULL,
    "toolSlug" TEXT NOT NULL,
    "originalName" TEXT,
    "outputName" TEXT NOT NULL,
    "outputPath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" BIGINT,
    "status" "ToolDownloadResultStatus" NOT NULL DEFAULT 'READY',
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "downloadedAt" TIMESTAMP(3),

    CONSTRAINT "ToolDownloadResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ToolDownloadResult_expiresAt_idx" ON "ToolDownloadResult"("expiresAt");
CREATE INDEX "ToolDownloadResult_toolSlug_idx" ON "ToolDownloadResult"("toolSlug");
CREATE INDEX "ToolDownloadResult_status_idx" ON "ToolDownloadResult"("status");
