// Formatter Engine - handles code formatting, beautifying, and minifying
// Note: We use dynamic imports for Prettier to avoid build issues

export interface FormatterOptions {
  language?: string;
  indent?: number;
}

export interface FormatterResult {
  result: string;
  meta?: {
    originalSize: number;
    newSize: number;
    compression?: number;
  };
}

// Minify code based on language
export async function minifyCode(
  code: string,
  language: string,
  options: FormatterOptions
): Promise<FormatterResult> {
  try {
    switch (language.toLowerCase()) {
      case 'javascript':
        return await minifyJavaScript(code);
      case 'json':
        return minifyJSON(code);
      case 'html':
        return await minifyHTML(code);
      case 'css':
        return await minifyCSS(code);
      case 'xml':
        return minifyXML(code);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  } catch (error) {
    throw new Error(
      `Minification error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Beautify code based on language
export async function beautifyCode(
  code: string,
  language: string,
  options: FormatterOptions
): Promise<FormatterResult> {
  const indent = options.indent || 2;

  try {
    switch (language.toLowerCase()) {
      case 'javascript':
        return beautifyJavaScript(code, indent);
      case 'json':
        return beautifyJSON(code, indent);
      case 'html':
        return beautifyHTML(code, indent);
      case 'css':
        return beautifyCSS(code, indent);
      case 'xml':
        return beautifyXML(code, indent);
      case 'sql':
        return beautifySQL(code, indent);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  } catch (error) {
    throw new Error(
      `Beautification error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// JavaScript minification using Terser (lightweight version using regex)
async function minifyJavaScript(code: string): Promise<FormatterResult> {
  try {
    // Dynamic import of Terser
    const terser = await import('terser');
    const result = await terser.minify(code, {
      compress: true,
      mangle: true,
    });

    if (!result.code) {
      throw new Error('Minification produced no output');
    }

    return {
      result: result.code,
      meta: {
        originalSize: code.length,
        newSize: result.code.length,
        compression: Math.round(
          ((code.length - result.code.length) / code.length) * 100
        ),
      },
    };
  } catch (error) {
    throw error;
  }
}

// JavaScript beautification
function beautifyJavaScript(
  code: string,
  indent: number
): FormatterResult {
  try {
    // Basic JavaScript beautification using indentation and newlines
    let formatted = code
      .replace(/;\s*/g, ';\n')
      .replace(/{\s*/g, ' {\n')
      .replace(/}\s*/g, '\n}\n')
      .replace(/,\s*/g, ',\n')
      .trim();

    // Apply indentation
    const indentStr = ' '.repeat(indent);
    let indentLevel = 0;
    const result = formatted
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        const indented = indentStr.repeat(indentLevel) + trimmed;
        if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
          indentLevel++;
        }
        return indented;
      })
      .join('\n')
      .replace(/\n+/g, '\n');

    return {
      result,
      meta: {
        originalSize: code.length,
        newSize: result.length,
      },
    };
  } catch (error) {
    throw error;
  }
}

// JSON minification
function minifyJSON(code: string): FormatterResult {
  try {
    const parsed = JSON.parse(code);
    const minified = JSON.stringify(parsed);

    return {
      result: minified,
      meta: {
        originalSize: code.length,
        newSize: minified.length,
        compression: Math.round(
          ((code.length - minified.length) / code.length) * 100
        ),
      },
    };
  } catch (error) {
    throw error;
  }
}

// JSON beautification
function beautifyJSON(code: string, indent: number): FormatterResult {
  try {
    const parsed = JSON.parse(code);
    const formatted = JSON.stringify(parsed, null, indent);

    return {
      result: formatted,
      meta: {
        originalSize: code.length,
        newSize: formatted.length,
      },
    };
  } catch (error) {
    throw error;
  }
}

// HTML minification
async function minifyHTML(code: string): Promise<FormatterResult> {
  try {
    // Dynamic import of html-minifier-terser
    const minifier = await import('html-minifier-terser');
    const minified = await minifier.minify(code, {
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyJS: true,
      minifyCSS: true,
      collapseWhitespace: true,
    });

    return {
      result: minified,
      meta: {
        originalSize: code.length,
        newSize: minified.length,
        compression: Math.round(
          ((code.length - minified.length) / code.length) * 100
        ),
      },
    };
  } catch (error) {
    throw error;
  }
}

// HTML beautification
function beautifyHTML(
  code: string,
  indent: number
): FormatterResult {
  try {
    const indentStr = ' '.repeat(indent);
    let indentLevel = 0;
    let formatted = '';

    // Simple HTML tag regex
    const tagRegex = /<[^>]+>|[^<]+/g;
    let match;

    while ((match = tagRegex.exec(code)) !== null) {
      const tag = match[0].trim();
      if (!tag) continue;

      if (tag.startsWith('</')) {
        indentLevel = Math.max(0, indentLevel - 1);
        formatted += indentStr.repeat(indentLevel) + tag + '\n';
      } else if (tag.startsWith('<') && tag.endsWith('/>')) {
        formatted += indentStr.repeat(indentLevel) + tag + '\n';
      } else if (tag.startsWith('<')) {
        formatted += indentStr.repeat(indentLevel) + tag + '\n';
        if (!tag.includes('</')) {
          indentLevel++;
        }
      } else {
        const text = tag.trim();
        if (text) {
          formatted += indentStr.repeat(indentLevel) + text + '\n';
        }
      }
    }

    return {
      result: formatted.trim(),
      meta: {
        originalSize: code.length,
        newSize: formatted.length,
      },
    };
  } catch (error) {
    throw error;
  }
}

// CSS minification
async function minifyCSS(code: string): Promise<FormatterResult> {
  try {
    const cleanCss = await import('clean-css');
    const output = new cleanCss.default().minify(code);

    if (output.errors.length > 0) {
      throw new Error(output.errors.join(', '));
    }

    return {
      result: output.styles,
      meta: {
        originalSize: code.length,
        newSize: output.styles.length,
        compression: Math.round(
          ((code.length - output.styles.length) / code.length) * 100
        ),
      },
    };
  } catch (error) {
    throw error;
  }
}

// CSS beautification
function beautifyCSS(
  code: string,
  indent: number
): FormatterResult {
  try {
    const indentStr = ' '.repeat(indent);
    let formatted = code
      .replace(/{\s*/g, ' {\n')
      .replace(/}\s*/g, '\n}\n')
      .replace(/;\s*/g, ';\n')
      .replace(/,\s*/g, ',\n')
      .trim();

    let indentLevel = 0;
    const result = formatted
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('}')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }
        const indented = indentStr.repeat(indentLevel) + trimmed;
        if (trimmed.endsWith('{')) {
          indentLevel++;
        }
        return indented;
      })
      .filter((line) => line.trim())
      .join('\n');

    return {
      result: result,
      meta: {
        originalSize: code.length,
        newSize: result.length,
      },
    };
  } catch (error) {
    throw error;
  }
}

