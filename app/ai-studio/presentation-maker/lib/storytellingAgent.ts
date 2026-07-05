import type { ResearchAgentOutput } from './researchAgent';

export interface StorytellingAgentInput {
  topic: string;
  audience: string;
  tone: string;
  slideCount: string;
  research: ResearchAgentOutput;
}

export interface StorytellingAgentOutput {
  narrativeAngle: string;
  openingHook: string;
  storyline: string[];
  slideJourney: SlideJourneyStep[];
  closingMessage: string;
}

export interface SlideJourneyStep {
  slideNumber: number;
  title: string;
  narrativePurpose: string;
  suggestedIntent: string;
}

export function buildStorytellingAgentPrompt({ topic, audience, tone, slideCount, research }: StorytellingAgentInput) {
  return [
    'You are a storytelling strategist for an AI presentation maker.',
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
    'Goal:',
    'Decide the narrative flow of the deck before the presentation planner creates slides.',
    '',
    'Requirements:',
    '- Be generic for any topic or industry.',
    '- Support travel, education, business, healthcare, technology, and general presentations.',
    '- Create a clear beginning, middle, and ending.',
    `- Create exactly ${slideCount} slideJourney items. No more, no fewer.`,
    '- Slide 1 must be a cover/opening. Slide 2 should orient the audience. The final slide must conclude.',
    '- Main sections should progress logically instead of repeating the same slide type.',
    '- Avoid repetitive slide structures and repetitive slide intents.',
    '- Make the flow match the audience, tone, and purpose.',
    '- For travel/tourism, use a narrative arc like: destination promise, context, attractions, itinerary, culture, food, practical tips, memorable experiences, conclusion.',
    '- For education, use: objective, concept, explanation, examples, activity/check, summary.',
    '- For business, use: problem/opportunity, solution, benefits/proof, plan/timeline, ask/next steps.',
    '- Keep every array item concise and presentation-ready.',
    '',
    'Required JSON schema:',
    '{',
    '  "narrativeAngle": "string",',
    '  "openingHook": "string",',
    '  "storyline": ["string"],',
    '  "slideJourney": [',
    '    {',
    '      "slideNumber": 1,',
    '      "title": "string",',
    '      "narrativePurpose": "string",',
    '      "suggestedIntent": "cover | overview | attractions | destination | itinerary | culture | comparison | process | statistics | conclusion | objective | concept | examples | activity | problem | solution | benefits | timeline | cost | food | tips | experience"',
    '    }',
    '  ],',
    '  "closingMessage": "string"',
    '}',
  ].join('\n');
}

export function parseStorytellingAgentOutput(raw: string): StorytellingAgentOutput {
  const parsed = safeJsonParse(extractJson(raw));
  const input = isRecord(parsed) ? parsed : {};

  return {
    narrativeAngle: cleanText(input.narrativeAngle),
    openingHook: cleanText(input.openingHook),
    storyline: normalizeStringArray(input.storyline),
    slideJourney: normalizeSlideJourney(input.slideJourney),
    closingMessage: cleanText(input.closingMessage),
  };
}

export function serializeStorytellingForPlanner(storytelling: StorytellingAgentOutput) {
  return JSON.stringify(
    {
      narrativeAngle: storytelling.narrativeAngle,
      openingHook: storytelling.openingHook,
      storyline: storytelling.storyline,
      slideJourney: storytelling.slideJourney,
      closingMessage: storytelling.closingMessage,
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

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(cleanText).filter(Boolean).slice(0, 12);
}

function normalizeSlideJourney(value: unknown): SlideJourneyStep[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          slideNumber: index + 1,
          title: cleanText(item),
          narrativePurpose: cleanText(item),
          suggestedIntent: '',
        };
      }

      if (!isRecord(item)) return null;

      return {
        slideNumber: typeof item.slideNumber === 'number' ? item.slideNumber : index + 1,
        title: cleanText(item.title),
        narrativePurpose: cleanText(item.narrativePurpose),
        suggestedIntent: cleanText(item.suggestedIntent),
      };
    })
    .filter((item): item is SlideJourneyStep => Boolean(item))
    .slice(0, 30);
}
