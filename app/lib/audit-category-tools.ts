import { aiWriteTools } from '@/app/lib/ai-tools';
import { allTools, financialTools, resumeTools, downloaderTools } from '@/app/data/tools';
import { getAllTools as getAllCodeTools } from '@/app/lib/code-tools';
import { dataTools } from '@/app/lib/data-tools';
import { getAllPdfTools } from '@/app/lib/pdf-tools';
import { getAllTools as getAllVideoTools } from '@/app/lib/video-tools';

export type AuditCategoryId =
  | 'ai-writing-tools'
  | 'pdf-tools'
  | 'image-tools'
  | 'video-tools'
  | 'code-tools'
  | 'data-tools'
  | 'data-conversion-tools'
  | 'financial-calculators'
  | 'resume-maker'
  | 'save-from-online'
  | 'text-to-speech';

export interface AuditToolTarget {
  slug: string;
  title: string;
  route?: string;
  functionalAudit: FunctionalAuditContract;
}

export type FunctionalAuditStrategy =
  | 'file'
  | 'text'
  | 'url'
  | 'form'
  | 'adaptive'
  | 'pdf-editor'
  | 'pdf-annotate'
  | 'pdf-esign'
  | 'pdf-rearrange'
  | 'inactive';

export type FunctionalResultFlow =
  | 'download-page'
  | 'download'
  | 'rendered-output'
  | 'navigation'
  | 'none';

export type AuditExecutionClass =
  | 'LOCAL_DETERMINISTIC'
  | 'EXTERNAL_CONFIGURED'
  | 'EXTERNAL_NOT_CONFIGURED'
  | 'RATE_LIMITED'
  | 'PAID_PROVIDER_DISABLED';

export interface FunctionalExpectedOutput {
  extension?: string;
  mimeType?: string;
  minSizeBytes?: number;
  signature?: 'pdf' | 'zip' | 'image' | 'office' | 'media' | 'text';
}

export interface FunctionalAuditContract {
  strategy: FunctionalAuditStrategy;
  fixtures?: string[];
  textInput?: string;
  urlInput?: string;
  optionValues?: Record<string, string | number | boolean>;
  processButtonText?: string;
  resultFlow: FunctionalResultFlow;
  expectedOutput?: FunctionalExpectedOutput;
  renderedResult?: {
    selector: string;
    apiEndpoint?: string;
    noTextSuccessMessages?: string[];
    timeoutMs?: number;
  };
  inactiveReason?: string;
  executionClass?: AuditExecutionClass;
  externalProvider?: string;
  rateSensitive?: boolean;
}

export interface AuditCategoryDefinition {
  id: AuditCategoryId;
  name: string;
  tools: AuditToolTarget[];
}

const MIME_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf', '.zip': 'application/zip', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.csv': 'text/csv', '.tsv': 'text/tab-separated-values', '.txt': 'text/plain', '.html': 'text/html', '.rtf': 'application/rtf', '.json': 'application/json',
  '.xml': 'application/xml', '.yaml': 'application/yaml', '.yml': 'application/yaml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.tif': 'image/tiff', '.tiff': 'image/tiff',
  '.svg': 'image/svg+xml', '.avif': 'image/avif', '.eps': 'application/postscript', '.ai': 'application/postscript',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.avi': 'video/x-msvideo', '.webm': 'video/webm', '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.m4r': 'audio/mp4', '.aac': 'audio/aac', '.flac': 'audio/flac', '.ogg': 'audio/ogg',
  '.epub': 'application/epub+zip', '.mobi': 'application/x-mobipocket-ebook', '.azw3': 'application/vnd.amazon.ebook',
};

