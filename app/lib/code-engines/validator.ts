import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import cronParser from 'cron-parser';
// Validator Engine - handles validation operations

export interface ValidationResult {
  valid: boolean;
  message: string;
  errors?: Array<{
    line?: number;
    column?: number;
    message: string;
  }>;
  meta?: Record<string, any>;
}

// JSON validation
export function validateJSON(text: string): ValidationResult {
  try {
    JSON.parse(text);
    return {
      valid: true,
      message: 'Valid JSON',
      meta: {
        type: 'json',
      },
    };
  } catch (error) {
    const errorMsg =
      error instanceof SyntaxError ? error.message : String(error);
    const match = errorMsg.match(/position (\d+)/);
    const position = match ? parseInt(match[1]) : 0;

    // Calculate line and column
    const lines = text.substring(0, position).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;

    return {
      valid: false,
      message: `Invalid JSON: ${errorMsg}`,
      errors: [
        {
          line,
          column,
          message: errorMsg,
        },
      ],
    };
  }
}

// XML validation
export function validateXML(text: string): ValidationResult {
  try {
    const sax = require('sax') as typeof import('sax');
    const parser = sax.parser(true, {
      trim: false,
      normalize: false,
      xmlns: true,
    });

    let depth = 0;
    let rootCount = 0;
    let parserError: Error | null = null;
    let attributes = new Set<string>();

    parser.onopentagstart = () => {
      attributes = new Set<string>();
    };

    parser.onattribute = (attribute) => {
      if (attributes.has(attribute.name)) {
        throw new Error(`Duplicate XML attribute: ${attribute.name}`);
      }
      attributes.add(attribute.name);
    };

    parser.onopentag = () => {
      if (depth === 0) {
        rootCount++;
        if (rootCount > 1) {
          throw new Error('XML must contain exactly one root element');
        }
      }
      depth++;
    };

    parser.onclosetag = () => {
      depth--;
    };

    parser.onerror = (error) => {
      parserError = error;
    };

    parser.write(text).close();

    if (parserError) {
      throw parserError;
    }

    if (rootCount !== 1 || depth !== 0) {
      throw new Error('XML must contain exactly one complete root element');
    }

    return {
      valid: true,
      message: 'Valid XML syntax',
      meta: {
        type: 'xml',
        validation: 'well-formedness',
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    return {
      valid: false,
      message: `Invalid XML: ${errorMessage}`,
      errors: [
        {
          message: errorMessage,
        },
      ],
    };
  }
}

// YAML validation
export function validateYAML(text: string): ValidationResult {
  try {
    const yaml = require('js-yaml') as typeof import('js-yaml');

    yaml.load(text, {
      json: false,
      schema: yaml.JSON_SCHEMA,
    });

    return {
      valid: true,
      message: 'Valid YAML syntax',
      meta: {
        type: 'yaml',
        validation: 'syntax',
        lines: text.split('\n').length,
      },
    };
  } catch (error) {
    const yamlError = error as Error & {
      reason?: string;
      mark?: {
        line?: number;
        column?: number;
      };
    };

    const errorMessage =
      yamlError.reason ||
      (error instanceof Error ? error.message : String(error));

    const line =
      typeof yamlError.mark?.line === 'number'
        ? yamlError.mark.line + 1
        : undefined;

    const column =
      typeof yamlError.mark?.column === 'number'
        ? yamlError.mark.column + 1
        : undefined;

    return {
      valid: false,
      message: `Invalid YAML: ${errorMessage}`,
      errors: [
        {
          message: errorMessage,
          ...(line !== undefined ? { line } : {}),
          ...(column !== undefined ? { column } : {}),
        },
      ],
    };
  }
}

// JWT decoding only. Signatures are not verified.
export function decodeJWT(token: string): ValidationResult {
  try {
    const parts = token.trim().split('.');

    if (parts.length !== 3) {
      throw new Error('JWT must have 3 parts separated by dots');
    }

    const decodePart = (part: string, label: string): unknown => {
      if (!part || !/^[A-Za-z0-9_-]+$/.test(part)) {
        throw new Error(`Invalid ${label} Base64URL encoding`);
      }

      const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = Buffer.from(normalized, 'base64');

      if (
        decoded.length === 0 ||
        decoded.toString('base64url') !== part.replace(/=+$/, '')
      ) {
        throw new Error(`Invalid ${label} Base64URL encoding`);
      }

      return JSON.parse(decoded.toString('utf-8'));
    };

    const header = decodePart(parts[0], 'header');
    const payload = decodePart(parts[1], 'payload');

    if (
      !header ||
      typeof header !== 'object' ||
      Array.isArray(header)
    ) {
      throw new Error('JWT header must be a JSON object');
    }

    if (
      !payload ||
      typeof payload !== 'object' ||
      Array.isArray(payload)
    ) {
      throw new Error('JWT payload must be a JSON object');
    }

    const claims = payload as Record<string, unknown>;
    const warnings: string[] = [];

    if (!parts[2]) {
      warnings.push('Token signature segment is empty');
    } else if (!/^[A-Za-z0-9_-]+$/.test(parts[2])) {
      warnings.push('Token signature segment is not valid Base64URL text');
    }

    let expired = false;
    let expiresAt: string | undefined;

    if (Object.prototype.hasOwnProperty.call(claims, 'exp')) {
      if (
        typeof claims.exp !== 'number' ||
        !Number.isFinite(claims.exp)
      ) {
        warnings.push('Expiration claim (exp) is not a valid number');
      } else {
        expired = claims.exp <= Math.floor(Date.now() / 1000);

        const timestamp = claims.exp * 1000;
        const date = new Date(timestamp);

        if (Number.isFinite(date.getTime())) {
          expiresAt = date.toISOString();
        } else {
          warnings.push('Expiration claim (exp) is outside the supported date range');
        }
      }
    } else {
      warnings.push('Token does not contain an expiration claim (exp)');
    }

    return {
      valid: true,
      message: expired
        ? 'JWT decoded; expiration time has passed. Signature not verified.'
        : 'JWT decoded. Signature not verified.',
      meta: {
        header,
        payload,
        expired,
        expiresAt,
        signatureVerified: false,
        warnings,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      valid: false,
      message: `Unable to decode JWT: ${message}`,
      errors: [{ message }],
    };
  }
}

// Regex tester
export function testRegex(
  pattern: string,
  flags: string,
  text: string
): ValidationResult {
  try {
    const regex = new RegExp(pattern, flags);
    const matches: Array<{ value: string; index: number; groups?: any }> =
      [];

    let match;
    const globalRegex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');

    while ((match = globalRegex.exec(text)) !== null) {
      matches.push({
        value: match[0],
        index: match.index,
        groups: match.slice(1),
      });

      // Advance past zero-length matches to prevent an infinite loop.
      if (match[0].length === 0) {
        globalRegex.lastIndex++;
      }
    }

    return {
      valid: true,
      message: `Found ${matches.length} match(es)`,
      meta: {
        matches,
        matchCount: matches.length,
        pattern,
        flags,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `Invalid regex: ${error instanceof Error ? error.message : String(error)}`,
      errors: [
        {
          message:
            error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

// HTML validation (basic)
export function validateHTML(text: string): ValidationResult {
  try {
    const trimmed = text.trim();

    // Self-closing tags that don't need closing tags
    const selfClosing = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr',
    ]);

    const tagStack: string[] = [];
    const errors: Array<{ message: string }> = [];

    // Combined regex to find both opening and closing tags in order
    const tagRegex = /<\/?([a-z][a-z0-9-]*)[^>]*>/gi;
    let match;

    while ((match = tagRegex.exec(trimmed)) !== null) {
      const fullTag = match[0];
      const tagName = match[1].toLowerCase();
      const isClosing = fullTag.startsWith('</');
      const isSelfClosing = fullTag.endsWith('/>');

      if (isClosing) {
        // Closing tag
        if (tagStack.length === 0) {
          errors.push({
            message: `Closing tag </${tagName}> without opening tag`,
          });
        } else if (tagStack[tagStack.length - 1] === tagName) {
          // Perfect match - pop it
          tagStack.pop();
        } else {
          // Tag is out of order - find if it exists
          const index = tagStack.lastIndexOf(tagName);
          if (index >= 0) {
            // Found it but not at top - there are unclosed tags before it
            // Just remove it from the stack, errors will be reported at the end
            tagStack.splice(index, 1);
          } else {
            // Tag was never opened
            errors.push({
              message: `Closing tag </${tagName}> has no matching opening tag`,
            });
          }
        }
      } else if (!isSelfClosing && !selfClosing.has(tagName)) {
        // Opening tag (not self-closing)
        tagStack.push(tagName);
      }
    }

    // Check for unclosed tags only at the end
    if (tagStack.length > 0) {
      errors.push({
        message: `Unclosed tag(s): ${tagStack.map((t) => `<${t}>`).join(', ')}`,
      });
    }

    if (errors.length > 0) {
      return {
        valid: false,
        message: `Invalid HTML: ${errors.map((e) => e.message).join('; ')}`,
        errors,
      };
    }

    return {
      valid: true,
      message: 'Valid HTML structure',
      meta: {
        type: 'html',
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `HTML validation error: ${error instanceof Error ? error.message : String(error)}`,
      errors: [
        {
          message:
            error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

// Basic Markdown diagnostics, not strict syntax validation.
export function validateMarkdown(text: string): ValidationResult {
  const warnings: string[] = [];
  const lines = text.split(/\r?\n/);

  let openFence:
    | { character: string; length: number; line: number }
    | null = null;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (openFence === null) {
      const opening = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);

      if (!opening) continue;

      const marker = opening[1];
      const info = opening[2];

      // Backtick fences cannot contain backticks in the info string.
      if (marker[0] === '`' && info.includes('`')) continue;

      openFence = {
        character: marker[0],
        length: marker.length,
        line: index + 1,
      };
    } else {
      const closing = line.match(/^ {0,3}(`+|~+)[ \t]*$/);

      if (
        closing &&
        closing[1][0] === openFence.character &&
        closing[1].length >= openFence.length
      ) {
        openFence = null;
      }
    }
  }

  if (openFence !== null) {
    const fence = openFence as {
      character: string;
      length: number;
      line: number;
    };

    warnings.push(
      `Possible unclosed code fence starting at line ${fence.line}`
    );
  }

  // These are simple link diagnostics, not full Markdown link parsing.
  const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    if (!match[1]) {
      warnings.push(`Empty link text at position ${match.index}`);
    }
    if (!match[2]) {
      warnings.push(`Empty link URL at position ${match.index}`);
    }
  }

  return {
    valid: true,
    message:
      warnings.length > 0
        ? `Basic Markdown check completed with ${warnings.length} warning(s)`
        : 'Basic Markdown check completed',
    meta: {
      type: 'markdown',
      validation: 'basic-diagnostics',
      warnings,
    },
  };
}

// Text diff comparison
// Sequence-aware line comparison using longest common subsequence.
export function compareText(
  text1: string,
  text2: string
): ValidationResult {
  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');

  if (text1 === text2) {
    return {
      valid: true,
      message: 'Texts are identical',
      meta: {
        identical: true,
        changes: 0,
        lines1: lines1.length,
        lines2: lines2.length,
        added: 0,
        removed: 0,
        modified: 0,
        diff: { added: [], removed: [], modified: [] },
      },
    };
  }

  const n = lines1.length;
  const m = lines2.length;

  // Bound quadratic work for unusually large documents.
  if (n * m > 1_000_000) {
    return {
      valid: false,
      message: 'Comparison exceeds the supported line complexity limit',
      errors: [{
        message: 'Try comparing smaller sections of the documents.',
      }],
    };
  }

  const lcs: Uint32Array[] = Array.from(
    { length: n + 1 },
    () => new Uint32Array(m + 1)
  );

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = lines1[i] === lines2[j]
        ? lcs[i + 1][j + 1] + 1
        : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const added: number[] = [];
  const removed: number[] = [];

  let i = 0;
  let j = 0;

  while (i < n || j < m) {
    if (i < n && j < m && lines1[i] === lines2[j]) {
      i++;
      j++;
    } else if (j < m && (i === n || lcs[i][j + 1] >= lcs[i + 1][j])) {
      added.push(j);
      j++;
    } else {
      removed.push(i);
      i++;
    }
  }

  const changes = added.length + removed.length;

  return {
    valid: false,
    message: `${changes} difference(s) found`,
    meta: {
      identical: false,
      changes,
      lines1: n,
      lines2: m,
      added: added.length,
      removed: removed.length,
      modified: 0,
      diff: {
        added,
        removed,
        modified: [],
      },
    },
  };
}
// Validate standard five-field cron expressions.
// Field order: minute hour day-of-month month day-of-week.
// This tool does not accept seconds, year fields, or Quartz syntax.
export function validateCronExpression(expression: string): ValidationResult {
  try {
    const trimmed = expression.trim();
    const fields = trimmed.split(/\s+/);

    if (fields.length !== 5) {
      return {
        valid: false,
        message: 'Invalid cron format. Expected exactly 5 fields: minute hour day-of-month month day-of-week',
        errors: [{ message: `Found ${fields.length} fields, expected 5` }],
      };
    }

    cronParser.parseExpression(trimmed);

    return {
      valid: true,
      message: 'Valid five-field cron expression',
      meta: {
        format: 'minute hour day-of-month month day-of-week',
        parts: 5,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      valid: false,
      message: `Invalid cron expression: ${message}`,
      errors: [{ message }],
    };
  }
}

// JSON Schema Draft-07 validation using AJV.
export function validateJSONSchema(schemaJson: string, dataJson: string): ValidationResult {
  try {
    const schema = JSON.parse(schemaJson);
    const data = JSON.parse(dataJson);

    const ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateSchema: true,
    });

    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = (validate.errors || []).map((error) => ({
        message: `${error.instancePath || '/'}: ${error.message || 'Validation failed'}`,
      }));

      return {
        valid: false,
        message: `Schema validation failed: ${errors.length} error(s)`,
        errors,
      };
    }

    return {
      valid: true,
      message: 'Valid JSON against schema',
      meta: {
        dataSize: JSON.stringify(data).length,
        schemaSize: JSON.stringify(schema).length,
        schemaDraft: 'draft-07',
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      valid: false,
      message: `JSON Schema validation error: ${message}`,
      errors: [{ message }],
    };
  }
}

function isCorrectType(value: any, type: string): boolean {
  if (type === 'null') return value === null;
  if (type === 'boolean') return typeof value === 'boolean';
  if (type === 'object') return typeof value === 'object' && !Array.isArray(value);
  if (type === 'array') return Array.isArray(value);
  if (type === 'number' || type === 'integer') return typeof value === 'number';
  if (type === 'string') return typeof value === 'string';
  return false;
}

