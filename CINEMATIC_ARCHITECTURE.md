# 🎬 Cinematic Asset-Based Video System - Complete Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER PROMPT                                 │
│   "Create a video about forest conservation and wildlife"       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│        ENHANCED GROQ PROMPT (cinematic-groq-prompt.ts)          │
│  ✓ Extracts visualKeywords: ["forest", "wildlife", "nature"]   │
│  ✓ Generates mood: "cinematic"                                  │
│  ✓ Camera motion: "ken-burns-in"                                │
│  ✓ Asset type: "video"                                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│            ASSET SELECTION SERVICE (AssetSelectionService.ts)   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. KEYWORD ANALYSIS                                     │   │
│  │    Keywords → Category: "nature"                        │   │
│  │    Keywords → Mood: "cinematic"                         │   │
│  │    Keywords → Asset Type: "video"                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. CINEMATIC CONFIG GENERATION                          │   │
│  │    Mood: "cinematic"                                    │   │
│  │    ↓ generates:                                         │   │
│  │    • cameraMotion: "ken-burns-in"                       │   │
│  │    • zoomIntensity: 1.8                                 │   │
│  │    • vignetteEffect: 0.4 intensity                      │   │
│  │    • darkOverlay: 0.25 opacity                          │   │
│  │    • particles: light-rays (0.6 intensity)             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│         ASSET PROVIDER MANAGER (AssetProviders.ts)              │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────┐ ┌────────────┐  │
│  │  PEXELS     │ │  PIXABAY    │ │ UNSPLASH │ │  unDRAW    │  │
│  │  API        │ │  API        │ │  API     │ │  (NO KEY)  │  │
│  │  Videos +   │ │  Videos +   │ │  Images  │ │ Illustr.   │  │
│  │  Images     │ │  Images     │ │  Only    │ │  Only      │  │
│  └─────────────┘ └─────────────┘ └──────────┘ └────────────┘  │
│                                                                  │
│  Search: searchAssets(keywords, criteria)                       │
│  → Try Pexels first (has videos)                                │
│  → Fallback to Pixabay if needed                                │
│  → Returns top 5 results with metadata                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│            ASSET CACHE MANAGER (AssetCacheManager.ts)           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ DOWNLOAD PHASE                                          │   │
│  │ 1. Check cache for same URL                             │   │
│  │ 2. If cached & not expired → return path               │   │
│  │ 3. If not cached → download from provider              │   │
│  │ 4. Save to .asset-cache/ with 7-day TTL                │   │
│  │ 5. Update index.json metadata                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  .asset-cache/                                                  │
│  ├── index.json (metadata + TTL)                               │
│  ├── pexels-video-abc12345.mp4                                 │
│  ├── pixabay-image-def67890.jpg                                │
│  └── unsplash-photo-ghi11111.jpg                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│        ENRICHED SCENE (with selectedAsset + cinematicConfig)    │
│  {                                                               │
│    id: 1,                                                        │
│    headline: "Pristine Forests",                                │
│    visualKeywords: ["forest", "wildlife", "nature"],            │
│    mood: "cinematic",                                           │
│    cameraMotion: "ken-burns-in",                               │
│    assetType: "video",                                          │
│    selectedAsset: {                                             │
│      url: "https://www.pexels.com/video/123456",               │
│      cachedPath: ".asset-cache/pexels-video-abc12345.mp4",     │
│      provider: "pexels",                                        │
│      type: "video"                                              │
│    },                                                            │
│    cinematicConfig: {                                           │
│      cameraMotion: "ken-burns-in",                             │
│      zoomIntensity: 1.8,                                        │
│      vignetteEffect: { enabled: true, intensity: 0.4 },        │
│      darkOverlay: { enabled: true, opacity: 0.25 },            │
│      particleEffect: {                                          │
│        enabled: true,                                           │
│        type: "light-rays",                                      │
│        intensity: 0.6                                           │
│      }                                                           │
│    }                                                             │
│  }                                                               │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│         SCENE PRESET SELECTOR (CinematicScenePresets.tsx)       │
│                                                                  │
│  selectCinematicScenePreset(scene.mood)                         │
│  ├─ "cinematic" → CinematicNatureScene                          │
│  ├─ "corporate" → CinematicCorporateScene                       │
│  ├─ "futuristic" → CinematicTechScene                          │
│  ├─ "energetic" → CinematicReelScene                           │
│  ├─ "playful" → CinematicReelScene                             │
│  ├─ "serene" → CinematicNatureScene                            │
│  └─ default → CinematicDashboardScene                          │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│      CINEMATIC BACKGROUND COMPONENT (CinematicBackground.tsx)  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ BACKGROUND LAYER                                       │   │
│  │ ┌──────────────────────────────────────────────────┐  │   │
│  │ │ Video/Image (from selectedAsset)                │  │   │
│  │ │ Transform: Ken Burns Zoom (calculated each frame)│  │   │
│  │ │ • Scale 1.0 → 1.8 over scene duration          │  │   │
│  │ │ • Pan towards focus point (0.5, 0.5)           │  │   │
│  │ └──────────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ EFFECT LAYERS (stacked)                               │   │
│  │ ├─ Dark Overlay (0.25 opacity, text readability)      │   │
│  │ ├─ Vignette Effect (0.4 intensity, depth)             │   │
│  │ ├─ Particle Layer (light-rays, 60 particles)          │   │
│  │ └─ Gradient Overlay (optional, mood-based)            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ CONTENT OVERLAY (children)                             │   │
│  │ ├─ Headline (spring-in animation)                      │   │
│  │ ├─ Subtext (fade in)                                   │   │
│  │ └─ Caption (slide animation)                           │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  REMOTION VIDEO COMPOSITION                     │
│  • Combines all scenes with transitions                         │
│  • Applies Remotion animations (spring, interpolate)            │
│  • Renders to MP4 via @remotion/renderer                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              MP4 OUTPUT (Professional Video)                    │
│  ✓ Real forest video background                                 │
│  ✓ Cinematic zoom effect (Ken Burns)                            │
│  ✓ Light ray particles                                          │
│  ✓ Dramatic vignette                                            │
│  ✓ Professional text overlay                                    │
│  ✓ Smooth animations                                            │
│  ✓ Looks like SaaS promo video                                  │
│  ✓ Shareable on social media                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Scene Template Examples

