/**
 * Enhanced Groq Prompt Builder for Cinematic Videos
 * Generates structured prompts that include visual metadata for asset selection
 */

import { VideoGenerationRequest } from '@/app/utils/types/video-generation';
import { CinematicVideoScript } from '../types/cinematic-assets';
import { buildGroqPrompt as buildBasePrompt } from './groq-prompt-builder';

const ASPECT_RATIO_DIMENSIONS: Record<string, string> = {
  '9:16': 'vertical mobile (9:16)',
  '16:9': 'widescreen desktop (16:9)',
  '1:1': 'square social media (1:1)',
};

const DURATION_SCENE_COUNT: Record<number, number> = {
  15: 3,
  30: 5,
  45: 7,
};

/**
 * Build enhanced Groq prompt with visual metadata requirements
 */
export function buildCinematicGroqPrompt(request: VideoGenerationRequest): string {
  const sceneCount = DURATION_SCENE_COUNT[request.duration as 15 | 30 | 45] || 5;
  const aspectRatioDimensions = ASPECT_RATIO_DIMENSIONS[request.aspectRatio] || 'widescreen (16:9)';

  return `You are a professional cinematic video script writer and visual director. Create a structured JSON video script for this request with detailed visual asset descriptions:

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
3. Each scene must include VISUAL METADATA for asset selection:
   - visualKeywords: Array of keywords for stock asset search (e.g., ["forest", "sunset", "wildlife"])
   - assetType: 'video' | 'image' | 'illustration' | 'ui-mockup' (most visually appropriate)
   - mood: 'cinematic' | 'corporate' | 'playful' | 'minimal' | 'energetic' | 'serene' | 'futuristic'
   - cameraMotion: 'none' | 'slow-pan-left' | 'slow-pan-right' | 'slow-pan-up' | 'slow-pan-down' | 'ken-burns-in' | 'ken-burns-out' | 'drift'

4. Standard fields required: id, duration, headline, subtext, visual, animation, background, caption
5. Write clear, concise headlines (max 5 words)
6. Subtexts should support the headline (max 10 words)
7. Visuals should describe what real-world visuals should be shown
8. Captions match the voiceover script
9. The voiceover should be engaging and match the tone
10. Total voiceover duration should match the video duration

VISUAL ASSET SELECTION GUIDE:
- Nature scenes: Use 'video' type with keywords like ["forest", "mountain", "ocean", "sunset", "wildlife"]
- Technology: Use 'illustration' or 'ui-mockup' with keywords like ["code", "interface", "data", "technology"]
- Business: Use 'image' type with keywords like ["office", "team", "meeting", "collaboration", "corporate"]
- AI: Use 'illustration' with keywords like ["ai", "neural network", "futuristic", "technology", "digital"]
- Security: Use 'illustration' with keywords like ["shield", "lock", "protection", "security", "encrypted"]
- Dashboard: Use 'ui-mockup' with keywords like ["dashboard", "analytics", "metrics", "chart", "data-viz"]

CAMERA MOTION GUIDE:
- 'ken-burns-in': Slow zoom into scene (for dramatic moments)
- 'ken-burns-out': Slow zoom out (for revelations)
- 'slow-pan-left': Cinematic left movement (storytelling)
- 'slow-pan-right': Cinematic right movement  
- 'drift': Subtle floating movement (meditative, calm scenes)
- 'none': Static camera (for text-heavy or product-focused scenes)

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
      "visual": "Specific visual description - what real visuals should be shown",
      "animation": "fade",
      "background": "gradient",
      "backgroundColor": "#ffffff",
      "caption": "Text shown on screen",
      "visualKeywords": ["keyword1", "keyword2", "keyword3"],
      "assetType": "video",
      "mood": "cinematic",
      "cameraMotion": "ken-burns-in"
    }
  ],
  "captions": ["Array of all captions in order"],
  "cta": "${request.ctaText || 'Call-to-action here'}",
  "visualTheme": {
    "primaryMood": "${request.style === 'corporate' ? 'corporate' : request.style === 'social-reel' ? 'energetic' : 'cinematic'}",
    "cinematicStyle": "documentary"
  }
}

CRITICAL VISUAL REQUIREMENTS:
- Every scene must have at least 3 keywords for asset search
- Select assetType that best matches the visual description
- Choose camera motion that matches the narrative flow
- Use 'cinematic' mood for hero/intro scenes
- Use 'corporate' mood for business/professional content
- Use 'energetic' mood for social media/dynamic content
- Use 'serene' mood for nature/meditation content
- Use 'futuristic' mood for technology/AI content

CRITICAL JSON REQUIREMENTS:
- Return ONLY the JSON object, no extra text or markdown
- Ensure all fields are present and valid
- Duration sum of all scenes must equal ${request.duration}
- Total scenes must be exactly ${sceneCount}
- JSON must be valid and parseable
- Include visualKeywords, assetType, mood, cameraMotion in every scene`;
}

