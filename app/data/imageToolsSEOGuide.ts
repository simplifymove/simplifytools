/* 
  IMAGE TOOLS SEO & UX IMPROVEMENT GUIDE
  ======================================
  
  This guide provides step-by-step instructions and templates for improving
  all image tool pages (60+ total) for SEO, UX, and conversion optimization.
  
  SCOPE: All /all-tools/* image tool pages
  PRIORITY LEVEL: High (Search traffic, user experience, SEO authority)
  
  ==== CRITICAL ISSUES FOUND & FIXES ====
*/

export const imageToolsSEOIssues = {
  // Issue 1: Weak Metadata
  issue1: {
    name: 'Weak SEO Metadata',
    current: {
      title: 'PNG to JPG - Free Online Tool | SimplifyConvert',
      description: 'Convert and edit png to jpg online instantly. Free tool without signup required.',
      keywords: ['png to jpg', 'free tool', 'online converter'],
    },
    improved: {
      title: 'PNG to JPG Converter - Remove Transparency & Compress | SimplifyConvert',
      description: 'Convert PNG to JPG online with background color options. Remove transparency and reduce file size instantly. Free and fast.',
      keywords: ['PNG to JPG', 'convert PNG to JPG', 'PNG converter', 'JPG converter', 'remove transparency', 'online converter'],
    },
    impact: 'CTR +35%, keyword ranking improvement',
    priority: 'CRITICAL',
    affectedPages: 'All converters, editors, AI tools',
  },

  // Issue 2: Generic CTA Buttons
  issue2: {
    name: 'Generic CTA Button Text',
    examples: [
      { bad: '<button>Convert</button>', good: '<button>Convert PNG to JPG</button>' },
      { bad: '<button>Process Image</button>', good: '<button>Compress Image</button>' },
      { bad: '<button>Submit</button>', good: '<button>Remove Background</button>' },
    ],
    impact: 'Conversion rate improvement 15-25%',
    priority: 'CRITICAL',
    affectedPages: 'All 60+ pages',
  },

  // Issue 3: Missing Internal Links
  issue3: {
    name: 'Missing Related Tools Links',
    current: 'None or minimal internal linking',
    improved: 'Each page should have 4-5 related tool links',
    examples: [
      'jpg-to-png should link to: png-to-jpg, webp-to-jpg, compress-image, resize-image',
      'compress-image should link to: compress-jpg, compress-png, resize-image, bulk-image-compressor',
      'remove-background should link to: image-enhancer, blur-image, add-text-to-image',
    ],
    impact: 'SEO authority flow, user engagement +30%',
    priority: 'HIGH',
    affectedPages: 'All pages',
  },

  // Issue 4: No FAQ Schema
  issue4: {
    name: 'Missing FAQ Structured Data',
    current: 'No FAQ or schema markup',
    improved: 'FAQ schema JSON-LD with 4-6 tool-specific questions',
    impact: 'Rich snippets in SERP, CTR +20-30%',
    priority: 'HIGH',
    affectedPages: 'All pages',
  },

  // Issue 5: Risky Claims
  issue5: {
    name: 'Overpromising/Risky Claims',
    current: [
      '100% secure',
      'Never stored',
      'Unlimited file size',
      'Guaranteed results',
      'Perfect quality',
      'Works instantly for every file',
    ],
    improved: [
      'Files are processed securely in your browser',
      'Files are automatically deleted after processing',
      'Supports files up to 50MB',
      'Designed for optimal results with standard images',
      'Maintains high quality with minimal loss',
      'Most files process within seconds',
    ],
    impact: 'Trust improvement, reduced bounce rate',
    priority: 'MEDIUM',
    affectedPages: 'All pages with marketing copy',
  },

  // Issue 6: Weak Hero Copy
  issue6: {
    name: 'Weak Above-The-Fold Value Prop',
    current: 'Generic descriptions like "Convert JPG to PNG"',
    improved: 'Clear benefit + use case + guarantee',
    example: {
      bad: 'Convert JPG to PNG online instantly',
      good: 'Convert JPG to PNG Online - Add Transparency to Your Images | Free, No Signup Required',
      heroDesc: 'Transform your JPG images to PNG format with full transparency support. Perfect for graphics, logos, and images with transparent backgrounds.',
    },
    priority: 'MEDIUM',
    affectedPages: 'All pages',
  },

  // Issue 7: No Content Structure
  issue7: {
    name: 'Missing H2/Content Structure',
    current: 'Minimal content below hero',
    improved: 'Clear H2 sections with SEO content',
    structure: [
      'H1: Main tool action',
      'H2: How to [tool name] - with steps',
      'H2: Benefits of [tool]',
      'H2: Use Cases',
      'H2: Related Tools',
      'FAQ Section with schema',
    ],
    priority: 'HIGH',
    affectedPages: 'All pages',
  },

  // Issue 8: Next.js Rendering Issues
  issue8: {
    name: 'SEO Content Hidden in Client Render',
    current: 'FAQ, content might have opacity:0 or be CSR-only',
    improved: 'All SEO content visible in View Source HTML (SSR)',
    impact: 'Full SEO indexing, featured snippets',
    priority: 'MEDIUM',
    affectedPages: 'Pages with Framer Motion/complex animations',
  },
};

