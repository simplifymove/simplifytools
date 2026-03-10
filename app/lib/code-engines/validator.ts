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
    // Check basic XML structure
    const trimmed = text.trim();

    if (!trimmed.startsWith('<')) {
      throw new Error('XML must start with <');
    }

    if (!trimmed.endsWith('>')) {
      throw new Error('XML must end with >');
    }

    // Check balanced tags
    const tagRegex = /<\/?(\w+)[^>]*>/g;
    const tags: string[] = [];
    let match;

    while ((match = tagRegex.exec(trimmed)) !== null) {
      const tagName = match[1];
      if (match[0].startsWith('</')) {
        if (tags[tags.length - 1] === tagName) {
          tags.pop();
        } else {
          throw new Error(`Mismatched closing tag: </${tagName}>`);
        }
      } else if (!match[0].endsWith('/>')) {
        tags.push(tagName);
      }
    }

    if (tags.length > 0) {
      throw new Error(`Unclosed tag: <${tags[0]}>`);
    }

    return {
      valid: true,
      message: 'Valid XML',
      meta: {
        type: 'xml',
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `Invalid XML: ${error instanceof Error ? error.message : String(error)}`,
      errors: [
        {
          message:
            error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

// YAML validation
export function validateYAML(text: string): ValidationResult {
  try {
    if (!text.trim()) {
      return {
        valid: true,
        message: 'Valid YAML (empty)',
        meta: { type: 'yaml' },
      };
    }

    // Basic YAML validation
    const lines = text.split('\n');
    let indentLevel = 0;
    const errors: Array<{ line: number; message: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || line.trim().startsWith('#')) continue;

      const match = line.match(/^(\s*)/);
      const spaces = match ? match[1].length : 0;

      // Check if indentation is valid (should be multiples of 2)
      if (spaces % 2 !== 0) {
        errors.push({
          line: i + 1,
          message: 'Indentation must be a multiple of 2 spaces',
        });
      }

      // Check for invalid YAML syntax
      if (line.includes(':')) {
        const parts = line.split(':');
        if (
          parts.length > 2 &&
          parts[0].trim() &&
          !parts[1]?.includes('"')
        ) {
          // Multiple colons might indicate a URL or time
        }
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        message: 'Invalid YAML',
        errors: errors.map((e) => ({
          line: e.line,
          message: e.message,
        })),
      };
    }

    return {
      valid: true,
      message: 'Valid YAML',
      meta: {
        type: 'yaml',
        lines: lines.length,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `Invalid YAML: ${error instanceof Error ? error.message : String(error)}`,
      errors: [
        {
          message:
            error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

// JWT decoding (without verification)
export function decodeJWT(token: string): ValidationResult {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      throw new Error('JWT must have 3 parts separated by dots');
    }

    // Decode header
    const header = JSON.parse(
      Buffer.from(parts[0], 'base64').toString('utf-8')
    );

    // Decode payload
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );

    // Check expiry if present
    let expired = false;
    if (payload.exp) {
      expired = payload.exp * 1000 < Date.now();
    }

    return {
      valid: !expired,
      message: expired ? 'JWT has expired' : 'Valid JWT',
      meta: {
        header,
        payload,
        expired,
        expiresAt: payload.exp
          ? new Date(payload.exp * 1000).toISOString()
          : undefined,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `Invalid JWT: ${error instanceof Error ? error.message : String(error)}`,
      errors: [
        {
          message:
            error instanceof Error ? error.message : String(error),
        },
      ],
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

// Markdown validation (basic)
export function validateMarkdown(text: string): ValidationResult {
  try {
    if (!text.trim()) {
      return {
        valid: true,
        message: 'Valid Markdown (empty)',
        meta: { type: 'markdown' },
      };
    }

    // Check for balanced backticks
    const codeBlocks = text.match(/```/g) || [];
    if (codeBlocks.length % 2 !== 0) {
      return {
        valid: false,
        message: 'Unbalanced code blocks (```) - must come in pairs',
        errors: [
          {
            message: 'Unbalanced triple backticks',
          },
        ],
      };
    }

    // Check for balanced brackets
    const linkRegex = /\[([^\]]*)\]\(([^)]*)\)/g;
    let match;
    const warnings: string[] = [];

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
          ? `Valid Markdown with ${warnings.length} warning(s)`
          : 'Valid Markdown',
      meta: {
        type: 'markdown',
        warnings,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `Markdown validation error: ${error instanceof Error ? error.message : String(error)}`,
      errors: [
        {
          message:
            error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

// Text diff comparison
export function compareText(
  text1: string,
  text2: string
): ValidationResult {
  if (text1 === text2) {
    return {
      valid: true,
      message: 'Texts are identical',
      meta: {
        identical: true,
        changes: 0,
      },
    };
  }

  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');

  const changes = {
    added: [] as number[],
    removed: [] as number[],
    modified: [] as { line1: number; line2: number }[],
  };

  // Simple line-based diff
  const maxLines = Math.max(lines1.length, lines2.length);
  for (let i = 0; i < maxLines; i++) {
    if (i >= lines1.length) {
      changes.added.push(i);
    } else if (i >= lines2.length) {
      changes.removed.push(i);
    } else if (lines1[i] !== lines2[i]) {
      changes.modified.push({ line1: i, line2: i });
    }
  }

  const totalChanges =
    changes.added.length + changes.removed.length + changes.modified.length;

  return {
    valid: text1 === text2,
    message: `${totalChanges} difference(s) found`,
    meta: {
      identical: text1 === text2,
      changes: totalChanges,
      lines1: lines1.length,
      lines2: lines2.length,
      added: changes.added.length,
      removed: changes.removed.length,
      modified: changes.modified.length,
      diff: changes,
    },
  };
}

// Cron expression validator
export function validateCronExpression(expression: string): ValidationResult {
  try {
    const trimmed = expression.trim();
    const parts = trimmed.split(/\s+/);

    // Standard cron: minute hour day month dayOfWeek [year]
    if (parts.length < 5 || parts.length > 6) {
      return {
        valid: false,
        message: 'Invalid cron format. Should be: minute hour day month dayOfWeek [year]',
        errors: [
          {
            message: `Found ${parts.length} parts, expected 5 or 6`,
          },
        ],
      };
    }

    const ranges = [
      { name: 'minute', min: 0, max: 59, index: 0 },
      { name: 'hour', min: 0, max: 23, index: 1 },
      { name: 'day', min: 1, max: 31, index: 2 },
      { name: 'month', min: 1, max: 12, index: 3 },
      { name: 'dayOfWeek', min: 0, max: 6, index: 4 },
      { name: 'year', min: 1970, max: 2099, index: 5 },
    ];

    const errors: Array<{ message: string }> = [];

    for (let i = 0; i < Math.min(parts.length, 6); i++) {
      const part = parts[i];
      const range = ranges[i];

      if (part === '*' || part === '?' || part === '-' || part === ',') continue;

      if (!isValidCronPart(part, range.min, range.max)) {
        errors.push({
          message: `Invalid ${range.name}: "${part}" (range: ${range.min}-${range.max})`,
        });
      }
    }

    if (errors.length > 0) {
      return {
        valid: false,
        message: `Invalid cron expression: ${errors.map((e) => e.message).join('; ')}`,
        errors,
      };
    }

    return {
      valid: true,
      message: 'Valid cron expression',
      meta: {
        format: '(minute hour day month dayOfWeek [year])',
        parts: parts.length,
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `Cron validation error: ${error instanceof Error ? error.message : String(error)}`,
      errors: [
        {
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

function isValidCronPart(part: string, min: number, max: number): boolean {
  if (part === '*' || part === '?') return true;
  if (part.includes(',')) {
    return part.split(',').every((p) => isValidCronPart(p, min, max));
  }
  if (part.includes('-')) {
    const [start, end] = part.split('-');
    return !isNaN(Number(start)) && !isNaN(Number(end)) && Number(start) >= min && Number(end) <= max;
  }
  if (part.includes('/')) {
    return !isNaN(Number(part.split('/')[0])) && !isNaN(Number(part.split('/')[1]));
  }
  const num = Number(part);
  return !isNaN(num) && num >= min && num <= max;
}

// JSON Schema validator
export function validateJSONSchema(schemaJson: string, dataJson: string): ValidationResult {
  try {
    const schema = JSON.parse(schemaJson);
    const data = JSON.parse(dataJson);

    const errors: Array<{ message: string }> = [];

    // Basic schema validation
    if (schema.type && !isCorrectType(data, schema.type)) {
      errors.push({
        message: `Type mismatch: expected ${schema.type}, got ${typeof data}`,
      });
    }

    if (schema.required && typeof data === 'object' && !Array.isArray(data)) {
      for (const required of schema.required) {
        if (!(required in data)) {
          errors.push({
            message: `Missing required property: ${required}`,
          });
        }
      }
    }

    if (schema.properties && typeof data === 'object' && !Array.isArray(data)) {
      for (const [key, value] of Object.entries(data)) {
        if (key in schema.properties) {
          const propSchema = schema.properties[key] as any;
          if (propSchema.type && !isCorrectType(value, propSchema.type)) {
            errors.push({
              message: `Property "${key}": expected ${propSchema.type}, got ${typeof value}`,
            });
          }
        }
      }
    }

    if (errors.length > 0) {
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
      },
    };
  } catch (error) {
    return {
      valid: false,
      message: `JSON Schema validation error: ${error instanceof Error ? error.message : String(error)}`,
      errors: [
        {
          message: error instanceof Error ? error.message : String(error),
        },
      ],
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
