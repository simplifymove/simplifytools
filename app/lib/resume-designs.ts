/**
 * Resume Design Templates
 * Different visual designs/layouts for resumes
 */

export interface ResumeDesign {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  layout: 'classic' | 'modern' | 'minimal' | 'creative' | 'colorful';
}

export const resumeDesigns: ResumeDesign[] = [
  {
    id: 'classic-blue',
    name: 'Classic Professional',
    description: 'Traditional layout with blue accents - perfect for corporate roles',
    primaryColor: '#1a5490',
    secondaryColor: '#2d7ab8',
    accentColor: '#e8f1f7',
    layout: 'classic',
  },
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Contemporary design with dark header and clean typography',
    primaryColor: '#1f2937',
    secondaryColor: '#3b82f6',
    accentColor: '#f3f4f6',
    layout: 'modern',
  },
  {
    id: 'minimal-clean',
    name: 'Minimalist',
    description: 'Simple and elegant with minimal decoration - less is more',
    primaryColor: '#374151',
    secondaryColor: '#6366f1',
    accentColor: '#ffffff',
    layout: 'minimal',
  },
  {
    id: 'creative-green',
    name: 'Creative Green',
    description: 'Fresh design with green accents - great for creative professionals',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    accentColor: '#ecfdf5',
    layout: 'creative',
  },
  {
    id: 'vibrant-purple',
    name: 'Vibrant Purple',
    description: 'Bold and modern with purple theme - stands out from the crowd',
    primaryColor: '#7c3aed',
    secondaryColor: '#a78bfa',
    accentColor: '#f5f3ff',
    layout: 'colorful',
  },
];

/**
 * Get design-specific CSS classes
 */
export function getDesignStyles(designId: string) {
  const design = resumeDesigns.find(d => d.id === designId);
  if (!design) return {};

  return {
    primaryColor: design.primaryColor,
    secondaryColor: design.secondaryColor,
    accentColor: design.accentColor,
    layout: design.layout,
  };
}