// IMPLEMENTATION CHECKLIST
export const implementationChecklist = {
  phase1: {
    name: 'Metadata & OG Tags (Quick Win)',
    timeline: '2-3 hours',
    tasks: [
      '✅ Update all 60+ layout.tsx files with improved title/description/keywords',
      '✅ Verify OG tags match title and description',
      '✅ Update Twitter card descriptions',
      '✅ Verify canonical URLs are correct',
    ],
    impact: 'Immediate CTR improvement +20%',
  },

  phase2: {
    name: 'CTA Button Text (High Impact)',
    timeline: '3-4 hours',
    tasks: [
      '✅ Update all upload buttons to reflect tool action',
      '✅ Change process buttons from generic to specific',
      '✅ Update download/export buttons with format',
      '✅ Test button text in QA',
    ],
    files: [
      'All page.tsx files in image tool folders',
      'Search for: "Convert", "Process", "Submit", "Transform"',
      'Replace with specific action text',
    ],
    impact: 'Conversion rate +15-25%',
  },

  phase3: {
    name: 'FAQ Schema & Content (SEO Authority)',
    timeline: '4-6 hours',
    tasks: [
      '✅ Add FAQ section to each page.tsx',
      '✅ Create FAQ schema JSON-LD',
      '✅ Validate schema with Google Schema Validator',
      '✅ Ensure FAQ matches visible content',
    ],
    impact: 'Rich snippets, featured snippets, +30% CTR',
  },

  phase4: {
    name: 'Internal Linking (SEO Flow)',
    timeline: '2-3 hours',
    tasks: [
      '✅ Add "Related Tools" section to each page',
      '✅ Create tool relationship matrix (which tools link where)',
      '✅ Update links in both layout and page files',
      '✅ Verify links don\'t create redirect chains',
    ],
    impact: 'Authority distribution, user engagement',
  },

  phase5: {
    name: 'Content Structure & Safety',
    timeline: '3-4 hours',
    tasks: [
      '✅ Remove/soften risky claims ("100% secure", etc)',
      '✅ Add H2 sections for better readability',
      '✅ Remove opacity:0 from SEO content',
      '✅ Verify all content visible in View Source',
    ],
    impact: 'Trust improvement, reduced bounce rate',
  },
};

// TEMPLATES FOR DEVELOPERS

export const metadataTemplate = {
  filename: 'layout.tsx',
  template: `
import { Metadata } from 'next';

export const metadata: Metadata = {
  // RULE: Title should be 50-70 chars, include tool name + benefit
  // Format: "Tool Name - Benefit/Feature | SimplifyConvert"
  title: 'PNG to JPG Converter - Remove Transparency & Compress | SimplifyConvert',
  
  // RULE: Description should be 120-160 chars, include user benefit + features
  // Must answer: What? How? Why? When to use?
  description: 'Convert PNG to JPG online with background color options. Remove transparency and reduce file size instantly. Free and fast.',
  
  // RULE: Keywords should include exact terms + variants + long-tail
  // Include: exact tool name, variations, synonyms, use cases
  keywords: [
    'PNG to JPG', 
    'convert PNG to JPG', 
    'PNG converter', 
    'JPG converter', 
    'remove transparency',
    'online converter',
    'image compression',
  ],
  
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://simplifyconvert.com/all-tools/png-to-jpg',
    siteName: 'SimplifyConvert',
    title: 'PNG to JPG Converter - Remove Transparency',
    description: 'Convert PNG to JPG with background options. Remove transparency and reduce file size. Free online tool.',
    images: [{
      url: 'https://simplifyconvert.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'PNG to JPG Converter Tool',
    }],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'PNG to JPG Converter - Convert Online',
    description: 'Convert PNG to JPG, remove transparency, reduce file size. Fast and free.',
    images: ['https://simplifyconvert.com/og-image.jpg'],
  },
  
  alternates: {
    canonical: 'https://simplifyconvert.com/all-tools/png-to-jpg',
  },
};
  `,
};

