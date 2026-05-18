/**
 * Animated Text Component
 * Handles animated text rendering with entrance animations
 */

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { ThemeConfig, AnimationType } from './types';

interface AnimatedTextProps {
  text: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: number;
  animation: AnimationType;
  delayFrames?: number;
  maxWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  fontSize,
  color,
  fontFamily,
  fontWeight,
  animation,
  delayFrames = 0,
  maxWidth = 1000,
  textAlign = 'center',
  lineHeight = 1.4,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animation duration in frames (0.5 seconds)
  const animationDurationFrames = Math.round(fps * 0.5);
  const activeFrame = Math.max(0, frame - delayFrames);
  const progress = Math.min(activeFrame / animationDurationFrames, 1);

  // Get animation values
  const getAnimationValues = () => {
    switch (animation) {
      case 'fade':
        return {
          opacity: interpolate(progress, [0, 1], [0, 1], { easing: Easing.inOut(Easing.ease) }),
          transform: 'translateY(0)',
        };

      case 'slide-up':
        return {
          opacity: interpolate(progress, [0, 1], [0, 1], { easing: Easing.out(Easing.quad) }),
          transform: `translateY(${interpolate(progress, [0, 1], [40, 0], { easing: Easing.out(Easing.quad) })}px)`,
        };

      case 'slide-down':
        return {
          opacity: interpolate(progress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(progress, [0, 1], [-40, 0])}px)`,
        };

      case 'zoom-in':
        return {
          opacity: interpolate(progress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(progress, [0, 1], [0.8, 1], { easing: Easing.out(Easing.cubic) })})`,
        };
      case 'zoom-out':
        return {
          opacity: interpolate(progress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(progress, [0, 1], [1.2, 1], { easing: Easing.out(Easing.cubic) })})`,
        };

      case 'bounce':
        return {
          opacity: 1,
          transform: `translateY(${interpolate(progress, [0, 1], [40, 0], { easing: Easing.bounce })})`,
        };

      default:
        return {
          opacity: 1,
          transform: 'translateY(0)',
        };
    }
  };

  const animationValues = getAnimationValues();

  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        color,
        fontFamily,
        fontWeight,
        opacity: animationValues.opacity,
        transform: animationValues.transform,
        maxWidth: `${maxWidth}px`,
        textAlign,
        lineHeight,
        wordWrap: 'break-word',
        overflow: 'hidden',
      }}
    >
      {text}
    </div>
  );
};
