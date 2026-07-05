export type PresentationTheme = 'travel' | 'education' | 'business' | 'technology' | 'healthcare' | 'general';

export type SlideIntent =
  | 'cover'
  | 'overview'
  | 'attractions'
  | 'destination'
  | 'itinerary'
  | 'culture'
  | 'comparison'
  | 'process'
  | 'statistics'
  | 'conclusion'
  | 'objective'
  | 'concept'
  | 'examples'
  | 'activity'
  | 'problem'
  | 'solution'
  | 'benefits'
  | 'timeline'
  | 'cost'
  | 'food'
  | 'tips'
  | 'experience';

export type SlideLayout = 'hero' | 'image-left' | 'image-right' | 'cards' | 'timeline' | 'split' | 'quote' | 'closing';

export type SlideVisualFormat =
  | 'cards'
  | 'timeline'
  | 'gallery'
  | 'infographic'
  | 'quickFacts'
  | 'comparison'
  | 'flow'
  | 'imageStory'
  | 'roadmap'
  | 'matrix';

export type SlideComponentType =
  | 'hero'
  | 'metricCard'
  | 'attractionCard'
  | 'timelineItem'
  | 'comparisonItem'
  | 'galleryItem'
  | 'quote'
  | 'mapSection'
  | 'processStep'
  | 'checklistItem'
  | 'kpiCard'
  | 'contentCard';

export interface SlideComponent {
  type: SlideComponentType;
  title: string;
  description: string;
  value?: string;
}

export interface PresentationSlide {
  slideNumber: number;
  title: string;
  subtitle: string;
  slideIntent: SlideIntent;
  layout: SlideLayout;
  visualFormat: SlideVisualFormat;
  imageQuery: string;
  components: SlideComponent[];
  bullets: string[];
  speakerNote: string;
}

export interface PresentationPlan {
  title: string;
  subtitle: string;
  theme: PresentationTheme;
  slides: PresentationSlide[];
  fallbackUsed?: boolean;
}

interface BuildPromptInput {
  topic: string;
  slideCount: string;
  audience: string;
  tone: string;
  researchContext?: string;
  storytellingContext?: string;
  visualDesignContext?: string;
}

const themes: PresentationTheme[] = ['travel', 'education', 'business', 'technology', 'healthcare', 'general'];
const layouts: SlideLayout[] = ['hero', 'image-left', 'image-right', 'cards', 'timeline', 'split', 'quote', 'closing'];
const visualFormats: SlideVisualFormat[] = ['cards', 'timeline', 'gallery', 'infographic', 'quickFacts', 'comparison', 'flow', 'imageStory', 'roadmap', 'matrix'];
const componentTypes: SlideComponentType[] = [
  'hero',
  'metricCard',
  'attractionCard',
  'timelineItem',
  'comparisonItem',
  'galleryItem',
  'quote',
  'mapSection',
  'processStep',
  'checklistItem',
  'kpiCard',
  'contentCard',
];
const intents: SlideIntent[] = [
  'cover',
  'overview',
  'attractions',
  'destination',
  'itinerary',
  'culture',
  'comparison',
  'process',
  'statistics',
  'conclusion',
  'objective',
  'concept',
  'examples',
  'activity',
  'problem',
  'solution',
  'benefits',
  'timeline',
  'cost',
  'food',
  'tips',
  'experience',
];

