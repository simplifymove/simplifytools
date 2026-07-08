export interface OpenRouterCreditBalance {
  totalCredits: number;
  totalUsage: number;
  availableBalance: number;
  minBalance: number;
  isConfigured: boolean;
  isLow: boolean;
  checkedAt: string;
  error?: string;
}

export class OpenRouterProviderBalanceError extends Error {
  balance: OpenRouterCreditBalance | null;

  constructor(message: string, balance: OpenRouterCreditBalance | null = null) {
    super(message);
    this.name = 'OpenRouterProviderBalanceError';
    this.balance = balance;
  }
}

const openRouterCreditsEndpoint = 'https://openrouter.ai/api/v1/credits';

function readMinBalance() {
  const configured = Number(process.env.OPENROUTER_MIN_BALANCE_USD);
  return Number.isFinite(configured) ? configured : 1;
}

function readOpenRouterManagementKey() {
  return process.env.OPENROUTER_MANAGEMENT_KEY || process.env.OPENROUTER_API_KEY || '';
}

function numberFromPayload(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

function parseOpenRouterCreditsPayload(payload: unknown) {
  const root = typeof payload === 'object' && payload !== null ? payload as Record<string, unknown> : {};
  const data = typeof root.data === 'object' && root.data !== null ? root.data as Record<string, unknown> : root;
  const totalCredits = numberFromPayload(data.total_credits ?? data.totalCredits);
  const totalUsage = numberFromPayload(data.total_usage ?? data.totalUsage);

  if (totalCredits === null || totalUsage === null) {
    throw new Error('OpenRouter credits response did not include total credits and total usage.');
  }

  return { totalCredits, totalUsage };
}

export async function getOpenRouterCreditBalance(): Promise<OpenRouterCreditBalance> {
  const minBalance = readMinBalance();
  const apiKey = readOpenRouterManagementKey();
  const checkedAt = new Date().toISOString();

  if (!apiKey) {
    return {
      totalCredits: 0,
      totalUsage: 0,
      availableBalance: 0,
      minBalance,
      isConfigured: false,
      isLow: true,
      checkedAt,
      error: 'OPENROUTER_MANAGEMENT_KEY or OPENROUTER_API_KEY is not configured.',
    };
  }

  try {
    const response = await fetch(openRouterCreditsEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        totalCredits: 0,
        totalUsage: 0,
        availableBalance: 0,
        minBalance,
        isConfigured: true,
        isLow: true,
        checkedAt,
        error: `OpenRouter credits endpoint returned HTTP ${response.status}.`,
      };
    }

    const payload = await response.json();
    const { totalCredits, totalUsage } = parseOpenRouterCreditsPayload(payload);
    const availableBalance = totalCredits - totalUsage;

    return {
      totalCredits,
      totalUsage,
      availableBalance,
      minBalance,
      isConfigured: true,
      isLow: availableBalance < minBalance,
      checkedAt,
    };
  } catch (error) {
    return {
      totalCredits: 0,
      totalUsage: 0,
      availableBalance: 0,
      minBalance,
      isConfigured: true,
      isLow: true,
      checkedAt,
      error: error instanceof Error ? error.message : 'Unable to check OpenRouter credits.',
    };
  }
}

export async function assertOpenRouterBalanceAvailable() {
  const balance = await getOpenRouterCreditBalance();

  if (!balance.isConfigured || balance.error || balance.isLow) {
    throw new OpenRouterProviderBalanceError(
      'OpenRouter provider balance is below the safe threshold.',
      balance,
    );
  }

  return balance;
}

export function isOpenRouterProviderBalanceError(error: unknown) {
  return error instanceof OpenRouterProviderBalanceError;
}
