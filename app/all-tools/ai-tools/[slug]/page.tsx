'use client';
import { FAQAnswer, FAQCard, FAQHeading, FAQList, FAQPanel, FAQStaticQuestion } from '@/app/components/FAQDesign';

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
    'word-counter': 'Analyze Text',
    'paragraph-writer': 'Write Paragraph',
    'content-improver': 'Improve Content',
    'content-paraphraser': 'Paraphrase Text',
    'content-summarizer': 'Summarize Content',
    'contract-summary': 'Summarize Contract',
    'grammar-fixer': 'Fix Grammar',
    'translate': 'Translate',
    'blog-post-generator': 'Generate Blog Post',
    'faq-generator': 'Generate FAQs',
    'fiction-writer': 'Write Story',
    'article-writer': 'Write Article',
    'article-rewriter': 'Rewrite Article',
    'business-name-generator': 'Generate Business Names',
    'brainstorm-ideas': 'Generate Ideas',
    'blog-post-rewriter': 'Rewrite Blog Post',
    'blog-rewriter': 'Rewrite Blog',
    'email-writer': 'Write Email',
    'essay-writer': 'Write Essay',
    'explain-it': 'Explain Simply',
    'story-generator': 'Generate Story',
    'poem-generator': 'Create Poem',
    'press-release-writer': 'Write Press Release',
    'proposal-writer': 'Write Proposal',
    'product-description-writer': 'Write Description',
    'keyword-generator': 'Generate Keywords',
    'job-description-writer': 'Create Job Description',
    'cover-letter-writer': 'Write Cover Letter',
    'sentence-rewriter': 'Rewrite Sentence',
    'paragraph-rewriter': 'Rewrite Paragraph',
    'social-media-writer': 'Create Post',
    'facebook-post-generator': 'Generate Post',
    'instagram-caption-generator': 'Create Caption',
    'linkedin-post-generator': 'Generate Post',
    'movie-script-generator': 'Generate Scene',
    'twitter-generator': 'Create Tweet',
    'youtube-title-generator': 'Generate Title',
    'youtube-description-generator': 'Generate Description',
    'tiktok-caption-generator': 'Create Caption',
    'cold-email-writer': 'Write Email',
    'question-generator': 'Generate Questions',
    'research-paper-writer': 'Create Research Outline',
    'song-lyric-generator': 'Generate Song Lyrics',
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
        input: 'Our team meets every Monday to review project progress. Each person shares completed tasks, current blockers, and priorities for the coming week. The meeting helps us coordinate responsibilities and identify issues that need attention.',
        output: 'Illustrative assessment: The passage uses consistent sentence structure, straightforward vocabulary, and repeated references to team coordination. These patterns can occur in both human-written and AI-generated text. They cannot establish authorship, and this example is not a validated detection result.',
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
        output: 'Remote work can offer small businesses more flexibility in how they organize their teams and daily operations. Depending on the role and business needs, allowing employees to work remotely may reduce the need for dedicated office space and make it easier to consider candidates from different locations. It can also help employees manage their schedules when clear expectations and reliable communication practices are in place. However, the benefits are not automatic: businesses still need suitable tools, information security measures, and ways to coordinate work. A practical remote-work approach starts by identifying which tasks can be completed outside the office and setting clear guidelines for collaboration and performance.',
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
        input: 'Our remote team works across three time zones. We record project decisions in a shared document so colleagues can catch up without attending every meeting. Team members are expected to acknowledge routine messages within one working day. We reserve live meetings for complicated decisions that need discussion.',
        output: 'The remote team documents decisions, sets a one-working-day response expectation, and uses live meetings for complex discussions.',
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
    introduction: 'The Translate tool creates a translation of the text you enter using your selected target language or regional variant. It can help with everyday messages, multilingual drafts, and localization reviews. There is no separate source-language selector: the AI interprets the source text when possible. Translation quality depends on context, terminology, and the language pair, so important or specialized content should be reviewed by a qualified speaker or translator.',
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
    introduction: 'The Blog Post Generator creates a structured draft from your topic, optional keywords, tone, and preferred draft length. It helps you develop an editable first version, not a publication-ready article. Draft length is approximate and depends on the available generation limit.',
    useCases: ['Draft SEO blog posts from a target topic', 'Create article sections for a content calendar', 'Generate first drafts for educational content', 'Turn outlines into readable articles'],
    examples: [
      {
        label: 'Topic to blog draft',
        input: 'How small businesses can improve local SEO',
        output: 'How Small Businesses Can Improve Local SEO\\n\\nLocal SEO helps nearby customers discover businesses when they search for products or services in their area. A useful starting point is to make sure your business name, address, contact details, and opening hours are accurate wherever they appear online.\\n\\n1. Improve your Google Business Profile\\nComplete the relevant business information, choose accurate categories, and add current photos. Keep opening hours updated, especially during holidays.\\n\\n2. Create useful location-specific content\\nExplain which areas you serve and what customers can expect. Include local search terms naturally where they fit, rather than repeating the same phrases.\\n\\n3. Encourage genuine customer reviews\\nInvite customers to share honest feedback and respond professionally to reviews. Avoid offering incentives that violate platform policies.\\n\\n4. Measure your progress\\nReview relevant search visibility, website visits, calls, and enquiries over time. Use those observations to improve information that customers actually need.\\n\\nKey takeaway: Accurate business information, helpful local content, and ongoing maintenance provide a practical foundation for local SEO.',
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
        output: 'Q: Can I export an invoice after creating it? A: Check which download or export formats the invoice generator supports before choosing one for your records. Q: Does the tool calculate taxes automatically? A: Tax calculation depends on the features provided by the service. Verify the available tax options and applicable requirements before using the invoice.'
      },
    ],
  },
  'word-counter': {
    introduction: 'The Word Counter analyzes pasted text and returns word, character, sentence, and paragraph counts. It also estimates average sentence length, reading time at 200 words per minute, and a readability category. Words are separated by whitespace; sentence and readability measurements are approximate. Use the results to review essays, captions, descriptions, and other writing with length requirements.',
    useCases: ['Check essay or assignment length', 'Review social post character counts', 'Measure article draft size', 'Compare short and long versions of copy'],
    examples: [
      {
        label: 'Text measurement',
        input: 'Write clearly. Keep sentences short.',
        output: '5 words; 36 characters including spaces; 32 characters excluding whitespace; 1 paragraph; 2 sentences; average sentence length of 3 words (rounded); estimated reading time of 1 minute.',
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
      {
        label: 'Friendly tone without changing details',
        input: 'Tone: Friendly. Original: Please submit the completed form by Friday, 6 November.',
        output: 'Please send us your completed form by Friday, 6 November. Thanks!',
      },
    ],
  },
  'paragraph-rewriter': {
    introduction: 'The Paragraph Rewriter refreshes a full paragraph while keeping its main idea. It helps improve flow, reduce repetition, and create a cleaner version of text that already has the right direction.',
    useCases: ['Rewrite paragraphs for clarity', 'Refresh duplicated or stale copy', 'Improve transitions and flow', 'Adapt paragraph tone for a different audience'],
    examples: [
      {
        label: 'Paragraph rewrite',
        input: 'Our team has added a new file search option. It helps people find their documents more easily. People can search for files by name, and this means they do not have to look through lots of folders to find what they need.',
        output: 'Our new file search option makes documents easier to find. Instead of browsing through multiple folders, users can search for a file by name and locate the document they need more directly.',
      },
    ],
  },
  'ai-humanizer': {
    introduction: 'The AI Humanizer rewrites stiff or formulaic text so it reads more naturally while keeping the main idea intact. Use it as an editing aid for drafts that need better rhythm, clearer wording, or a more appropriate voice. Humanized wording does not guarantee that AI-detection systems will classify the text differently.',
    useCases: ['Make an AI-assisted draft sound less repetitive or mechanical', 'Adjust awkward wording before publishing or sharing', 'Improve sentence rhythm while preserving the main message', 'Create a more natural starting point for further human editing'],
    examples: [
      {
        label: 'Formal draft to natural wording',
        input: 'It is important to understand that the implementation of the new file organization feature provides users with an improved level of convenience. This functionality enables individuals to locate their documents more efficiently and manage their digital files in a more organized manner.',
        output: 'The new file organization feature makes managing digital documents easier. Users can find their files more quickly and keep their documents organized without unnecessary effort.',
      },
    ],
  },
  'article-rewriter': {
    introduction: 'The Article Rewriter creates a fresh version of an existing article while preserving its central subject and useful information. It can help change structure, tone, or phrasing, but rewritten material should still be checked for factual accuracy, attribution, and originality.',
    useCases: ['Refresh an older article without starting from a blank page', 'Adapt an article for a different audience or tone', 'Improve repetitive or awkward sections in a draft', 'Restructure your own material while keeping its main points'],
    examples: [
      {
        label: 'Article refresh',
        input: 'Mode: Simplified Version. Original article: Small businesses can reduce unnecessary operating costs by reviewing recurring subscriptions, monitoring energy usage, and comparing supplier prices. Owners should check which services are actively used before cancelling subscriptions and consider quality as well as price when choosing suppliers.',
        output: 'Small businesses can manage costs by regularly reviewing everyday expenses.\n\nStart with recurring subscriptions. Check which services your business still uses before deciding whether to cancel any of them.\n\nNext, monitor energy use to identify areas where consumption could be reduced.\n\nFinally, compare prices from different suppliers. Consider product quality alongside cost rather than choosing only the lowest price.\n\nThese simple reviews can help business owners identify unnecessary spending while keeping important services in place.',
      },
    ],
  },
  'blog-post-rewriter': {
    introduction: 'The Blog Post Rewriter helps revise an existing blog draft by changing wording, organization, and flow while retaining the intended topic. It is useful for refreshing your own content, but important facts, links, examples, and claims should be reviewed before the revised post is published.',
    useCases: ['Refresh an older blog post that feels dated or repetitive', 'Rewrite a draft for a different reader or brand voice', 'Improve the flow between blog sections', 'Create an alternative version of your own source material for editorial review'],
    examples: [
      {
        label: 'Blog draft refresh',
        input: 'Mode: Better Readability. Original blog post: Remote team communication is important for maintaining coordination. Teams should establish regular check-ins, document decisions, clarify responsibilities, choose appropriate communication channels, and encourage feedback. These practices can reduce confusion when colleagues work from different locations.',
        output: '## Five Ways to Improve Remote Team Communication\n\nClear communication helps remote teams stay coordinated, even when colleagues work in different locations.\n\n### 1. Schedule Regular Check-Ins\nUse regular meetings to discuss progress and identify questions.\n\n### 2. Document Important Decisions\nKeep a written record so team members can refer to agreed plans.\n\n### 3. Clarify Responsibilities\nMake sure everyone understands their tasks and who is responsible for each activity.\n\n### 4. Choose the Right Communication Channel\nSelect communication methods that suit the message and the team.\n\n### 5. Encourage Feedback\nGive colleagues opportunities to ask questions and share concerns.\n\nThese five habits can help reduce confusion and make remote collaboration easier.',
      },
    ],
  },
  'content-paraphraser': {
    introduction: 'The Content Paraphraser expresses existing text with different wording while aiming to preserve the original meaning. It can help clarify your own drafts or explore alternative phrasing, but paraphrasing does not remove the need to credit sources or follow copyright and academic integrity requirements.',
    useCases: ['Explore alternative wording for your own draft', 'Simplify a passage that feels unnecessarily complicated', 'Reduce repetition across nearby sentences', 'Rephrase notes before adding your own analysis and context'],
    examples: [
      {
        label: 'Clearer paraphrase',
        input: 'Effective communication is essential for successful project management. When team members share updates regularly, they can identify risks early, coordinate their responsibilities, and address potential delays before these issues affect project delivery.',
        output: 'Regular communication plays an important role in managing projects successfully. By sharing updates consistently, team members can recognize risks sooner, coordinate their tasks, and resolve possible delays before they disrupt project progress.',
      },
    ],
  },
  'tone-of-voice': {
    introduction: 'The Tone of Voice Converter rewrites your original text in one of five available styles: Professional, Casual, Humorous, Persuasive, or Empathetic. It helps adjust how a message sounds without intentionally changing its underlying facts or purpose. Review the rewritten version to ensure important details, commitments, and meaning remain accurate.',
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
        output: 'Introduction: Urban green spaces, including parks and community gardens, can influence how residents experience everyday city life. Their potential value extends beyond appearance to recreation, social interaction, and neighborhood accessibility.\n\n1. Recreation and Well-Being: Public green areas provide space for walking, outdoor activities, and relaxation. Their usefulness depends on factors such as safety, maintenance, and convenient access.\n\n2. Community Connections: Shared outdoor spaces can create opportunities for neighbors to meet and participate in community activities. However, the benefits may vary according to local needs and how spaces are designed.\n\n3. Accessibility and Maintenance: A park is more useful when residents can reach it and its facilities are maintained. Planning should consider accessibility, cleanliness, and the needs of different age groups.\n\nConclusion: Urban green spaces can contribute to daily life when they are accessible, welcoming, and maintained. A complete academic essay should support these points with independently verified evidence.'
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
        output: 'How to Organize Digital Files for a Small Business\n\nA clear file organization system can help a small team locate documents and maintain consistent working practices. Start with a structure that employees can understand and follow.\n\nStep 1: Create Main Folders\nGroup files by business function, such as Finance, Projects, and Operations. Avoid creating unnecessary folder levels.\n\nStep 2: Use Consistent File Names\nChoose a naming convention that includes useful details such as project name, document type, and date. For example: ProjectA_Invoice_2026-10.pdf.\n\nStep 3: Review Access Permissions\nGive employees access to the folders needed for their work. Review permissions when responsibilities change.\n\nStep 4: Maintain and Review\nSchedule periodic reviews to archive outdated files, remove unnecessary duplicates, and confirm that important documents are backed up.\n\nConclusion\nA practical folder structure, consistent naming, and regular maintenance can make business files easier to manage. Adapt the approach to your team size and existing tools.',
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
        output: 'At six every morning, the last page of the blue book changed. Mira, the night-shift librarian, had checked it for seven days. On Monday, the traveler returned home. On Tuesday, he vanished at sea. By Thursday, the final paragraph described the library itself.\n\nThat night, Mira stayed past closing and placed a pencil beside the book. At 5:59, the pages fluttered although every window was shut. A new sentence appeared: The librarian finally understood that the ending was waiting for her choice.\n\nMira opened the book to its first blank page and wrote: She decided to stay. For the first time all week, the last page did not change.',
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
        output: 'The Thirteenth Floor\n\nThe brass key was stamped 13, but the hotel elevator stopped at twelve.\n\nMira checked the key again. Room 1307. She had received it from the night receptionist, who had insisted that the room was already paid for.\n\nShe pressed the button for the twelfth floor. The elevator climbed slowly before stopping with a quiet chime.\n\nThe doors opened onto an empty corridor. At its far end stood a staircase that Mira had never noticed before.\n\nA small brass sign read: FLOOR 13.\n\nShe climbed the stairs and found a long hallway lined with identical doors. At the end was room 1307.\n\nThe door opened before she could use the key.\n\nInside, the room looked exactly like the one she had stayed in twenty years earlier with her younger brother, Arjun. The same blue curtains. The same wooden desk. Even the old photograph of them standing beside the hotel swimming pool.\n\nBut Arjun had disappeared from that hotel during their childhood holiday.\n\nMira stepped closer to the photograph. On its back was a handwritten message:\n\nYou promised you would come back.\n\nA telephone rang.\n\nShe answered.\n\nA familiar voice whispered, "Mira, you finally found me."\n\nHer hands trembled. "Arjun?"\n\n"Look behind the wardrobe."\n\nShe moved the wardrobe aside and discovered a narrow door. Beyond it was another staircase leading down.\n\nAt the bottom, she found a small room filled with photographs, newspaper clippings, and handwritten notes. One photograph showed the hotel receptionist, much younger, standing beside a little boy.\n\nIt was Arjun.\n\nSuddenly, footsteps echoed above her.\n\nThe receptionist appeared at the doorway. His expression changed when he saw the photograph in her hands.\n\n"I was supposed to keep this floor hidden," he said.\n\nMira looked at him. "Where is my brother?"\n\nThe receptionist lowered his eyes and pointed toward the telephone.\n\nIt rang again.\n\nMira answered.\n\nThis time, the voice was standing right behind her.\n\n"Turn around, sister."\n\nShe turned.\n\nA man stood in the doorway, holding the same photograph she had been carrying. He had grown older, but his smile was unmistakable.\n\nArjun had finally come home.'
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
        output: 'The pavement holds the afternoon heat;\nthen one small drop darkens the dust.\nAnother follows, then a hundred,\nand the trees lift their tired leaves.\nThrough the open window\ncomes the smell of earth waking,\nwhile summer loosens its grip\non the quiet street.',
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
        output: 'Subject: Website performance audit for your retail business\n\nHello,\n\nI offer website performance audits for small retail businesses. An audit can help identify opportunities to improve page loading, mobile usability, and the shopping experience.\n\nIf this would be useful, would you be open to a short conversation about the scope of an audit?\n\nBest regards,\n[Your Name]',
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
        output: 'Project Coordinator - Job Description Draft. Role Overview: Support project organization and communication by coordinating meetings, tracking tasks, and preparing progress updates. Key Responsibilities: Maintain task trackers and follow up on outstanding items; schedule project meetings and prepare agendas; document meeting notes and action items; compile regular project status updates. Required Skills: Clear written and verbal communication, accurate documentation, and effective scheduling and organization. Employer review required: Confirm reporting structure, location, employment terms, and any additional qualifications before publishing.',
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
        output: 'Dear Hiring Team, I am interested in the UX Designer role at Example Studio. My background includes user research, Figma, prototyping, and usability testing. I would welcome the opportunity to discuss how these skills could support your design team. Thank you for considering my application. Sincerely, [Your Name]'
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
        output: 'Website Redesign Proposal\n\nExecutive Summary\nThis proposal outlines an eight-week website redesign project covering a UX review, new interface designs, and responsive pages.\n\nProject Objectives\nReview the existing website experience and prepare updated interface designs for responsive page layouts.\n\nProposed Deliverables\n- UX review of the existing website\n- New interface designs\n- Responsive website pages\n\nProposed Timeline\nEight weeks in total. The allocation of work across the UX review, design, and responsive-page stages requires agreement.\n\nInvestment and Commercial Terms\n[PROJECT PRICE TO BE CONFIRMED]\n[PAYMENT TERMS TO BE AGREED]\n\nNext Steps\nConfirm the detailed scope, number of pages, responsibilities, milestones, acceptance criteria, and commercial terms before approval.',
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
        output: 'Example Software Announces New Reporting Dashboard for Business Customers\n\n[CITY], [DATE] - Example Software has announced a new reporting dashboard for its business customers. The announcement introduces a reporting feature intended to help customers review information within the company\'s software.\n\nAdditional details about the dashboard\'s availability, supported reports, and customer access should be confirmed before this release is distributed.\n\nAbout Example Software\nExample Software is the organization named in this illustrative announcement. Replace this section with an approved company description.\n\nMedia Contact\n[CONTACT NAME]\n[EMAIL ADDRESS]\n[PHONE NUMBER]',
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
        output: 'Meet the new reusable travel bottle! A simple companion for your everyday routine, whether you are heading to work or packing for a weekend away. Where would you take yours? #ReusableBottle #TravelEssentials #EverydayCarry #BottleStyle #TravelAccessories #DailyRoutine #ReusableProducts #TravelGear #OnTheGo #ProductLaunch',
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
        output: 'We are planning extended weekend opening hours and would love to hear from our community! We will share the confirmed schedule once it is finalized. What weekend times would be most convenient for you? Let us know in the comments. #CommunityUpdate'
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
        output: 'Weekly project updates work best when they make the next action clear. A useful status update highlights what is complete, what needs attention, and who owns the next step. Keeping updates focused can make team discussions easier to follow and reduce unnecessary back-and-forth. What information do you find most useful in a weekly project update?',
      },
    ],
  },
  'twitter-generator': {
    introduction: 'The Twitter Generator creates three alternative Twitter/X post drafts from a topic and optional tone selection. The topic field accepts up to 200 characters, while each generated post aims to stay within 280 characters. Compare the options, adjust the wording, and verify facts, links, hashtags, and character counts before publishing. Generated drafts are suggestions, not guarantees of engagement.',
    useCases: ['Create several short-post options from one idea', 'Explore different concise ways to phrase an update', 'Draft short social copy in a selected tone', 'Compare generated options before writing or editing the final post'],
    examples: [
      {
        label: 'Feature update',
        input: 'Topic: A file-conversion tool now supports an additional export format. Tone: Professional.',
        output: 'Tweet 1: Our file-conversion tool now supports an additional export format. Explore the updated options when preparing your next file.\n\nTweet 2: A new export format is now available in our file-conversion tool. Check the available formats to see what fits your workflow.\n\nTweet 3: Working with different file formats? Our conversion tool now includes another export option. Take a look at the updated format choices.',
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
        output: 'Sharing files? Start organized! Three quick tips to tidy your folders before sending. Which tip would you try? #FileOrganization #DigitalTips #Productivity',
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
        output: 'Wireless Headphones for Everyday Listening\n\nEnjoy a flexible listening setup with wireless headphones featuring Bluetooth connectivity, a foldable design, and a built-in microphone. Connect to a compatible Bluetooth-enabled device without relying on a wired audio connection. The foldable construction makes the headphones easier to pack away when not in use, while the integrated microphone supports conversations through a connected device. Whether you are listening to audio at your desk or preparing for your next journey, these headphones combine the listed features in a practical design. Review compatibility and other specifications before purchasing.',
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
        output: 'Primary keyword ideas: home office organization, home workspace organization, desk organization ideas. Long-tail ideas: how to organize a small home office, home office storage ideas for small spaces, how to reduce desk clutter, best way to organize office supplies at home. Topic clusters: Desk organization (cable management, desk drawers, desktop storage); Small-space storage (shelves, filing systems, compact organizers); Workspace routines (decluttering checklist, weekly desk reset). These are brainstorming suggestions, not verified search-volume or ranking data.',
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
        output: 'How to Organize Digital Files - Beginner Tutorial\n\nWant to make your digital files easier to find and manage? This beginner-friendly tutorial covers practical ways to organize folders, choose consistent file names, maintain backups, and archive older documents.\n\nIn this video, we cover:\n- Creating a simple folder structure\n- Naming files consistently\n- Understanding why backups matter\n- Archiving files you no longer use regularly\n\nUse these ideas as a starting point and adapt them to your own files and workflow.\n\nWhich file organization habit would you like to improve? Share your thoughts in the comments.\n\nSubscribe for more practical digital organization tutorials.\n\n#FileOrganization #DigitalFiles #ProductivityTips',
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
        output: '1. How to Organize Digital Photos: Beginner Guide\n2. Digital Photo Organization Made Simple\n3. Where Should You Start Organizing Your Photos?\n4. A Beginner-Friendly Guide to Photo Organization\n5. Organizing Digital Photos Step by Step\n6. Simple Ways to Organize Your Photo Collection\n7. How to Keep Digital Photos Organized\n8. Digital Photo Organization Tips for Beginners\n9. Getting Started with Digital Photo Organization\n10. Organize Your Digital Photos: A Practical Guide',
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
        output: '1. How Small Teams Can Organize Digital Project Files\n   Reason: Identifies the intended audience and the practical topic.\n\n2. A Beginner Guide to Organizing Project Files\n   Reason: Emphasizes the introductory nature of the guide.\n\n3. Practical File Organization Tips for Small Teams\n   Reason: Highlights actionable advice for small teams.\n\n4. Keeping Digital Project Files Organized: A Simple Guide\n   Reason: Presents the topic in an accessible, straightforward way.\n\n5. Digital Project File Organization for Beginners\n   Reason: Uses concise wording suited to readers new to the topic.',
      },
    ],
  },

  'contract-summary': {
    introduction: 'The Contract Summarizer creates a plain-language summary from the contract text you provide. It can help identify terms, obligations, payment provisions, termination language, and possible areas to review, but the generated summary is not legal advice and may miss context, exceptions, definitions, or legally significant details in the original document.',
    useCases: ['Create a shorter overview of supplied contract text', 'Identify terms and obligations that may need closer review', 'Turn dense contract wording into a more accessible first-pass summary', 'Prepare notes before reviewing the original agreement or discussing it with a qualified professional'],
    examples: [
      {
        label: 'Contract overview',
        input: 'The Client shall pay the Provider INR 20,000 within 15 calendar days after receiving an invoice. Either party may terminate this agreement by giving 30 days written notice to the other party.',
        output: 'The client must pay INR 20,000 within 15 calendar days of receiving an invoice. Either party can terminate the agreement by giving 30 days written notice. Check the full agreement for other conditions and exceptions.',
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
        output: 'Working Title: Remote Work and Communication in Small Project Teams\n\n1. Research Question\nHow do members of small project teams describe the effects of remote work on their communication practices?\n\n2. Provisional Thesis Direction\nExplore whether communication practices differ according to meeting routines, asynchronous tools, and team coordination. This is a question for investigation, not an established finding.\n\n3. Introduction\n- Define remote work and small project teams.\n- Explain the communication practices being studied.\n- State the research question and intended scope.\n\n4. Literature Review Plan\n- Locate verified research on remote-team communication.\n- Review studies about synchronous and asynchronous coordination.\n- Compare research methods and identify gaps.\n[SCHOLARLY SOURCES TO BE RESEARCHED AND CITED]\n\n5. Possible Methodology\nConsider interviews or a questionnaire with appropriate consent and sampling procedures. Select methods based on the research question and institutional requirements.\n\n6. Findings\n[NO DATA COLLECTED OR FINDINGS ESTABLISHED]\n\n7. Discussion and Conclusion Plan\nInterpret actual evidence after collection and analysis. Discuss limitations and relate verified findings to the research question.\n\n8. Next Steps\nRefine the question, locate reliable sources, select an appropriate methodology, and follow academic-integrity and ethics requirements.',
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
        output: 'Cloud storage is like keeping your files in a secure online locker instead of only on your computer. Your files are stored on computers operated by a service provider, and you can access them over the internet using an authorized account. Unlike a physical locker, access also depends on your internet connection, account security, and the provider being available.'
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
        output: 'Working Title: A Practical Guide to Organizing Digital Files for Small Teams\n\n1. Introduction\n- Explain how consistent file organization improves collaboration.\n- Identify common problems such as duplicate documents and unclear file names.\n\n2. Review the Current File System\n- List existing folders, file types, and storage locations.\n- Identify frequently used documents and outdated duplicates.\n\n3. Create a Shared Folder Structure\n- Organize folders by project, department, or business function.\n- Keep the structure simple enough for everyone to follow.\n\n4. Establish File Naming Rules\n- Choose consistent names that describe file contents.\n- Define how dates and version numbers should appear.\n\n5. Set Access and Ownership Rules\n- Decide who can view, edit, and archive documents.\n- Assign responsibility for maintaining shared folders.\n\n6. Maintain the Organization System\n- Schedule periodic reviews of folders and permissions.\n- Archive outdated files according to team requirements.\n\n7. Next Steps\n- Document the agreed rules in a short team guide.\n- Test the structure with a small project before wider adoption.',
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
        output: '1. How do members of small teams describe their remote collaboration routines?\n2. Which communication channels do team members use for different tasks?\n3. How are responsibilities and deadlines coordinated when working remotely?\n4. What factors influence how quickly team members receive feedback?\n5. How do team members handle misunderstandings during remote discussions?\n6. What challenges arise when collaboration happens across different schedules?\n7. How do teams decide which tasks require meetings and which can be asynchronous?\n8. How do team members describe the role of shared documents in their work?\n9. What practices help new team members understand ongoing projects?\n10. How do team members evaluate the usefulness of their collaboration tools?\n11. What changes do team members suggest for improving remote coordination?\n12. How do teams identify and resolve blockers during shared projects?\n13. How do participants describe trust and accountability in remote teamwork?\n14. How do remote collaboration practices vary across different project types?\n15. Which aspects of remote teamwork would participants prioritize for further study?',
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
        output: '1. Automated Reminder Scheduling - Let customers choose when to receive appointment reminders. Estimated effort: Medium. Potential impact: High.\n2. One-Tap Confirmation - Allow customers to confirm or cancel appointments from a reminder. Estimated effort: Medium. Potential impact: High.\n3. Easy Rescheduling - Provide a simple link to move an appointment to another available slot. Estimated effort: High. Potential impact: High.\n4. Calendar Integration - Help customers add confirmed bookings to their calendars. Estimated effort: Medium. Potential impact: Medium.\n5. Reminder Preference Settings - Let customers choose their preferred reminder channel and timing. Estimated effort: Medium. Potential impact: Medium.\nThese are illustrative ideas and preliminary estimates, not validated product results.',
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
        output: '1. NoteHarbor - Suggests a central place where teams can organize and revisit project notes.\n2. TaskFolio - Combines task organization with a collection of shared project information.\n3. BriefNest - Suggests a compact, organized home for team notes and updates.\n4. ProjectLoom - Evokes bringing different project details together into one workspace.\n5. NotePilot - Suggests helping teams navigate their project information.\nThese are illustrative naming ideas only. Trademark rights, business registration, domain availability, and social handles have not been checked.',
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
        output: 'INT. OFFICE - NIGHT\n\nEmergency lights flicker above two empty desks. MAYA searches through a drawer while ARUN checks the dark computer monitor.\n\nMAYA\nThe project file was here before the lights went out.\n\nARUN\nDid anyone else have access?\n\nA printer starts humming in the corner. Neither of them moves.\n\nMAYA\nThe power is still out.\n\nA single sheet slides into the output tray.',
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
        output: '[Verse 1]\nI found your number in an old notebook\nBeside a sketch of our hometown street\nYears had passed since our last conversation\nStill, I wondered if we could meet\n\n[Chorus]\nWe can pick up where the daylight faded\nFind the laughter we once knew\nDifferent roads and changing seasons\nStill there is room for me and you\n\n[Verse 2]\nWe met for coffee on a rainy Sunday\nShared the stories time had kept apart\nSome things changed beyond remembering\nSome stayed familiar in the heart\n\n[Bridge]\nWe cannot turn the years behind us\nBut we can choose what comes from here\n\n[Final Chorus]\nWe can pick up where the daylight faded\nWith new stories coming into view\nDifferent roads and changing seasons\nStill there is room for me and you',
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
        output: 'Weekly project status updates should help the team understand what needs attention and what happens next. Instead of listing every activity completed during the week, the update can focus on three practical areas: blockers, decisions, and next actions.\\n\\nBlockers are issues that may prevent work from progressing. Describing the issue, its impact, and the assistance needed gives the team a clearer basis for discussing possible solutions.\\n\\nDecisions should be recorded so that team members can distinguish confirmed direction from proposals still under discussion. For example, if a team is considering two implementation approaches, the update can identify the choice that remains open without implying that either option has been approved.\\n\\nNext actions describe the work expected after the update. Where the information is available, they can identify the responsible person and a target date. These details should come from the actual project plan rather than being invented.\\n\\nTogether, these three areas can make weekly updates easier to review and help participants prepare for follow-up discussions.',
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
  const isWordCounter = tool.id === 'word-counter';

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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{isWordCounter ? 'Ready to count' : isAiDetector ? 'Ready to analyze' : 'Ready to generate'}</h3>
                <p className="text-gray-600">{isWordCounter ? 'Paste text and click Analyze Text to view counts and estimated reading metrics.' : isAiDetector ? 'Provide text and click Analyze Text to see a rule-based writing-pattern assessment.' : 'Fill in the form and click Generate to see the result here'}</p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Footer Feature Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="max-w-6xl mx-auto mt-20">
          <div className="grid md:grid-cols-3 gap-6">
            {(isWordCounter ? [
              {
                icon: Zap,
                title: 'Text Counts',
                description: 'Count whitespace-separated words, characters, paragraphs, and punctuation-separated sentences',
              },
              {
                icon: Shield,
                title: 'Calculated Results',
                description: 'Metrics are calculated by the application rather than generated by an AI model',
              },
              {
                icon: CheckCircle,
                title: 'Estimated Readability',
                description: 'Review approximate reading time and readability based on simple text-analysis rules',
              },
            ] : isAiDetector ? [
              {
                icon: Zap,
                title: 'Pattern Analysis',
                description: 'Examines statistical and linguistic characteristics in the text you provide',
              },
              {
                icon: Shield,
                title: 'Heuristic Result',
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
            {isWordCounter ? (
              <ol className="space-y-4 list-decimal list-inside">
                <li className="text-gray-700"><strong>Paste your text:</strong> Enter the passage you want to measure in the Text to Analyze field.</li>
                <li className="text-gray-700"><strong>Click Analyze Text:</strong> The application calculates metrics without an AI-generated response.</li>
                <li className="text-gray-700"><strong>Review the counts:</strong> Check words, characters, paragraphs, sentences, and average sentence length.</li>
                <li className="text-gray-700"><strong>Interpret estimates:</strong> Reading time and readability are approximations, and counting rules may differ between applications.</li>
              </ol>
            ) : isAiDetector ? (
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
              {(isWordCounter ? [
                {
                  title: 'Check Length Requirements',
                  description: 'Review word and character counts before submitting text with length limits.'
                },
                {
                  title: 'Understand Sentence Structure',
                  description: 'Compare sentence counts and approximate average sentence length.'
                },
                {
                  title: 'Estimate Reading Time',
                  description: 'See a rounded-up reading-time estimate based on 200 words per minute.'
                },
                {
                  title: 'Review Readability',
                  description: 'Use the approximate readability category as a rough editing signal, not a definitive assessment.'
                }
              ] : isAiDetector ? [
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
          <FAQPanel>
            <FAQHeading>Frequently Asked Questions</FAQHeading>
            <FAQList>
              {faqItems.map((faq, idx) => (
                <FAQCard key={idx}>
                  <FAQStaticQuestion>{faq.q}</FAQStaticQuestion>
                  <FAQAnswer>{faq.a}</FAQAnswer>
                </FAQCard>
              ))}
            </FAQList>
          </FAQPanel>

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
                    <li>The result is based on heuristic rules and cannot prove authorship</li>
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