export function buildPresentationPrompt({ topic, slideCount, audience, tone, researchContext, storytellingContext, visualDesignContext }: BuildPromptInput) {
  return [
    'You are an expert presentation planner, story strategist, and information designer.',
    'Return strict JSON only. Do not use markdown. Do not wrap the JSON in code fences. Do not add commentary before or after the JSON.',
    '',
    'User request:',
    topic,
    '',
    'Presentation requirements:',
    `- Exact slide count: ${slideCount}`,
    `- Target audience: ${audience}`,
    `- Tone: ${tone}`,
    '- Work for any topic, industry, audience, or purpose.',
    '- Plan the deck first, then write slide content. Do not force every deck into a business or statistics format.',
    '- Use concise, presentation-ready phrases. Avoid paragraphs.',
    '- Do not invent fake statistics, citations, company names, financials, or case studies.',
    '',
    'Research Agent context:',
    researchContext || 'No separate research context was provided.',
    '',
    'Storytelling Agent context:',
    storytellingContext || 'No separate storytelling context was provided.',
    '',
    'Visual Design Agent context:',
    visualDesignContext || 'No separate visual design context was provided.',
    '',
    'Use the research context to make the deck more specific, but do not copy it verbatim or include unverified claims as exact facts.',
    'Use the research domain/category, inferred audience, objective, and keySubtopics to decide what belongs in the deck.',
    'Use the storytelling context to decide the narrative arc, slide journey, opening hook, and closing message.',
    'Treat storytelling.slideJourney as the required deck spine: one generated slide per journey item, in the same order.',
    'Use the visual design context to choose each slide layout, visual format, image strategy, chart strategy, and component composition.',
    'Treat visualDesign.slideDesigns as the required visual blueprint: one visual decision per generated slide.',
    'Avoid repetitive slide structures by varying slide intents, layouts, visual formats, and components according to the story and visual design direction.',
    '',
    'Context-aware planning rules:',
    '- The deck must have exactly the requested slide count. Do not add appendix, sources, agenda, or divider slides unless they are included in the requested count.',
    '- Narrative order must be: cover, orientation/intro, main sections, conclusion.',
    '- Travel deck sequence should include varied intents such as: cover, overview, attractions, itinerary, culture, food, tips, experience, conclusion.',
    '- Education deck sequence should include: cover, objective, concept explanation, process only for actual steps, examples, activity, summary/conclusion.',
    '- Business deck sequence should include: cover, problem, solution, benefits, timeline, cost/plan, conclusion.',
    '- Convert content into the best visual structure: timeline for dates/sequences, comparison for tradeoffs, process for steps, KPI/statistics only for real metrics, gallery for places/products, roadmap for phased plans, matrix for multi-factor decisions, cards for grouped ideas.',
    '- Use statistics only when slideIntent is genuinely about numbers, metrics, data evidence, budget, survey results, or quantified performance.',
    '- Use process only when slideIntent is genuinely about steps, workflow, method, sequence, or how something works.',
    '- Travel/culture/food/city/overview slides should usually use destination, overview, itinerary, culture, food, tips, cards, image-left, image-right, split, or timeline.',
    '- For travel/tourism decks, prefer gallery, image story, itinerary timeline, tips cards, and visitor-experience cards. Avoid KPI/statistics unless the user specifically asks for market data.',
    '- Transform raw content into visual presentation structures. Do not make every slide a bullet list.',
    '- Travel slides should use attraction cards, itinerary timelines, quick facts, destination galleries, and large image storytelling.',
    '- Education slides should use concept diagrams, process flows, comparison visuals, examples cards, and activity layouts.',
    '- Business slides should use KPI cards, timelines, roadmap visuals, benefit cards, and pricing/cost tables.',
    '- Generate presentation components, not bullets. Bullets are fallback content only.',
    '- At least 70% of non-cover slides must include 2-4 components and should not depend on bullets.',
    '',
    'Required JSON schema:',
    '{',
    '  "title": "string",',
    '  "subtitle": "string",',
    '  "theme": "travel | education | business | technology | healthcare | general",',
    '  "slides": [',
    '    {',
    '      "slideNumber": 1,',
    '      "title": "string",',
    '      "subtitle": "string",',
    '      "slideIntent": "cover | overview | attractions | destination | itinerary | culture | comparison | process | statistics | conclusion | objective | concept | examples | activity | problem | solution | benefits | timeline | cost | food | tips | experience",',
    '      "layout": "hero | image-left | image-right | cards | timeline | split | quote | closing",',
    '      "visualFormat": "cards | timeline | gallery | infographic | quickFacts | comparison | flow | imageStory | roadmap | matrix",',
    '      "imageQuery": "string",',
    '      "components": [',
    '        {',
    '          "type": "hero | metricCard | attractionCard | timelineItem | comparisonItem | galleryItem | quote | mapSection | processStep | checklistItem | kpiCard | contentCard",',
    '          "title": "string",',
    '          "description": "string",',
    '          "value": "optional short value for metric/KPI cards"',
    '        }',
    '      ],',
    '      "bullets": ["string", "string", "string"],',
    '      "speakerNote": "string"',
    '    }',
    '  ]',
    '}',
    '',
    'Output rules:',
    '- Return valid JSON parseable by JSON.parse.',
    '- slides.length must equal the requested exact slide count.',
    '- slideNumber must start at 1 and increase by 1.',
    '- Slide 1 must use slideIntent "cover" and layout "hero".',
    '- The final slide should use slideIntent "conclusion" and layout "closing".',
    '- Each slide should have 2-4 concise bullets, except cover slides may have 0-2.',
    '- imageQuery must be specific and useful for stock image search.',
    '- visualFormat must describe how the content should become visual: cards, timeline, gallery, infographic, quickFacts, comparison, flow, imageStory, roadmap, or matrix.',
    '- components must be the primary content for each slide. Use bullets only as fallback.',
    '- Travel components should be attractionCard, galleryItem, mapSection, timelineItem, checklistItem.',
    '- Education components should be contentCard, processStep, comparisonItem, checklistItem.',
    '- Business components should be kpiCard, metricCard, timelineItem, comparisonItem, checklistItem.',
    '- Never include internal labels such as Template Type, Visual Type, Layout Type, Primary Metric, Secondary Signal, or Key Takeaway in titles or bullets.',
  ].join('\n');
}

