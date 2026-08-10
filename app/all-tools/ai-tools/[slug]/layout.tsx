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
    description: 'Create a paragraph draft from a topic, tone, and length selection. Review the generated wording for accuracy, relevance, and fit before using it.',
    keywords: ['paragraph writer', 'paragraph generator', 'AI paragraph creator', 'write paragraphs', 'essay paragraphs']
  },
  'content-improver': {
    title: 'Content Improver - Enhance & Polish Your Writing',
    description: 'Rewrite supplied text to improve clarity, tone, and readability while aiming to preserve the original meaning. Review the result for unintended changes.',
    keywords: ['content improver', 'text enhancer', 'writing improvement', 'content quality', 'text polish']
  },
  'content-summarizer': {
    title: 'Content Summarizer - Condensed Text & Key Points',
    description: 'Create a shorter summary from supplied text while preserving the main points where possible. Review the result for omitted context, factual accuracy, and important details.',
    keywords: ['summarizer', 'text summarization', 'content summary', 'AI summarizer', 'condense text']
  },
  'grammar-fixer': {
    title: 'Grammar Fixer - Fix Grammar & Punctuation Errors',
    description: 'Review supplied text for possible grammar, punctuation, and spelling corrections. Check suggested changes before using the revised version.',
    keywords: ['grammar fixer', 'grammar checker', 'spell checker', 'punctuation fixer', 'grammar correction']
  },
  'translate': {
    title: 'AI Text Translator - Translate Between Languages',
    description: 'Translate supplied text using the available language options. Translation quality can vary by language, context, terminology, and source wording.',
    keywords: ['translator', 'AI translator', 'language translator', 'text translation', 'translate text']
  },
  'blog-post-generator': {
    title: 'Blog Post Generator - Create Blog Posts with AI',
    description: 'Create a blog-post draft from a topic and available settings. Verify facts, sources, claims, links, and other publishable details before use.',
    keywords: ['blog generator', 'blog post creator', 'blog writer AI', 'article generator', 'blog content']
  },
  'faq-generator': {
    title: 'FAQ Generator - Create FAQs & Q&A Content',
    description: 'Generate FAQ question-and-answer drafts from a topic or supplied content. Review each answer for accuracy, completeness, and suitability before publishing.',
    keywords: ['FAQ generator', 'FAQ creator', 'Q&A generator', 'question and answer', 'FAQ content']
  },
  'article-writer': {
    title: 'Article Writer - AI Article Generation Tool',
    description: 'Create an article draft from a topic, audience, and article type. Verify facts, quotations, dates, sources, and other publishable details before use.',
    keywords: ['article writer', 'article generator', 'AI writer', 'article creation', 'content writing']
  },
  'article-rewriter': {
    title: 'Article Rewriter - Rewrite & Rephrase Articles',
    description: 'Rewrite an existing article with alternative wording and structure while aiming to preserve its main subject. Review the result for factual accuracy, attribution, originality, and unintended changes.',
    keywords: ['article rewriter', 'rewrite tool', 'rewrite article', 'rephrase', 'content rewriter']
  },
  'email-writer': {
    title: 'Email Writer - Professional Email Generator',
    description: 'Create an email draft from the supplied purpose and context. Personalize the wording and verify names, claims, offers, links, and other details before sending.',
    keywords: ['email writer', 'email generator', 'professional email', 'email templates', 'email copy']
  },
  'essay-writer': {
    title: 'Essay Writer - AI Essay Generator & Creator',
    description: 'Create an essay draft from a topic and selected essay type. Review the structure, facts, sources, citations, assignment requirements, and academic integrity rules before use.',
    keywords: ['essay writer', 'essay generator', 'essay creator', 'write essays', 'essay help']
  },
  'story-generator': {
    title: 'Story Generator - Create Stories with AI',
    description: 'Create a fictional story draft from a supplied idea and available story settings. Review the result for continuity, originality, tone, and audience suitability.',
    keywords: ['story generator', 'story writer', 'creative writing', 'fiction generator', 'story creator']
  },
  'product-description-writer': {
    title: 'Product Description Writer - Create Product Copy',
    description: 'Create product-description drafts from supplied product details, features, and tone. Review specifications, benefits, and commercial claims before publishing.',
    keywords: ['product description generator', 'product copy writer', 'product description', 'ecommerce content', 'product writing']
  },
  'cover-letter-writer': {
    title: 'Cover Letter Writer - Professional Cover Letter Generator',
    description: 'Create a cover-letter draft from the role, company, and experience you provide. Verify achievements, qualifications, and employer details before submitting it.',
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
    description: 'Expand short text into a longer draft with added context, examples, and explanation. Review generated additions for accuracy and consistency with the original meaning.',
    keywords: ['text expander', 'content expander', 'expand text', 'lengthen content', 'text expansion']
  },
  'outline-generator': {
    title: 'Outline Generator - Create Content Outlines',
    description: 'Create a proposed content outline with sections, subsections, and key points from the topic and content type you provide.',
    keywords: ['outline generator', 'content outline', 'essay outline', 'article outline', 'create outline']
  },
  'title-rewriter': {
    title: 'Title Rewriter - Generate Alternative Titles',
    description: 'Create alternative titles and headlines from an existing title and optional content context. Review each option for clarity and accuracy before publishing.',
    keywords: ['title rewriter', 'headline generator', 'title generator', 'SEO titles', 'generate headlines']
  },
  'question-generator': {
    title: 'Question Generator - Create Questions & Prompts',
    description: 'Generate question ideas from a topic for engagement, reflection, research, or brainstorming, then review them for relevance and clarity.',
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
    description: 'Create a cold-outreach email draft from the recipient, purpose, and tone you provide. Personalize the message and verify claims, offers, links, and recipient details before sending.',
    keywords: ['cold email writer', 'cold email generator', 'outreach emails', 'sales email', 'email marketing']
  },
  'blog-rewriter': {
    title: 'Blog Post Rewriter - Rewrite & Refresh Blog Content',
    description: 'Rewrite an existing blog-post draft with alternative wording and organization while aiming to preserve its main topic. Review facts, links, claims, attribution, and meaning before publishing.',
    keywords: ['blog rewriter', 'rewrite blog posts', 'content update', 'blog refresh', 'content rewriting']
  },
  'poem-generator': {
    title: 'Poem Generator - Create Poems with AI',
    description: 'Create a poetry draft from a topic and selected style. Review and revise generated wording when originality, poetic form, tone, or publication use matters.',
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
