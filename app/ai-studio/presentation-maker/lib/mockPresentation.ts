import type { PresentationPlan, PresentationSlide } from './presentationPlan';
import type { VisualDesignAgentOutput } from './visualDesignAgent';

interface MockPresentationInput {
  topic: string;
  audience: string;
  tone: string;
  slideCount: number;
}

interface MockPresentationResult {
  outline: string;
  visualDesignPlan: VisualDesignAgentOutput;
}

type MockSlideTemplate = Omit<PresentationSlide, 'slideNumber'>;

// Development/testing only deterministic generator. This is used by the dev-only
// mock switch in PresentationMakerClient so local QA can test parsing/export.
export function buildMockPresentation({ topic, audience, tone, slideCount }: MockPresentationInput): MockPresentationResult {
  const safeSlideCount = Math.max(3, Math.min(30, slideCount || 10));
  const isHyderabadTourism = /hyderabad|tourism|travel|trip|city visit/i.test(topic);
  const plan = isHyderabadTourism
    ? buildHyderabadTourismPlan(topic, audience, tone, safeSlideCount)
    : buildBusinessFallbackPlan(topic, audience, tone, safeSlideCount);

  return {
    outline: JSON.stringify(plan),
    visualDesignPlan: buildMockVisualDesignPlan(plan),
  };
}