const FIXTURE_BY_EXTENSION: Record<string, string> = {
  '.pdf': 'tests/fixtures/pdf/simple.pdf', '.jpg': 'tests/fixtures/images/sample.jpg', '.jpeg': 'tests/fixtures/images/sample.jpeg',
  '.png': 'tests/fixtures/images/sample.png', '.webp': 'tests/fixtures/images/sample.webp', '.gif': 'tests/fixtures/images/sample.gif',
  '.bmp': 'tests/fixtures/images/sample.bmp', '.tif': 'tests/fixtures/images/sample.tiff', '.tiff': 'tests/fixtures/images/sample.tiff',
  '.svg': 'tests/fixtures/images/sample.svg', '.heic': 'tests/fixtures/images/sample.heic', '.avif': 'tests/fixtures/images/sample.avif',
  '.docx': 'tests/fixtures/documents/sample.docx', '.doc': 'tests/fixtures/documents/sample.doc', '.xlsx': 'tests/fixtures/documents/sample.xlsx',
  '.xls': 'tests/fixtures/documents/sample.xls', '.xlsm': 'tests/fixtures/documents/sample.xlsx', '.xlsb': 'tests/fixtures/documents/sample.xlsx',
  '.pptx': 'tests/fixtures/documents/sample.pptx', '.ppt': 'tests/fixtures/documents/sample.ppt', '.txt': 'tests/fixtures/documents/sample.txt',
  '.rtf': 'tests/fixtures/documents/sample.rtf', '.csv': 'tests/fixtures/data/sample.csv', '.json': 'tests/fixtures/data/sample.json',
  '.xml': 'tests/fixtures/data/sample.xml', '.yaml': 'tests/fixtures/data/sample.yaml', '.yml': 'tests/fixtures/data/sample.yml', '.tsv': 'tests/fixtures/data/sample.tsv',
  '.mp4': 'tests/fixtures/video/sample.mp4', '.mov': 'tests/fixtures/video/sample.mov', '.avi': 'tests/fixtures/video/sample.avi',
  '.webm': 'tests/fixtures/video/sample.webm', '.mkv': 'tests/fixtures/video/sample.mkv', '.flv': 'tests/fixtures/video/sample.flv', '.m4v': 'tests/fixtures/video/sample.m4v',
  '.mp3': 'tests/fixtures/audio/sample.mp3', '.wav': 'tests/fixtures/audio/sample.wav', '.m4a': 'tests/fixtures/audio/sample.m4a',
  '.aac': 'tests/fixtures/audio/sample.aac', '.flac': 'tests/fixtures/audio/sample.flac', '.ogg': 'tests/fixtures/audio/sample.ogg',
  '.eps': 'tests/fixtures/images/sample.eps', '.msg': 'tests/fixtures/documents/sample.msg', '.epub': 'tests/fixtures/documents/sample.epub',
  '.psd': 'tests/fixtures/images/sample.psd', '.vsd': 'tests/fixtures/documents/sample.vsd', '.vsdx': 'tests/fixtures/documents/sample.vsdx',
  '.mobi': 'tests/fixtures/documents/sample.mobi', '.azw3': 'tests/fixtures/documents/sample.azw3',
};

function fixtureFor(accepts: string[]): string | undefined {
  return accepts.map((extension) => FIXTURE_BY_EXTENSION[extension.toLowerCase()]).find(Boolean);
}

function outputContract(extension?: string): FunctionalExpectedOutput | undefined {
  if (!extension || extension === 'text' || extension === 'multiple') return undefined;
  const normalized = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  return {
    extension: normalized,
    mimeType: MIME_TYPES[normalized],
    minSizeBytes: ['.txt', '.csv', '.html', '.rtf'].includes(normalized) ? 1 : 32,
    signature: normalized === '.pdf' ? 'pdf' : ['.zip', '.epub'].includes(normalized) ? 'zip' : normalized.startsWith('.doc') || normalized.startsWith('.xls') || normalized.startsWith('.ppt') ? 'office' : MIME_TYPES[normalized]?.startsWith('image/') ? 'image' : MIME_TYPES[normalized]?.startsWith('audio/') || MIME_TYPES[normalized]?.startsWith('video/') ? 'media' : 'text',
  };
}

function externalClass(requiredEnvironmentVariables: string[], paidProvider = false): AuditExecutionClass {
  if (paidProvider) return 'PAID_PROVIDER_DISABLED';
  return requiredEnvironmentVariables.every((name) => Boolean(process.env[name]))
    ? 'EXTERNAL_CONFIGURED'
    : 'EXTERNAL_NOT_CONFIGURED';
}

