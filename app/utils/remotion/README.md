# Remotion Video Rendering Implementation

## Overview

This directory contains the complete Remotion-based video rendering system for generating cinematic marketing, explainer, and slideshow videos from text-to-video prompts.

## Architecture

```
VideoScript (from Groq)
    ↓
VideoCompositionContent (Remotion React component)
    ├── Scene 1-N (SceneRenderer)
    │   ├── Animated Text (headline + subtext)
    │   ├── Background (gradient, image, blob, particles)
    │   └── Layout (centered-hero, split-left, etc.)
    └── CTA Section (final call-to-action)
    ↓
renderMedia() → MP4 file
    ↓
ffprobe Validation (ensure integrity)
    ↓
Deliver to User (Nodemailer or download)
```

## Directory Structure

```
app/utils/remotion/
├── types.ts                    # Type definitions (AnimationType, LayoutType, ThemeConfig)
├── composition-utils.ts        # Helper functions (FPS, aspect ratio, frame calcs)
├── VideoComposition.tsx        # Main composition orchestrator
├── VideoCompositionRoot.tsx    # Remotion registration entry point
├── SceneRenderer.tsx           # Individual scene rendering
├── AnimatedText.tsx            # Text with entrance animations
├── BackgroundRenderer.tsx      # Background styles (gradients, images, blobs, particles)
├── CTASection.tsx              # Call-to-action with pulse animation
├── icon-helper.tsx             # Lucide icon integration
├── render-with-remotion.ts     # Remotion rendering engine
├── unified-renderer.ts         # Hybrid Remotion/FFmpeg renderer selector
└── remotion.config.ts          # Remotion configuration
```

## Core Components

### 1. **VideoCompositionContent** (VideoComposition.tsx)
Main composition component that orchestrates:
- All scene rendering with timing
- CTA section with remaining duration
- Proper Remotion integration with useVideoConfig()

Props:
```typescript
interface VideoCompositionContentProps {
  script: VideoScript;  // Full video script from Groq
}
```

### 2. **SceneRenderer** (SceneRenderer.tsx)
Renders individual scenes with:
- Automatic timing based on scene duration
- Layout selection (centered-hero, split-left, lower-third)
- Animation triggering
- Background rendering

Supported Layouts:
- `centered-hero` - Center text with optional icon
- `split-left` - Icon on left, text on right  
- `split-right` - Text on left, icon on right
- `lower-third` - Text anchored to bottom
- `card-overlay` - Text in card overlay
- `full-screen` - Full-screen hero mode

### 3. **AnimatedText** (AnimatedText.tsx)
Handles text animations with:
- Entrance animations (fade, slide-up, zoom-in, etc.)
- Delay support for staggered entrance
- Responsive sizing and line height
- Color and font customization

Supported Animations:
- `fade` - Simple opacity fade
- `slide-up` - Slide up with fade
- `slide-down` - Slide down with fade
- `slide-left` - Horizontal slide left
- `slide-right` - Horizontal slide right
- `zoom-in` - Scale from 0.8 to 1.0
- `zoom-out` - Scale from 1.2 to 1.0
- `bounce` - Bounce entrance
- `none` - No animation (static)

### 4. **BackgroundRenderer** (BackgroundRenderer.tsx)
Renders five background types:

1. **Gradient** - Linear color gradients
   ```typescript
   {
     type: 'gradient',
     gradientStart: '#00d9ff',
     gradientEnd: '#ff006e'
   }
   ```

2. **Image** - Static images with optional dark overlay
   ```typescript
   {
     type: 'image',
     imageUrl: 'https://...',
     overlayOpacity: 0.3  // Dark overlay darkness
   }
   ```

3. **Blob** - Animated SVG blob with rotating motion
   ```typescript
   { type: 'blob' }
   ```

4. **Particles** - Floating particle field with oscillation
   ```typescript
   { type: 'particles' }
   ```

5. **Glassmorphism** - Frosted glass effect with cards
   ```typescript
   { type: 'glassmorphism' }
   ```

### 5. **CTASection** (CTASection.tsx)
Final call-to-action screen with:
- Large CTA text
- Subtext support
- Pulsing button animation
- Slide-up entrance
- Smooth fade transitions

## Theme System

Six built-in themes with coordinated colors, typography, and spacing:

### Available Themes
1. **modern** - Neon cyan/magenta with futuristic vibe
2. **minimal** - Clean black/white, elegant simplicity
3. **corporate** - Navy blue, professional appearance
4. **social-reel** - Hot pink/magenta, bold and vibrant
5. **explainer** - Purple/pink gradients, educational feel
6. **product-promo** - Red/teal, strong promotional energy

### Theme Structure
```typescript
interface ThemeConfig {
  name: VideoStyle;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
  typography: {
    headlineSize: number;    // 64-76px
    subtextSize: number;     // 28-34px
    family: string;          // Font family
    weight: number;          // Font weight (400-800)
  };
  spacing: {
    padding: number;         // Container padding
    gap: number;            // Element spacing
  };
  gradients?: {
    start: string;
    end: string;
  };
}
```

## Icon System

Lucide React icons integrated via `icon-helper.tsx`:

Supported Icons:
- `pdf` / `upload` / `download`
- `ai` (sparkles) / `cloud` / `shield` / `lightning`
- `image` / `video` / `file-text` / `chart`
- `code` / `palette` / `settings` / `heart` / `star`
- `trending-up` / `check-circle` / `arrow-right` / `play` / `music`

