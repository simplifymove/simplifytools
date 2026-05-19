/**
 * API Client for SimplifyConvert AI Backend
 */

export interface GenerateRequest {
  prompt: string;
  selectedCode?: string;
  fileName?: string;
  language?: string;
  taskType: 'chat' | 'explain' | 'fix' | 'optimize' | 'comments' | 'debug';
  stream?: boolean;
  maxOutputTokens?: number;
}

export interface GenerateResponse {
  success: boolean;
  response?: string;
  creditsCharged?: number;
  creditsRemaining?: number;
  model?: string;
  error?: string;
  errorCode?: string;
  code?: string;
  message?: string;
}

export class ApiClient {
  private baseUrl: string;
  private apiKey: string;
  private machineId: string;

  constructor(baseUrl: string, apiKey: string, machineId: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.machineId = machineId;
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const endpoint = `${this.baseUrl}/api/ai/generate`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Machine-Id': this.machineId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: request.prompt,
          machineId: this.machineId,
          taskType: request.taskType,
          stream: request.stream || false,
          maxOutputTokens: request.maxOutputTokens || 500,
        }),
      });

      const data = await response.json() as GenerateResponse;

      if (!response.ok) {
        return {
          success: false,
          error: data.message || data.error || 'Request failed',
          errorCode: data.code || data.errorCode || 'UNKNOWN_ERROR',
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Get machine ID being used for API calls
   */
  getMachineId(): string {
    return this.machineId;
  }
}
