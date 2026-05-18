/**
 * Health Check Endpoint
 * GET /api/health
 * Returns system status without exposing secrets
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkOllamaHealth } from "@/lib/ai/ollama";

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    const health: Record<string, any> = {
      status: "starting",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    };

    // Check database connectivity
    try {
      await prisma.user.count();
      health.database = {
        status: "connected",
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      health.database = {
        status: "disconnected",
        error: "Database connection failed",
      };
    }

    // Check Ollama connectivity
    try {
      const ollamaHealth = await checkOllamaHealth();
      health.ollama = {
        status: ollamaHealth.available ? "connected" : "disconnected",
        model: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
        baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
      };
    } catch (error) {
      health.ollama = {
        status: "disconnected",
        error: "Ollama connection failed",
      };
    }

    // Check Razorpay configuration
    health.razorpay = {
      status: process.env.RAZORPAY_KEY_ID ? "configured" : "not_configured",
      webhookConfigured: !!process.env.RAZORPAY_WEBHOOK_SECRET,
    };

    // Overall status
    const dbConnected = health.database?.status === "connected";
    const ollamaConnected = health.ollama?.status === "connected";
    const razorpayConfigured = health.razorpay?.status === "configured";

    health.status = dbConnected && ollamaConnected ? "healthy" : "degraded";
    health.readyForRequests = dbConnected && ollamaConnected;

    // If anything failed but system is up, return 200 with degraded status
    // This allows clients to see partial health even if some components fail
    const statusCode =
      health.status === "healthy" ||
      (dbConnected && ollamaConnected)
        ? 200
        : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        error: "Health check failed",
      },
      { status: 500 }
    );
  }
}