function buildHyderabadTourismPlan(topic: string, audience: string, tone: string, slideCount: number): PresentationPlan {
  return {
    title: topic || 'Hyderabad Tourism',
    subtitle: `A ${tone.toLowerCase()} short city trip guide for ${audience}`,
    theme: 'travel',
    slides: buildSlides([
      {
        title: 'Hyderabad Tourism',
        subtitle: 'Heritage, food, markets, and modern city moments in one short trip.',
        slideIntent: 'cover',
        layout: 'hero',
        visualFormat: 'imageStory',
        imageQuery: 'Hyderabad Charminar tourism city skyline',
        components: [{ type: 'hero', title: 'Hyderabad', description: 'A compact travel story for a memorable city visit.' }],
        bullets: ['Heritage landmarks', 'Food culture', 'Local experiences'],
        speakerNote: 'Open with the promise of a rich but manageable short city trip.',
      },
      {
        title: 'Trip At A Glance',
        subtitle: 'Orient visitors before they start choosing stops.',
        slideIntent: 'overview',
        layout: 'cards',
        visualFormat: 'cards',
        imageQuery: 'Hyderabad city overview travel',
        components: [
          { type: 'contentCard', title: 'Best fit', description: 'First-time visitors who want heritage, food, and markets.' },
          { type: 'contentCard', title: 'Trip rhythm', description: 'Cluster nearby stops to keep the visit relaxed.' },
          { type: 'contentCard', title: 'Core promise', description: 'A layered city experience without overpacking the schedule.' },
        ],
        bullets: ['First-time visitor friendly', 'Cluster stops by area', 'Balance landmarks and food'],
        speakerNote: 'Use this as an agenda-style intro, not a dense facts slide.',
      },
      {
        title: 'Iconic Heritage Gallery',
        subtitle: 'The landmarks that make Hyderabad instantly recognizable.',
        slideIntent: 'attractions',
        layout: 'cards',
        visualFormat: 'gallery',
        imageQuery: 'Charminar Golconda Fort Salar Jung Museum Hyderabad',
        components: [
          { type: 'attractionCard', title: 'Charminar', description: 'The classic old-city opening scene.' },
          { type: 'attractionCard', title: 'Golconda Fort', description: 'A dramatic heritage stop with big views.' },
          { type: 'attractionCard', title: 'Salar Jung Museum', description: 'A slower cultural stop for history lovers.' },
        ],
        bullets: ['Charminar', 'Golconda Fort', 'Salar Jung Museum'],
        speakerNote: 'Show these as a gallery of anchor experiences.',
      },
      {
        title: 'Two-Day Itinerary',
        subtitle: 'A simple sequence keeps the trip rich without feeling rushed.',
        slideIntent: 'itinerary',
        layout: 'timeline',
        visualFormat: 'timeline',
        imageQuery: 'Hyderabad travel itinerary old city fort food',
        components: [
          { type: 'timelineItem', title: 'Morning: Old City', description: 'Start with Charminar and nearby markets.' },
          { type: 'timelineItem', title: 'Afternoon: Fort or museum', description: 'Choose one deeper heritage stop.' },
          { type: 'timelineItem', title: 'Evening: Food trail', description: 'Make dinner part of the destination.' },
          { type: 'timelineItem', title: 'Next day: Lake or neighborhood', description: 'Add a lighter modern-city moment.' },
        ],
        bullets: ['Old City first', 'One deep heritage stop', 'Food in the evening'],
        speakerNote: 'Use a timeline so the audience sees flow instead of a checklist.',
      },
      {
        title: 'Old-City Atmosphere',
        subtitle: 'The memorable moments often happen between the landmarks.',
        slideIntent: 'culture',
        layout: 'image-left',
        visualFormat: 'imageStory',
        imageQuery: 'Hyderabad old city bazaar culture',
        components: [
          { type: 'galleryItem', title: 'Bazaars', description: 'Color, craft, movement, and local browsing.' },
          { type: 'galleryItem', title: 'Architecture', description: 'Arches, lanes, and historic details.' },
        ],
        bullets: ['Walk slowly', 'Notice craft and architecture'],
        speakerNote: 'Make the slide experiential and visual-led.',
      },
      {
        title: 'Food Trail',
        subtitle: 'Food is not a side activity in Hyderabad; it is part of the destination.',
        slideIntent: 'food',
        layout: 'cards',
        visualFormat: 'gallery',
        imageQuery: 'Hyderabad biryani Irani chai food tourism',
        components: [
          { type: 'galleryItem', title: 'Biryani', description: 'The signature meal visitors expect.' },
          { type: 'galleryItem', title: 'Irani chai', description: 'A relaxed cafe pause.' },
          { type: 'galleryItem', title: 'Street snacks', description: 'An easy way to add variety.' },
        ],
        bullets: ['Biryani', 'Irani chai', 'Street snacks'],
        speakerNote: 'Use a food gallery instead of fake metrics.',
      },
      {
        title: 'Smart Visitor Tips',
        subtitle: 'A few choices make the short trip smoother.',
        slideIntent: 'tips',
        layout: 'cards',
        visualFormat: 'cards',
        imageQuery: 'Hyderabad travel tips tourists',
        components: [
          { type: 'checklistItem', title: 'Group stops by area', description: 'Reduce cross-city travel time.' },
          { type: 'checklistItem', title: 'Start early', description: 'Beat crowds and leave room for food stops.' },
          { type: 'checklistItem', title: 'Keep evenings flexible', description: 'Use dinner and markets as the day close.' },
        ],
        bullets: ['Group stops', 'Start early', 'Stay flexible'],
        speakerNote: 'Keep this practical and easy to act on.',
      },
      {
        title: 'Choose Your Trip Style',
        subtitle: 'Different visitors can shape the same city into different experiences.',
        slideIntent: 'comparison',
        layout: 'split',
        visualFormat: 'matrix',
        imageQuery: 'Hyderabad tourism experiences comparison',
        components: [
          { type: 'comparisonItem', title: 'Heritage-first', description: 'Prioritize Charminar, Golconda, and museum time.' },
          { type: 'comparisonItem', title: 'Food-first', description: 'Build the route around biryani, cafes, and snack stops.' },
          { type: 'comparisonItem', title: 'Market-first', description: 'Spend more time around Laad Bazaar and local finds.' },
          { type: 'comparisonItem', title: 'Balanced', description: 'Mix one landmark cluster with one food or market moment.' },
        ],
        bullets: ['Heritage-first', 'Food-first', 'Balanced'],
        speakerNote: 'Use this as a simple decision matrix.',
      },
      {
        title: 'Shopping And Local Finds',
        subtitle: 'Markets turn the visit into something tactile and personal.',
        slideIntent: 'experience',
        layout: 'image-right',
        visualFormat: 'imageStory',
        imageQuery: 'Laad Bazaar Hyderabad pearls bangles',
        components: [
          { type: 'contentCard', title: 'Laad Bazaar', description: 'Bangles, color, and old-city browsing.' },
          { type: 'contentCard', title: 'Pearls', description: 'A classic Hyderabad souvenir category.' },
          { type: 'contentCard', title: 'Local crafts', description: 'Small finds that make the trip memorable.' },
        ],
        bullets: ['Laad Bazaar', 'Pearls', 'Local crafts'],
        speakerNote: 'Connect shopping to memory and local atmosphere.',
      },
      {
        title: 'Final Trip Takeaway',
        subtitle: 'Hyderabad is strongest when visitors balance landmarks, food, and local atmosphere.',
        slideIntent: 'conclusion',
        layout: 'closing',
        visualFormat: 'imageStory',
        imageQuery: 'Hyderabad tourism evening city',
        components: [
          { type: 'checklistItem', title: 'See the icons', description: 'Anchor the trip with Charminar and Golconda.' },
          { type: 'checklistItem', title: 'Taste the city', description: 'Plan food as a core experience.' },
          { type: 'checklistItem', title: 'Leave room to wander', description: 'Markets and streets create the memory.' },
        ],
        bullets: ['See the icons', 'Taste the city', 'Leave room to wander'],
        speakerNote: 'End with a simple short-trip formula.',
      },
    ], slideCount),
  };
}

