const DEFAULT_CALLBACK_PATH = '/account';

function isSafeInternalPath(value: string) {
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /%(?:2f|5c)/i.test(value)
  ) {
    return false;
  }

  try {
    const internalOrigin = 'https://internal.simplifyconvert';
    const parsed = new URL(value, internalOrigin);

    return parsed.origin === internalOrigin;
  } catch {
    return false;
  }
}

export function getSafeInternalCallbackPath(
  value: string | null | undefined,
  fallback = DEFAULT_CALLBACK_PATH,
) {
  const safeFallback = isSafeInternalPath(fallback)
    ? fallback
    : DEFAULT_CALLBACK_PATH;

  return value && isSafeInternalPath(value) ? value : safeFallback;
}

export function getSignInPath(callbackPath: string) {
  const safeCallbackPath = getSafeInternalCallbackPath(callbackPath);

  return `/auth/signin?callbackUrl=${encodeURIComponent(safeCallbackPath)}`;
}

export function isProtectedAiStudioPath(pathname: string) {
  return pathname === '/ai-studio' || pathname.startsWith('/ai-studio/');
}

export function getAiStudioAuthenticationRedirect(
  pathname: string,
  isAuthenticated: boolean,
) {
  if (isAuthenticated || !isProtectedAiStudioPath(pathname)) {
    return null;
  }

  return getSignInPath(pathname);
}
