import { allTools } from '@/app/data/tools';
import { aiWriteTools } from '@/app/lib/ai-tools';
import { getAllTools as getAllCodeTools } from '@/app/lib/code-tools';
import { dataTools } from '@/app/lib/data-tools';
import { getAllImageTools } from '@/app/lib/image-tools-registry';
import { getAllPdfTools } from '@/app/lib/pdf-tools';
import { getAllTools as getAllVideoTools } from '@/app/lib/video-tools';

export type SearchResultType = 'tool' | 'category' | 'recent';

export interface SearchIndexItem {
  id: string;
  title: string;
  description: string;
  category: string;
  href?: string;
  route?: string;
  type: SearchResultType;
  aliases?: string[];
}

interface ScoredSearchIndexItem extends SearchIndexItem {
  score: number;
  direct: boolean;
}

const categoryItems: SearchIndexItem[] = [
  {
    id: 'category-all-tools',
    title: 'All Tools',
    description: 'Browse every SimplifyConvert tool',
    category: 'Category',
    href: '/all-tools',
    route: '/all-tools',
    type: 'category',
    aliases: ['tools', 'search tools'],
  },
  {
    id: 'category-image',
    title: 'Image Tools',
    description: 'Edit, convert, enhance, and optimize images',
    category: 'Category',
    href: '/all-tools/image-tools',
    route: '/all-tools/image-tools',
    type: 'category',
    aliases: ['image', 'photo tools'],
  },
  {
    id: 'category-video',
    title: 'Video Tools',
    description: 'Convert, compress, trim, and edit videos',
    category: 'Category',
    href: '/all-tools/video-tools',
    route: '/all-tools/video-tools',
    type: 'category',
    aliases: ['video'],
  },
  {
    id: 'category-ai-writing',
    title: 'AI Writing Tools',
    description: 'AI-powered writing and content creation',
    category: 'Category',
    href: '/all-tools/ai-tools',
    route: '/all-tools/ai-tools',
    type: 'category',
    aliases: ['ai write', 'ai tools', 'writing tools'],
  },
  {
    id: 'category-data-tools',
    title: 'Data Tools',
    description: 'Convert CSV, JSON, XML, Excel, and other data formats',
    category: 'Category',
    href: '/all-tools/data',
    route: '/all-tools/data',
    type: 'category',
    aliases: ['data', 'data tools'],
  },
];

const manualTools: SearchIndexItem[] = [
  {
    id: 'presentation-maker',
    title: 'Presentation Maker',
    description: 'Create AI-powered presentations from a prompt',
    category: 'AI Studio',
    href: '/ai-studio/presentation-maker',
    route: '/ai-studio/presentation-maker',
    type: 'tool',
    aliases: ['ppt maker', 'ppt generator', 'slide maker', 'presentation generator'],
  },
];

const aliasById: Record<string, string[]> = {
  'remove-bg': ['remove background', 'background remover', 'remove image background'],
  'remove-background': ['remove bg', 'background remover', 'remove image background'],
  'merge-pdf': ['pdf merge', 'combine pdf', 'combine pdf files'],
  'compress-pdf': ['pdf compressor', 'reduce pdf size', 'pdf compress'],
  'jwt-decoder': ['decode jwt', 'jwt parser', 'jwt token decoder'],
  'xml-to-json': ['convert xml to json', 'xml json converter'],
  'presentation-maker': ['ppt maker', 'presentation maker', 'slide maker'],
};

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function compactSearchText(value: string) {
  return normalizeSearchText(value).replace(/\s+/g, '');
}

