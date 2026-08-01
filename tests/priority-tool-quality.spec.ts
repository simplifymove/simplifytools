import { expect, test } from '@playwright/test';

const pages = [
  { path: '/all-tools/pdf/merge-pdf', id: 'merge-pdf', category: '/all-tools/pdf-tools', marker: 'Combine PDFs without changing their page content' },
  { path: '/all-tools/pdf/compress-pdf', id: 'compress-pdf', category: '/all-tools/pdf-tools', marker: 'Reduce PDF overhead and stream size where possible' },
  { path: '/all-tools/pdf/pdf-to-word', id: 'pdf-to-word', category: '/all-tools/pdf-tools', marker: 'Turn PDF text into a best-effort DOCX' },
  { path: '/all-tools/compress-image', id: 'compress-image', category: '/all-tools/image-tools', marker: 'Change encoding quality without changing dimensions' },
  { path: '/all-tools/resize-image', id: 'resize-image', category: '/all-tools/image-tools', marker: 'Set exact pixel dimensions with optional aspect locking' },
  { path: '/all-tools/remove-background', id: 'remove-background', category: '/all-tools/image-tools', marker: 'Create a cutout with model-generated edges' },
  { path: '/all-tools/jpg-to-png', id: 'jpg-to-png', category: '/all-tools/image-tools', marker: 'Re-encode a JPEG as PNG without inventing missing detail' },
  { path: '/all-tools/video/compress-video', id: 'compress-video', category: '/all-tools/video-tools', marker: 'Balance video size, encoding time, and visible quality' },
  { path: '/all-tools/data/csv-to-json', id: 'csv-to-json', category: '/all-tools/data', marker: 'Convert tabular CSV rows into a JSON array' },
  { path: '/all-tools/code-tools/json-formatter', id: 'json-formatter', category: '/all-tools/code-tools', marker: 'Parse valid JSON and rewrite its indentation' },
] as const;

test.describe('Phase 3A priority tool quality', () => {
  for (const page of pages) {
    test(`${page.id} ships useful canonical SSR content`, async ({ request }) => {
      const response = await request.get(page.path);
      expect(response.status()).toBe(200);
      const html = await response.text();

      expect((html.match(/<h1(?:\s|>)/gi) ?? []).length).toBe(1);
      expect(html).toContain(`<link rel="canonical" href="https://simplifyconvert.com${page.path}"`);
      expect(html).toContain(`data-priority-tool-guide="${page.id}"`);
      expect(html).toContain(page.marker);
      expect(html).toContain(`href="${page.category}"`);
      expect(html).not.toContain('Tool Not Found');
      expect(html).not.toMatch(/<meta[^>]+content="[^"]*noindex/i);
      expect(html).toMatch(/<(?:input|textarea)[^>]*>/i);
      expect(html).toMatch(/<button[^>]*>/i);

      const guideStart = html.indexOf(`data-priority-tool-guide="${page.id}"`);
      const guideEnd = html.indexOf('</section>', guideStart) + '</section>'.length;
      const guideHtml = html.slice(guideStart, guideEnd);
      expect((guideHtml.match(/<details/g) ?? []).length).toBeGreaterThanOrEqual(4);
      expect((guideHtml.match(/href="\/all-tools\//g) ?? []).length).toBeGreaterThanOrEqual(4);

      const faqScripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map((match) => match[1])
        .map((json) => JSON.parse(json))
        .filter((schema) => schema['@type'] === 'FAQPage');
      expect(faqScripts).toHaveLength(1);
      expect(faqScripts[0].mainEntity).toHaveLength(4);
      for (const question of faqScripts[0].mainEntity) {
        expect(guideHtml).toContain(question.name);
        expect(question.acceptedAnswer.text.length).toBeGreaterThan(40);
      }

      const internalLinks = [...guideHtml.matchAll(/href="(\/(?:all-tools|blog)\/[^"#?]+)"/g)].map((match) => match[1]);
      for (const href of new Set(internalLinks)) {
        expect((await request.get(href)).status(), `${page.path} -> ${href}`).toBe(200);
      }
    });
  }

  test('JPG to PNG links only to the existing editorial guide', async ({ request }) => {
    const html = await (await request.get('/all-tools/jpg-to-png')).text();
    expect(html).toContain('href="/blog/jpg-to-png-conversion-guide"');
    expect(html).not.toMatch(/href="\/blog\/(?!jpg-to-png-conversion-guide)[^"]+/);
  });
});
