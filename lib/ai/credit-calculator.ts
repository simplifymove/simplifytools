/**
 * Credit Calculator Module (Production Hardening)
 * Determines how many credits a task consumes based on input size
 *
 * New Tier System:
 * - Tier 1:  0-8,000 chars = 1 credit
 * - Tier 2:  8,001-20,000 chars = 2 credits
 * - Tier 3:  20,001-40,000 chars = 4 credits
 * - Tier 4+: 40,001+ chars = REJECTED (PROMPT_TOO_LARGE)
 */

export interface CreditCalculation {
  inputCharacters: number;
  creditsCharged: number;
  tier: 1 | 2 | 3;
  description: string;
  tooLarge: boolean;
}

// Production tier configuration from environment or defaults
const TIER_LIMITS = {
  tier1Max: parseInt(process.env.AI_TIER_1_MAX || "8000"),
  tier2Max: parseInt(process.env.AI_TIER_2_MAX || "20000"),
  tier3Max: parseInt(process.env.AI_TIER_3_MAX || "40000"),
};

const TIER_CREDITS = {
  tier1: 1,
  tier2: 2,
  tier3: 4,
};

/**
 * Calculate credits needed for a given input
 * Tier 1: 0-8,000 chars = 1 credit
 * Tier 2: 8,001-20,000 chars = 2 credits
 * Tier 3: 20,001-40,000 chars = 4 credits
 * Tier 4+: 40,001+ = Rejected
 */
export function calculateCredits(inputCharacters: number): CreditCalculation {
  // Check if too large
  if (inputCharacters > TIER_LIMITS.tier3Max) {
    return {
      inputCharacters,
      creditsCharged: 0,
      tier: 3,
      description: `Too large (max ${TIER_LIMITS.tier3Max} chars)`,
      tooLarge: true,
    };
  }

  let tier: 1 | 2 | 3 = 1;
  let creditsCharged = TIER_CREDITS.tier1;
  let description = `Small request - 1 credit (0-${TIER_LIMITS.tier1Max} chars)`;

  if (inputCharacters > TIER_LIMITS.tier2Max) {
    tier = 3;
    creditsCharged = TIER_CREDITS.tier3;
    description = `Large request - ${TIER_CREDITS.tier3} credits (${TIER_LIMITS.tier2Max + 1}-${TIER_LIMITS.tier3Max} chars)`;
  } else if (inputCharacters > TIER_LIMITS.tier1Max) {
    tier = 2;
    creditsCharged = TIER_CREDITS.tier2;
    description = `Medium request - ${TIER_CREDITS.tier2} credits (${TIER_LIMITS.tier1Max + 1}-${TIER_LIMITS.tier2Max} chars)`;
  }

  return {
    inputCharacters,
    creditsCharged,
    tier,
    description,
    tooLarge: false,
  };
}

/**
 * Check if user has enough credits for a task
 */
export function hasEnoughCredits(
  creditsRemaining: number,
  inputCharacters: number
): boolean {
  const calc = calculateCredits(inputCharacters);
  if (calc.tooLarge) return false; // Reject immediately if too large
  return creditsRemaining >= calc.creditsCharged;
}

/**
 * Check if prompt size is valid (not too large)
 */
export function isPromptSizeValid(inputCharacters: number): boolean {
  return inputCharacters <= TIER_LIMITS.tier3Max;
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  return `${credits} credit${credits !== 1 ? "s" : ""}`;
}

/**
 * Get credit tier info
 */
export function getTierInfo(tier: 1 | 2 | 3) {
  const tierMap = {
    1: {
      max: TIER_LIMITS.tier1Max,
      credits: TIER_CREDITS.tier1,
      description: "Small snippets",
    },
    2: {
      max: TIER_LIMITS.tier2Max,
      credits: TIER_CREDITS.tier2,
      description: "Medium functions",
    },
    3: {
      max: TIER_LIMITS.tier3Max,
      credits: TIER_CREDITS.tier3,
      description: "Large systems",
    },
  };
  return tierMap[tier];
}

/**
 * Calculate monthly credit allocation
 */
export function getMonthlyCredits(): number {
  return parseInt(process.env.AI_MONTHLY_CREDITS || "100");
}

/**
 * Get credit plan details for display
 */
export function getCreditPlanDetails() {
  return {
    monthlyCredits: getMonthlyCredits(),
    maxPromptSize: TIER_LIMITS.tier3Max,
    tiers: [
      {
        tier: 1,
        min: 0,
        max: TIER_LIMITS.tier1Max,
        credits: TIER_CREDITS.tier1,
        description: "Small (0-8K chars)",
      },
      {
        tier: 2,
        min: TIER_LIMITS.tier1Max + 1,
        max: TIER_LIMITS.tier2Max,
        credits: TIER_CREDITS.tier2,
        description: "Medium (8K-20K chars)",
      },
      {
        tier: 3,
        min: TIER_LIMITS.tier2Max + 1,
        max: TIER_LIMITS.tier3Max,
        credits: TIER_CREDITS.tier3,
        description: "Large (20K-40K chars)",
      },
    ],
  };
}
