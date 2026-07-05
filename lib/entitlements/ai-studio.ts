export interface AiStudioSubscriptionLike {
  planName?: string | null;
  status?: string | null;
  expiresAt?: Date | string | null;
}

export interface AiStudioUserLike {
  role?: string | null;
  plan?: string | null;
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
  isPremium?: boolean | null;
  premium?: boolean | null;
  subscription?: AiStudioSubscriptionLike | null;
}

const PREMIUM_PLANS = new Set(['premium', 'pro', 'paid', 'business', 'enterprise', 'monthly']);
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

export function isAiStudioPremiumGateEnabled(): boolean {
  return process.env.NODE_ENV === 'production' && process.env.AI_STUDIO_ENFORCE_PREMIUM_ACCESS === 'true';
}

export function hasAiStudioPremiumEntitlement(user?: AiStudioUserLike | null): boolean {
  if (!user) return false;

  const role = user.role?.toLowerCase();
  if (role === 'admin' || role === 'premium') return true;

  if (user.isPremium || user.premium) return true;

  const directPlan = user.plan?.toLowerCase() || user.subscriptionPlan?.toLowerCase();
  const directStatus = user.subscriptionStatus?.toLowerCase();
  if (directPlan && PREMIUM_PLANS.has(directPlan) && (!directStatus || ACTIVE_SUBSCRIPTION_STATUSES.has(directStatus))) {
    return true;
  }

  const subscriptionStatus = user.subscription?.status?.toLowerCase();
  const subscriptionPlan = user.subscription?.planName?.toLowerCase();
  const expiresAt = user.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : null;
  const isExpired = expiresAt ? expiresAt.getTime() <= Date.now() : false;

  return Boolean(
    subscriptionPlan &&
      PREMIUM_PLANS.has(subscriptionPlan) &&
      subscriptionStatus &&
      ACTIVE_SUBSCRIPTION_STATUSES.has(subscriptionStatus) &&
      !isExpired
  );
}

export function canAccessAiStudio(user?: AiStudioUserLike | null): boolean {
  // QA-only: local development remains open so mock mode and visual testing do not require billing setup.
  if (process.env.NODE_ENV === 'development') return true;

  // Production enforcement is prepared behind a flag until AI Studio billing is wired to real payments.
  if (!isAiStudioPremiumGateEnabled()) return true;

  return hasAiStudioPremiumEntitlement(user);
}