export function parsePresentationPlan(raw: string, fallbackTitle: string, requestedSlideCount: number): PresentationPlan {
  const parsed = safeJsonParse(extractJson(raw));
  const input = isRecord(parsed) ? parsed : {};
  const title = sanitizeText(input.title, fallbackTitle || 'AI Presentation');
  const subtitle = sanitizeText(input.subtitle, 'A polished presentation generated with AI Studio');
  const theme = normalizeTheme(input.theme, fallbackTitle);
  const sourceSlides = Array.isArray(input.slides) ? input.slides : [];
  const targetCount = Math.max(3, Math.min(30, requestedSlideCount || sourceSlides.length || 8));
  const weakRawPlan = isWeakRawPlan(sourceSlides, theme);

  const normalizedSlides = Array.from({ length: targetCount }, (_, index) => {
    const source = isRecord(sourceSlides[index]) ? sourceSlides[index] : {};
    return normalizeSlide(source, index, targetCount, title, theme);
  });
  const slides = applyDeckQualityRules(normalizedSlides, theme);

  if (sourceSlides.length === 0 || weakRawPlan || isWeakRepeatedPlan(slides, theme)) {
    return buildFallbackPlan(title, subtitle, fallbackTitle, theme, targetCount);
  }

  return {
    title,
    subtitle,
    theme,
    slides,
  };
}

function applyDeckQualityRules(slides: PresentationSlide[], theme: PresentationTheme): PresentationSlide[] {
  return slides.map((slide, index) => {
    if (index === 0 || index === slides.length - 1) return slide;

    let layout = slide.layout;
    let visualFormat = slide.visualFormat;
    let slideIntent = slide.slideIntent;
    let components = slide.components;

    if (theme === 'travel') {
      const hasTravelFriendlyIntent = isTravelFriendlyIntent(slideIntent);
      slideIntent = hasTravelFriendlyIntent ? slideIntent : travelIntentForIndex(index, slides.length);
      layout = hasTravelFriendlyIntent ? layout : normalizeLayout('', slideIntent, index, slides.length);
      visualFormat = hasTravelFriendlyIntent
        ? normalizeTravelVisualFormat(visualFormat, slideIntent)
        : normalizeVisualFormat('', slideIntent, layout, theme, index, slides.length);
      components = normalizeComponents(
        hasMetricComponents(slide.components) ? [] : slide.components,
        slide.bullets,
        slideIntent,
        visualFormat,
        theme
      );
    }

    const previous = slides[index - 1];
    const beforePrevious = slides[index - 2];

    if (previous && beforePrevious && previous.layout === layout && beforePrevious.layout === layout) {
      layout = alternateLayoutForIntent(slideIntent, index);
      visualFormat = normalizeVisualFormat('', slideIntent, layout, theme, index, slides.length);
    }

    if (previous && beforePrevious && previous.visualFormat === visualFormat && beforePrevious.visualFormat === visualFormat) {
      visualFormat = alternateVisualFormatForIntent(slideIntent, theme, index);
    }

    return {
      ...slide,
      slideIntent,
      layout,
      visualFormat,
      components,
    };
  });
}

function hasMetricComponents(components: SlideComponent[]) {
  return components.some((component) => component.type === 'metricCard' || component.type === 'kpiCard');
}

function isTravelFriendlyIntent(intent: SlideIntent) {
  return [
    'overview',
    'attractions',
    'destination',
    'itinerary',
    'culture',
    'food',
    'tips',
    'experience',
    'comparison',
    'timeline',
  ].includes(intent);
}

function normalizeTravelVisualFormat(visualFormat: SlideVisualFormat, intent: SlideIntent): SlideVisualFormat {
  if (visualFormat === 'quickFacts' && intent !== 'statistics') return 'cards';
  return visualFormat;
}

function alternateLayoutForIntent(intent: SlideIntent, index: number): SlideLayout {
  if (intent === 'itinerary' || intent === 'timeline') return 'timeline';
  if (intent === 'comparison') return 'split';
  if (intent === 'destination' || intent === 'culture' || intent === 'food' || intent === 'experience') {
    return index % 2 === 0 ? 'image-left' : 'image-right';
  }
  if (intent === 'conclusion') return 'closing';
  return index % 2 === 0 ? 'image-left' : 'cards';
}

