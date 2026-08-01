import { expect, test } from '@playwright/test';

test.describe('core site quality and policy consistency', () => {
  test('all-tools exposes canonical category destinations in server HTML', async ({ request }) => {
    const response = await request.get('/all-tools');
    expect(response.status()).toBe(200);
    const html = await response.text();

    for (const path of [
      '/all-tools/pdf-tools',
      '/all-tools/image-tools',
      '/all-tools/video-tools',
      '/all-tools/data',
      '/all-tools/code-tools',
      '/all-tools/ai-tools',
      '/all-tools/financial-calculators',
    ]) {
      expect(html, path).toContain(`href="${path}"`);
    }
    expect(html).toContain('Choose a category');
  });

  test('category hubs contain task-specific guidance without blanket guarantees', async ({ request }) => {
    const expectations: Record<string, string> = {
      '/all-tools/pdf-tools': 'Choose a PDF Tool for the Document Task',
      '/all-tools/image-tools': 'Choose the Image Operation That Matches the Goal',
      '/all-tools/video-tools': 'Choose a Video Workflow by Output',
      '/all-tools/data': 'Move Data Between Common Formats',
      '/all-tools/code-tools': 'Developer Utilities for Specific Text Transformations',
      '/all-tools/ai-tools': 'Choose an AI Tool by Writing Task',
      '/all-tools/financial-calculators': 'Four Focused Planning Calculators',
    };

    for (const [path, marker] of Object.entries(expectations)) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      expect(html, path).toContain(marker);
      expect(html, path).not.toMatch(/permanently free|complete privacy guaranteed|never stored on (?:our )?servers/i);
    }
  });

  test('trust and legal pages state the implemented product boundaries', async ({ request }) => {
    const about = await (await request.get('/about')).text();
    expect(about).toContain('Premium AI Studio');
    expect(about).toContain('Some tasks run in the browser');
    expect(about).not.toContain('200+ tools');

    const privacy = await (await request.get('/privacy')).text();
    expect(privacy).toContain('about 30 minutes');
    expect(privacy).toContain('Google AdSense');
    expect(privacy).not.toContain('five seconds');

    const cookies = await (await request.get('/cookies')).text();
    expect(cookies).toContain('NextAuth');
    expect(cookies).toContain('Google Analytics');
    expect(cookies).toContain('Google AdSense');
    expect(cookies).not.toContain('cookie consent banner');

    const terms = await (await request.get('/terms')).text();
    expect(terms).toContain('Premium AI Studio');
    expect(terms).toContain('Razorpay, PayPal, or Stripe');
    expect(terms).not.toContain('99% uptime');
  });

  test('contact provides a direct support route and safe diagnostic guidance', async ({ request }) => {
    const response = await request.get('/contact');
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain('info@simplifyconvert.com');
    expect(html).toContain('tool page URL');
    expect(html).toContain('Do not send passwords');
  });
});
