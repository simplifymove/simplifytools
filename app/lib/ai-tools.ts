/**
 * AI Writing Tools Registry
 * 
 * This is the core configuration file for all AI writing tools.
 * Each tool defines its fields, prompts, and validation rules.
 * The system is designed to scale to 50+ tools without separate implementations.
 * 
 * To add a new tool:
 * 1. Add an entry to the aiWriteTools object
 * 2. Define required fields, prompts, and system message
 * 3. The dynamic frontend will automatically render it
 * 4. The API will handle validation and LLM calls
 */

export type ToolCategory = 'generate' | 'rewrite' | 'summarize' | 'business' | 'utility' | 'social';

export interface ToolField {
  name: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface AIWriteTool {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  fields: ToolField[];
  systemPrompt: string;
  buildPrompt: (inputs: Record<string, any>) => string;
  outputFormat?: 'text' | 'json' | 'markdown';
  icon?: string;
}

// Common field definitions for reuse
const fields = {
  topic: (label = 'Topic'): ToolField => ({
    name: 'topic',
    type: 'textarea',
    label,
    placeholder: 'Enter the topic or subject...',
    required: true,
    validation: { minLength: 3, maxLength: 500 },
  }),
  inputText: (label = 'Text'): ToolField => ({
    name: 'inputText',
    type: 'textarea',
    label,
    placeholder: 'Enter the text to process...',
    required: true,
    validation: { minLength: 3, maxLength: 5000 },
  }),
  tone: (): ToolField => ({
    name: 'tone',
    type: 'select',
    label: 'Tone',
    required: false,
    options: [
      { value: 'professional', label: 'Professional' },
      { value: 'casual', label: 'Casual' },
      { value: 'friendly', label: 'Friendly' },
      { value: 'formal', label: 'Formal' },
      { value: 'creative', label: 'Creative' },
      { value: 'humorous', label: 'Humorous' },
    ],
  }),
  language: (): ToolField => ({
    name: 'language',
    type: 'select',
    label: 'Language',
    required: false,
    options: [
      { value: 'English', label: 'English' },
      { value: 'Spanish', label: 'Spanish' },
      { value: 'French', label: 'French' },
      { value: 'German', label: 'German' },
      { value: 'Chinese', label: 'Chinese' },
      { value: 'Japanese', label: 'Japanese' },
    ],
  }),
  length: (): ToolField => ({
    name: 'length',
    type: 'select',
    label: 'Length',
    required: false,
    options: [
      { value: 'short', label: 'Short (50-100 words)' },
      { value: 'medium', label: 'Medium (100-200 words)' },
      { value: 'long', label: 'Long (200-400 words)' },
    ],
  }),
  keywords: (label = 'Keywords'): ToolField => ({
    name: 'keywords',
    type: 'textarea',
    label,
    placeholder: 'Enter keywords separated by commas...',
    required: false,
    validation: { maxLength: 200 },
  }),
  audience: (): ToolField => ({
    name: 'audience',
    type: 'select',
    label: 'Target Audience',
    required: false,
    options: [
      { value: 'general', label: 'General' },
      { value: 'professional', label: 'Professional' },
      { value: 'students', label: 'Students' },
      { value: 'beginners', label: 'Beginners' },
      { value: 'experts', label: 'Experts' },
    ],
  }),
};

export const aiWriteTools: Record<string, AIWriteTool> = {
  // ============ PHASE 1: CORE TOOLS ============

  'paragraph-writer': {
    id: 'paragraph-writer',
    title: 'Paragraph Writer',
    description: 'Generate a well-crafted paragraph from a topic',
    category: 'generate',
    fields: [
      fields.topic('Topic or Title'),
      fields.tone(),
      fields.length(),
      fields.language(),
    ],
    systemPrompt: 'You are a professional writing assistant. Create clear, engaging, and well-structured content.',
    buildPrompt: (inputs) => `
Write one high-quality paragraph about: ${inputs.topic}
Tone: ${inputs.tone || 'professional'}
Length: ${inputs.length || 'medium'}
Language: ${inputs.language || 'English'}

Requirements:
- Clear and polished writing
- Natural flow and readability
- Appropriate for the specified tone
- Professional grammar and punctuation
    `,
  },

  'content-improver': {
    id: 'content-improver',
    title: 'Content Improver',
    description: 'Enhance and improve existing content quality',
    category: 'rewrite',
    fields: [
      fields.inputText('Content to Improve'),
      fields.tone(),
      fields.language(),
    ],
    systemPrompt: 'You are an expert content editor. Improve text while maintaining its original meaning and intent.',
    buildPrompt: (inputs) => `
Improve the quality, clarity, and engagement of the following content:

${inputs.inputText}

Guidelines:
- Enhance readability and flow
- Strengthen key points
- Improve word choice
- Maintain the original message
- Tone: ${inputs.tone || 'professional'}
- Language: ${inputs.language || 'English'}

Return only the improved version without explanations.
    `,
  },

  'content-summarizer': {
    id: 'content-summarizer',
    title: 'Content Summarizer',
    description: 'Create a concise summary of long content',
    category: 'summarize',
    fields: [
      fields.inputText('Content to Summarize'),
      {
        name: 'summaryLength',
        type: 'select',
        label: 'Summary Length',
        required: false,
        options: [
          { value: '1-2', label: '1-2 sentences' },
          { value: '3-5', label: '3-5 sentences' },
          { value: 'bullet', label: 'Bullet points' },
        ],
      },
    ],
    systemPrompt: 'You are an expert summarizer. Create clear, accurate summaries that capture the key points.',
    buildPrompt: (inputs) => `
Summarize the following content concisely:

${inputs.inputText}

Summary format: ${inputs.summaryLength || '3-5 sentences'}

Requirements:
- Capture all key points
- Maintain accuracy
- Simple, clear language
- No opinions or additions
    `,
  },

  'grammar-fixer': {
    id: 'grammar-fixer',
    title: 'Grammar Fixer',
    description: 'Fix grammar, spelling, and punctuation',
    category: 'rewrite',
    fields: [
      fields.inputText('Text to Correct'),
      fields.language(),
    ],
    systemPrompt: 'You are an expert editor with exceptional grammar knowledge. Fix all errors while preserving the original meaning.',
    buildPrompt: (inputs) => `
Correct grammar, spelling, punctuation, and clarity in the following text:

${inputs.inputText}

Requirements:
- Fix all grammar errors
- Correct spelling mistakes
- Improve punctuation
- Preserve original meaning
- Maintain the author's voice
- Language: ${inputs.language || 'English'}

Return only the corrected version.
    `,
  },

  'translate': {
    id: 'translate',
    title: 'Translate',
    description: 'Translate content to another language',
    category: 'utility',
    fields: [
      fields.inputText('Text to Translate'),
      {
        name: 'targetLanguage',
        type: 'select',
        label: 'Target Language',
        required: true,
        options: [
          // English Variants
          { value: 'English (US)', label: 'English (US)' },
          { value: 'English (UK)', label: 'English (UK)' },
          { value: 'English (Australian)', label: 'English (Australian)' },
          { value: 'English (Canadian)', label: 'English (Canadian)' },
          { value: 'English (Indian)', label: 'English (Indian)' },
          // Spanish Variants
          { value: 'Spanish (Spain)', label: 'Spanish (Spain)' },
          { value: 'Spanish (Mexico)', label: 'Spanish (Mexico)' },
          { value: 'Spanish (Argentina)', label: 'Spanish (Argentina)' },
          { value: 'Spanish (Colombia)', label: 'Spanish (Colombia)' },
          { value: 'Spanish (Peru)', label: 'Spanish (Peru)' },
          // French Variants
          { value: 'French (France)', label: 'French (France)' },
          { value: 'French (Canada)', label: 'French (Canada)' },
          { value: 'French (Belgium)', label: 'French (Belgium)' },
          { value: 'French (Swiss)', label: 'French (Swiss)' },
          // German Variants
          { value: 'German (Germany)', label: 'German (Germany)' },
          { value: 'German (Austria)', label: 'German (Austria)' },
          { value: 'German (Swiss)', label: 'German (Swiss)' },
          // Portuguese Variants
          { value: 'Portuguese (Portugal)', label: 'Portuguese (Portugal)' },
          { value: 'Portuguese (Brazil)', label: 'Portuguese (Brazil)' },
          // Chinese Variants
          { value: 'Chinese (Simplified)', label: 'Chinese (Simplified)' },
          { value: 'Chinese (Traditional)', label: 'Chinese (Traditional)' },
          { value: 'Chinese (Hong Kong)', label: 'Chinese (Hong Kong)' },
          // Other Major Languages
          { value: 'Arabic (Modern Standard)', label: 'Arabic (Modern Standard)' },
          { value: 'Arabic (Egyptian)', label: 'Arabic (Egyptian)' },
          { value: 'Arabic (Gulf)', label: 'Arabic (Gulf)' },
          { value: 'Japanese', label: 'Japanese' },
          { value: 'Korean', label: 'Korean' },
          { value: 'Russian', label: 'Russian' },
          { value: 'Italian', label: 'Italian' },
          { value: 'Dutch', label: 'Dutch' },
          { value: 'Polish', label: 'Polish' },
          { value: 'Turkish', label: 'Turkish' },
          { value: 'Swedish', label: 'Swedish' },
          { value: 'Norwegian', label: 'Norwegian' },
          { value: 'Danish', label: 'Danish' },
          { value: 'Finnish', label: 'Finnish' },
          { value: 'Greek', label: 'Greek' },
          { value: 'Czech', label: 'Czech' },
          { value: 'Hungarian', label: 'Hungarian' },
          { value: 'Romanian', label: 'Romanian' },
          { value: 'Thai', label: 'Thai' },
          { value: 'Vietnamese', label: 'Vietnamese' },
          { value: 'Indonesian', label: 'Indonesian' },
          { value: 'Tagalog', label: 'Tagalog' },
          // Indian Regional Languages
          { value: 'Hindi', label: 'Hindi' },
          { value: 'Tamil', label: 'Tamil' },
          { value: 'Telugu', label: 'Telugu' },
          { value: 'Kannada', label: 'Kannada' },
          { value: 'Malayalam', label: 'Malayalam' },
          { value: 'Marathi', label: 'Marathi' },
          { value: 'Gujarati', label: 'Gujarati' },
          { value: 'Punjabi', label: 'Punjabi' },
          { value: 'Bengali', label: 'Bengali' },
          { value: 'Assamese', label: 'Assamese' },
          { value: 'Odia', label: 'Odia' },
          { value: 'Konkani', label: 'Konkani' },
          { value: 'Sindhi', label: 'Sindhi' },
          { value: 'Sanskrit', label: 'Sanskrit' },
          { value: 'Urdu', label: 'Urdu' },
          { value: 'Malay', label: 'Malay' },
          { value: 'Hebrew', label: 'Hebrew' },
          { value: 'afrikaans', label: 'Afrikaans' },
          { value: 'Bulgarian', label: 'Bulgarian' },
          { value: 'Croatian', label: 'Croatian' },
          { value: 'Estonian', label: 'Estonian' },
          { value: 'Latvian', label: 'Latvian' },
          { value: 'Lithuanian', label: 'Lithuanian' },
          { value: 'Slovak', label: 'Slovak' },
          { value: 'Slovenian', label: 'Slovenian' },
          { value: 'Ukrainian', label: 'Ukrainian' },
          { value: 'Serbian', label: 'Serbian' },
        ],
      },
    ],
    systemPrompt: 'You are a professional translator. Provide accurate, natural translations that maintain the original tone and meaning.',
    buildPrompt: (inputs) => `
Translate the following text to ${inputs.targetLanguage}:

${inputs.inputText}

Requirements:
- Accurate translation
- Natural phrasing in target language
- Preserve tone and style
- Maintain formatting

Return only the translation.
    `,
  },

  'blog-post-generator': {
    id: 'blog-post-generator',
    title: 'Blog Post Generator',
    description: 'Generate a complete blog post from a topic',
    category: 'generate',
    fields: [
      fields.topic('Blog Topic'),
      fields.keywords(),
      fields.tone(),
      {
        name: 'postLength',
        type: 'select',
        label: 'Post Length',
        required: false,
        options: [
          { value: 'short', label: 'Short (500-800 words)' },
          { value: 'medium', label: 'Medium (800-1500 words)' },
          { value: 'long', label: 'Long (1500-2500 words)' },
        ],
      },
    ],
    systemPrompt: 'You are an expert blog writer. Create engaging, SEO-friendly blog posts with clear structure.',
    buildPrompt: (inputs) => `
Write a blog post about: ${inputs.topic}

Keywords to include: ${inputs.keywords || 'none'}
Tone: ${inputs.tone || 'professional'}
Length: ${inputs.postLength || 'medium'}

Structure:
1. Engaging title
2. Introduction with hook
3. Main sections with subheadings
4. Key takeaways or conclusion
5. Call-to-action

Requirements:
- SEO-friendly
- Clear structure
- Engaging writing
- Practical value
- Proper formatting
    `,
  },

  'faq-generator': {
    id: 'faq-generator',
    title: 'FAQ Generator',
    description: 'Create FAQ section from topic or content',
    category: 'generate',
    fields: [
      fields.topic('Topic or Subject'),
      {
        name: 'numQuestions',
        type: 'select',
        label: 'Number of Questions',
        required: false,
        options: [
          { value: '5', label: '5 Questions' },
          { value: '10', label: '10 Questions' },
          { value: '15', label: '15 Questions' },
        ],
      },
      fields.tone(),
    ],
    systemPrompt: 'You are an expert at creating comprehensive FAQ sections. Generate questions and answers that address common user concerns.',
    buildPrompt: (inputs) => `
Generate FAQ for: ${inputs.topic}

Number of Q&A pairs: ${inputs.numQuestions || '10'}
Tone: ${inputs.tone || 'professional'}

Requirements:
- Cover the most important questions
- Clear, concise answers
- Address common concerns
- Practical and helpful
- Format as: Q: [question]\nA: [answer]
    `,
  },

  'word-counter': {
    id: 'word-counter',
    title: 'Word Counter',
    description: 'Count words, characters, and readability metrics',
    category: 'utility',
    fields: [
      fields.inputText('Text to Analyze'),
    ],
    systemPrompt: 'You are a text analysis tool. Analyze text and provide detailed metrics.',
    buildPrompt: (inputs) => `
Analyze the following text and provide:
1. Word count
2. Character count (with and without spaces)
3. Paragraph count
4. Average sentence length
5. Estimated reading time (at 200 WPM)
6. Flesch reading ease score (if possible)

Text:
${inputs.inputText}

Format as JSON with keys: wordCount, characterCount, characterCountNoSpaces, paragraphCount, sentenceCount, avgSentenceLength, readingTimeMinutes, readingEase
    `,
    outputFormat: 'json',
  },

  // ============ PHASE 2: REWRITE/IMPROVE FAMILY ============

  'sentence-rewriter': {
    id: 'sentence-rewriter',
    title: 'Sentence Rewriter',
    description: 'Rewrite sentences for clarity and impact',
    category: 'rewrite',
    fields: [
      fields.inputText('Sentences to Rewrite'),
      fields.tone(),
    ],
    systemPrompt: 'You are an expert writer who rewrites sentences to be clearer, more engaging, and more impactful.',
    buildPrompt: (inputs) => `
Rewrite the following sentences for better clarity and impact:

${inputs.inputText}

Tone: ${inputs.tone || 'professional'}

Requirements:
- Improve clarity
- Enhance readability
- Maintain meaning
- Match tone
- Make it more engaging

Return only the rewritten version.
    `,
  },

  'paragraph-rewriter': {
    id: 'paragraph-rewriter',
    title: 'Paragraph Rewriter',
    description: 'Rewrite paragraphs with improved clarity and flow',
    category: 'rewrite',
    fields: [
      fields.inputText('Paragraph to Rewrite'),
      fields.tone(),
    ],
    systemPrompt: 'You are an expert editor. Rewrite paragraphs to improve clarity, flow, and impact.',
    buildPrompt: (inputs) => `
Rewrite the following paragraph for better clarity and impact:

${inputs.inputText}

Tone: ${inputs.tone || 'professional'}

Requirements:
- Improve flow and structure
- Enhance clarity
- Better word choice
- Maintain original meaning
- More engaging writing

Return only the rewritten paragraph.
    `,
  },

  'title-rewriter': {
    id: 'title-rewriter',
    title: 'Title Rewriter',
    description: 'Create better, more engaging titles',
    category: 'rewrite',
    fields: [
      {
        name: 'currentTitle',
        type: 'textarea',
        label: 'Current Title',
        placeholder: 'Enter the current title...',
        required: true,
      },
      {
        name: 'context',
        type: 'textarea',
        label: 'Content Context (optional)',
        placeholder: 'Brief description of content...',
        required: false,
      },
    ],
    systemPrompt: 'You are an expert copywriter. Create compelling, click-worthy titles that accurately represent content.',
    buildPrompt: (inputs) => `
Create 5 better title alternatives for:

${inputs.currentTitle}

Context: ${inputs.context || 'General content'}

Requirements:
- More engaging and compelling
- SEO-friendly
- Accurate to content
- Clear and concise
- Varied approaches

Format: List 5 options with explanations.
    `,
  },

  // ============ PHASE 3: GENERATION FAMILY ============

  'essay-writer': {
    id: 'essay-writer',
    title: 'Essay Writer',
    description: 'Write complete essays on any topic',
    category: 'generate',
    fields: [
      fields.topic('Essay Topic'),
      {
        name: 'essayType',
        type: 'select',
        label: 'Essay Type',
        required: false,
        options: [
          { value: 'persuasive', label: 'Persuasive' },
          { value: 'informative', label: 'Informative' },
          { value: 'narrative', label: 'Narrative' },
          { value: 'analytical', label: 'Analytical' },
        ],
      },
      { name: 'numSections', type: 'select', label: 'Number of Sections', required: false, 
        options: [
          { value: '3', label: '3 sections' },
          { value: '5', label: '5 sections' },
          { value: '7', label: '7 sections' },
        ]
      },
    ],
    systemPrompt: 'You are an expert essay writer. Create well-structured, compelling essays with strong arguments and evidence.',
    buildPrompt: (inputs) => `
Write an essay on: ${inputs.topic}

Type: ${inputs.essayType || 'informative'}
Number of main sections: ${inputs.numSections || '5'}

Structure:
1. Introduction with thesis
2. Main body sections
3. Conclusion

Requirements:
- Clear thesis statement
- Well-organized sections
- Supporting arguments
- Professional writing
- Proper essay format
    `,
  },

  'story-generator': {
    id: 'story-generator',
    title: 'Story Generator',
    description: 'Generate creative stories',
    category: 'generate',
    fields: [
      {
        name: 'storyPrompt',
        type: 'textarea',
        label: 'Story Idea or Prompt',
        placeholder: 'Describe your story idea...',
        required: true,
      },
      {
        name: 'storyLength',
        type: 'select',
        label: 'Story Length',
        required: false,
        options: [
          { value: 'short', label: 'Short (300-500 words)' },
          { value: 'medium', label: 'Medium (500-1000 words)' },
          { value: 'long', label: 'Long (1000+ words)' },
        ],
      },
    ],
    systemPrompt: 'You are a creative fiction writer. Write engaging, imaginative stories with vivid descriptions and compelling narratives.',
    buildPrompt: (inputs) => `
Write a ${inputs.storyLength || 'medium'} creative story based on this prompt:

${inputs.storyPrompt}

Requirements:
- Engaging narrative
- Vivid descriptions
- Character development
- Natural dialogue
- Clear beginning, middle, end
    `,
  },

  'article-writer': {
    id: 'article-writer',
    title: 'Article Writer',
    description: 'Write professional articles',
    category: 'generate',
    fields: [
      fields.topic('Article Topic'),
      fields.audience(),
      { name: 'articleType', type: 'select', label: 'Article Type', required: false,
        options: [
          { value: 'news', label: 'News Article' },
          { value: 'opinion', label: 'Opinion Piece' },
          { value: 'how-to', label: 'How-To Guide' },
          { value: 'analysis', label: 'Analysis' },
        ]
      },
    ],
    systemPrompt: 'You are a professional journalist and article writer. Create well-researched, engaging articles for various audiences.',
    buildPrompt: (inputs) => `
Write a ${inputs.articleType || 'general'} article about: ${inputs.topic}

Target audience: ${inputs.audience || 'general'}

Requirements:
- Professional tone
- Clear structure
- Engaging headline
- Well-researched content
- Appropriate for audience
    `,
  },

  // ============ PHASE 4: SOCIAL/MEDIA FAMILY ============

  'instagram-caption-generator': {
    id: 'instagram-caption-generator',
    title: 'Instagram Caption Generator',
    description: 'Create engaging Instagram captions',
    category: 'social',
    fields: [
      {
        name: 'postContext',
        type: 'textarea',
        label: 'What is the post about?',
        placeholder: 'Describe your Instagram post...',
        required: true,
      },
      {
        name: 'includeHashtags',
        type: 'select',
        label: 'Include Hashtags?',
        required: false,
        options: [
          { value: 'yes', label: 'Yes, 10-15 hashtags' },
          { value: 'no', label: 'No' },
        ],
      },
    ],
    systemPrompt: 'You are an Instagram content expert. Write captions that engage audiences and encourage interaction.',
    buildPrompt: (inputs) => `
Create an engaging Instagram caption for:

${inputs.postContext}

Requirements:
- Engaging and natural
- Instagram-appropriate length
- Include CTA if relevant
- ${inputs.includeHashtags === 'yes' ? 'Include 10-15 relevant hashtags' : 'No hashtags'}
- Emojis where appropriate
    `,
  },

  'twitter-generator': {
    id: 'twitter-generator',
    title: 'Twitter Generator',
    description: 'Create tweet-sized content',
    category: 'social',
    fields: [
      {
        name: 'tweetTopic',
        type: 'textarea',
        label: 'What do you want to tweet about?',
        placeholder: 'Enter your tweet idea...',
        required: true,
        validation: { maxLength: 200 },
      },
      fields.tone(),
    ],
    systemPrompt: 'You are a Twitter expert. Write tweets that are engaging, concise, and likely to get engagement.',
    buildPrompt: (inputs) => `
Write 3 different tweet options about:

${inputs.tweetTopic}

Tone: ${inputs.tone || 'professional'}

Requirements:
- Under 280 characters each
- Engaging and shareable
- Clear message
- ${inputs.tone === 'humorous' ? 'Witty if appropriate' : 'Professional tone'}
- Include relevant emojis

Format as:
Tweet 1: [text]
Tweet 2: [text]
Tweet 3: [text]
    `,
  },

  'linkedin-post-generator': {
    id: 'linkedin-post-generator',
    title: 'LinkedIn Post Generator',
    description: 'Create professional LinkedIn posts',
    category: 'social',
    fields: [
      fields.topic('Post Topic'),
      {
        name: 'postLength',
        type: 'select',
        label: 'Post Length',
        required: false,
        options: [
          { value: 'short', label: 'Short (3-4 sentences)' },
          { value: 'medium', label: 'Medium (1 paragraph)' },
          { value: 'long', label: 'Long (2-3 paragraphs)' },
        ],
      },
    ],
    systemPrompt: 'You are a LinkedIn content strategist. Write professional posts that build thought leadership and engagement.',
    buildPrompt: (inputs) => `
Create a LinkedIn post about: ${inputs.topic}

Length: ${inputs.postLength || 'medium'}

Requirements:
- Professional and authoritative
- Include hook/opening line
- Add value to audience
- Include call-to-action
- Professional tone
- Appropriate for LinkedIn
    `,
  },

  // ============ PHASE 5: BUSINESS/LEGAL ============

  'cold-email-writer': {
    id: 'cold-email-writer',
    title: 'Cold Email Writer',
    description: 'Write effective cold emails',
    category: 'business',
    fields: [
      {
        name: 'companyName',
        type: 'text',
        label: 'Company/Person Name',
        placeholder: 'Who are you emailing?',
        required: true,
      },
      {
        name: 'purpose',
        type: 'textarea',
        label: 'Email Purpose',
        placeholder: 'What do you want from them?',
        required: true,
      },
      fields.tone(),
    ],
    systemPrompt: 'You are an expert copywriter specializing in cold outreach. Write compelling emails with high open and response rates.',
    buildPrompt: (inputs) => `
Write a cold email to: ${inputs.companyName}

Purpose: ${inputs.purpose}

Requirements:
- Personalized and genuine
- Clear value proposition
- Strong subject line
- Call-to-action
- Professional tone
- Keep it concise
    `,
  },

  'business-name-generator': {
    id: 'business-name-generator',
    title: 'Business Name Generator',
    description: 'Generate creative business names',
    category: 'business',
    fields: [
      {
        name: 'businessType',
        type: 'textarea',
        label: 'Business Type/Description',
        placeholder: 'What kind of business is it?',
        required: true,
      },
      {
        name: 'style',
        type: 'select',
        label: 'Name Style',
        required: false,
        options: [
          { value: 'modern', label: 'Modern & Tech' },
          { value: 'classic', label: 'Classic & Professional' },
          { value: 'creative', label: 'Creative & Unique' },
          { value: 'playful', label: 'Playful & Fun' },
        ],
      },
    ],
    systemPrompt: 'You are a branding expert. Generate creative, memorable, and marketable business names.',
    buildPrompt: (inputs) => `
Generate business name ideas for: ${inputs.businessType}

Style: ${inputs.style || 'modern'}

Requirements:
- 10-15 unique options
- Memorable and brandable
- Easy to spell and pronounce
- Available domain potential
- Reflect business type
- ${inputs.style === 'creative' ? 'Creative and unique' : ''}
    `,
  },

  // ============ ADDITIONAL BUSINESS/LEGAL TOOLS ============

  'product-description-writer': {
    id: 'product-description-writer',
    title: 'Product Description Writer',
    description: 'Create compelling product descriptions',
    category: 'business',
    fields: [
      {
        name: 'productName',
        type: 'text',
        label: 'Product Name',
        placeholder: 'e.g., Wireless Headphones',
        required: true,
      },
      {
        name: 'features',
        type: 'textarea',
        label: 'Key Features',
        placeholder: 'List main features...',
        required: true,
      },
      fields.tone(),
    ],
    systemPrompt: 'You are an expert product copywriter. Create engaging, conversion-focused product descriptions.',
    buildPrompt: (inputs) => `
Create a product description for: ${inputs.productName}

Features: ${inputs.features}
Tone: ${inputs.tone || 'professional'}

Write an engaging description that:
- Highlights benefits (not just features)
- Creates desire
- Builds trust
- Includes a subtle call-to-action
    `,
  },

  'press-release-writer': {
    id: 'press-release-writer',
    title: 'Press Release Writer',
    description: 'Generate professional press releases',
    category: 'business',
    fields: [
      { name: 'topic', type: 'textarea', label: 'News/Announcement', placeholder: 'What is the announcement?', required: true },
      { name: 'organization', type: 'text', label: 'Organization', placeholder: 'Company name', required: true },
    ],
    systemPrompt: 'Write professional press releases following AP style and journalistic standards.',
    buildPrompt: (inputs) => `
Write a professional press release about:
${inputs.topic}

Organization: ${inputs.organization}

Format:
- Compelling headline
- Dateline (indicate generic date format)
- Lead paragraph with who/what/when/why
- 2-3 supporting paragraphs with details
- Company description
- Contact info format
    `,
  },

  'job-description-writer': {
    id: 'job-description-writer',
    title: 'Job Description Writer',
    description: 'Create detailed job postings',
    category: 'business',
    fields: [
      { name: 'position', type: 'text', label: 'Job Title', required: true },
      { name: 'responsibilities', type: 'textarea', label: 'Key Responsibilities', required: true },
      { name: 'requirements', type: 'textarea', label: 'Required Skills', required: true },
    ],
    systemPrompt: 'You are an HR expert. Write clear, attractive job descriptions that attract qualified candidates.',
    buildPrompt: (inputs) => `
Write a job description for: ${inputs.position}

Responsibilities: ${inputs.responsibilities}
Required Skills: ${inputs.requirements}

Include:
- Compelling role overview
- Key responsibilities (5-8 bullets)
- Required qualifications
- Nice-to-haves
- Benefits/compensation guidance
    `,
  },

  'cover-letter-writer': {
    id: 'cover-letter-writer',
    title: 'Cover Letter Writer',
    description: 'Generate professional cover letters',
    category: 'business',
    fields: [
      { name: 'jobTitle', type: 'text', label: 'Job Title', required: true },
      { name: 'company', type: 'text', label: 'Company Name', required: true },
      { name: 'skills', type: 'textarea', label: 'Relevant Experience/Skills', required: true },
    ],
    systemPrompt: 'Write compelling, personalized cover letters that highlight candidate strengths.',
    buildPrompt: (inputs) => `
Write a cover letter for ${inputs.jobTitle} at ${inputs.company}

Relevant skills: ${inputs.skills}

Structure:
- Professional greeting
- Hook paragraph showing enthusiasm
- 2-3 paragraphs highlighting relevant experience
- Call to action
- Professional closing
    `,
  },

  'proposal-writer': {
    id: 'proposal-writer',
    title: 'Proposal Writer',
    description: 'Create business proposals for sales/projects',
    category: 'business',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Project/Service Overview', required: true },
      { name: 'deliverables', type: 'textarea', label: 'What Will You Deliver?', required: true },
      { name: 'timeline', type: 'text', label: 'Timeline', placeholder: '3 months, Q2 2024, etc.', required: true },
    ],
    systemPrompt: 'Expert proposal writer that creates persuasive, professional business proposals.',
    buildPrompt: (inputs) => `
Write a business proposal outline:

Project: ${inputs.topic}
Deliverables: ${inputs.deliverables}
Timeline: ${inputs.timeline}

Sections:
1. Executive Summary
2. Problem/Opportunity
3. Proposed Solution
4. Deliverables & Milestones
5. Timeline
6. Investment/Budget
7. Why Us

Make it persuasive and client-focused.
    `,
  },

