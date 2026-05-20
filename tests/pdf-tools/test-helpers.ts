/**
 * PDF Tools Test Helpers
 * Reusable utilities for testing PDF tools
 */

import { Page, expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as AdmZip from 'adm-zip';

// Test fixtures directory
const FIXTURES_DIR = path.join(__dirname, '../../tests/fixtures');
const PDF_DIR = path.join(FIXTURES_DIR, 'pdf');
const IMAGE_DIR = path.join(FIXTURES_DIR, 'images');

/**
 * Upload file to the form
 */
export async function uploadFiles(
  page: Page,
  fileNames: string[]
): Promise<void> {
  if (fileNames.length === 0) return;

  // Find file input
  const fileInput = page.locator('input[type="file"]');
  
  // Set multiple files
  const filePaths = fileNames.map(fileName => {
    const dir = fileName.endsWith('.pdf') ? PDF_DIR : IMAGE_DIR;
    return path.join(dir, fileName);
  });

  await fileInput.setInputFiles(filePaths);
  
  // Wait for files to be processed
  await page.waitForTimeout(500);
}

/**
 * Upload single file
 */
export async function uploadFile(
  page: Page,
  fileName: string
): Promise<void> {
  const fileInput = page.locator('input[type="file"]');
  const dir = fileName.endsWith('.pdf') ? PDF_DIR : IMAGE_DIR;
  const filePath = path.join(dir, fileName);
  
  await fileInput.setInputFiles(filePath);
  await page.waitForTimeout(500);
}

/**
 * Set form options
 */
export async function setOptions(
  page: Page,
  options: Record<string, any>
): Promise<void> {
  for (const [key, value] of Object.entries(options)) {
    // Skip signatures - handled separately
    if (key === 'signatures') continue;

    let input;
    
    // Special handling for URL inputs to avoid strict mode issues
    if (key === 'url' || key === 'website' || key === 'link') {
      // Get all URL inputs and use the last one (main form input, not search)
      const allUrlInputs = page.locator('input[type="url"]');
      const count = await allUrlInputs.count();
      if (count > 0) {
        input = allUrlInputs.nth(count - 1); // Use last one (main form)
      }
    } else {
      input = page.locator(`input[name="${key}"], select[name="${key}"], textarea[name="${key}"]`);
    }
    
    const count = await input.count();

    if (count > 0) {
      const element = input.first();
      const tagName = await element.evaluate((el) => el.tagName.toLowerCase());

      if (tagName === 'select') {
        await element.selectOption(String(value));
      } else if (tagName === 'input') {
        const type = await element.getAttribute('type');
        if (type === 'checkbox') {
          if (value) {
            await element.check();
          } else {
            await element.uncheck();
          }
        } else if (type === 'number') {
          await element.fill(String(value));
        } else {
          await element.fill(String(value));
        }
      } else if (tagName === 'textarea') {
        await element.fill(String(value));
      }
    }
  }

  await page.waitForTimeout(300);
}


/**
 * Submit form and wait for processing
 */
export async function submitForm(
  page: Page
): Promise<void> {
  const button = page.locator('button[type="submit"]');
  await button.click();
}

/**
 * Wait for processing to complete
 */
export async function waitForProcessing(
  page: Page,
  timeoutMs: number = 30000
): Promise<void> {
  // Wait for loading spinner to appear and disappear
  const spinner = page.locator('[class*="loading"], [class*="spinner"]');
  
  // Wait a bit for processing to start
  await page.waitForTimeout(500);

  // Wait for processing to finish (30 second timeout)
  await page.waitForTimeout(timeoutMs);
}

/**
 * Check for success message
 */
export async function checkForSuccess(
  page: Page
): Promise<boolean> {
  const successMessage = page.locator('[class*="success"], [class*="green"]');
  return await successMessage.isVisible({ timeout: 5000 }).catch(() => false);
}

/**
 * Check for error message
 */
export async function checkForError(
  page: Page
): Promise<string | null> {
  try {
    // Look for error messages in multiple places
    const selectors = [
      '[class*="error"]',
      '[class*="red"]',
      '.text-red-600',
      '[role="alert"]',
      '.toast',
      '[class*="alert"]'
    ];
    
    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        const count = await element.count();
        if (count > 0) {
          const text = await element.first().textContent();
          if (text && text.trim() && text.trim() !== '*') {
            return text.trim();
          }
        }
      } catch {}
    }
  } catch {}
  return null;
}

/**
 * Download file from page
 */
