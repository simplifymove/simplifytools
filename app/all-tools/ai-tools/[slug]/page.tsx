'use client';

import React, { use, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Copy, RefreshCw, Download, ArrowLeft, Loader, ChevronRight, Zap, Shield, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { getToolById } from '@/app/lib/ai-tools';
import { getAiToolFaqs } from '@/app/lib/ai-tool-faqs';
import { HomeHeader } from '@/app/components/HomeHeader';
import { Footer } from '@/app/components/Footer';
import AIDetectorResults from '@/app/components/AIDetectorResults';
import { RelatedToolsSection } from '@/app/components/RelatedToolsSection';
import { uploadBrowserTextDownloadResult } from '@/app/lib/download-result-client';

/**
 * URL aliases for AI tools (must match layout.tsx aliases)
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

// Action-specific CTA text for each tool
function getActionText(toolId: string): string {
  const actionMap: Record<string, string> = {
    'ai-detector': 'Analyze Text',
    'paragraph-writer': 'Write Paragraph',
    'content-improver': 'Improve Content',
    'content-summarizer': 'Summarize Content',
    'grammar-fixer': 'Fix Grammar',
    'translate': 'Translate',
    'blog-post-generator': 'Generate Blog Post',
    'faq-generator': 'Generate FAQs',
    'article-writer': 'Write Article',
    'article-rewriter': 'Rewrite Article',
    'blog-rewriter': 'Rewrite Blog',
    'email-writer': 'Write Email',
    'essay-writer': 'Write Essay',
    'story-generator': 'Generate Story',
    'poem-generator': 'Create Poem',
    'product-description-writer': 'Write Description',
    'cover-letter-writer': 'Write Cover Letter',
    'sentence-rewriter': 'Rewrite Sentence',
    'social-media-writer': 'Create Post',
    'facebook-post-generator': 'Generate Post',
    'instagram-caption-generator': 'Create Caption',
    'linkedin-post-generator': 'Generate Post',
    'twitter-generator': 'Create Tweet',
    'youtube-title-generator': 'Generate Title',
    'youtube-description-generator': 'Generate Description',
    'tiktok-caption-generator': 'Create Caption',
    'cold-email-writer': 'Write Email',
    'question-generator': 'Generate Questions',
    'outline-generator': 'Generate Outline',
    'title-rewriter': 'Rewrite Title',
    'tone-of-voice': 'Change Tone',
    'text-expander': 'Expand Text',
  };

  return actionMap[toolId] || 'Generate Content';
}

type ToolSeoContent = {
  introduction: string;
  useCases: string[];
  examples: Array<{ label: string; input: string; output: string }>;
};

const topToolSeoContent: Record<string, ToolSeoContent> = {
  'ai-detector': {
    introduction: 'The AI Detector examines text for statistical and linguistic characteristics associated with AI-generated writing. It returns an estimate, not proof of who or what authored the text.',
    useCases: ['Review a passage for signals worth investigating further', 'Compare detector observations with independent context', 'Identify writing patterns that may merit a closer human review', 'Support a discussion without treating a score as a verdict'],
    examples: [
      {
        label: 'Text analysis',
        input: 'A meaningful passage supplied by the user for analysis.',
        output: 'A probabilistic likelihood assessment with indicators and limitations, not a definitive authorship decision.',
      },
    ],
  },
  'paragraph-writer': {
    introduction: 'The Paragraph Writer helps turn a topic, title, or rough idea into a clear paragraph that is ready to review and adapt. It is useful when you need a polished starting point for essays, articles, landing pages, reports, or everyday writing.',
    useCases: ['Draft essay body paragraphs from a topic sentence', 'Create article sections when you know the key idea', 'Write product, service, or feature explanations', 'Turn brief notes into readable prose'],
    examples: [
      {
        label: 'Topic to paragraph',
        input: 'Benefits of remote work for small businesses',
        output: 'Remote work can help small businesses reduce overhead, hire from a wider talent pool, and give employees more flexibility while maintaining productivity.',
      },
    ],
  },
  'content-improver': {
    introduction: 'The Content Improver rewrites existing text to make it clearer, smoother, and easier to read while preserving the original meaning. It is designed for drafts that already have the right ideas but need stronger structure, tone, or wording.',
    useCases: ['Polish blog drafts before publishing', 'Improve emails, reports, and proposals', 'Make rough notes sound more professional', 'Improve readability without changing the core message'],
    examples: [
      {
        label: 'Rough draft to polished copy',
        input: 'Our app helps teams do work better and faster with less confusion.',
        output: 'Our app helps teams work faster, stay aligned, and reduce confusion across everyday projects.',
      },
    ],
  },
  'content-summarizer': {
    introduction: 'The Content Summarizer condenses longer text into a shorter version that keeps the most important ideas. Use it to understand lengthy articles, documents, research notes, transcripts, or internal updates faster.',
    useCases: ['Summarize articles before sharing them', 'Extract key points from meeting notes', 'Condense research material for review', 'Create quick summaries for emails or reports'],
    examples: [
      {
        label: 'Long text to key summary',
        input: 'A 1,200-word article about how remote teams manage async communication.',
        output: 'Remote teams work best when they document decisions, set response expectations, and reserve meetings for complex discussions.',
      },
    ],
  },
  'grammar-fixer': {
    introduction: 'The Grammar Fixer checks text for grammar, spelling, punctuation, and clarity issues. It helps clean up drafts while keeping your intended meaning intact.',
    useCases: ['Fix emails before sending', 'Clean up essays and assignments', 'Correct grammar in blog or website copy', 'Improve punctuation and sentence flow'],
    examples: [
      {
        label: 'Grammar correction',
        input: 'Their is many reason why this feature are useful.',
        output: 'There are many reasons why this feature is useful.',
      },
    ],
  },
  'translate': {
    introduction: 'The Translate tool converts text into another language for quick drafts, localization checks, and everyday communication. It is most useful when paired with human review for important, technical, legal, or brand-sensitive content.',
    useCases: ['Translate short messages or support replies', 'Create first-draft localized content', 'Understand text written in another language', 'Prepare multilingual social or marketing copy'],
    examples: [
      {
        label: 'English to Spanish',
        input: 'Thank you for your order. We will send tracking details soon.',
        output: 'Gracias por su pedido. Enviaremos los detalles de seguimiento pronto.',
      },
    ],
  },
  'blog-post-generator': {
    introduction: 'The Blog Post Generator creates a structured draft from a topic, keywords, audience, and tone. It is built to help you move from idea to editable article faster, not to replace editorial review.',
    useCases: ['Draft SEO blog posts from a target topic', 'Create article sections for a content calendar', 'Generate first drafts for educational content', 'Turn outlines into readable articles'],
    examples: [
      {
        label: 'Topic to blog draft',
        input: 'How small businesses can improve local SEO',
        output: 'A structured article covering Google Business Profile, local keywords, reviews, location pages, and measurement tips.',
      },
    ],
  },
  'faq-generator': {
    introduction: 'The FAQ Generator creates question-and-answer sections for products, services, guides, landing pages, and help-center articles. It helps cover common objections and support questions before users need to ask.',
    useCases: ['Create FAQs for product pages', 'Draft help-center question sets', 'Add support content to landing pages', 'Turn documentation topics into Q&A format'],
    examples: [
      {
        label: 'Topic to FAQ',
        input: 'Online invoice generator for freelancers',
        output: 'Questions about pricing, data privacy, exporting invoices, tax fields, payment terms, and client sharing.',
      },
    ],
  },
  'word-counter': {
    introduction: 'The Word Counter measures text length and readability signals so you can check whether a draft fits a limit or needs editing. It is useful for essays, social posts, meta copy, articles, and any writing with length constraints.',
    useCases: ['Check essay or assignment length', 'Review social post character counts', 'Measure article draft size', 'Compare short and long versions of copy'],
    examples: [
      {
        label: 'Text measurement',
        input: 'Paste a product description or article draft.',
        output: 'Word count, character count, and readability-style metrics for quick review.',
      },
    ],
  },
  'sentence-rewriter': {
    introduction: 'The Sentence Rewriter creates clearer alternatives for individual sentences. It is best for fixing awkward phrasing, reducing repetition, or changing sentence style without rewriting an entire document.',
    useCases: ['Rewrite awkward sentences', 'Make a sentence more concise', 'Create clearer alternatives for headlines or intros', 'Adjust tone one sentence at a time'],
    examples: [
      {
        label: 'Sentence rewrite',
        input: 'This solution is something that can help teams in a way that saves time.',
        output: 'This solution helps teams save time.',
      },
    ],
  },
  'paragraph-rewriter': {
    introduction: 'The Paragraph Rewriter refreshes a full paragraph while keeping its main idea. It helps improve flow, reduce repetition, and create a cleaner version of text that already has the right direction.',
    useCases: ['Rewrite paragraphs for clarity', 'Refresh duplicated or stale copy', 'Improve transitions and flow', 'Adapt paragraph tone for a different audience'],
    examples: [
      {
        label: 'Paragraph rewrite',
        input: 'A rough paragraph explaining why a new feature helps customers save time.',
        output: 'A clearer version that explains the benefit, removes repetition, and connects the idea to the reader.',
      },
    ],
  },
  'ai-humanizer': {
    introduction: 'The AI Humanizer rewrites stiff or formulaic text so it reads more naturally while keeping the main idea intact. Use it as an editing aid for drafts that need better rhythm, clearer wording, or a more appropriate voice. Humanized wording does not guarantee that AI-detection systems will classify the text differently.',
    useCases: ['Make an AI-assisted draft sound less repetitive or mechanical', 'Adjust awkward wording before publishing or sharing', 'Improve sentence rhythm while preserving the main message', 'Create a more natural starting point for further human editing'],
    examples: [
      {
        label: 'Formal draft to natural wording',
        input: 'It is important to note that the implementation of this feature provides users with an enhanced level of convenience.',
        output: 'This feature makes the experience more convenient for users.',
      },
    ],
  },
  'article-rewriter': {
    introduction: 'The Article Rewriter creates a fresh version of an existing article while preserving its central subject and useful information. It can help change structure, tone, or phrasing, but rewritten material should still be checked for factual accuracy, attribution, and originality.',
    useCases: ['Refresh an older article without starting from a blank page', 'Adapt an article for a different audience or tone', 'Improve repetitive or awkward sections in a draft', 'Restructure your own material while keeping its main points'],
    examples: [
      {
        label: 'Article refresh',
        input: 'An existing article explaining practical ways small businesses can reduce unnecessary operating costs.',
        output: 'A reorganized draft covering the same core topic with clearer sections, updated phrasing, and a more direct introduction.',
      },
    ],
  },
  'blog-post-rewriter': {
    introduction: 'The Blog Post Rewriter helps revise an existing blog draft by changing wording, organization, and flow while retaining the intended topic. It is useful for refreshing your own content, but important facts, links, examples, and claims should be reviewed before the revised post is published.',
    useCases: ['Refresh an older blog post that feels dated or repetitive', 'Rewrite a draft for a different reader or brand voice', 'Improve the flow between blog sections', 'Create an alternative version of your own source material for editorial review'],
    examples: [
      {
        label: 'Blog draft refresh',
        input: 'A previous blog post covering five practical tips for improving remote team communication.',
        output: 'A revised post with a clearer opening, reorganized tips, smoother transitions, and wording ready for further editorial review.',
      },
    ],
  },
  'content-paraphraser': {
    introduction: 'The Content Paraphraser expresses existing text with different wording while aiming to preserve the original meaning. It can help clarify your own drafts or explore alternative phrasing, but paraphrasing does not remove the need to credit sources or follow copyright and academic integrity requirements.',
    useCases: ['Explore alternative wording for your own draft', 'Simplify a passage that feels unnecessarily complicated', 'Reduce repetition across nearby sentences', 'Rephrase notes before adding your own analysis and context'],
    examples: [
      {
        label: 'Clearer paraphrase',
        input: 'Regular communication enables project teams to identify potential problems before those problems become difficult to resolve.',
        output: 'Frequent communication helps project teams spot issues early, before they become harder to fix.',
      },
    ],
  },
  'tone-of-voice': {
    introduction: 'The Tone of Voice Converter rewrites text to better match a selected communication style, such as professional, friendly, concise, or persuasive. It changes presentation rather than underlying facts, so the revised version should still be checked for meaning, audience fit, and accuracy.',
    useCases: ['Make a customer message sound warmer and more approachable', 'Turn casual wording into a more professional business message', 'Adjust marketing copy for a particular audience', 'Compare different ways to express the same information'],
    examples: [
      {
        label: 'Casual to professional',
        input: 'Hey, just checking if you got the files I sent yesterday.',
        output: 'Hello, I wanted to confirm that you received the files I sent yesterday.',
      },
    ],
  },
  'essay-writer': {
    introduction: 'The Essay Writer creates a structured draft from a topic and the selected essay type. Use the generated text as a starting point for planning, revision, and research rather than as a substitute for checking facts, sources, assignment requirements, or academic integrity rules.',
    useCases: ['Create a first draft from an essay topic', 'Explore a possible structure for persuasive or informative writing', 'Develop ideas before revising them in your own voice', 'Compare different approaches to the same essay topic'],
    examples: [
      {
        label: 'Informative essay draft',
        input: 'Topic: How urban green spaces affect daily life. Essay type: Informative.',
        output: 'A structured draft introducing the topic, developing several relevant points, and providing a conclusion that can be revised and supported with verified sources.',
      },
    ],
  },
  'article-writer': {
    introduction: 'The Article Writer generates an article draft from the topic, audience, and article type you provide. The result can help with structure and initial wording, but factual claims, quotations, dates, sources, and other publishable details should be independently reviewed before use.',
    useCases: ['Draft an article outline and first version from a topic', 'Explore how a subject could be explained to a particular audience', 'Create a starting draft for a how-to or opinion article', 'Develop article sections for further research and editing'],
    examples: [
      {
        label: 'How-to article draft',
        input: 'Topic: Organizing digital files for a small business. Audience: Small business owners. Type: How-To Guide.',
        output: 'A practical article draft organized into steps, with an introduction and conclusion ready for fact-checking, examples, and editorial revision.',
      },
    ],
  },
  'story-generator': {
    introduction: 'The Story Generator turns a supplied story idea into a creative draft using the available story settings. Generated characters, events, and wording can be revised freely, and the result should be reviewed if originality, continuity, or suitability for a particular audience is important.',
    useCases: ['Turn a short story idea into a fuller creative draft', 'Explore characters, scenes, or plot directions', 'Create a writing prompt when you are unsure how to begin', 'Generate an alternative story direction for further editing'],
    examples: [
      {
        label: 'Story idea expansion',
        input: 'A night-shift librarian discovers that one book changes its ending every morning.',
        output: 'A fictional story draft that develops the setting, introduces a central character, builds a conflict around the changing book, and provides a possible ending.',
      },
    ],
  },
  'fiction-writer': {
    introduction: 'The Fiction Writer develops a short fictional draft from a premise and optional genre selection. It can help explore plot, character, conflict, and pacing, but generated creative material may still need substantial revision for consistency, originality, voice, and publication quality.',
    useCases: ['Develop a premise into a short fiction draft', 'Explore how the same premise works in different genres', 'Generate possible scenes, conflicts, and character interactions', 'Create material to revise into your own narrative voice'],
    examples: [
      {
        label: 'Mystery fiction draft',
        input: 'Genre: Mystery. Premise: A hotel guest receives a room key for a floor that does not appear in the elevator.',
        output: 'A short mystery draft with an opening hook, developing clues, escalating tension, and a conclusion that can be expanded or rewritten.',
      },
    ],
  },
  'poem-generator': {
    introduction: 'The Poem Generator creates a poetry draft from a topic and optional style such as haiku, sonnet, free verse, acrostic, or limerick. Treat the result as generated creative material to review and revise, especially when originality, strict poetic form, or publication use matters.',
    useCases: ['Explore a theme through a selected poetry style', 'Generate a starting draft for further creative editing', 'Compare different poetic approaches to the same topic', 'Experiment with form, imagery, and wording'],
    examples: [
      {
        label: 'Free-verse draft',
        input: 'Topic: The first rain after a long summer. Style: Free Verse.',
        output: 'A free-verse poetry draft using imagery around heat, rain, changing air, and the transition between seasons.',
      },
    ],
  },


  'cold-email-writer': {
    introduction: 'The Cold Email Writer creates an outreach draft from the recipient or company, purpose, and tone you provide. Use the result as a starting point for a relevant message rather than assuming generated wording will produce opens, replies, meetings, or sales.',
    useCases: ['Draft an initial outreach email to a prospective client or contact', 'Turn a short outreach goal into a structured message', 'Explore different wording for a professional introduction', 'Create a concise first draft before personalizing it for the recipient'],
    examples: [
      {
        label: 'Service introduction',
        input: 'Recipient: A small retail company. Purpose: Introduce a website performance audit service.',
        output: 'A concise outreach draft with a subject line, brief introduction, explanation of the proposed value, and a call to action ready for personalization.',
      },
    ],
  },
  'job-description-writer': {
    introduction: 'The Job Description Writer turns a job title, responsibilities, and required skills into a structured posting draft. Review responsibilities, qualifications, compensation language, benefits, employment terms, and local hiring requirements before publishing the result.',
    useCases: ['Organize supplied responsibilities into a job-posting draft', 'Create a first version of a role overview and qualifications section', 'Turn hiring notes into clearer candidate-facing language', 'Prepare a draft for review by a hiring manager or HR team'],
    examples: [
      {
        label: 'Project coordinator role',
        input: 'Position: Project Coordinator. Responsibilities: Track tasks, coordinate meetings, prepare status updates. Skills: Communication, documentation, scheduling.',
        output: 'A structured job-description draft containing a role overview, responsibilities, qualifications, optional nice-to-haves, and sections that can be reviewed before publication.',
      },
    ],
  },
  'cover-letter-writer': {
    introduction: 'The Cover Letter Writer creates a job-application letter draft from the role, company, and experience or skills you provide. Generated wording should be checked carefully so that achievements, experience, qualifications, and statements about the employer remain accurate and genuinely reflect the applicant.',
    useCases: ['Create a first cover-letter draft for a specific role', 'Organize relevant experience into application-focused paragraphs', 'Explore ways to connect supplied skills with a job opportunity', 'Prepare a draft to personalize further before submitting an application'],
    examples: [
      {
        label: 'Role-specific cover letter',
        input: 'Job: UX Designer. Company: Example Studio. Skills: User research, Figma, prototyping, usability testing.',
        output: 'A cover-letter draft connecting the supplied skills with the role, including an introduction, experience-focused body paragraphs, and a professional closing for further personalization.',
      },
    ],
  },
  'proposal-writer': {
    introduction: 'The Proposal Writer organizes a supplied project or service overview, deliverables, and timeline into a business-proposal draft. Treat generated budgets, assumptions, commitments, scope language, milestones, and commercial terms as placeholders unless you have explicitly provided and verified them.',
    useCases: ['Turn project notes into a structured proposal outline', 'Organize deliverables and milestones for client review', 'Create a first draft for a service or project proposal', 'Develop proposal sections before adding verified pricing and contractual terms'],
    examples: [
      {
        label: 'Website redesign proposal',
        input: 'Project: Redesign a company website. Deliverables: UX review, new interface designs, responsive pages. Timeline: Eight weeks.',
        output: 'A proposal draft organized into an executive summary, project context, proposed approach, deliverables, milestones, timeline, and sections requiring verified commercial details.',
      },
    ],
  },
  'press-release-writer': {
    introduction: 'The Press Release Writer creates an announcement draft from the news and organization details you provide. Names, dates, quotations, statistics, claims, contact information, style requirements, and other publishable facts should be verified before the release is distributed to journalists or published publicly.',
    useCases: ['Structure a company announcement as a press-release draft', 'Create a starting draft for product or organizational news', 'Organize supplied announcement details into a conventional release format', 'Prepare copy for communications or PR review before distribution'],
    examples: [
      {
        label: 'Product announcement',
        input: 'Organization: Example Software. Announcement: Launch of a new reporting dashboard for business customers.',
        output: 'A press-release draft with a headline, dateline placeholder, lead paragraph, supporting sections, organization description, and contact-information placeholder ready for factual review.',
      },
    ],
  },

  'instagram-caption-generator': {
    introduction: 'The Instagram Caption Generator creates a caption draft from the post description you provide, with an option to include hashtags. The generated caption can help with initial wording, but hashtags, calls to action, claims, brand references, and other details should be reviewed before publishing.',
    useCases: ['Draft a caption from a description of an Instagram post', 'Explore alternative wording for a photo, product, or announcement', 'Create a caption draft with optional hashtags', 'Prepare social copy for further brand or editorial review'],
    examples: [
      {
        label: 'Product photo caption',
        input: 'A photo introducing a new reusable travel bottle. Include hashtags.',
        output: 'An Instagram caption draft describing the product, followed by a call to action and suggested hashtags that can be reviewed before posting.',
      },
    ],
  },
  'facebook-post-generator': {
    introduction: 'The Facebook Post Generator turns a topic and optional audience selection into a social-post draft. It can help organize an announcement, update, or discussion prompt, but generated facts, promotional claims, hashtags, links, and calls to action should be checked before publication.',
    useCases: ['Draft a Facebook update from a supplied topic', 'Create a starting post for customers or a community audience', 'Explore conversational wording for an announcement', 'Prepare social copy for editing before it is published'],
    examples: [
      {
        label: 'Community update',
        input: 'Topic: Announce extended weekend opening hours. Audience: Community.',
        output: 'A conversational Facebook post draft explaining the update and inviting readers to respond, ready for the hours and other details to be verified.',
      },
    ],
  },
  'linkedin-post-generator': {
    introduction: 'The LinkedIn Post Generator creates a professional-networking post draft from a topic and selected length. Use the result as a starting point for your own perspective rather than assuming generated wording establishes expertise, authority, engagement, or thought leadership.',
    useCases: ['Draft a LinkedIn post about a professional topic', 'Turn a workplace observation into a structured post', 'Explore short, medium, or longer versions of an idea', 'Prepare a professional post for further personalization and fact-checking'],
    examples: [
      {
        label: 'Project lesson post',
        input: 'Topic: What a project team learned from simplifying weekly status updates. Length: Medium.',
        output: 'A LinkedIn post draft with an opening observation, a short explanation of the lesson, and a closing prompt that can be personalized before publishing.',
      },
    ],
  },
  'twitter-generator': {
    introduction: 'The Twitter Generator creates three short post options from a topic and selected tone while aiming to stay within the requested character limit. Review wording, facts, mentions, links, hashtags, and tone before publishing any generated option on X or another short-form platform.',
    useCases: ['Create several short-post options from one idea', 'Explore different concise ways to phrase an update', 'Draft short social copy in a selected tone', 'Compare generated options before writing or editing the final post'],
    examples: [
      {
        label: 'Feature update',
        input: 'Topic: A file-conversion tool now supports an additional export format. Tone: Professional.',
        output: 'Three concise post options presenting the update in slightly different wording for review before publishing.',
      },
    ],
  },
  'tiktok-caption-generator': {
    introduction: 'The TikTok Caption Generator creates a short caption draft from a description of the video and an optional style preference. It can suggest hooks, hashtags, calls to action, and emojis, but generated wording cannot guarantee views, followers, reach, engagement, or viral performance.',
    useCases: ['Draft a short caption from a description of a TikTok video', 'Explore hook ideas for educational or humorous videos', 'Create caption wording with suggested hashtags and emojis', 'Prepare several ideas for further editing before posting'],
    examples: [
      {
        label: 'Educational video caption',
        input: 'Video: Three quick ways to organize files before sharing them. Style: Educational.',
        output: 'A short caption draft with an opening hook, concise context, and suggested hashtags that can be reviewed before posting.',
      },
    ],
  },

  'product-description-writer': {
    introduction: 'The Product Description Writer creates a product-copy draft from the product name, supplied features, and selected tone. Use the result as a starting point for describing the product clearly, and verify specifications, benefits, pricing, guarantees, certifications, availability, and other commercial claims before publishing.',
    useCases: ['Turn supplied product features into a description draft', 'Explore benefit-focused wording for an e-commerce listing', 'Create alternative product-copy approaches for editorial review', 'Prepare a first draft that can be adjusted to match a brand voice'],
    examples: [
      {
        label: 'Product listing draft',
        input: 'Product: Wireless headphones. Features: Foldable design, Bluetooth connectivity, built-in microphone. Tone: Professional.',
        output: 'A product-description draft that organizes the supplied features into readable benefit-focused copy with wording ready for specification and claim review.',
      },
    ],
  },
  'keyword-generator': {
    introduction: 'The Keyword Generator creates keyword and topic ideas from the subject and search intent you provide. Suggested terms can support brainstorming and content planning, but generated search-volume context, competition, difficulty, ranking potential, and user intent should not be treated as verified search-engine data.',
    useCases: ['Brainstorm keyword ideas around a topic or service', 'Explore possible long-tail phrases for content planning', 'Group related terms into preliminary topic clusters', 'Create a starting keyword list for validation with search or analytics data'],
    examples: [
      {
        label: 'Topic keyword ideas',
        input: 'Topic: Home office organization. Intent: Informational.',
        output: 'A draft list of primary, long-tail, and related keyword ideas that can be reviewed and validated with current search data before use in an SEO plan.',
      },
    ],
  },
  'youtube-description-generator': {
    introduction: 'The YouTube Description Generator creates a video-description draft from the title, video details, and optional keywords you provide. It can organize summaries, links, hashtags, calls to action, and other description elements, but generated wording does not guarantee search visibility, recommendations, views, subscribers, or channel growth.',
    useCases: ['Draft a description from a supplied video title and summary', 'Organize important video information into readable sections', 'Create suggested hashtags or keyword wording for review', 'Prepare description copy that can be checked before a video is published'],
    examples: [
      {
        label: 'Tutorial description draft',
        input: 'Title: How to Organize Digital Files. Content: A beginner tutorial covering folders, file names, backups, and archiving.',
        output: 'A structured YouTube description draft summarizing the tutorial and suggesting supporting description elements that can be reviewed before publishing.',
      },
    ],
  },
  'youtube-title-generator': {
    introduction: 'The YouTube Title Generator creates several title ideas from a video topic and optional audience selection. The suggestions can help explore different hooks and wording approaches, but no generated title can guarantee click-through rate, search visibility, recommendations, views, or other video performance.',
    useCases: ['Generate several possible titles for a video topic', 'Explore different hooks for educational or tutorial videos', 'Compare concise title approaches before publishing', 'Create title ideas to refine against the actual video content'],
    examples: [
      {
        label: 'Tutorial title ideas',
        input: 'Topic: Beginner guide to organizing digital photos. Audience: Tutorial.',
        output: 'Several concise title ideas using different framing approaches, ready to be checked for accuracy and adjusted to match the finished video.',
      },
    ],
  },
  'title-rewriter': {
    introduction: 'The Title Rewriter creates alternative titles from an existing title and optional content context. It can help explore clearer, shorter, or more engaging wording, but generated alternatives should still accurately represent the underlying content and do not guarantee rankings, clicks, traffic, or engagement.',
    useCases: ['Create alternative wording for an existing article title', 'Explore shorter or clearer headline variations', 'Compare several title approaches before publication', 'Revise a working title so it better reflects the supplied content context'],
    examples: [
      {
        label: 'Article title alternatives',
        input: 'Current title: Practical Ways to Keep Digital Project Files Organized. Context: A beginner guide for small teams.',
        output: 'Several alternative titles using different wording and emphasis while staying aligned with the supplied article context.',
      },
    ],
  },

  'contract-summary': {
    introduction: 'The Contract Summarizer creates a plain-language summary from the contract text you provide. It can help identify terms, obligations, payment provisions, termination language, and possible areas to review, but the generated summary is not legal advice and may miss context, exceptions, definitions, or legally significant details in the original document.',
    useCases: ['Create a shorter overview of supplied contract text', 'Identify terms and obligations that may need closer review', 'Turn dense contract wording into a more accessible first-pass summary', 'Prepare notes before reviewing the original agreement or discussing it with a qualified professional'],
    examples: [
      {
        label: 'Contract overview',
        input: 'A service agreement containing payment terms, responsibilities, renewal language, and termination conditions.',
        output: 'A structured plain-language summary highlighting major provisions and areas to review against the original agreement.',
      },
    ],
  },
  'research-paper-writer': {
    introduction: 'The Research Paper Writer creates a structured academic-style draft or outline from a research topic and selected academic level. Generated material can help organize an initial approach, but claims, methods, findings, references, citations, and source attribution must be independently researched and verified before academic use.',
    useCases: ['Explore a possible structure for a research topic', 'Draft sections to use as a starting point for further research', 'Organize ideas for an introduction, literature review, methodology, and conclusion', 'Compare possible approaches before developing a paper from verified sources'],
    examples: [
      {
        label: 'Research structure',
        input: 'Topic: How remote work affects communication in small project teams. Level: Undergraduate.',
        output: 'A proposed research-paper structure with a thesis direction, introduction, literature-review topics, methodology ideas, expected-findings section, and conclusion outline for further research and revision.',
      },
    ],
  },
  'explain-it': {
    introduction: 'Explain It Simply rewrites a complex topic using simpler wording, examples, analogies, and step-by-step explanations for the selected audience level. Simplification can omit nuance or introduce inaccuracies, so important technical, legal, medical, financial, scientific, or other specialized information should be checked against reliable sources.',
    useCases: ['Create a simpler explanation of unfamiliar material', 'Adapt technical wording for a general audience', 'Explore an analogy or step-by-step explanation of a concept', 'Create a starting explanation to review for clarity and accuracy'],
    examples: [
      {
        label: 'Simplify a technical concept',
        input: 'Explain how cloud storage works for a general adult audience.',
        output: 'A simpler explanation using everyday language and an analogy, ready to be checked against the original technical information.',
      },
    ],
  },
  'outline-generator': {
    introduction: 'The Content Outline Generator creates a proposed structure from a topic and selected content type. It can organize main sections, subsections, key points, and suggested depth, giving you a starting framework that can be adjusted as your research, audience, and writing goals become clearer.',
    useCases: ['Plan the sections of an article before drafting', 'Create a starting structure for a guide or tutorial', 'Organize report topics into sections and subsections', 'Compare possible content structures before writing'],
    examples: [
      {
        label: 'Guide outline',
        input: 'Topic: Organizing digital files for a small team. Content type: Guide.',
        output: 'A proposed guide structure covering preparation, folder organization, naming conventions, access practices, maintenance, and related subtopics for further editing.',
      },
    ],
  },
  'question-generator': {
    introduction: 'The Question Generator creates a set of questions from a topic and selected purpose such as engagement, reflection, research, or brainstorming. Generated questions can provide starting prompts, but they should be reviewed for relevance, neutrality, clarity, audience suitability, and research or assessment requirements.',
    useCases: ['Create brainstorming questions around a topic', 'Draft reflection prompts for further editing', 'Explore possible research questions before refining a study', 'Prepare discussion questions for a selected audience or subject'],
    examples: [
      {
        label: 'Research-question ideas',
        input: 'Topic: Remote collaboration in small teams. Purpose: Research.',
        output: 'A set of possible questions covering communication, coordination, tools, challenges, and team practices that can be narrowed and refined for a specific research objective.',
      },
    ],
  },


  'brainstorm-ideas': {
    introduction: 'The Brainstorm Ideas tool generates a collection of possible ideas from the topic and style you provide. Suggestions can help start exploration, but feasibility, effort, impact, originality, and suitability depend on your circumstances and should be evaluated separately.',
    useCases: ['Explore possible directions for a project or topic', 'Generate practical or unconventional ideas for further evaluation', 'Create starting points for team brainstorming', 'Compare several possibilities before choosing what to develop'],
    examples: [
      {
        label: 'Product-feature brainstorming',
        input: 'Topic: Ways a small appointment-booking app could reduce missed appointments. Style: Practical.',
        output: 'A set of possible feature ideas with brief descriptions and estimated effort or impact indicators that can be reviewed against actual user needs and technical constraints.',
      },
    ],
  },
  'business-name-generator': {
    introduction: 'The Business Name Generator suggests possible names from the business description and style you provide. Generated names are ideas only; trademark rights, company-name registration, domain availability, social handles, cultural meaning, and other legal or commercial considerations are not checked automatically.',
    useCases: ['Explore possible names for a new business or project', 'Generate naming directions from a supplied business description', 'Compare modern, classic, creative, or playful naming styles', 'Create a shortlist for further trademark and availability research'],
    examples: [
      {
        label: 'Business-name ideas',
        input: 'Business: A software service that helps small teams organize project notes. Style: Modern.',
        output: 'A list of possible business-name ideas with different naming approaches, ready for independent trademark, registration, domain, and brand research.',
      },
    ],
  },
  'movie-script-generator': {
    introduction: 'The Movie Script Generator creates a screenplay-scene draft from the selected genre and scene description. It can provide scene headings, action, dialogue, and character cues as a starting point, but formatting conventions, continuity, originality, tone, and production suitability should be reviewed and revised.',
    useCases: ['Turn a scene idea into an initial screenplay-style draft', 'Explore dialogue between characters in a supplied situation', 'Develop an alternative direction for a fictional scene', 'Create material for further screenplay editing and formatting'],
    examples: [
      {
        label: 'Thriller scene draft',
        input: 'Genre: Thriller. Scene: Two coworkers remain in an office after a power failure and discover that an important file has disappeared.',
        output: 'A screenplay-style scene draft with a scene heading, action description, character dialogue, and tension that can be revised for continuity, voice, and formatting.',
      },
    ],
  },
  'song-lyric-generator': {
    introduction: 'The Song Lyric Generator creates a lyric draft from a topic and optional genre. It can suggest verses, a chorus, a bridge, and possible hooks, but generated material should be reviewed for originality, consistency, suitability, and any similarities to existing songs before publication, recording, or commercial use.',
    useCases: ['Develop a lyric draft from a song topic or story', 'Explore verse and chorus ideas in a selected genre', 'Generate a possible hook for further rewriting', 'Create a starting structure for an original songwriting project'],
    examples: [
      {
        label: 'Songwriting draft',
        input: 'Topic: Reconnecting with an old friend after many years. Genre: Pop.',
        output: 'A lyric draft organized into verses, chorus, and bridge, providing a starting point for rewriting, melody development, and originality review.',
      },
    ],
  },
  'text-expander': {
    introduction: 'The Text Expander develops short notes or text into a longer draft based on the selected target length. It can add context, examples, supporting explanation, and structure, but generated additions may introduce assumptions or unsupported details and should be checked against the original meaning and available facts.',
    useCases: ['Develop brief notes into a fuller first draft', 'Add explanatory context around an existing idea', 'Explore examples that could support a short passage', 'Create a longer version for further fact-checking and editing'],
    examples: [
      {
        label: 'Expand project notes',
        input: 'Short text: Weekly status updates should focus on blockers, decisions, and next actions. Target: Medium.',
        output: 'A longer draft explaining each part of the status update with additional context and examples that can be checked and edited before use.',
      },
    ],
  },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function AIWriteToolPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const resolvedToolId = resolveToolId(slug);
  const tool = resolvedToolId ? getToolById(resolvedToolId) : undefined;

  const [inputs, setInputs] = useState<Record<string, any>>(() => {
    const defaultInputs: Record<string, any> = {};
    tool?.fields.forEach((field) => {
      defaultInputs[field.name] = field.type === 'select' && field.options
        ? field.options[0]?.value || ''
        : '';
    });
    return defaultInputs;
  });
  const [result, setResult] = useState<string | any>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool) return;

    setLoading(true);
    setError('');
    setResult('');

    try {
      const response = await fetch('/api/ai-write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: tool.id,
          inputs,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        setError(data.error || 'Failed to generate content');
      } else {
        // Store result - could be string or object
        setResult(data.result);
        if (data.meta?.usingMock) {
          setError('Note: Using mock response. Add GROQ_API_KEY to .env.local to enable real AI generation.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const textToCopy = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadResult = async () => {
    if (!tool) return;

    const textToDownload = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    const outputName = `${tool.id}.txt`;

    try {
      const download = await uploadBrowserTextDownloadResult({
        text: textToDownload,
        toolSlug: tool.id,
        originalName: outputName,
        outputName,
      });

      router.push(download.downloadPageUrl);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to prepare the download.',
      );
    }
  };

  if (!tool) {
    notFound();
  }

  const seoContent = topToolSeoContent[tool.id];
  const faqItems = getAiToolFaqs(tool.id);
  const isAiDetector = tool.id === 'ai-detector';

  return (
    <>
      <HomeHeader />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1">
      {/* Animated Gradient Header */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-700 overflow-hidden py-7 md:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex items-center gap-2 text-white text-sm mb-4"
        >
          <Link href="/" className="hover:opacity-80">Home</Link>
          <ChevronRight size={16} />
          <Link href="/all-tools/ai-tools" className="hover:opacity-80">AI Write</Link>
          <ChevronRight size={16} />
          <span className="opacity-90">{tool.title}</span>
        </motion.div>

        {/* Header Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">✍️</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{tool.title}</h1>
              <p className="text-white text-lg opacity-95 max-w-2xl">{tool.description}</p>
            </div>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`max-w-7xl mx-auto grid gap-8 ${slug === 'ai-detector' ? 'md:grid-cols-5' : 'md:grid-cols-3'}`}
        >
          {/* Left Column - Generate Form (Sticky) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={slug === 'ai-detector' ? 'md:col-span-2' : 'md:col-span-1'}
          >
            <div className="sticky top-4 space-y-6">
              {/* Input Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Configure</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Input Fields */}
                  <div className="space-y-4">
                    {tool.fields.map(field => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'textarea' && (
                          <textarea
                            name={field.name}
                            value={inputs[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            maxLength={field.validation?.maxLength}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                            rows={slug === 'ai-detector' ? 12 : 3}
                          />
                        )}

                        {field.type === 'text' && (
                          <input
                            type="text"
                            name={field.name}
                            value={inputs[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            maxLength={field.validation?.maxLength}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        )}

                        {field.type === 'select' && (
                          <select
                            name={field.name}
                            value={inputs[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                          >
                            {field.options?.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.validation?.maxLength && (
                          <p className="text-xs text-gray-500 mt-1">
                            {inputs[field.name]?.length || 0} / {field.validation.maxLength}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Error Message */}
                  {error && !error.includes('Note:') && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 duration-0"
                  >
                    {loading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap size={18} />
                        {tool ? getActionText(tool.id) : 'Generate'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Output & Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={slug === 'ai-detector' ? 'md:col-span-3 space-y-6' : 'md:col-span-2 space-y-6'}
          >
            {/* Info Box */}
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About this tool</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {tool.description}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Category: {tool.category}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CheckCircle size={16} className="text-blue-600 flex-shrink-0" />
                  <span>Quick & Easy</span>
                </div>
              </div>
            </motion.div>

            {/* Results Section */}
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={20} className="text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {slug === 'ai-detector' ? 'Detection Results' : 'Output'}
                  </h2>
                </div>

                {error && error.includes('Note:') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700 mb-4">
                    {error}
                  </div>
                )}

                {/* AI Detector Custom Display */}
                {slug === 'ai-detector' && typeof result === 'object' && result.likelihood ? (
                  <AIDetectorResults
                    result={result}
                    inputText={inputs.inputText || ''}
                    onCopy={copyToClipboard}
                    onDownload={downloadResult}
                    copied={copied}
                  />
                ) : tool.outputFormat === 'json' ? (
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono text-gray-800 mb-4">
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg max-h-96 overflow-auto whitespace-pre-wrap text-gray-800 leading-relaxed mb-4">
                    {result}
                  </div>
                )}

                {slug !== 'ai-detector' && (
                  <div className="flex gap-3">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium duration-0 flex items-center justify-center gap-2"
                    >
                      <Copy size={16} />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>

                    <button
                      onClick={downloadResult}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium duration-0 flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {!result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Zap size={32} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{isAiDetector ? 'Ready to analyze' : 'Ready to generate'}</h3>
                <p className="text-gray-600">{isAiDetector ? 'Provide text and click Analyze Text to see a probabilistic assessment.' : 'Fill in the form and click Generate to see the result here'}</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Footer Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20">
          <div className="grid md:grid-cols-3 gap-6">
            {(isAiDetector ? [
              {
                icon: Zap,
                title: 'Pattern Analysis',
                description: 'Examines statistical and linguistic characteristics in the text you provide',
              },
              {
                icon: Shield,
                title: 'Probabilistic Result',
                description: 'The assessment is an estimate and cannot establish authorship',
              },
              {
                icon: CheckCircle,
                title: 'Human Review Required',
                description: 'False positives and false negatives are possible, so context and independent evidence matter',
              },
            ] : [
              {
                icon: Zap,
                title: 'AI-Assisted Drafting',
                description: 'Generate a draft or suggestion from the information you provide, subject to provider availability',
              },
              {
                icon: Shield,
                title: 'Input Awareness',
                description: 'AI inputs may be sent to the server and handled by an AI provider. Avoid submitting confidential, regulated, or credential-bearing content.',
              },
              {
                icon: CheckCircle,
                title: 'Human Review',
                description: 'Review generated content for facts, tone, originality, and suitability before using or publishing it',
              },
            ]).map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 text-center hover:shadow-xl transition"
              >
                <div className="mb-4 flex justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <feature.icon size={24} className="text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* SEO Content Sections */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="max-w-4xl mx-auto mt-24 space-y-16">
          {seoContent && (
            <>
              <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">What is {tool.title}?</h2>
                <p className="text-gray-700 leading-relaxed">{seoContent.introduction}</p>
              </section>

              <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Use Cases for {tool.title}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {seoContent.useCases.map((useCase, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700 text-sm">{useCase}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{tool.title} Examples</h2>
                <div className="space-y-6">
                  {seoContent.examples.map((example, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900">{example.label}</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="p-4 border-b md:border-b-0 md:border-r border-gray-200">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Example input</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{example.input}</p>
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Example output</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{example.output}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* How-To Guide Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">How to {getActionText(tool.id)}</h2>
            {isAiDetector ? (
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-gray-700"><strong>Provide text:</strong> Paste a meaningful passage into the text field.</li>
                <li className="text-gray-700"><strong>Click Analyze Text:</strong> The tool evaluates statistical and linguistic characteristics associated with AI-generated writing.</li>
                <li className="text-gray-700"><strong>Read the indicators:</strong> Review the likelihood estimate and the signals shown with it.</li>
                <li className="text-gray-700"><strong>Apply context:</strong> Treat the result as one uncertain signal, not proof of authorship or misconduct.</li>
              </ol>
            ) : (
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-gray-700"><strong>Fill in your details:</strong> Enter the required information in the fields on the left. Be specific for better results.</li>
                <li className="text-gray-700"><strong>Click {getActionText(tool.id)}:</strong> Hit the button to generate your content with AI assistance.</li>
                <li className="text-gray-700"><strong>Review the output:</strong> Carefully read the generated content. AI output requires human review and editing.</li>
                <li className="text-gray-700"><strong>Edit and refine:</strong> Make adjustments to match your exact needs and voice before using the final content.</li>
              </ol>
            )}
          </section>

          {/* Why Use Section */}
          <section className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Use {tool.title}?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(isAiDetector ? [
                {
                  title: 'Evidence, Not a Verdict',
                  description: 'Use the estimate as one limited signal alongside context and independent evidence.'
                },
                {
                  title: 'False Results Are Possible',
                  description: 'Human text can be flagged and AI-generated text can be missed.'
                },
                {
                  title: 'Authorship Is Not Identified',
                  description: 'A detector score cannot establish who wrote a passage or which system may have produced it.'
                },
                {
                  title: 'High-Impact Use Warning',
                  description: 'Never use this result alone for academic, employment, disciplinary, legal, or similar decisions.'
                }
              ] : [
                {
                  title: 'Start with a Draft',
                  description: 'Use generated wording as a starting point, then revise it for your specific purpose and audience.'
                },
                {
                  title: 'Explore Alternatives',
                  description: 'Generate alternative wording or directions when you want additional ideas to review.'
                },
                {
                  title: 'Editable First Draft',
                  description: 'Use as a starting point that you can edit and customize for your needs.'
                },
                {
                  title: 'Category Tool Access',
                  description: 'These AI writing utilities are separate from the account-based, credit-priced Premium AI Studio.'
                }
              ]).map((benefit, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-700 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqItems.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Tools Section */}
          <RelatedToolsSection
            family="ai"
            toolId={tool.id}
            limit={8}
            description={isAiDetector ? 'Explore related text analysis and writing tools:' : 'Explore other AI writing tools to complement your workflow:'}
          />

          {/* Important Notice - AI Trust & Usage Guidelines */}
          <section className="bg-amber-50 rounded-xl border border-amber-200 p-8">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-900 mb-2">{isAiDetector ? 'Important: AI Detection Is Not Proof' : 'Important: Using AI Writing Tools Responsibly'}</h3>
                {isAiDetector ? (
                  <ul className="text-amber-900 text-sm space-y-2 list-disc list-inside">
                    <li>The result is probabilistic and cannot prove authorship</li>
                    <li>False positives and false negatives are possible</li>
                    <li>Writing style, editing, subject matter, language, and text length can affect the estimate</li>
                    <li>Do not use this output as the sole basis for academic, employment, disciplinary, legal, or other high-impact decisions</li>
                    <li>Use qualified human review, relevant context, and independent evidence when decisions matter</li>
                  </ul>
                ) : (
                  <ul className="text-amber-900 text-sm space-y-2 list-disc list-inside">
                    <li>AI content requires human review and editing before publication or submission</li>
                    <li>Do not claim AI-generated content as entirely your own without proper disclosure when required</li>
                    <li>Verify facts and claims - AI can make mistakes or hallucinate information</li>
                    <li>Follow your institution's or organization's AI usage policies</li>
                    <li>For academic work, check guidelines on AI tool usage before using output</li>
                    <li>Keep your original work and AI-generated versions distinct</li>
                  </ul>
                )}
              </div>
            </div>
          </section>
        </motion.div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
