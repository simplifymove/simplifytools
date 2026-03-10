/**
 * AI Client Service
 * 
 * Uses Groq API - Free, fast, cloud-ready
 * https://console.groq.com - Get free API key in seconds
 */

interface GenerateTextOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerateTextResponse {
  text: string;
  tokensUsed?: number;
  model?: string;
}

/**
 * Generate text using Groq API
 * Free tier: 30 requests per minute
 * Requires: GROQ_API_KEY environment variable
 */
export async function generateText(
  options: GenerateTextOptions
): Promise<GenerateTextResponse> {
  const { systemPrompt, userPrompt, temperature = 0.7, maxTokens = 2000 } = options;

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not configured. Get free key from https://console.groq.com');
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast, high quality, currently supported
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(`Groq API error: ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    return {
      text: data.choices[0]?.message?.content || '',
      tokensUsed: data.usage?.total_tokens,
      model: data.model,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('GROQ_API_KEY')) {
      throw new Error('GROQ_API_KEY not set. Quick setup:\n1. Go to https://console.groq.com\n2. Create account (free)\n3. Copy API key\n4. Add to .env.local: GROQ_API_KEY=your_key_here');
    }
    throw new Error(`AI generation failed: ${msg}`);
  }
}

/**
 * Mock generate function for testing/demo without API key
 * Returns placeholder responses
 */
export async function generateTextMock(
  options: GenerateTextOptions
): Promise<GenerateTextResponse> {
  // Add a small delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return a mock response based on the prompt
  let mockText = 'This is a preview response. Add GROQ_API_KEY to .env.local to get real AI-generated content.\n\nQuick setup: https://console.groq.com (free account, copy key, add to .env.local)';

  if (options.userPrompt.toLowerCase().includes('paragraph')) {
    mockText = 'This is a sample paragraph generated on this topic. When you add your Groq API key, you\'ll receive high-quality, personalized content based on your specific inputs and requirements.';
  } else if (options.userPrompt.toLowerCase().includes('summarize')) {
    mockText = 'Key takeaway: This tool summarizes content. Enable Groq API integration for real summaries.';
  } else if (options.userPrompt.toLowerCase().includes('fix') || options.userPrompt.toLowerCase().includes('grammar')) {
    mockText = 'This is the corrected version of your text with improved grammar and clarity.';
  }

  return {
    text: mockText,
    tokensUsed: 150,
    model: 'mock-llama-3.1-8b',
  };
}

/**
 * Analyze text for word count and readability
 * This is a client-side utility for the Word Counter tool
 */
export function analyzeText(text: string): {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  paragraphCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  readingTimeMinutes: number;
  readingEase: string;
} {
  // Word count
  const words = text.trim().split(/\s+/).filter((w: string) => w.length > 0);
  const wordCount = words.length;

  // Character counts
  const characterCount = text.length;
  const characterCountNoSpaces = text.replace(/\s/g, '').length;

  // Paragraph count
  const paragraphCount = text.split(/\n\n+/).filter((p: string) => p.trim().length > 0).length;

  // Sentence count and average
  const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
  const sentenceCount = sentences.length;
  const avgSentenceLength = wordCount > 0 ? Math.round(wordCount / Math.max(sentenceCount, 1)) : 0;

  // Reading time (200 WPM average)
  const readingTimeMinutes = Math.ceil(wordCount / 200);

  // Flesch Reading Ease (approximation)
  const totalSyllables = estimateSyllables(text);
  const fleschScore = Math.round(
    206.835 - 1.015 * (wordCount / Math.max(sentenceCount, 1)) - 84.6 * (totalSyllables / Math.max(wordCount, 1))
  );

  let readingEase = 'Complex';
  if (fleschScore >= 90) readingEase = 'Very Easy';
  else if (fleschScore >= 80) readingEase = 'Easy';
  else if (fleschScore >= 70) readingEase = 'Fairly Easy';
  else if (fleschScore >= 60) readingEase = 'Standard';
  else if (fleschScore >= 50) readingEase = 'Fairly Difficult';
  else if (fleschScore >= 30) readingEase = 'Difficult';

  return {
    wordCount,
    characterCount,
    characterCountNoSpaces,
    paragraphCount,
    sentenceCount,
    avgSentenceLength,
    readingTimeMinutes,
    readingEase,
  };
}

/**
 * Estimate syllable count (approximation)
 */
function estimateSyllables(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  let totalSyllables = 0;

  const vowels = 'aeiouy';

  for (const word of words) {
    let syllableCount = 0;
    let previousWasVowel = false;

    for (const char of word) {
      const isVowel = vowels.includes(char);

      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }

      previousWasVowel = isVowel;
    }

    // Ensure at least 1 syllable
    if (syllableCount === 0) syllableCount = 1;

    totalSyllables += syllableCount;
  }

  return totalSyllables;
}