/**
 * Validates cinematic video script
 */
export function validateCinematicVideoScript(
  response: any,
): { valid: boolean; error?: string; script?: CinematicVideoScript } {
  try {
    const script = typeof response === 'string' ? JSON.parse(response) : response;

    // Base validation
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
      // Base scene fields
      const baseRequiredFields = ['id', 'duration', 'headline', 'subtext', 'visual', 'animation', 'background', 'caption'];
      for (const field of baseRequiredFields) {
        if (!(field in scene)) {
          return { valid: false, error: `Scene ${scene.id} missing field: ${field}` };
        }
      }

      // Cinematic metadata fields - allow fallback defaults
      const visualKeywords = scene.visualKeywords || [scene.visual?.split(' ')[0] || 'content'];
      if (!Array.isArray(visualKeywords)) {
        return { valid: false, error: `Scene ${scene.id} visualKeywords must be an array` };
      }

      const validAssetTypes = ['video', 'image', 'illustration', 'ui-mockup', 'animated-overlay'];
      if (scene.assetType && !validAssetTypes.includes(scene.assetType)) {
        return {
          valid: false,
          error: `Scene ${scene.id} has invalid assetType: ${scene.assetType}`,
        };
      }

      const validMoods = ['cinematic', 'corporate', 'playful', 'minimal', 'energetic', 'serene', 'futuristic'];
      if (scene.mood && !validMoods.includes(scene.mood)) {
        return { valid: false, error: `Scene ${scene.id} has invalid mood: ${scene.mood}` };
      }

      const validMotions = [
        'none',
        'slow-pan-left',
        'slow-pan-right',
        'slow-pan-up',
        'slow-pan-down',
        'ken-burns-in',
        'ken-burns-out',
        'drift',
      ];
      if (scene.cameraMotion && !validMotions.includes(scene.cameraMotion)) {
        return { valid: false, error: `Scene ${scene.id} has invalid cameraMotion: ${scene.cameraMotion}` };
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
        error: `Scene durations (${totalDuration}s) don't match total duration (${script.duration}s)`,
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
 * Repair and enhance Groq response with visual metadata defaults
 */
export function repairCinematicGroqResponse(rawResponse: string): string {
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

/**
 * Add visual defaults if Groq response missing cinematic metadata
 */
export function enrichScriptWithVisualDefaults(script: any): CinematicVideoScript {
  const moodMap: Record<string, string> = {
    corporate: 'corporate',
    social_reel: 'energetic',
    explainer: 'cinematic',
    product_promo: 'cinematic',
    minimal: 'minimal',
    modern: 'cinematic',
  };

  const defaultMood = moodMap[script.style] || 'cinematic';

  // Ensure scenes have visual metadata
  const enrichedScenes = script.scenes.map((scene: any, idx: number) => {
    // Extract keywords from visual description if not provided
    const visualText = scene.visual || scene.headline || '';
    const autoKeywords = visualText
      .toLowerCase()
      .split(/[\s,.-]+/)
      .filter((w: string) => w.length > 3 && w.length < 20)
      .slice(0, 5);

    return {
      ...scene,
      visualKeywords: scene.visualKeywords || autoKeywords || ['visual content'],
      assetType: scene.assetType || (idx === 0 ? 'video' : 'image'), // First scene prefers video
      mood: scene.mood || defaultMood,
      cameraMotion: scene.cameraMotion || (idx === 0 ? 'ken-burns-in' : idx % 2 === 0 ? 'slow-pan-left' : 'none'),
    };
  });

  return {
    ...script,
    scenes: enrichedScenes,
    visualTheme: script.visualTheme || {
      primaryMood: defaultMood,
      cinematicStyle: 'promotional',
    },
  };
}