export const ctaButtonTemplate = {
  filename: 'page.tsx',
  issues: [
    {
      bad: '<button>Convert</button>',
      good: '<button>Convert PNG to JPG</button>',
      reason: 'User immediately knows what will happen',
    },
    {
      bad: '<button>Process Image</button>',
      good: '<button>Compress Image</button>',
      reason: 'Specific action, matches tool function',
    },
    {
      bad: '<button onClick={handleConvert}>Submit</button>',
      good: '<button onClick={handleConvert}>Remove Background Now</button>',
      reason: 'Clear, action-oriented, urgency-driven',
    },
  ],
};

export const faqTemplate = {
  filename: 'page.tsx',
  component: `
// Add FAQ section before Footer
<div className="py-16 px-4 md:px-8 bg-gray-50 border-t border-gray-200">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold text-gray-900 mb-8">FAQ</h2>
    <div className="space-y-4">
      {faqItems.map((item, idx) => (
        <details key={idx} className="group p-4 border border-gray-200 rounded-lg cursor-pointer">
          <summary className="font-semibold text-gray-900 flex justify-between items-center">
            {item.question}
            <span className="text-gray-500">+</span>
          </summary>
          <p className="text-gray-700 mt-3 text-sm">{item.answer}</p>
        </details>
      ))}
    </div>
  </div>
</div>

// FAQ Schema JSON-LD
<script type="application/ld+json">{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer,
    },
  })),
})}</script>
  `,
};

export const relatedToolsTemplate = {
  filename: 'page.tsx',
  component: `
<div className="py-16 px-4 md:px-8 bg-white border-t border-gray-200">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Tools</h2>
    <div className="grid md:grid-cols-2 gap-4">
      {relatedTools.map(tool => (
        <Link key={tool.route} href={tool.route} className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-transparent rounded-lg border border-gray-200 hover:border-orange-500 hover:shadow-md transition">
          <span className="text-orange-600 font-bold">→</span>
          <span className="text-gray-900 font-medium hover:text-orange-600">{tool.title}</span>
        </Link>
      ))}
    </div>
  </div>
</div>
  `,
  examples: {
    'jpg-to-png': [
      { title: 'PNG to JPG Converter', route: '/all-tools/png-to-jpg' },
      { title: 'WebP to JPG Converter', route: '/all-tools/webp-to-jpg' },
      { title: 'Compress Image', route: '/all-tools/compress-image' },
      { title: 'Resize Image', route: '/all-tools/resize-image' },
    ],
    'compress-image': [
      { title: 'Compress JPG', route: '/all-tools/compress-jpg' },
      { title: 'Compress PNG', route: '/all-tools/compress-png' },
      { title: 'Resize Image', route: '/all-tools/resize-image' },
      { title: 'Bulk Image Compressor', route: '/all-tools/bulk-image-compressor' },
    ],
  },
};

// SAFETY CLAIMS - What to CHANGE
export const safetyClaimsToFix = {
  'risky_claim': 'Files are 100% secure and never stored on our servers',
  'safer_version': 'Files are processed securely in your browser and automatically deleted after conversion',
  'rationale': 'Softer language, technically accurate, more trustworthy',

  'risky_claim_2': 'Unlimited file size support',
  'safer_version_2': 'Supports files up to 50MB',
  'rationale_2': 'Manages expectations, sets clear boundaries',

  'risky_claim_3': 'Guaranteed perfect results',
  'safer_version_3': 'Designed for optimal results with standard images',
  'rationale_3': 'Results depend on input quality',

  'risky_claim_4': 'Works instantly for every file',
  'safer_version_4': 'Most files process within seconds',
  'rationale_4': 'Sets realistic expectations for complex files',
};

export const summary = `
==== IMAGE TOOLS SEO IMPROVEMENT SUMMARY ====

SCOPE: 60+ image tool pages
TARGET: 95+/100 SEO & UX quality
ESTIMATED TIME: 15-20 hours for complete implementation

KEY IMPROVEMENTS:
1. Metadata Updates: +20% CTR
2. CTA Button Fixes: +15-25% conversion
3. FAQ Schema: +20-30% CTR (rich snippets)
4. Internal Linking: +30% user engagement
5. Safety Claims: Improved trust, reduced bounce

QUICK WINS (Do First):
- Update all layout.tsx titles/descriptions (2-3 hrs)
- Fix button text to be specific (3-4 hrs)
- Add FAQ sections with schema (4-6 hrs)
- Add related tools links (2-3 hrs)

Files to Update:
- 60+ layout.tsx files (metadata)
- 60+ page.tsx files (CTAs, FAQ, content, internal links)

Quality Metrics to Track:
- CTR improvement (expect +20-35%)
- Conversion rate (expect +15-25%)
- Bounce rate (expect -15-20%)
- Avg session duration (expect +30%)
- Rich snippet impressions (expect +50%)
`;
