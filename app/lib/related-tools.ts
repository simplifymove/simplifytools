import { aiWriteTools } from '@/app/lib/ai-tools';
import { codeTools } from '@/app/lib/code-tools';
import { dataTools } from '@/app/lib/data-tools';
import { pdfTools } from '@/app/lib/pdf-tools';
import { videoTools } from '@/app/lib/video-tools';
import { imageToolsRegistry } from '@/app/lib/image-tools-registry';

export type RelatedToolFamily = 'ai' | 'code' | 'data' | 'pdf' | 'video' | 'image';

export interface RelatedToolItem {
  id: string;
  title: string;
  description: string;
  route: string;
  family: RelatedToolFamily;
}

interface RelatedToolCandidate extends RelatedToolItem {
  category?: string;
  engine?: string;
  type?: string;
}

export interface GetRelatedToolsOptions {
  family: RelatedToolFamily;
  toolId: string;
  limit?: number;
}

const familyRoutes: Record<RelatedToolFamily, string> = {
  ai: '/all-tools/ai-tools',
  code: '/all-tools/code-tools',
  data: '/all-tools/data',
  pdf: '/all-tools/pdf',
  video: '/all-tools/video',
  image: '/all-tools',
};

const fallbackIds: Record<RelatedToolFamily, string[]> = {
  ai: [
    'content-improver',
    'paragraph-writer',
    'grammar-fixer',
    'content-summarizer',
    'blog-post-generator',
    'sentence-rewriter',
    'tone-of-voice',
    'outline-generator',
  ],
  code: [
    'json-validator',
    'json-formatter',
    'xml-to-json',
    'jwt-decoder',
    'password-generator',
    'base64-encode',
    'url-encode',
    'hash-generator',
  ],
  data: [
    'csv-to-json',
    'xml-to-json',
    'json-to-xml',
    'csv-to-excel',
    'excel-to-csv',
    'csv-to-xml',
    'split-csv',
    'split-excel',
  ],
  pdf: [
    'merge-pdf',
    'split-pdf',
    'compress-pdf',
    'pdf-to-word',
    'pdf-to-jpg',
    'jpg-to-pdf',
    'rotate-pdf',
    'protect-pdf',
  ],
  video: [
    'trim-video',
    'compress-video',
    'mp4-to-gif',
    'mp4-to-mp3',
    'extract-audio-from-video',
    'resize-video',
    'video-to-text',
    'mp4-to-webm',
  ],
  image: [
    'png-to-jpg',
    'jpg-to-png',
    'jpg-to-webp',
    'webp-to-jpg',
    'resize-image',
    'compress-image',
    'crop-image',
    'remove-background',
  ],
};

function normalizeLimit(limit = 8): number {
  return Math.max(6, Math.min(limit, 10));
}

function toRoute(family: RelatedToolFamily, id: string): string {
  return `${familyRoutes[family]}/${id}`;
}

function normalizeCandidates(): RelatedToolCandidate[] {
  const aiCandidates: RelatedToolCandidate[] = Object.values(aiWriteTools).map((tool) => ({
    id: tool.id,
    title: tool.title,
    description: tool.description,
    route: toRoute('ai', tool.id),
    family: 'ai',
    category: tool.category,
  }));

  const codeCandidates: RelatedToolCandidate[] = Object.values(codeTools).map((tool) => ({
    id: tool.id,
    title: tool.title,
    description: tool.description,
    route: toRoute('code', tool.id),
    family: 'code',
    engine: tool.engine,
  }));

  const dataCandidates: RelatedToolCandidate[] = Object.values(dataTools).map((tool) => ({
    id: tool.id,
    title: tool.title,
    description: tool.description,
    route: toRoute('data', tool.id),
    family: 'data',
    category: tool.category,
    engine: tool.engine,
  }));

  const pdfCandidates: RelatedToolCandidate[] = Object.values(pdfTools).map((tool) => ({
    id: tool.id,
    title: tool.title,
    description: tool.description,
    route: toRoute('pdf', tool.id),
    family: 'pdf',
    category: tool.category,
    engine: tool.engine,
  }));

  const videoCandidates: RelatedToolCandidate[] = Object.values(videoTools).map((tool) => ({
    id: tool.id,
    title: tool.title,
    description: tool.description,
    route: toRoute('video', tool.id),
    family: 'video',
    category: tool.category,
    engine: tool.engine,
  }));

  const imageCandidates: RelatedToolCandidate[] = Object.values(imageToolsRegistry).map((tool) => ({
    id: tool.id,
    title: tool.title,
    description: tool.description,
    route: toRoute('image', tool.slug),
    family: 'image',
    type: tool.type,
  }));

  return [
    ...aiCandidates,
    ...codeCandidates,
    ...dataCandidates,
    ...pdfCandidates,
    ...videoCandidates,
    ...imageCandidates,
  ];
}

function getReverseConversionId(toolId: string): string | null {
  const parts = toolId.split('-to-');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  return `${parts[1]}-to-${parts[0]}`;
}

function toPublicItem(candidate: RelatedToolCandidate): RelatedToolItem {
  return {
    id: candidate.id,
    title: candidate.title,
    description: candidate.description,
    route: candidate.route,
    family: candidate.family,
  };
}

function addUnique(
  results: RelatedToolCandidate[],
  candidate: RelatedToolCandidate | undefined,
  currentToolId: string,
  maxResults: number
) {
  if (!candidate || candidate.id === currentToolId || results.length >= maxResults) {
    return;
  }

  if (!results.some((item) => item.family === candidate.family && item.id === candidate.id)) {
    results.push(candidate);
  }
}

export function getRelatedTools({
  family,
  toolId,
  limit = 8,
}: GetRelatedToolsOptions): RelatedToolItem[] {
  const maxResults = normalizeLimit(limit);
  const allCandidates = normalizeCandidates();
  const familyCandidates = allCandidates.filter((tool) => tool.family === family);
  const currentTool = familyCandidates.find((tool) => tool.id === toolId);
  const results: RelatedToolCandidate[] = [];

  const reverseId = getReverseConversionId(toolId);
  if (reverseId) {
    addUnique(
      results,
      familyCandidates.find((tool) => tool.id === reverseId),
      toolId,
      maxResults
    );
  }

  if (currentTool) {
    const scoredSameFamily = familyCandidates
      .filter((tool) => tool.id !== toolId)
      .map((tool) => {
        let score = 0;
        if (currentTool.category && tool.category === currentTool.category) score += 4;
        if (currentTool.engine && tool.engine === currentTool.engine) score += 3;
        if (currentTool.type && tool.type === currentTool.type) score += 4;
        if (getReverseConversionId(tool.id) === toolId) score += 10;
        return { tool, score };
      })
      .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title));

    scoredSameFamily.forEach(({ tool }) => addUnique(results, tool, toolId, maxResults));
  }

  fallbackIds[family].forEach((id) => {
    addUnique(
      results,
      familyCandidates.find((tool) => tool.id === id),
      toolId,
      maxResults
    );
  });

  if (results.length < Math.min(6, maxResults)) {
    Object.entries(fallbackIds).forEach(([fallbackFamily, ids]) => {
      ids.forEach((id) => {
        addUnique(
          results,
          allCandidates.find((tool) => tool.family === fallbackFamily && tool.id === id),
          toolId,
          maxResults
        );
      });
    });
  }

  return results.slice(0, maxResults).map(toPublicItem);
}
