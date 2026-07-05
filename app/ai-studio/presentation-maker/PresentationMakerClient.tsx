'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import pptxgen from 'pptxgenjs';
import {
  AlertCircle,
  ArrowUp,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Loader,
  Presentation,
  Sparkles,
  Table2,
  WandSparkles,
} from 'lucide-react';
import { HomeHeader } from '@/app/components/HomeHeader';
import {
  parsePresentationPlan,
  type SlideComponent,
  type PresentationSlide,
} from './lib/presentationPlan';
import { type VisualDesignAgentOutput } from './lib/visualDesignAgent';
import { decideSlideLayout, type SlideLayoutDecision } from './lib/layoutEngine';

const isDevelopment = process.env.NODE_ENV === 'development';

interface AiStudioGenerateResponse {
  outline?: string;
  visualDesignPlan?: VisualDesignAgentOutput;
  creditsUsed?: number;
  wallet?: AiStudioWalletSummary;
  error?: string;
}

interface StockImageResponse {
  imageUrl?: string;
  photographer?: string;
  error?: string;
}

interface AiStudioWalletSummary {
  balanceCredits: number;
  reservedCredits: number;
  lifetimeCreditsAdded: number;
  lifetimeCreditsUsed: number;
}

interface AiStudioWalletResponse {
  wallet?: AiStudioWalletSummary;
  error?: string;
}

interface AiStudioEstimateResponse {
  estimatedCredits?: number;
  slideCount?: number;
  error?: string;
}

interface ResolvedStockImage {
  dataUrl: string;
  photographer?: string;
}

interface ExamplePrompt {
  label: string;
  prompt: string;
  audience: string;
  tone: string;
  slides: string;
}

const toneOptions = ['Professional', 'Persuasive', 'Executive', 'Friendly', 'Educational', 'Inspirational'];

const progressSteps = [
  'Understanding topic',
  'Researching structure',
  'Building storyline',
  'Planning visuals',
  'Creating slides',
  'Preparing export',
];

const aiServiceUnavailableMessage = 'AI service is currently unavailable. Please try again later.';

const examplePrompts: ExamplePrompt[] = [
  {
    label: 'Investor pitch deck',
    prompt: 'Create a Series A pitch deck for a B2B analytics startup that helps revenue teams forecast pipeline risk.',
    audience: 'Series A investors',
    tone: 'Persuasive',
    slides: '12',
  },
  {
    label: 'Product launch story',
    prompt: 'Build a launch presentation for an AI meeting assistant entering a crowded productivity market.',
    audience: 'Executive leadership and go-to-market teams',
    tone: 'Executive',
    slides: '10',
  },
  {
    label: 'Marketing strategy',
    prompt: 'Create a quarterly marketing plan presentation for a cybersecurity SaaS company targeting mid-market IT teams.',
    audience: 'CMO, sales leaders, and campaign owners',
    tone: 'Professional',
    slides: '9',
  },
  {
    label: 'Education deck',
    prompt: 'Design an education presentation that teaches high school students how renewable energy grids work.',
    audience: 'High school students',
    tone: 'Educational',
    slides: '8',
  },
];

const premiumPresentationFeatures = [
  'AI-powered content planning',
  'Smart visual layouts',
  'PPTX export',
  'Professional themes',
  'Images and visual storytelling',
];

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Unable to read image data'));
      }
    };
    reader.onerror = () => reject(new Error('Unable to read image data'));
    reader.readAsDataURL(blob);
  });
}

async function resolveStockImage(query: string): Promise<ResolvedStockImage | null> {
  try {
    const stockResponse = await fetch('/api/ai/stock-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!stockResponse.ok) {
      return null;
    }

    const stockData = (await stockResponse.json()) as StockImageResponse;

    if (!stockData.imageUrl) {
      return null;
    }

    const imageResponse = await fetch(stockData.imageUrl);

    if (!imageResponse.ok) {
      return null;
    }

    const blob = await imageResponse.blob();

    if (!blob.type.startsWith('image/')) {
      return null;
    }

    const dataUrl = await blobToDataUrl(blob);

    return {
      dataUrl,
      photographer: stockData.photographer,
    };
  } catch {
    return null;
  }
}