function alternateVisualFormatForIntent(intent: SlideIntent, theme: PresentationTheme, index: number): SlideVisualFormat {
  if (intent === 'itinerary' || intent === 'timeline') return 'timeline';
  if (intent === 'comparison') return 'comparison';
  if (intent === 'process') return 'flow';
  if (theme === 'travel') {
    const formats: SlideVisualFormat[] = ['gallery', 'imageStory', 'timeline', 'cards'];
    return formats[index % formats.length];
  }
  return index % 2 === 0 ? 'cards' : 'infographic';
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

function cleanText(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned || fallback;
}

function sanitizeText(value: unknown, fallback = '') {
  const cleaned = stripUnsafePlanningText(cleanText(value, fallback));
  return cleaned || fallback;
}

function normalizeTheme(value: unknown, signal: string): PresentationTheme {
  if (typeof value === 'string' && themes.includes(value.toLowerCase() as PresentationTheme)) {
    return value.toLowerCase() as PresentationTheme;
  }

  const normalized = signal.toLowerCase();
  if (/(travel|tourism|destination|itinerary|trip|vacation|city|hotel|flight)/.test(normalized)) return 'travel';
  if (/(school|student|teacher|lesson|course|education|learning|classroom|university)/.test(normalized)) return 'education';
  if (/(health|healthcare|medical|patient|clinic|hospital|wellness|doctor|therapy|pharma)/.test(normalized)) return 'healthcare';
  if (/(software|technology|tech|ai|saas|data|platform|app|cyber|cloud|automation|digital)/.test(normalized)) return 'technology';
  if (/(proposal|business|sales|marketing|startup|investor|finance|strategy|company|product)/.test(normalized)) return 'business';
  return 'general';
}

function normalizeSlide(
  source: Record<string, unknown>,
  index: number,
  total: number,
  deckTitle: string,
  theme: PresentationTheme
): PresentationSlide {
  const slideNumber = index + 1;
  const fallbackTitle = defaultSlideTitle(theme, index, total);
  const title = sanitizeText(source.title, fallbackTitle);
  const subtitle = sanitizeText(source.subtitle, '');
  const rawIntent = typeof source.slideIntent === 'string' ? source.slideIntent.toLowerCase() : '';
  const rawLayout = typeof source.layout === 'string' ? source.layout.toLowerCase() : '';
  const rawVisualFormat = typeof source.visualFormat === 'string' ? source.visualFormat : '';
  const slideIntent = normalizeIntent(rawIntent, title, index, total, theme);
  const layout = normalizeLayout(rawLayout, slideIntent, index, total);
  const visualFormat = normalizeVisualFormat(rawVisualFormat, slideIntent, layout, theme, index, total);
  const imageQuery = sanitizeText(source.imageQuery, `${deckTitle} ${title}`).slice(0, 120);
  const bullets = normalizeBullets(source.bullets);
  const components = normalizeComponents(source.components, bullets, slideIntent, visualFormat, theme);
  const speakerNote = sanitizeText(source.speakerNote, subtitle || title);

  return {
    slideNumber,
    title,
    subtitle,
    slideIntent,
    layout,
    visualFormat,
    imageQuery,
    components,
    bullets,
    speakerNote,
  };
}

function normalizeVisualFormat(
  value: string,
  intent: SlideIntent,
  layout: SlideLayout,
  theme: PresentationTheme,
  index: number,
  total: number
): SlideVisualFormat {
  const normalized = value.replace(/\s+/g, '').toLowerCase();
  const matched = visualFormats.find((format) => format.toLowerCase() === normalized);

  if (matched) return matched;
  if (index === 0 || layout === 'hero') return 'imageStory';
  if (index === total - 1 || layout === 'closing') return 'imageStory';
  if (intent === 'itinerary' || intent === 'timeline') return 'timeline';
  if (layout === 'split' && /matrix/i.test(value)) return 'matrix';
  if (intent === 'comparison' || layout === 'split') return 'comparison';
  if (intent === 'process') return 'flow';
  if (intent === 'statistics' || intent === 'cost' || intent === 'tips') return 'quickFacts';
  if (theme === 'travel' && (intent === 'attractions' || intent === 'destination' || intent === 'culture' || intent === 'food' || intent === 'experience')) return 'gallery';
  if (theme === 'education' && (intent === 'concept' || intent === 'objective')) return 'infographic';
  if (theme === 'business' && (intent === 'benefits' || intent === 'solution' || intent === 'problem')) return 'cards';
  if (layout === 'image-left' || layout === 'image-right') return 'imageStory';
  return 'cards';
}

function normalizeIntent(value: string, title: string, index: number, total: number, theme: PresentationTheme): SlideIntent {
  if (index === 0) return 'cover';
  if (index === total - 1) return 'conclusion';
  if (intents.includes(value as SlideIntent)) return value as SlideIntent;
  if (theme === 'travel') return travelIntentForIndex(index, total);

  const signal = title.toLowerCase();
  if (/(itinerary|schedule|day by day|day-by-day)/.test(signal)) return 'itinerary';
  if (/(culture|tradition|local)/.test(signal)) return 'culture';
  if (/(food|cuisine|dining|restaurant)/.test(signal)) return 'food';
  if (/(budget|cost|price|pricing|plan)/.test(signal)) return theme === 'business' ? 'cost' : 'tips';
  if (/(attraction|landmark|sight|must-see|must see)/.test(signal)) return 'attractions';
  if (/(experience|adventure|activity|things to do)/.test(signal)) return 'experience';
  if (/(destination|city|cities|place|places|where to go)/.test(signal)) return 'destination';
  if (/(timeline|roadmap|milestone)/.test(signal)) return 'timeline';
  if (/(compare|comparison|versus| vs )/.test(signal)) return 'comparison';
  if (/(step|process|workflow|method|how it works)/.test(signal)) return 'process';
  if (/(statistic|metric|data|kpi|survey|performance)/.test(signal)) return 'statistics';
  if (/(objective|goal|learning outcome)/.test(signal)) return 'objective';
  if (/(concept|principle|explain|introduction)/.test(signal)) return 'concept';
  if (/(example|case|activity|exercise)/.test(signal)) return signal.includes('activity') ? 'activity' : 'examples';
  if (/(problem|challenge|pain)/.test(signal)) return 'problem';
  if (/(solution|approach)/.test(signal)) return 'solution';
  if (/(benefit|value|impact)/.test(signal)) return 'benefits';
  return 'overview';
}

function normalizeLayout(value: string, intent: SlideIntent, index: number, total: number): SlideLayout {
  if (index === 0) return 'hero';
  if (index === total - 1) return 'closing';
  if (layouts.includes(value as SlideLayout)) return value as SlideLayout;
  if (intent === 'timeline' || intent === 'itinerary') return 'timeline';
  if (intent === 'comparison') return 'split';
  if (intent === 'statistics') return 'cards';
  if (intent === 'process') return 'cards';
  if (intent === 'attractions') return 'cards';
  if (intent === 'destination' || intent === 'culture' || intent === 'food' || intent === 'experience') return index % 2 === 0 ? 'image-left' : 'image-right';
  if (intent === 'conclusion') return 'closing';
  return 'cards';
}

function normalizeBullets(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => sanitizeText(item))
    .filter(Boolean)
    .slice(0, 3);
}

