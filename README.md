# Image Tools Directory

A complete, responsive Image Tools directory page built with **Next.js 14**, **Tailwind CSS**, and **Lucide React**. Featuring a searchable catalog of 100+ image processing tools across AI/Editing and Converter categories.

## Features

✨ **Responsive Design**
- Mobile-first, 4-column grid layout
- Fully responsive across all screen sizes
- Clean white background with subtle borders

🔍 **Real-time Search**
- Instant filtering of tools by title, description, or category
- Full-width rounded search bar with blue search button
- Displays tool count

🎨 **Beautiful UI Components**
- Reusable ToolCard component with colorful icons
- Lucide React icons for each tool
- Smooth hover effects and transitions
- Professional TinyWow-inspired aesthetic

📦 **Comprehensive Tool Library**
- **26 AI/Editing Tools**: Image generation, background removal, upscaling, and more
- **54+ Converter Tools**: Format conversions (JPG, PNG, WebP, PDF, etc.)
- Organized with clear categories and descriptions

## Tech Stack

- **Next.js 14** - React framework for production
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **ESLint** - Code quality

## Project Structure

```
tinytools-app/
├── app/
│   ├── components/
│   │   └── ToolCard.tsx          # Reusable tool card component
│   ├── data/
│   │   └── tools.ts               # Tool definitions and data
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page with search & grid
├── public/                        # Static assets
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Navigate to the project:**
```bash
cd tinytools-app
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open in browser:**
Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create optimized production build
- `npm run start` - Run production server
- `npm run lint` - Run ESLint

## Component Details

### ToolCard Component (`app/components/ToolCard.tsx`)

Renders individual tool cards with:
- Colorful Lucide React icon
- Tool title
- Red "Image Tools" label
- Tool description
- Hover effects with smooth transitions
- Clean white background with subtle gray border

```tsx
interface ToolCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  category: string;
}
```

### Main Page (`app/page.tsx`)

Features:
- Large bold "Image Tools" header
- "Free Online Image Tools" subtitle
- Full-width rounded search input
- Real-time tool filtering
- Responsive 4-column grid
- Tool counter display

## Tool Categories

### AI/Editing (26 tools)
AI Image Generator, Remove Background, Upscale Image, Remove Watermark, Remove Objects, Profile Photo Maker, Blur Background, Remove Person, Unblur IMG, Cleanup Picture, Colorize Photo, Combine Images, Make Background Transparent, Crop Image, Make Round Image, Add Text, Black & White, Image Splitter, Add Images, Add Border, Translate Image, Reverse Image, Collage Maker, Flip Image, View Metadata, Chart Maker, Font Awesome to PNG

### Converters (54+ tools)
PDF to JPG, Image To Text (OCR), Compress Image, HEIC to JPG, WebP to JPG, PNG to JPG, and many more format conversions including:
- Image formats: JPG, PNG, WebP, HEIC, TIFF, GIF, EPS, PSD
- Vector formats: SVG, AI, EPS, VSDX, VSD
- Document formats: PDF, PPTX, DOCX
- Modern formats: AVIF, APNG

## Customization

### Modify Tool List
Edit `app/data/tools.ts` to add, remove, or modify tools:

```tsx
const newTool: Tool = {
  id: 'unique-id',
  title: 'Tool Name',
  description: 'Brief description',
  category: 'AI/Editing' | 'Converters',
  icon: IconComponent,
};
```

### Styling
Tailwind CSS configuration: `tailwind.config.ts`
Global styles: `app/globals.css`

### Color Scheme
- Primary: Blue (#2563eb)
- Accents: Red (#ef4444) for labels
- Background: Light gray (#f3f4f6)
- Cards: White with subtle borders

## Performance

- **Optimized**: Next.js 14 with Turbopack
- **Fast**: Pre-compiled TypeScript
- **Responsive**: Mobile-first CSS
- **Accessible**: Semantic HTML and ARIA labels

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- Add tool categories with filtering tabs
- Implement favorites/bookmarking
- Add tool descriptions modal
- Direct links to tool pages
- Analytics tracking
- User ratings/reviews
- API integration

## License

MIT

## Author

Created with Next.js 14, Tailwind CSS, and Lucide React
