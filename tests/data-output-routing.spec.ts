import { expect, test } from '@playwright/test';
import { createConvertedFilename, dataMimeTypeForExtension, resolveDataOutputExtension } from '../app/lib/data-validation';

test('Excel to CSV output extension follows the selected sheet mode', () => {
  expect(resolveDataOutputExtension('excel-to-csv', '.csv', { sheet_mode: 'first' })).toBe('.csv');
  expect(resolveDataOutputExtension('excel-to-csv', '.csv', { sheet_mode: 'zip' })).toBe('.zip');
  expect(resolveDataOutputExtension('excel-to-csv', '.csv', { sheetMode: 'zip' })).toBe('.zip');
});

test('unrelated data outputs retain their configured extension', () => {
  expect(resolveDataOutputExtension('json-to-xml', '.xml', { rootTag: 'inventory' })).toBe('.xml');
});

test('CSV and ZIP result metadata use the correct MIME type and filename extension', () => {
  expect(dataMimeTypeForExtension('.csv')).toBe('text/csv');
  expect(dataMimeTypeForExtension('.zip')).toBe('application/zip');
  expect(createConvertedFilename('.csv')).toBe('converted.csv');
  expect(createConvertedFilename('.zip')).toBe('converted.zip');
});