function buildBusinessFallbackPlan(topic: string, audience: string, tone: string, slideCount: number): PresentationPlan {
  const title = topic || 'Business Strategy Presentation';

  return {
    title,
    subtitle: `A ${tone.toLowerCase()} strategy deck for ${audience}`,
    theme: 'business',
    slides: buildSlides([
      {
        title,
        subtitle: 'A clear strategy story with decision-ready structure.',
        slideIntent: 'cover',
        layout: 'hero',
        visualFormat: 'imageStory',
        imageQuery: `${title} business strategy`,
        components: [{ type: 'hero', title, description: 'A structured business presentation mock.' }],
        bullets: ['Context', 'Choices', 'Action'],
        speakerNote: 'Open with a confident strategy framing.',
      },
      {
        title: 'Executive Agenda',
        subtitle: 'Set up the decision path before diving into details.',
        slideIntent: 'overview',
        layout: 'cards',
        visualFormat: 'cards',
        imageQuery: `${title} executive agenda`,
        components: [
          { type: 'contentCard', title: 'Context', description: 'What the audience needs to understand first.' },
          { type: 'contentCard', title: 'Options', description: 'The tradeoffs and choices ahead.' },
          { type: 'contentCard', title: 'Action', description: 'The recommended path forward.' },
        ],
        bullets: ['Context', 'Options', 'Action'],
        speakerNote: 'Use this as an agenda-style intro.',
      },
      {
        title: 'Market Signals',
        subtitle: 'Turn broad context into business-relevant signals.',
        slideIntent: 'problem',
        layout: 'cards',
        visualFormat: 'gallery',
        imageQuery: `${title} market signals`,
        components: [
          { type: 'contentCard', title: 'Customer pressure', description: 'What users or buyers are asking for.' },
          { type: 'contentCard', title: 'Competitive movement', description: 'Where alternatives are gaining attention.' },
          { type: 'contentCard', title: 'Timing window', description: 'Why action matters now.' },
        ],
        bullets: ['Customer pressure', 'Competitive movement', 'Timing window'],
        speakerNote: 'Keep this qualitative unless real numbers are provided.',
      },
      {
        title: 'Recommended Direction',
        subtitle: 'Define the strategic move in plain language.',
        slideIntent: 'solution',
        layout: 'image-right',
        visualFormat: 'imageStory',
        imageQuery: `${title} strategic direction`,
        components: [
          { type: 'contentCard', title: 'Priority', description: 'Prioritize the highest-value audience need.' },
          { type: 'contentCard', title: 'Differentiation', description: 'Make the offer easier to understand and choose.' },
        ],
        bullets: ['Prioritize the offer', 'Clarify differentiation'],
        speakerNote: 'Make the recommendation feel decisive.',
      },
      {
        title: 'Execution Roadmap',
        subtitle: 'Sequence the work so teams know what happens first.',
        slideIntent: 'timeline',
        layout: 'timeline',
        visualFormat: 'roadmap',
        imageQuery: `${title} execution roadmap`,
        components: [
          { type: 'timelineItem', title: 'Phase 1', description: 'Validate priorities and define owners.' },
          { type: 'timelineItem', title: 'Phase 2', description: 'Build core assets and operating rhythm.' },
          { type: 'timelineItem', title: 'Phase 3', description: 'Launch, measure, and refine.' },
        ],
        bullets: ['Validate', 'Build', 'Launch'],
        speakerNote: 'Use a roadmap timeline, not dense bullets.',
      },
      {
        title: 'Decision Matrix',
        subtitle: 'Compare options by fit, effort, and expected value.',
        slideIntent: 'comparison',
        layout: 'split',
        visualFormat: 'matrix',
        imageQuery: `${title} decision matrix`,
        components: [
          { type: 'comparisonItem', title: 'Fast win', description: 'Low effort and useful for near-term momentum.' },
          { type: 'comparisonItem', title: 'Strategic bet', description: 'Higher effort with stronger long-term value.' },
          { type: 'comparisonItem', title: 'Operational fix', description: 'Improves delivery quality and team confidence.' },
          { type: 'comparisonItem', title: 'Defer', description: 'Keep visible but outside the immediate plan.' },
        ],
        bullets: ['Fast win', 'Strategic bet', 'Operational fix'],
        speakerNote: 'Use this as a matrix/comparison slide.',
      },
      {
        title: 'Customer Value Cards',
        subtitle: 'Translate the plan into audience-facing benefits.',
        slideIntent: 'benefits',
        layout: 'cards',
        visualFormat: 'cards',
        imageQuery: `${title} customer value`,
        components: [
          { type: 'contentCard', title: 'Clearer choice', description: 'The offer becomes easier to evaluate.' },
          { type: 'contentCard', title: 'Lower friction', description: 'Customers need fewer steps to see value.' },
          { type: 'contentCard', title: 'Better confidence', description: 'The story supports decision making.' },
        ],
        bullets: ['Clearer choice', 'Lower friction', 'Better confidence'],
        speakerNote: 'Keep benefits concrete and audience-ready.',
      },
      {
        title: 'Operating Tips',
        subtitle: 'Make the plan easier to manage after approval.',
        slideIntent: 'tips',
        layout: 'cards',
        visualFormat: 'cards',
        imageQuery: `${title} operating tips`,
        components: [
          { type: 'checklistItem', title: 'Assign owners', description: 'Every workstream needs a clear accountable lead.' },
          { type: 'checklistItem', title: 'Review weekly', description: 'Use a steady cadence to remove blockers.' },
          { type: 'checklistItem', title: 'Measure learning', description: 'Track signals that improve the next decision.' },
        ],
        bullets: ['Assign owners', 'Review weekly', 'Measure learning'],
        speakerNote: 'Use practical cards instead of a dense operating slide.',
      },
      {
        title: 'Stakeholder Story',
        subtitle: 'Show how the plan lands for the people who matter.',
        slideIntent: 'experience',
        layout: 'image-left',
        visualFormat: 'imageStory',
        imageQuery: `${title} stakeholders`,
        components: [
          { type: 'contentCard', title: 'Leaders', description: 'See a clear decision and path to value.' },
          { type: 'contentCard', title: 'Teams', description: 'Understand priorities and execution rhythm.' },
        ],
        bullets: ['Leadership clarity', 'Team alignment'],
        speakerNote: 'Make the business plan feel human and actionable.',
      },
      {
        title: 'Final Recommendation',
        subtitle: 'Close with the decision, next step, and ownership model.',
        slideIntent: 'conclusion',
        layout: 'closing',
        visualFormat: 'imageStory',
        imageQuery: `${title} recommendation`,
        components: [
          { type: 'checklistItem', title: 'Approve direction', description: 'Confirm the recommended path.' },
          { type: 'checklistItem', title: 'Start phase one', description: 'Begin with validation and owner assignment.' },
          { type: 'checklistItem', title: 'Review progress', description: 'Use a clear milestone cadence.' },
        ],
        bullets: ['Approve direction', 'Start phase one', 'Review progress'],
        speakerNote: 'End with a clean action-oriented close.',
      },
    ], slideCount),
  };
}

