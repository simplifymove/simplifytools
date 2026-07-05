import type { PresentationSlide, PresentationTheme } from './presentationPlan';
import type { VisualDesignAgentOutput } from './visualDesignAgent';

export interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type LayoutName =
  | 'fullBleedHero'
  | 'galleryCards'
  | 'itineraryTimeline'
  | 'quickFacts'
  | 'conceptInfographic'
  | 'processFlow'
  | 'kpiCards'
  | 'roadmapTimeline'
  | 'twoColumnComparison'
  | 'imageStory'
  | 'componentCards';

export interface SlideLayoutDecision {
  layoutName: LayoutName;
  imagePlacement: LayoutRect;
  contentPlacement: LayoutRect;
  titlePlacement: LayoutRect;
  componentPlacement: LayoutRect[];
  maxTextItems: number;
  emphasisStyle: 'image-led' | 'component-led' | 'data-led' | 'story-led' | 'balanced';
}

interface LayoutEngineInput {
  slide: PresentationSlide;
  theme: PresentationTheme;
  visualDesign?: VisualDesignAgentOutput | null;
}

const slideBounds = {
  full: rect(0, 0, 13.33, 7.5),
  titleLeft: rect(0.72, 0.78, 7.5, 0.95),
  titleRight: rect(7.05, 0.82, 5.3, 0.95),
};

export function decideSlideLayout({ slide, theme, visualDesign }: LayoutEngineInput): SlideLayoutDecision {
  const design = visualDesign?.slideDesigns.find((item) => item.slideNumber === slide.slideNumber);
  const designSignal = `${design?.visualRole || ''} ${design?.layout || ''} ${design?.visualFormat || ''} ${design?.contentStructure || ''} ${design?.chartStrategy || ''} ${design?.compositionNotes || ''}`.toLowerCase();
  const layoutName = chooseLayoutName(slide, theme, designSignal);

  switch (layoutName) {
    case 'fullBleedHero':
      return {
        layoutName,
        imagePlacement: rect(7.95, 0.85, 4.55, 5.55),
        contentPlacement: rect(0.72, 2.05, 7.15, 3.95),
        titlePlacement: rect(0.72, 1.78, 7.35, 1.65),
        componentPlacement: [rect(0.72, 5.95, 6.8, 0.55)],
        maxTextItems: 1,
        emphasisStyle: 'image-led',
      };
    case 'galleryCards':
      return {
        layoutName,
        imagePlacement: rect(4.78, 2.0, 3.8, 3.85),
        contentPlacement: rect(0.72, 1.86, 11.85, 4.85),
        titlePlacement: slideBounds.titleLeft,
        componentPlacement: [rect(0.74, 2.45, 3.38, 3.25), rect(4.78, 2.05, 3.78, 3.7), rect(8.82, 2.45, 3.38, 3.25)],
        maxTextItems: 3,
        emphasisStyle: 'image-led',
      };
    case 'itineraryTimeline':
    case 'roadmapTimeline':
      return {
        layoutName,
        imagePlacement: rect(8.85, 1.45, 3.2, 2.45),
        contentPlacement: rect(0.8, 2.45, 11.35, 3.4),
        titlePlacement: slideBounds.titleLeft,
        componentPlacement: [rect(0.8, 2.05, 2.3, 0.9), rect(3.72, 4.05, 2.3, 0.9), rect(6.62, 2.05, 2.3, 0.9), rect(9.52, 4.05, 2.3, 0.9)],
        maxTextItems: 4,
        emphasisStyle: 'story-led',
      };
    case 'quickFacts':
      return {
        layoutName,
        imagePlacement: rect(8.65, 1.45, 3.55, 4.55),
        contentPlacement: rect(0.82, 1.95, 6.8, 4.35),
        titlePlacement: slideBounds.titleLeft,
        componentPlacement: [rect(0.82, 2.0, 6.8, 0.98), rect(0.82, 3.38, 6.8, 0.98), rect(0.82, 4.76, 6.8, 0.98)],
        maxTextItems: 3,
        emphasisStyle: 'data-led',
      };
    case 'conceptInfographic':
      return {
        layoutName,
        imagePlacement: rect(9.45, 4.95, 2.25, 1.35),
        contentPlacement: rect(0.85, 1.95, 11.1, 4.65),
        titlePlacement: slideBounds.titleLeft,
        componentPlacement: [rect(0.9, 2.05, 3.25, 1.2), rect(8.35, 2.05, 3.25, 1.2), rect(4.35, 5.25, 3.25, 1.2)],
        maxTextItems: 3,
        emphasisStyle: 'component-led',
      };
    case 'processFlow':
      return {
        layoutName,
        imagePlacement: rect(8.92, 1.48, 3.05, 2.45),
        contentPlacement: rect(0.85, 2.12, 10.95, 3.98),
        titlePlacement: slideBounds.titleLeft,
        componentPlacement: [rect(0.85, 2.85, 2.18, 1.7), rect(4.52, 2.85, 2.18, 1.7), rect(8.18, 2.85, 2.18, 1.7)],
        maxTextItems: 3,
        emphasisStyle: 'component-led',
      };
    case 'kpiCards':
      return {
        layoutName,
        imagePlacement: rect(9.35, 4.55, 2.55, 1.85),
        contentPlacement: rect(0.75, 1.9, 11.15, 4.7),
        titlePlacement: slideBounds.titleLeft,
        componentPlacement: [rect(0.75, 2.0, 3.55, 3.05), rect(4.9, 2.0, 3.55, 3.05), rect(9.05, 2.0, 3.55, 3.05)],
        maxTextItems: 3,
        emphasisStyle: 'data-led',
      };
    case 'twoColumnComparison':
      return {
        layoutName,
        imagePlacement: rect(9.83, 5.47, 1.95, 0.92),
        contentPlacement: rect(0.72, 1.85, 11.75, 4.75),
        titlePlacement: slideBounds.titleLeft,
        componentPlacement: [rect(0.72, 1.85, 5.72, 4.75), rect(6.75, 1.85, 5.72, 4.75)],
        maxTextItems: 4,
        emphasisStyle: 'balanced',
      };
    case 'imageStory':
      return {
        layoutName,
        imagePlacement: slide.layout === 'image-left' ? rect(0.72, 1.55, 5.18, 4.95) : rect(7.25, 1.55, 5.18, 4.95),
        contentPlacement: slide.layout === 'image-left' ? rect(7.05, 0.88, 5.1, 5.3) : rect(0.78, 0.88, 5.1, 5.3),
        titlePlacement: slide.layout === 'image-left' ? slideBounds.titleRight : rect(0.78, 0.88, 5.45, 0.95),
        componentPlacement: slide.layout === 'image-left' ? [rect(7.15, 3.42, 4.75, 1.35), rect(7.05, 5.45, 5.0, 0.72)] : [rect(0.88, 3.42, 4.75, 1.35), rect(0.78, 5.45, 5.0, 0.72)],
        maxTextItems: 2,
        emphasisStyle: 'image-led',
      };
    case 'componentCards':
    default:
      return {
        layoutName: 'componentCards',
        imagePlacement: rect(8.85, 1.25, 3.35, 2.25),
        contentPlacement: rect(0.78, 1.9, 11.65, 4.75),
        titlePlacement: slideBounds.titleLeft,
        componentPlacement: [rect(0.78, 3.45, 3.42, 2.18), rect(4.9, 3.45, 3.42, 2.18), rect(9.02, 3.45, 3.42, 2.18)],
        maxTextItems: 3,
        emphasisStyle: 'component-led',
      };
  }
}