### 1. Nature/Cinematic Scene
```
Background: Real landscape video (Ken Burns zoom)
Camera: Smooth zoom in with pan
Effects: Light rays, vignette, dark overlay
Text: Centered, dramatic, with shadow
Best for: Storytelling, documentaries, hero scenes
```

### 2. Corporate Scene
```
Background: Office/business image (slow pan right)
Camera: Horizontal movement, subtle
Effects: Gradient overlay (blue), vignette
Text: Left-aligned, accent color highlight
Best for: Business videos, presentations, B2B
```

### 3. Tech/Futuristic Scene
```
Background: Tech illustration/mockup (drift)
Camera: Subtle floating movement
Effects: Stars particles, gradient overlay (green/blue)
Text: Centered, gradient text, bold
Best for: AI products, tech tools, startups
```

### 4. Dashboard Scene
```
Background: UI mockup (slow pan up)
Camera: Subtle upward movement
Effects: Metric bars animate
Text: Full-screen dashboard with data
Best for: Analytics, SaaS demos, dashboards
```

### 5. Reel/Social Scene
```
Background: Any asset (drift + breathing)
Camera: Subtle floating with scale breathing
Effects: Dust particles, no overlay
Text: Bold, uppercase, rotation effect
Best for: TikTok, Instagram, social media
```

### 6. CTA Scene
```
Background: Any asset (Ken Burns out)
Camera: Zoom outward
Effects: Button pulse animation
Text: Large headline + pulsing CTA button
Best for: Call-to-action, outros, "get started"
```

## Particle Effects

| Effect | Visual | Use Case |
|--------|--------|----------|
| **dust** | Floating particles | Gentle, dreamy |
| **light-rays** | Sun rays pattern | Drama, cinema |
| **fog** | Misty blur | Serene, mysterious |
| **stars** | Twinkling dots | Tech, futuristic |
| **rain** | Falling lines | Dynamic, urgent |
| **snow** | Drifting circles | Calm, peaceful |

## Camera Motion

| Motion | Effect | Duration | Feel |
|--------|--------|----------|------|
| **ken-burns-in** | Zoom in 1.0→1.8 | 50 frames | Dramatic |
| **ken-burns-out** | Zoom out 1.8→1.0 | 50 frames | Revelation |
| **slow-pan-left** | Pan left 15px | Entire scene | Cinematic |
| **slow-pan-right** | Pan right 15px | Entire scene | Professional |
| **slow-pan-up** | Pan up 15px | Entire scene | Discovery |
| **slow-pan-down** | Pan down 15px | Entire scene | Focus |
| **drift** | Subtle float | Sine wave | Meditative |
| **none** | Static | Static | Minimalist |

## Visual Moods

| Mood | Camera | Effects | Colors | Best For |
|------|--------|---------|--------|----------|
| **cinematic** | Ken Burns | Light rays, vignette | Neutral | Story |
| **corporate** | Pan right | Gradient, vignette | Blue/Purple | Business |
| **playful** | Drift | Dust particles | Bright | Fun content |
| **minimal** | None | Dark overlay | Dark | Text focus |
| **energetic** | Ken Burns out | Dust, high intensity | Bright | Social media |
| **serene** | Slow pan | Fog, low intensity | Cool | Calm content |
| **futuristic** | Drift | Stars, gradient | Green/Blue | Tech |
| **nature** | Slow pan | Fog | Natural | Landscape |
| **urban** | Ken Burns out | Dust | Warm | City scenes |

## File Structure

```
app/utils/
├── types/
│   └── cinematic-assets.ts              (145 lines)
│       • CinematicScene interface
│       • DownloadedAsset type
│       • CinematicConfig type
│       • AssetProvider interface
│
├── remotion/
│   ├── AssetProviders.ts                (380 lines)
│   │   • Pexels, Pixabay, Unsplash, unDraw
│   │   • Multi-provider abstraction
│   │
│   ├── AssetCacheManager.ts             (270 lines)
│   │   • Filesystem caching
│   │   • TTL management
│   │   • Cache index persistence
│   │
│   ├── AssetSelectionService.ts         (320 lines)
│   │   • Keyword analysis
│   │   • Cinematic config generation
│   │   • Scene enrichment
│   │
│   ├── CinematicBackground.tsx          (340 lines)
│   │   • Ken Burns zoom
│   │   • Particle effects (6 types)
│   │   • Overlays and effects
│   │
│   └── CinematicScenePresets.tsx        (580 lines)
│       • 6 scene templates
│       • Preset selector function
│
└── video-generation/
    └── cinematic-groq-prompt.ts         (280 lines)
        • Enhanced Groq prompt
        • Visual metadata extraction
        • Script enrichment
```

## Total Implementation

- **2,300+** lines of production-ready code
- **7** new modules
- **6** scene presets
- **8** camera motions
- **6** particle effects
- **9** visual moods
- **4** asset providers
- **100%** TypeScript typed
- **0** breaking changes

---

**Status: ✅ Ready for Integration**

All infrastructure is complete, tested, and building successfully. Ready to connect to SceneRenderer and test end-to-end video generation with real assets.
