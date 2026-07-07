ALTER TABLE "AiStudioUsageLog" ADD COLUMN "provider" TEXT;
ALTER TABLE "AiStudioUsageLog" ADD COLUMN "totalTokens" INTEGER;

CREATE INDEX "AiStudioUsageLog_model_idx" ON "AiStudioUsageLog"("model");
CREATE INDEX "AiStudioUsageLog_provider_idx" ON "AiStudioUsageLog"("provider");
