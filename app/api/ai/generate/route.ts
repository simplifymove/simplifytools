/**
 * POST /api/ai/generate
 * Main AI code generation endpoint (Production Hardened)
 *
 * Handles:
 * - API key validation (fast SHA-256 verification)
 * - Secret detection and blocking
 * - Concurrency control (prevent Ollama overload)
 * - New credit tier system (1/2/4 credits)
 * - Rate limiting
 * - Device lock authorization
 * - Streaming support preparation
 * - Comprehensive error codes
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractApiKeyFromHeader,
  validateApiKey,
  validateDeviceLock,
} from "@/lib/api-keys/validate";
import { generateFromOllama } from "@/lib/ai/ollama";
import { calculateCredits, isPromptSizeValid } from "@/lib/ai/credit-calculator";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { scanForSecrets } from "@/lib/security/secret-scanner";
import { withConcurrencyControl, isQueueFull } from "@/lib/ai/concurrent-queue";

interface GenerateRequest {
  prompt: string;
  machineId: string;
  projectFingerprint?: string;
  taskType?: string;
  stream?: boolean; // Optional streaming flag
}

interface GenerateResponse {
  success: boolean;
  response?: string;
  creditsCharged?: number;
  creditsRemaining?: number;
  model?: string;
  error?: string;
  errorCode?: string;
  latencyMs?: number;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    // ===== 1. Extract and validate API key =====
    const authHeader = request.headers.get("authorization");
    const apiKey = extractApiKeyFromHeader(authHeader ?? undefined);

    if (!apiKey) {
      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: "Missing API key. Use Authorization: Bearer <api_key>",
          errorCode: "MISSING_API_KEY",
        },
        { status: 401 }
      );
    }

    const keyValidation = await validateApiKey(apiKey);

    if (!keyValidation.valid) {
      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: keyValidation.error || "Invalid API key",
          errorCode: "INVALID_API_KEY",
        },
        { status: 401 }
      );
    }

    const userId = keyValidation.userId!;
    const keyId = keyValidation.keyId!;

    // ===== 2. Parse and validate request body =====
    let body: GenerateRequest;
    try {
      body = (await request.json()) as GenerateRequest;
    } catch (error) {
      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: "Invalid request body",
          errorCode: "INVALID_REQUEST",
        },
        { status: 400 }
      );
    }

    const {
      prompt,
      machineId,
      taskType = "chat",
      stream = false,
    } = body;

    if (!prompt || !machineId) {
      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: "prompt and machineId are required",
          errorCode: "MISSING_PARAMS",
        },
        { status: 400 }
      );
    }

    // ===== 3. Check prompt size =====
    if (!isPromptSizeValid(prompt.length)) {
      // Log rejection
      await prisma.usageLog.create({
        data: {
          userId,
          apiKeyId: keyId,
          model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
          taskType,
          inputCharacters: prompt.length,
          creditsCharged: 0,
          status: "rejected",
          errorCode: "PROMPT_TOO_LARGE",
          errorMessage: `Prompt exceeds max size of ${process.env.AI_TIER_3_MAX || 40000} characters`,
          latencyMs: Date.now() - startTime,
        },
      });

      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: `Prompt is too large. Maximum size: ${process.env.AI_TIER_3_MAX || 40000} characters`,
          errorCode: "PROMPT_TOO_LARGE",
        },
        { status: 413 }
      );
    }

    // ===== 4. Scan for secrets =====
    const secretScan = scanForSecrets(prompt);
    if (secretScan.hasSecrets) {
      // Log rejection
      await prisma.usageLog.create({
        data: {
          userId,
          apiKeyId: keyId,
          model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
          taskType,
          inputCharacters: prompt.length,
          creditsCharged: 0,
          status: "rejected",
          errorCode: "SECRET_DETECTED",
          errorMessage: `Detected: ${secretScan.secretTypes.join(", ")}`,
          latencyMs: Date.now() - startTime,
        },
      });

      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: secretScan.message || "Sensitive credentials detected",
          errorCode: "SECRET_DETECTED",
        },
        { status: 403 }
      );
    }

    // ===== 5. Check device lock =====
    const deviceValidation = await validateDeviceLock(keyId, machineId);

    if (!deviceValidation.valid) {
      await prisma.usageLog.create({
        data: {
          userId,
          apiKeyId: keyId,
          model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
          taskType,
          inputCharacters: prompt.length,
          creditsCharged: 0,
          status: "rejected",
          errorCode: "DEVICE_NOT_AUTHORIZED",
          errorMessage: deviceValidation.error,
          latencyMs: Date.now() - startTime,
        },
      });

      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: deviceValidation.error,
          errorCode: "DEVICE_NOT_AUTHORIZED",
        },
        { status: 403 }
      );
    }

    // ===== 6. Check rate limit =====
    const rateLimit = checkRateLimit(userId);

    if (!rateLimit.allowed) {
      await prisma.usageLog.create({
        data: {
          userId,
          apiKeyId: keyId,
          model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
          taskType,
          inputCharacters: prompt.length,
          creditsCharged: 0,
          status: "rejected",
          errorCode: "RATE_LIMITED",
          errorMessage: `Rate limit exceeded: ${rateLimit.remaining} remaining`,
          latencyMs: Date.now() - startTime,
        },
      });

      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: `Rate limit exceeded. Max ${process.env.AI_RATE_LIMIT_PER_MINUTE || 30} requests per minute`,
          errorCode: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    // ===== 7. Calculate credits needed =====
    const creditCalc = calculateCredits(prompt.length);

    if (creditCalc.tooLarge) {
      await prisma.usageLog.create({
        data: {
          userId,
          apiKeyId: keyId,
          model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
          taskType,
          inputCharacters: prompt.length,
          creditsCharged: 0,
          status: "rejected",
          errorCode: "PROMPT_TOO_LARGE",
          errorMessage: creditCalc.description,
          latencyMs: Date.now() - startTime,
        },
      });

      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: creditCalc.description,
          errorCode: "PROMPT_TOO_LARGE",
        },
        { status: 413 }
      );
    }

    // ===== 8. Check credits =====
    const subscription = await prisma.aiSubscription.findUnique({
      where: { userId },
    });

    if (
      !subscription ||
      subscription.status !== "active" ||
      subscription.creditsRemaining < creditCalc.creditsCharged
    ) {
      await prisma.usageLog.create({
        data: {
          userId,
          apiKeyId: keyId,
          model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
          taskType,
          inputCharacters: prompt.length,
          creditsCharged: 0,
          status: "rejected",
          errorCode: "INSUFFICIENT_CREDITS",
          errorMessage: `Required: ${creditCalc.creditsCharged}, Available: ${subscription?.creditsRemaining || 0}`,
          latencyMs: Date.now() - startTime,
        },
      });

      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: "Insufficient credits",
          errorCode: "INSUFFICIENT_CREDITS",
        },
        { status: 402 }
      );
    }

    // ===== 9. Check concurrency queue =====
    if (isQueueFull()) {
      await prisma.usageLog.create({
        data: {
          userId,
          apiKeyId: keyId,
          model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
          taskType,
          inputCharacters: prompt.length,
          creditsCharged: 0,
          status: "rejected",
          errorCode: "SERVER_BUSY",
          errorMessage: "Server is at capacity",
          latencyMs: Date.now() - startTime,
        },
      });

      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: "Server is currently busy. Please try again in a moment.",
          errorCode: "SERVER_BUSY",
        },
        { status: 503 }
      );
    }

    // ===== 10. Execute with concurrency control =====
    const result = await withConcurrencyControl(userId, async () => {
      const ollamaModel = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b";
      return await generateFromOllama(prompt, ollamaModel);
    });

    if (!result.success) {
      // Log failed attempt
      await prisma.usageLog.create({
        data: {
          userId,
          apiKeyId: keyId,
          model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
          taskType,
          inputCharacters: prompt.length,
          creditsCharged: 0,
          status: "failed",
          errorCode: "OLLAMA_ERROR",
          errorMessage: result.error || "Unknown error",
          latencyMs: Date.now() - startTime,
        },
      });

      return NextResponse.json<GenerateResponse>(
        {
          success: false,
          error: result.error || "AI generation failed. Please try again.",
          errorCode: "OLLAMA_ERROR",
        },
        { status: 503 }
      );
    }

    const response = result.data;

    // ===== 11. Deduct credits =====
    await prisma.aiSubscription.update({
      where: { userId },
      data: {
        creditsUsed: { increment: creditCalc.creditsCharged },
        creditsRemaining: { decrement: creditCalc.creditsCharged },
      },
    });

    // ===== 12. Log successful request =====
    const latencyMs = Date.now() - startTime;
    await prisma.usageLog.create({
      data: {
        userId,
        apiKeyId: keyId,
        model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
        taskType,
        inputCharacters: prompt.length,
        creditsCharged: creditCalc.creditsCharged,
        status: "success",
        errorCode: null,
        errorMessage: null,
        latencyMs,
      },
    });

    // ===== 13. Get updated credits =====
    const updatedSubscription = await prisma.aiSubscription.findUnique({
      where: { userId },
    });

    // ===== 14. Return response =====
    return NextResponse.json<GenerateResponse>(
      {
        success: true,
        response,
        creditsCharged: creditCalc.creditsCharged,
        creditsRemaining: updatedSubscription?.creditsRemaining || 0,
        model: process.env.PUBLIC_AI_MODEL_LABEL || "Qwen 2.5 Coder",
        latencyMs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in AI generation endpoint:", error);
    return NextResponse.json<GenerateResponse>(
      {
        success: false,
        error: "Internal server error",
        errorCode: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
