import type { ResearchAgentOutput } from './researchAgent';
import type { StorytellingAgentOutput } from './storytellingAgent';

export interface VisualDesignAgentInput {
  topic: string;
  audience: string;
  tone: string;
  slideCount: string;
  research: ResearchAgentOutput;
  storytelling: StorytellingAgentOutput;
}

export interface SlideDesignDirection {
  slideNumber: number;
  visualRole: string;
  layout: string;
  visualFormat: string;
  contentStructure: string;
  needsImage: boolean;
  imageStrategy: string;
  chartStrategy: string;
  compositionNotes: string;
}

export interface VisualDesignAgentOutput {
  designTheme: string;
  visualStyle: string;
  typographyStyle: string;
  colorMood: string;
  slideDesigns: SlideDesignDirection[];
}

export function buildVisualDesignAgentPrompt({
  topic,
  audience,
  tone,
  slideCount,
  research,
  storytelling,
}: VisualDesignAgentInput) {
  return [
    'You are a visual design director for an AI presentation maker.',
    'Return strict JSON only. Do not use markdown. Do not wrap the JSON in code fences. Do not add commentary before or after the JSON.',
    '',
    'Presentation input:',
    `Topic: ${topic}`,
    `Audience: ${audience}`,
    `Tone: ${tone}`,
    `Slide count: ${slideCount}`,
    '',
    'Research context:',
    JSON.stringify(research, null, 2),
    '',
    'Storytelling context:',
    JSON.stringify(storytelling, null, 2),
    '',
    'Goal:',
    'Decide how each slide should look before the final presentation planner creates slide JSON.',
    '',
    'Requirements:',
    '- Be generic for any topic or industry.',
    '- Avoid repeated image + bullet layouts.',
    '- Vary layouts, visual formats, composition, and visual roles across the deck.',
    `- Create exactly ${slideCount} slideDesigns items. No more, no fewer.`,
    '- Choose the best content structure for each slide: image story, gallery, cards, timeline, comparison, process, KPI/statistics, roadmap, matrix, or simple diagram.',
    '- Use KPI/statistics only for slides where quantified evidence is truly useful.',
    '- Avoid using the same layout more than two times in a row.',
    '- Travel decks should use hero images, galleries, itinerary timelines, attraction cards, maps, and quick facts.',
    '- Travel/tourism decks should prefer gallery, image story, itinerary timeline, tips cards, and visitor-experience cards over KPI/statistics.',
    '- Education decks should use diagrams, process flows, examples, activities, comparisons, and summaries.',
    '- Business decks should use KPI cards, roadmaps, comparisons, charts, pricing/cost structures, and executive summaries.',
    '- Healthcare and technology decks should use clean diagrams, process flows, evidence cards, timelines, and system visuals.',
    '- Use only PowerPoint-safe visual concepts: shapes, cards, timelines, simple charts, image blocks, tables, and diagrams.',
    '',
    'Required JSON schema:',
    '{',
    '  "designTheme": "string",',
    '  "visualStyle": "string",',
    '  "typographyStyle": "string",',
    '  "colorMood": "string",',
    '  "slideDesigns": [',
    '    {',
    '      "slideNumber": 1,',
    '      "visualRole": "string",',
    '      "layout": "string",',
    '      "visualFormat": "string",',
    '      "contentStructure": "image story | gallery | cards | timeline | comparison | process | KPI/statistics | roadmap | matrix | diagram",',
    '      "needsImage": true,',
    '      "imageStrategy": "string",',
    '      "chartStrategy": "string",',
    '      "compositionNotes": "string"',
    '    }',
    '  ]',
    '}',
  ].join('\n');
}

export function parseVisualDesignAgentOutput(raw: string, requestedSlideCount: number): VisualDesignAgentOutput {
  const parsed = safeJsonParse(extractJson(raw));
  const input = isRecord(parsed) ? parsed : {};
  const sourceDesigns = Array.isArray(input.slideDesigns) ? input.slideDesigns : [];
  const targetCount = Math.max(3, Math.min(30, requestedSlideCount || sourceDesigns.length || 8));

  return {
    designTheme: cleanText(input.designTheme),
    visualStyle: cleanText(input.visualStyle),
    typographyStyle: cleanText(input.typographyStyle),
    colorMood: cleanText(input.colorMood),
    slideDesigns: Array.from({ length: targetCount }, (_, index) => {
      const source = isRecord(sourceDesigns[index]) ? sourceDesigns[index] : {};

      return {
        slideNumber: index + 1,
        visualRole: cleanText(source.visualRole),
        layout: cleanText(source.layout),
        visualFormat: cleanText(source.visualFormat),
        contentStructure: cleanText(source.contentStructure),
        needsImage: typeof source.needsImage === 'boolean' ? source.needsImage : true,
        imageStrategy: cleanText(source.imageStrategy),
        chartStrategy: cleanText(source.chartStrategy),
        compositionNotes: cleanText(source.compositionNotes),
      };
    }),
  };
}

export function serializeVisualDesignForPlanner(visualDesign: VisualDesignAgentOutput) {
  return JSON.stringify(
    {
      designTheme: visualDesign.designTheme,
      visualStyle: visualDesign.visualStyle,
      typographyStyle: visualDesign.typographyStyle,
      colorMood: visualDesign.colorMood,
      slideDesigns: visualDesign.slideDesigns,
    },
    null,
    2
  );
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