function codeAuditInput(toolId: string): string {
  if (toolId === 'code-minifier' || toolId === 'code-beautifier') return 'const audit = { name: "SimplifyConvert", active: true }; console.log(audit.name);';
  if (toolId === 'json-to-csv') return '[{"name":"SimplifyConvert","active":true}]';
  if (toolId === 'json-to-xml') return '{"name":"SimplifyConvert","active":true}';
  if (toolId === 'temperature-converter') return '25';
  if (toolId === 'csv-json-converter') return 'name,active\nSimplifyConvert,true';
  if (toolId.includes('jwt')) return 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhdWRpdCJ9.';
  if (toolId.includes('base64')) return toolId.includes('decode') ? 'U2ltcGxpZnlDb252ZXJ0IGF1ZGl0=' : 'SimplifyConvert audit';
  if (toolId === 'url-decode') return 'SimplifyConvert%20audit';
  if (toolId === 'url-encode') return 'SimplifyConvert audit';
  if (toolId.includes('xml')) return '<items><item><name>audit</name><value>1</value></item></items>';
  if (toolId.includes('html')) return '<!doctype html><html><body><p>Audit</p></body></html>';
  if (toolId.includes('css')) return 'body { color: #123456; margin: 0; }';
  if (toolId.includes('sql')) return 'SELECT 1 AS audit;';
  if (toolId.includes('markdown')) return '# Audit\n\nPredictable content.';
  if (toolId.includes('regex')) return '^[a-z]+$';
  if (toolId.includes('timestamp') || toolId.includes('epoch')) return '1704067200';
  if (toolId.includes('color')) return '#1e64dc';
  return '{"name":"SimplifyConvert","active":true}';
}

function codeAuditProcessButton(toolId: string): string | undefined {
  const executableControls: Record<string, string> = {
    'escape-unescape': '^Escape/Unescape$',
    'text-diff': '^Find difference$',
    'regex-tester': '^Test Regex$',
  };

  return executableControls[toolId];
}

function withRoute(
  tool: { id: string; title: string },
  route: string,
  functionalAudit: FunctionalAuditContract,
): AuditToolTarget {
  return {
    slug: tool.id,
    title: tool.title,
    route,
    functionalAudit,
  };
}

function mapDataTools(): AuditToolTarget[] {
  return Object.values(dataTools).map((tool) => withRoute(tool, `/all-tools/data/${tool.id}`, {
    strategy: 'file',
    fixtures: fixtureFor(tool.accepts) ? [fixtureFor(tool.accepts)!] : [],
    optionValues: Object.fromEntries(tool.options.filter((option) => option.required).map((option) => [option.name, option.default ?? (option.name === 'itemTag' ? 'item' : '1')])),
    resultFlow: 'download',
    expectedOutput: outputContract(tool.output),
  }));
}

function mapImageTools(): AuditToolTarget[] {
  return allTools
    .filter(
      (tool): tool is typeof tool & { route: string } =>
        tool.category === 'Image' &&
        typeof tool.route === 'string' &&
        tool.route.length > 0,
    )
    .map((tool) => {
      const routeSlug = tool.route.split('/').pop() || tool.id;
      const conversion = /^([a-z0-9]+)-to-([a-z0-9]+)$/.exec(routeSlug);
      const inputExtension = conversion ? `.${conversion[1] === 'jpeg' ? 'jpg' : conversion[1]}` : '.png';
      const outputExtension = conversion ? `.${conversion[2] === 'jpeg' ? 'jpg' : conversion[2] === 'tif' ? 'tiff' : conversion[2]}`
        : routeSlug === 'compress-image' ? '.jpg' : '.png';
      const renderedOutput = ['image-to-text', 'pdf-to-text', 'tiff-to-text', 'view-metadata'].includes(routeSlug);
      const noFileInput = ['chart-maker', 'font-awesome-to-png'].includes(routeSlug);
      return {
        slug: tool.id,
        title: tool.title,
        route: tool.route,
        functionalAudit: {
          strategy: noFileInput ? 'text' as const : 'adaptive' as const,
          fixtures: noFileInput ? undefined : [FIXTURE_BY_EXTENSION[inputExtension] || 'tests/fixtures/images/sample.png'],
          textInput: 'A small blue square on a white background',
          resultFlow: renderedOutput ? 'rendered-output' as const : 'download' as const,
          expectedOutput: renderedOutput ? undefined : outputContract(outputExtension),
          renderedResult: routeSlug === 'image-to-text' ? {
            selector: '.output-result textarea[aria-label="Extracted text result"]',
            apiEndpoint: '/api/convert',
            noTextSuccessMessages: ['No text was detected in this image.'],
          } : undefined,
          executionClass: 'LOCAL_DETERMINISTIC',
          rateSensitive: false,
        },
      };
    });
}

