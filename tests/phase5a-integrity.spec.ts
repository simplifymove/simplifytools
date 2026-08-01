import { expect, test } from '@playwright/test';
import { getRelatedTools } from '../app/lib/related-tools';

const financialCalculators = [
  { slug: 'startup-runway', title: 'Startup Runway Calculator', marker: 'available cash balance' },
  { slug: 'saas-profit', title: 'SaaS Profit Simulator', marker: 'LTV-to-CAC comparison' },
  { slug: 'loan-optimizer', title: 'Loan Optimization Engine', marker: 'standard amortizing-loan schedule' },
  { slug: 'india-tax', title: 'India Tax Estimator', marker: 'FY 2024-25 inputs' },
] as const;

function structuredData(html: string): Array<Record<string, any>> {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

test.describe('Phase 5A crawl, SSR, link, and metadata integrity', () => {
  for (const calculator of financialCalculators) {
    test(`${calculator.slug} has meaningful server HTML`, async ({ request }) => {
      const response = await request.get(`/all-tools/financial-calculators/${calculator.slug}`);
      expect(response.status()).toBe(200);
      const html = await response.text();

      expect((html.match(/<h1\b/g) ?? []).length).toBe(1);
      expect(html).toContain(calculator.title);
      expect(html).toContain(calculator.marker);
      expect(html).toContain('Assumptions used by this calculator');
      expect(html).toContain('Limitations');
      expect(html).toContain('Ready to calculate');
      expect(html).not.toContain('Loading calculator...');
    });
  }

  test('invalid financial and PDF slugs return true 404 responses', async ({ request }) => {
    expect((await request.get('/all-tools/financial-calculators/not-a-real-calculator')).status()).toBe(404);
    expect((await request.get('/all-tools/pdf/not-a-real-tool')).status()).toBe(404);
    expect((await request.get('/all-tools/pdf/merge-pdf')).status()).toBe(200);
  });

  test('generated PDF related-tool routes are canonical and resolve directly', async ({ request }) => {
    const related = getRelatedTools({ family: 'pdf', toolId: 'merge-pdf', limit: 8 });
    expect(related.length).toBeGreaterThanOrEqual(6);

    for (const tool of related) {
      expect(tool.route).toMatch(/^\/all-tools\/pdf\/[^/]+$/);
      expect(tool.route).not.toContain('/all-tools/pdf-tools/');
      const response = await request.get(tool.route, { maxRedirects: 0 });
      expect(response.status(), tool.route).toBe(200);
    }

    const directoryHtml = await (await request.get('/all-tools')).text();
    expect(directoryHtml).not.toContain('href="/all-tools/pdf-to-jpg"');
    expect(directoryHtml).not.toContain('href="/all-tools/pdf-to-text"');
    expect(directoryHtml).not.toContain('href="/all-tools/mp4-to-gif"');
    expect(directoryHtml).toContain('href="/all-tools/pdf/pdf-to-jpg"');
    expect(directoryHtml).toContain('href="/all-tools/pdf/pdf-to-text"');
    expect(directoryHtml).toContain('href="/all-tools/video/mp4-to-gif"');
  });

  test('pixelate link and repaired page links resolve without placeholders', async ({ request }) => {
    const glitchHtml = await (await request.get('/all-tools/glitch-effect')).text();
    expect(glitchHtml).toContain('href="/all-tools/pixelate-image"');
    expect((await request.get('/all-tools/pixelate-image', { maxRedirects: 0 })).status()).toBe(200);

    for (const path of [
      '/ai-code-assistant',
      '/all-tools/chart-maker',
      '/all-tools/pdf/pdf-watermark-remover',
      '/all-tools/view-metadata',
      '/all-tools/webp-to-jpg',
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      expect(await response.text(), path).not.toContain('href="#"');
    }
  });

  test('PDF category emits one FAQ schema matching visible questions', async ({ request }) => {
    const response = await request.get('/all-tools/pdf-tools');
    expect(response.status()).toBe(200);
    const html = await response.text();
    const faqSchemas = structuredData(html).filter((schema) => schema['@type'] === 'FAQPage');

    expect(faqSchemas).toHaveLength(1);
    expect(faqSchemas[0].mainEntity).toHaveLength(5);
    for (const question of faqSchemas[0].mainEntity) {
      expect(html).toContain(question.name);
      expect(html).toContain(question.acceptedAnswer.text);
    }
  });

  test('legacy JPG guide uses valid BlogPosting organization schema and a real image', async ({ request }) => {
    const response = await request.get('/blog/jpg-to-png-conversion-guide');
    expect(response.status()).toBe(200);
    const html = await response.text();
    const postings = structuredData(html).filter((schema) => schema['@type'] === 'BlogPosting');

    expect(postings).toHaveLength(1);
    expect(postings[0].author).toMatchObject({ '@type': 'Organization', name: 'SimplifyConvert' });
    expect(postings[0].datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
    expect(Number.isNaN(Date.parse(postings[0].datePublished))).toBe(false);
    expect(postings[0].image).toEqual(['https://simplifyconvert.com/og-image.jpg']);
    expect(html).not.toContain('jpg-png-conversion.jpg');
    expect(html).not.toContain('No registration, completely free!');
    expect((await request.get('/og-image.jpg')).status()).toBe(200);
  });

  test('corrected metadata image references resolve', async ({ request }) => {
    for (const path of ['/all-tools/heic-to-avif', '/all-tools/video-tools/text-to-video']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      expect(html, path).toContain('https://simplifyconvert.com/og-image.jpg');
      expect(html, path).not.toMatch(/og-image\.png|og-text-to-video\.png/);
    }
    expect((await request.get('/og-image.jpg')).status()).toBe(200);
  });

  test('sitemap includes only the public AI Studio marketing pages', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const xml = await response.text();

    expect(xml).toContain('<loc>https://simplifyconvert.com/ai-studio</loc>');
    expect(xml).toContain('<loc>https://simplifyconvert.com/ai-studio/pricing</loc>');
    expect(xml).not.toContain('<loc>https://simplifyconvert.com/ai-studio/billing</loc>');
    expect(xml).not.toMatch(/<loc>https:\/\/simplifyconvert\.com\/ai-studio\/(?:document|presentation|spreadsheet)-maker/);
  });
});
