import { expect, test } from '@playwright/test';
import { classifyRenderedResult } from './runner';

const noTextMessages = ['No text was detected in this image.'];

test('accepts extracted OCR text and the explicit no-text success state', () => {
  expect(classifyRenderedResult('Recognized document text', undefined, noTextMessages)).toBe('extracted-text');
  expect(classifyRenderedResult('No text was detected in this image.', undefined, noTextMessages)).toBe('no-text-detected');
});

test('rejects blank, loading, generic error, and unchanged placeholder output', () => {
  expect(classifyRenderedResult('', undefined, noTextMessages)).toBeNull();
  expect(classifyRenderedResult('Processing...', undefined, noTextMessages)).toBeNull();
  expect(classifyRenderedResult('Text recognition failed. Please try again.', undefined, noTextMessages)).toBeNull();
  expect(classifyRenderedResult('Extracted text appears here', 'Extracted text appears here', noTextMessages)).toBeNull();
});
