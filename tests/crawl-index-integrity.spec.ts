import { expect, test } from '@playwright/test';

test.describe('crawl and index integrity', () => {
  test('valid AI and code tools ship meaningful server HTML', async ({ request }) => {
    const aiResponse = await request.get('/all-tools/ai-tools/paragraph-writer');
    expect(aiResponse.status()).toBe(200);
    const aiHtml = await aiResponse.text();
    expect(aiHtml).toContain('<h1');
    expect(aiHtml).toContain('Paragraph Writer');
    expect(aiHtml).not.toContain('AI Writing Tool Not Found');

    const codeResponse = await request.get('/all-tools/code-tools/json-formatter');
    expect(codeResponse.status()).toBe(200);
    const codeHtml = await codeResponse.text();
    expect(codeHtml).toContain('<h1');
    expect(codeHtml).toContain('JSON Formatter');
    expect(codeHtml).not.toContain('Tool Not Found');
  });

  test('invalid dynamic tool slugs return real 404 responses', async ({ request }) => {
    const invalidPaths = [
      '/all-tools/ai-tools/not-a-real-tool',
      '/all-tools/code-tools/not-a-real-tool',
      '/all-tools/data/json-to-csv',
      '/all-tools/video/video-to-mp3',
    ];

    for (const path of invalidPaths) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
    }
  });

  test('all-tools directory content is present in raw HTML', async ({ request }) => {
    const response = await request.get('/all-tools');
    expect(response.status()).toBe(200);
    const html = await response.text();

    expect(html).toContain('<h1');
    expect(html).toContain('All Tools');
    expect(html).toContain('Browse our complete collection of free online tools');
    expect(html).toContain('/all-tools/pdf-tools');
    expect(html).toContain('/all-tools/image-tools');
    expect((html.match(/href=/g) ?? []).length).toBeGreaterThan(20);
  });

  test('duplicate-purpose routes permanently redirect to canonical routes', async ({ request }) => {
    const redirects: Record<string, string> = {
      '/all-tools/pdf-to-jpg': '/all-tools/pdf/pdf-to-jpg',
      '/all-tools/pdf-to-text': '/all-tools/pdf/pdf-to-text',
      '/all-tools/image-compressor': '/all-tools/compress-image',
      '/all-tools/mp4-to-gif': '/all-tools/video/mp4-to-gif',
      '/all-tools/pdf': '/all-tools/pdf-tools',
      '/all-tools/ai-write': '/all-tools/ai-tools',
    };

    for (const [source, destination] of Object.entries(redirects)) {
      const response = await request.get(source, { maxRedirects: 0 });
      expect(response.status(), source).toBe(301);
      expect(new URL(response.headers().location, 'http://localhost').pathname, source).toBe(destination);
      expect((await request.get(destination)).status(), destination).toBe(200);
    }
  });

  test('sitemap contains canonical public URLs only', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const xml = await response.text();

    const excludedPaths = [
      '/all-tools/pdf-to-jpg',
      '/all-tools/pdf-to-text',
      '/all-tools/image-compressor',
      '/all-tools/mp4-to-gif',
      '/all-tools/ai-write',
      '/all-tools/data/json-to-csv',
      '/all-tools/video/video-to-mp3',
    ];
    for (const path of excludedPaths) {
      expect(xml, path).not.toContain(`<loc>https://simplifyconvert.com${path}</loc>`);
    }
    expect(xml).toContain('<loc>https://simplifyconvert.com/ai-studio</loc>');
    expect(xml).toContain('<loc>https://simplifyconvert.com/ai-studio/pricing</loc>');
    expect(xml).not.toContain('<loc>https://simplifyconvert.com/ai-studio/billing</loc>');
    expect(xml).not.toMatch(/<loc>https:\/\/simplifyconvert\.com\/ai-studio\/(?:document|presentation|spreadsheet)-maker/);

    expect(xml).toContain('<loc>https://simplifyconvert.com/all-tools/pdf/pdf-to-jpg</loc>');
    expect(xml).toContain('<loc>https://simplifyconvert.com/all-tools/compress-image</loc>');
    expect(xml).not.toContain('<lastmod>');
  });

  test('blog read links advertise only the six published guides', async ({ request }) => {
    const response = await request.get('/blog');
    expect(response.status()).toBe(200);
    const html = await response.text();
    const articleLinks = [...html.matchAll(/href="(\/blog\/[^"?#]+)"/g)].map((match) => match[1]);

    expect(articleLinks.length).toBeGreaterThan(0);
    expect(new Set(articleLinks)).toEqual(new Set([
      '/blog/jpg-to-png-conversion-guide',
      '/blog/merge-split-compress-ocr-pdf-guide',
      '/blog/jpg-png-webp-avif-image-formats',
      '/blog/image-compression-quality-file-size',
      '/blog/csv-excel-json-data-formats',
      '/blog/video-compression-resolution-bitrate-codec',
    ]));
    expect(html).not.toContain('href="#"');
  });
});
