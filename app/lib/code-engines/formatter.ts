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
        return await beautifyWithPrettier(code, 'babel', indent);
      case 'json':
        return beautifyJSON(code, indent);
      case 'html':
        return await beautifyWithPrettier(code, 'html', indent);
      case 'css':
        return await beautifyWithPrettier(code, 'css', indent);
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

// Syntax-aware formatting for JavaScript, HTML, and CSS.
async function beautifyWithPrettier(
  code: string,
  parser: 'babel' | 'html' | 'css',
  indent: number
): Promise<FormatterResult> {
  const prettier = await import('prettier');
  const formatted = await prettier.format(code, {
    parser,
    tabWidth: Math.max(1, Math.min(16, Math.trunc(indent))),
    useTabs: false,
  });

  return {
    result: formatted,
    meta: {
      originalSize: code.length,
      newSize: formatted.length,
    },
  };
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
    const formatted = code
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
    const formatted = code
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

// Conservative XML minification: preserve XML data and quoted values.
function minifyXML(code: string): FormatterResult {
  const sax = require('sax') as typeof import('sax');

  const parser = sax.parser(true, {
    trim: false,
    normalize: false,
  });

  // Reject malformed XML before transforming anything.
  parser.write(code).close();

  let result = '';
  let index = 0;

  while (index < code.length) {
    if (code[index] !== '<') {
      result += code[index++];
      continue;
    }

    // Preserve comments, CDATA, declarations and processing instructions.
    if (
      code.startsWith('<!--', index) ||
      code.startsWith('<![CDATA[', index) ||
      code.startsWith('<!', index) ||
      code.startsWith('<?', index)
    ) {
      const prefix = code.startsWith('<!--', index)
        ? '-->'
        : code.startsWith('<![CDATA[', index)
          ? ']]>'
          : code.startsWith('<?', index)
            ? '?>'
            : '>';

      const end = code.indexOf(prefix, index);
      if (end < 0) {
        throw new Error('Invalid XML declaration');
      }

      result += code.slice(index, end + prefix.length);
      index = end + prefix.length;
      continue;
    }

    // Locate the tag end without treating > inside quotes as a delimiter.
    let end = index + 1;
    let quote: string | null = null;

    for (; end < code.length; end++) {
      const char = code[end];

      if (quote) {
        if (char === quote) quote = null;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        break;
      }
    }

    if (end >= code.length) {
      throw new Error('Unterminated XML tag');
    }

    const tag = code.slice(index, end + 1);

    let normalized = '';
    let pendingSpace = false;
    quote = null;

    for (let i = 0; i < tag.length; i++) {
      const char = tag[i];

      if (quote) {
        normalized += char;
        if (char === quote) quote = null;
        continue;
      }

      if (char === '"' || char === "'") {
        if (pendingSpace) {
          normalized += ' ';
          pendingSpace = false;
        }
        normalized += char;
        quote = char;
        continue;
      }

      if (/\s/.test(char)) {
        pendingSpace = true;
        continue;
      }

      if (pendingSpace) {
        // No whitespace is needed before a tag terminator.
        if (char !== '>' && char !== '/') {
          normalized += ' ';
        }
        pendingSpace = false;
      }

      normalized += char;
    }

    result += normalized;
    index = end + 1;
  }

  return {
    result,
    meta: {
      originalSize: code.length,
      newSize: result.length,
      compression: code.length
        ? Math.round((1 - result.length / code.length) * 100)
        : 0,
    },
  };
}

// Conservative XML formatting: avoid changing meaningful XML content.
function beautifyXML(code: string, indent: number): FormatterResult {
  const sax = require('sax') as typeof import('sax');

  const parser = sax.parser(true, {
    trim: false,
    normalize: false,
  });

  let containsText = false;
  let containsCdata = false;
  let containsSpecialMarkup = false;

  parser.ontext = (text: string) => {
    if (text.length > 0) containsText = true;
  };

  parser.oncdata = () => {
    containsCdata = true;
  };

  parser.oncomment = () => {
    containsSpecialMarkup = true;
  };

  parser.onprocessinginstruction = () => {
    containsSpecialMarkup = true;
  };

  parser.ondoctype = () => {
    containsSpecialMarkup = true;
  };

  parser.write(code).close();

  // Preserve documents where formatting could alter meaningful data.
  if (
    containsText ||
    containsCdata ||
    containsSpecialMarkup ||
    code.includes('<?') ||
    code.includes('<!')
  ) {
    return {
      result: code,
      meta: {
        originalSize: code.length,
        newSize: code.length,
      },
    };
  }

  const indentStr = ' '.repeat(
    Math.max(0, Math.min(16, Number(indent) || 2))
  );

  let level = 0;

  const formatted = code
    .replace(/>\s*</g, '><')
    .replace(/></g, '>\n<')
    .split('\n')
    .map((line) => {
      if (line.startsWith('</')) {
        level = Math.max(0, level - 1);
      }

      const output = indentStr.repeat(level) + line;

      if (
        line.startsWith('<') &&
        !line.startsWith('</') &&
        !line.endsWith('/>')
      ) {
        level++;
      }

      return output;
    })
    .join('\n');

  return {
    result: formatted,
    meta: {
      originalSize: code.length,
      newSize: formatted.length,
    },
  };
}

// SQL beautification - simple line formatting
function beautifySQL(code: string, indent: number): FormatterResult {
  const { format } = require('sql-formatter') as typeof import('sql-formatter');

  const formatted = format(code, {
    language: 'sql',
    tabWidth: Math.max(1, Math.min(16, Math.trunc(Number(indent) || 2))),
    keywordCase: 'upper',
  });

  return {
    result: formatted,
    meta: {
      originalSize: code.length,
      newSize: formatted.length,
    },
  };
}

