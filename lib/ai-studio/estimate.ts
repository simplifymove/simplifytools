export const AI_STUDIO_ESTIMATE_CONFIG = {
  baseCredits: 5,
  perSlideCredits: 2,
  agentOverheadCredits: 8,
};

export function normalizeAiStudioSlideCount(slideCount: unknown) {
  const parsed = Number(slideCount);

  if (!Number.isInteger(parsed)) return 10;

  return Math.max(3, Math.min(30, parsed));
}

export function estimateAiStudioCredits(slideCount: unknown) {
  const normalizedSlideCount = normalizeAiStudioSlideCount(slideCount);

  return {
    slideCount: normalizedSlideCount,
    estimatedCredits:
      AI_STUDIO_ESTIMATE_CONFIG.baseCredits +
      normalizedSlideCount * AI_STUDIO_ESTIMATE_CONFIG.perSlideCredits +
      AI_STUDIO_ESTIMATE_CONFIG.agentOverheadCredits,
    config: AI_STUDIO_ESTIMATE_CONFIG,
  };
}