function normalizeComponents(
  value: unknown,
  bullets: string[],
  intent: SlideIntent,
  visualFormat: SlideVisualFormat,
  theme: PresentationTheme
): SlideComponent[] {
  const explicitComponents = Array.isArray(value)
    ? value
        .filter(isRecord)
        .map((component) => {
          const type = normalizeComponentType(component.type, intent, visualFormat, theme);
          const title = sanitizeText(component.title);
          const description = sanitizeText(component.description);
          const valueText = sanitizeText(component.value);

          if (!title && !description && !valueText) return null;

          return {
            type,
            title: title || valueText || description,
            description: description || title || valueText,
            ...(valueText ? { value: valueText } : {}),
          };
        })
        .filter((component): component is SlideComponent => Boolean(component))
        .slice(0, 4)
    : [];

  if (explicitComponents.length > 0) return explicitComponents;

  return bullets.slice(0, 4).map((bullet, index) => ({
    type: fallbackComponentType(intent, visualFormat, theme),
    title: titleFromBullet(bullet, index),
    description: bullet,
  }));
}

function normalizeComponentType(value: unknown, intent: SlideIntent, visualFormat: SlideVisualFormat, theme: PresentationTheme): SlideComponentType {
  if (typeof value === 'string') {
    const normalized = value.replace(/\s+/g, '').toLowerCase();
    const matched = componentTypes.find((type) => type.toLowerCase() === normalized);
    if (matched) return matched;
  }

  return fallbackComponentType(intent, visualFormat, theme);
}

function fallbackComponentType(intent: SlideIntent, visualFormat: SlideVisualFormat, theme: PresentationTheme): SlideComponentType {
  if (intent === 'cover' || visualFormat === 'imageStory') return 'hero';
  if (visualFormat === 'timeline' || intent === 'itinerary' || intent === 'timeline') return 'timelineItem';
  if (visualFormat === 'comparison' || intent === 'comparison') return 'comparisonItem';
  if (visualFormat === 'flow' || intent === 'process') return 'processStep';
  if (visualFormat === 'quickFacts' || intent === 'statistics') return theme === 'business' ? 'kpiCard' : 'metricCard';
  if (visualFormat === 'gallery' || intent === 'attractions') return theme === 'travel' ? 'attractionCard' : 'galleryItem';
  if (intent === 'tips' || intent === 'activity' || intent === 'experience') return 'checklistItem';
  if (intent === 'cost') return 'kpiCard';
  return theme === 'travel' ? 'attractionCard' : 'contentCard';
}

