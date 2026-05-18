/**
 * Advanced Scene Templates for Modern SaaS Videos
 * Rich, visually sophisticated scene compositions
 */

import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from 'remotion';
import { BackgroundRenderer } from './BackgroundRenderer';
import { ParticleLayer } from './ParticleLayer';
import { FloatingAccents } from './FloatingAccents';
import {
  FloatingFileCard,
  ConversionFlow,
  DashboardMockup,
  FeatureIconCluster,
  CTAButtonHero,
  UploadAnimation,
  ParallaxBackgroundLayer,
} from './AnimatedAssets';
import { getLucideIcon } from './icon-helper';

// ============================================================================
// SAAS HERO SCENE - Left-aligned text with visual hero on right
// ============================================================================

interface SaaSHeroSceneProps {
  title: string;
  subtitle: string;
  theme: any;
  duration: number;
}

export const SaaSHeroScene: React.FC<SaaSHeroSceneProps> = ({
  title,
  subtitle,
  theme,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Text slide in from left
  const textSlide = spring({
    frame,
    fps,
    config: { damping: 10, mass: 1, stiffness: 100 },
    durationInFrames: 40,
  });

  const textX = interpolate(textSlide, [0, 1], [-100, 0]);
  const textOpacity = interpolate(textSlide, [0, 1], [0, 1]);

  // Visual elements slide in from right
  const visualSlide = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, mass: 1, stiffness: 100 },
    durationInFrames: 40,
  });

  const visualX = interpolate(visualSlide, [0, 1], [100, 0]);
  const visualOpacity = interpolate(visualSlide, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Parallax background layers */}
      <ParallaxBackgroundLayer depth={0.1} color={theme.primary} opacity={0.03} />
      <ParallaxBackgroundLayer depth={0.05} color={theme.secondary} opacity={0.02} />

      {/* Particles */}
      <ParticleLayer count={20} baseColor={theme.primary} opacity={0.4} />

      {/* Left side: Text content */}
      <div
        style={{
          position: 'absolute',
          left: '60px',
          top: '100px',
          maxWidth: '500px',
          opacity: textOpacity,
          transform: `translateX(${textX}px)`,
        }}
      >
        {/* Main title */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: theme.text,
            margin: 0,
            marginBottom: '20px',
            lineHeight: 1.1,
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '20px',
            color: theme.text,
            opacity: 0.8,
            lineHeight: 1.6,
            margin: 0,
            marginBottom: '30px',
          }}
        >
          {subtitle}
        </p>

        {/* CTA button */}
        <button
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            border: 'none',
            borderRadius: '12px',
            padding: '14px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#fff',
            cursor: 'pointer',
            boxShadow: `0 8px 24px ${theme.primary}40`,
          }}
        >
          Get Started
        </button>
      </div>

      {/* Right side: Visual elements */}
      <div
        style={{
          position: 'absolute',
          right: '60px',
          top: '100px',
          opacity: visualOpacity,
          transform: `translateX(${visualX}px)`,
        }}
      >
        <FloatingFileCard
          icon="FileText"
          title="Document"
          filename="proposal.pdf"
          color={theme.primary}
          x={0}
          y={0}
          delay={0}
          scale={1.2}
        />
      </div>

      {/* Floating accent shapes */}
      <FloatingAccents theme={theme} />
    </AbsoluteFill>
  );
};

// ============================================================================
// FILE CONVERSION SCENE - Shows conversion flow with animations
// ============================================================================

interface FileConversionSceneProps {
  fromFormat: string;
  toFormat: string;
  theme: any;
  duration: number;
}

