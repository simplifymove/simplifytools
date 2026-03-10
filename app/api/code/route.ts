import { NextRequest, NextResponse } from 'next/server';
import { getToolBySlug } from '@/app/lib/code-tools';
import * as FormatterEngine from '@/app/lib/code-engines/formatter';
import * as ConverterEngine from '@/app/lib/code-engines/converter';
import * as ValidatorEngine from '@/app/lib/code-engines/validator';
import * as GeneratorEngine from '@/app/lib/code-engines/generator';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface CodeToolRequest {
  tool: string;
  input?: string;
  options?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: CodeToolRequest = await request.json();
    const { tool, input, options } = body;

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      );
    }

    const toolConfig = getToolBySlug(tool);

    if (!toolConfig) {
      return NextResponse.json(
        { error: `Tool not found: ${tool}` },
        { status: 404 }
      );
    }

    let result: any;

    try {
      // Route to the correct engine
      switch (toolConfig.engine) {
        case 'formatter':
          result = await handleFormatterEngine(tool, input, options);
          break;

        case 'converter':
          result = handleConverterEngine(tool, input, options);
          break;

        case 'validator':
          result = handleValidatorEngine(tool, input, options);
          break;

        case 'generator':
          result = handleGeneratorEngine(tool, input, options);
          break;

        default:
          return NextResponse.json(
            { error: `Unknown engine: ${toolConfig.engine}` },
            { status: 400 }
          );
      }

      return NextResponse.json({
        ok: true,
        tool,
        result,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return NextResponse.json(
        {
          ok: false,
          error: errorMessage,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Invalid request format',
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }
}

// Handler for Formatter Engine
async function handleFormatterEngine(
  toolId: string,
  input: string | undefined,
  options: Record<string, any> | undefined
): Promise<any> {
  if (!input) {
    throw new Error('Input is required for formatter tools');
  }

  const language = options?.language || 'javascript';

  switch (toolId) {
    case 'code-minifier':
      return await FormatterEngine.minifyCode(input, language, options || {});

    case 'code-beautifier':
      return await FormatterEngine.beautifyCode(
        input,
        language,
        options || {}
      );

    case 'json-formatter':
      return await FormatterEngine.beautifyCode(input, 'json', options || {});

    case 'html-formatter':
      return await FormatterEngine.beautifyCode(input, 'html', options || {});

    case 'html-minifier':
      return await FormatterEngine.minifyCode(input, 'html', options || {});

    case 'css-formatter':
      return await FormatterEngine.beautifyCode(input, 'css', options || {});

    case 'css-minifier':
      return await FormatterEngine.minifyCode(input, 'css', options || {});

    case 'xml-formatter':
      return await FormatterEngine.beautifyCode(input, 'xml', options || {});

    case 'xml-minifier':
      return await FormatterEngine.minifyCode(input, 'xml', options || {});

    case 'sql-formatter':
      return await FormatterEngine.beautifyCode(input, 'sql', options || {});

    default:
      throw new Error(`Unknown formatter tool: ${toolId}`);
  }
}

// Handler for Converter Engine
function handleConverterEngine(
  toolId: string,
  input: string | undefined,
  options: Record<string, any> | undefined
): any {
  if (!input) {
    throw new Error('Input is required for converter tools');
  }

  switch (toolId) {
    case 'base64-encode':
      return ConverterEngine.encodeBase64(input);

    case 'base64-decode':
      return ConverterEngine.decodeBase64(input);

    case 'url-encode':
      return ConverterEngine.encodeURL(input);

    case 'url-decode':
      return ConverterEngine.decodeURL(input);

    case 'html-encode':
      return ConverterEngine.encodeHTML(input);

    case 'html-decode':
      return ConverterEngine.decodeHTML(input);

    case 'case-converter':
      return ConverterEngine.convertCase(input, options?.caseType || 'lowercase');

    case 'json-to-csv':
      return ConverterEngine.jsonToCSV(input);

    case 'csv-to-json':
      return ConverterEngine.csvToJSON(input);

    case 'json-to-xml':
      return ConverterEngine.jsonToXML(input);

    case 'xml-to-json':
      return ConverterEngine.xmlToJSON(input);

    case 'json-to-yaml':
      return ConverterEngine.jsonToYAML(input);

    case 'yaml-to-json':
      return ConverterEngine.yamlToJSON(input);

    case 'slug-generator':
      return ConverterEngine.generateSlug(input);

    case 'base32-encode':
      return ConverterEngine.encodeBase32(input);

    case 'base32-decode':
      return ConverterEngine.decodeBase32(input);

    case 'markdown-to-html':
      return ConverterEngine.markdownToHTML(input);

    case 'escape-unescape':
      return ConverterEngine.escapeSpecialChars(
        input,
        options?.type || 'javascript',
        options?.mode || 'escape'
      );

    case 'number-base-converter':
      return ConverterEngine.convertNumberBase(
        input,
        options?.fromBase || 'decimal',
        options?.toBase || 'hex'
      );

    case 'temperature-converter':
      return ConverterEngine.convertTemperature(
        input,
        options?.fromUnit || 'celsius',
        options?.toUnit || 'fahrenheit'
      );

    case 'unix-timestamp-converter':
      return ConverterEngine.convertUnixTimestamp(
        input,
        options?.direction || 'toDate'
      );

    default:
      throw new Error(`Unknown converter tool: ${toolId}`);
  }
}

// Handler for Validator Engine
function handleValidatorEngine(
  toolId: string,
  input: string | undefined,
  options: Record<string, any> | undefined
): any {
  if (!input) {
    throw new Error('Input is required for validator tools');
  }

  switch (toolId) {
    case 'json-validator':
      return ValidatorEngine.validateJSON(input);

    case 'xml-validator':
      return ValidatorEngine.validateXML(input);

    case 'yaml-validator':
      return ValidatorEngine.validateYAML(input);

    case 'html-validator':
      return ValidatorEngine.validateHTML(input);

    case 'markdown-validator':
      return ValidatorEngine.validateMarkdown(input);

    case 'jwt-decoder':
      return ValidatorEngine.decodeJWT(input);

    case 'regex-tester':
      const regexPattern = input;
      const regexText = options?.text || '';
      const regexFlags = options?.flags || 'g';
      return ValidatorEngine.testRegex(regexPattern, regexFlags, regexText);

    case 'text-diff':
      const text1 = input;
      const text2 = options?.text2 || '';
      return ValidatorEngine.compareText(text1, text2);

    case 'cron-expression-generator':
      return ValidatorEngine.validateCronExpression(input);

    case 'json-schema-validator':
      const schemaJson = input;
      const dataJson = options?.data || '{}';
      return ValidatorEngine.validateJSONSchema(schemaJson, dataJson);

    default:
      throw new Error(`Unknown validator tool: ${toolId}`);
  }
}

// Handler for Generator Engine
function handleGeneratorEngine(
  toolId: string,
  input: string | undefined,
  options: Record<string, any> | undefined
): any {
  switch (toolId) {
    case 'uuid-generator':
      return GeneratorEngine.generateUUIDs(
        options?.count || 1,
        options?.uppercase || false
      );

    case 'hash-generator':
      if (!input) {
        throw new Error('Input text is required for hash generation');
      }
      return GeneratorEngine.generateHash(
        input,
        options?.algorithm || 'sha256'
      );

    case 'password-generator':
      return GeneratorEngine.generatePassword(options || {});

    case 'lorem-ipsum-generator':
      return GeneratorEngine.generateLoremIpsum(options || {});

    case 'qr-code-generator':
      if (!input) {
        throw new Error('Input text is required for QR code generation');
      }
      return GeneratorEngine.generateQRCode(input, options?.size || '200');

    case 'hex-to-rgb':
      if (!input) {
        throw new Error('HEX color value is required');
      }
      return GeneratorEngine.hexToRGB(input);

    case 'rgb-to-hex':
      if (!input) {
        throw new Error('RGB color value is required');
      }
      return GeneratorEngine.rgbToHex(input);

    case 'slug-generator':
      if (!input) {
        throw new Error('Input text is required for slug generation');
      }
      return GeneratorEngine.generateSlug(input);

    case 'random-string-generator':
      return GeneratorEngine.generateRandomString(options || {});

    case 'timestamp-generator':
      return GeneratorEngine.generateTimestamp(options?.format);

    case 'color-converter':
      if (!input) {
        throw new Error('Color value is required');
      }
      const convertFrom = options?.convertFrom || 'hex';
      if (convertFrom === 'hex') {
        return GeneratorEngine.hexToRGB(input);
      } else {
        return GeneratorEngine.rgbToHex(input);
      }

    default:
      throw new Error(`Unknown generator tool: ${toolId}`);
  }
}