function isWeakRawPlan(sourceSlides: unknown[], theme: PresentationTheme) {
  const rawSlides = sourceSlides.filter(isRecord);
  if (rawSlides.length < 3) return sourceSlides.length > 0;

  const middleSlides = rawSlides.slice(1, -1);
  const rawIntents = middleSlides.map((slide) => cleanText(slide.slideIntent).toLowerCase());
  const rawVisualFormats = middleSlides.map((slide) => cleanText(slide.visualFormat).toLowerCase());
  const statisticsCount = rawIntents.filter((intent) => intent === 'statistics' || intent.includes('statistic')).length;
  const quickFactCount = rawVisualFormats.filter((format) => format === 'quickfacts' || format.includes('quick')).length;

  if (middleSlides.length > 0 && statisticsCount === middleSlides.length) return true;
  if (theme === 'travel' && (statisticsCount > 0 || quickFactCount > Math.ceil(middleSlides.length / 3))) return true;

  return rawSlides.some((slide) => collectRawSlideText(slide).some(hasUnsafePlanningText));
}

function collectRawSlideText(slide: Record<string, unknown>) {
  const text: string[] = [
    cleanText(slide.title),
    cleanText(slide.subtitle),
    cleanText(slide.slideIntent),
    cleanText(slide.visualFormat),
    cleanText(slide.layout),
    cleanText(slide.imageQuery),
    cleanText(slide.speakerNote),
  ];

  if (Array.isArray(slide.bullets)) {
    text.push(...slide.bullets.map((item) => cleanText(item)));
  }

  if (Array.isArray(slide.components)) {
    slide.components.filter(isRecord).forEach((component) => {
      text.push(cleanText(component.type), cleanText(component.title), cleanText(component.description), cleanText(component.value));
    });
  }

  return text.filter(Boolean);
}

function isWeakRepeatedPlan(slides: PresentationSlide[], theme: PresentationTheme) {
  if (slides.length < 3) return true;

  const middleSlides = slides.slice(1, -1);
  if (middleSlides.length === 0) return false;

  const statisticsCount = middleSlides.filter((slide) => slide.slideIntent === 'statistics').length;
  const uniqueIntents = new Set(middleSlides.map((slide) => slide.slideIntent)).size;
  const uniqueTitles = new Set(middleSlides.map((slide) => slide.title.toLowerCase())).size;
  const quickFactCount = middleSlides.filter((slide) => slide.visualFormat === 'quickFacts').length;

  if (statisticsCount === middleSlides.length) return true;
  if (theme === 'travel' && (statisticsCount > 0 || quickFactCount > Math.ceil(middleSlides.length / 3))) return true;
  if (middleSlides.length >= 4 && uniqueIntents <= 2) return true;
  if (middleSlides.length >= 4 && uniqueTitles <= 2) return true;

  return slides.some((slide) => [
    slide.title,
    slide.subtitle,
    slide.speakerNote,
    ...slide.bullets,
    ...slide.components.flatMap((component) => [component.title, component.description, component.value || '']),
  ].some(hasUnsafePlanningText));
}

function buildFallbackPlan(title: string, subtitle: string, topic: string, theme: PresentationTheme, slideCount: number): PresentationPlan {
  return {
    title,
    subtitle,
    theme,
    slides: Array.from({ length: slideCount }, (_, index) => buildFallbackSlide(index, slideCount, title, topic, theme)),
    fallbackUsed: true,
  };
}

function buildFallbackSlide(index: number, total: number, deckTitle: string, topic: string, theme: PresentationTheme): PresentationSlide {
  const intent = fallbackIntent(theme, index, total);
  const title = fallbackSlideTitle(theme, intent, index, total);
  const subtitle = fallbackSubtitle(theme, intent, topic || deckTitle);
  const layout = normalizeLayout('', intent, index, total);
  const visualFormat = normalizeVisualFormat('', intent, layout, theme, index, total);
  const components = fallbackComponents(theme, intent, topic || deckTitle);
  const bullets = components.slice(0, 3).map((component) => component.title);

  return {
    slideNumber: index + 1,
    title,
    subtitle,
    slideIntent: intent,
    layout,
    visualFormat,
    imageQuery: `${topic || deckTitle} ${title}`.slice(0, 120),
    components,
    bullets,
    speakerNote: subtitle || title,
  };
}

function fallbackIntent(theme: PresentationTheme, index: number, total: number): SlideIntent {
  if (index === 0) return 'cover';
  if (index === total - 1) return 'conclusion';
  if (theme === 'travel') return travelIntentForIndex(index, total);

  const sequences: Record<PresentationTheme, SlideIntent[]> = {
    travel: ['overview', 'attractions', 'itinerary', 'culture', 'food', 'tips', 'experience'],
    education: ['objective', 'concept', 'process', 'examples', 'activity', 'overview'],
    business: ['problem', 'solution', 'benefits', 'timeline', 'cost', 'comparison'],
    technology: ['overview', 'concept', 'process', 'benefits', 'examples', 'timeline'],
    healthcare: ['overview', 'problem', 'solution', 'process', 'benefits', 'tips'],
    general: ['overview', 'concept', 'examples', 'comparison', 'tips', 'timeline'],
  };

  const sequence = sequences[theme];
  return sequence[(index - 1) % sequence.length];
}