export const FileConversionScene: React.FC<FileConversionSceneProps> = ({
  fromFormat,
  toFormat,
  theme,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Conversion flow centered with parallax effect
  const scaleIn = spring({
    frame,
    fps,
    config: { damping: 12, mass: 1, stiffness: 120 },
    durationInFrames: 50,
  });

  const scale = interpolate(scaleIn, [0, 1], [0.8, 1]);
  const opacity = interpolate(scaleIn, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Background layers */}
      <ParallaxBackgroundLayer depth={0.1} color={theme.primary} opacity={0.03} />
      <ParallaxBackgroundLayer depth={0.05} color={theme.secondary} opacity={0.02} />

      {/* Particles */}
      <ParticleLayer count={30} baseColor={theme.primary} opacity={0.5} />

      {/* Title */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: theme.text,
            margin: 0,
            marginBottom: '10px',
          }}
        >
          Convert with Ease
        </h2>
        <p style={{ fontSize: '18px', color: theme.text, opacity: 0.7, margin: 0 }}>
          Fast, secure, and high-quality conversions
        </p>
      </div>

      {/* Centered conversion flow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
        }}
      >
        <ConversionFlow
          fromIcon="File"
          toIcon="FileCheck"
          fromColor={theme.primary}
          toColor={theme.secondary}
          fromLabel={fromFormat}
          toLabel={toFormat}
          x={0}
          y={0}
        />
      </div>

      {/* Feature icons below */}
      <div
        style={{
          position: 'absolute',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <FeatureIconCluster
          icons={[
            { icon: 'Zap', color: theme.primary, label: 'Fast' },
            { icon: 'Lock', color: theme.secondary, label: 'Secure' },
            { icon: 'Layers', color: theme.accent, label: 'Quality' },
          ]}
          x={0}
          y={0}
          delay={60}
        />
      </div>

      {/* Floating accents */}
      <FloatingAccents theme={theme} />
    </AbsoluteFill>
  );
};

// ============================================================================
// DASHBOARD FEATURE SCENE - Shows dashboard with data visualization
// ============================================================================

interface DashboardFeatureSceneProps {
  title: string;
  description: string;
  theme: any;
  duration: number;
}

export const DashboardFeatureScene: React.FC<DashboardFeatureSceneProps> = ({
  title,
  description,
  theme,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Staggered animations
  const titleSlide = spring({
    frame,
    fps,
    config: { damping: 10, mass: 1, stiffness: 100 },
    durationInFrames: 40,
  });

  const dashboardSlide = spring({
    frame: frame - 30,
    fps,
    config: { damping: 10, mass: 1, stiffness: 100 },
    durationInFrames: 50,
  });

  const titleX = interpolate(titleSlide, [0, 1], [-60, 0]);
  const titleOpacity = interpolate(titleSlide, [0, 1], [0, 1]);

  const dashboardY = interpolate(dashboardSlide, [0, 1], [60, 0]);
  const dashboardOpacity = interpolate(dashboardSlide, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Background layers */}
      <ParallaxBackgroundLayer depth={0.1} color={theme.primary} opacity={0.03} />
      <ParallaxBackgroundLayer depth={0.05} color={theme.secondary} opacity={0.02} />

      {/* Particles */}
      <ParticleLayer count={25} baseColor={theme.primary} opacity={0.45} />

      {/* Left: Text content */}
      <div
        style={{
          position: 'absolute',
          left: '60px',
          top: '120px',
          maxWidth: '400px',
          opacity: titleOpacity,
          transform: `translateX(${titleX}px)`,
        }}
      >
        <h2
          style={{
            fontSize: '52px',
            fontWeight: 'bold',
            color: theme.text,
            margin: 0,
            marginBottom: '20px',
            lineHeight: 1.1,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: theme.text,
            opacity: 0.75,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      {/* Right: Dashboard mockup */}
      <div
        style={{
          position: 'absolute',
          right: '60px',
          top: '120px',
          opacity: dashboardOpacity,
          transform: `translateY(${dashboardY}px)`,
        }}
      >
        <DashboardMockup
          title="Live Analytics"
          color={theme.primary}
          x={0}
          y={0}
          delay={60}
          width={320}
          height={220}
        />
      </div>

      {/* Bottom: Feature highlights */}
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <FeatureIconCluster
          icons={[
            { icon: 'TrendingUp', color: theme.primary, label: 'Growth' },
            { icon: 'BarChart3', color: theme.secondary, label: 'Analytics' },
            { icon: 'Activity', color: theme.accent, label: 'Monitor' },
          ]}
          x={0}
          y={0}
          delay={100}
          layout="grid"
        />
      </div>

      {/* Floating accents */}
      <FloatingAccents theme={theme} />
    </AbsoluteFill>
  );
};

// ============================================================================
// AI PRODUCT SCENE - Shows AI features with animated elements
// ============================================================================

interface AIProductSceneProps {
  headline: string;
  features: string[];
  theme: any;
  duration: number;
}

export const AIProductScene: React.FC<AIProductSceneProps> = ({
  headline,
  features,
  theme,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Central heading animation
  const headingScale = spring({
    frame,
    fps,
    config: { damping: 10, mass: 1, stiffness: 100 },
    durationInFrames: 50,
  });

  const scale = interpolate(headingScale, [0, 1], [0.8, 1]);
  const opacity = interpolate(headingScale, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Gradient overlay background */}
      <ParallaxBackgroundLayer depth={0.1} color={theme.primary} opacity={0.05} />
      <ParallaxBackgroundLayer depth={0.05} color={theme.secondary} opacity={0.03} />

      {/* Particles */}
      <ParticleLayer count={35} baseColor={theme.primary} opacity={0.5} />

      {/* Center: Headline with gradient */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
          textAlign: 'center',
          maxWidth: '800px',
        }}
      >
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            margin: 0,
            marginBottom: '30px',
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary}, ${theme.accent})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}
        >
          {headline}
        </h1>
      </div>

      {/* Feature cards in grid */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '600px',
        }}
      >
        {features.slice(0, 3).map((feature, idx) => {
          const featureDelay = 80 + idx * 20;
          const featureSlide = spring({
            frame: frame - featureDelay,
            fps,
            config: { damping: 12, mass: 1, stiffness: 120 },
            durationInFrames: 40,
          });

          const featureScale = interpolate(featureSlide, [0, 1], [0.6, 1]);
          const featureOpacity = interpolate(featureSlide, [0, 1], [0, 1]);

          return (
            <div
              key={idx}
              style={{
                background: `linear-gradient(135deg, ${theme.primary}20 0%, ${theme.secondary}10 100%)`,
                backdropFilter: 'blur(20px)',
                border: `2px solid ${theme.primary}40`,
                borderRadius: '12px',
                padding: '16px 24px',
                flex: '0 1 calc(33.333% - 14px)',
                minWidth: '150px',
                textAlign: 'center',
                transform: `scale(${featureScale})`,
                opacity: featureOpacity,
                transformOrigin: 'center',
              }}
            >
              <div style={{ fontSize: '12px', color: theme.text, fontWeight: '500' }}>
                {feature}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating accents */}
      <FloatingAccents theme={theme} />
    </AbsoluteFill>
  );
};

// ============================================================================
// SECURITY FEATURE SCENE - Shows security/encryption with visual metaphor
// ============================================================================

interface SecurityFeatureSceneProps {
  title: string;
  description: string;
  theme: any;
  duration: number;
}

export const SecurityFeatureScene: React.FC<SecurityFeatureSceneProps> = ({
  title,
  description,
  theme,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Rotation animation for lock icon
  const rotation = (frame * 1.5) % 360;

  // Slide in from left
  const textSlide = spring({
    frame,
    fps,
    config: { damping: 10, mass: 1, stiffness: 100 },
    durationInFrames: 40,
  });

  const textX = interpolate(textSlide, [0, 1], [-80, 0]);
  const textOpacity = interpolate(textSlide, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Background layers */}
      <ParallaxBackgroundLayer depth={0.1} color={theme.secondary} opacity={0.05} />
      <ParallaxBackgroundLayer depth={0.05} color={theme.accent} opacity={0.03} />

      {/* Particles */}
      <ParticleLayer count={25} baseColor={theme.secondary} opacity={0.4} />

      {/* Left: Text with highlight */}
      <div
        style={{
          position: 'absolute',
          left: '80px',
          top: '50%',
          transform: `translateY(-50%) translateX(${textX}px)`,
          opacity: textOpacity,
          maxWidth: '450px',
        }}
      >
        <h2
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: theme.text,
            margin: 0,
            marginBottom: '20px',
            lineHeight: 1.1,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            fontSize: '18px',
            color: theme.text,
            opacity: 0.8,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      {/* Right: Animated lock icon */}
      <div
        style={{
          position: 'absolute',
          right: '120px',
          top: '50%',
          transform: `translateY(-50%) rotateZ(${rotation}deg)`,
          fontSize: '120px',
        }}
      >
        🔒
      </div>

      {/* Bottom: Trust indicators */}
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <FeatureIconCluster
          icons={[
            { icon: 'Shield', color: theme.secondary, label: 'Protected' },
            { icon: 'Key', color: theme.primary, label: 'Encrypted' },
            { icon: 'CheckCircle', color: theme.accent, label: 'Verified' },
          ]}
          x={0}
          y={0}
          delay={60}
        />
      </div>

      {/* Floating accents */}
      <FloatingAccents theme={theme} />
    </AbsoluteFill>
  );
};

// ============================================================================
// CTA OUTRO SCENE - Call-to-action final scene
// ============================================================================

interface CTAOutroSceneProps {
  headline: string;
  subheading: string;
  ctaText: string;
  theme: any;
  duration: number;
}

export const CTAOutroScene: React.FC<CTAOutroSceneProps> = ({
  headline,
  subheading,
  ctaText,
  theme,
  duration,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Center bounce animation
  const centerBounce = spring({
    frame,
    fps,
    config: { damping: 8, mass: 1, stiffness: 100 },
    durationInFrames: 60,
  });

  const scale = interpolate(centerBounce, [0, 1], [0.7, 1]);
  const opacity = interpolate(centerBounce, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: theme.background }}>
      {/* Gradient background */}
      <ParallaxBackgroundLayer depth={0.1} color={theme.primary} opacity={0.08} />
      <ParallaxBackgroundLayer depth={0.05} color={theme.secondary} opacity={0.05} />

      {/* Particles */}
      <ParticleLayer count={40} baseColor={theme.primary} opacity={0.6} />

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          opacity,
          textAlign: 'center',
          maxWidth: '700px',
        }}
      >
        {/* Headline */}
        <h1
          style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: theme.text,
            margin: 0,
            marginBottom: '15px',
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}
        >
          {headline}
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontSize: '22px',
            color: theme.text,
            opacity: 0.8,
            margin: 0,
            marginBottom: '40px',
            lineHeight: 1.5,
          }}
        >
          {subheading}
        </p>

        {/* CTA Button */}
        <CTAButtonHero
          text={ctaText}
          subtext="Join thousands of creators"
          color={theme.primary}
          x={-80}
          y={0}
          delay={100}
        />
      </div>

      {/* Floating accents */}
      <FloatingAccents theme={theme} />
    </AbsoluteFill>
  );
};
