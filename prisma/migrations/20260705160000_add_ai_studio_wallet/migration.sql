-- CreateTable
CREATE TABLE "AiStudioWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balanceCredits" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "reservedCredits" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lifetimeCreditsAdded" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "lifetimeCreditsUsed" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiStudioWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiStudioCreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountCredits" DECIMAL(65,30) NOT NULL,
    "balanceAfter" DECIMAL(65,30) NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "description" TEXT,
    "metadataJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiStudioCreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiStudioUsageLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "topic" TEXT,
    "slideCount" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "estimatedCredits" DECIMAL(65,30) NOT NULL,
    "reservedCredits" DECIMAL(65,30) NOT NULL,
    "actualCredits" DECIMAL(65,30),
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "providerCostUsd" DECIMAL(65,30),
    "providerResponseId" TEXT,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AiStudioUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiStudioPlanPurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "providerCheckoutSessionId" TEXT,
    "currency" TEXT NOT NULL,
    "grossAmountMinor" INTEGER NOT NULL,
    "aiCreditAmountMinor" INTEGER NOT NULL,
    "platformRevenueMinor" INTEGER NOT NULL,
    "creditsGranted" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "rawPayloadJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "AiStudioPlanPurchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiStudioWallet_userId_key" ON "AiStudioWallet"("userId");

-- CreateIndex
CREATE INDEX "AiStudioWallet_userId_idx" ON "AiStudioWallet"("userId");

-- CreateIndex
CREATE INDEX "AiStudioCreditTransaction_userId_idx" ON "AiStudioCreditTransaction"("userId");

-- CreateIndex
CREATE INDEX "AiStudioCreditTransaction_walletId_idx" ON "AiStudioCreditTransaction"("walletId");

-- CreateIndex
CREATE INDEX "AiStudioCreditTransaction_type_idx" ON "AiStudioCreditTransaction"("type");

-- CreateIndex
CREATE INDEX "AiStudioCreditTransaction_createdAt_idx" ON "AiStudioCreditTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiStudioUsageLog_requestId_key" ON "AiStudioUsageLog"("requestId");

-- CreateIndex
CREATE INDEX "AiStudioUsageLog_userId_idx" ON "AiStudioUsageLog"("userId");

-- CreateIndex
CREATE INDEX "AiStudioUsageLog_status_idx" ON "AiStudioUsageLog"("status");

-- CreateIndex
CREATE INDEX "AiStudioUsageLog_createdAt_idx" ON "AiStudioUsageLog"("createdAt");

-- CreateIndex
CREATE INDEX "AiStudioPlanPurchase_userId_idx" ON "AiStudioPlanPurchase"("userId");

-- CreateIndex
CREATE INDEX "AiStudioPlanPurchase_provider_idx" ON "AiStudioPlanPurchase"("provider");

-- CreateIndex
CREATE INDEX "AiStudioPlanPurchase_status_idx" ON "AiStudioPlanPurchase"("status");

-- CreateIndex
CREATE INDEX "AiStudioPlanPurchase_createdAt_idx" ON "AiStudioPlanPurchase"("createdAt");

-- AddForeignKey
ALTER TABLE "AiStudioWallet" ADD CONSTRAINT "AiStudioWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStudioCreditTransaction" ADD CONSTRAINT "AiStudioCreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStudioCreditTransaction" ADD CONSTRAINT "AiStudioCreditTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "AiStudioWallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStudioUsageLog" ADD CONSTRAINT "AiStudioUsageLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiStudioPlanPurchase" ADD CONSTRAINT "AiStudioPlanPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
