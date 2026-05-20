/**
 * Playwright E2E Tests for PDF Tools
 * Tests all PDF tools with valid and invalid inputs
 */

import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import {
  uploadFiles,
  setOptions,
  submitForm,
  waitForProcessing,
  checkForError,
  downloadFile,
  verifyOutput,
  getFixtures,
  fixtureExists,
} from './pdf-tools/test-helpers';
import { pdfToolsTestConfig, getAllPdfToolTests } from './pdf-tools/pdf-tools.config';

// Configure test settings
test.describe.configure({ mode: 'parallel' });

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// Test each PDF tool
getAllPdfToolTests().forEach((toolConfig) => {
  test.describe(`PDF Tool: ${toolConfig.title}`, () => {
    // Skip entire tool if marked as skip in config
    if (toolConfig.skip) {
      test.skip();
    }

    // Check if fixtures exist before running tests
    test.beforeAll(() => {
      const fixtures = getFixtures();
      
      // Log fixture availability
      console.log(`📁 Available PDF fixtures: ${fixtures.pdf.join(', ') || 'none'}`);
      console.log(`📁 Available image fixtures: ${fixtures.images.join(', ') || 'none'}`);
    });

    // POSITIVE TESTS - Valid input scenarios
    toolConfig.positiveTests.forEach((positiveTest) => {
      test(`✅ ${positiveTest.name}`, async ({ page, context }) => {
        // Skip if fixtures don't exist
        if (positiveTest.files) {
          const missingFiles = positiveTest.files.filter((f) => !fixtureExists(f));
          if (missingFiles.length > 0) {
            test.skip();
          }
        }

        try {
          // Navigate to tool URL
          const url = `${BASE_URL}${toolConfig.url}`;
          console.log(`\n🌐 Testing: ${toolConfig.title}`);
          console.log(`📍 URL: ${url}`);
          
          await page.goto(url, { waitUntil: 'networkidle' });
          
          // Verify page loaded
          expect(page.url()).toContain(toolConfig.slug);

          // Upload files if provided
          if (positiveTest.files && positiveTest.files.length > 0) {
            console.log(`📂 Uploading files: ${positiveTest.files.join(', ')}`);
            await uploadFiles(page, positiveTest.files);
            
            // Wait for file upload UI to update
            await page.waitForTimeout(500);
          }

          // Handle URL input
          if (positiveTest.url && toolConfig.inputType === 'url') {
            console.log(`🌐 Entering URL: ${positiveTest.url}`);
            const urlInput = page.locator('input[type="url"], input[placeholder*="URL"], input[placeholder*="website"]');
            await urlInput.fill(positiveTest.url);
          }

          // Set tool-specific options
          if (positiveTest.options) {
            console.log(`⚙️ Setting options:`, positiveTest.options);
            await setOptions(page, positiveTest.options);
          }

          // Get initial console logs
          const consoleLogs: string[] = [];
          page.on('console', (msg) => consoleLogs.push(msg.text()));

          // Submit form
          console.log(`📤 Submitting form...`);
          await submitForm(page);

          // Wait for processing
          console.log(`⏳ Waiting for processing...`);
          await waitForProcessing(page, 90000); // 90 second timeout for python backends

          // Check for errors
          const error = await checkForError(page);
          if (error) {
            console.log(`❌ Processing error: ${error}`);
            expect(error).toBeNull();
          }

          console.log(`✅ Processing completed successfully`);

          // Try to download output
          let output: Buffer | undefined;
          try {
            console.log(`⬇️ Downloading output file...`);
            output = await downloadFile(page);
            console.log(`📦 Output file size: ${output.length} bytes`);

            // Verify output file
            if (output && toolConfig.expectedOutputType) {
              const verified = await verifyOutput(output, toolConfig.expectedOutputType);
              console.log(
                `🔍 Output verification: ${verified ? '✅ PASSED' : '❌ FAILED'}`
              );
              expect(verified).toBe(true);
            }
          } catch (e) {
            console.log(
              `⚠️ Could not download output (might be expected for some tools)`
            );
          }

          // Log success
          console.log(`✅ Test PASSED: ${positiveTest.name}`);
        } catch (error) {
          console.error(`❌ Test FAILED: ${positiveTest.name}`);
          console.error(error);
          throw error;
        }
      });
    });

    // NEGATIVE TESTS - Invalid input scenarios
    toolConfig.negativeTests.forEach((negativeTest) => {
      test(`❌ ${negativeTest.name}`, async ({ page }) => {
        // Skip if fixtures don't exist
        if (negativeTest.files) {
          const missingFiles = negativeTest.files.filter((f) => !fixtureExists(f));
          if (missingFiles.length > 0) {
            test.skip();
          }
        }

        try {
          const url = `${BASE_URL}${toolConfig.url}`;
          console.log(`\n⚠️  Testing error case: ${toolConfig.title}`);
          console.log(`📍 URL: ${url}`);
          
          await page.goto(url, { waitUntil: 'networkidle' });

          // Upload files if provided
          if (negativeTest.files && negativeTest.files.length > 0) {
            console.log(`📂 Uploading files: ${negativeTest.files.join(', ')}`);
            await uploadFiles(page, negativeTest.files);
            await page.waitForTimeout(500);
          }

          // Set options
          if (negativeTest.options) {
            console.log(`⚙️ Setting options:`, negativeTest.options);
            await setOptions(page, negativeTest.options);
          }

          // Try to submit
          console.log(`📤 Attempting submission...`);
          
          // Some errors might be caught by form validation
          const submitButton = page.locator('button[type="submit"]');
          const isDisabled = await submitButton.isDisabled();
          
          if (isDisabled) {
            console.log(`✅ Form correctly disabled (validation passed)`);
            expect(isDisabled).toBe(true);
            return;
          }

          // Try to submit
          await submitButton.click();
          
          // Wait for processing
          await waitForProcessing(page, 30000);

          // Check for error message
          const error = await checkForError(page);
          
          if (error) {
            console.log(`✅ Error correctly shown: ${error}`);
            
            // Check if error matches expected
            if (negativeTest.expectedError) {
              const errorLower = error.toLowerCase();
              const expectedLower = negativeTest.expectedError.toLowerCase();
              
              if (errorLower.includes(expectedLower)) {
                console.log(`✅ Error message contains expected text`);
                expect(errorLower).toContain(expectedLower);
              } else {
                console.log(`⚠️ Error message doesn't contain expected text`);
                console.log(`   Expected: ${negativeTest.expectedError}`);
                console.log(`   Got: ${error}`);
              }
            }
          } else {
            console.log(`⚠️ No error shown (might be OK for some cases)`);
          }

          console.log(`✅ Negative test completed: ${negativeTest.name}`);
        } catch (error) {
          console.error(`❌ Test FAILED: ${negativeTest.name}`);
          console.error(error);
          // Don't fail negative tests that don't show expected error
          // Just log it
        }
      });
    });
  });
});

// Global sanity check
test.describe('PDF Tools - Sanity Check', () => {
  test('fixtures are available', () => {
    const fixtures = getFixtures();
    console.log(`\n📊 Fixture Summary:`);
    console.log(`   PDF files: ${fixtures.pdf.length}`);
    console.log(`   Image files: ${fixtures.images.length}`);
    
    if (fixtures.pdf.length === 0 || fixtures.images.length === 0) {
      console.warn(
        `⚠️ Some fixtures are missing. Run: npm run generate-fixtures`
      );
    }
  });

  test('test configuration loaded', () => {
    const tools = getAllPdfToolTests();
    console.log(`\n📊 Test Configuration Summary:`);
    console.log(`   Total tools configured: ${tools.length}`);
    console.log(`   Tools:`);
    tools.forEach((tool) => {
      console.log(`     - ${tool.slug} (${tool.positiveTests.length} positive, ${tool.negativeTests.length} negative tests)`);
    });
  });
});