function travelIntentForIndex(index: number, total: number): SlideIntent {
  const sequence: SlideIntent[] = ['overview', 'attractions', 'itinerary', 'culture', 'food', 'tips', 'experience'];
  const middleIndex = Math.max(0, index - 1);
  const middleCount = Math.max(1, total - 2);
  const scaledIndex = Math.min(sequence.length - 1, Math.floor((middleIndex / middleCount) * sequence.length));
  return sequence[scaledIndex];
}

function fallbackSlideTitle(theme: PresentationTheme, intent: SlideIntent, index: number, total: number) {
  if (index === 0) return 'Opening';
  if (index === total - 1) return 'Final Takeaway';

  const titles: Partial<Record<SlideIntent, string>> = {
    overview: 'Overview',
    attractions: theme === 'travel' ? 'Must-See Highlights' : 'Key Highlights',
    destination: 'Destination Snapshot',
    itinerary: theme === 'travel' ? 'Suggested Itinerary' : 'Timeline',
    culture: 'Culture and Local Context',
    food: 'Food and Dining',
    tips: theme === 'travel' ? 'Practical Tips' : 'Recommendations',
    experience: 'Memorable Experiences',
    objective: 'Learning Goals',
    concept: 'Core Concept',
    process: 'How It Works',
    examples: 'Examples',
    activity: 'Interactive Activity',
    problem: 'The Challenge',
    solution: 'The Solution',
    benefits: 'Benefits',
    timeline: 'Timeline',
    cost: 'Cost and Plan',
    comparison: 'Comparison',
  };

  return titles[intent] || defaultSlideTitle(theme, index, total);
}

function fallbackSubtitle(theme: PresentationTheme, intent: SlideIntent, topic: string) {
  if (intent === 'cover') return `A polished presentation about ${topic}`;
  if (intent === 'conclusion') return 'Clear next steps and final message';
  if (theme === 'travel') {
    const subtitles: Partial<Record<SlideIntent, string>> = {
      overview: 'Set the context before exploring the destination.',
      attractions: 'Show the places and experiences that make the trip worth taking.',
      itinerary: 'Organize the journey into a simple sequence.',
      culture: 'Bring local customs, rhythm, and atmosphere into view.',
      food: 'Highlight memorable cuisine and dining moments.',
      tips: 'Give the audience practical guidance they can use.',
      experience: 'End with the feeling and value of the trip.',
    };
    return subtitles[intent] || `Make ${topic} easy to understand and explore.`;
  }

  return `A clear, audience-ready section for ${topic}`;
}

function fallbackComponents(theme: PresentationTheme, intent: SlideIntent, topic: string): SlideComponent[] {
  if (intent === 'cover') {
    return [{ type: 'hero', title: topic, description: 'Presentation opening' }];
  }

  if (intent === 'conclusion') {
    return [
      { type: 'checklistItem', title: 'Remember the main idea', description: 'Close with the strongest audience takeaway.' },
      { type: 'checklistItem', title: 'Decide the next step', description: 'Make the follow-up action clear and practical.' },
    ];
  }

  const travelComponents: Partial<Record<SlideIntent, SlideComponent[]>> = {
    overview: [
      { type: 'contentCard', title: 'Why it matters', description: 'Frame the destination and its appeal.' },
      { type: 'contentCard', title: 'Best fit', description: 'Clarify who will enjoy this experience most.' },
      { type: 'contentCard', title: 'Trip mood', description: 'Set expectations for pace, style, and highlights.' },
    ],
    attractions: [
      { type: 'attractionCard', title: 'Signature landmark', description: 'Feature the most recognizable place to visit.' },
      { type: 'attractionCard', title: 'Local favorite', description: 'Add a more authentic stop or neighborhood.' },
      { type: 'attractionCard', title: 'Photo moment', description: 'Include a visual highlight for the deck.' },
    ],
    itinerary: [
      { type: 'timelineItem', title: 'Start', description: 'Arrival, orientation, and first highlight.' },
      { type: 'timelineItem', title: 'Explore', description: 'Main attractions and local experiences.' },
      { type: 'timelineItem', title: 'Wrap up', description: 'Final activity, shopping, or scenic close.' },
    ],
    culture: [
      { type: 'galleryItem', title: 'Local customs', description: 'Etiquette, traditions, and social norms.' },
      { type: 'galleryItem', title: 'Neighborhood feel', description: 'How the place looks, sounds, and moves.' },
      { type: 'galleryItem', title: 'Seasonal moments', description: 'Festivals, weather, or timing tips.' },
    ],
    food: [
      { type: 'galleryItem', title: 'Must-try dish', description: 'A cuisine highlight tied to the destination.' },
      { type: 'galleryItem', title: 'Dining style', description: 'Street food, cafes, markets, or fine dining.' },
      { type: 'galleryItem', title: 'Local flavor', description: 'Ingredients, rituals, or food culture.' },
    ],
    tips: [
      { type: 'checklistItem', title: 'Best time', description: 'When the audience should consider going.' },
      { type: 'checklistItem', title: 'Budget note', description: 'Set practical expectations without fake numbers.' },
      { type: 'checklistItem', title: 'Travel smart', description: 'Transport, booking, or safety guidance.' },
    ],
    experience: [
      { type: 'contentCard', title: 'What they will feel', description: 'Connect the destination to emotion and memory.' },
      { type: 'contentCard', title: 'What they will bring back', description: 'Summarize the lasting value of the trip.' },
      { type: 'contentCard', title: 'Why now', description: 'Give the journey a timely reason.' },
    ],
  };

  if (theme === 'travel') return travelComponents[intent] || travelComponents.overview || [];

  return [
    { type: fallbackComponentType(intent, 'cards', theme), title: fallbackSlideTitle(theme, intent, 1, 3), description: `Frame this section around ${topic}.` },
    { type: fallbackComponentType(intent, 'cards', theme), title: 'Audience value', description: 'Make the point useful, concrete, and easy to act on.' },
    { type: fallbackComponentType(intent, 'cards', theme), title: 'Practical takeaway', description: 'Close the slide with a clear takeaway.' },
  ];
}

