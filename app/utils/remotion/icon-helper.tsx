/**
 * Icon Helper
 * Maps icon names to Lucide React components
 */

import React from 'react';
import {
  FileText,
  Upload,
  Download,
  Zap,
  Cloud,
  Shield,
  Sparkles,
  Image as ImageIcon,
  Video,
  File,
  BarChart3,
  Code,
  Palette,
  Settings,
  Heart,
  Star,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  Music,
} from 'lucide-react';

interface IconProps {
  size: number;
  color: string;
  strokeWidth?: number;
}

const iconMap: Record<string, React.FC<IconProps>> = {
  pdf: File,
  upload: Upload,
  download: Download,
  ai: Sparkles,
  cloud: Cloud,
  shield: Shield,
  lightning: Zap,
  image: ImageIcon,
  video: Video,
  'file-text': FileText,
  chart: BarChart3,
  code: Code,
  palette: Palette,
  settings: Settings,
  heart: Heart,
  star: Star,
  'trending-up': TrendingUp,
  'check-circle': CheckCircle,
  'arrow-right': ArrowRight,
  play: Play,
  music: Music,
};

export const getLucideIcon = (
  iconName: string,
  size: number = 48,
  color: string = '#ffffff',
  strokeWidth: number = 2
): React.ReactNode => {
  // Normalize icon name (e.g., "PDF" -> "pdf")
  const normalizedName = (iconName || 'sparkles').toLowerCase();
  const IconComponent = iconMap[normalizedName];

  if (!IconComponent) {
    console.warn(`Icon not found: ${iconName}, using default sparkles`);
    return React.createElement(Sparkles, { size, color, strokeWidth });
  }

  return React.createElement(IconComponent, { size, color, strokeWidth });
};

export const getAvailableIcons = (): string[] => {
  return Object.keys(iconMap);
};
