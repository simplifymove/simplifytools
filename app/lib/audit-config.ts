/**
 * Audit Configuration - Test commands and category mapping
 * All audit categories must be defined here with their corresponding npm test scripts
 */

export const CATEGORY_TEST_COMMANDS = {
  'pdf-tools': 'npm run test:pdf-tools',
  'image-tools': 'npm run test:image-tools',
  'video-tools': 'npm run test:video-tools',
  'ai-writing-tools': 'npm run test:ai-writing-tools',
  'code-tools': 'npm run test:code-tools',
  'data-tools': 'npm run test:data-tools',
  'data-conversion-tools': 'npm run test:data-conversion-tools',
  'financial-calculators': 'npm run test:financial-calculators',
  'resume-maker': 'npm run test:resume-maker',
  'save-from-online': 'npm run test:save-from-online',
  'text-to-speech': 'npm run test:text-to-speech',
} as const;

export type AuditCategory = keyof typeof CATEGORY_TEST_COMMANDS;

/**
 * Get the test command for a given category
 */
export function getTestCommand(category: string): string | null {
  const cmd = CATEGORY_TEST_COMMANDS[category as AuditCategory];
  return cmd || null;
}

/**
 * Validate if a category exists
 */
export function isValidCategory(category: string): boolean {
  return category in CATEGORY_TEST_COMMANDS;
}

/**
 * Get all available categories
 */
export function getAvailableCategories(): AuditCategory[] {
  return Object.keys(CATEGORY_TEST_COMMANDS) as AuditCategory[];
}