function chooseLayoutName(slide: PresentationSlide, theme: PresentationTheme, designSignal: string): LayoutName {
  if (slide.slideIntent === 'cover' || slide.layout === 'hero') return 'fullBleedHero';
  if (slide.slideIntent === 'conclusion' || slide.layout === 'closing') return 'fullBleedHero';
  if (theme === 'travel' && (slide.slideIntent === 'itinerary' || designSignal.includes('itinerary'))) return 'itineraryTimeline';
  if (theme === 'travel' && (slide.slideIntent === 'attractions' || slide.slideIntent === 'destination' || slide.visualFormat === 'gallery' || designSignal.includes('gallery'))) return 'galleryCards';
  if (theme === 'travel' && (slide.slideIntent === 'food' || slide.slideIntent === 'culture' || slide.slideIntent === 'experience')) return 'imageStory';
  if (theme === 'travel' && slide.slideIntent === 'tips') return 'componentCards';
  if (theme === 'travel') return 'componentCards';
  if (slide.slideIntent === 'itinerary') return 'itineraryTimeline';
  if (slide.visualFormat === 'roadmap' || designSignal.includes('roadmap')) return 'roadmapTimeline';
  if (slide.visualFormat === 'matrix' || designSignal.includes('matrix')) return 'twoColumnComparison';
  if (slide.slideIntent === 'tips' || slide.slideIntent === 'cost' || slide.visualFormat === 'quickFacts') return 'quickFacts';
  if (theme === 'education' && (slide.slideIntent === 'concept' || slide.visualFormat === 'infographic')) return 'conceptInfographic';
  if (slide.slideIntent === 'process' || slide.visualFormat === 'flow') return 'processFlow';
  if (theme === 'business' && (slide.slideIntent === 'statistics' || slide.slideIntent === 'benefits')) return 'kpiCards';
  if (theme === 'business' && (slide.slideIntent === 'timeline' || designSignal.includes('roadmap'))) return 'roadmapTimeline';
  if (slide.slideIntent === 'comparison' || slide.visualFormat === 'comparison' || slide.layout === 'split') return 'twoColumnComparison';
  if (slide.slideIntent === 'experience' || slide.layout === 'image-left' || slide.layout === 'image-right' || slide.visualFormat === 'imageStory') return 'imageStory';
  return 'componentCards';
}

function rect(x: number, y: number, w: number, h: number): LayoutRect {
  return {
    x: round(x),
    y: round(y),
    w: Math.max(0.05, round(w)),
    h: Math.max(0.05, round(h)),
  };
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