function titleFromBullet(value: string, index: number) {
  const cleaned = stripUnsafePlanningText(value);
  const firstClause = cleaned.split(/[:.;-]/)[0]?.trim();
  return firstClause && firstClause.length <= 48 ? firstClause : `Item ${index + 1}`;
}

function stripUnsafePlanningText(value: string) {
  return value
    .replace(/\*+\s*:/g, ' ')
    .replace(/(?:^|\s)-\s*:\s*/g, ' ')
    .replace(/\b(?:Key Points?|Template(?: Type)?|Visual Direction|Visual Type|Layout Type|Primary Metric|Secondary Signal|Key Takeaway|Focus|Objective|Objectives|Option A|Option B|Statistics)\b\s*:?\s*/gi, '')
    .replace(/\bSlide\s+\d+\b\s*:?\s*/gi, '')
    .replace(/\s+\*+\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasUnsafePlanningText(value: string) {
  return /\b(?:Key Points?|Template(?: Type)?|Visual Direction|Visual Type|Layout Type|Primary Metric|Secondary Signal|Key Takeaway|Focus|Objective|Objectives|Option A|Option B|Statistics)\b\s*:?/i.test(value)
    || /\*+\s*:/.test(value)
    || /(?:^|\s)-\s*:\s*/.test(value);
}

function stripInternalLabels(value: string) {
  return value
    .replace(/(?:^|\s)(?:\*+|[-–—])\s*:\s*/g, ' ')
    .replace(/\b(?:Key Points?|Template(?: Type)?|Visual Direction|Visual Type|Layout Type|Primary Metric|Secondary Signal|Key Takeaway|Focus|Option A|Option B|Statistics)\b\s*:?\s*/gi, '')
    .replace(/\bSlide\s+\d+\b\s*:?\s*/gi, '')
    .replace(/\s+\*+\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasInternalPlanningText(value: string) {
  return /\b(?:Key Points?|Template(?: Type)?|Visual Direction|Visual Type|Layout Type|Primary Metric|Secondary Signal|Key Takeaway|Focus|Option A|Option B)\b\s*:?/i.test(value)
    || /(?:^|\s)(?:\*+|[-–—])\s*:\s*/.test(value);
}

function defaultSlideTitle(theme: PresentationTheme, index: number, total: number) {
  if (index === 0) return 'Cover';
  if (index === total - 1) return 'Conclusion';

  const sequences: Record<PresentationTheme, string[]> = {
    travel: ['Overview', 'Must-See Highlights', 'Itinerary', 'Culture', 'Food', 'Practical Tips', 'Memorable Experiences'],
    education: ['Learning Goals', 'Core Concept', 'How It Works', 'Examples', 'Activity', 'Summary'],
    business: ['Problem', 'Solution', 'Benefits', 'Timeline', 'Cost and Plan', 'Conclusion'],
    technology: ['Overview', 'Architecture', 'Use Cases', 'Workflow', 'Benefits', 'Next Steps'],
    healthcare: ['Overview', 'Patient Need', 'Care Model', 'Workflow', 'Benefits', 'Next Steps'],
    general: ['Overview', 'Key Ideas', 'Details', 'Examples', 'Plan', 'Conclusion'],
  };

  const sequence = sequences[theme];
  return sequence[(index - 1) % sequence.length];
}
