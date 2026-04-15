/**
 * Industry-Standard AI Content Detection
 * 
 * Combines multiple detection methods:
 * 1. Statistical Analysis (entropy, word patterns, consistency)
 * 2. Linguistic Markers (unusual phrasings, formal structure)
 * 3. Writing Style Analysis (repetition, diversity, flow)
 * 
 * Returns detailed metrics and confidence score
 */

interface DetectionMetrics {
  wordCount: number;
  avgWordLength: number;
  typeTokenRatio: number; // vocabulary diversity
  sentenceCount: number;
  avgSentenceLength: number;
  sentenceLengthVariance: number;
  entropy: number;
  burstiness: number;
  punctuationDiversity: number;
  repeatPhraseRatio: number;
  uniqueWordsRatio: number;
}

interface AIDetectionResult {
  likelihood: 'likely-ai' | 'likely-human' | 'mixed';
  confidence: number; // 0-100
  score: number; // -1 to 1, where >0 is more AI-like
  metrics: DetectionMetrics;
  analysis: {
    statisticalScore: number;
    linguisticScore: number;
    consistencyScore: number;
    reasoning: string[];
  };
}

/**
 * Calculate Shannon entropy of word distribution
 * High entropy = more diverse vocabulary (human-like)
 * Low entropy = repetitive (AI-like)
 */
function calculateEntropy(words: string[]): number {
  if (words.length === 0) return 0;

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word.toLowerCase()] = (frequency[word.toLowerCase()] || 0) + 1;
  });

  let entropy = 0;
  const wordCount = words.length;

  Object.values(frequency).forEach(count => {
    const probability = count / wordCount;
    entropy -= probability * Math.log2(probability);
  });

  return entropy;
}

/**
 * Calculate burstiness - measures if word frequencies are clustered
 * High = words used in bursts (more human)
 * Low = uniform distribution (more AI)
 */
function calculateBurstiness(text: string): number {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  if (words.length < 10) return 0;

  // Get top 20% of words
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  const sorted = Object.values(frequency).sort((a, b) => b - a);
  const topWords = sorted.slice(0, Math.max(1, Math.floor(sorted.length * 0.2)));

  // Calculate variance in positions
  let burstiness = 0;
  topWords.forEach(freq => {
    burstiness += Math.pow((freq - sorted.length * 0.1) / (sorted.length * 0.1), 2);
  });

  return Math.min(1, burstiness / topWords.length);
}

/**
 * Detect common AI-generated phrases and patterns
 */
function detectAIPatterns(text: string): { count: number; ratio: number; phrases: string[] } {
  const aiIndicators = [
    // Overly formal transitions
    /furthermore,|moreover,|in conclusion,|to summarize,|as previously mentioned/gi,
    // Repetitive AI markers
    /it is important to note that|it should be noted that|it is worth noting/gi,
    // Artificial enthusiasm
    /i am (delighted|pleased|happy) to|i am (excited|thrilled)/gi,
    // Generic corporate speak
    /synergistic|leverage|paradigm|holistic|ecosystem/gi,
    // Overly structured phrases
    /on the one hand.*on the other hand|first,.*second,.*third,/gi,
  ];

  const foundPhrases: string[] = [];
  let totalMatches = 0;

  aiIndicators.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      totalMatches += matches.length;
      foundPhrases.push(...matches);
    }
  });

  const ratio = text.split(/\s+/).length > 0 ? totalMatches / (text.split(/\s+/).length / 100) : 0;

  return { count: totalMatches, ratio, phrases: foundPhrases };
}

/**
 * Detect repeat phrases - AI tends to repeat similar structures
 */
function getRepeatedPhrases(text: string): number {
  // Extract 3-word phrases
  const words = text.toLowerCase().split(/\s+/);
  const trigrams: Record<string, number> = {};

  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    trigrams[trigram] = (trigrams[trigram] || 0) + 1;
  }

  // Calculate repetition ratio
  const repeatedCount = Object.values(trigrams).filter(count => count > 2).length;
  return repeatedCount / Math.max(1, Object.keys(trigrams).length);
}

/**
 * Main detection function with improved scoring
 */
