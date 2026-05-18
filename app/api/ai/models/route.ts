/**
 * GET /api/ai/models
 * Lists available AI models for the assistant
 */

import { NextRequest, NextResponse } from "next/server";
import { listOllamaModels } from "@/lib/ai/ollama";

export async function GET(request: NextRequest) {
  try {
    // For MVP, return the configured model
    // Future: could query Ollama for available models

    const models = [
      {
        name: process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
        label: process.env.PUBLIC_AI_MODEL_LABEL || "Qwen 2.5 Coder",
        description:
          "Specialized code generation and explanation model. Supports multiple programming languages and frameworks.",
        context_window: 32768,
        supports: [
          "Code Generation",
          "Code Explanation",
          "Bug Fixing",
          "Debugging",
          "Chat",
        ],
      },
    ];

    return NextResponse.json(
      {
        models,
        default: models[0].name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
