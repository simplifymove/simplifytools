# Copilot Instructions for Image Tools Project

## Project Overview

This is a Next.js 14 project that creates a complete Image Tools directory page with a responsive grid layout, searchable tool catalog, and beautiful UI components. The project uses TypeScript, Tailwind CSS, and Lucide React icons.

## Project Structure

- **app/page.tsx** - Main page with header, search bar, and tool grid
- **app/components/ToolCard.tsx** - Reusable component for displaying individual tools
- **app/data/tools.ts** - Central data file containing all 100+ tools
- **app/layout.tsx** - Root layout configuration
- **app/globals.css** - Global styles
- **tailwind.config.ts** - Tailwind CSS configuration
- **package.json** - Dependencies and scripts

## Key Features

- **Responsive Grid**: 4-column layout on desktop, adapts to mobile
- **Real-time Search**: Filter tools by title, description, or category
- **Tool Categories**: AI/Editing (26 tools) and Converters (54+ tools)
- **Beautiful Icons**: Uses Lucide React for consistent iconography
- **Professional Design**: Clean white cards with subtle borders and hover effects

## Development Workflow

### To Modify Tools

1. Open **app/data/tools.ts**
2. Add/edit tools in the `aiEditingTools` or `converterTools` arrays
3. Each tool includes: id, title, description, category, and icon
4. Changes are applied in real-time with hot reload

### To Customize Styling

1. **Colors**: Modify Tailwind classes in components
   - Primary blue: `bg-blue-600`, `text-blue-500`
   - Accent red: `text-red-500` (for labels)
   - Background: `bg-gray-50`, `bg-white`

2. **Layout**: Edit grid configuration in app/page.tsx
   - Grid columns: `lg:grid-cols-4` (adjustable)
   - Spacing: `gap-4`, `px-4 md:px-8`, etc.

### To Add New Features

- **New component**: Create in `app/components/`
- **New page**: Create a folder with `page.tsx` in `app/`
- **Styling**: Use Tailwind utility classes
- **Icons**: Import from `lucide-react`

## Common Tasks

### Add a New Tool

```typescript
{
  id: 'unique-id',
  title: 'Tool Name',
  description: 'What it does',
  category: 'AI/Editing' | 'Converters',
  icon: IconName,
}
```

### Change Grid Layout

In `app/page.tsx`, modify the grid class:
```tsx
{/* Current 4-column on large screens */}
lg:grid-cols-4
{/* Change to 3-column: lg:grid-cols-3 */}
{/* Change to 5-column: lg:grid-cols-5 */}
```

### Add Search Filters by Category

Modify the filtered tools logic in `app/page.tsx` to add category tabs or dropdown filters.

### Customize Colors

Edit Tailwind theme in `tailwind.config.ts` for global color changes.

## Dependencies

- **next**: ^16.1.6 - React framework
- **react**: ^18 - UI library
- **tailwindcss**: Latest - CSS framework
- **lucide-react**: Latest - Icon library
- **typescript**: Latest - Type safety
- **eslint**: Latest - Code quality

## Scripts

```bash
npm run dev      # Start dev server (port 3000)
npm run build    # Create production build
npm run start    # Run production server
npm run lint     # Check code quality
```

## Deployment

The project is ready to deploy to:
- **Vercel** (recommended) - `npm run build && npm run start`
- **Docker** - Create Dockerfile for containerization
- **Traditional servers** - `npm run build` creates `.next/` output

## Performance Considerations

- Uses Next.js 14 with Turbopack for fast compilation
- CSS is pre-processed by Tailwind
- Type checking runs automatically
- Icons are optimized SVGs from Lucide
- No external API calls in current version

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari 14+
- Edge (latest)

## Known Limitations

- Currently no database (tools are hardcoded)
- Search is client-side only
- No authentication or user accounts
- Icons are from Lucide library only

## Future Enhancements

Consider adding:
- Database integration for tool data
- Category filtering tabs
- Favorites/bookmarking system
- Direct tool links/navigation
- Analytics tracking
- Tool detail pages
- User testimonials
- API for tool queries

## Troubleshooting

**Issue**: Build errors
- **Solution**: Run `npm install` to ensure dependencies are installed

**Issue**: Styles not appearing
- **Solution**: Verify Tailwind is configured in `tailwind.config.ts`

**Issue**: Icons not showing
- **Solution**: Check Lucide React import in `app/data/tools.ts`

**Issue**: Search not working
- **Solution**: Ensure `app/page.tsx` has `'use client'` directive at the top

## Contact & Support

For issues or questions about the project structure, refer to the README.md file or Next.js documentation at https://nextjs.org/docs
