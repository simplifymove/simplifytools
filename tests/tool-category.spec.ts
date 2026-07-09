import { expect, test } from '@playwright/test';

type CategoryAuditConfig = {
  name: string;
  urls: string[];
};

const CATEGORY_AUDITS: Record<string, CategoryAuditConfig> = {
  'ai-writing-tools': {
    name: 'AI Writing Tools',
    urls: ['/all-tools/ai-tools', '/all-tools/ai-write', '/all-tools/ai-tools/paragraph-writer'],
  },
  'image-tools': {
    name: 'Image Tools',
    urls: ['/all-tools/image-tools', '/all-tools/compress-image', '/all-tools/resize-image'],
  },
  'video-tools': {
    name: 'Video Tools',
    urls: ['/all-tools/video-tools', '/all-tools/video/trim-video', '/all-tools/video-tools/text-to-video'],
  },
  'code-tools': {
    name: 'Code Tools',
    urls: ['/all-tools/code-tools', '/all-tools/code-tools/json-formatter', '/all-tools/code-tools/code-minifier'],
  },
  'data-tools': {
    name: 'Data Tools',
    urls: ['/all-tools/data', '/all-tools/data/csv-to-json', '/all-tools/data/json-to-xml'],
  },
  'data-conversion-tools': {
    name: 'Data Conversion Tools',
    urls: ['/all-tools/data-converter', '/all-tools/data/csv-to-json', '/all-tools/data/excel-to-csv'],
  },
  'financial-calculators': {
    name: 'Financial Calculators',
    urls: ['/all-tools/financial-calculators', '/all-tools/financial-calculators/startup-runway'],
  },
  'resume-maker': {
    name: 'Resume Maker',
    urls: ['/all-tools/resume-maker', '/all-tools/resume-maker/job-match'],
  },
  'save-from-online': {
    name: 'Save From Online',
    urls: ['/all-tools/save-from-online', '/all-tools/video-tools/universal-downloader'],
  },
  'text-to-speech': {
    name: 'Text to Speech',
    urls: ['/all-tools/text-to-speech'],
  },
};

const categoryId = process.env.AUDIT_CATEGORY || '';
const categoryConfig = CATEGORY_AUDITS[categoryId];

test.describe('Generic category audit', () => {
  test.skip(!categoryConfig, `No generic audit configured for category: ${categoryId || '(missing)'}`);

  for (const url of categoryConfig?.urls || []) {
    test(`${categoryConfig?.name} loads ${url}`, async ({ page, request }) => {
      const response = await request.get(url);
      expect(response.status(), `${url} should return a successful response`).toBeLessThan(400);

      const consoleErrors: string[] = [];
      page.on('console', (message) => {
        if (message.type() !== 'error') return;

        const text = message.text();
        if (/favicon|manifest|ResizeObserver|Failed to load resource: the server responded with a status of 404/i.test(text)) {
          return;
        }

        consoleErrors.push(text);
      });

      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();

      const interactiveElements = page.locator('a[href], button, input, textarea, select, [role="button"]');
      expect(await interactiveElements.count(), `${url} should expose interactive UI`).toBeGreaterThan(0);

      await page.waitForTimeout(500);
      expect(consoleErrors, `${url} should not log major client console errors`).toEqual([]);
    });
  }
});
