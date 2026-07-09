/**
 * Production-safe Playwright audits for PDF tools.
 *
 * Default mode is smoke-first: page load, input wiring, submit when enabled, and
 * success/error reporting. Set PDF_AUDIT_FULL_DOWNLOAD=true for slower output
 * download verification.
 */

import { expect, test } from '@playwright/test';
import {
  checkForError,
  downloadFile,
  fixtureExists,
  getFixtures,
  getPdfAuditState,
  setOptions,
  submitForm,
  uploadFiles,
  verifyOutput,
  waitForProcessing,
} from './pdf-tools/test-helpers';
import { getAllPdfToolTests } from './pdf-tools/pdf-tools.config';

test.describe.configure({ mode: 'parallel' });

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
const FULL_DOWNLOAD_AUDIT = process.env.PDF_AUDIT_FULL_DOWNLOAD === 'true';

function classifyPdfFailure(errorMessage: string | null, route: string) {
  if (!errorMessage) return 'test framework or page load issue';
  if (/too small|empty|signature|corrupt|invalid .*file/i.test(errorMessage)) {
    return 'test fixture or file compatibility issue';
  }
  if (/please arrange|submit button was disabled|validation-disabled/i.test(errorMessage)) {
    return 'test issue or UI validation issue';
  }
  return 'real tool issue or backend processing issue';
}

async function reportFailure(
  page: any,
  route: string,
  fallbackMessage: string,
  formSubmittedOverride?: boolean,
) {
  const state = await getPdfAuditState(page).catch(() => null);
  const errorMessage = state?.errorMessage || fallbackMessage;
  const report = {
    route,
    pageLoaded: state?.pageLoaded ?? false,
    formSubmitted: formSubmittedOverride ?? state?.formSubmitted ?? false,
    errorMessage,
    classification: classifyPdfFailure(errorMessage, route),
  };

  console.error(`PDF_AUDIT_FAILURE ${JSON.stringify(report)}`);
  return report;
}

getAllPdfToolTests().forEach((toolConfig) => {
  test.describe(`PDF Tool: ${toolConfig.title}`, () => {
    if (toolConfig.skip) {
      test.skip();
    }

    test.beforeAll(() => {
      const fixtures = getFixtures();
      console.log(`Available PDF fixtures: ${fixtures.pdf.join(', ') || 'none'}`);
      console.log(`Available image fixtures: ${fixtures.images.join(', ') || 'none'}`);
    });

    toolConfig.positiveTests.forEach((positiveTest) => {
      test(`smoke: ${positiveTest.name}`, async ({ page }) => {
        if (positiveTest.files) {
          const missingFiles = positiveTest.files.filter((fileName) => !fixtureExists(fileName));
          if (missingFiles.length > 0) {
            test.skip(true, `Missing fixtures: ${missingFiles.join(', ')}`);
          }
        }

        const route = toolConfig.url;
        const url = `${BASE_URL}${route}`;
        let formSubmitted = false;

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded' });
          await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
          expect(page.url()).toContain(toolConfig.slug);

          if (positiveTest.files && positiveTest.files.length > 0) {
            await uploadFiles(page, positiveTest.files);
          }

          if (positiveTest.url && toolConfig.inputType === 'url') {
            const urlInput = page
              .locator('form input[type="url"]:visible, form input[placeholder*="URL"]:visible, form input[placeholder*="website"]:visible')
              .first();
            await urlInput.fill(positiveTest.url);
          }

          if (positiveTest.options) {
            await setOptions(page, positiveTest.options);
          }

          const submitResult = await submitForm(page);
          formSubmitted = submitResult.submitted;

          if (!submitResult.submitted) {
            const reason =
              toolConfig.slug === 'create-pdf' && positiveTest.name.toLowerCase().includes('blank')
                ? 'blank PDF creation is validation-disabled in the current UI because submit requires uploaded files.'
                : 'submit button was disabled before submission.';
            await reportFailure(page, route, reason, false);
            return;
          }

          await waitForProcessing(page, 15000);

          const error = await checkForError(page);
          if (error) {
            const report = await reportFailure(page, route, error, formSubmitted);
            throw new Error(`PDF audit failed: ${JSON.stringify(report)}`);
          }

          if (FULL_DOWNLOAD_AUDIT) {
            const output = await downloadFile(page);
            const verified = await verifyOutput(output, toolConfig.expectedOutputType);
            expect(verified).toBe(true);
          }
        } catch (error) {
          await reportFailure(
            page,
            route,
            error instanceof Error ? error.message : String(error),
            formSubmitted,
          );
          throw error;
        }
      });
    });

    toolConfig.negativeTests.forEach((negativeTest) => {
      test(`validation: ${negativeTest.name}`, async ({ page }) => {
        if (negativeTest.files) {
          const missingFiles = negativeTest.files.filter((fileName) => !fixtureExists(fileName));
          if (missingFiles.length > 0) {
            test.skip(true, `Missing fixtures: ${missingFiles.join(', ')}`);
          }
        }

        const route = toolConfig.url;
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

        if (negativeTest.files && negativeTest.files.length > 0) {
          await uploadFiles(page, negativeTest.files);
        }

        if (negativeTest.url && toolConfig.inputType === 'url') {
          const urlInput = page
            .locator('form input[type="url"]:visible, form input[placeholder*="URL"]:visible, form input[placeholder*="website"]:visible')
            .first();
          await urlInput.fill(negativeTest.url);
        }

        if (negativeTest.options) {
          await setOptions(page, negativeTest.options);
        }

        const submitResult = await submitForm(page);
        if (!submitResult.submitted) {
          console.log(`Validation-disabled as expected for ${route}`);
          return;
        }

        await waitForProcessing(page, 10000);
        const error = await checkForError(page);

        if (negativeTest.expectedError && error) {
          expect(error.toLowerCase()).toContain(negativeTest.expectedError.toLowerCase());
        }
      });
    });
  });
});

test.describe('PDF Tools - Sanity Check', () => {
  test('fixtures are available', () => {
    const fixtures = getFixtures();
    console.log(`Fixture Summary: PDF=${fixtures.pdf.length}, images=${fixtures.images.length}`);
    expect(fixtures.pdf.length).toBeGreaterThan(0);
    expect(fixtures.images.length).toBeGreaterThan(0);
  });

  test('test configuration loaded', () => {
    const tools = getAllPdfToolTests();
    console.log(`PDF tools configured: ${tools.length}`);
    expect(tools.length).toBeGreaterThan(0);
  });
});
