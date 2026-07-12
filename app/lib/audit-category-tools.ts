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
}

export interface AuditCategoryDefinition {
  id: AuditCategoryId;
  name: string;
  tools: AuditToolTarget[];
}

function withRoute(tool: { id: string; title: string }, route: string): AuditToolTarget {
  return {
    slug: tool.id,
    title: tool.title,
    route,
  };
}

function mapDataTools(): AuditToolTarget[] {
  return Object.values(dataTools).map((tool) => withRoute(tool, `/all-tools/data/${tool.id}`));
}

function mapImageTools(): AuditToolTarget[] {
  return allTools
    .filter(
      (tool): tool is typeof tool & { route: string } =>
        tool.category === 'Image' &&
        typeof tool.route === 'string' &&
        tool.route.length > 0,
    )
    .map((tool) => ({
      slug: tool.id,
      title: tool.title,
      route: tool.route,
    }));
}

export const AUDIT_CATEGORY_DEFINITIONS: AuditCategoryDefinition[] = [
  {
    id: 'ai-writing-tools',
    name: 'AI Writing Tools',
    tools: Object.values(aiWriteTools).map((tool) => withRoute(tool, `/all-tools/ai-tools/${tool.id}`)),
  },
  {
    id: 'pdf-tools',
    name: 'PDF Tools',
    tools: getAllPdfTools().map((tool) => withRoute(tool, `/all-tools/pdf/${tool.id}`)),
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
      withRoute(tool, tool.id === 'text-to-video' ? '/all-tools/video-tools/text-to-video' : `/all-tools/video/${tool.id}`),
    ),
  },
  {
    id: 'code-tools',
    name: 'Code Tools',
    tools: getAllCodeTools().map((tool) => withRoute(tool, `/all-tools/code-tools/${tool.id}`)),
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
    tools: financialTools.map((tool) => withRoute(tool, tool.route || `/all-tools/financial-calculators/${tool.id}`)),
  },
  {
    id: 'resume-maker',
    name: 'Resume Maker',
    tools: resumeTools.map((tool) => withRoute(tool, tool.route || `/all-tools/resume-maker/${tool.id}`)),
  },
  {
    id: 'save-from-online',
    name: 'Save From Online',
    tools: downloaderTools.map((tool) => withRoute(tool, tool.route || '/all-tools/save-from-online')),
  },
  {
    id: 'text-to-speech',
    name: 'Text to Speech',
    tools: [
      {
        slug: 'text-to-speech',
        title: 'Text to Speech',
        route: '/all-tools/text-to-speech',
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
