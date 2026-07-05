import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import {
  canAccessAiStudio,
  hasAiStudioPremiumEntitlement,
  isAiStudioPremiumGateEnabled,
  type AiStudioUserLike,
} from '@/lib/entitlements/ai-studio';

export interface AiStudioAccessResult {
  allowed: boolean;
  enforced: boolean;
  hasPremiumEntitlement: boolean;
  isDevelopmentBypass: boolean;
  userEmail?: string | null;
}

export async function getAiStudioAccessForCurrentUser(): Promise<AiStudioAccessResult> {
  const enforced = isAiStudioPremiumGateEnabled();
  const isDevelopmentBypass = process.env.NODE_ENV === 'development';

  if (isDevelopmentBypass) {
    return {
      allowed: true,
      enforced,
      hasPremiumEntitlement: true,
      isDevelopmentBypass,
      userEmail: null,
    };
  }

  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;

    if (!email) {
      return {
        allowed: canAccessAiStudio(null),
        enforced,
        hasPremiumEntitlement: false,
        isDevelopmentBypass,
        userEmail: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        role: true,
        subscription: {
          select: {
            planName: true,
            status: true,
            expiresAt: true,
          },
        },
      },
    });

    const entitlementUser: AiStudioUserLike | null = user
      ? {
          role: user.role,
          subscription: user.subscription,
        }
      : null;

    return {
      allowed: canAccessAiStudio(entitlementUser),
      enforced,
      hasPremiumEntitlement: hasAiStudioPremiumEntitlement(entitlementUser),
      isDevelopmentBypass,
      userEmail: email,
    };
  } catch (error) {
    console.error('[ai-studio-access] Unable to resolve premium entitlement:', error);

    return {
      allowed: !enforced,
      enforced,
      hasPremiumEntitlement: false,
      isDevelopmentBypass,
      userEmail: null,
    };
  }
}
