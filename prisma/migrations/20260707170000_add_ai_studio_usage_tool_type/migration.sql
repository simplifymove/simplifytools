ALTER TABLE "AiStudioUsageLog"
ADD COLUMN "toolType" TEXT NOT NULL DEFAULT 'presentation';

CREATE INDEX "AiStudioUsageLog_toolType_idx" ON "AiStudioUsageLog"("toolType");
