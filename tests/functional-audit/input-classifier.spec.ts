import { expect, test } from '@playwright/test';
import type { FunctionalAuditContract } from '../../app/lib/audit-category-tools';
import { decideSemanticInput } from './input-classifier';

const contract = (optionValues: Record<string, string | number | boolean> = {}): FunctionalAuditContract => ({
  strategy: 'file',
  fixtures: ['tests/fixtures/pdf/simple.pdf'],
  optionValues,
  resultFlow: 'download-page',
});

test('pageRange never receives general prose', () => {
  const decision = decideSemanticInput({ type: 'text', label: 'Page Range (empty = all)', placeholder: '1-5', required: true }, contract(), 1);
  expect(decision.value).toBe('1');
  expect(decision.value).not.toContain('predictable functional audit input');
});

test('configured values are preserved as the contract source', () => {
  const decision = decideSemanticInput({ type: 'text', label: 'Page Range', placeholder: '1-5', required: false }, contract({ pageRange: '1-2' }), 1);
  expect(decision).toMatchObject({ semanticField: 'pageRange', value: '1-2', source: 'contract' });
});

test('configured values match semantic labels with descriptive prefixes', () => {
  const decision = decideSemanticInput({ type: 'select', label: 'OCR Language', required: true }, contract({ language: 'eng' }), 1);
  expect(decision).toMatchObject({ semanticField: 'language', value: 'eng', source: 'contract' });
});

test('specific configured fields win fuzzy semantic-label matches', () => {
  const decision = decideSemanticInput(
    { type: 'select', label: 'Text Color', required: true },
    contract({ text: 'Audit added text', color: '0,0,0' }),
    1,
  );
  expect(decision).toMatchObject({ semanticField: 'color', value: '0,0,0', source: 'contract' });
  expect(decision.semanticField).not.toBe('text');
});

test('optional specialized fields remain empty without configuration', () => {
  const decision = decideSemanticInput({ type: 'text', label: 'Page Range (empty = all)', placeholder: '1-5', required: false }, contract(), 2);
  expect(decision.value).toBeUndefined();
  expect(decision.source).toBeUndefined();
});

test('required multi-page fields use a deterministic valid range', () => {
  const decision = decideSemanticInput({ type: 'text', name: 'pageNumbers', required: true }, contract(), 2);
  expect(decision.value).toBe('1-2');
});

test('numeric values stay within min and max', () => {
  const decision = decideSemanticInput({ type: 'number', name: 'quality', required: false, min: '10', max: '20' }, contract(), 1);
  expect(decision.value).toBe(10);
});