export const AUDIT_CATEGORY_DEFINITIONS: AuditCategoryDefinition[] = [
  {
    id: 'ai-writing-tools',
    name: 'AI Writing Tools',
    tools: Object.values(aiWriteTools).map((tool) => withRoute(tool, `/all-tools/ai-tools/${tool.id}`, {
      strategy: 'text', textInput: 'SimplifyConvert provides small, safe browser tools for everyday file tasks.', resultFlow: 'rendered-output',
      executionClass: externalClass(['OPENROUTER_API_KEY']), externalProvider: 'OpenRouter', rateSensitive: true,
    })),
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    tools: getAllPdfTools().map((tool) => withRoute(tool, `/all-tools/pdf/${tool.id}`, {
      strategy: tool.id === 'edit-pdf' ? 'pdf-editor' : tool.id === 'annotate-pdf' ? 'pdf-annotate' : tool.id === 'esign-pdf' ? 'pdf-esign' : tool.id === 'rearrange-pdf' ? 'pdf-rearrange' : tool.inputMode === 'url' ? 'url' : 'file',
      fixtures: tool.id === 'merge-pdf' ? ['tests/fixtures/pdf/simple.pdf', 'tests/fixtures/pdf/multi-page.pdf']
        : tool.id === 'rearrange-pdf' ? ['tests/fixtures/pdf/multi-page.pdf']
        : ['extract-tables-from-pdf', 'pdf-to-csv'].includes(tool.id) ? ['tests/fixtures/pdf/table.pdf']
        : tool.id === 'create-pdf' ? ['tests/fixtures/images/sample.png']
        : tool.id === 'unlock-pdf' ? ['tests/fixtures/pdf/protected.pdf']
        : tool.id === 'extract-images-pdf' ? ['tests/fixtures/pdf/images.pdf']
        : tool.output === '.zip' && tool.accepts.includes('.pdf') ? ['tests/fixtures/pdf/multi-page.pdf']
        : fixtureFor(tool.accepts) ? [fixtureFor(tool.accepts)!] : [],
      optionValues: Object.fromEntries((tool.options || [])
        .filter((option) => option.default !== undefined || ['protect-pdf', 'unlock-pdf'].includes(tool.id) || (tool.id === 'add-text' && option.id === 'text'))
        .map((option) => [option.id, option.default ?? (option.id.toLowerCase().includes('password') ? 'Audit123!' : tool.id === 'add-text' ? 'Audit added text' : '1')])),
      processButtonText: tool.id === 'edit-pdf' ? '^Save$' : tool.id === 'annotate-pdf' ? 'Download Annotated PDF' : ['rearrange-pdf', 'url-to-pdf'].includes(tool.id) ? '^Process PDF$' : undefined,
      urlInput: 'https://example.com/', resultFlow: 'download-page', expectedOutput: outputContract(tool.output),
      executionClass: 'LOCAL_DETERMINISTIC',
    })),
  },
  {
    id: 'image-tools',
    name: 'Image Tools',
    tools: mapImageTools(),
  },
  {
    id: 'video-tools',
    name: 'Video Tools',
    tools: getAllVideoTools().map((tool) =>
      withRoute(tool, tool.id === 'text-to-video' ? '/all-tools/video-tools/text-to-video' : `/all-tools/video/${tool.id}`, {
        strategy: tool.inputMethod === 'url' ? 'url' : tool.id === 'text-to-video' ? 'text' : 'file',
        fixtures:
          tool.id === 'audio-to-text' || tool.id === 'transcribe-podcast'
            ? ['tests/fixtures/audio/sample-speech.mp3']
            : fixtureFor(tool.accepts)
              ? [fixtureFor(tool.accepts)!]
              : undefined,
        textInput: 'A calm blue gradient with a centered title', urlInput: 'https://example.com/',
        optionValues: Object.fromEntries(tool.options.map((option) => [option.id, option.default
          ?? (tool.id === 'trim-video' ? (option.id === 'startTime' ? '00:00' : '00:01')
            : option.type === 'time' ? '00:01'
              : option.type === 'number' ? option.min ?? 1 : 'audit')])),
        resultFlow: tool.outputType === 'text' ? 'rendered-output' : 'download-page', expectedOutput: outputContract(tool.outputType),
        renderedResult: tool.id === 'summarize-podcast'
          ? {
              selector: '[data-testid="podcast-summary-output"]',
              apiEndpoint: '/api/media',
              timeoutMs: 180_000,
            }
          : undefined,
        executionClass: tool.id === 'text-to-video' ? externalClass(['PIKA_API_KEY'], true)
          : /transcri|to-text|transcript/.test(tool.id) ? externalClass(['GROQ_API_KEY'])
          : /youtube|instagram|tiktok|twitter|facebook|download/.test(tool.id) ? externalClass(['DOWNLOADER_API_URL'])
          : 'LOCAL_DETERMINISTIC',
        externalProvider: tool.id === 'text-to-video' ? 'Pika'
          : /transcri|to-text|transcript/.test(tool.id) ? 'Groq'
          : /youtube|instagram|tiktok|twitter|facebook|download/.test(tool.id) ? 'Downloader provider'
          : undefined,
        rateSensitive: /text-to-video|transcri|to-text|transcript|youtube|instagram|tiktok|twitter|facebook|download/.test(tool.id),
      }),
    ),
  },
  {
    id: 'code-tools',
    name: 'Code Tools',
    tools: getAllCodeTools().map((tool) => withRoute(tool, `/all-tools/code-tools/${tool.id}`, {
      strategy: tool.inputMode === 'none' ? 'form' : 'text',
      textInput: codeAuditInput(tool.id),
      urlInput: ['url-encode', 'url-decode'].includes(tool.id) ? codeAuditInput(tool.id) : undefined,
      optionValues: {
        ...Object.fromEntries(tool.options.filter((option) => option.default !== undefined).map((option) => [option.name, option.default!])),
        ...(tool.id === 'text-diff' ? { changedText: '{"name":"SimplifyConvert","active":false}' } : {}),
      },
      processButtonText: codeAuditProcessButton(tool.id),
      resultFlow: 'rendered-output',
      renderedResult: tool.id === 'text-diff'
        ? { selector: 'main h3:text-is("Comparison Summary")', apiEndpoint: '/api/code' }
        : undefined,
    })),
  },
  {
    id: 'data-tools',
    name: 'Data Tools',
    tools: mapDataTools(),
  },
  {
    id: 'data-conversion-tools',
    name: 'Data Conversion Tools',
    tools: mapDataTools(),
  },
  {
    id: 'financial-calculators',
    name: 'Financial Calculators',
    tools: financialTools.map((tool) => withRoute(tool, tool.route || `/all-tools/financial-calculators/${tool.id}`, { strategy: 'form', resultFlow: 'rendered-output' })),
  },
  {
    id: 'resume-maker',
    name: 'Resume Maker',
    tools: resumeTools.map((tool) => withRoute(tool, tool.route || `/all-tools/resume-maker/${tool.id}`, { strategy: 'form', textInput: 'Audit Candidate', resultFlow: 'rendered-output' })),
  },
  {
    id: 'save-from-online',
    name: 'Save From Online',
    tools: downloaderTools.map((tool) => withRoute(tool, tool.route || '/all-tools/save-from-online', {
      strategy: 'url', urlInput: 'https://example.com/', resultFlow: 'download',
      executionClass: externalClass(['DOWNLOADER_API_URL']), externalProvider: 'Downloader provider', rateSensitive: true,
    })),
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    tools: [
      {
        slug: 'text-to-speech',
        title: 'Text to Speech',
        route: '/all-tools/text-to-speech',
        functionalAudit: {
          strategy: 'text',
          textInput: 'SimplifyConvert functional audit sample.',
          resultFlow: 'download',
          expectedOutput: outputContract('.mp3'),
          executionClass: 'EXTERNAL_CONFIGURED',
          externalProvider: 'Bing Speech',
          rateSensitive: true,
        },
      },
    ],
  },
];

export const AUDIT_CATEGORY_SUMMARIES = AUDIT_CATEGORY_DEFINITIONS.map((category) => ({
  id: category.id,
  name: category.name,
  toolsCount: category.tools.length,
  estimatedTests: category.tools.length,
  configured: category.tools.every((tool) => Boolean(tool.route)),
}));

export function getAuditCategoryDefinition(categoryId: string): AuditCategoryDefinition | undefined {
  return AUDIT_CATEGORY_DEFINITIONS.find((category) => category.id === categoryId);
}

export function getAuditCategoryTargets(categoryId: string): AuditToolTarget[] {
  return getAuditCategoryDefinition(categoryId)?.tools || [];
}

export function getValidAuditCategoryIds(): AuditCategoryId[] {
  return AUDIT_CATEGORY_DEFINITIONS.map((category) => category.id);
}