// XML minification - simple regex-based approach
function minifyXML(code: string): FormatterResult {
  try {
    const minified = code
      .replace(/\n/g, '')
      .replace(/\t/g, '')
      .replace(/>\s+</g, '><')
      .trim();

    return {
      result: minified,
      meta: {
        originalSize: code.length,
        newSize: minified.length,
        compression: Math.round(
          ((code.length - minified.length) / code.length) * 100
        ),
      },
    };
  } catch (error) {
    throw error;
  }
}

// XML beautification
function beautifyXML(code: string, indent: number): FormatterResult {
  try {
    let formatted = '';
    let level = 0;
    const indentStr = ' '.repeat(indent);

    // Simple XML parser
    const regex = /(<[^>]+>)/g;
    const parts = code.split(regex).filter((part) => part.trim());

    for (const part of parts) {
      if (part.startsWith('<?')) {
        formatted += part + '\n';
      } else if (part.startsWith('</')) {
        level--;
        formatted += indentStr.repeat(Math.max(0, level)) + part + '\n';
      } else if (part.startsWith('<') && part.endsWith('/>')) {
        formatted += indentStr.repeat(level) + part + '\n';
      } else if (part.startsWith('<')) {
        formatted += indentStr.repeat(level) + part + '\n';
        if (!part.endsWith('/>') && !part.includes('</')) {
          level++;
        }
      } else {
        const text = part.trim();
        if (text) {
          formatted += indentStr.repeat(level) + text + '\n';
        }
      }
    }

    return {
      result: formatted.trimEnd(),
      meta: {
        originalSize: code.length,
        newSize: formatted.length,
      },
    };
  } catch (error) {
    throw error;
  }
}

// SQL beautification - simple line formatting
function beautifySQL(code: string, indent: number): FormatterResult {
  try {
    const keywords =
      /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|ORDER BY|GROUP BY|HAVING|LIMIT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|DATABASE|INDEX)\b/gi;

    let formatted = code
      .replace(keywords, (match) => '\n' + match.toUpperCase())
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line)
      .join('\n');

    return {
      result: formatted,
      meta: {
        originalSize: code.length,
        newSize: formatted.length,
      },
    };
  } catch (error) {
    throw error;
  }
}