function buildSlides(templates: MockSlideTemplate[], slideCount: number): PresentationSlide[] {
  if (slideCount <= 1) {
    return [];
  }

  const cover = templates[0];
  const conclusion = templates[templates.length - 1];
  const middleTemplates = templates.slice(1, -1);
  const middleCount = Math.max(0, slideCount - 2);
  const middleSlides = Array.from({ length: middleCount }, (_, index) => {
    const template = middleTemplates[index % middleTemplates.length];
    const cycle = Math.floor(index / middleTemplates.length);
    const title = cycle === 0 ? template.title : `${template.title} ${cycle + 1}`;

    return {
      ...template,
      title,
      imageQuery: cycle === 0 ? template.imageQuery : `${template.imageQuery} ${cycle + 1}`,
    };
  });

  return [cover, ...middleSlides, conclusion].map((slide, index) => ({
    ...slide,
    slideNumber: index + 1,
  }));
}

function buildMockVisualDesignPlan(plan: PresentationPlan): VisualDesignAgentOutput {
  return {
    designTheme: `${plan.theme} QA mock`,
    visualStyle: 'Deterministic QA-only visual variety',
    typographyStyle: 'Clean presentation hierarchy',
    colorMood: plan.theme === 'travel' ? 'Heritage travel accents' : 'Executive contrast',
    slideDesigns: plan.slides.map((slide) => ({
      slideNumber: slide.slideNumber,
      visualRole: slide.slideIntent,
      layout: slide.layout,
      visualFormat: slide.visualFormat,
      contentStructure: slide.visualFormat,
      needsImage: slide.layout === 'hero' || slide.layout === 'image-left' || slide.layout === 'image-right' || slide.visualFormat === 'gallery',
      imageStrategy: 'QA mock image query with normal stock-image fallback behavior.',
      chartStrategy: slide.visualFormat === 'matrix' || slide.visualFormat === 'roadmap' ? slide.visualFormat : 'No chart required.',
      compositionNotes: 'QA-only deterministic design plan. Uses the same export renderer as real AI output.',
    })),
  };
}