export function detectAI(text: string): AIDetectionResult {
  const trimmedText = text.trim();
  if (trimmedText.length < 50) {
    return {
      likelihood: 'mixed',
      confidence: 20,
      score: 0,
      metrics: {} as DetectionMetrics,
      analysis: {
        statisticalScore: 0,
        linguisticScore: 0,
        consistencyScore: 0,
        reasoning: ['Text too short for reliable analysis (minimum 50 characters)'],
      },
    };
  }

  // Extract metrics
  const sentences = trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = trimmedText.split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;

  // Word length distribution
  const wordLengths = words.map(w => w.length);
  const avgWordLength = wordLengths.reduce((a, b) => a + b, 0) / Math.max(1, wordLengths.length);

  // Sentence length stats
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
  const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / Math.max(1, sentenceLengths.length);
  const sentenceLengthVariance = sentenceLengths.length > 1
    ? Math.sqrt(
        sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) /
        sentenceLengths.length
      )
    : 0;

  // Punctuation diversity
  const punctuation = trimmedText.match(/[.!?,;:—\-]/g) || [];
  const punctuationTypes = new Set(punctuation);
  const punctuationDiversity = punctuationTypes.size;

  // Calculate metrics
  const metrics: DetectionMetrics = {
    wordCount: words.length,
    avgWordLength: parseFloat(avgWordLength.toFixed(2)),
    typeTokenRatio: parseFloat((uniqueWords / Math.max(1, words.length)).toFixed(3)),
    sentenceCount: sentences.length,
    avgSentenceLength: parseFloat(avgSentenceLength.toFixed(2)),
    sentenceLengthVariance: parseFloat(sentenceLengthVariance.toFixed(2)),
    entropy: parseFloat(calculateEntropy(words).toFixed(3)),
    burstiness: parseFloat(calculateBurstiness(trimmedText).toFixed(3)),
    punctuationDiversity,
    repeatPhraseRatio: parseFloat(getRepeatedPhrases(trimmedText).toFixed(3)),
    uniqueWordsRatio: parseFloat((uniqueWords / Math.max(1, words.length)).toFixed(3)),
  };

  // Enhanced scoring with stronger indicators
  const reasoning: string[] = [];
  let statisticalScore = 0.5; // Start at neutral
  let linguisticScore = 0.5;
  let consistencyScore = 0.5;

  // 1. STATISTICAL SCORE - More extreme thresholds
  // Word length: AI uses more consistent 5-6 char words
  if (avgWordLength < 4 || avgWordLength > 7) {
    statisticalScore -= 0.25; // Clearly human
    reasoning.push(`✓ Variable word length (${avgWordLength.toFixed(1)} avg) indicates human author`);
  } else if (avgWordLength >= 4.8 && avgWordLength <= 5.5) {
    statisticalScore += 0.3; // Strong AI indicator
    reasoning.push(`⚠ Consistent word length (${avgWordLength.toFixed(1)} avg) common in AI`);
  }

  // Sentence variance: Humans have HIGH variance, AI is uniform
  if (sentenceLengthVariance > 8) {
    statisticalScore -= 0.25; // Human-like
    reasoning.push(`✓ High sentence variation (${sentenceLengthVariance.toFixed(1)}) shows human writing`);
  } else if (sentenceLengthVariance < 3) {
    statisticalScore += 0.35; // Strong AI indicator
    reasoning.push(`⚠ Very uniform sentences (${sentenceLengthVariance.toFixed(1)}) typical of AI`);
  }

  // Vocabulary diversity: AI is MORE diverse but REPETITIVE at structure level
  if (metrics.entropy > 9) {
    statisticalScore -= 0.2; // Human has good diversity
    reasoning.push(`✓ Excellent vocabulary entropy (${metrics.entropy.toFixed(2)}) typical of humans`);
  } else if (metrics.entropy < 5.5) {
    statisticalScore += 0.25; // AI is limited
    reasoning.push(`⚠ Low entropy (${metrics.entropy.toFixed(2)}) suggests limited vocabulary`);
  } else if (metrics.entropy < 6.5) {
    statisticalScore += 0.15;
    reasoning.push(`⚠ Moderate entropy (${metrics.entropy.toFixed(2)}) may indicate AI`);
  }

  // 2. LINGUISTIC SCORE - Check for AI patterns
  const aiPatterns = detectAIPatterns(trimmedText);
  if (aiPatterns.count >= 3) {
    linguisticScore += 0.4; // Strong AI evidence
    reasoning.push(`⚠ Found ${aiPatterns.count} formal AI markers (${(aiPatterns.ratio).toFixed(1)}% of text)`);
  } else if (aiPatterns.count === 2) {
    linguisticScore += 0.2;
    reasoning.push(`⚠ Found ${aiPatterns.count} formal phrases suggesting AI`);
  } else if (aiPatterns.count === 1) {
    linguisticScore += 0.1;
    reasoning.push(`→ One formal phrase detected`);
  } else {
    linguisticScore -= 0.2; // No AI markers = human
    reasoning.push(`✓ Natural language, no formal AI markers detected`);
  }

  // 3. CONSISTENCY SCORE - Repetition patterns
  if (metrics.repeatPhraseRatio > 0.2) {
    consistencyScore += 0.35; // High repetition = AI
    reasoning.push(`⚠ High phrase repetition (${(metrics.repeatPhraseRatio * 100).toFixed(1)}%) suggests AI`);
  } else if (metrics.repeatPhraseRatio > 0.12) {
    consistencyScore += 0.2; // Moderate repetition
    reasoning.push(`→ Moderate phrase repetition detected`);
  } else {
    consistencyScore -= 0.25; // Low repetition = human
    reasoning.push(`✓ Natural variation, low phrase repetition`);
  }

  // Burstiness: Human text should be bursty (clustered words)
  if (metrics.burstiness < 0.25) {
    consistencyScore += 0.25; // Uniform = AI
    reasoning.push(`⚠ Uniform word distribution typical of AI`);
  } else if (metrics.burstiness > 0.6) {
    consistencyScore -= 0.2; // Very bursty = human
    reasoning.push(`✓ Natural word clustering detected`);
  }

  // Punctuation: Limited = AI, Varied = Human
  if (punctuationDiversity === 1) {
    consistencyScore += 0.25;
    reasoning.push(`⚠ Single punctuation type suggests AI`);
  } else if (punctuationDiversity >= 5) {
    consistencyScore -= 0.15;
    reasoning.push(`✓ Varied punctuation indicates human writing`);
  }

  // Clamp scores to 0-1 range
  statisticalScore = Math.max(0, Math.min(1, statisticalScore));
  linguisticScore = Math.max(0, Math.min(1, linguisticScore));
  consistencyScore = Math.max(0, Math.min(1, consistencyScore));

  // Weighted combination: Statistical has most weight
  const combinedScore = (statisticalScore * 0.5 + linguisticScore * 0.3 + consistencyScore * 0.2);
  
  // Convert to -1 to 1 scale where >0 = AI
  const aiScore = (combinedScore - 0.5) * 2;

  // Calculate confidence - more extreme scores = higher confidence
  const confidence = Math.round(Math.abs(aiScore) * 100);

  // Determine likelihood based on score
  let likelihood: 'likely-ai' | 'likely-human' | 'mixed';
  if (aiScore > 0.25) {
    likelihood = 'likely-ai';
  } else if (aiScore < -0.25) {
    likelihood = 'likely-human';
  } else {
    likelihood = 'mixed';
  }

  return {
    likelihood,
    confidence: Math.min(100, Math.max(20, confidence)), // Minimum 20% confidence
    score: parseFloat(aiScore.toFixed(3)),
    metrics,
    analysis: {
      statisticalScore: parseFloat(statisticalScore.toFixed(3)),
      linguisticScore: parseFloat(linguisticScore.toFixed(3)),
      consistencyScore: parseFloat(consistencyScore.toFixed(3)),
      reasoning,
    },
  };
}

