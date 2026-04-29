// Icon mapping utility for code tools
// Maps icon names to Lucide React components
import {
  Zap,
  Sparkles,
  Braces,
  Code2,
  Palette,
  Database,
  Lock,
  Unlock,
  FileJson,
  FileCode,
  Grid3x3,
  Shield,
  Copy,
  FileText,
} from 'lucide-react';

export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Sparkles,
  Braces,
  Code2,
  Palette,
  Database,
  Lock,
  Unlock,
  FileJson,
  FileCode,
  Grid3x3,
  Shield,
  Copy,
  FileText,
};

export function getIconComponent(iconName: string) {
  return iconMap[iconName] || Code2; // Default to Code2 if not found
}
