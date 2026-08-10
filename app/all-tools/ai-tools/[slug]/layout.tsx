import { Metadata } from 'next';
import { getToolById } from '@/app/lib/ai-tools';
import { getAiToolFaqs } from '@/app/lib/ai-tool-faqs';
import { notFound } from 'next/navigation';

interface Params {
  slug: string;
}

/**
 * URL aliases for AI tools
 * Maps alternative slugs/URLs to correct tool IDs
 * Handles cases where URLs don't match internal tool IDs
 */
const toolAliases: Record<string, string> = {
  'summarizer': 'content-summarizer',
  'email-writer': 'cold-email-writer',
  'blog-generator': 'blog-post-generator',
  'social-media-writer': 'instagram-caption-generator', // Maps to primary social tool
  'social-media': 'instagram-caption-generator',
  'social': 'instagram-caption-generator',
};

/**
 * Resolve tool slug to actual tool ID
 * Checks aliases if direct lookup fails
 */
function resolveToolId(slug: string): string {
  // First check if it's a direct match
  const directTool = getToolById(slug);
  if (directTool) {
    return slug;
  }
  
  // Check aliases
  const aliasedId = toolAliases[slug];
  if (aliasedId) {
    const aliasTool = getToolById(aliasedId);
    if (aliasTool) {
      return aliasedId;
    }
  }
  
  // Not found
  return '';
}

