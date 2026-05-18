/**
 * Ollama Integration Module (Production Hardened)
 * Handles communication with local Ollama instance
 * Supports both streaming and non-streaming responses
 */

interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  temperature?: number;
  top_k?: number;
  top_p?: number;
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

interface OllamaHealthResponse {
  available: boolean;
  responseTime: number;
}

/**
 * Generate code/text from Ollama
 * Non-streaming version (default)
 */
export async function generateFromOllama(
  prompt: string,
  model: string = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
  temperature: number = 0.7
): Promise<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const timeout = parseInt(process.env.OLLAMA_TIMEOUT_MS || "30000");

  if (!baseUrl) {
    throw new Error("OLLAMA_BASE_URL environment variable not set");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false, // Non-streaming for now
          temperature,
        } as OllamaGenerateRequest),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = (await response.json()) as OllamaGenerateResponse;
      
      if (!data.response) {
        throw new Error("Empty response from Ollama");
      }

      return data.response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Ollama request timeout (>${timeout}ms)`);
      }
      throw new Error(`Failed to generate from Ollama: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate code/text from Ollama with streaming support
 * Returns a ReadableStream for real-time updates
 * TODO: Implement streaming endpoint when ready
 */
export async function* generateFromOllamaStreaming(
  prompt: string,
  model: string = process.env.OLLAMA_MODEL || "qwen2.5-coder:7b",
  temperature: number = 0.7
): AsyncGenerator<string> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const timeout = parseInt(process.env.OLLAMA_TIMEOUT_MS || "30000");

  if (!baseUrl) {
    throw new Error("OLLAMA_BASE_URL environment variable not set");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: true, // Enable streaming
        temperature,
      } as OllamaGenerateRequest),
      signal: controller.signal,
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    if (!response.body) {
      clearTimeout(timeoutId);
      throw new Error("No response body from Ollama");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");

        // Process complete lines
        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line) {
            try {
              const chunk = JSON.parse(line) as OllamaGenerateResponse;
              if (chunk.response) {
                yield chunk.response;
              }
            } catch (e) {
              console.error("Failed to parse streaming chunk:", e);
            }
          }
        }

        // Keep incomplete line in buffer
        buffer = lines[lines.length - 1];
      }

      // Process any remaining data
      if (buffer.trim()) {
        try {
          const chunk = JSON.parse(buffer) as OllamaGenerateResponse;
          if (chunk.response) {
            yield chunk.response;
          }
        } catch (e) {
          console.error("Failed to parse final chunk:", e);
        }
      }
    } finally {
      reader.releaseLock();
      clearTimeout(timeoutId);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Ollama streaming timeout (>${timeout}ms)`);
      }
      throw new Error(`Failed to stream from Ollama: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check Ollama service health
 */
export async function checkOllamaHealth(): Promise<OllamaHealthResponse> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const timeout = 5000; // 5 second timeout for health check

  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${baseUrl}/api/tags`, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      return {
        available: response.ok,
        responseTime,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      return {
        available: false,
        responseTime: Date.now() - startTime,
      };
    }
  } catch {
    return {
      available: false,
      responseTime: timeout,
    };
  }
}

/**
 * List available models on Ollama
 */
export async function listOllamaModels(): Promise<string[]> {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch models");
    }

    const data = (await response.json()) as { models: Array<{ name: string }> };
    return data.models.map((m) => m.name);
  } catch (error) {
    console.error("Failed to list Ollama models:", error);
    return [];
  }
}
