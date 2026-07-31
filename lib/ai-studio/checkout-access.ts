export type AiStudioSessionStatus =
  | 'authenticated'
  | 'unauthenticated'
  | 'loading';

export function canStartAiStudioCheckout(
  sessionStatus: AiStudioSessionStatus,
) {
  return sessionStatus === 'authenticated';
}