// Comprehensive SEO metadata database for AI writing tools
const toolSEODatabase: Record<string, {
  title: string;
  description: string;
  keywords: string[];
}> = {
  'ai-detector': {
    title: 'AI Text Detector - Probabilistic Writing Analysis',
    description: 'Analyze text for statistical and linguistic characteristics associated with AI generation. Results are estimates, not proof of authorship, and can be wrong.',
    keywords: ['AI text detector', 'AI writing analysis', 'AI-generated text estimate', 'probabilistic text analysis']
  },
  'paragraph-writer': {
    title: 'Paragraph Writer - AI Paragraph Generator & Creator',
    description: 'Write well-structured paragraphs instantly. Our AI paragraph generator helps you create engaging, professional paragraphs for essays, articles, and more.',
    keywords: ['paragraph writer', 'paragraph generator', 'AI paragraph creator', 'write paragraphs', 'essay paragraphs']
  },
  'content-improver': {
    title: 'Content Improver - Enhance & Polish Your Writing',
    description: 'Instantly improve your content quality. Our AI-powered content enhancer refines clarity, tone, and readability while preserving your original meaning.',
    keywords: ['content improver', 'text enhancer', 'writing improvement', 'content quality', 'text polish']
  },
  'content-summarizer': {
    title: 'Content Summarizer - Condensed Text & Key Points',
    description: 'Quickly summarize long content into concise summaries. Perfect for articles, documents, and research papers. AI-powered summarization tool.',
    keywords: ['summarizer', 'text summarization', 'content summary', 'AI summarizer', 'condense text']
  },
  'grammar-fixer': {
    title: 'Grammar Fixer - Fix Grammar & Punctuation Errors',
    description: 'Automatically fix grammar, punctuation, and spelling mistakes. Improve your writing with our AI grammar checker and correction tool.',
    keywords: ['grammar fixer', 'grammar checker', 'spell checker', 'punctuation fixer', 'grammar correction']
  },
  'translate': {
    title: 'AI Text Translator - Translate Between Languages',
    description: 'Translate text between 100+ languages instantly. Fast, accurate AI-powered translation tool with support for multiple language pairs.',
    keywords: ['translator', 'AI translator', 'language translator', 'text translation', 'translate text']
  },
  'blog-post-generator': {
    title: 'Blog Post Generator - Create Blog Posts with AI',
    description: 'Generate complete blog posts instantly with AI. Create SEO-optimized, engaging blog content for your website in minutes.',
    keywords: ['blog generator', 'blog post creator', 'blog writer AI', 'article generator', 'blog content']
  },
  'faq-generator': {
    title: 'FAQ Generator - Create FAQs & Q&A Content',
    description: 'Generate comprehensive FAQ sections automatically. Perfect for product pages, help centers, and customer support documentation.',
    keywords: ['FAQ generator', 'FAQ creator', 'Q&A generator', 'question and answer', 'FAQ content']
  },
  'article-writer': {
    title: 'Article Writer - AI Article Generation Tool',
    description: 'Write professional articles effortlessly. Our AI article generator helps you create well-researched, engaging articles for blogs and publications.',
    keywords: ['article writer', 'article generator', 'AI writer', 'article creation', 'content writing']
  },
  'article-rewriter': {
    title: 'Article Rewriter - Rewrite & Rephrase Articles',
    description: 'Rewrite existing articles with fresh perspective. Our AI rewriter maintains meaning while creating unique variations of your content.',
    keywords: ['article rewriter', 'rewrite tool', 'rewrite article', 'rephrase', 'content rewriter']
  },
  'email-writer': {
    title: 'Email Writer - Professional Email Generator',
    description: 'Write professional, persuasive emails instantly. Generate effective emails for any situation - marketing, support, sales, and more.',
    keywords: ['email writer', 'email generator', 'professional email', 'email templates', 'email copy']
  },
  'essay-writer': {
    title: 'Essay Writer - AI Essay Generator & Creator',
    description: 'Generate complete essays with proper structure. Our essay writing tool helps you organize thoughts and create well-written essays.',
    keywords: ['essay writer', 'essay generator', 'essay creator', 'write essays', 'essay help']
  },
  'story-generator': {
    title: 'Story Generator - Create Stories with AI',
    description: 'Generate creative stories, plots, and narratives. Perfect for creative writing, fiction, and storytelling projects.',
    keywords: ['story generator', 'story writer', 'creative writing', 'fiction generator', 'story creator']
  },
  'product-description-writer': {
    title: 'Product Description Writer - Create Product Copy',
    description: 'Create product-description drafts from supplied product details, features, and tone. Review specifications, benefits, and commercial claims before publishing.',
    keywords: ['product description generator', 'product copy writer', 'product description', 'ecommerce content', 'product writing']
  },
  'cover-letter-writer': {
    title: 'Cover Letter Writer - Professional Cover Letter Generator',
    description: 'Create compelling cover letters for job applications. Generate personalized, professional cover letters that impress employers.',
    keywords: ['cover letter writer', 'cover letter generator', 'job application', 'cover letter template', 'professional letter']
  },
  'sentence-rewriter': {
    title: 'Sentence Rewriter - Rephrase & Improve Sentences',
    description: 'Rewrite sentences for clarity and variety. Improve sentence structure, readability, and impact with AI-powered rephrasing.',
    keywords: ['sentence rewriter', 'rephrase sentences', 'sentence generator', 'rewrite tool', 'improve sentences']
  },
  'social-media-writer': {
    title: 'Social Media Writer - Create Social Posts & Captions',
    description: 'Generate engaging social media posts and captions. Create content for Facebook, Instagram, Twitter, LinkedIn, and TikTok.',
    keywords: ['social media writer', 'post generator', 'caption writer', 'social media content', 'post creator']
  },
  'tone-of-voice': {
    title: 'Tone of Voice Changer - Adjust Writing Tone',
    description: 'Change the tone and style of your content. Rewrite text in different tones - professional, casual, formal, friendly, and more.',
    keywords: ['tone changer', 'tone converter', 'writing tone', 'voice changer', 'rephrase text']
  },
  'text-expander': {
    title: 'Text Expander - Expand & Lengthen Content',
    description: 'Expand short text into longer, more detailed content. Perfect for creating more comprehensive articles and detailed explanations.',
    keywords: ['text expander', 'content expander', 'expand text', 'lengthen content', 'text expansion']
  },
  'outline-generator': {
    title: 'Outline Generator - Create Content Outlines',
    description: 'Generate structured outlines for essays, articles, and documents. Organize your ideas before writing with AI-powered outlines.',
    keywords: ['outline generator', 'content outline', 'essay outline', 'article outline', 'create outline']
  },
  'title-rewriter': {
    title: 'Title Rewriter - Generate Alternative Titles',
    description: 'Create alternative titles and headlines from an existing title and optional content context. Review each option for clarity and accuracy before publishing.',
    keywords: ['title rewriter', 'headline generator', 'title generator', 'SEO titles', 'generate headlines']
  },
  'question-generator': {
    title: 'Question Generator - Create Questions & Prompts',
    description: 'Generate relevant questions for surveys, quizzes, and interviews. Perfect for educational content and engagement.',
    keywords: ['question generator', 'create questions', 'survey questions', 'quiz generator', 'interview questions']
  },
  'facebook-post-generator': {
    title: 'Facebook Post Generator - Create Facebook Content',
    description: 'Create Facebook post drafts from a topic and audience selection. Review generated claims, links, hashtags, and calls to action before publishing.',
    keywords: ['Facebook post generator', 'Facebook content', 'social media posts', 'engagement content', 'Facebook marketing']
  },
  'instagram-caption-generator': {
    title: 'Instagram Caption Generator - Create Captions',
    description: 'Create Instagram caption drafts from the post context you provide, with optional hashtags. Review wording, claims, brand references, and hashtags before publishing.',
    keywords: ['Instagram caption generator', 'Instagram captions', 'caption writer', 'hashtag generator', 'Instagram content']
  },
  'linkedin-post-generator': {
    title: 'LinkedIn Post Generator - Create Post Drafts',
    description: 'Create LinkedIn post drafts from a topic and selected length. Personalize the result and verify factual or professional claims before publishing.',
    keywords: ['LinkedIn post generator', 'LinkedIn content', 'professional posts', 'business content', 'thought leadership']
  },
  'twitter-generator': {
    title: 'Tweet Generator - Create Twitter/X Posts',
    description: 'Create short Twitter/X post options from a topic and tone while aiming to stay within the requested character limit. Review each option before publishing.',
    keywords: ['tweet generator', 'Twitter post creator', 'tweet writer', 'social media posts', 'X posts']
  },
  'youtube-title-generator': {
    title: 'YouTube Title Generator - Create Video Titles',
    description: 'Generate YouTube title ideas from a video topic and audience. Review suggestions for accuracy and fit; video performance is not guaranteed.',
    keywords: ['YouTube title generator', 'video title creator', 'YouTube SEO', 'title generator', 'video marketing']
  },
  'youtube-description-generator': {
    title: 'YouTube Description Generator - Create Video Descriptions',
    description: 'Create YouTube description drafts from a video title, content details, and optional keywords. Review links, claims, hashtags, and other details before publishing.',
    keywords: ['YouTube description generator', 'video description', 'YouTube SEO', 'description writer', 'video metadata']
  },
  'cold-email-writer': {
    title: 'Cold Email Writer - Generate Effective Cold Emails',
    description: 'Write persuasive cold emails that get responses. Generate conversion-focused cold outreach messages for sales and marketing.',
    keywords: ['cold email writer', 'cold email generator', 'outreach emails', 'sales email', 'email marketing']
  },
  'blog-rewriter': {
    title: 'Blog Post Rewriter - Rewrite & Refresh Blog Content',
    description: 'Rewrite existing blog posts with fresh perspective. Update and improve old content to boost rankings and engagement.',
    keywords: ['blog rewriter', 'rewrite blog posts', 'content update', 'blog refresh', 'content rewriting']
  },
  'poem-generator': {
    title: 'Poem Generator - Create Poems with AI',
    description: 'Generate creative poems in various styles and formats. Perfect for creative expression, cards, and special occasions.',
    keywords: ['poem generator', 'poetry generator', 'poem writer', 'create poems', 'AI poetry']
  },
  'tiktok-caption-generator': {
    title: 'TikTok Caption Generator - Create TikTok Captions',
    description: 'Create TikTok caption drafts from a video description and style preference, with suggested hooks, hashtags, and calls to action. Social performance is not guaranteed.',
    keywords: ['TikTok caption generator', 'TikTok captions', 'caption writer', 'TikTok content', 'video captions']
  },
};

