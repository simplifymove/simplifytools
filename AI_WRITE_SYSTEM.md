# AI Write System - Implementation Guide

## Overview

The AI Write system is a scalable, registry-based architecture for building 50+ AI-powered writing tools without creating 50 separate implementations. All tools share:

- 1 unified API endpoint
- 1 tool registry configuration
- 1 LLM service layer
- 1 dynamic frontend page

## Architecture

### Files Created

```
app/
├── lib/
│   ├── ai-tools.ts          # Tool registry & configuration
│   └── ai-client.ts         # LLM service wrapper
├── api/
│   └── ai-write/
│       └── route.ts         # Single API endpoint for all tools
└── tools/
    └── ai-write/
        ├── page.tsx         # Tool catalog/browser
        └── [slug]/
            └── page.tsx     # Dynamic tool page
```

## Current Tools (Phase 1-2)

### Phase 1: Core Tools
- **Paragraph Writer** - Generate high-quality paragraphs
- **Content Improver** - Enhance content quality
- **Grammar Fixer** - Fix grammar and punctuation
- **Content Summarizer** - Create concise summaries
- **Translate** - Translate to 8+ languages
- **Blog Post Generator** - Generate SEO-friendly blog posts
- **FAQ Generator** - Create FAQ sections
- **Word Counter** - Analyze text metrics

### Phase 2: Rewrite/Improve Family
- Sentence Rewriter
- Paragraph Rewriter
- Title Rewriter
- Content Paraphraser
- AI Rephraser
- Article Rewriter
- Blog Post Rewriter
- Tone of Voice
- AI Humanizer
- Explain It

### Phase 3+
Additional 30+ tools covering:
- Generation (essays, stories, articles)
- Social media (Instagram, Twitter, LinkedIn, TikTok)
- Business/Legal (contracts, emails, business plans)
- File processing (PDF, YouTube summarization)

## How to Use

### For Users

1. Navigate to **AI Write** from homepage
2. Browse tools organized by category
3. Click any tool to open it
4. Fill in the form fields
5. Click "Generate"
6. Copy, download, or regenerate results

### For Developers

## Adding a New Tool

Edit `/app/lib/ai-tools.ts`:

```typescript
'my-new-tool': {
  id: 'my-new-tool',
  title: 'My New Tool',
  description: 'What it does',
  category: 'generate', // or 'rewrite', 'summarize', 'business', 'social', 'utility'
  fields: [
    fields.topic(),
    fields.tone(),
    // Add field definitions here
  ],
  systemPrompt: 'You are an expert at...',
  buildPrompt: (inputs) => `
    Your prompt template here:
    Topic: ${inputs.topic}
    Tone: ${inputs.tone}
  `,
}
```

That's it! The system automatically:
- Renders the tool at `/tools/ai-write/my-new-tool`
- Validates inputs
- Builds prompts
- Handles API calls
- Shows results

## Configuration

### Environment Variables

```bash
# Required for real AI generation
OPENAI_API_KEY=sk-...
```

Without it, tools run in **mock mode** (returns placeholder responses) for testing.

### API Response Format

```json
{
  "ok": true,
  "tool": "paragraph-writer",
  "result": "Generated content here...",
  "meta": {
    "tokensUsed": 125,
    "model": "gpt-3.5-turbo",
    "usingMock": false
  }
}
```

## Tool Registry Structure

Each tool defines:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier (used in URL) |
| `title` | string | Display name |
| `description` | string | Brief tool description |
| `category` | string | Group (generate, rewrite, summarize, business, social, utility) |
| `fields` | ToolField[] | Input form fields |
| `systemPrompt` | string | LLM system message |
| `buildPrompt` | function | Creates user prompt from inputs |
| `outputFormat` | string | 'text' (default), 'json', or 'markdown' |

## Tool Categories

- **Generate**: Create new content (essays, articles, scripts)
- **Rewrite**: Transform existing text (improve, rephrase, rewrite)
- **Summarize**: Extract key points (summaries, briefs, extraction)
- **Business**: Professional tools (emails, contracts, plans)
- **Social**: Social media content (captions, posts, scripts)
- **Utility**: Helpers (word count, AI detection, translation)

## Field Types

Available field definitions in `/app/lib/ai-tools.ts`:

```typescript
fields.topic()          // Textarea for topic/subject
fields.inputText()      // Textarea for content to process
fields.tone()           // Dropdown: tone selection
fields.language()       // Dropdown: language selection
fields.length()         // Dropdown: output length
fields.keywords()       // Textarea for keywords
fields.audience()       // Dropdown: target audience
```

Custom field example:

```typescript
{
  name: 'customField',
  type: 'select', // or 'text', 'textarea', 'number'
  label: 'Field Label',
  required: true,
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
  ],
  validation: {
    minLength: 3,
    maxLength: 500,
  }
}
```

## Frontend Page Flow

The dynamic page at `/tools/ai-write/[slug]`:

1. **Loads tool config** by slug
2. **Renders form fields** from tool definition
3. **Submits** to `/api/ai-write` endpoint
4. **Displays result** with copy/download options
5. **Shows loading/error states**

## API Endpoint

**POST** `/api/ai-write`

Request:
```json
{
  "tool": "paragraph-writer",
  "inputs": {
    "topic": "The future of AI",
    "tone": "professional",
    "length": "medium"
  }
}
```

Response:
```json
{
  "ok": true,
  "tool": "paragraph-writer",
  "result": "Generated paragraph...",
  "meta": {
    "tokensUsed": 145,
    "model": "gpt-3.5-turbo"
  }
}
```

## Extending to All 50 Tools

The system is designed to scale. To add all tools quickly:

1. Define each tool in the registry following the same pattern
2. No frontend changes needed
3. No API changes needed
4. Tools automatically appear in the catalog

Example: To add tools for all 50, simply add more entries to `aiWriteTools` object.

## Statistics

- **Total Potential Tools**: 50+
- **Tool Categories**: 6
- **Shared API Endpoint**: 1
- **Separate Pages Required**: 2 (catalog + dynamic)
- **Configuration Lines per Tool**: ~15-20
- **Backend Routes per Tool**: 0 (all use 1 route)

## Performance Notes

- Tools use mock responses if `OPENAI_API_KEY` is not set
- Actual API calls cost money (OpenAI pricing)
- Use mock mode for testing/demo
- Each API call ~0.5-2 cents typically

## Future Enhancements

- [ ] Add support for Anthropic Claude API
- [ ] Add Cohere API support
- [ ] Implement rate limiting
- [ ] Add usage statistics/dashboard
- [ ] Batch API calls for efficiency
- [ ] Cache results for common queries
- [ ] Add user history/favorites
- [ ] Professional plan tier
- [ ] Custom prompt templates per user
- [ ] Integration with Zapier/Make

## Troubleshooting

**"Tool not found"**
- Check tool ID in URL matches registry key
- Verify spelling in `/app/lib/ai-tools.ts`

**"API key not configured"**
- Set `OPENAI_API_KEY` environment variable
- Mock mode will be used if not set

**Form not validating**
- Check field `validation` object in tool definition
- Ensure `required` flag is set correctly

**Result showing mock response**
- Add/check `OPENAI_API_KEY` in `.env.local` or environment
- Restart development server after setting

## Next Steps

1. **Set up OpenAI API key** to enable real generation
2. **Test each Phase 1 tool** to verify functionality
3. **Add Phase 2-6 tools** following the same pattern
4. **Customize prompts** for your specific use case
5. **Deploy** when ready

## Questions?

Refer to the tool registry structure in `/app/lib/ai-tools.ts` - each tool includes comments explaining how to modify it.
