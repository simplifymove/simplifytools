import { expect, test } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

const guides = [
  { slug: 'merge-split-compress-ocr-pdf-guide', title: 'Merge vs Split vs Compress vs OCR: Which PDF Tool Should You Use?', marker: 'A PDF workflow starts with the problem, not the button' },
  { slug: 'jpg-png-webp-avif-image-formats', title: 'JPG vs PNG vs WebP vs AVIF: Which Image Format Should You Use?', marker: 'There is no universally best image format' },
  { slug: 'image-compression-quality-file-size', title: 'How Image Compression Affects Quality, Dimensions and File Size', marker: 'Compression and resizing solve different problems' },
  { slug: 'csv-excel-json-data-formats', title: 'CSV vs Excel vs JSON: Which Data Format Should You Choose?', marker: 'The right data format depends on who or what must use it next' },
  { slug: 'video-compression-resolution-bitrate-codec', title: 'Video Compression Explained: Resolution, Bitrate, Codec and File Size', marker: 'Video size is the result of several interacting choices' },
] as const;

test.describe('Phase 4A editorial quality', () => {
  test('blog index exposes exactly the six real article cards', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/blog`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect((html.match(/<article\b/g) || []).length).toBe(6);
    expect(html).not.toContain('href="#"');

    const expected = ['jpg-to-png-conversion-guide', ...guides.map((guide) => guide.slug)];
    for (const slug of expected) expect(html).toContain(`/blog/${slug}`);

    const sitemap = await (await request.get(`${BASE_URL}/sitemap.xml`)).text();
    for (const slug of expected) {
      expect(sitemap).toContain(`<loc>https://simplifyconvert.com/blog/${slug}</loc>`);
    }
  });

  for (const guide of guides) {
    test(`${guide.slug} ships substantive canonical server HTML`, async ({ request }) => {
      const path = `/blog/${guide.slug}`;
      const response = await request.get(`${BASE_URL}${path}`);
      expect(response.status()).toBe(200);
      const html = await response.text();

      expect((html.match(/<h1\b/g) || []).length).toBe(1);
      expect(html).toContain(`<link rel="canonical" href="https://simplifyconvert.com${path}"`);
      expect(html).toContain(`data-editorial-guide="${guide.slug}"`);
      expect(html).toContain(guide.marker);
      expect(html).toContain('Published by SimplifyConvert');
      expect(html).not.toMatch(/<meta[^>]+name="robots"[^>]+noindex/i);
      expect(html).not.toContain('href="#"');

      const headings = html.match(/<h2\b/g) || [];
      expect(headings.length).toBeGreaterThanOrEqual(5);
      const schemaMatches = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)];
      const schemas = schemaMatches.map((match) => JSON.parse(match[1]));
      const posting = schemas.filter((schema) => schema['@type'] === 'BlogPosting');
      expect(posting).toHaveLength(1);
      expect(posting[0].headline).toBe(guide.title);
      expect(posting[0].datePublished).toBe('2026-08-01');
      expect(posting[0].author).toMatchObject({ '@type': 'Organization', name: 'SimplifyConvert' });

      const internalLinks = [...html.matchAll(/href="(\/(?:all-tools|blog)[^"?#]*)"/g)].map((match) => match[1]);
      const uniqueLinks = [...new Set(internalLinks)];
      expect(uniqueLinks.some((link) => link.startsWith('/all-tools/'))).toBe(true);
      for (const link of uniqueLinks) {
        const linkedResponse = await request.get(`${BASE_URL}${link}`);
        expect(linkedResponse.status(), `${path} links to ${link}`).toBe(200);
      }
    });
  }

  test('existing JPG-to-PNG guide remains canonical and crawlable', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/blog/jpg-to-png-conversion-guide`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect((html.match(/<h1\b/g) || []).length).toBe(1);
    expect(html).toContain('<link rel="canonical" href="https://simplifyconvert.com/blog/jpg-to-png-conversion-guide"');
    expect(html).not.toMatch(/<meta[^>]+name="robots"[^>]+noindex/i);
  });

  test('all six article titles and descriptions are unique', async ({ request }) => {
    const paths = ['jpg-to-png-conversion-guide', ...guides.map((guide) => guide.slug)];
    const pages = await Promise.all(paths.map(async (slug) => (await request.get(`${BASE_URL}/blog/${slug}`)).text()));
    const titles = pages.map((html) => html.match(/<title>(.*?)<\/title>/)?.[1]);
    const descriptions = pages.map((html) => html.match(/<meta name="description" content="(.*?)"/)?.[1]);
    expect(new Set(titles).size).toBe(paths.length);
    expect(new Set(descriptions).size).toBe(paths.length);
  });
});
