import { expect, test } from '@playwright/test';
import { getBestSearchResult } from '../../app/lib/search-index';

const cases = [
  ['merge pdf', '/all-tools/pdf/merge-pdf'],
  ['compress pdf', '/all-tools/pdf/compress-pdf'],
  ['remove background', '/all-tools/remove-background'],
  ['jwt decoder', '/all-tools/code-tools/jwt-decoder'],
  ['xml to json', '/all-tools/code-tools/xml-to-json'],
  ['ppt maker', '/ai-studio/presentation-maker'],
  ['presentation maker', '/ai-studio/presentation-maker'],
] as const;

const dedupeQueries = [
  'add text',
  'pdf to text',
  'csv to json',
  'json to xml',
  'xml to json',
  'merge pdf',
  'remove background',
  'jwt decoder',
] as const;

test.describe('search index canonical routing', () => {
  for (const [query, route] of cases) {
    test(`${query} resolves to ${route}`, () => {
      expect(getBestSearchResult(query)?.route).toBe(route);
    });
  }
});

test.describe('search index deduplication', () => {
  for (const query of dedupeQueries) {
    test(`${query} has unique render keys and hrefs`, async () => {
      const { getSearchResults } = await import('../../app/lib/search-index');
      const results = getSearchResults(query, 20);
      const renderKeys = results.map((result) => `${result.type}-${result.id}-${result.href ?? 'no-href'}`);
      const idKeys = results.map((result) => `${result.type}-${result.id}`);
      const hrefs = results.map((result) => result.href || result.route || 'no-href');

      expect(new Set(renderKeys).size).toBe(renderKeys.length);
      expect(new Set(idKeys).size).toBe(idKeys.length);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    });
  }
});