function slugFromRoute(route?: string) {
  if (!route) return '';
  const parts = route.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

function addTool(
  map: Map<string, SearchIndexItem>,
  tool: {
    id: string;
    title: string;
    description: string;
    category: string;
    route?: string;
    aliases?: string[];
  }
) {
  const route = tool.route;
  const key = route || `${tool.category}:${tool.id}`;
  const aliases = [...(tool.aliases || []), ...(aliasById[tool.id] || []), slugFromRoute(route)];
  const existing = map.get(key);

  if (!existing || (!existing.route && route)) {
    map.set(key, {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: tool.category,
      href: route,
      route,
      type: 'tool',
      aliases,
    });
  }
}

export function getSearchIndex(): SearchIndexItem[] {
  const map = new Map<string, SearchIndexItem>();

  allTools.forEach((tool) => {
    addTool(map, {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: tool.category,
      route: tool.route,
    });
  });

  getAllPdfTools().forEach((tool) => {
    addTool(map, {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: 'PDF',
      route: `/all-tools/pdf/${tool.id}`,
    });
  });

  getAllCodeTools().forEach((tool) => {
    addTool(map, {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: 'Code Tools',
      route: `/all-tools/code-tools/${tool.id}`,
    });
  });

  Object.values(dataTools).forEach((tool) => {
    addTool(map, {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: 'Data Tools',
      route: `/all-tools/data/${tool.id}`,
    });
  });

  Object.values(aiWriteTools).forEach((tool) => {
    addTool(map, {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: 'AI Write',
      route: `/all-tools/ai-tools/${tool.id}`,
    });
  });

  getAllVideoTools().forEach((tool) => {
    addTool(map, {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: 'Video',
      route: tool.id === 'text-to-video' ? '/all-tools/video-tools/text-to-video' : `/all-tools/video/${tool.id}`,
    });
  });

  getAllImageTools().forEach((tool) => {
    addTool(map, {
      id: tool.id,
      title: tool.title,
      description: tool.description,
      category: 'Image',
      route: `/all-tools/${tool.slug}`,
    });
  });

  manualTools.forEach((tool) => addTool(map, tool));

  return [...map.values(), ...categoryItems];
}

function scoreSearchItem(item: SearchIndexItem, query: string): ScoredSearchIndexItem | null {
  const normalizedQuery = normalizeSearchText(query);
  const compactQuery = compactSearchText(query);
  if (!normalizedQuery) return null;

  const fields = [
    item.title,
    item.id,
    item.category,
    item.description,
    slugFromRoute(item.route),
    ...(item.aliases || []),
  ].filter(Boolean);

  const normalizedFields = fields.map(normalizeSearchText);
  const compactFields = fields.map(compactSearchText);
  const queryWords = normalizedQuery.split(' ').filter(Boolean);
  const title = normalizeSearchText(item.title);
  const titleWords = title.split(' ').filter(Boolean);
  const slug = normalizeSearchText(slugFromRoute(item.route));

  let score = 0;
  let direct = false;

  if (normalizedFields.some((field) => field === normalizedQuery)) {
    score = 10000;
    direct = item.type === 'tool';
  } else if (compactFields.some((field) => field === compactQuery)) {
    score = 9500;
    direct = item.type === 'tool';
  } else if (queryWords.length > 1 && queryWords.every((word) => titleWords.includes(word))) {
    score = 9000;
    direct = item.type === 'tool';
  } else if (queryWords.length > 1 && queryWords.every((word) => slug.split(' ').includes(word))) {
    score = 8500;
    direct = item.type === 'tool';
  } else if (title.startsWith(normalizedQuery)) {
    score = 6000;
  } else if (compactSearchText(item.title).startsWith(compactQuery)) {
    score = 5500;
  } else if (title.includes(normalizedQuery)) {
    score = 4500;
  } else if (normalizedFields.some((field) => field.includes(normalizedQuery))) {
    score = 3500;
  } else {
    const matchedWords = queryWords.filter((word) =>
      normalizedFields.some((field) => field.split(' ').some((fieldWord) => fieldWord.includes(word)))
    );

    if (matchedWords.length > 0) {
      score = 1000 + matchedWords.length * 250;
      if (matchedWords.length === queryWords.length && queryWords.length > 1 && item.type === 'tool') {
        score += 1500;
      }
    }
  }

  if (score === 0) return null;
  if (item.type === 'tool') score += 100;

  return { ...item, score, direct };
}

function getItemHref(item: SearchIndexItem) {
  return item.href || item.route;
}

function getDedupeKeys(item: SearchIndexItem) {
  const href = getItemHref(item);
  return [
    href ? `${item.type}:href:${href}` : null,
    `${item.type}:id:${item.id}`,
  ].filter((key): key is string => Boolean(key));
}

function chooseBetterResult(current: ScoredSearchIndexItem, next: ScoredSearchIndexItem) {
  const currentHref = getItemHref(current);
  const nextHref = getItemHref(next);

  if (!currentHref && nextHref) return next;
  if (currentHref && !nextHref) return current;
  if (next.score !== current.score) return next.score > current.score ? next : current;
  if (next.direct !== current.direct) return next.direct ? next : current;

  return current;
}

function dedupeScoredResults(results: ScoredSearchIndexItem[]) {
  const winners: ScoredSearchIndexItem[] = [];
  const keyToIndex = new Map<string, number>();

  results.forEach((result) => {
    const keys = getDedupeKeys(result);
    const existingIndexes = keys
      .map((key) => keyToIndex.get(key))
      .filter((index): index is number => index !== undefined);
    const existingIndex = existingIndexes[0];

    if (existingIndex === undefined) {
      keyToIndex.set(keys[0], winners.length);
      if (keys[1]) keyToIndex.set(keys[1], winners.length);
      winners.push(result);
      return;
    }

    const better = chooseBetterResult(winners[existingIndex], result);
    winners[existingIndex] = better;
    getDedupeKeys(better).forEach((key) => keyToIndex.set(key, existingIndex));
  });

  return winners;
}

export function getSearchResults(query: string, limit?: number): SearchIndexItem[] {
  const scored = getSearchIndex()
    .map((item) => scoreSearchItem(item, query))
    .filter((item): item is ScoredSearchIndexItem => Boolean(item))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.type !== b.type) return a.type === 'tool' ? -1 : 1;
      return a.title.localeCompare(b.title);
    });

  return dedupeScoredResults(scored)
    .slice(0, limit || scored.length)
    .map(({ score, direct, ...item }) => item);
}

export function getBestSearchResult(query: string): SearchIndexItem | null {
  const best = getSearchIndex()
    .map((item) => scoreSearchItem(item, query))
    .filter(
      (item): item is ScoredSearchIndexItem =>
        item !== null && item.type === 'tool' && Boolean(item.route)
    )
    .sort((a, b) => b.score - a.score)[0];

  return best && best.direct ? best : null;
}
