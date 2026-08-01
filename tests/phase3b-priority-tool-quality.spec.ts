import { expect, test } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const pages = [
  { path: '/all-tools/pdf/split-pdf', id: 'split-pdf', category: '/all-tools/pdf-tools', marker: 'Separate a PDF by individual pages, selected pages, or fixed-size chunks' },
  { path: '/all-tools/pdf/pdf-to-jpg', id: 'pdf-to-jpg', category: '/all-tools/pdf-tools', marker: 'Render each selected PDF page as a JPEG image' },
  { path: '/all-tools/png-to-jpg', id: 'png-to-jpg', category: '/all-tools/image-tools', marker: 'Flatten a PNG into an opaque JPEG for photographic delivery' },
  { path: '/all-tools/webp-to-jpg', id: 'webp-to-jpg', category: '/all-tools/image-tools', marker: 'Create a JPEG copy for systems that do not accept WebP' },
  { path: '/all-tools/crop-image', id: 'crop-image', category: '/all-tools/image-tools', marker: 'Remove pixels outside a selected image boundary' },
  { path: '/all-tools/video/trim-video', id: 'trim-video', category: '/all-tools/video-tools', marker: 'Keep one continuous section between a start and end time' },
  { path: '/all-tools/video/resize-video', id: 'resize-video', category: '/all-tools/video-tools', marker: 'Fit a video into new pixel dimensions' },
  { path: '/all-tools/data/excel-to-csv', id: 'excel-to-csv', category: '/all-tools/data', marker: 'Export the first worksheet or every worksheet as CSV' },
  { path: '/all-tools/data/json-to-xml', id: 'json-to-xml', category: '/all-tools/data', marker: 'Map JSON objects and arrays into XML elements' },
  { path: '/all-tools/code-tools/json-validator', id: 'json-validator', category: '/all-tools/code-tools', marker: 'Check whether text follows JSON syntax' },
] as const;

for (const page of pages) {
  test(`${page.id} has differentiated canonical SSR content`, async ({ request }) => {
    const response = await request.get(`${BASE_URL}${page.path}`);
    expect(response.status()).toBe(200);
    const html = await response.text();

    expect((html.match(/<h1\b/g) || []).length).toBe(1);
    expect(html).toContain(`<link rel="canonical" href="https://simplifyconvert.com${page.path}"`);
    expect(html).toContain(`data-priority-tool-guide="${page.id}"`);
    expect(html).toContain(page.marker);
    expect(html).toContain(`href="${page.category}"`);
    expect(html).not.toContain('Tool Not Found');
    expect(html).not.toMatch(/<meta[^>]+name="robots"[^>]+noindex/i);
    expect(html).toMatch(/<(input|textarea)\b/);
    expect(html).toMatch(/<button\b/);
    expect((html.match(/<details\b/g) || []).length).toBe(4);

    const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)]
      .map((match) => JSON.parse(match[1]));
    const faqSchemas = schemas.filter((schema) => schema['@type'] === 'FAQPage');
    expect(faqSchemas).toHaveLength(1);
    expect(faqSchemas[0].mainEntity).toHaveLength(4);
    for (const question of faqSchemas[0].mainEntity) expect(html).toContain(question.name);

    const links = [...new Set([...html.matchAll(/href="(\/(?:all-tools|blog)[^"?#]*)"/g)].map((match) => match[1]))];
    for (const link of links) {
      const linked = await request.get(`${BASE_URL}${link}`);
      expect(linked.status(), `${page.path} links to ${link}`).toBe(200);
    }
  });
}