/**
 * Format detection result for display
 */
export function formatDetectionResult(result: AIDetectionResult): string {
  const emoji = result.likelihood === 'likely-ai' ? '🤖' : result.likelihood === 'likely-human' ? '👤' : '⚖️';
  const verdict = result.likelihood === 'likely-ai' ? 'Likely AI-Generated' : result.likelihood === 'likely-human' ? 'Likely Human-Written' : 'Mixed Signals';

  return `
${emoji} **Detection Verdict: ${verdict}**
**Confidence: ${result.confidence}%**

**Detailed Analysis:**
${result.analysis.reasoning.map((r) => `• ${r}`).join('\n')}

**Scoring Breakdown:**
• Statistical Pattern Score: ${(result.analysis.statisticalScore * 100).toFixed(0)}%
• Linguistic Markers Score: ${(result.analysis.linguisticScore * 100).toFixed(0)}%
• Consistency Score: ${(result.analysis.consistencyScore * 100).toFixed(0)}%

**Text Metrics:**
• Word Count: ${result.metrics.wordCount}
• Unique Words Ratio: ${(result.metrics.uniqueWordsRatio * 100).toFixed(1)}%
• Avg Word Length: ${result.metrics.avgWordLength} characters
• Vocabulary Entropy: ${result.metrics.entropy}
• Sentence Avg Length: ${result.metrics.avgSentenceLength} words
• Repeated Phrase Ratio: ${(result.metrics.repeatPhraseRatio * 100).toFixed(2)}%

**Disclaimer:**
This analysis is probabilistic and not definitive. AI detection has inherent limitations.
Multiple factors affect accuracy including: text domain, author style, and generative model used.
  `.trim();
}
