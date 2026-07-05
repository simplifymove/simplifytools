import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getAiStudioAccessForCurrentUser } from "@/lib/entitlements/ai-studio-server";

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

const presentationModel = process.env.AI_PRESENTATION_MODEL || "qwen/qwen3-32b";
const maxTokens = Number(process.env.AI_MAX_TOKENS || 6000);

function getErrorStatus(error: unknown) {
    if (typeof error === "object" && error !== null && "status" in error) {
        const status = (error as { status?: unknown }).status;
        return typeof status === "number" ? status : null;
    }

    return null;
}

export async function POST(req: Request) {
    try {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json(
                { error: "Not found" },
                { status: 404 }
            );
        }

        // Premium-only preparation: unchanged unless AI_STUDIO_ENFORCE_PREMIUM_ACCESS=true in production.
        const access = await getAiStudioAccessForCurrentUser();
        if (!access.allowed) {
            return NextResponse.json(
                { error: "Premium access is required to use AI Studio." },
                { status: 403 }
            );
        }

        const { prompt } = await req.json();

        if (!prompt || typeof prompt !== "string") {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        const response = await client.chat.completions.create({
            model: presentationModel,
            messages: [
                {
                    role: "system",
                    content:
                        "You are SimplifyConvert AI. Create professional, structured, clean business output.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: maxTokens,
        });

        return NextResponse.json({
            result: response.choices[0]?.message?.content || "",
        });
    } catch (error) {
        console.error("OpenRouter AI error:", error);

        if (getErrorStatus(error) === 402) {
            return NextResponse.json(
                { error: "AI service is currently unavailable. Please try again later." },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: "AI service is currently unavailable. Please try again later." },
            { status: 500 }
        );
    }
}