function truncateText(text: string, maxLength: number) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 3).trim()}...` : text;
}

function buildFileName(prompt: string) {
  const fallback = 'ai-studio-presentation';
  const baseName = prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);

  return `${baseName || fallback}.pptx`;
}

function shortPhrase(text: string, maxLength = 72) {
  return truncateText(text.replace(/\s+/g, ' ').trim(), maxLength);
}

function selectTheme(prompt: string, toneValue: string) {
  const signal = `${prompt} ${toneValue}`.toLowerCase();

  if (signal.includes('creative') || signal.includes('brand') || signal.includes('design') || signal.includes('inspirational')) {
    return {
      name: 'Creative Purple',
      dark: '1E1238',
      primary: '7C3AED',
      secondary: 'C026D3',
      soft: 'F5F3FF',
      softer: 'FAE8FF',
      text: '111827',
      muted: '64748B',
      light: 'FFFFFF',
    };
  }

  if (signal.includes('sustain') || signal.includes('health') || signal.includes('growth') || signal.includes('education') || signal.includes('environment')) {
    return {
      name: 'Emerald Green',
      dark: '052E2B',
      primary: '059669',
      secondary: '10B981',
      soft: 'ECFDF5',
      softer: 'D1FAE5',
      text: '0F172A',
      muted: '475569',
      light: 'FFFFFF',
    };
  }

  if (signal.includes('executive') || signal.includes('premium') || signal.includes('finance') || signal.includes('board')) {
    return {
      name: 'Dark Premium',
      dark: '080A12',
      primary: '0E7490',
      secondary: '38BDF8',
      soft: 'E0F2FE',
      softer: 'F8FAFC',
      text: '0F172A',
      muted: '64748B',
      light: 'FFFFFF',
    };
  }

  return {
    name: 'Corporate Blue',
    dark: '0B1B3A',
    primary: '2563EB',
    secondary: '06B6D4',
    soft: 'EFF6FF',
    softer: 'ECFEFF',
    text: '0F172A',
    muted: '475569',
    light: 'FFFFFF',
  };
}

function detectPromptDomain(prompt: string) {
  const signal = prompt.toLowerCase();

  if (/(school|student|teacher|lesson|course|education|university|learning|classroom)/.test(signal)) {
    return 'education';
  }

  if (/(travel|tourism|hotel|flight|destination|itinerary|trip|airport|vacation)/.test(signal)) {
    return 'travel';
  }

  if (/(health|healthcare|medical|patient|clinic|hospital|wellness|doctor|therapy|pharma)/.test(signal)) {
    return 'healthcare';
  }

  if (/(software|technology|tech|ai|saas|data|platform|app|cyber|cloud|automation|digital)/.test(signal)) {
    return 'technology';
  }

  return 'business';
}

export default function PresentationMakerClient() {
  const [topic, setTopic] = useState('');
  const [slideCount, setSlideCount] = useState('10');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('Professional');
  const [outline, setOutline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [expandedSlides, setExpandedSlides] = useState<Record<string, boolean>>({});
  const [visualDesignPlan, setVisualDesignPlan] = useState<VisualDesignAgentOutput | null>(null);
  const [useMockAI, setUseMockAI] = useState(false);
  const [wallet, setWallet] = useState<AiStudioWalletSummary | null>(null);
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletMessage, setWalletMessage] = useState('');
  const [estimatedCredits, setEstimatedCredits] = useState<number | null>(null);
  const [lastCreditsUsed, setLastCreditsUsed] = useState<number | null>(null);
  const [lastRemainingCredits, setLastRemainingCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!loading) {
      setProgressIndex(0);
      return;
    }

    const intervalId = window.setInterval(() => {
      setProgressIndex((currentStep) => Math.min(currentStep + 1, progressSteps.length - 1));
    }, 1200);

    return () => window.clearInterval(intervalId);
  }, [loading]);

  useEffect(() => {
    let isMounted = true;

    const loadWallet = async () => {
      try {
        const response = await fetch('/api/ai-studio/wallet');

        if (response.status === 401) {
          if (isMounted) {
            setWallet(null);
            setWalletMessage('Sign in with a premium-enabled account to view AI Studio credits.');
          }
          return;
        }

        if (!response.ok) {
          throw new Error('Unable to load wallet');
        }

        const data = (await response.json()) as AiStudioWalletResponse;

        if (isMounted) {
          setWallet(data.wallet ?? null);
          setWalletMessage('');
        }
      } catch {
        if (isMounted) {
          setWallet(null);
          setWalletMessage('AI Studio credit balance is unavailable right now.');
        }
      } finally {
        if (isMounted) {
          setWalletLoading(false);
        }
      }
    };

    loadWallet();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadEstimate = async () => {
      try {
        const response = await fetch('/api/ai-studio/estimate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slideCount }),
        });

        if (!response.ok) {
          throw new Error('Unable to estimate credits');
        }

        const data = (await response.json()) as AiStudioEstimateResponse;

        if (isMounted) {
          setEstimatedCredits(typeof data.estimatedCredits === 'number' ? data.estimatedCredits : null);
        }
      } catch {
        if (isMounted) {
          setEstimatedCredits(null);
        }
      }
    };

    loadEstimate();

    return () => {
      isMounted = false;
    };
  }, [slideCount]);

  const applyExample = (example: ExamplePrompt) => {
    setTopic(example.prompt);
    setAudience(example.audience);
    setTone(example.tone);
    setSlideCount(example.slides);
    setError('');
  };

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTopic = topic.trim();
    const trimmedAudience = audience.trim();
    const slideTotal = Number(slideCount);

    if (!trimmedTopic) {
      setError('Describe the presentation you want to create.');
      return;
    }

    if (!Number.isInteger(slideTotal) || slideTotal < 3 || slideTotal > 30) {
      setError('Choose a slide count between 3 and 30.');
      return;
    }

    if (!trimmedAudience) {
      setError('Add the intended audience so the outline has the right level and angle.');
      return;
    }

    if (!(isDevelopment && useMockAI) && hasInsufficientCredits) {
      setError('Insufficient AI credits. Buy or renew a plan to continue generating presentations.');
      return;
    }

    setLoading(true);
    setProgressIndex(0);
    setError('');
    setOutline('');
    setVisualDesignPlan(null);
    setLastCreditsUsed(null);
    setLastRemainingCredits(null);

    try {
      if (isDevelopment && useMockAI) {
        // Development/testing only: deterministic mock output for QA without calling external AI services.
        // Export still uses the same outline parsing and PPTX rendering path as real AI output.
        setProgressIndex(5);
        const { buildMockPresentation } = await import('./lib/mockPresentation');
        const mockPresentation = buildMockPresentation({
          topic: trimmedTopic,
          audience: trimmedAudience,
          tone,
          slideCount: slideTotal,
        });

        setVisualDesignPlan(mockPresentation.visualDesignPlan);
        setOutline(mockPresentation.outline);
        setExpandedSlides({ '1': true });
        return;
      }

      setProgressIndex(1);
      const response = await fetch('/api/ai-studio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: trimmedTopic,
          slideCount,
          audience: trimmedAudience,
          tone,
        }),
      });

      const data = (await response.json()) as AiStudioGenerateResponse;

      if (!response.ok) {
        if (data.wallet) {
          setWallet(data.wallet);
        }
        setError(response.status === 402 ? data.error || 'Insufficient AI credits.' : aiServiceUnavailableMessage);
        return;
      }

      if (!data.outline) {
        setError('The AI returned an empty outline. Try adding more context to your brief.');
        return;
      }

      setProgressIndex(5);
      setVisualDesignPlan(data.visualDesignPlan ?? null);
      setOutline(data.outline);
      setExpandedSlides({ '1': true });
      if (data.wallet) {
        setWallet(data.wallet);
        setLastRemainingCredits(data.wallet.balanceCredits);
      }
      if (typeof data.creditsUsed === 'number') {
        setLastCreditsUsed(data.creditsUsed);
      }
    } catch {
      setError(aiServiceUnavailableMessage);
    } finally {
      setLoading(false);
    }
  };

  const presentationPlan = outline ? parsePresentationPlan(outline, topic.trim(), Number(slideCount)) : null;
  const hasInsufficientCredits =
    wallet !== null && estimatedCredits !== null && wallet.balanceCredits < estimatedCredits;

  const toggleSlide = (slideNumber: number) => {
    setExpandedSlides((current) => ({
      ...current,
      [String(slideNumber)]: !current[String(slideNumber)],
    }));
  };

  const handleDownloadPptx = async () => {
    if (!presentationPlan || presentationPlan.slides.length === 0) {
      setError('Generate structured slide cards before downloading a PPTX.');
      return;
    }

    setExporting(true);
    setError('');

    try {
      const exportPlan = parsePresentationPlan(JSON.stringify(presentationPlan), topic.trim(), Number(slideCount));
      const requestedSlideTotal = Math.max(3, Math.min(30, Number(slideCount) || exportPlan.slides.length));
      const exportSlides = exportPlan.slides.slice(0, requestedSlideTotal);

      const pptx = new pptxgen();
      type PptxSlide = ReturnType<typeof pptx.addSlide>;
      pptx.layout = 'LAYOUT_WIDE';
      pptx.author = 'SimplifyConvert AI Studio';
      pptx.company = 'SimplifyConvert';
      pptx.subject = 'AI-generated presentation outline';
      pptx.title = truncateText(exportPlan.title || topic.trim() || 'AI Studio Presentation', 120);
      pptx.theme = {
        headFontFace: 'Aptos Display',
        bodyFontFace: 'Aptos',
      };

      const brand = {
        dark: '080A12',
        slate: '111827',
        cyan: '0E7490',
        cyanLight: 'CFFAFE',
        blue: '2563EB',
        violet: '7C3AED',
        green: '059669',
        orange: 'EA580C',
        text: '0F172A',
        muted: '475569',
        border: 'CBD5E1',
        surface: 'F8FAFC',
      };
      const theme = selectTheme(`${exportPlan.theme} ${exportPlan.title} ${topic}`, tone);
      const promptDomain = exportPlan.theme === 'general' ? detectPromptDomain(topic) : exportPlan.theme;
      const isTravelOrTourismDeck = exportPlan.theme === 'travel' || /\b(?:tourism|tourist|travel|trip|itinerary|destination)\b/i.test(audience);
      const isMetricDeck = !isTravelOrTourismDeck && (
        exportPlan.theme === 'business'
        || /\b(?:finance|financial|revenue|sales|metric|metrics|kpi|statistics|data|investor|business)\b/i.test(`${topic} ${audience}`)
      );

      const addAbstractBackground = (pptSlide: PptxSlide, accentColor = theme.primary, variant: 'light' | 'dark' = 'light') => {
        const baseColor = variant === 'dark' ? theme.dark : theme.light;
        pptSlide.background = { color: baseColor };
        pptSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: baseColor }, line: { color: baseColor } });
        pptSlide.addShape(pptx.ShapeType.ellipse, { x: 0.05, y: 0.05, w: 2.8, h: 2.8, fill: { color: accentColor, transparency: 100 }, line: { color: accentColor, transparency: variant === 'dark' ? 45 : 70, width: 2.2 } });
        pptSlide.addShape(pptx.ShapeType.ellipse, { x: 10.15, y: 4.65, w: 3.2, h: 3.2, fill: { color: theme.secondary, transparency: 100 }, line: { color: theme.secondary, transparency: variant === 'dark' ? 50 : 76, width: 1.8 } });
        pptSlide.addShape(pptx.ShapeType.rect, { x: 10.45, y: 0, w: 2.88, h: 7.5, fill: { color: accentColor, transparency: variant === 'dark' ? 72 : 91 }, line: { color: accentColor, transparency: 100 } });
      };

      const addDiagonalPanel = (pptSlide: PptxSlide, accentColor = theme.primary, dark = false) => {
        pptSlide.addShape(pptx.ShapeType.parallelogram, {
          x: 8.25,
          y: 0.85,
          w: 4.7,
          h: 5.65,
          fill: { color: accentColor, transparency: dark ? 18 : 12 },
          line: { color: accentColor, transparency: 100 },
          rotate: 0,
        });
        pptSlide.addShape(pptx.ShapeType.parallelogram, {
          x: 9.15,
          y: 1.45,
          w: 2.9,
          h: 3.9,
          fill: { color: theme.secondary, transparency: dark ? 38 : 72 },
          line: { color: theme.secondary, transparency: 100 },
        });
      };

      const addBlob = (pptSlide: PptxSlide, x: number, y: number, size: number, color: string, transparency = 72) => {
        pptSlide.addShape(pptx.ShapeType.ellipse, { x, y, w: size, h: size, fill: { color, transparency }, line: { color, transparency: 100 } });
        pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + size * 0.12, y: y + size * 0.12, w: size * 0.75, h: size * 0.75, fill: { color, transparency: 100 }, line: { color, transparency: Math.min(transparency + 8, 95), width: 1.4 } });
      };

      const addSlideFrame = (pptSlide: PptxSlide, slide: PresentationSlide, accentColor = theme.primary) => {
        void slide;
        addAbstractBackground(pptSlide, accentColor);
        pptSlide.background = { color: 'FFFFFF' };
        pptSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.16, fill: { color: accentColor }, line: { color: accentColor } });
        pptSlide.addText('SimplifyConvert AI Studio', {
          x: 10.1,
          y: 0.43,
          w: 2.6,
          h: 0.25,
          fontSize: 9,
          bold: true,
          align: 'right',
          color: theme.muted,
          margin: 0,
        });
      };

      const addSlideTitle = (pptSlide: PptxSlide, slide: PresentationSlide, x = 0.55, y = 0.82, w = 8.8) => {
        pptSlide.addText(truncateText(slide.title, 96), {
          x,
          y,
          w,
          h: 0.92,
          fontFace: 'Aptos Display',
          fontSize: 34,
          bold: true,
          color: theme.text,
          fit: 'shrink',
          margin: 0,
        });
      };

      const addSectionNumber = (pptSlide: PptxSlide, slide: PresentationSlide, accentColor = brand.cyan, x = 11.02, y = 0.92) => {
        void slide;
        pptSlide.addShape(pptx.ShapeType.ellipse, { x, y, w: 0.24, h: 0.24, fill: { color: accentColor }, line: { color: accentColor } });
        pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + 0.34, y, w: 0.24, h: 0.24, fill: { color: theme.secondary }, line: { color: theme.secondary } });
      };

      const addShapeIcon = (pptSlide: PptxSlide, x: number, y: number, accentColor = theme.primary) => {
        pptSlide.addShape(pptx.ShapeType.roundRect, { x, y, w: 0.72, h: 0.72, rectRadius: 0.08, fill: { color: accentColor, transparency: 8 }, line: { color: accentColor } });
        pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + 0.18, y: y + 0.17, w: 0.36, h: 0.36, fill: { color: 'FFFFFF', transparency: 8 }, line: { color: 'FFFFFF', transparency: 12 } });
        pptSlide.addShape(pptx.ShapeType.line, { x: x + 0.18, y: y + 0.56, w: 0.36, h: 0, line: { color: 'FFFFFF', width: 1.2, transparency: 10 } });
      };

      function addDomainIllustration(pptSlide: PptxSlide, x: number, y: number, w: number, h: number, dark = false) {
        const lineColor = dark ? theme.light : theme.primary;
        const fillColor = dark ? theme.primary : theme.soft;
        const mutedFill = dark ? theme.secondary : theme.softer;

        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w,
          h,
          rectRadius: 0.12,
          fill: { color: fillColor, transparency: dark ? 32 : 0 },
          line: { color: lineColor, transparency: dark ? 68 : 60 },
        });

        if (promptDomain === 'education') {
          pptSlide.addShape(pptx.ShapeType.rect, { x: x + w * 0.2, y: y + h * 0.28, w: w * 0.44, h: h * 0.42, fill: { color: dark ? theme.dark : theme.light }, line: { color: lineColor, width: 1.2 } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.42, y: y + h * 0.28, w: 0, h: h * 0.42, line: { color: lineColor, width: 1 } });
          pptSlide.addShape(pptx.ShapeType.triangle, { x: x + w * 0.56, y: y + h * 0.17, w: w * 0.22, h: h * 0.22, fill: { color: mutedFill }, line: { color: lineColor } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.68, y: y + h * 0.37, w: 0, h: h * 0.28, line: { color: lineColor, width: 1.2 } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + w * 0.63, y: y + h * 0.62, w: w * 0.1, h: w * 0.1, fill: { color: lineColor }, line: { color: lineColor } });
        } else if (promptDomain === 'travel') {
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + w * 0.18, y: y + h * 0.58, w: w * 0.62, h: h * 0.28, fill: { color: lineColor, transparency: 100 }, line: { color: lineColor, width: 1.6 } });
          pptSlide.addShape(pptx.ShapeType.triangle, { x: x + w * 0.46, y: y + h * 0.18, w: w * 0.24, h: h * 0.22, fill: { color: mutedFill }, line: { color: lineColor } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.58, y: y + h * 0.4, w: 0, h: h * 0.32, line: { color: lineColor, width: 1.4 } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + w * 0.18, y: y + h * 0.22, w: w * 0.16, h: w * 0.16, fill: { color: theme.secondary, transparency: 18 }, line: { color: theme.secondary } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.22, y: y + h * 0.34, w: w * 0.55, h: h * 0.18, line: { color: lineColor, width: 1, transparency: 25 } });
        } else if (promptDomain === 'healthcare') {
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + w * 0.23, y: y + h * 0.24, w: w * 0.5, h: h * 0.5, fill: { color: dark ? theme.dark : theme.light, transparency: 8 }, line: { color: lineColor, width: 1.2 } });
          pptSlide.addShape(pptx.ShapeType.rect, { x: x + w * 0.43, y: y + h * 0.34, w: w * 0.1, h: h * 0.3, fill: { color: lineColor }, line: { color: lineColor } });
          pptSlide.addShape(pptx.ShapeType.rect, { x: x + w * 0.33, y: y + h * 0.44, w: w * 0.3, h: h * 0.1, fill: { color: lineColor }, line: { color: lineColor } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + w * 0.62, y: y + h * 0.18, w: w * 0.18, h: h * 0.18, fill: { color: theme.secondary, transparency: 100 }, line: { color: theme.secondary, width: 1.4 } });
        } else if (promptDomain === 'technology') {
          pptSlide.addShape(pptx.ShapeType.roundRect, { x: x + w * 0.22, y: y + h * 0.22, w: w * 0.52, h: h * 0.46, rectRadius: 0.08, fill: { color: dark ? theme.dark : theme.light, transparency: 10 }, line: { color: lineColor, width: 1.2 } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.28, y: y + h * 0.36, w: w * 0.4, h: 0, line: { color: lineColor, width: 1 } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.28, y: y + h * 0.48, w: w * 0.34, h: 0, line: { color: theme.secondary, width: 1.1 } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + w * 0.12, y: y + h * 0.24, w: w * 0.11, h: w * 0.11, fill: { color: lineColor }, line: { color: lineColor } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + w * 0.76, y: y + h * 0.52, w: w * 0.1, h: w * 0.1, fill: { color: theme.secondary }, line: { color: theme.secondary } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.23, y: y + h * 0.3, w: w * 0.15, h: h * 0.1, line: { color: lineColor, width: 1 } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.6, y: y + h * 0.48, w: w * 0.14, h: h * 0.08, line: { color: theme.secondary, width: 1 } });
        } else {
          pptSlide.addShape(pptx.ShapeType.rect, { x: x + w * 0.24, y: y + h * 0.34, w: w * 0.48, h: h * 0.36, fill: { color: dark ? theme.dark : theme.light }, line: { color: lineColor, width: 1.2 } });
          pptSlide.addShape(pptx.ShapeType.rect, { x: x + w * 0.36, y: y + h * 0.24, w: w * 0.24, h: h * 0.12, fill: { color: mutedFill }, line: { color: lineColor } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.32, y: y + h * 0.49, w: w * 0.32, h: 0, line: { color: lineColor, width: 1.2 } });
          pptSlide.addShape(pptx.ShapeType.line, { x: x + w * 0.32, y: y + h * 0.58, w: w * 0.24, h: 0, line: { color: theme.secondary, width: 1.2 } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + w * 0.72, y: y + h * 0.22, w: w * 0.12, h: w * 0.12, fill: { color: theme.secondary }, line: { color: theme.secondary } });
        }
      }

      const addAccentBlock = (pptSlide: PptxSlide, x: number, y: number, w: number, h: number, accentColor = theme.primary) => {
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w,
          h,
          rectRadius: 0.08,
          fill: { color: accentColor, transparency: 88 },
          line: { color: accentColor, transparency: 75 },
        });
        pptSlide.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h, fill: { color: accentColor }, line: { color: accentColor } });
      };

      const addImagePlaceholder = (
        pptSlide: PptxSlide,
        slide: PresentationSlide,
        x: number,
        y: number,
        w: number,
        h: number,
        variant: 'light' | 'dark' = 'light',
        stockImage?: ResolvedStockImage | null
      ) => {
        const isDark = variant === 'dark';
        const fillColor = isDark ? theme.dark : theme.soft;
        const mutedColor = isDark ? theme.secondary : theme.primary;

        if (stockImage) {
          try {
            pptSlide.addImage({
              data: stockImage.dataUrl,
              x,
              y,
              w,
              h,
            });
            pptSlide.addShape(pptx.ShapeType.rect, {
              x,
              y: y + h - 0.42,
              w,
              h: 0.42,
              fill: { color: isDark ? theme.dark : theme.light, transparency: 18 },
              line: { color: isDark ? theme.dark : theme.light, transparency: 100 },
            });
            pptSlide.addText(stockImage.photographer ? `Photo: ${stockImage.photographer}` : 'Stock image', {
              x: x + 0.16,
              y: y + h - 0.3,
              w: w - 0.32,
              h: 0.16,
              fontSize: 7,
              bold: true,
              color: isDark ? theme.light : theme.text,
              margin: 0,
            });
            return;
          } catch {
            // Fall through to the designed placeholder if pptxgen cannot embed the image data.
          }
        }

        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x,
          y,
          w,
          h,
          rectRadius: 0.12,
          fill: { color: fillColor, transparency: isDark ? 12 : 0 },
          line: { color: mutedColor, transparency: isDark ? 45 : 35, width: 1.2 },
        });
        pptSlide.addShape(pptx.ShapeType.rect, {
          x,
          y,
          w,
          h: 0.22,
          fill: { color: mutedColor, transparency: isDark ? 10 : 0 },
          line: { color: mutedColor, transparency: 100 },
        });
        pptSlide.addShape(pptx.ShapeType.ellipse, {
          x: x + w * 0.12,
          y: y + h * 0.22,
          w: Math.min(w, h) * 0.28,
          h: Math.min(w, h) * 0.28,
          fill: { color: mutedColor, transparency: isDark ? 22 : 76 },
          line: { color: mutedColor, transparency: isDark ? 20 : 55 },
        });
        pptSlide.addShape(pptx.ShapeType.line, {
          x: x + w * 0.18,
          y: y + h * 0.72,
          w: w * 0.64,
          h: 0,
          line: { color: mutedColor, transparency: isDark ? 45 : 62, width: 1.2 },
        });
      };

      const addDesignNotes = (pptSlide: PptxSlide, slide: PresentationSlide) => {
        void pptSlide;
        void slide;
      };

      const addBulletList = (pptSlide: PptxSlide, points: string[], x: number, y: number, w: number, h: number, fontSize = 13, color = theme.text) => {
        if (points.length === 0) return;

        pptSlide.addText(
          points.map((point) => ({ text: shortPhrase(point, 86), options: { bullet: { type: 'bullet' }, breakLine: true } })),
          {
            x,
            y,
            w,
            h,
            fontSize,
            color,
            fit: 'shrink',
            valign: 'top',
            paraSpaceAfter: 8,
            margin: 0,
          }
        );
      };

      const renderCoverSlide = (slide: PresentationSlide, layoutDecision: SlideLayoutDecision, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const speakerNote = slide.speakerNote || 'Use a confident hero visual or clean abstract composition.';
        addAbstractBackground(pptSlide, theme.primary, 'dark');
        addDiagonalPanel(pptSlide, theme.primary, true);
        addBlob(pptSlide, 8.7, 0.78, 3.15, theme.secondary, 36);
        addBlob(pptSlide, 10.55, 4.6, 1.85, theme.light, 82);
        addImagePlaceholder(pptSlide, slide, layoutDecision.imagePlacement.x, layoutDecision.imagePlacement.y, layoutDecision.imagePlacement.w, layoutDecision.imagePlacement.h, 'dark', stockImage);
        if (!stockImage) {
          addDomainIllustration(pptSlide, layoutDecision.imagePlacement.x + 0.45, layoutDecision.imagePlacement.y + 0.6, Math.max(1.4, layoutDecision.imagePlacement.w - 0.9), Math.max(1.4, layoutDecision.imagePlacement.h - 1.4), true);
        }
        pptSlide.addText('AI Studio', { x: 0.7, y: 0.62, w: 2, h: 0.3, fontSize: 13, bold: true, color: theme.secondary, margin: 0 });
        pptSlide.addText(truncateText(slide.title || topic, 95), {
          x: layoutDecision.titlePlacement.x,
          y: layoutDecision.titlePlacement.y,
          w: layoutDecision.titlePlacement.w,
          h: layoutDecision.titlePlacement.h,
          fontFace: 'Aptos Display',
          fontSize: 42,
          bold: true,
          color: 'FFFFFF',
          fit: 'shrink',
          margin: 0,
        });
        pptSlide.addText(truncateText(slide.subtitle || speakerNote, 220), {
          x: 0.72,
          y: 3.85,
          w: 6.85,
          h: 0.82,
          fontSize: 18,
          color: 'D1D5DB',
          fit: 'shrink',
          margin: 0,
        });
        pptSlide.addShape(pptx.ShapeType.line, { x: 0.72, y: 5.15, w: 2.1, h: 0, line: { color: theme.secondary, width: 2 } });
        pptSlide.addText(`Audience: ${audience.trim() || 'Not specified'}  |  Tone: ${tone}`, {
          x: 0.72,
          y: 6.28,
          w: 7.2,
          h: 0.3,
          fontSize: 11,
          color: theme.secondary,
          margin: 0,
        });
      };

      const renderAgendaSlide = (slide: PresentationSlide) => {
        const pptSlide = pptx.addSlide();
        const points = slide.components.length > 0 ? slide.components.slice(0, 4).map((component) => component.title) : [slide.title, slide.subtitle || slide.speakerNote].filter(Boolean);
        addSlideFrame(pptSlide, slide);
        addDiagonalPanel(pptSlide, theme.primary);
        addSlideTitle(pptSlide, slide, 0.7, 0.82, 7.5);
        addSectionNumber(pptSlide, slide);
        points.forEach((point, index) => {
          const x = 0.75 + (index % 2) * 5.85;
          const y = 2.05 + Math.floor(index / 2) * 2.05;
          pptSlide.addShape(pptx.ShapeType.roundRect, { x, y, w: 5.2, h: 1.45, rectRadius: 0.12, fill: { color: index % 2 === 0 ? theme.soft : theme.softer }, line: { color: theme.primary, transparency: 70 } });
          pptSlide.addText(String(index + 1).padStart(2, '0'), { x: x + 0.35, y: y + 0.35, w: 0.78, h: 0.42, fontSize: 22, bold: true, color: theme.primary, margin: 0 });
          pptSlide.addText(shortPhrase(point, 76), { x: x + 1.25, y: y + 0.36, w: 3.55, h: 0.5, fontSize: 18, bold: true, color: theme.text, fit: 'shrink', margin: 0 });
        });
        addDesignNotes(pptSlide, slide);
      };

      const renderCardsSlide = (slide: PresentationSlide, layoutDecision: SlideLayoutDecision, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const components: Array<Pick<SlideComponent, 'title' | 'description' | 'value'>> = slide.components.length > 0 ? slide.components.slice(0, layoutDecision.maxTextItems) : [{ title: slide.subtitle || slide.title, description: slide.speakerNote || slide.subtitle || slide.title }];
        addSlideFrame(pptSlide, slide);
        addSlideTitle(pptSlide, slide, layoutDecision.titlePlacement.x, layoutDecision.titlePlacement.y, layoutDecision.titlePlacement.w);
        addSectionNumber(pptSlide, slide);
        addImagePlaceholder(pptSlide, slide, layoutDecision.imagePlacement.x, layoutDecision.imagePlacement.y, layoutDecision.imagePlacement.w, layoutDecision.imagePlacement.h, 'light', stockImage);
        if (!stockImage) {
          addDomainIllustration(pptSlide, layoutDecision.imagePlacement.x + 0.42, layoutDecision.imagePlacement.y + 0.28, Math.max(1.25, layoutDecision.imagePlacement.w - 0.85), Math.max(1, layoutDecision.imagePlacement.h - 0.45));
        }

        components.forEach((component, index) => {
          const placement = layoutDecision.componentPlacement[index] || layoutDecision.componentPlacement[0];
          const x = placement.x;
          pptSlide.addShape(pptx.ShapeType.roundRect, {
            x,
            y: placement.y,
            w: placement.w,
            h: placement.h,
            rectRadius: 0.12,
            fill: { color: index % 2 === 0 ? theme.soft : theme.softer },
            line: { color: theme.primary, transparency: 55 },
          });
          pptSlide.addShape(pptx.ShapeType.rect, { x, y: placement.y, w: placement.w, h: 0.24, fill: { color: theme.primary }, line: { color: theme.primary } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + 0.35, y: placement.y + 0.57, w: 0.62, h: 0.62, fill: { color: theme.primary }, line: { color: theme.primary } });
          pptSlide.addText(String(index + 1), { x: x + 0.44, y: placement.y + 0.75, w: 0.42, h: 0.14, fontSize: 8, bold: true, align: 'center', color: 'FFFFFF', margin: 0 });
          pptSlide.addText(shortPhrase(component.title, 48), { x: x + 0.35, y: placement.y + 1.12, w: Math.max(1, placement.w - 0.72), h: 0.36, fontSize: 16, bold: true, color: theme.text, fit: 'shrink', margin: 0 });
          pptSlide.addText(shortPhrase(component.description, 88), { x: x + 0.35, y: placement.y + 1.6, w: Math.max(1, placement.w - 0.77), h: 0.5, fontSize: 9, color: theme.muted, fit: 'shrink', margin: 0 });
        });
        pptSlide.addText(shortPhrase(slide.subtitle || slide.speakerNote || '', 150), { x: 0.82, y: 2.0, w: 6.35, h: 0.55, fontSize: 16, bold: true, color: theme.muted, fit: 'shrink', margin: 0 });
        addDesignNotes(pptSlide, slide);
      };

      const renderGallerySlide = (slide: PresentationSlide, layoutDecision: SlideLayoutDecision, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const components: Array<Pick<SlideComponent, 'title' | 'description' | 'value'>> = slide.components.length > 0 ? slide.components.slice(0, layoutDecision.maxTextItems) : [
          { title: slide.title, description: slide.subtitle || slide.speakerNote },
        ];
        addSlideFrame(pptSlide, slide);
        addSlideTitle(pptSlide, slide, layoutDecision.titlePlacement.x, layoutDecision.titlePlacement.y, layoutDecision.titlePlacement.w);
        addSectionNumber(pptSlide, slide);

        components.forEach((component, index) => {
          const placement = layoutDecision.componentPlacement[index] || layoutDecision.componentPlacement[0];
          const x = placement.x;
          const y = placement.y;
          const h = placement.h;
          addImagePlaceholder(pptSlide, slide, x, y, placement.w, h, 'light', index === 1 ? stockImage : null);
          if (!(index === 1 && stockImage)) {
            addDomainIllustration(pptSlide, x + 0.45, y + 0.45, Math.max(1.2, placement.w - 0.9), Math.max(1.1, h - 0.92));
          }
          pptSlide.addShape(pptx.ShapeType.rect, { x, y: y + h - 0.72, w: placement.w, h: 0.72, fill: { color: theme.dark, transparency: 18 }, line: { color: theme.dark, transparency: 100 } });
          pptSlide.addText(shortPhrase(component.title, 42), { x: x + 0.22, y: y + h - 0.58, w: Math.max(1, placement.w - 0.44), h: 0.22, fontSize: 12, bold: true, align: 'center', color: 'FFFFFF', fit: 'shrink', margin: 0 });
          pptSlide.addText(shortPhrase(component.description, 58), { x: x + 0.28, y: y + h - 0.32, w: Math.max(1, placement.w - 0.56), h: 0.16, fontSize: 7, align: 'center', color: 'F8FAFC', fit: 'shrink', margin: 0 });
        });
        addDesignNotes(pptSlide, slide);
      };

      const renderQuickFactsSlide = (slide: PresentationSlide, layoutDecision: SlideLayoutDecision, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const facts: Array<Pick<SlideComponent, 'title' | 'description' | 'value'>> = slide.components.length > 0 ? slide.components.slice(0, layoutDecision.maxTextItems) : [{ title: slide.subtitle || slide.title, description: slide.speakerNote || slide.subtitle || slide.title }];
        addSlideFrame(pptSlide, slide, theme.primary);
        addSlideTitle(pptSlide, slide, layoutDecision.titlePlacement.x, layoutDecision.titlePlacement.y, layoutDecision.titlePlacement.w);
        addSectionNumber(pptSlide, slide, theme.primary);
        addImagePlaceholder(pptSlide, slide, layoutDecision.imagePlacement.x, layoutDecision.imagePlacement.y, layoutDecision.imagePlacement.w, layoutDecision.imagePlacement.h, 'light', stockImage);
        if (!stockImage) {
          addDomainIllustration(pptSlide, layoutDecision.imagePlacement.x + 0.55, layoutDecision.imagePlacement.y + 0.72, Math.max(1.3, layoutDecision.imagePlacement.w - 1.0), Math.max(1.3, layoutDecision.imagePlacement.h - 1.55));
        }

        facts.forEach((fact, index) => {
          const placement = layoutDecision.componentPlacement[index] || layoutDecision.componentPlacement[0];
          const y = placement.y;
          pptSlide.addShape(pptx.ShapeType.roundRect, { x: placement.x, y, w: placement.w, h: placement.h, rectRadius: 0.12, fill: { color: index % 2 === 0 ? theme.soft : theme.softer }, line: { color: theme.primary, transparency: 65 } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: placement.x + 0.28, y: y + 0.22, w: 0.54, h: 0.54, fill: { color: theme.primary }, line: { color: theme.primary } });
          pptSlide.addText(String(index + 1), { x: placement.x + 0.36, y: y + 0.37, w: 0.38, h: 0.13, fontSize: 8, bold: true, color: 'FFFFFF', align: 'center', margin: 0 });
          pptSlide.addText(shortPhrase(fact.value || fact.title, 42), { x: placement.x + 1.08, y: y + 0.2, w: 2.15, h: 0.32, fontSize: 20, bold: true, color: theme.text, fit: 'shrink', margin: 0 });
          pptSlide.addText(shortPhrase(fact.description, 82), { x: placement.x + 3.33, y: y + 0.28, w: Math.max(1, placement.w - 3.8), h: 0.26, fontSize: 11, color: theme.muted, fit: 'shrink', margin: 0 });
        });
        addDesignNotes(pptSlide, slide);
      };

      const renderInfographicSlide = (slide: PresentationSlide, layoutDecision: SlideLayoutDecision, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const components: Array<Pick<SlideComponent, 'title' | 'description' | 'value'>> = slide.components.length > 0 ? slide.components.slice(0, layoutDecision.maxTextItems) : [{ title: slide.subtitle || slide.title, description: slide.speakerNote || slide.subtitle || slide.title }];
        addSlideFrame(pptSlide, slide);
        addSlideTitle(pptSlide, slide, layoutDecision.titlePlacement.x, layoutDecision.titlePlacement.y, layoutDecision.titlePlacement.w);
        addSectionNumber(pptSlide, slide);
        pptSlide.addShape(pptx.ShapeType.ellipse, { x: 4.82, y: 2.28, w: 2.45, h: 2.45, fill: { color: theme.primary }, line: { color: theme.primary } });
        pptSlide.addText(shortPhrase(slide.subtitle || slide.title, 52), { x: 5.12, y: 3.05, w: 1.85, h: 0.42, fontSize: 18, bold: true, align: 'center', color: 'FFFFFF', fit: 'shrink', margin: 0 });

        components.forEach((component, index) => {
          const positions = [
            { x: 0.9, y: 2.05, lineX: 4.15, lineY: 2.65, lineW: 0.72, lineH: 0.55 },
            { x: 8.35, y: 2.05, lineX: 7.25, lineY: 2.66, lineW: 1.1, lineH: 0.52 },
            { x: 4.35, y: 5.25, lineX: 5.48, lineY: 4.72, lineW: 0.28, lineH: 0.52 },
          ];
          const pos = positions[index] || positions[0];
          pptSlide.addShape(pptx.ShapeType.roundRect, { x: pos.x, y: pos.y, w: 3.25, h: 1.2, rectRadius: 0.12, fill: { color: index % 2 === 0 ? theme.soft : theme.softer }, line: { color: theme.primary, transparency: 58 } });
          pptSlide.addText(shortPhrase(component.title, 42), { x: pos.x + 0.28, y: pos.y + 0.24, w: 2.7, h: 0.26, fontSize: 15, bold: true, color: theme.text, fit: 'shrink', margin: 0 });
          pptSlide.addText(shortPhrase(component.description, 68), { x: pos.x + 0.28, y: pos.y + 0.64, w: 2.65, h: 0.22, fontSize: 9, color: theme.muted, fit: 'shrink', margin: 0 });
          pptSlide.addShape(pptx.ShapeType.line, { x: pos.lineX, y: pos.lineY, w: pos.lineW, h: pos.lineH, line: { color: theme.primary, width: 1.3, transparency: 30 } });
        });

        addImagePlaceholder(pptSlide, slide, 9.45, 4.95, 2.25, 1.35, 'light', stockImage);
        if (!stockImage) {
          addDomainIllustration(pptSlide, 9.78, 5.05, 1.55, 1.1);
        }
        addDesignNotes(pptSlide, slide);
      };

      const renderContentSlide = (slide: PresentationSlide, layoutDecision: SlideLayoutDecision, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const keyPoints = slide.components.length > 0
          ? slide.components.slice(0, layoutDecision.maxTextItems).map((component) => `${component.title}: ${component.description}`)
          : slide.bullets.length > 0
            ? slide.bullets.slice(0, 2)
            : [slide.subtitle || 'Audience-ready summary'];
        const speakerNote = slide.speakerNote || slide.subtitle || slide.title;
        const imageX = layoutDecision.imagePlacement.x;
        const textX = layoutDecision.contentPlacement.x;
        addSlideFrame(pptSlide, slide);
        addSlideTitle(pptSlide, slide, layoutDecision.titlePlacement.x, layoutDecision.titlePlacement.y, layoutDecision.titlePlacement.w);
        addSectionNumber(pptSlide, slide);
        addBlob(pptSlide, imageX + 3.2, 1.12, 2.3, theme.secondary, 72);
        addImagePlaceholder(pptSlide, slide, layoutDecision.imagePlacement.x, layoutDecision.imagePlacement.y, layoutDecision.imagePlacement.w, layoutDecision.imagePlacement.h, 'light', stockImage);
        if (!stockImage) {
          addDomainIllustration(pptSlide, imageX + 0.65, layoutDecision.imagePlacement.y + 0.6, Math.max(1.4, layoutDecision.imagePlacement.w - 1.3), Math.max(1.4, layoutDecision.imagePlacement.h - 1.6));
        }
        pptSlide.addText(shortPhrase(slide.subtitle || slide.title, 160), {
          x: textX,
          y: 2.18,
          w: 5.1,
          h: 0.92,
          fontSize: 18,
          bold: true,
          color: theme.text,
          fit: 'shrink',
          margin: 0,
        });
        addBulletList(pptSlide, keyPoints, layoutDecision.componentPlacement[0]?.x || textX + 0.1, layoutDecision.componentPlacement[0]?.y || 3.42, layoutDecision.componentPlacement[0]?.w || 4.75, layoutDecision.componentPlacement[0]?.h || 1.35, 16);
        pptSlide.addShape(pptx.ShapeType.roundRect, {
          x: textX,
          y: 5.45,
          w: 5.0,
          h: 0.72,
          rectRadius: 0.08,
          fill: { color: theme.soft, transparency: 3 },
          line: { color: theme.primary, transparency: 50 },
        });
        pptSlide.addText(shortPhrase(speakerNote, 220), {
          x: textX + 0.26,
          y: 5.62,
          w: 4.48,
          h: 0.28,
          fontSize: 12,
          bold: true,
          color: theme.text,
          fit: 'shrink',
          align: 'center',
          margin: 0,
        });
        addDesignNotes(pptSlide, slide);
      };

      const renderComparisonSlide = (slide: PresentationSlide, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const components: Array<Pick<SlideComponent, 'title' | 'description' | 'value'>> = slide.components.length > 0
          ? slide.components.slice(0, 4)
          : (slide.bullets.length > 0 ? slide.bullets : [slide.subtitle || slide.title]).slice(0, 4).map((point) => ({ title: point, description: point }));
        const midpoint = Math.ceil(components.length / 2);
        addSlideFrame(pptSlide, slide, theme.primary);
        addSlideTitle(pptSlide, slide, 0.7, 0.82, 7.5);
        addSectionNumber(pptSlide, slide, theme.primary);
        [0, 1].forEach((index) => {
          const x = index === 0 ? 0.72 : 6.75;
          const list = index === 0 ? components.slice(0, midpoint) : components.slice(midpoint);
          const panelColor = index === 0 ? theme.soft : theme.softer;
          const accent = index === 0 ? theme.primary : theme.secondary;
          pptSlide.addShape(pptx.ShapeType.roundRect, { x, y: 1.85, w: 5.72, h: 4.75, rectRadius: 0.12, fill: { color: panelColor }, line: { color: accent, transparency: 58 } });
          pptSlide.addShape(pptx.ShapeType.rect, { x, y: 1.85, w: 5.72, h: 0.38, fill: { color: accent }, line: { color: accent } });
          addBlob(pptSlide, x + 3.65, 2.65, 1.5, accent, 82);
          addShapeIcon(pptSlide, x + 4.55, 2.45, accent);
          if (index === 1) {
            addImagePlaceholder(pptSlide, slide, x + 3.08, 3.62, 2.18, 2.05, 'light', stockImage);
            if (!stockImage) {
              addDomainIllustration(pptSlide, x + 3.36, 3.9, 1.62, 1.55);
            }
          }
          pptSlide.addText(shortPhrase(list[0]?.title || slide.subtitle || slide.title, 70), { x: x + 0.45, y: 2.55, w: 4.25, h: 0.56, fontSize: 21, bold: true, color: theme.text, fit: 'shrink', margin: 0 });
          pptSlide.addText(shortPhrase(list[0]?.description || '', 98), { x: x + 0.52, y: 3.34, w: 3.9, h: 0.52, fontSize: 12, color: theme.muted, fit: 'shrink', margin: 0 });
          addBulletList(pptSlide, list.slice(1, 3).map((component) => component.title), x + 0.62, 4.12, 3.85, 0.9, 13);
        });
        addDesignNotes(pptSlide, slide);
      };

      const renderTimelineSlide = (slide: PresentationSlide, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const components: Array<Pick<SlideComponent, 'title' | 'description' | 'value'>> = slide.components.length > 0
          ? slide.components.slice(0, 4)
          : (slide.bullets.length > 0 ? slide.bullets : [slide.title, slide.subtitle || slide.speakerNote]).filter(Boolean).slice(0, 4).map((point) => ({ title: point, description: point }));
        addSlideFrame(pptSlide, slide, theme.primary);
        addSlideTitle(pptSlide, slide, 0.7, 0.82, 7.5);
        addSectionNumber(pptSlide, slide, theme.primary);
        addBlob(pptSlide, 9.45, 1.4, 2.2, theme.secondary, 82);
        if (slide.layout === 'image-left' || slide.layout === 'image-right' || slide.layout === 'split') {
          addImagePlaceholder(pptSlide, slide, 8.85, 1.45, 3.2, 2.45, 'light', stockImage);
        }
        if (!stockImage) {
          addDomainIllustration(pptSlide, 9.28, 1.82, 2.32, 1.82);
        }
        pptSlide.addShape(pptx.ShapeType.roundRect, { x: 0.8, y: 3.05, w: 11.35, h: 0.32, rectRadius: 0.08, fill: { color: theme.soft }, line: { color: theme.soft } });
        pptSlide.addShape(pptx.ShapeType.line, { x: 1.15, y: 3.2, w: 10.55, h: 0, line: { color: theme.primary, width: 3 } });
        components.forEach((component, index) => {
          const x = 1.15 + index * (10.55 / Math.max(components.length - 1, 1));
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x - 0.36, y: 2.83, w: 0.72, h: 0.72, fill: { color: 'FFFFFF' }, line: { color: theme.primary, width: 2 } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x - 0.18, y: 3.01, w: 0.36, h: 0.36, fill: { color: theme.primary }, line: { color: theme.primary } });
          pptSlide.addText(String(index + 1), { x: x - 0.16, y: 3.38, w: 0.32, h: 0.16, fontSize: 7, bold: true, align: 'center', color: 'FFFFFF', margin: 0 });
          pptSlide.addText(shortPhrase(component.title, 42), { x: x - 1.15, y: index % 2 === 0 ? 1.78 : 4.05, w: 2.3, h: 0.34, fontSize: 15, bold: true, align: 'center', color: theme.text, fit: 'shrink', margin: 0 });
          pptSlide.addText(shortPhrase(component.description, 54), { x: x - 1.08, y: index % 2 === 0 ? 2.22 : 4.48, w: 2.16, h: 0.28, fontSize: 8, align: 'center', color: theme.muted, fit: 'shrink', margin: 0 });
        });
        addDesignNotes(pptSlide, slide);
      };

      const renderProcessSlide = (slide: PresentationSlide, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const components: Array<Pick<SlideComponent, 'title' | 'description' | 'value'>> = slide.components.length > 0
          ? slide.components.slice(0, 3)
          : (slide.bullets.length > 0 ? slide.bullets : [slide.title, slide.subtitle || slide.speakerNote]).filter(Boolean).slice(0, 3).map((point) => ({ title: point, description: point }));
        addSlideFrame(pptSlide, slide, theme.primary);
        addSlideTitle(pptSlide, slide, 0.7, 0.82, 7.3);
        addSectionNumber(pptSlide, slide, theme.primary);
        addBlob(pptSlide, 9.65, 1.45, 2.05, theme.secondary, 80);
        if (slide.layout === 'image-left' || slide.layout === 'image-right' || slide.layout === 'split') {
          addImagePlaceholder(pptSlide, slide, 8.92, 1.48, 3.05, 2.45, 'light', stockImage);
        }
        if (!stockImage) {
          addDomainIllustration(pptSlide, 9.28, 1.82, 2.25, 1.85);
        }
        components.forEach((component, index) => {
          const x = 0.85 + index * (11 / Math.max(components.length, 1));
          pptSlide.addShape(pptx.ShapeType.chevron, { x, y: 2.85, w: 2.18, h: 1.7, fill: { color: index % 2 === 0 ? theme.soft : theme.softer }, line: { color: theme.primary, transparency: 45 } });
          pptSlide.addShape(pptx.ShapeType.ellipse, { x: x + 0.18, y: 2.15, w: 0.78, h: 0.78, fill: { color: theme.primary }, line: { color: theme.primary } });
          pptSlide.addText(String(index + 1), { x: x + 0.27, y: 2.4, w: 0.58, h: 0.16, fontSize: 9, bold: true, align: 'center', color: 'FFFFFF', margin: 0 });
          pptSlide.addText(shortPhrase(component.title, 34), { x: x + 0.42, y: 3.05, w: 1.28, h: 0.32, fontSize: 13, bold: true, color: theme.text, fit: 'shrink', margin: 0 });
          pptSlide.addText(shortPhrase(component.description, 42), { x: x + 0.42, y: 3.48, w: 1.18, h: 0.26, fontSize: 8, color: theme.muted, fit: 'shrink', margin: 0 });
        });
        pptSlide.addShape(pptx.ShapeType.roundRect, { x: 1.1, y: 5.45, w: 10.9, h: 0.72, rectRadius: 0.08, fill: { color: theme.soft }, line: { color: theme.primary, transparency: 75 } });
        pptSlide.addText(shortPhrase(slide.subtitle || slide.speakerNote || 'Show how the sequence works from beginning to end.', 150), { x: 1.35, y: 5.66, w: 10.4, h: 0.26, fontSize: 15, color: theme.text, bold: true, align: 'center', fit: 'shrink', margin: 0 });
        addDesignNotes(pptSlide, slide);
      };

      const renderConclusionSlide = (slide: PresentationSlide, stockImage?: ResolvedStockImage | null) => {
        const pptSlide = pptx.addSlide();
        const points = slide.components.length > 0
          ? slide.components.slice(0, 3).map((component) => component.title)
          : slide.bullets.length > 0 ? slide.bullets.slice(0, 3) : ['Summarize the core message', 'Close with next steps'];
        addAbstractBackground(pptSlide, theme.primary, 'dark');
        addDiagonalPanel(pptSlide, theme.primary, true);
        addBlob(pptSlide, 8.95, 1.15, 2.9, theme.secondary, 55);
        addImagePlaceholder(pptSlide, slide, 8.75, 1.65, 3.75, 3.75, 'dark', stockImage);
        if (!stockImage) {
          addDomainIllustration(pptSlide, 9.18, 2.08, 2.85, 2.85, true);
        }
        pptSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.24, fill: { color: theme.primary }, line: { color: theme.primary } });
        pptSlide.addText('Conclusion', { x: 0.75, y: 0.75, w: 2.4, h: 0.35, fontSize: 13, bold: true, color: theme.secondary, margin: 0 });
        pptSlide.addText(truncateText(slide.title, 88), { x: 0.75, y: 1.82, w: 8.1, h: 1.18, fontFace: 'Aptos Display', fontSize: 40, bold: true, color: 'FFFFFF', fit: 'shrink', margin: 0 });
        addBulletList(pptSlide, points, 0.98, 3.45, 7.1, 1.7, 16, 'E5E7EB');
        pptSlide.addText('AI Studio', { x: 9.65, y: 5.65, w: 2, h: 0.3, fontSize: 14, bold: true, align: 'center', color: theme.secondary, margin: 0 });
      };

      const stockImageCache = new Map<string, ResolvedStockImage | null>();

      for (const slide of exportSlides) {
        const layoutDecision = decideSlideLayout({
          slide,
          theme: exportPlan.theme,
          visualDesign: visualDesignPlan,
        });
        const imageQuery = slide.imageQuery?.trim();
        let stockImage: ResolvedStockImage | null = null;

        if (imageQuery) {
          if (stockImageCache.has(imageQuery)) {
            stockImage = stockImageCache.get(imageQuery) || null;
          } else {
            stockImage = await resolveStockImage(imageQuery);
            stockImageCache.set(imageQuery, stockImage);
          }
        }

        if (layoutDecision.layoutName === 'fullBleedHero' && (slide.slideIntent === 'conclusion' || slide.layout === 'closing')) renderConclusionSlide(slide, stockImage);
        else if (layoutDecision.layoutName === 'fullBleedHero') renderCoverSlide(slide, layoutDecision, stockImage);
        else if (layoutDecision.layoutName === 'galleryCards') renderGallerySlide(slide, layoutDecision, stockImage);
        else if (layoutDecision.layoutName === 'itineraryTimeline' || layoutDecision.layoutName === 'roadmapTimeline') renderTimelineSlide(slide, stockImage);
        else if (layoutDecision.layoutName === 'processFlow') renderProcessSlide(slide, stockImage);
        else if ((layoutDecision.layoutName === 'quickFacts' || layoutDecision.layoutName === 'kpiCards') && isMetricDeck) renderQuickFactsSlide(slide, layoutDecision, stockImage);
        else if (layoutDecision.layoutName === 'quickFacts' || layoutDecision.layoutName === 'kpiCards') {
          if (slide.slideIntent === 'itinerary' || slide.slideIntent === 'timeline') renderTimelineSlide(slide, stockImage);
          else if (slide.slideIntent === 'attractions' || slide.slideIntent === 'destination' || slide.slideIntent === 'culture' || slide.slideIntent === 'food') renderGallerySlide(slide, layoutDecision, stockImage);
          else if (slide.slideIntent === 'experience' || slide.layout === 'image-left' || slide.layout === 'image-right') renderContentSlide(slide, layoutDecision, stockImage);
          else renderCardsSlide(slide, layoutDecision, stockImage);
        }
        else if (layoutDecision.layoutName === 'conceptInfographic') renderInfographicSlide(slide, layoutDecision, stockImage);
        else if (layoutDecision.layoutName === 'twoColumnComparison') renderComparisonSlide(slide, stockImage);
        else if (layoutDecision.layoutName === 'componentCards') renderCardsSlide(slide, layoutDecision, stockImage);
        else renderContentSlide(slide, layoutDecision, stockImage);
      }

      await pptx.writeFile({ fileName: buildFileName(topic) });
    } catch {
      setError('Unable to create the PPTX file. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="min-h-screen bg-[#080a12] text-white">
        <section className="relative overflow-hidden px-4 pt-6 pb-8 sm:px-6 lg:px-8">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#080a12_0%,#111827_35%,#12343b_70%,#312e81_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,0.22),rgba(8,10,18,0)_42%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0)_38%,rgba(255,255,255,0.06)_100%)]" />

          <div className="relative z-10 mx-auto max-w-7xl">
            <nav className="mb-8 flex items-center gap-2 text-sm text-white/70" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <ChevronRight size={16} />
              <Link href="/ai-studio" className="hover:text-white transition">
                AI Studio
              </Link>
              <ChevronRight size={16} />
              <span>Presentation</span>
            </nav>

            <div className="mx-auto mb-8 flex max-w-xl rounded-full border border-white/15 bg-white/10 p-1 text-sm font-semibold text-white/78 shadow-lg shadow-cyan-950/20 backdrop-blur">
              <Link
                href="/ai-studio/presentation-maker"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-slate-950 shadow-sm"
              >
                <Presentation size={15} />
                Presentation
              </Link>
              <button type="button" className="flex flex-1 items-center justify-center gap-2 px-4 py-2 text-white/65">
                <FileText size={15} />
                Document
                <span className="hidden text-[10px] uppercase tracking-wide sm:inline">Soon</span>
              </button>
              <button type="button" className="flex flex-1 items-center justify-center gap-2 px-4 py-2 text-white/65">
                <Table2 size={15} />
                Spreadsheet
                <span className="hidden text-[10px] uppercase tracking-wide sm:inline">Soon</span>
              </button>
            </div>

            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-50 shadow-lg shadow-cyan-950/30 backdrop-blur">
                <Sparkles size={16} />
                AI Studio
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-950">
                  Premium
                </span>
              </div>

              <h1 className="text-4xl font-bold tracking-normal text-white sm:text-5xl lg:text-6xl">
                AI Presentation Maker
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
                Create professional presentations in minutes with AI-powered content planning, smart visual layouts,
                professional themes, and PPTX export.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {premiumPresentationFeatures.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-cyan-50"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="mx-auto mt-8 max-w-[1160px]">
              <div className="rounded-lg border border-white/15 bg-white/95 p-3 text-slate-950 shadow-2xl shadow-black/35 backdrop-blur">
                <label htmlFor="presentation-brief" className="sr-only">
                  Presentation brief
                </label>
                <textarea
                  id="presentation-brief"
                  value={topic}
                  onChange={(event) => {
                    setTopic(event.target.value);
                    setError('');
                  }}
                  rows={9}
                  className="min-h-72 w-full resize-none border-0 bg-transparent px-4 py-4 text-lg leading-8 text-slate-950 outline-none placeholder:text-slate-400"
                  placeholder="Ask AI Studio to create a premium presentation. Describe the topic, audience, objective, visual direction, and the story you want the deck to tell."
                  maxLength={900}
                />

                <div className="flex flex-col gap-3 border-t border-slate-200 px-2 py-3 lg:flex-row lg:items-end lg:justify-between">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex-1">
                    <div>
                      <label htmlFor="slide-count" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Slides
                      </label>
                      <input
                        id="slide-count"
                        type="number"
                        min={3}
                        max={30}
                        value={slideCount}
                        onChange={(event) => {
                          setSlideCount(event.target.value);
                          setError('');
                        }}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>

                    <div>
                      <label htmlFor="tone" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Tone
                      </label>
                      <select
                        id="tone"
                        value={tone}
                        onChange={(event) => setTone(event.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                      >
                        {toneOptions.map((toneOption) => (
                          <option key={toneOption} value={toneOption}>
                            {toneOption}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="audience" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Audience
                      </label>
                      <input
                        id="audience"
                        type="text"
                        value={audience}
                        onChange={(event) => {
                          setAudience(event.target.value);
                          setError('');
                        }}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                        placeholder="Investors, executives, students"
                        maxLength={180}
                      />
                    </div>
                  </div>

                  {isDevelopment && (
                    <label className="flex items-center gap-2 rounded-lg border border-dashed border-cyan-300 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-900">
                      <input
                        type="checkbox"
                        checked={useMockAI}
                        onChange={(event) => {
                          setUseMockAI(event.target.checked);
                          setError('');
                        }}
                        className="h-4 w-4 rounded border-cyan-300 text-cyan-700 focus:ring-cyan-500"
                      />
                      Use mock AI response
                    </label>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-cyan-950 disabled:bg-slate-400 sm:min-w-44"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Thinking
                      </>
                    ) : (
                      <>
                        Generate
                        <ArrowUp size={18} />
                      </>
                    )}
                  </button>
                </div>

                <div className="grid gap-3 border-t border-slate-200 px-2 py-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">AI Credits</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {walletLoading ? 'Loading' : wallet ? wallet.balanceCredits.toLocaleString() : 'Unavailable'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Estimated Cost</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {estimatedCredits !== null ? `${estimatedCredits.toLocaleString()} credits` : 'Calculating'}
                    </p>
                  </div>
                  <div
                    className={`rounded-lg border p-3 ${
                      hasInsufficientCredits
                        ? 'border-amber-300 bg-amber-50 text-amber-950'
                        : 'border-cyan-100 bg-cyan-50 text-cyan-950'
                    }`}
                  >
                    <p className="text-xs font-bold uppercase tracking-wide">
                      {hasInsufficientCredits ? 'Credits Needed' : 'Wallet Status'}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-5">
                      {hasInsufficientCredits
                        ? 'Insufficient AI credits. Buy or renew a plan to continue generating presentations.'
                        : walletMessage || 'Credit wallet is ready for Phase 1 tracking.'}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mx-auto mt-4 flex max-w-3xl gap-2 rounded-lg border border-red-300/30 bg-red-950/40 p-3 text-sm text-red-100">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {lastCreditsUsed !== null && lastRemainingCredits !== null && (
                <div className="mx-auto mt-4 flex max-w-3xl gap-2 rounded-lg border border-cyan-300/30 bg-cyan-950/40 p-3 text-sm text-cyan-50">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>
                    Used {lastCreditsUsed.toLocaleString()} AI credits. Remaining balance:{' '}
                    {lastRemainingCredits.toLocaleString()} credits.
                  </p>
                </div>
              )}

              {loading && (
                <div className="mx-auto mt-4 max-w-3xl rounded-lg border border-white/15 bg-white/10 p-4 text-left text-sm text-white/82 backdrop-blur">
                  <div className="mb-3 flex items-center gap-2 font-semibold text-cyan-50">
                    <Loader size={16} className="animate-spin" />
                    {progressSteps[progressIndex]}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {progressSteps.map((step, index) => (
                      <div key={step} className="space-y-2">
                        <div
                          className={`h-1.5 rounded-full ${
                            index <= progressIndex ? 'bg-cyan-300' : 'bg-white/18'
                          }`}
                        />
                        <p className={index <= progressIndex ? 'text-white/85' : 'text-white/45'}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>

        <section className="bg-[#f7f8fb] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1160px] space-y-8">
            {outline && (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 sm:p-8">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={20} className="text-cyan-700" />
                    <h2 className="text-xl font-bold text-slate-950">Generated Outline</h2>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="rounded-full bg-cyan-50 px-3 py-1 text-center text-xs font-bold uppercase tracking-wide text-cyan-800">
                      PPT-ready structure
                    </span>
                    {presentationPlan && presentationPlan.slides.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDownloadPptx}
                        disabled={exporting}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-cyan-950 disabled:bg-slate-400"
                      >
                        {exporting ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Preparing
                          </>
                        ) : (
                          <>
                            <Download size={16} />
                            Download PPTX
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {presentationPlan && (
                  <div className="mb-5 rounded-lg border border-cyan-100 bg-cyan-50/70 p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-900">Presentation Strategy</h3>
                    <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      <strong>{presentationPlan.title}</strong>
                      <span className="mt-1 block">{presentationPlan.subtitle}</span>
                      <span className="mt-2 block text-xs font-bold uppercase tracking-wide text-cyan-900">
                        Theme: {presentationPlan.theme}
                      </span>
                    </div>
                  </div>
                )}

                {presentationPlan && presentationPlan.slides.length > 0 ? (
                  <div className="space-y-3">
                    {presentationPlan.slides.map((slide, index) => {
                      const isExpanded = expandedSlides[String(slide.slideNumber)] ?? index === 0;

                      return (
                        <article key={`${slide.slideNumber}-${slide.title}`} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                          <button
                            type="button"
                            onClick={() => toggleSlide(slide.slideNumber)}
                            className="flex w-full items-center justify-between gap-4 bg-slate-50 px-4 py-4 text-left transition hover:bg-cyan-50"
                          >
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">Slide {slide.slideNumber}</p>
                                <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-800">
                                  {slide.slideIntent}
                                </span>
                              </div>
                              <h3 className="mt-1 truncate text-base font-bold text-slate-950 sm:text-lg">{slide.title}</h3>
                            </div>
                            <ChevronDown
                              size={20}
                              className={`shrink-0 text-slate-500 transition ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {isExpanded && (
                            <div className="grid gap-4 p-4 md:grid-cols-2">
                              <div className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-4 md:col-span-2">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-cyan-800">AI Presentation Plan</h4>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Purpose</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{slide.slideIntent}</p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Intent</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{slide.subtitle || slide.speakerNote || 'Not specified'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Layout</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{slide.layout}</p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Visual Format</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{slide.visualFormat}</p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Image Query</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-slate-900">{slide.imageQuery}</p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Bullets</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{slide.bullets.length}</p>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Components</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-900">{slide.components.length}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="rounded-lg border border-slate-100 bg-white p-4">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Subtitle</h4>
                                <p className="mt-2 text-sm leading-6 text-slate-800">
                                  {slide.subtitle || 'Subtitle not explicitly provided.'}
                                </p>
                              </div>

                              <div className="rounded-lg border border-slate-100 bg-white p-4">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Speaker Note</h4>
                                <p className="mt-2 text-sm leading-6 text-slate-800">
                                  {slide.speakerNote || 'Speaker note not explicitly provided.'}
                                </p>
                              </div>

                              <div className="rounded-lg border border-slate-100 bg-white p-4 md:col-span-2">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-slate-500">Components</h4>
                                {slide.components.length > 0 ? (
                                  <ul className="mt-3 space-y-2">
                                    {slide.components.map((component) => (
                                      <li key={`${component.type}-${component.title}`} className="flex gap-2 text-sm leading-6 text-slate-800">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600" />
                                        <span>
                                          <strong>{component.title}</strong>
                                          {component.description ? ` - ${component.description}` : ''}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="mt-2 text-sm leading-6 text-slate-800">Components not explicitly provided. Bullets will be used as fallback.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="max-h-[760px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-5 text-sm leading-7 text-slate-800 sm:text-base">
                    {outline}
                  </div>
                )}

              </div>
            )}

            {!outline && !loading && (
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/60">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-cyan-100">
                    <Presentation size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-950">Your premium presentation plan will appear here</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      AI Studio will prepare AI-powered content planning, smart visual layouts, professional themes,
                      images and visual storytelling, and a PPTX-ready slide structure.
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Recent Creations</h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Premium presentation drafts and PPTX exports will appear here.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-5">
                    <div className="mb-4 h-9 w-9 rounded-lg bg-slate-100" />
                    <div className="h-3 w-2/3 rounded-full bg-slate-200" />
                    <div className="mt-3 h-3 w-full rounded-full bg-slate-100" />
                    <div className="mt-2 h-3 w-4/5 rounded-full bg-slate-100" />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <WandSparkles size={20} className="text-cyan-700" />
                <h2 className="text-xl font-bold text-slate-950">Example Prompts</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {examplePrompts.map((example) => (
                  <button
                    key={example.label}
                    type="button"
                    onClick={() => applyExample(example)}
                    className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-lg"
                  >
                    <span className="text-sm font-bold text-cyan-800">{example.label}</span>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{example.prompt}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