function getSeoData(toolId: string, tool: NonNullable<ReturnType<typeof getToolById>>) {
  return toolSEODatabase[toolId] || {
    title: `${tool.title} - Free AI Writing Tool | SimplifyConvert`,
    description: tool.description,
    keywords: [tool.title, 'AI writer', 'content generator', 'free tool']
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Resolve slug to actual tool ID (handles aliases)
  const toolId = resolveToolId(slug);
  
  if (!toolId) {
    // Tool not found - return noindex for 404
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }
  
  // Get the actual tool using resolved ID
  const tool = getToolById(toolId);
  
  if (!tool) {
    return {
      title: 'Tool Not Found - SimplifyConvert',
      robots: { index: false },
    };
  }

  // Get tool-specific SEO data or use defaults
  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/ai-tools/${toolId}`;
  const seoData = getSeoData(toolId, tool);

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'SimplifyConvert',
      title: seoData.title,
      description: seoData.description,
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: tool.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.title,
      description: seoData.description,
      images: [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default function AiToolsSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  return <AiToolsSlugLayoutContent params={params}>{children}</AiToolsSlugLayoutContent>;
}

async function AiToolsSlugLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const toolId = resolveToolId(slug);
  const tool = toolId ? getToolById(toolId) : null;

  if (!tool) {
    notFound();
  }

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/ai-tools/${toolId}`;
  const seoData = getSeoData(toolId, tool);
  const faqItems = getAiToolFaqs(toolId);

  const softwareApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: seoData.description,
    url: canonicalUrl,
    applicationCategory: 'WritingApplication',
    operatingSystem: 'Web',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'SimplifyConvert',
      url: baseUrl,
    },
  };

  const faqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  const breadcrumbListSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'All Tools',
        item: `${baseUrl}/all-tools`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'AI Tools',
        item: `${baseUrl}/all-tools/ai-tools`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: tool.title,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      {children}
    </>
  );
}
