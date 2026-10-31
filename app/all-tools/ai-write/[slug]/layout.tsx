import { Metadata } from 'next';
import { getToolById } from '@/app/lib/ai-tools';

interface Params {
  slug: string;
}

/**
 * URL aliases for AI tools
 * Maps alternative slugs/URLs to correct tool IDs
 */
const toolAliases: Record<string, string> = {
  'summarizer': 'content-summarizer',
  'email-writer': 'cold-email-writer',
  'blog-generator': 'blog-post-generator',
  'social-media-writer': 'instagram-caption-generator',
  'social-media': 'instagram-caption-generator',
  'social': 'instagram-caption-generator',
};

/**
 * Resolve tool slug to actual tool ID
 */
function resolveToolId(slug: string): string {
  const directTool = getToolById(slug);
  if (directTool) {
    return slug;
  }
  
  const aliasedId = toolAliases[slug];
  if (aliasedId) {
    const aliasTool = getToolById(aliasedId);
    if (aliasTool) {
      return aliasedId;
    }
  }
  
  return '';
}

// Comprehensive SEO metadata database for AI writing tools
const toolSEODatabase: Record<string, {
  title: string;
  description: string;
  keywords: string[];
}> = {
  'paragraph-writer': {
    title: 'Paragraph Writer - AI Paragraph Generator & Creator',
    description: 'Generate paragraph drafts from your input for essays, articles, and other writing tasks. Review and edit the result before use.',
    keywords: ['paragraph writer', 'paragraph generator', 'AI paragraph creator', 'write paragraphs', 'essay paragraphs']
  },
  'content-improver': {
    title: 'Content Improver - Enhance & Polish Your Writing',
    description: 'Generate a revised version of your text with changes to clarity, tone, and readability. Review the output to confirm the intended meaning is preserved.',
    keywords: ['content improver', 'text enhancer', 'writing improvement', 'content quality', 'text polish']
  },
  'content-summarizer': {
    title: 'Content Summarizer - Condensed Text & Key Points',
    description: 'Generate shorter summaries from longer text such as articles, documents, and research material. Check important details against the source.',
    keywords: ['summarizer', 'text summarization', 'content summary', 'AI summarizer', 'condense text']
  },
  'grammar-fixer': {
    title: 'Grammar Fixer - Fix Grammar & Punctuation Errors',
    description: 'Automatically fix grammar, punctuation, and spelling mistakes. Improve your writing with our AI grammar checker and correction tool.',
    keywords: ['grammar fixer', 'grammar checker', 'spell checker', 'punctuation fixer', 'grammar correction']
  },
  'translate': {
    title: 'AI Text Translator - Translate Between Languages',
    description: 'Translate text between supported languages using AI assistance. Important, technical, or sensitive translations should be reviewed by a qualified person.',
    keywords: ['translator', 'AI translator', 'language translator', 'text translation', 'translate text']
  },
  'blog-post-generator': {
    title: 'Blog Post Generator - Create Blog Posts with AI',
    description: 'Generate blog-post drafts from your topic and instructions. Review facts, structure, search intent, and wording before publication.',
    keywords: ['blog generator', 'blog post creator', 'blog writer AI', 'article generator', 'blog content']
  },
  'faq-generator': {
    title: 'FAQ Generator - Create FAQs & Q&A Content',
    description: 'Generate FAQ drafts for product pages, help centers, and support documentation based on the information you provide.',
    keywords: ['FAQ generator', 'FAQ creator', 'Q&A generator', 'question and answer', 'FAQ content']
  },
  'article-writer': {
    title: 'Article Writer - AI Article Generation Tool',
    description: 'Generate article drafts from your topic and instructions for blogs and other publishing workflows. Verify facts and sources before publication.',
    keywords: ['article writer', 'article generator', 'AI writer', 'article creation', 'content writing']
  },
  'article-rewriter': {
    title: 'Article Rewriter - Rewrite & Rephrase Articles',
    description: 'Rewrite existing articles with fresh perspective. Our AI rewriter maintains meaning while creating unique variations of your content.',
    keywords: ['article rewriter', 'rewrite tool', 'rewrite article', 'rephrase', 'content rewriter']
  },
  'email-writer': {
    title: 'Email Writer - Professional Email Generator',
    description: 'Generate email drafts for marketing, support, sales, and other communication tasks. Edit the result for your audience and situation.',
    keywords: ['email writer', 'email generator', 'professional email', 'email templates', 'email copy']
  },
  'essay-writer': {
    title: 'Essay Writer - AI Essay Generator & Creator',
    description: 'Generate complete essays with proper structure. Our essay writing tool helps you organize thoughts and create well-written essays.',
    keywords: ['essay writer', 'essay generator', 'essay creator', 'write essays', 'essay help']
  },
  'story-generator': {
    title: 'Story Generator - Create Stories with AI',
    description: 'Generate story, plot, and narrative drafts for creative-writing and fiction projects.',
    keywords: ['story generator', 'story writer', 'creative writing', 'fiction generator', 'story creator']
  },
  'product-description-writer': {
    title: 'Product Description Writer - Create Product Copy',
    description: 'Generate product-description drafts for e-commerce listings. Review product facts, claims, keywords, and brand wording before publishing.',
    keywords: ['product description generator', 'product copy writer', 'product description', 'ecommerce content', 'product writing']
  },
  'cover-letter-writer': {
    title: 'Cover Letter Writer - Professional Cover Letter Generator',
    description: 'Generate a cover-letter draft from the information you provide. Personalize and verify the final letter before submitting an application.',
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
    description: 'Expand shorter text into a longer draft with additional detail. Review the result for accuracy, relevance, and unnecessary repetition.',
    keywords: ['text expander', 'content expander', 'expand text', 'lengthen content', 'text expansion']
  },
  'outline-generator': {
    title: 'Outline Generator - Create Content Outlines',
    description: 'Generate structured outlines for essays, articles, and documents. Organize your ideas before writing with AI-powered outlines.',
    keywords: ['outline generator', 'content outline', 'essay outline', 'article outline', 'create outline']
  },
  'title-rewriter': {
    title: 'Title Rewriter - Generate Alternative Titles',
    description: 'Generate alternative title and headline ideas for articles, blogs, and other content. Choose and edit suggestions based on your audience and context.',
    keywords: ['title rewriter', 'headline generator', 'title generator', 'SEO titles', 'generate headlines']
  },
  'question-generator': {
    title: 'Question Generator - Create Questions & Prompts',
    description: 'Generate question ideas for surveys, quizzes, interviews, and educational material based on the context you provide.',
    keywords: ['question generator', 'create questions', 'survey questions', 'quiz generator', 'interview questions']
  },
  'facebook-post-generator': {
    title: 'Facebook Post Generator - Create Facebook Content',
    description: 'Generate engaging Facebook posts that drive engagement. Create viral-worthy content for your Facebook business page.',
    keywords: ['Facebook post generator', 'Facebook content', 'social media posts', 'engagement content', 'Facebook marketing']
  },
  'instagram-caption-generator': {
    title: 'Instagram Caption Generator - Create Captions',
    description: 'Generate Instagram caption and hashtag ideas from your input. Edit suggestions to match your post, audience, and brand voice.',
    keywords: ['Instagram caption generator', 'Instagram captions', 'caption writer', 'hashtag generator', 'Instagram content']
  },
  'linkedin-post-generator': {
    title: 'LinkedIn Post Generator - Professional Content',
    description: 'Create professional LinkedIn posts that drive engagement. Generate thought leadership content for business networking.',
    keywords: ['LinkedIn post generator', 'LinkedIn content', 'professional posts', 'business content', 'thought leadership']
  },
  'twitter-generator': {
    title: 'Tweet Generator - Create Twitter/X Posts',
    description: 'Generate viral tweets and engaging Twitter content. Create concise, impactful posts within character limits.',
    keywords: ['tweet generator', 'Twitter post creator', 'tweet writer', 'social media posts', 'X posts']
  },
  'youtube-title-generator': {
    title: 'YouTube Title Generator - Create Video Titles',
    description: 'Generate YouTube title ideas from your video topic and instructions. Review suggestions for accuracy, relevance, and audience fit.',
    keywords: ['YouTube title generator', 'video title creator', 'YouTube SEO', 'title generator', 'video marketing']
  },
  'youtube-description-generator': {
    title: 'YouTube Description Generator - Create Video Descriptions',
    description: 'Generate YouTube description drafts from your video details. Review links, claims, keywords, and factual information before publishing.',
    keywords: ['YouTube description generator', 'video description', 'YouTube SEO', 'description writer', 'video metadata']
  },
  'cold-email-writer': {
    title: 'Cold Email Writer - Generate Effective Cold Emails',
    description: 'Generate cold-email drafts for sales and marketing outreach. Personalize the message and review it for relevance, accuracy, and applicable outreach rules.',
    keywords: ['cold email writer', 'cold email generator', 'outreach emails', 'sales email', 'email marketing']
  },
  'blog-rewriter': {
    title: 'Blog Post Rewriter - Rewrite & Refresh Blog Content',
    description: 'Generate a revised version of an existing blog post. Review the rewrite for accuracy, originality, search intent, and current information.',
    keywords: ['blog rewriter', 'rewrite blog posts', 'content update', 'blog refresh', 'content rewriting']
  },
  'poem-generator': {
    title: 'Poem Generator - Create Poems with AI',
    description: 'Generate poem drafts in different styles and formats for creative writing, cards, and other personal projects.',
    keywords: ['poem generator', 'poetry generator', 'poem writer', 'create poems', 'AI poetry']
  },
  'tiktok-caption-generator': {
    title: 'TikTok Caption Generator - Create TikTok Captions',
    description: 'Generate TikTok caption and hashtag ideas from your input. Review and edit suggestions to match the video and intended audience.',
    keywords: ['TikTok caption generator', 'TikTok captions', 'caption writer', 'TikTok content', 'video captions']
  },
};

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
  const seoData = toolSEODatabase[toolId] || {
    title: `${tool.title} - Free AI Writing Tool | SimplifyConvert`,
    description: tool.description,
    keywords: [tool.title, 'AI writer', 'content generator', 'free tool']
  };

  const baseUrl = 'https://simplifyconvert.com';
  const canonicalUrl = `${baseUrl}/all-tools/ai-tools/${toolId}`;

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    robots: {
      index: false,
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

export default function AiWriteSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
