/**
 * Groq Prompt Builder for Video Script Generation
 * Generates structured JSON prompts for Groq to create video scripts
 */

import { VideoGenerationRequest, VideoScript, AspectRatio, Duration } from '@/app/utils/types/video-generation';

const ASPECT_RATIO_DIMENSIONS: Record<AspectRatio, string> = {
  '9:16': 'vertical mobile (9:16)',
  '16:9': 'widescreen desktop (16:9)',
  '1:1': 'square social media (1:1)',
};

const DURATION_SCENE_COUNT: Record<Duration, number> = {
  15: 3,
  30: 5,
  45: 7,
};

export function buildGroqPrompt(request: VideoGenerationRequest): string {
  const sceneCount = DURATION_SCENE_COUNT[request.duration];
  const aspectRatioDimensions = ASPECT_RATIO_DIMENSIONS[request.aspectRatio];

  return `You are a professional video script writer. Create a structured JSON video script for this request:

USER REQUEST:
- Text/Prompt: "${request.prompt}"
- Video Style: ${request.style}
- Aspect Ratio: ${request.aspectRatio} (${aspectRatioDimensions})
- Duration: ${request.duration} seconds
- Tone: ${request.tone}
${request.ctaText ? `- CTA Text: "${request.ctaText}"` : ''}
${request.brand?.name ? `- Brand: ${request.brand.name}` : ''}

REQUIREMENTS:
1. Generate exactly ${sceneCount} scenes that fit the ${request.duration}s total duration
2. Distribute scene durations evenly (roughly ${Math.round(request.duration / sceneCount)}s each)
3. Each scene must have: id, duration, headline, subtext, visual, animation, background, caption
4. Write clear, concise headlines (max 5 words)
5. Subtexts should support the headline (max 10 words)
6. Visuals should be specific animation/design descriptions
7. Captions match the voiceover script
8. The voiceover should be engaging and match the tone
9. Total voiceover duration should match the video duration

VALID ANIMATIONS: 'fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out', 'bounce', 'none'
VALID BACKGROUNDS: 'solid', 'gradient', 'pattern', 'image'

Return ONLY valid JSON (no markdown, no extra text):

{
  "title": "Video title based on prompt",
  "aspectRatio": "${request.aspectRatio}",
  "duration": ${request.duration},
  "style": "${request.style}",
  "tone": "${request.tone}",
  "voiceover": "Complete voiceover script matching ${request.duration}s reading pace...",
  "scenes": [
    {
      "id": 1,
      "duration": ${Math.round(request.duration / sceneCount)},
      "headline": "First Key Point",
      "subtext": "Supporting detail",
      "visual": "Specific visual direction with animation details",
      "animation": "fade",
      "background": "gradient",
      "backgroundColor": "#ffffff" or skip if using gradient,
      "gradientStart": "#7c3aed" or skip if not gradient,
      "gradientEnd": "#3b82f6" or skip if not gradient,
      "caption": "Text shown on screen"
    }
  ],
  "captions": ["Array of all captions in order"],
  "cta": "${request.ctaText || 'Call-to-action here'}"
}

CRITICAL:
- Return ONLY the JSON object, no extra text or markdown
- Ensure all fields are present and valid
- Duration sum of all scenes must equal ${request.duration}
- Total scenes must be exactly ${sceneCount}
- JSON must be valid and parseable`;
}

/**
 * Validates that Groq response is valid JSON and contains required fields
 */
export function validateVideoScript(response: any): { valid: boolean; error?: string; script?: VideoScript } {
  try {
    // If response is a string, try to parse it
    const script = typeof response === 'string' ? JSON.parse(response) : response;

    // Validate required fields
    const requiredFields = ['title', 'aspectRatio', 'duration', 'style', 'voiceover', 'scenes', 'captions', 'cta'];
    for (const field of requiredFields) {
      if (!(field in script)) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    // Validate scenes array
    if (!Array.isArray(script.scenes) || script.scenes.length === 0) {
      return { valid: false, error: 'Scenes must be a non-empty array' };
    }

    // Validate each scene
    let totalDuration = 0;
    for (const scene of script.scenes) {
      const sceneRequiredFields = ['id', 'duration', 'headline', 'subtext', 'visual', 'animation', 'background', 'caption'];
      for (const field of sceneRequiredFields) {
        if (!(field in scene)) {
          return { valid: false, error: `Scene ${scene.id} missing field: ${field}` };
        }
      }

      // Validate animation type
      const validAnimations = ['fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out', 'bounce', 'none'];
      if (!validAnimations.includes(scene.animation)) {
        return { valid: false, error: `Scene ${scene.id} has invalid animation: ${scene.animation}` };
      }

      // Validate background type
      const validBackgrounds = ['solid', 'gradient', 'pattern', 'image'];
      if (!validBackgrounds.includes(scene.background)) {
        return { valid: false, error: `Scene ${scene.id} has invalid background: ${scene.background}` };
      }

      totalDuration += scene.duration;
    }

    // Validate total duration (allow ±2 second variance)
    if (Math.abs(totalDuration - script.duration) > 2) {
      return { 
        valid: false, 
        error: `Scene durations (${totalDuration}s) don't match total duration (${script.duration}s)` 
      };
    }

    // Validate captions array
    if (!Array.isArray(script.captions)) {
      return { valid: false, error: 'Captions must be an array' };
    }

    return { valid: true, script };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Repairs Groq response if it has minor issues (wrapped in markdown, extra text, etc)
 */
export function repairGroqResponse(rawResponse: string): string {
  let cleaned = rawResponse.trim();

  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }

  // Find JSON object start and end
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');

  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  return cleaned.trim();
}
