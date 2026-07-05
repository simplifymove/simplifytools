export interface ResearchAgentInput {
  topic: string;
  audience: string;
  tone: string;
  slideCount: string;
}

export interface ResearchAgentOutput {
  domain: string;
  category: string;
  inferredAudience: string;
  presentationObjective: string;
  topicSummary: string;
  keySubtopics: string[];
  keyFacts: string[];
  majorThemes: string[];
  importantEntities: string[];
  statistics: string[];
  timelineEvents: string[];
  recommendations: string[];
}

const emptyResearch: ResearchAgentOutput = {
  domain: '',
  category: '',
  inferredAudience: '',
  presentationObjective: '',
  topicSummary: '',
  keySubtopics: [],
  keyFacts: [],
  majorThemes: [],
  importantEntities: [],
  statistics: [],
  timelineEvents: [],
  recommendations: [],
};

export function buildResearchAgentPrompt({ topic, audience, tone, slideCount }: ResearchAgentInput) {
  return [
    'You are a generic research agent for an AI presentation maker.',
    'Return strict JSON only. Do not use markdown. Do not wrap the JSON in code fences. Do not add commentary before or after the JSON.',
    '',
    'Research input:',
    `Topic: ${topic}`,
    `Audience: ${audience}`,
    `Tone: ${tone}`,
    `Slide count: ${slideCount}`,
    '',
    'Goal:',
    'Understand the topic deeply enough to help a presentation planner create a specific, accurate, audience-aware deck.',
    '',
    'Requirements:',
    '- First classify the topic domain and category.',
    '- Infer the audience and presentation objective from the user request. If the provided audience is explicit, use it.',
    '- Generate key subtopics that can become distinct slide sections.',
    '- Be generic for any topic.',
    '- Support travel, education, business, healthcare, technology, and general topics.',
    '- Include only useful, presentation-ready facts and themes.',
    '- Do not invent exact statistics, citations, dates, prices, financials, or named entities unless they are common knowledge or directly implied by the topic.',
    '- If exact statistics are unavailable, provide cautious directional statements instead of fake numbers.',
    '- For travel/tourism topics, prioritize destination context, attractions, culture, food, itinerary, timing, practical tips, and visitor experience over statistics.',
    '- Keep every array item concise.',
    '',
    'Required JSON schema:',
    '{',
    '  "domain": "travel | education | business | technology | healthcare | general",',
    '  "category": "short topic category",',
    '  "inferredAudience": "string",',
    '  "presentationObjective": "string",',
    '  "topicSummary": "string",',
    '  "keySubtopics": ["string"],',
    '  "keyFacts": ["string"],',
    '  "majorThemes": ["string"],',
    '  "importantEntities": ["string"],',
    '  "statistics": ["string"],',
    '  "timelineEvents": ["string"],',
    '  "recommendations": ["string"]',
    '}',
  ].join('\n');
}

export function parseResearchAgentOutput(raw: string): ResearchAgentOutput {
  const parsed = safeJsonParse(extractJson(raw));
  const input = isRecord(parsed) ? parsed : {};

  return {
    domain: cleanText(input.domain),
    category: cleanText(input.category),
    inferredAudience: cleanText(input.inferredAudience),
    presentationObjective: cleanText(input.presentationObjective),
    topicSummary: cleanText(input.topicSummary),
    keySubtopics: normalizeStringArray(input.keySubtopics, 12),
    keyFacts: normalizeStringArray(input.keyFacts),
    majorThemes: normalizeStringArray(input.majorThemes),
    importantEntities: normalizeStringArray(input.importantEntities),
    statistics: normalizeStringArray(input.statistics),
    timelineEvents: normalizeStringArray(input.timelineEvents),
    recommendations: normalizeStringArray(input.recommendations),
  };
}

export function serializeResearchForPlanner(research: ResearchAgentOutput) {
  return JSON.stringify(
    {
      domain: research.domain,
      category: research.category,
      inferredAudience: research.inferredAudience,
      presentationObjective: research.presentationObjective,
      topicSummary: research.topicSummary,
      keySubtopics: research.keySubtopics,
      keyFacts: research.keyFacts,
      majorThemes: research.majorThemes,
      importantEntities: research.importantEntities,
      statistics: research.statistics,
      timelineEvents: research.timelineEvents,
      recommendations: research.recommendations,
    },
    null,
    2
  );
}

export function emptyResearchAgentOutput(): ResearchAgentOutput {
  return emptyResearch;
}

function extractJson(raw: string) {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    return '{}';
  }

  return trimmed.slice(start, end + 1);
}

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanText(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}

function normalizeStringArray(value: unknown, maxItems = 8) {
  if (!Array.isArray(value)) return [];
  return value.map(cleanText).filter(Boolean).slice(0, maxItems);
}