export async function downloadFile(
  page: Page
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      // Wait for download link
      const downloadLink = page.locator('a[download], button:has-text("Download")');
      
      if (await downloadLink.count() === 0) {
        reject(new Error('No download link found'));
        return;
      }

      // Start waiting for download before clicking
      const downloadPromise = page.waitForEvent('download');
      await downloadLink.first().click();
      const download = await downloadPromise;

      // Wait for download to finish
      const filePath = await download.path();
      const buffer = fs.readFileSync(filePath);
      
      // Clean up
      fs.unlinkSync(filePath);
      
      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Verify PDF output file
 */
export async function verifyPdfOutput(buffer: Buffer): Promise<boolean> {
  // Check PDF signature
  const pdfSignature = '%PDF';
  const header = buffer.toString('ascii', 0, 4);
  return header === pdfSignature && buffer.length > 100;
}

/**
 * Verify image output file (JPG, PNG, etc.)
 */
export async function verifyImageOutput(
  buffer: Buffer,
  format: 'jpg' | 'png' | 'tiff' | 'webp' | 'gif'
): Promise<boolean> {
  if (buffer.length < 100) return false;

  switch (format) {
    case 'jpg':
      // Check JPEG signature
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'png':
      // Check PNG signature
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    case 'gif':
      // Check GIF signature
      return (
        buffer[0] === 0x47 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46
      );
    case 'tiff':
      // Check TIFF signature (little-endian or big-endian)
      return (
        (buffer[0] === 0x49 && buffer[1] === 0x49) ||
        (buffer[0] === 0x4d && buffer[1] === 0x4d)
      );
    case 'webp':
      // Check WebP signature
      return (
        buffer[0] === 0x52 &&
        buffer[1] === 0x49 &&
        buffer[2] === 0x46 &&
        buffer[3] === 0x46
      );
    default:
      return false;
  }
}

/**
 * Verify ZIP output file
 */
export async function verifyZipOutput(buffer: Buffer): Promise<boolean> {
  // Check ZIP signature (PK)
  if (buffer.length < 4) return false;
  
  try {
    // Try to open as ZIP
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    return entries.length > 0;
  } catch {
    return false;
  }
}

/**
 * Verify text output file
 */
export async function verifyTextOutput(buffer: Buffer): Promise<boolean> {
  if (buffer.length < 10) return false;
  
  try {
    const text = buffer.toString('utf-8');
    // Valid text should be decodable
    return text.length > 0;
  } catch {
    return false;
  }
}

/**
 * Verify CSV output file
 */
export async function verifyCSVOutput(buffer: Buffer): Promise<boolean> {
  if (buffer.length < 5) return false;
  
  try {
    const text = buffer.toString('utf-8');
    // CSV should have commas or newlines
    return text.includes(',') || text.includes('\n');
  } catch {
    return false;
  }
}

/**
 * Verify Excel output file
 */
export async function verifyExcelOutput(buffer: Buffer): Promise<boolean> {
  // Check XLSX signature (ZIP with specific structure)
  if (buffer.length < 100) return false;
  
  try {
    // XLSX is a ZIP file
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    
    // Look for workbook.xml
    return entries.some((entry) => entry.entryName.includes('workbook.xml'));
  } catch {
    return false;
  }
}

/**
 * Verify Word document output
 */
export async function verifyDocxOutput(buffer: Buffer): Promise<boolean> {
  // Check DOCX signature (ZIP with specific structure)
  if (buffer.length < 100) return false;
  
  try {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    
    // Look for document.xml
    return entries.some((entry) => entry.entryName.includes('document.xml'));
  } catch {
    return false;
  }
}

/**
 * Main verification function
 */
export async function verifyOutput(
  buffer: Buffer,
  outputType:
    | 'pdf'
    | 'jpg'
    | 'png'
    | 'zip'
    | 'txt'
    | 'csv'
    | 'xlsx'
    | 'docx'
    | 'html'
    | 'epub'
    | 'mobi'
    | 'azw3'
    | 'pptx'
    | 'rtf'
): Promise<boolean> {
  // Basic size check
  if (buffer.length === 0) return false;

  switch (outputType) {
    case 'pdf':
      return verifyPdfOutput(buffer);
    case 'jpg':
      return verifyImageOutput(buffer, 'jpg');
    case 'png':
      return verifyImageOutput(buffer, 'png');
    case 'zip':
      return verifyZipOutput(buffer);
    case 'txt':
      return verifyTextOutput(buffer);
    case 'csv':
      return verifyCSVOutput(buffer);
    case 'xlsx':
      return verifyExcelOutput(buffer);
    case 'docx':
      return verifyDocxOutput(buffer);
    case 'html':
      return verifyTextOutput(buffer); // HTML is text
    case 'rtf':
      return verifyTextOutput(buffer); // RTF is text
    case 'epub':
      return verifyZipOutput(buffer); // EPUB is ZIP-based
    case 'mobi':
      return buffer.length > 100; // Basic check for MOBI
    case 'azw3':
      return buffer.length > 100; // Basic check for AZW3
    case 'pptx':
      return verifyExcelOutput(buffer); // PPTX is also ZIP-based
    default:
      return buffer.length > 0;
  }
}

/**
 * Run complete PDF tool test
 */
export async function runPdfToolTest(
  page: Page,
  url: string,
  files: string[],
  options?: Record<string, any>,
  expectedOutputType?: string
): Promise<{
  success: boolean;
  error?: string;
  output?: Buffer;
  outputSize?: number;
  verified?: boolean;
}> {
  try {
    // Navigate to tool
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // Upload files
    if (files.length > 0) {
      await uploadFiles(page, files);
    }

    // Set options
    if (options) {
      await setOptions(page, options);
    }

    // Submit form
    await submitForm(page);

    // Wait for processing
    await waitForProcessing(page);

    // Check for errors
    const error = await checkForError(page);
    if (error) {
      return { success: false, error };
    }

    // Try to download output
    let output: Buffer | undefined;
    try {
      output = await downloadFile(page);
    } catch (e) {
      // No download available
    }

    if (!output) {
      return { success: true, error: 'No output file generated' };
    }

    // Verify output
    let verified = false;
    if (expectedOutputType) {
      verified = await verifyOutput(output, expectedOutputType as any);
    }

    return {
      success: true,
      output,
      outputSize: output.length,
      verified,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Get fixture file path
 */
export function getFixturePath(fileName: string): string {
  const dir = fileName.endsWith('.pdf') ? PDF_DIR : IMAGE_DIR;
  return path.join(dir, fileName);
}

/**
 * Check if fixture file exists
 */
export function fixtureExists(fileName: string): boolean {
  return fs.existsSync(getFixturePath(fileName));
}

/**
 * Get all fixture files
 */
export function getFixtures(): {
  pdf: string[];
  images: string[];
} {
  return {
    pdf: fs.existsSync(PDF_DIR) ? fs.readdirSync(PDF_DIR) : [],
    images: fs.existsSync(IMAGE_DIR) ? fs.readdirSync(IMAGE_DIR) : [],
  };
}