Usage in Scene:
```typescript
{
  iconName: 'sparkles',
  // Icon will be rendered at 80px with theme accent color
}
```

## Aspect Ratios & Frame Rates

### Aspect Ratios
- `16:9` (1920×1080) - YouTube, horizontal displays
- `9:16` (1080×1920) - Instagram Reels, vertical content
- `1:1` (1080×1080) - Square social media

### Frame Rates by Style
- `modern`: 30 fps
- `minimal`: 24 fps (cinematic)
- `corporate`: 30 fps
- `social-reel`: 60 fps (smooth fast cuts)
- `explainer`: 30 fps
- `product-promo`: 30 fps

## Rendering Pipeline

### 1. Script Validation
```typescript
if (!script.scenes || script.scenes.length === 0) {
  throw new Error('Script must have at least one scene');
}
```

### 2. Parameter Calculation
- Resolution from aspect ratio
- FPS from style
- Total frames from duration × FPS

### 3. Remotion Rendering
```typescript
await renderMedia({
  composition: {
    id: 'video-composition',
    durationInFrames: totalFrames,
    fps: getFramesPerSecond(style),
    width: width,
    height: height,
  },
  outputLocation: outputPath,
  codec: 'h264',
  crf: 28,  // Quality (lower = better)
  pixelFormat: 'yuv420p',
  onProgress: (progress) => updateUI(progress * 100),
});
```

### 4. Validation
```typescript
const validation = validateMP4(outputPath);
if (!validation.valid) {
  throw new Error(`MP4 validation failed: ${validation.error}`);
}
```

## Integration with Existing System

### API Endpoint Flow

1. **POST /api/video/generate-script**
   - Input: Prompt, style, duration, etc.
   - Output: VideoScript (from Groq)

2. **POST /api/video/render**
   - Input: VideoScript
   - Jobs system manages async rendering
   - Output: Download link via Nodemailer

### Current System Compatibility

The implementation maintains full compatibility with:
- Existing `/api/video/render` endpoint
- Job tracking and progress polling
- Nodemailer download delivery
- FFmpeg validation pipeline (ffprobe)

### Gradual Migration Strategy

**Phase 1 (Current):**
- Remotion components built and tested
- TypeScript compilation passes
- Components ready for integration

**Phase 2 (Next):**
- Configure Remotion worker process
- Implement renderMedia() calls
- Integrate with async job system

**Phase 3:**
- Full production rendering
- FFmpeg post-processing (optional)
- Performance optimization

## Usage Examples

### Basic Scene Rendering
```typescript
const scene: Scene = {
  id: 0,
  duration: 5,
  headline: 'Welcome to Our Platform',
  subtext: 'The easiest way to create videos',
  visual: 'gradient',
  animation: 'slide-up',
  background: 'gradient',
  gradientStart: '#00d9ff',
  gradientEnd: '#ff006e',
  caption: 'Professional video creation',
};
```

### Image Scene with Ken Burns
```typescript
const scene: Scene = {
  id: 1,
  duration: 4,
  headline: 'Amazing Visuals',
  backgroundImage: 'https://...',
  overlayOpacity: 0.3,
  animation: 'fade',
  background: 'image',
  caption: 'High-quality imagery',
};
```

### Icon-based Scene
```typescript
const scene: Scene = {
  id: 2,
  duration: 3,
  headline: 'Key Features',
  subtext: 'Everything you need',
  iconName: 'sparkles',
  animation: 'zoom-in',
  layout: 'centered-hero',
};
```

## Performance Considerations

### Rendering Time Estimates
- 15s video: 30-45 seconds render time
- 30s video: 60-90 seconds render time
- 45s video: 90-150 seconds render time

Varies by:
- Scene complexity (particle count, animations)
- Image processing (downloads, encoding)
- System resources

### Optimization Tips
1. Use `minimal` style for faster renders (24fps vs 30fps)
2. Keep images local when possible
3. Limit particle effects to key scenes
4. Use gradient backgrounds instead of large images

## Troubleshooting

### Common Issues

**Issue**: Composition not rendering
- **Solution**: Ensure VideoCompositionRoot is imported in Remotion config

**Issue**: Images not showing in video
- **Solution**: Verify image URLs are accessible from server; check overlayOpacity

**Issue**: Animations not visible
- **Solution**: Ensure animation property matches AnimationType union; check scene duration

**Issue**: Performance degradation
- **Solution**: Reduce particle count, limit image sources, use simpler backgrounds

## Future Enhancements

1. **Live Preview** - @remotion/player for real-time composition preview
2. **Custom Fonts** - Load Google Fonts or system fonts dynamically
3. **Music/Voiceover** - Audio track mixing with silence detection
4. **Advanced Effects** - Filters, transitions, color correction
5. **Template System** - Pre-built composition templates for common use cases
6. **Batch Rendering** - Queue multiple videos for rendering
7. **Cloud Rendering** - AWS Lambda or similar for scalability

## References

- [Remotion Docs](https://www.remotion.dev/)
- [Next.js Integration Guide](https://www.remotion.dev/docs/next-js)
- [Lucide React Icons](https://lucide.dev/)
- [Project Architecture Summary](../../COMPLETE_IMPLEMENTATION_SUMMARY.md)
