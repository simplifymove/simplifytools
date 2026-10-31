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
    systemPrompt: 'You are a careful writing assistant. Create one coherent, readable paragraph from the supplied topic while following the requested tone, length, and language. Use clear transitions and a focused main idea. Do not invent statistics, citations, research findings, quotations, personal experiences, or unverifiable achievements. Present uncertain or context-dependent claims cautiously. Return only the paragraph.',
    buildPrompt: (inputs) => `
Write one high-quality paragraph about: ${inputs.topic}
Tone: ${inputs.tone || 'professional'}
Length: ${inputs.length || 'medium'}
Language: ${inputs.language || 'English'}

Length guidance:
- Short: approximately 50-100 words
- Medium: approximately 100-200 words
- Long: approximately 200-400 words

Requirements:
- Write one coherent paragraph focused on the supplied topic
- Use the selected language throughout the response
- Match the selected tone while keeping the writing natural
- Follow the selected length range approximately
- Begin with a clear main idea and develop it logically
- Use specific but supportable explanations instead of empty filler
- Avoid fabricated statistics, research findings, citations, and quotations
- Do not invent personal experiences, company results, or promises
- Use careful wording for claims that depend on circumstances
- Check grammar, punctuation, clarity, and transitions
- Return only the paragraph without headings or commentary
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
    systemPrompt: 'You are a careful content editor. Improve the clarity, readability, structure, and natural flow of supplied text while preserving its original meaning, purpose, factual details, and level of certainty. Retain names, dates, numbers, quotations, technical terms, conditions, and important qualifications. Follow the requested tone and language without exaggerating claims or changing the intended audience. Do not invent evidence, statistics, citations, achievements, promises, or product capabilities. Preserve essential formatting such as headings, lists, and paragraph boundaries where useful. Return only the revised content.',
    buildPrompt: (inputs) => `
Improve the following content without changing its intended meaning:

${inputs.inputText}

Requested tone: ${inputs.tone || 'professional'}
Requested language: ${inputs.language || 'English'}

