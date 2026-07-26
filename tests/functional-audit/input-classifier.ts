import type { FunctionalAuditContract } from '../../app/lib/audit-category-tools';

export type FilledInputSource = 'contract' | 'inferred';

export interface SemanticInputDescriptor {
  type: string;
  name?: string;
  id?: string;
  label?: string;
  placeholder?: string;
  ariaLabel?: string;
  required: boolean;
  min?: string;
  max?: string;
  currentValue?: string;
}

export interface SemanticInputDecision {
  semanticField: string;
  value?: string | number | boolean;
  source?: FilledInputSource;
  sensitive?: boolean;
}

const GENERAL_CONTENT_PATTERN = /content|text|prompt|code|query|description|title|name|keyword|message|input/;

function normalized(value?: string): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function fieldIdentity(field: SemanticInputDescriptor): string {
  return [field.name, field.id, field.label, field.placeholder, field.ariaLabel]
    .map(normalized)
    .filter(Boolean)
    .join(' ');
}

function semanticName(field: SemanticInputDescriptor): string {
  const identity = fieldIdentity(field);
  if (/pageorder/.test(identity)) return 'pageOrder';
  if (/pagerange/.test(identity)) return 'pageRange';
  if (/pagenumbers?/.test(identity)) return 'pageNumbers';
  if (/pagestodelete/.test(identity)) return 'pagesToDelete';
  if (field.type === 'url' || /websiteurl|url/.test(identity)) return 'url';
  if (field.type === 'password' || /password/.test(identity)) return 'password';
  if (/language/.test(identity)) return 'language';
  return field.name || field.id || field.ariaLabel || field.label?.trim() || field.placeholder?.trim() || field.type;
}

function configuredValue(
  field: SemanticInputDescriptor,
  optionValues: FunctionalAuditContract['optionValues'],
): { key: string; value: string | number | boolean } | undefined {
  const identityParts = fieldIdentity(field).split(' ').filter(Boolean);
  const configured = Object.entries(optionValues || {})
    .map(([key, value]) => ({ key, value, normalizedKey: normalized(key) }))
    .filter(({ normalizedKey }) => normalizedKey);
  const exact = configured.find(({ normalizedKey }) =>
    identityParts.some((part) => part === normalizedKey),
  );
  if (exact) return exact;

  return configured
    .filter(({ normalizedKey }) =>
      identityParts.some((part) => part.includes(normalizedKey)),
    )
    .sort((left, right) => right.normalizedKey.length - left.normalizedKey.length)[0];
}

function boundedNumber(field: SemanticInputDescriptor): number {
  const minimum = Number(field.min);
  const maximum = Number(field.max);
  let value = Number.isFinite(minimum) ? minimum : 1;
  if (Number.isFinite(maximum)) value = Math.min(value, maximum);
  if (Number.isFinite(minimum)) value = Math.max(value, minimum);
  return value;
}

export function decideSemanticInput(
  field: SemanticInputDescriptor,
  contract: FunctionalAuditContract,
  fixturePageCount: number,
): SemanticInputDecision {
  const configured = configuredValue(field, contract.optionValues);
  if (configured) {
    return {
      semanticField: configured.key,
      value: configured.value,
      source: 'contract',
      sensitive: field.type === 'password' || /password/i.test(configured.key),
    };
  }

  const identity = fieldIdentity(field);
  const semanticField = semanticName(field);
  const specializedPageField = /pagerange|pagenumbers?|pagestodelete|\bpages\b/.test(identity);
  if (specializedPageField) {
    return field.required
      ? { semanticField, value: fixturePageCount > 1 ? '1-2' : '1', source: 'inferred' }
      : { semanticField };
  }
  if (/pageorder/.test(identity)) return { semanticField };
  if (field.type === 'url' || /websiteurl|url/.test(identity)) {
    return contract.urlInput
      ? { semanticField: 'url', value: contract.urlInput, source: 'contract' }
      : { semanticField: 'url' };
  }
  if (field.type === 'password' || /password/.test(identity)) {
    return field.required
      ? { semanticField: 'password', value: 'Audit123!', source: 'inferred', sensitive: true }
      : { semanticField: 'password' };
  }
  if (/language/.test(identity)) return { semanticField: 'language' };
  if (field.type === 'number') {
    return { semanticField, value: boundedNumber(field), source: 'inferred' };
  }
  if (field.type === 'time' || /starttime|endtime/.test(identity)) {
    return { semanticField, value: '00:01', source: 'inferred' };
  }
  if (field.type === 'email') {
    return { semanticField, value: 'audit@example.invalid', source: 'inferred' };
  }
  if (field.type === 'checkbox' || field.type === 'radio') {
    return field.required ? { semanticField, value: true, source: 'inferred' } : { semanticField };
  }
  const generalContent = GENERAL_CONTENT_PATTERN.test(identity) &&
    (field.type === 'textarea' || field.type === 'text' || !field.type);
  if (generalContent && ['text', 'form'].includes(contract.strategy)) {
    return {
      semanticField,
      value: contract.textInput || 'SimplifyConvert predictable functional audit input.',
      source: contract.textInput ? 'contract' : 'inferred',
    };
  }
  return { semanticField };
}
