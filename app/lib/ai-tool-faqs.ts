export interface AiToolFaq {
  q: string;
  a: string;
}

const defaultAiToolFaqs: AiToolFaq[] = [
  {
    q: 'Is the content 100% original?',
    a: 'AI tools generate variations of existing content patterns. Always review and customize the output. Original thought and editing are essential to create unique content.',
  },
  {
    q: 'Can I use the output directly without editing?',
    a: 'We recommend reviewing and editing all AI-generated content. Add your own perspective, verify facts, and customize to your voice and brand.',
  },
  {
    q: 'Does AI detection flag this content?',
    a: 'Content created with our tools may be detected by AI detection services. Mix human and AI writing, add original insights, and edit heavily to reduce detectability.',
  },
  {
    q: 'Is my content private?',
    a: 'Content processed on our platform is handled securely. Always follow your organization\'s policies regarding sensitive data and AI tool usage.',
  },
  {
    q: 'Can I use this for commercial purposes?',
    a: 'Yes, but review our terms of service. Content must not violate copyright or contain harmful material.',
  },
  {
    q: 'How do I get the best results?',
    a: 'Provide detailed context, specific requirements, and clear examples. Better inputs lead to more useful AI suggestions that require less editing.',
  },
];

const toolSpecificAiFaqs: Record<string, AiToolFaq[]> = {
  'paragraph-writer': [
    { q: 'What should I enter in the Paragraph Writer?', a: 'Enter a clear topic, title, or short instruction. Adding tone, length, and language preferences helps the tool produce a more useful paragraph.' },
    { q: 'Can I use the paragraph in an essay or article?', a: 'Yes, but review it first. Add your own facts, examples, citations, and voice before publishing or submitting the content.' },
    { q: 'How do I get a stronger paragraph?', a: 'Give the tool a specific angle, audience, and purpose instead of a broad keyword. Specific prompts usually produce clearer writing.' },
  ],
  'content-improver': [
    { q: 'Will the Content Improver change my meaning?', a: 'It is intended to preserve the original meaning, but you should review the output to make sure important nuance is still correct.' },
    { q: 'What kind of content can I improve?', a: 'You can improve emails, articles, product copy, reports, notes, social posts, and most other text-based drafts.' },
    { q: 'Should I choose a tone?', a: 'Choosing a tone helps align the rewrite with your audience, especially for business, academic, formal, or casual writing.' },
  ],
  'content-summarizer': [
    { q: 'How long can the input be?', a: 'The tool is designed for long text, but very large documents should be summarized in sections for better accuracy.' },
    { q: 'Can it create bullet-point summaries?', a: 'Yes. Choose the bullet option when you want scan-friendly key points instead of paragraph-style summaries.' },
    { q: 'Does the summarizer add new information?', a: 'It should summarize the source text only. Always check the output against the original when accuracy matters.' },
  ],
  'grammar-fixer': [
    { q: 'Does the Grammar Fixer rewrite my whole text?', a: 'It focuses on correcting errors and improving clarity, but it may lightly rewrite awkward phrasing when needed.' },
    { q: 'Can it fix punctuation?', a: 'Yes. It can help with commas, periods, capitalization, apostrophes, and other common punctuation issues.' },
    { q: 'Should I still proofread the result?', a: 'Yes. Grammar tools can miss context-specific meaning, names, technical terms, or preferred style choices.' },
  ],
  translate: [
    { q: 'Is machine translation always accurate?', a: 'No. Translation quality depends on context, language pair, and subject matter. Review important translations before use.' },
    { q: 'Can I translate marketing copy?', a: 'Yes, but localized marketing copy should be reviewed for tone, idioms, and cultural fit.' },
    { q: 'Should I include context?', a: 'Yes. Adding audience, region, and purpose helps produce a more appropriate translation.' },
  ],
  'blog-post-generator': [
    { q: 'Can the Blog Post Generator create a complete article?', a: 'Yes, it can create a full first draft, but you should fact-check, edit, and add original examples before publishing.' },
    { q: 'Should I provide keywords?', a: 'Providing keywords helps the draft align with search intent, but avoid forcing too many keywords into the final copy.' },
    { q: 'Is the output SEO-ready?', a: 'It can provide an SEO-friendly draft, but final optimization should include internal links, source review, formatting, and expert edits.' },
  ],
  'faq-generator': [
    { q: 'How many FAQs should I generate?', a: 'Start with five to eight strong questions. Add more only when they answer real user concerns.' },
    { q: 'Can I use these FAQs for SEO?', a: 'Yes, but the answers should be accurate, visible on the page, and genuinely helpful to readers.' },
    { q: 'What makes a good FAQ prompt?', a: 'Include the product, audience, use case, and concerns you want to address.' },
  ],
  'word-counter': [
    { q: 'What can I count with this tool?', a: 'You can count words and characters in drafts, descriptions, essays, captions, emails, and other text.' },
    { q: 'Why does word count matter?', a: 'Word count helps meet platform limits, assignment requirements, SEO guidelines, and editorial briefs.' },
    { q: 'Can it improve my text too?', a: 'Use the related Content Improver or Grammar Fixer when you want editing help after counting your text.' },
  ],
  'sentence-rewriter': [
    { q: 'When should I use the Sentence Rewriter?', a: 'Use it when one sentence feels unclear, wordy, repetitive, or mismatched with the tone of the surrounding text.' },
    { q: 'Will it change the meaning?', a: 'It aims to preserve meaning, but review the result if the sentence includes technical, legal, or sensitive details.' },
    { q: 'Can I rewrite multiple sentences?', a: 'You can, but for full paragraphs or longer passages the Paragraph Rewriter or Content Improver is a better fit.' },
  ],
  'paragraph-rewriter': [
    { q: 'How is this different from Sentence Rewriter?', a: 'Paragraph Rewriter improves the flow of several connected sentences, while Sentence Rewriter focuses on one sentence at a time.' },
    { q: 'Can it make copied text unique?', a: 'It can rephrase text, but you should not use it to hide plagiarism. Add original ideas, citations, and your own perspective.' },
    { q: 'What input works best?', a: 'Use a complete paragraph with a clear main idea. Very short fragments may work better in the Sentence Rewriter.' },
  ],
};

export function getAiToolFaqs(toolId: string): AiToolFaq[] {
  return toolSpecificAiFaqs[toolId] || defaultAiToolFaqs;
}