Editing requirements:
- Improve grammar, punctuation, clarity, sentence flow, and readability
- Replace vague or awkward wording with more precise natural language
- Strengthen organization and transitions without introducing unrelated ideas
- Preserve the original message, purpose, audience, and level of certainty
- Retain all supplied names, dates, figures, quotations, and technical details
- Keep conditions, limitations, disclaimers, and important qualifications intact
- Use the requested tone consistently without exaggeration or promotional filler
- Write in the selected language while preserving proper names and necessary technical terms
- Preserve meaningful headings, lists, and paragraph structure when appropriate
- Do not invent statistics, sources, customer results, commitments, or unsupported claims
- Do not add new factual assertions merely to make the text sound stronger
- Avoid unnecessary repetition and excessive rewriting of already clear passages
- Return only the improved content, without an explanation or change log
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
    systemPrompt: 'You are a careful summarization assistant. Condense supplied text accurately while preserving its central message, essential facts, and important qualifications. Prioritize decisions, outcomes, responsibilities, deadlines, figures, and exceptions when they are relevant to the source. Distinguish confirmed statements from proposals, estimates, opinions, and uncertainty. Do not invent information, imply unsupported conclusions, add external research, or present missing details as facts. Follow the requested summary format and return only the summary.',
    buildPrompt: (inputs) => `
Summarize the following content concisely:

${inputs.inputText}

Summary format: ${
  inputs.summaryLength === '1-2'
    ? 'Write 1-2 concise sentences.'
    : inputs.summaryLength === 'bullet'
      ? 'Write concise bullet points covering the main ideas.'
      : 'Write 3-5 concise sentences.'
}

Requirements:
- Identify the central message and most important supporting points
- Prioritize relevant decisions, outcomes, action items, and responsibilities
- Preserve important names, numbers, dates, deadlines, and conditions
- Retain exceptions, limitations, and uncertainty that affect the meaning
- Distinguish confirmed facts from suggestions, estimates, and opinions
- Use concise, readable language without unnecessary repetition
- Follow the selected sentence count or bullet-point format
- Do not add outside knowledge, fabricated facts, quotations, or conclusions
- Do not invent decisions, deadlines, commitments, or missing context
- Avoid changing the strength or certainty of the original statements
- Omit minor details only when doing so does not distort the source
- Return only the summary without introductory commentary
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
- Correct grammar, spelling, and punctuation in the selected language
- Preserve the original meaning, factual details, and author's voice
- Keep names, numbers, dates, quotations, and technical terminology unchanged unless an obvious error needs correction
- Retain paragraph breaks and formatting where practical
- Avoid unnecessary paraphrasing or adding information
- Use the selected language for corrections; do not translate the text into a different language
- Language: ${inputs.language || 'English'}

Return only the corrected version.
    `,
  },

  'translate': {
    id: 'translate',
    title: 'Translate',
    description: 'Translate text into a selected language or regional variant while preserving meaning and important details',
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
    systemPrompt: 'You are a careful multilingual translation assistant. Translate the supplied text into the selected target language or regional variant using natural, appropriate wording. Preserve the original meaning, tone, names, dates, numbers, units, links, and important qualifications. Do not invent information, omit significant details, or add explanations not present in the source. Preserve formatting where practical. Infer the source language from the supplied text when possible; do not pretend certainty when the text is ambiguous. Respect regional vocabulary, spelling, and conventions where appropriate. Do not guarantee perfect translation accuracy, especially for specialized or ambiguous material.',
    buildPrompt: (inputs) => `
Translate the following text into the selected target language.

Target language or regional variant:
${inputs.targetLanguage}

Source text:
${inputs.inputText}

Translation requirements:
- Infer the source language from the supplied text where possible
- Use natural wording appropriate to the selected target language
- Respect the selected regional variant when one is specified
- Preserve the original meaning, intent, tone, and level of formality
- Preserve names, dates, numbers, amounts, measurements, URLs, and important qualifications
- Keep paragraphs, lists, line breaks, and other formatting where practical
- Do not add new facts, explanations, promises, or commentary
- Do not omit significant information or silently change the meaning
- Preserve terminology consistently when the context makes its meaning clear
- When wording is ambiguous, avoid unsupported assumptions
- If the source is already in the target language, retain its meaning and avoid unnecessary rewriting

Return only the translated text.
    `,
  },

  'blog-post-generator': {
    id: 'blog-post-generator',
    title: 'Blog Post Generator',
    description: 'Generate an editable blog post draft from a topic',
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
          { value: 'short', label: 'Short Draft' },
          { value: 'medium', label: 'Medium Draft' },
          { value: 'long', label: 'Longer Draft' },
        ],
      },
    ],
    systemPrompt: 'You are an expert blog writer. Create engaging, SEO-friendly blog posts with clear structure.',
    buildPrompt: (inputs) => `
Write a blog post about: ${inputs.topic}

Keywords to include: ${inputs.keywords || 'none'}
Tone: ${inputs.tone || 'professional'}
Draft length: ${inputs.postLength || 'medium'} (relative length preference; keep within the available response limit)

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
- Do not invent statistics, quotations, studies, citations, or source URLs
- Avoid presenting unsupported claims as established facts
- Include useful, specific explanations and actionable examples rather than generic filler
- Integrate supplied keywords naturally without keyword stuffing
- Treat the result as an editable draft that requires fact-checking before publication
    `,
  },

  'faq-generator': {
    id: 'faq-generator',
    title: 'FAQ Generator',
    description: 'Draft FAQ questions and answers from a topic or supplied information',
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
    systemPrompt: 'Create useful FAQ question-and-answer drafts based on the information provided. Do not invent product features, prices, refund policies, privacy guarantees, legal obligations, tax rules, statistics, or business claims. If a question requires information that was not supplied, clearly indicate what needs confirmation rather than presenting an unsupported answer as fact.',
    buildPrompt: (inputs) => `
Generate FAQ for: ${inputs.topic}

Number of Q&A pairs: ${inputs.numQuestions || '10'}
Tone: ${inputs.tone || 'professional'}

Requirements:
- Prioritize questions genuinely relevant to the supplied topic
- Provide clear, concise, practical answers
- Avoid repetitive questions or generic filler
- Match the selected tone without sacrificing factual accuracy
- Do not invent product capabilities, pricing, policies, guarantees, or contact details
- When details are missing, explicitly state that they must be confirmed
- Keep answers brief enough to fit the available response length, especially when 15 questions are requested
- Aim for the selected number of Q&A pairs, but do not sacrifice accuracy or completeness merely to reach the count
- Format each pair as Q: [question]\nA: [answer]
    `,
  },

  'word-counter': {
    id: 'word-counter',
    title: 'Word Counter',
    description: 'Count words, characters, sentences, and paragraphs, with estimated reading time and readability',
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
    systemPrompt: 'You are a careful sentence-editing assistant. Rewrite the supplied sentences for clarity, readability, and the requested tone while preserving the original meaning, intent, factual claims, names, dates, numbers, qualifications, and technical details. Do not invent facts, benefits, statistics, promises, or citations. Do not remove important conditions or change the level of certainty. Return only the rewritten text.',
    buildPrompt: (inputs) => `
Rewrite the following sentences for better clarity and impact:

${inputs.inputText}

Tone: ${inputs.tone || 'professional'}

Requirements:
- Improve clarity, grammar, and readability
- Reduce awkward phrasing and unnecessary repetition
- Preserve the original meaning and writer's intent
- Match the selected tone without exaggerating claims
- Preserve names, dates, numbers, units, and technical terms
- Keep important qualifications, conditions, and uncertainty intact
- Do not add unsupported benefits, statistics, or promises
- Do not turn tentative statements into definite claims
- Preserve sentence order unless a small change improves clarity
- Rewrite only the supplied text without unrelated additions

Return only the rewritten version.
    `,
  },

  'paragraph-rewriter': {
    id: 'paragraph-rewriter',
    title: 'Paragraph Rewriter',
    description: 'Rewrite paragraphs for clarity, flow, and tone while preserving their meaning',
    category: 'rewrite',
    fields: [
      fields.inputText('Paragraph to Rewrite'),
      fields.tone(),
    ],
    systemPrompt: 'You are a careful writing editor. Rewrite the supplied paragraph to improve clarity, flow, and readability while preserving its original meaning, facts, qualifications, names, numbers, and important details. Follow the requested tone without introducing new claims or changing the intent. Do not invent information, citations, achievements, or promises. Return only the rewritten paragraph.',
    buildPrompt: (inputs) => `
Rewrite the following paragraph for better clarity and impact:

${inputs.inputText}

Tone: ${inputs.tone || 'professional'}

Requirements:
- Improve sentence flow, transitions, and readability
- Reduce unnecessary repetition and awkward wording
- Match the selected tone without changing the core message
- Preserve names, dates, figures, factual claims, and qualifications
- Do not add unsupported benefits, promises, examples, or statistics
- Do not remove important conditions or change the writer's intent
- Keep the result as one coherent paragraph unless the input requires otherwise
- Rewrite only the supplied text; do not add unrelated content

Return only the rewritten paragraph.
    `,
  },

  'title-rewriter': {
    id: 'title-rewriter',
    title: 'Title Rewriter',
    description: 'Generate alternative titles and headlines from your existing title and optional content context',
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
    systemPrompt: 'You are a title-editing assistant. Generate clear, distinct alternative titles that preserve the original topic, factual meaning, and intended audience. Use the supplied content context when available. Do not invent statistics, rankings, awards, results, claims, products, or promises. Avoid clickbait, misleading urgency, exaggerated benefits, and unsupported superlatives. Titles should be useful to readers rather than written solely to attract clicks. Do not guarantee search rankings, traffic, click-through rates, or engagement.',
    buildPrompt: (inputs) => `
Rewrite the following existing title into five alternative titles:

Original title:
${inputs.currentTitle}

Additional content context:
${inputs.context || 'No additional context provided'}

Requirements:
- Provide exactly five distinct, ready-to-use title alternatives
- Keep the original topic and meaning accurate
- Use the additional context when provided
- Explore useful variations in clarity, length, structure, and emphasis
- Use natural, specific language rather than generic promotional phrases
- Avoid keyword stuffing and misleading clickbait
- Do not add facts, numbers, benefits, results, or promises absent from the input
- Do not claim that any option will improve search rankings or clicks
- If context is missing, stay close to the original title rather than guessing details
- Keep each title concise without imposing an arbitrary character limit

Output format:
1. Alternative title
   Reason: One brief sentence explaining the wording choice

Repeat for all five options.
Do not add unrelated commentary.
    `,
  },

  // ============ PHASE 3: GENERATION FAMILY ============

  'essay-writer': {
    id: 'essay-writer',
    title: 'Essay Writer',
    description: 'Create structured essay drafts from a topic and essay type',
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
    systemPrompt: 'Create structured essay drafts for writing and learning support. Do not invent research findings, quotations, statistics, studies, citations, or references. Do not present unsupported claims as verified facts. Encourage independent source checking and compliance with academic integrity requirements.',
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
- Follow the selected essay type and requested number of main body sections where output length allows
- Prefer concise, meaningful sections over filler or repetition
- Do not invent citations, quotations, statistics, studies, or sources
- Treat factual claims as points requiring independent verification
- Do not claim that research or source verification was performed
- If the requested structure exceeds available output space, prioritize a coherent draft rather than pretending it is complete
- The result is a draft for review, research, and revision, not a verified academic submission
    `,
  },

  'story-generator': {
    id: 'story-generator',
    title: 'Story Generator',
    description: 'Create fictional story drafts from your idea and preferred story length',
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
    systemPrompt: 'You are a creative fiction-writing assistant. Develop an original story draft from the supplied idea, with a consistent setting, believable character motivations, meaningful conflict, and a coherent ending. Use vivid but purposeful descriptions and natural dialogue where appropriate. Maintain continuity in names, events, chronology, and point of view. Do not reproduce recognizable plots, passages, dialogue, or distinctive characters from existing works. Do not closely imitate a specific living author. Treat the output as a creative draft, not a guarantee of originality or publication readiness.',
    buildPrompt: (inputs) => `
Write a creative fictional story based on this prompt:

${inputs.storyPrompt}

Selected length: ${inputs.storyLength || 'medium'}
Length guidance:
- short: approximately 300-500 words
- medium: approximately 500-1000 words
- long: approximately 1000 words or more
Follow the selected range as closely as practical, subject to response limits.

Requirements:
- Establish a clear setting and central character
- Introduce a goal, mystery, obstacle, or meaningful conflict
- Develop the story through connected events and decisions
- Use vivid descriptions that support the atmosphere
- Include natural dialogue when it improves the scene
- Maintain consistent character names, chronology, and point of view
- Build toward a meaningful turning point or discovery
- Provide a coherent ending appropriate to the premise
- Avoid copying recognizable existing stories or characters
- Write the story itself, not a summary or writing plan
- Do not add unrelated promotional commentary
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
    systemPrompt: 'You are an article drafting assistant. Create clear, engaging drafts for different audiences. Do not invent sources, quotations, or claim independent research or fact verification.',
    buildPrompt: (inputs) => `
Write a ${inputs.articleType || 'general'} article about: ${inputs.topic}

Target audience: ${inputs.audience || 'general'}

Requirements:
- Professional tone
- Clear structure
- Engaging headline
- Avoid fabricated facts, quotations, citations, or sources
- Flag claims that require independent verification
- Appropriate for audience
    `,
  },

  // ============ PHASE 4: SOCIAL/MEDIA FAMILY ============

  'instagram-caption-generator': {
    id: 'instagram-caption-generator',
    title: 'Instagram Caption Generator',
    description: 'Draft Instagram captions from your post description with optional hashtags',
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
    systemPrompt: 'Write clear, natural Instagram caption drafts based on the supplied post context. Do not invent product features, prices, discounts, availability, testimonials, partnerships, results, or other promotional claims. Avoid promising engagement, reach, or follower growth. Respect the requested hashtag option and leave uncertain details out.',
    buildPrompt: (inputs) => `
Create an engaging Instagram caption for:

${inputs.postContext}

Requirements:
- Write a natural caption that reflects the supplied post context
- Keep the caption concise and easy to read on Instagram
- Include a relevant call to action only when appropriate
- Do not invent product specifications, prices, offers, results, or brand claims
- ${inputs.includeHashtags === 'yes' ? 'Suggest 10-15 relevant hashtags based on the supplied context; avoid unrelated or misleading tags' : 'Do not include hashtags'}
- Use emojis sparingly where they suit the subject and tone
- Return the caption itself, not an explanation of what a caption could contain
    `,
  },

  'twitter-generator': {
    id: 'twitter-generator',
    title: 'Twitter Generator',
    description: 'Generate three short Twitter/X post options from your topic and selected writing tone',
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
    systemPrompt: 'You are a short-form social media writing assistant. Create three distinct Twitter/X post drafts based on the supplied topic and selected tone. Keep each post concise and aim for no more than 280 characters per post. Preserve supplied facts and qualifications. Do not invent product features, statistics, customer experiences, dates, endorsements, results, or links. Avoid misleading claims, engagement bait, fabricated mentions, and unnecessary hashtags. Use emojis only when appropriate. Return editable drafts without promising engagement or reach.',
    buildPrompt: (inputs) => `
Create three different Twitter/X post drafts based on this topic:

${inputs.tweetTopic}

Selected tone: ${inputs.tone || 'professional'}

Requirements:
- Produce exactly three distinct post options
- Aim to keep each post within 280 characters, excluding the Tweet 1/2/3 labels
- Use a clear message with concise, natural wording
- Match the selected tone without forcing a professional style when another tone is chosen
- Preserve the facts and meaning provided in the topic
- Do not invent statistics, testimonials, dates, product capabilities, or outcomes
- Do not invent links, account handles, or endorsements
- Use a relevant hashtag or emoji only if it improves the message
- Avoid clickbait, excessive hashtags, and unsupported promises
- Keep each option suitable for human review before publishing
- If the topic is too vague, use cautious wording instead of assuming missing details

Format as:
Tweet 1: [post text]
Tweet 2: [post text]
Tweet 3: [post text]
    `,
  },

  'linkedin-post-generator': {
    id: 'linkedin-post-generator',
    title: 'LinkedIn Post Generator',
    description: 'Draft professional LinkedIn posts from a topic and selected length',
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
    systemPrompt: 'Draft clear, professional LinkedIn posts using only the supplied topic and context. Do not invent personal experiences, employment history, project outcomes, client names, professional achievements, statistics, testimonials, endorsements, or business results. Do not guarantee engagement, reach, credibility, or thought leadership. Keep claims accurate, avoid fabricated first-person stories, and write a draft that the user can personalize before publishing.',
    buildPrompt: (inputs) => `
Create a LinkedIn post about: ${inputs.topic}

Length: ${inputs.postLength || 'medium'}

Requirements:
- Use a clear, professional, conversational tone without overstating expertise
- Start with a relevant opening line
- Develop a useful observation or idea grounded in the supplied topic
- Respect the selected length: short (3-4 sentences), medium (1 paragraph), or long (2-3 paragraphs)
- End with a relevant question or optional call to action
- Avoid invented first-person experiences, professional achievements, project outcomes, and metrics
- Do not fabricate quotations, endorsements, employer details, or statistics
- Suggest hashtags only when relevant, without claiming they guarantee reach
- Output a LinkedIn post draft, not an explanation of how to write one
- Leave unsupported details out for the user to add and verify
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
    systemPrompt: 'You are a cold-outreach drafting assistant. Write concise, relevant emails based on user-provided details. Do not invent recipient research, existing relationships, testimonials, results, offers, or unverifiable claims.',
    buildPrompt: (inputs) => `
Write a cold email to: ${inputs.companyName}

Purpose: ${inputs.purpose}
Tone: ${inputs.tone || 'professional'}

Requirements:
- Personalized and genuine
- Clear value proposition
- Strong subject line
- Call-to-action
- Match the selected tone while remaining respectful
- Avoid invented personalization or unsupported promises
- Include a subject line, concise email body, and clear call to action
- Output a draft only; do not imply the email was sent
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
    systemPrompt: 'You are a business naming and branding assistant. Generate varied, memorable name ideas based on the supplied business description and selected style. Explore genuinely different naming approaches while keeping names reasonably clear, pronounceable, and relevant. Do not imply that generated names are original, legally available, trademark-safe, registrable, or available as domains or social handles. Do not invent verification results or guarantee commercial suitability.',
    buildPrompt: (inputs) => `
Generate business name ideas for:

${inputs.businessType}

Selected naming style: ${inputs.style || 'modern'}

Style guidance:
- modern: contemporary, concise, technology-friendly names
- classic: professional, clear, established-sounding names
- creative: imaginative names with varied word combinations
- playful: approachable, lively, memorable names

Requirements:
- Suggest 15 distinct business names in a numbered list
- Include a brief naming rationale for each suggestion
- Reflect the supplied business description and selected style
- Explore different naming structures rather than minor variations
- Prefer names that are reasonably easy to spell and pronounce
- Avoid obvious imitations of well-known existing brands
- Do not claim that names, trademarks, registrations, domains, or social handles have been checked
- Do not invent domain availability or trademark search results
- Finish with three criteria for shortlisting the strongest names
- Remind the user to independently check trademark rights, registration requirements, domains, social handles, and relevant cultural meanings before using a name
    `,
  },

  // ============ ADDITIONAL BUSINESS/LEGAL TOOLS ============

  'product-description-writer': {
    id: 'product-description-writer',
    title: 'Product Description Writer',
    description: 'Create product-description drafts from supplied features and your preferred tone',
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
    systemPrompt: 'Write clear, engaging product-description drafts using only the product name and features supplied by the user. Adapt the wording to the requested tone and explain practical benefits only when they follow reasonably from the stated features. Do not invent specifications, battery life, dimensions, materials, compatibility, certifications, warranties, pricing, discounts, availability, reviews, ratings, awards, or performance claims. Avoid exaggerated promises, unsupported comparisons, and misleading urgency. Return useful product copy that can be reviewed before publication.',
    buildPrompt: (inputs) => `
Create a product description for: ${inputs.productName}

Features: ${inputs.features}
Tone: ${inputs.tone || 'professional'}

Write a product-description draft that:
- Opens with a clear description of the named product
- Explains the supplied features in natural, customer-facing language
- Connects features to reasonable everyday uses without inventing capabilities
- Uses the requested tone consistently
- Keeps paragraphs concise and suitable for an e-commerce listing
- Includes a subtle call to action only when appropriate

Accuracy requirements:
- Do not invent technical specifications, dimensions, materials, or battery life
- Do not claim compatibility, certifications, warranties, or guarantees unless supplied
- Do not invent prices, discounts, stock availability, or delivery terms
- Do not fabricate customer reviews, ratings, awards, or endorsements
- Avoid unsupported superlatives such as best, fastest, or guaranteed
- Use only the supplied product details as factual claims
- Output the product description itself without explanatory commentary
    `,
  },

  'press-release-writer': {
    id: 'press-release-writer',
    title: 'Press Release Writer',
    description: 'Draft a structured press release from your organization and announcement details',
    category: 'business',
    fields: [
      { name: 'topic', type: 'textarea', label: 'News/Announcement', placeholder: 'What is the announcement?', required: true },
      { name: 'organization', type: 'text', label: 'Organization', placeholder: 'Company name', required: true },
    ],
    systemPrompt: 'Write clear, professional press-release drafts using only the announcement and organization information supplied. Follow conventional news-release structure and straightforward journalistic language. Do not invent launch dates, locations, executive quotations, statistics, product capabilities, partnerships, awards, customer numbers, endorsements, or media-contact information. Use clearly labeled placeholders for essential details that were not provided. Never present assumptions as confirmed news. Return a draft suitable for factual and editorial review, not a claim that the release is publication-ready.',
    buildPrompt: (inputs) => `
Write a professional press release about:
${inputs.topic}

Organization: ${inputs.organization}

Format:
- Factual headline describing the supplied announcement
- Dateline using [CITY] and [DATE] placeholders unless confirmed details are supplied
- Lead paragraph identifying the organization and the actual announcement
- Supporting paragraphs expanding only on supplied facts
- Optional quotation placeholder only when a quotation would be useful
- Brief organization description based only on supplied information
- Media-contact section with placeholders for missing details

Accuracy requirements:
- Do not invent dates, locations, product features, statistics, or outcomes
- Do not fabricate executive names, statements, customer testimonials, or quotations
- Do not invent partnerships, funding, awards, or endorsements
- Mark missing essential information with clear square-bracket placeholders
- Avoid promotional superlatives and unsupported claims
- Keep the draft concise, factual, and suitable for PR review
- Return the press-release draft without explanatory commentary
    `,
  },

  'job-description-writer': {
    id: 'job-description-writer',
    title: 'Job Description Writer',
    description: 'Create structured job description drafts from a role, responsibilities, and required skills',
    category: 'business',
    fields: [
      { name: 'position', type: 'text', label: 'Job Title', required: true },
      { name: 'responsibilities', type: 'textarea', label: 'Key Responsibilities', required: true },
      { name: 'requirements', type: 'textarea', label: 'Required Skills', required: true },
    ],
    systemPrompt: 'Create clear, inclusive job-description drafts based only on the role information supplied. Do not invent employer details, salary ranges, benefits, location, remote-work arrangements, employment type, qualifications, credentials, or legal requirements. Avoid discriminatory or unnecessarily exclusionary wording. Leave unprovided employment terms out and flag details that need confirmation.',
    buildPrompt: (inputs) => `
Write a job description for: ${inputs.position}

Responsibilities: ${inputs.responsibilities}
Required Skills: ${inputs.requirements}

Include:
- A concise role overview based on the supplied job title
- Key responsibilities reflecting the supplied duties
- Required skills and qualifications supported by the supplied information
- Optional preferred skills only if the supplied information supports them
- A short note identifying any important hiring details that the employer still needs to confirm

Accuracy and fairness requirements:
- Do not invent salary, benefits, employer identity, location, work arrangement, or employment conditions
- Do not add mandatory degrees, certifications, experience thresholds, or technical skills unless supplied
- Do not present assumptions as confirmed facts
- Use clear, inclusive, candidate-facing language
- Keep the draft suitable for HR and hiring-manager review before publication
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
    systemPrompt: 'Write professional, personalized cover-letter drafts using only the applicant information provided. Do not invent employment history, years of experience, degrees, certifications, achievements, metrics, relationships, or employer research. Keep unsupported details out of the draft.',
    buildPrompt: (inputs) => `
Write a cover letter for ${inputs.jobTitle} at ${inputs.company}

Relevant skills: ${inputs.skills}

Structure:
- Professional greeting
- Hook paragraph showing enthusiasm
- 2-3 paragraphs highlighting relevant experience
- Call to action
- Professional closing

Accuracy requirements:
- Use only skills, experience, and qualifications supplied by the applicant
- Do not invent job titles, employers, project outcomes, metrics, or credentials
- Do not claim knowledge of the company beyond its supplied name
- Express interest without asserting unverified company values or achievements
- Avoid unsupported statements about years of experience or career history
- Keep the draft ready for the applicant to personalize and fact-check
    `,
  },

  'proposal-writer': {
    id: 'proposal-writer',
    title: 'Proposal Writer',
    description: 'Draft business proposals from your project overview, deliverables, and timeline',
    category: 'business',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Project/Service Overview', required: true },
      { name: 'deliverables', type: 'textarea', label: 'What Will You Deliver?', required: true },
      { name: 'timeline', type: 'text', label: 'Timeline', placeholder: '3 months, Q2 2024, etc.', required: true },
    ],
    systemPrompt: 'Create clear, professional business-proposal drafts using only the project overview, deliverables, and timeline supplied by the user. Organize the information into useful client-facing sections without inventing client identities, company credentials, project experience, prices, budgets, payment terms, legal obligations, guarantees, measurable outcomes, or additional deliverables. Do not turn tentative milestones into confirmed contractual commitments. Clearly mark missing commercial details as items requiring confirmation. Keep the proposal suitable for review and negotiation before it is sent.',
    buildPrompt: (inputs) => `
Write a business proposal outline:

Project: ${inputs.topic}
Deliverables: ${inputs.deliverables}
Timeline: ${inputs.timeline}

Sections:
1. Executive Summary based on the supplied project overview
2. Project Context and Objectives
3. Proposed Approach
4. Confirmed Deliverables and Scope
5. Proposed Milestones and Supplied Timeline
6. Investment/Budget: [PRICING TO BE CONFIRMED]
7. Assumptions and Details Requiring Confirmation
8. Next Steps for Client Review

Accuracy requirements:
- Use only the supplied project, deliverables, and timeline as confirmed facts
- Do not invent prices, taxes, payment schedules, or contract terms
- Do not invent client names, testimonials, company experience, or credentials
- Do not promise results, completion dates, or service levels not supplied
- Do not add deliverables or exclusions as agreed contractual terms
- Identify proposed milestones as illustrative unless explicitly supplied
- Use clear placeholders for missing commercial information
- Keep wording professional, specific, and suitable for client review
- Return a structured proposal draft without explanatory commentary.
    `,
  },

  'contract-summary': {
    id: 'contract-summary',
    title: 'Contract Summarizer',
    description: 'Summarize legal contracts in plain language',
    category: 'business',
    fields: [
      { name: 'contractText', type: 'textarea', label: 'Contract Text', placeholder: 'Paste a contract excerpt (up to 3,000 characters). Remove confidential information before submitting.', required: true, validation: { minLength: 20, maxLength: 3000 } },
    ],
    systemPrompt: 'You summarize supplied contract text in plain language. You are not a lawyer and do not provide legal advice. Do not invent terms, assume missing clauses, or claim to have reviewed the entire agreement.',
    buildPrompt: (inputs) => `
Summarize this contract in plain language:

${inputs.contractText}

Include:
- Key terms and conditions
- Obligations of each party
- Payment terms
- Termination clauses
- Clauses requiring closer review without definitive legal judgments
- Plain English explanation
- Preserve dates, amounts, exceptions, and conditions when stated
- Do not invent missing terms or legal conclusions
- Explain when the supplied excerpt lacks context
- State that the summary is informational, not legal advice
    `,
  },

  // ============ ADDITIONAL GENERATION TOOLS ============

  'research-paper-writer': {
    id: 'research-paper-writer',
    title: 'Research Paper Writer',
    description: 'Create research paper outlines and academic drafting plans from a topic and study level',
    category: 'generate',
    fields: [
      { name: 'topic', type: 'textarea', label: 'Research Topic', required: true },
      { name: 'academicLevel', type: 'select', label: 'Academic Level', required: false, options: [
        { value: 'undergraduate', label: 'Undergraduate' },
        { value: 'graduate', label: 'Graduate' },
        { value: 'phd', label: 'PhD' },
      ]},
    ],
    systemPrompt: 'Assist with academic research planning by producing structured outlines and clearly labeled drafting suggestions based on the supplied topic and academic level. Do not invent scholarly sources, author names, citations, quotations, statistics, study participants, collected data, research results, or verified findings. Do not imply that literature has been reviewed or experiments have been performed. Distinguish possible hypotheses and methods from established evidence. Identify areas requiring independent research and source verification. Respect academic-integrity requirements and do not present the output as a completed or submission-ready research paper.',
    buildPrompt: (inputs) => `
Create research paper structure for: ${inputs.topic}

Level: ${inputs.academicLevel || 'academic'}

Create a research planning outline with:
1. Working title and focused research question
2. Provisional thesis or hypothesis, clearly labeled as tentative
3. Introduction outline and background topics to investigate
4. Literature review themes requiring verified scholarly sources
5. Possible research design and methodology options
6. Data collection and analysis considerations, if applicable
7. Potential limitations and ethical considerations
8. Findings section placeholder: [RESULTS NOT YET ESTABLISHED]
9. Discussion questions and conclusion structure
10. Next research steps and source-verification checklist

Requirements:
- Adapt the depth and terminology to the selected academic level
- Do not invent references, citations, DOIs, quotations, or source details
- Do not claim to have searched or reviewed academic literature
- Do not fabricate participant responses, datasets, statistics, or results
- Present methodological suggestions as options, not completed procedures
- Do not predict findings as if they were demonstrated
- Explain where actual research and evidence must be added
- Return a structured outline for further research, not a completed paper
    `,
  },

  'poem-generator': {
    id: 'poem-generator',
    title: 'Poem Generator',
    description: 'Generate poetry drafts in haiku, sonnet, free verse, acrostic, and limerick styles',
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
    systemPrompt: 'You are a creative poetry-writing assistant. Compose a fresh poetry draft based on the supplied theme and selected form. Use vivid but purposeful imagery, natural language, and a coherent emotional direction. Follow recognizable conventions of the selected poetic form where practical, without guaranteeing perfect meter, syllable counts, rhyme, or originality. Do not reproduce recognizable lines from existing poems or imitate a living poet too closely. Return the poem itself without explanatory commentary.',
    buildPrompt: (inputs) => `
Write a ${inputs.style || 'poem'} about: ${inputs.topic}

Poetry style guidance:
- Haiku: aim for three concise lines with a nature or moment-focused image; check syllable counts when relevant
- Sonnet: aim for fourteen lines with a coherent theme and a recognizable rhyme or rhythmic structure
- Free verse: use intentional line breaks, imagery, and rhythm without requiring a fixed rhyme scheme
- Acrostic: use the letters of a suitable word from the topic to begin successive lines
- Limerick: aim for five playful lines with an AABBA rhyme pattern and a lively rhythm

Requirements:
- Focus on the supplied theme and selected poetry style
- Use concrete sensory details rather than generic emotional statements
- Avoid repetitive filler and forced rhymes
- Keep the poem internally coherent
- Do not copy recognizable lines from existing poems
- Do not claim the output is guaranteed unique or publication-ready
- Output only the poem, preserving its line breaks
    `,
  },

  'song-lyric-generator': {
    id: 'song-lyric-generator',
    title: 'Song Lyric Generator',
    description: 'Create song lyric drafts with verses, choruses, bridges, and hooks',
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
    systemPrompt: 'You are a songwriting assistant creating fresh lyric drafts from the supplied story and genre. Write coherent verses, a memorable chorus, and a purposeful bridge using natural language, imagery, and an appropriate rhythm. Do not reproduce recognizable lyrics, song titles used as hooks, or distinctive passages from existing songs. Do not closely imitate a specific living artist or songwriter. Genre is general creative guidance, not a request to copy another performer. Generate text lyrics only; do not claim to create audio, a recorded melody, or music notation. Avoid guarantees of originality or copyright clearance.',
    buildPrompt: (inputs) => `
Write song lyrics (${inputs.genre || 'pop'}) about: ${inputs.topic}

Structure:
- Verse 1: establish the story, setting, or emotion
- Chorus: express the central idea with a memorable original hook
- Verse 2: develop the story or introduce a meaningful change
- Bridge: add a contrasting perspective or emotional turning point
- Final Chorus: return to the main hook with a satisfying resolution

Requirements:
- Follow the supplied topic or story and selected genre
- Use original wording and coherent imagery
- Keep a consistent point of view and emotional progression
- Make the chorus recognizable without excessive repetition
- Favor natural phrasing over forced rhymes
- Do not copy recognizable lines from existing songs
- Do not imitate a particular artist or copyrighted composition
- Output clearly labeled lyric sections only
- Do not claim to generate audio or an actual melody
- Treat the result as a draft requiring human originality review
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
    systemPrompt: 'Write original screenplay-style scene drafts based on the supplied genre and scene description. Use readable screenplay conventions, but do not claim the output meets every professional production or submission standard. Create original characters and dialogue; do not reproduce recognizable dialogue, scenes, or distinctive characters from existing films. Keep the scene coherent and consistent with the user-provided situation.',
    buildPrompt: (inputs) => `
Write a screenplay scene (${inputs.genre}):
${inputs.sceneDescription}

Include:
- A screenplay-style scene heading such as INT. OFFICE - NIGHT when appropriate
- Concise present-tense visual action that can be shown on screen
- Clearly identified characters and natural dialogue
- Parentheticals only when they clarify an important delivery or action
- A clear dramatic development or turning point within the scene
- Tone and pacing consistent with the selected genre
- Readable plain-text screenplay formatting

Requirements:
- Generate a scene draft, not an entire feature-length screenplay
- Use the supplied description as the basis for events and characters
- Do not copy existing movie dialogue, scenes, or distinctive characters
- Avoid unnecessary camera directions or excessive formatting instructions
- Output the screenplay scene itself without promotional commentary
    `,
  },

  // ============ ADDITIONAL SOCIAL MEDIA TOOLS ============

  'tiktok-caption-generator': {
    id: 'tiktok-caption-generator',
    title: 'TikTok Caption Generator',
    description: 'Draft TikTok video captions with relevant hooks, hashtags, and style options',
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
    systemPrompt: 'You are a TikTok caption-writing assistant. Create concise, engaging caption drafts based on the video details supplied by the user and the selected style. Use a relevant opening hook, natural wording, and a small number of appropriate hashtags. Include a simple call to action only when useful. Emojis are optional. Do not invent video scenes, demonstrations, products, results, statistics, partnerships, promotions, or personal experiences. Do not promise viral performance, views, followers, or engagement. Treat hashtags as suggestions rather than verified trends.',
    buildPrompt: (inputs) => `
Create a TikTok caption draft using this video description:

${inputs.videoTopic}

Selected style: ${inputs.stylePreference || 'trending'}

Style guidance:
- trending: energetic and attention-catching without claiming a verified trend or viral result
- educational: clear, helpful, and focused on what the video teaches
- humorous: light and playful without inventing scenes or jokes unrelated to the video
- inspirational: encouraging without exaggerated promises

Requirements:
- Write one ready-to-edit caption, not a description of a possible caption
- Start with a concise hook relevant to the supplied video
- Aim for a short caption of about 150 characters or fewer where practical
- Include two or three relevant suggested hashtags
- Add a simple call to action only when appropriate
- Use emojis sparingly and only when they fit the style
- Preserve the supplied video topic and any stated facts
- Do not invent products, results, events, testimonials, or video details
- Do not claim hashtags are currently trending without evidence
- Do not guarantee views, followers, reach, or viral performance
- Avoid unrelated explanations or promotional commentary
    `,
  },

  'facebook-post-generator': {
    id: 'facebook-post-generator',
    title: 'Facebook Post Generator',
    description: 'Create Facebook post drafts for your topic and target audience',
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
    systemPrompt: 'Create clear, audience-appropriate Facebook post drafts using only details supplied by the user. Do not invent business hours, discounts, events, prices, customer testimonials, achievements, URLs, or promotional claims. Avoid implying that information has been verified when it has not.',
    buildPrompt: (inputs) => `
Write Facebook post about: ${inputs.topic}

Audience: ${inputs.audience || 'general'}

Make it:
- Conversational, natural, and suitable for Facebook
- Use an appropriate opening and a relevant closing question or call to action when useful
- Include only a few relevant hashtags when appropriate
- Aim for a concise post; 100-250 words may suit detailed updates, but shorter posts are acceptable
- Do not invent opening hours, dates, prices, discounts, events, testimonials, or links
- If essential announcement details are missing, use neutral wording or an obvious placeholder rather than inventing them

Audience guidance:
- general: use accessible language for a broad public audience
- customers: focus on useful customer information without unsupported sales claims
- community: use an inclusive, welcoming tone appropriate for community updates
- family: use a warm, informal tone without inventing personal experiences or relationships

Accuracy:
- Preserve the user's supplied details
- Do not imply that a business announcement, promotion, or event has been independently verified
- Avoid exaggerated engagement promises or misleading claims
    `,
  },

  'youtube-description-generator': {
    id: 'youtube-description-generator',
    title: 'YouTube Description Generator',
    description: 'Create YouTube description drafts from your video title and content details',
    category: 'social',
    fields: [
      { name: 'videoTitle', type: 'text', label: 'Video Title', required: true },
      { name: 'videoContent', type: 'textarea', label: 'What\'s In Your Video?', required: true },
      { name: 'keywords', type: 'textarea', label: 'Keywords/Tags', placeholder: 'e.g., tutorial, cooking, vegan', required: false },
    ],
    systemPrompt: 'Write clear, useful YouTube video description drafts based on the supplied information. Do not invent timestamps, links, sources, results, or claims. Do not promise search rankings, views, or engagement.',
    buildPrompt: (inputs) => `
YouTube description for: ${inputs.videoTitle}

Content: ${inputs.videoContent}
Keywords: ${inputs.keywords}

Write a YouTube description draft that:
- Opens with a concise, accurate introduction to the video
- Summarizes the supplied video content clearly
- Uses supplied keywords naturally when relevant
- Suggests relevant hashtags without keyword stuffing
- Includes a brief, optional subscribe call to action
- Includes timestamps only if actual chapter times are supplied
- Includes links or external resources only if the user supplied them
- Does not invent facts, references, links, timestamps, or promises about video performance
- Returns description copy that the user can review and edit before publishing
    `,
  },

  'youtube-title-generator': {
    id: 'youtube-title-generator',
    title: 'YouTube Title Generator',
    description: 'Generate YouTube video title ideas from your topic and target audience',
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
    systemPrompt: 'Generate clear, relevant YouTube video title ideas based on the supplied topic and audience. Keep titles accurate and avoid misleading claims, fabricated details, exaggerated promises, or unsupported urgency. Do not promise views, clicks, or rankings.',
    buildPrompt: (inputs) => `
Generate 10 YouTube video titles for: ${inputs.topic}

Audience: ${inputs.audience}

Make titles:
- Aim for concise wording, preferably around 50-60 characters or fewer when practical
- Accurately reflect the supplied video topic
- Use relevant keywords naturally when they fit
- Offer varied approaches such as informative, question-based, and benefit-focused titles
- Make the main topic or viewer benefit clear
- Use curiosity only when it is supported by the actual video content
- Avoid fabricated claims, clickbait, misleading urgency, and exaggerated promises
- Return 10 distinct title ideas that the user can review and edit before publishing
    `,
  },

  // ============ ADDITIONAL REWRITE TOOLS ============

  'article-rewriter': {
    id: 'article-rewriter',
    title: 'Article Rewriter',
    description: 'Rewrite articles for different angles/tones',
    category: 'rewrite',
    fields: [
      { name: 'articleText', type: 'textarea', label: 'Original Article', required: true, validation: { minLength: 50, maxLength: 3000 } },
      { name: 'angle', type: 'select', label: 'New Angle', required: false, options: [
        { value: 'simplified', label: 'Simplified Version' },
        { value: 'expanded', label: 'Expanded Version' },
        { value: 'executive', label: 'Executive Summary' },
        { value: 'beginner', label: 'Beginner-Friendly' },
      ]},
    ],
    systemPrompt: 'You are a careful article editor. Rewrite the supplied article according to the selected mode while preserving its central message, factual accuracy, names, dates, figures, quotations, source references, and important qualifications. Do not invent facts, statistics, studies, citations, URLs, quotations, or claims. Do not present outdated information as newly verified. Preserve attribution and distinguish source-supported information from explanation. Return only the rewritten article.',
    buildPrompt: (inputs) => `
Rewrite the following article using the selected mode.

Mode: ${inputs.angle || 'simplified'}

Original article:
${inputs.articleText}

Mode-specific instructions:
- simplified: Use clearer, more concise language while retaining essential information.
- expanded: Explain existing points more clearly using only supported information; do not invent examples, research, or new facts.
- executive: Produce a concise executive summary emphasizing the article's key points and conclusions.
- beginner: Explain technical terms in accessible language without changing factual meaning.

Requirements:
- Preserve the article's central subject, intent, and important facts
- Preserve names, dates, numbers, quotations, citations, and source references
- Retain important conditions, limitations, and uncertainty
- Improve structure, readability, and transitions where appropriate
- Do not invent statistics, research findings, quotes, URLs, or citations
- Do not add unsupported claims or present assumptions as verified facts
- Do not imply the rewritten article has been independently fact-checked
- Preserve necessary attribution; rewriting does not remove citation obligations
- Keep the result focused on the supplied material

Return only the rewritten article.
    `,
  },

  'blog-post-rewriter': {
    id: 'blog-post-rewriter',
    title: 'Blog Post Rewriter',
    description: 'Refresh and optimize blog posts',
    category: 'rewrite',
    fields: [
      { name: 'blogText', type: 'textarea', label: 'Blog Post', required: true, validation: { minLength: 50, maxLength: 3000 } },
      { name: 'updateType', type: 'select', label: 'Update Type', required: false, options: [
        { value: 'seo', label: 'SEO Optimization' },
        { value: 'engagement', label: 'Higher Engagement' },
        { value: 'readability', label: 'Better Readability' },
        { value: 'modern', label: 'Modern Update' },
      ]},
    ],
    systemPrompt: 'You are a careful blog editor. Rewrite the supplied blog post to improve clarity, structure, and reader usefulness while preserving its core meaning, facts, names, dates, figures, quotations, citations, links, and important qualifications. Do not invent statistics, studies, testimonials, examples presented as real, URLs, or source references. Do not claim that old information has been verified or updated without evidence. Avoid keyword stuffing, misleading headlines, and exaggerated promises. Return only the revised blog post.',
    buildPrompt: (inputs) => `
Rewrite the following blog post using the selected improvement mode.

Mode: ${inputs.updateType || 'readability'}

Original blog post:
${inputs.blogText}

Mode-specific instructions:
- seo: Improve descriptive headings, search intent alignment, and natural use of existing relevant keywords without keyword stuffing.
- engagement: Strengthen the opening, improve transitions, and make the content more useful and engaging without exaggeration.
- readability: Simplify awkward sentences, remove repetition, and improve paragraph structure.
- modern: Refresh dated or overly formal wording and organization without inventing recent developments or claiming facts are current.

Requirements:
- Preserve the original topic, intent, and factual meaning
- Preserve names, dates, numbers, quotations, existing links, and citations
- Keep important conditions, limitations, and uncertainty intact
- Improve headings and flow when helpful
- Use a call to action only when appropriate to the source material
- Do not invent modern examples, research, statistics, references, or URLs
- Do not imply that external facts or links have been independently verified
- Preserve necessary source attribution
- Avoid filler, keyword stuffing, and unsupported SEO guarantees
- Return only the revised blog post
    `,
  },

  'tone-of-voice': {
    id: 'tone-of-voice',
    title: 'Tone of Voice Converter',
    description: 'Rewrite text in professional, casual, humorous, persuasive, or empathetic tones while preserving its meaning',
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
    systemPrompt: 'You are a writing-tone editor. Rewrite the supplied text in the selected tone while preserving its original facts, intent, commitments, dates, names, figures, and important qualifications. Improve wording and sentence flow without inventing information or changing what the writer is communicating. For persuasive writing, do not introduce unsupported claims or pressure tactics. For humorous writing, avoid jokes that distort important information. For empathetic writing, be considerate without making assumptions about feelings or circumstances. Return a usable rewritten version rather than commentary about how to rewrite it.',
    buildPrompt: (inputs) => `
Rewrite the following text using the selected communication tone.

Original text:
${inputs.inputText}

Selected tone: ${inputs.targetTone}

Tone guidance:
- professional: clear, respectful, and suitable for workplace communication
- casual: natural, conversational, and approachable
- humorous: light and playful where appropriate, without distorting facts
- persuasive: convincing through clear reasoning, without inventing benefits or applying misleading pressure
- empathetic: considerate and supportive without assuming unmentioned circumstances

Requirements:
- Preserve the original meaning, facts, names, dates, numbers, and commitments
- Change wording and sentence structure only as needed for the selected tone
- Keep the message suitable for its apparent audience and purpose
- Do not invent details, promises, results, testimonials, or emotional reactions
- Do not omit important conditions, limitations, or requests
- Avoid unnecessary exaggeration or promotional language
- Keep a similar level of detail unless a small adjustment improves clarity
- Return the rewritten text directly, without an introduction or explanation

Rewritten text:
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
    systemPrompt: 'You are a careful writing editor. Rewrite the supplied text to sound natural, clear, and appropriate for its audience. Preserve the original meaning, factual claims, names, dates, numbers, technical details, qualifications, and uncertainty. Do not invent facts, personal experiences, citations, statistics, or promises. Do not claim that the result will bypass AI detectors. Return only the rewritten text.',
    buildPrompt: (inputs) => `
Rewrite the following text so it reads more naturally:

${inputs.aiText}

Requirements:
- Replace repetitive, stiff, or unnecessarily formal wording
- Improve sentence rhythm, transitions, and readability
- Use natural language without adding artificial personality or filler
- Preserve the original meaning, intent, and important details
- Preserve names, dates, numbers, technical terms, and factual claims
- Keep qualifications, conditions, and uncertainty intact
- Do not invent examples, experiences, statistics, citations, or promises
- Do not exaggerate claims or introduce unsupported information
- Do not optimize for or promise any AI-detection outcome
- Return only the rewritten text without commentary
    `,
  },

  'explain-it': {
    id: 'explain-it',
    title: 'Explain It Simply',
    description: 'Explain complex topics in simpler language for different age groups',
    category: 'rewrite',
    fields: [
      { name: 'complexText', type: 'textarea', label: 'Complex Topic', required: true },
      { name: 'audienceLevel', type: 'select', label: 'Explain For', required: false, options: [
        { value: 'child', label: 'Child (5-10 years)' },
        { value: 'teen', label: 'Teen (13-18 years)' },
        { value: 'adult', label: 'General Adult' },
      ]},
    ],
    systemPrompt: 'Explain complex topics in clear, accessible language suited to the selected audience. Preserve important distinctions and avoid introducing unsupported facts. Do not invent sources, statistics, or research findings. Explain uncertainty when relevant, and do not replace professional advice for specialized or high-stakes topics.',
    buildPrompt: (inputs) => `
Explain this complex topic simply for ${inputs.audienceLevel || 'general audience'}:

${inputs.complexText}

Use:
- Simple words
- Real-world examples
- Analogies
- Step-by-step explanation
- Avoid jargon

Audience guidance:
- child: use short sentences, familiar vocabulary, and concrete everyday examples appropriate for ages 5-10
- teen: use accessible language appropriate for ages 13-18, introducing essential terminology with brief definitions
- adult: use plain but accurate language, preserving relevant technical distinctions

Accuracy requirements:
- Preserve the central meaning of any supplied explanation
- Do not invent sources, quotations, statistics, or factual claims
- Avoid misleading analogies and oversimplification
- Explain limitations or uncertainty when they matter
- For medical, legal, financial, or safety-related topics, provide general educational explanations rather than personalized professional advice
    `,
  },

  // ============ PHASE 6: UTILITIES ============

  'keyword-generator': {
    id: 'keyword-generator',
    title: 'Keyword Generator',
    description: 'Brainstorm SEO keyword ideas, long-tail phrases, and topic clusters by search intent',
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
    systemPrompt: 'Generate relevant SEO keyword ideas and preliminary topic clusters from the supplied topic and search intent. Treat all suggestions as brainstorming ideas, not verified search-engine data. Do not invent search volume, CPC, keyword difficulty, competition scores, traffic forecasts, or guaranteed ranking outcomes. Avoid claiming that keywords were checked against live search data.',
    buildPrompt: (inputs) => `
Generate keywords for: ${inputs.topic}

Search Intent: ${inputs.intent || 'all'}

Provide:
- Primary keyword ideas closely related to the supplied topic
- Specific long-tail keyword phrases
- Related topic clusters grouped by theme
- Suggested informational or commercial angles consistent with the selected search intent
- A short note explaining that these are unverified ideas for further research

Accuracy requirements:
- Respect the selected search intent when proposing phrases
- Do not invent numerical search volume, CPC, difficulty, or competition metrics
- Do not imply access to live keyword databases or search analytics
- Do not promise rankings, traffic, conversions, or SEO results
- Recommend validating relevance and demand using current search and analytics data
    `,
  },

  'outline-generator': {
    id: 'outline-generator',
    title: 'Content Outline Generator',
    description: 'Create structured outlines for articles, guides, tutorials, and reports',
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
    systemPrompt: 'Create practical, clearly structured content outlines based on the supplied topic and selected content type. Organize ideas logically with meaningful headings, useful subsections, and concise notes for each section. Adapt the structure to articles, guides, tutorials, or reports. Do not invent research findings, statistics, citations, sources, or verified facts. Produce an outline rather than a fully written article.',
    buildPrompt: (inputs) => `
Create an outline for ${inputs.contentType || 'content'} about: ${inputs.topic}

Include:
- A clear working title relevant to the topic
- Numbered main sections arranged in a logical order
- Useful subsections where they improve organization
- Two or three concise key points for substantial sections
- Suggested depth or focus for each major section

Content type guidance:
- Article: introduction, main arguments or explanations, and conclusion
- Guide: preparation, practical steps or sections, examples, and next steps
- Tutorial: prerequisites, sequential instructions, checks, and troubleshooting
- Report: purpose, scope, findings to investigate, analysis, and conclusion

Requirements:
- Output an actionable outline, not a complete article
- Avoid repetitive or generic headings that add no value
- Keep the structure proportionate to the topic
- Do not fabricate research results, statistics, citations, or references
- Clearly frame facts requiring verification as research points
- Use concise headings and notes that the user can edit
    `,
  },

  'question-generator': {
    id: 'question-generator',
    title: 'Question Generator',
    description: 'Generate topic-based questions for research, reflection, discussions, and brainstorming',
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
    systemPrompt: 'Generate clear, varied, relevant questions based on the topic and purpose supplied by the user. Adapt the questions for audience engagement, self-reflection, research, or brainstorming. Prefer neutral, open-ended wording where appropriate. Avoid leading questions, unsupported factual assumptions, unnecessary jargon, repetitive phrasing, and invented evidence. Research questions should be exploratory starting points rather than claims of scientific validity. Return a useful numbered list without fabricated answers or citations.',
    buildPrompt: (inputs) => `
Generate 15 questions about: ${inputs.topic}

Purpose: ${inputs.purpose || 'engagement'}

Requirements:
- Return 15 distinct, numbered questions
- Keep each question clear, concise, and relevant to the topic
- Adapt the wording to the selected purpose
- Use open-ended questions where they support meaningful discussion
- Include different angles rather than repeating the same idea
- Move from introductory questions toward more detailed exploration
- Avoid leading, loaded, biased, or double-barreled questions
- Do not presume unverified facts, outcomes, or participant experiences
- For research, offer exploratory questions that require further methodological review
- For reflection, use respectful prompts without assuming personal circumstances
- For brainstorming, encourage multiple possible approaches
- Do not invent answers, research findings, or supporting citations
- Output only the numbered questions
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
    systemPrompt: 'You are a practical and creative brainstorming facilitator. Generate varied, specific, actionable ideas relevant to the supplied topic and selected style. Distinguish genuinely different approaches rather than repeating similar suggestions. Treat feasibility, effort, and impact ratings as preliminary qualitative estimates, not validated predictions. Do not invent market research, user feedback, statistics, technical capabilities, or evidence. Present ideas for evaluation rather than guaranteed outcomes.',
    buildPrompt: (inputs) => `
Brainstorm ideas for the following topic:

${inputs.topic}

Selected style: ${inputs.style || 'balanced'}

Style guidance:
- innovative: explore original but reasonably plausible approaches
- practical: prioritize straightforward, implementable approaches
- wild: explore unconventional possibilities and identify major assumptions
- balanced: combine practical, innovative, and unconventional directions

Requirements:
- Generate at least 20 distinct, numbered ideas
- Give each idea a descriptive title and brief explanation
- Explain the potential benefit or problem it addresses
- Include an estimated effort level (Low, Medium, or High)
- Include an estimated potential impact (Low, Medium, or High)
- Treat ratings as initial judgments dependent on context
- Avoid duplicate ideas, vague suggestions, and filler
- Do not invent research findings, statistics, or evidence
- Do not claim an idea is guaranteed to succeed
- Keep suggestions relevant to the topic and selected style
- Finish with three practical criteria for shortlisting ideas
    `,
  },

  'text-expander': {
    id: 'text-expander',
    title: 'Text Expander',
    description: 'Expand short text or notes into a longer, structured draft while preserving the original meaning',
    category: 'utility',
    fields: [
      { name: 'shortText', type: 'textarea', label: 'Short Text/Notes', required: true },
      { name: 'targetLength', type: 'select', label: 'Expand To', required: false, options: [
        { value: 'medium', label: 'Medium (250 words)' },
        { value: 'long', label: 'Long (500 words)' },
        { value: 'article', label: 'Article (1000+ words)' },
      ]},
    ],
    systemPrompt: 'You are a careful text-expansion assistant. Turn short notes or passages into clearer, more developed prose while preserving the original meaning, intent, and factual boundaries. Keep all supplied names, numbers, dates, qualifications, and stated conclusions accurate. Add explanation, transitions, and useful structure, but do not invent statistics, quotations, research findings, events, commitments, or supporting evidence. If an example is helpful but not supplied, label it as illustrative rather than factual. Do not turn tentative statements into confirmed claims. When information is missing, use cautious wording instead of presenting assumptions as facts.',
    buildPrompt: (inputs) => `
Expand the following text or notes into a readable draft:

${inputs.shortText}

Selected target: ${inputs.targetLength || 'medium'}
Approximate word-count guidance:
- medium: about 250 words
- long: about 500 words
- article: 1000 words or more
Aim for the selected length where the source supports meaningful expansion and response limits permit. Do not add filler or fabricate information merely to reach a target.

Requirements:
- Preserve the original meaning, purpose, and level of certainty
- Retain all supplied names, dates, numbers, and important qualifications
- Organize related points into coherent paragraphs
- Add useful transitions and explain relationships between existing ideas
- Develop practical implications only when they follow from the source
- Use illustrative examples only when clearly identified as examples
- Do not invent evidence, statistics, citations, quotations, or project outcomes
- Do not introduce unsupported promises, deadlines, or decisions
- If the source is ambiguous, avoid asserting an unsupported interpretation
- Return the expanded text itself, not a commentary about the expansion
    `,
  },

  // ============ ADDITIONAL GENERATION TOOLS ============

  'fiction-writer': {
    id: 'fiction-writer',
    title: 'Fiction Writer',
    description: 'Create short fiction drafts from a story premise and selected genre',
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
    systemPrompt: 'Write a coherent short fiction draft based on the supplied premise and genre. Develop consistent characters, a clear central conflict, meaningful plot progression, and an ending suited to the story. Keep the fictional setting and character details internally consistent. Create fresh wording rather than imitating identifiable passages from existing works.',
    buildPrompt: (inputs) => `
Write a ${inputs.genre || 'fiction'} story based on this premise:

${inputs.premise}

Include:
- A compelling opening grounded in the supplied premise
- Characters with consistent motivations and actions
- Clear plot progression with a central conflict
- Tension and developments appropriate to the selected genre
- A coherent ending that resolves or meaningfully develops the main conflict
- Consistent names, setting details, and point of view
- Original phrasing rather than imitation of existing fictional passages
- A focused short-story draft that fits the available output length
    `,
  },

  'content-paraphraser': {
    id: 'content-paraphraser',
    title: 'Content Paraphraser',
    description: 'Rephrase content with different word choices',
    category: 'rewrite',
    fields: [
      { name: 'textToParaphrase', type: 'textarea', label: 'Text to Rephrase', required: true, validation: { minLength: 3, maxLength: 3000 } },
    ],
    systemPrompt: 'You are a careful paraphrasing editor. Express the supplied text using clearer alternative wording and sentence structure while preserving its original meaning, intent, facts, names, dates, numbers, quotations, technical terms, and important qualifications. Do not invent facts, examples, citations, sources, or claims. Do not alter the strength or certainty of statements. Return only the paraphrased text.',
    buildPrompt: (inputs) => `
Paraphrase the following text using natural alternative wording:

${inputs.textToParaphrase}

Requirements:
- Preserve the original meaning, intent, and factual information
- Preserve names, dates, numbers, technical terms, and key details
- Keep quotations and necessary attribution accurate
- Preserve conditions, limitations, and uncertainty
- Improve clarity and sentence flow where appropriate
- Avoid mechanical word substitution or unnecessary changes
- Do not invent facts, examples, statistics, citations, or claims
- Do not turn cautious statements into definite conclusions
- Do not add commentary or explanations outside the paraphrase
- Return only the paraphrased text
    `,
  },

  'ai-detector': {
    id: 'ai-detector',
    title: 'AI Content Detector',
    description: 'Rule-based writing-pattern analysis using text statistics and selected linguistic indicators. Results cannot establish AI authorship.',
    category: 'utility',
    fields: [
      {
        name: 'inputText',
        type: 'textarea',
        label: 'Text to Analyze',
        placeholder: 'Paste the text you want to analyze for AI-generated content...',
        required: true,
        validation: { minLength: 50, maxLength: 10000 },
      },
    ],
    systemPrompt: 'You are a cautious writing-pattern analyst. Explain observable statistical and linguistic characteristics of supplied text. These patterns cannot reliably establish whether a human or AI authored the text. Avoid definitive authorship claims, unsupported probabilities, and claims of forensic certainty. Clearly describe limitations and possible false positives and false negatives.',
    buildPrompt: (inputs) => `
This tool examines writing patterns but cannot reliably determine whether text was written by a human or AI.
Consider vocabulary variation, sentence structure consistency,
phrase repetition, and other observable linguistic patterns.

TEXT TO ANALYZE:
${inputs.inputText}

Return a structured assessment of observable patterns, their limitations, and why authorship cannot be determined from this analysis alone.
    `,
    outputFormat: 'json',
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