  'contract-summary': {
    id: 'contract-summary',
    title: 'Contract Summarizer',
    description: 'Summarize legal contracts in plain language',
    category: 'business',
    fields: [
      { name: 'contractText', type: 'textarea', label: 'Contract Text', placeholder: 'Paste contract here...', required: true },
    ],
    systemPrompt: 'You are a legal expert who explains contracts in simple, accessible language.',
    buildPrompt: (inputs) => `
Summarize this contract in plain language:

${inputs.contractText.substring(0, 2000)}...

Include:
- Key terms and conditions
- Obligations of each party
- Payment terms
- Termination clauses
- Notable risks/concerns
- Plain English explanation
    `,
  },

  // ============ ADDITIONAL GENERATION TOOLS ============

  'research-paper-writer': {
    id: 'research-paper-writer',
    title: 'Research Paper Writer',
    description: 'Generate research paper outlines and content',
    category: 'generate',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Research Topic', required: true },
      { name: 'academicLevel', type: 'select', label: 'Academic Level', required: false, options: [
        { value: 'undergraduate', label: 'Undergraduate' },
        { value: 'graduate', label: 'Graduate' },
        { value: 'phd', label: 'PhD' },
      ]},
    ],
    systemPrompt: 'Write academic research paper content following scholarly standards.',
    buildPrompt: (inputs) => `
Create research paper structure for: ${inputs.topic}

Level: ${inputs.academicLevel || 'academic'}

Include:
- Thesis statement
- Introduction
- Literature review outline
- Methodology section
- Expected findings
- Conclusion structure
    `,
  },

  'poem-generator': {
    id: 'poem-generator',
    title: 'Poem Generator',
    description: 'Create original poems in various styles',
    category: 'generate',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Poem Topic/Theme', required: true },
      { name: 'style', type: 'select', label: 'Poetry Style', required: false, options: [
        { value: 'haiku', label: 'Haiku' },
        { value: 'sonnet', label: 'Sonnet' },
        { value: 'free-verse', label: 'Free Verse' },
        { value: 'acrostic', label: 'Acrostic' },
        { value: 'limerick', label: 'Limerick' },
      ]},
    ],
    systemPrompt: 'You are a talented poet who creates original, evocative poems.',
    buildPrompt: (inputs) => `
Write a ${inputs.style || 'poem'} about: ${inputs.topic}

Create something original, emotionally resonant, and well-crafted for the style.
    `,
  },

  'song-lyric-generator': {
    id: 'song-lyric-generator',
    title: 'Song Lyric Generator',
    description: 'Generate song lyrics and melodies concepts',
    category: 'generate',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Song Topic/Story', required: true },
      { name: 'genre', type: 'select', label: 'Genre', required: false, options: [
        { value: 'pop', label: 'Pop' },
        { value: 'country', label: 'Country' },
        { value: 'rock', label: 'Rock' },
        { value: 'hip-hop', label: 'Hip-Hop' },
        { value: 'blues', label: 'Blues' },
      ]},
    ],
    systemPrompt: 'Write original song lyrics with emotion, rhythm, and memorable hooks.',
    buildPrompt: (inputs) => `
Write song lyrics (${inputs.genre || 'pop'}) about: ${inputs.topic}

Structure:
- Verse 1
- Chorus
- Verse 2
- Bridge
- Final Chorus

Make it catchy with a memorable hook.
    `,
  },

  'movie-script-generator': {
    id: 'movie-script-generator',
    title: 'Movie Script Generator',
    description: 'Create screenplay scenes and dialogues',
    category: 'generate',
    fields: [
      { name: 'genre', type: 'select', label: 'Genre', required: true, options: [
        { value: 'drama', label: 'Drama' },
        { value: 'comedy', label: 'Comedy' },
        { value: 'action', label: 'Action' },
        { value: 'thriller', label: 'Thriller' },
      ]},
      { name: 'sceneDescription', type: 'textarea', label: 'Scene Description', required: true },
    ],
    systemPrompt: 'Write professional screenplay content following industry standards.',
    buildPrompt: (inputs) => `
Write a screenplay scene (${inputs.genre}):
${inputs.sceneDescription}

Include:
- Scene heading
- Action description
- Character names and dialogue
- Parentheticals and emotional cues
- Professional formatting
    `,
  },

  // ============ ADDITIONAL SOCIAL MEDIA TOOLS ============

  'tiktok-caption-generator': {
    id: 'tiktok-caption-generator',
    title: 'TikTok Caption Generator',
    description: 'Create viral TikTok captions and hooks',
    category: 'social',
    fields: [
      { name: 'videoTopic', type: 'textarea', label: 'Video Content', placeholder: 'Describe your TikTok...', required: true },
      { name: 'stylePreference', type: 'select', label: 'Style', required: false, options: [
        { value: 'trending', label: 'Trending/Viral' },
        { value: 'educational', label: 'Educational' },
        { value: 'humorous', label: 'Humorous' },
        { value: 'inspirational', label: 'Inspirational' },
      ]},
    ],
    systemPrompt: 'Create catchy, viral TikTok captions that drive engagement.',
    buildPrompt: (inputs) => `
Create TikTok caption for: ${inputs.videoTopic}

Style: ${inputs.stylePreference || 'viral'}

Tips:
- Start with hook (first 3 words critical)
- Add relevant hashtags
- Include call-to-action
- Emojis for visual appeal
- Keep under 150 chars
    `,
  },

  'facebook-post-generator': {
    id: 'facebook-post-generator',
    title: 'Facebook Post Generator',
    description: 'Generate engaging Facebook posts',
    category: 'social',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Post Topic', required: true },
      { name: 'audience', type: 'select', label: 'Target Audience', required: false, options: [
        { value: 'general', label: 'General Public' },
        { value: 'customers', label: 'Customers' },
        { value: 'community', label: 'Community' },
        { value: 'family', label: 'Family & Friends' },
      ]},
    ],
    systemPrompt: 'Create engaging Facebook posts that foster community and engagement.',
    buildPrompt: (inputs) => `
Write Facebook post about: ${inputs.topic}

Audience: ${inputs.audience || 'general'}

Make it:
- Conversational and personal
- Encourage reactions/comments
- Include relevant hashtags
- 100-250 words ideal
    `,
  },

  'youtube-description-generator': {
    id: 'youtube-description-generator',
    title: 'YouTube Description Generator',
    description: 'Create optimized YouTube video descriptions',
    category: 'social',
    fields: [
      { name: 'videoTitle', type: 'text', label: 'Video Title', required: true },
      { name: 'videoContent', type: 'textarea', label: 'What\'s In Your Video?', required: true },
      { name: 'keywords', type: 'textarea', label: 'Keywords/Tags', placeholder: 'e.g., tutorial, cooking, vegan', required: false },
    ],
    systemPrompt: 'Create SEO-optimized YouTube descriptions that increase visibility.',
    buildPrompt: (inputs) => `
YouTube description for: ${inputs.videoTitle}

Content: ${inputs.videoContent}
Keywords: ${inputs.keywords}

Include:
- Hook (first 2 lines visible)
- Video summary
- Timestamps if applicable
- Links/External resources
- Hashtags
- Subscribe CTA
- Keywords for SEO
    `,
  },

  'youtube-title-generator': {
    id: 'youtube-title-generator',
    title: 'YouTube Title Generator',
    description: 'Generate clickable YouTube video titles',
    category: 'social',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Video Topic', required: true },
      { name: 'audience', type: 'select', label: 'Target Audience', required: false, options: [
        { value: 'general', label: 'General Audience' },
        { value: 'educational', label: 'Educational' },
        { value: 'entertainment', label: 'Entertainment' },
        { value: 'tutorial', label: 'Tutorial' },
      ]},
    ],
    systemPrompt: 'Generate compelling YouTube titles that maximize click-through rate.',
    buildPrompt: (inputs) => `
Generate 10 YouTube video titles for: ${inputs.topic}

Audience: ${inputs.audience}

Make titles:
- 50-60 characters max
- Include power words
- Clear value proposition
- Create curiosity/urgency
- Include relevant keywords
    `,
  },

  // ============ ADDITIONAL REWRITE TOOLS ============

  'article-rewriter': {
    id: 'article-rewriter',
    title: 'Article Rewriter',
    description: 'Rewrite articles for different angles/tones',
    category: 'rewrite',
    fields: [
      { name: 'articleText', type: 'textarea', label: 'Original Article', required: true, validation: { minLength: 50 } },
      { name: 'angle', type: 'select', label: 'New Angle', required: false, options: [
        { value: 'simplified', label: 'Simplified Version' },
        { value: 'expanded', label: 'Expanded Version' },
        { value: 'executive', label: 'Executive Summary' },
        { value: 'beginner', label: 'Beginner-Friendly' },
      ]},
    ],
    systemPrompt: 'Rewrite articles while maintaining core message but changing perspective/tone.',
    buildPrompt: (inputs) => `
Rewrite this article from a ${inputs.angle || 'different'} perspective:

${inputs.articleText.substring(0, 1500)}

Keep the facts but:
- Adjust tone/voice
- Restructure flow
- Adjust detail level
- Maintain accuracy
    `,
  },

  'blog-post-rewriter': {
    id: 'blog-post-rewriter',
    title: 'Blog Post Rewriter',
    description: 'Refresh and optimize blog posts',
    category: 'rewrite',
    fields: [
      { name: 'blogText', type: 'textarea', label: 'Blog Post', required: true },
      { name: 'updateType', type: 'select', label: 'Update Type', required: false, options: [
        { value: 'seo', label: 'SEO Optimization' },
        { value: 'engagement', label: 'Higher Engagement' },
        { value: 'readability', label: 'Better Readability' },
        { value: 'modern', label: 'Modern Update' },
      ]},
    ],
    systemPrompt: 'Refresh blog posts to improve readability, SEO, and engagement.',
    buildPrompt: (inputs) => `
Refresh this blog post for ${inputs.updateType || 'improvement'}:

${inputs.blogText.substring(0, 1500)}

Improve in terms of:
- ${inputs.updateType === 'seo' ? 'Keywords and meta' : 'Content clarity'}
- Structure and flow
- Engagement and CTA
- Modern examples/references
    `,
  },

  'tone-of-voice': {
    id: 'tone-of-voice',
    title: 'Tone of Voice Converter',
    description: 'Convert text to different tones',
    category: 'rewrite',
    fields: [
      { name: 'inputText', type: 'textarea', label: 'Original Text', required: true },
      { name: 'targetTone', type: 'select', label: 'Target Tone', required: true, options: [
        { value: 'professional', label: 'Professional' },
        { value: 'casual', label: 'Casual' },
        { value: 'humorous', label: 'Humorous' },
        { value: 'persuasive', label: 'Persuasive' },
        { value: 'empathetic', label: 'Empathetic' },
      ]},
    ],
    systemPrompt: 'Convert text to match the target tone while preserving meaning.',
    buildPrompt: (inputs) => `
Rewrite in ${inputs.targetTone} tone:

${inputs.inputText}

Change tone to feel ${inputs.targetTone} while keeping the same message.
    `,
  },

  'ai-humanizer': {
    id: 'ai-humanizer',
    title: 'AI Humanizer',
    description: 'Make AI-generated text sound more human',
    category: 'rewrite',
    fields: [
      { name: 'aiText', type: 'textarea', label: 'AI-Generated Text', required: true },
    ],
    systemPrompt: 'Make AI text sound more natural and human while maintaining accuracy.',
    buildPrompt: (inputs) => `
Make this text sound more natural and human:

${inputs.aiText}

Replace:
- Repetitive phrases
- Overly formal language
- Obvious AI patterns
- Add personality
- Improve flow
    `,
  },

  'explain-it': {
    id: 'explain-it',
    title: 'Explain It Simply',
    description: 'Simplify complex topics for general audience',
    category: 'rewrite',
    fields: [
      { name: 'complexText', type: 'textarea', label: 'Complex Topic', required: true },
      { name: 'audienceLevel', type: 'select', label: 'Explain For', required: false, options: [
        { value: 'child', label: 'Child (5-10 years)' },
        { value: 'teen', label: 'Teen (13-18 years)' },
        { value: 'adult', label: 'General Adult' },
      ]},
    ],
    systemPrompt: 'Explain complex topics in simple, accessible language with examples.',
    buildPrompt: (inputs) => `
Explain this complex topic simply for ${inputs.audienceLevel || 'general audience'}:

${inputs.complexText}

Use:
- Simple words
- Real-world examples
- Analogies
- Step-by-step explanation
- Avoid jargon
    `,
  },

  // ============ PHASE 6: UTILITIES ============

  'keyword-generator': {
    id: 'keyword-generator',
    title: 'Keyword Generator',
    description: 'Generate SEO keywords and keyword clusters',
    category: 'utility',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Topic/Service', required: true },
      { name: 'intent', type: 'select', label: 'Search Intent', required: false, options: [
        { value: 'informational', label: 'Informational' },
        { value: 'transactional', label: 'Transactional' },
        { value: 'commercial', label: 'Commercial' },
        { value: 'navigational', label: 'Navigational' },
      ]},
    ],
    systemPrompt: 'Generate relevant SEO keywords and keyword clusters for content strategy.',
    buildPrompt: (inputs) => `
Generate keywords for: ${inputs.topic}

Search Intent: ${inputs.intent || 'all'}

Provide:
- Primary keywords
- Long-tail keywords
- Related keyword clusters
- Search volume context
- Difficulty assessment
    `,
  },

  'outline-generator': {
    id: 'outline-generator',
    title: 'Content Outline Generator',
    description: 'Create structured outlines for content',
    category: 'utility',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Topic', required: true },
      { name: 'contentType', type: 'select', label: 'Content Type', required: false, options: [
        { value: 'article', label: 'Article' },
        { value: 'guide', label: 'Guide' },
        { value: 'tutorial', label: 'Tutorial' },
        { value: 'report', label: 'Report' },
      ]},
    ],
    systemPrompt: 'Create clear, logical outlines that serve as roadmaps for content.',
    buildPrompt: (inputs) => `
Create an outline for ${inputs.contentType || 'content'} about: ${inputs.topic}

Include:
- Main sections
- Subsections
- Key points per section
- Suggested content depth
    `,
  },

  'question-generator': {
    id: 'question-generator',
    title: 'Question Generator',
    description: 'Generate thought-provoking questions',
    category: 'utility',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Topic', required: true },
      { name: 'purpose', type: 'select', label: 'Purpose', required: false, options: [
        { value: 'engagement', label: 'Audience Engagement' },
        { value: 'reflection', label: 'Self-Reflection' },
        { value: 'research', label: 'Research' },
        { value: 'brainstorm', label: 'Brainstorming' },
      ]},
    ],
    systemPrompt: 'Generate relevant, thought-provoking questions that drive engagement.',
    buildPrompt: (inputs) => `
Generate 15 questions about: ${inputs.topic}

Purpose: ${inputs.purpose}

Make questions:
- Clear and concise
- Engaging
- Open-ended where appropriate
- Progressively complex
    `,
  },

  'brainstorm-ideas': {
    id: 'brainstorm-ideas',
    title: 'Brainstorm Ideas',
    description: 'Creative idea generation for any topic',
    category: 'utility',
    fields: [
      { name: 'topic', type: 'textarea', label: 'What do you need ideas for?', required: true },
      { name: 'style', type: 'select', label: 'Idea Style', required: false, options: [
        { value: 'innovative', label: 'Innovative' },
        { value: 'practical', label: 'Practical' },
        { value: 'wild', label: 'Wild/Unconventional' },
        { value: 'balanced', label: 'Balanced Mix' },
      ]},
    ],
    systemPrompt: 'Generate diverse, creative ideas using brainstorming techniques.',
    buildPrompt: (inputs) => `
Brainstorm ${inputs.style || 'creative'} ideas for: ${inputs.topic}

Provide:
- 20+ unique ideas
- Brief description for each
- Feasibility/effort rating
- Potential impact
    `,
  },

  'text-expander': {
    id: 'text-expander',
    title: 'Text Expander',
    description: 'Expand short content into detailed pieces',
    category: 'utility',
    fields: [
      { name: 'shortText', type: 'textarea', label: 'Short Text/Notes', required: true },
      { name: 'targetLength', type: 'select', label: 'Expand To', required: false, options: [
        { value: 'medium', label: 'Medium (250 words)' },
        { value: 'long', label: 'Long (500 words)' },
        { value: 'article', label: 'Article (1000+ words)' },
      ]},
    ],
    systemPrompt: 'Expand short text into detailed, comprehensive content with examples.',
    buildPrompt: (inputs) => `
Expand this text to ${inputs.targetLength || 'medium'} length:

${inputs.shortText}

Add:
- Details and examples
- Supporting information
- Context and background
- Actionable insights
- Maintain original meaning
    `,
  },

  // ============ ADDITIONAL GENERATION TOOLS ============

  'fiction-writer': {
    id: 'fiction-writer',
    title: 'Fiction Writer',
    description: 'Generate short fiction stories',
    category: 'generate',
    fields: [
      { name: 'genre', type: 'select', label: 'Genre', required: false, options: [
        { value: 'sci-fi', label: 'Science Fiction' },
        { value: 'fantasy', label: 'Fantasy' },
        { value: 'mystery', label: 'Mystery' },
        { value: 'romance', label: 'Romance' },
        { value: 'horror', label: 'Horror' },
      ]},
      { name: 'premise', type: 'textarea', label: 'Story Premise', required: true },
    ],
    systemPrompt: 'Write engaging, well-structured fiction with compelling characters.',
    buildPrompt: (inputs) => `
Write a ${inputs.genre || 'fiction'} story based on this premise:

${inputs.premise}

Include:
- Compelling opening
- Character development
- Plot progression
- Tension/conflict
- Satisfying conclusion
    `,
  },

  'content-paraphraser': {
    id: 'content-paraphraser',
    title: 'Content Paraphraser',
    description: 'Rephrase content with different word choices',
    category: 'rewrite',
    fields: [
      { name: 'textToParaphrase', type: 'textarea', label: 'Text to Rephrase', required: true },
    ],
    systemPrompt: 'Rephrase content with alternative words while maintaining original meaning.',
    buildPrompt: (inputs) => `
Rephrase this text using different words and structure:

${inputs.textToParaphrase}

Keep:
- Original meaning
- Key information
- Accuracy
- Change vocabulary and phrasing
    `,
  },

  'ai-detector': {
    id: 'ai-detector',
    title: 'AI Detector',
    description: 'Analyze text for AI characteristics',
    category: 'utility',
    fields: [
      fields.inputText('Text to Analyze'),
    ],
    systemPrompt: 'You are a text analysis expert. Analyze text for patterns that might indicate AI generation or human writing.',
    buildPrompt: (inputs) => `
Analyze this text for potential AI-generated characteristics:

${inputs.inputText}

Analyze:
1. Writing patterns
2. Repetitive phrases
3. Sentence structure consistency
4. Natural flow
5. Overall assessment

Provide a likelihood score:
- "Likely AI-generated"
- "Likely Human-written"
- "Inconclusive - Mixed signals"

With reasoning for your assessment.

Note: This is an indicator only, not definitive proof.
    `,
  },
};

/**
 * Helper function to get tool by ID
 */
export function getToolById(toolId: string): AIWriteTool | null {
  return aiWriteTools[toolId] || null;
}

/**
 * Helper function to get tools by category
 */
export function getToolsByCategory(category: ToolCategory): AIWriteTool[] {
  return Object.values(aiWriteTools).filter(tool => tool.category === category);
}

/**
 * Helper function to validate tool inputs
 */
export function validateToolInputs(
  toolId: string,
  inputs: Record<string, any>
): { valid: boolean; errors: string[] } {
  const tool = getToolById(toolId);
  if (!tool) {
    return { valid: false, errors: ['Tool not found'] };
  }

  const errors: string[] = [];

  for (const field of tool.fields) {
    const value = inputs[field.name];

    if (field.required && (!value || value.trim() === '')) {
      errors.push(`${field.label} is required`);
    }

    if (value && field.validation) {
      if (field.validation.minLength && value.length < field.validation.minLength) {
        errors.push(`${field.label} must be at least ${field.validation.minLength} characters`);
      }
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        errors.push(`${field.label} must not exceed ${field.validation.maxLength} characters`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
