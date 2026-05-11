# Full-Featured PDF Editor Implementation Plan

## Overview
Rebuild the Edit PDF tool to support multiple editing capabilities (text, images, shapes, signatures, whiteout, etc.) with a professional Sejda-like interface using our own design system.

## Architecture

### 1. Core Data Model
```typescript
// Edit types
type EditType = 'text' | 'image' | 'shape' | 'whiteout' | 'highlight' | 'signature' | 'drawing' | 'link';

type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';
type DrawingType = 'pen' | 'highlighter' | 'strikethrough' | 'underline';

interface PdfEdit {
  id: string;
  type: EditType;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  opacity?: number;
  zIndex: number;
  locked?: boolean;
  
  // Type-specific data
  text?: string;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  
  imageUrl?: string;
  preserveAspectRatio?: boolean;
  
  shapeType?: ShapeType;
  drawingType?: DrawingType;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  
  points?: Array<{x: number; y: number}>; // For drawing/path tools
  
  linkTarget?: string; // URL or page number
  linkType?: 'external' | 'internal';
  
  createdAt: number;
  updatedAt: number;
}

interface PdfEditorState {
  edits: PdfEdit[];
  selectedEditId?: string;
  currentPage: number;
  zoom: number;
  undoStack: PdfEdit[][];
  redoStack: PdfEdit[][];
}
```

### 2. File Structure
```
app/
├── components/
│   ├── PdfEditor/
│   │   ├── PdfEditor.tsx (main component)
│   │   ├── PDFCanvas.tsx (page rendering)
│   │   ├── Toolbar.tsx (top tools)
│   │   ├── Sidebar.tsx (page thumbnails + edit list)
│   │   ├── PropertiesPanel.tsx (right panel)
│   │   ├── tools/
│   │   │   ├── useTool.ts (hook for tool state)
│   │   │   ├── TextTool.tsx
│   │   │   ├── ImageTool.tsx
│   │   │   ├── WhiteoutTool.tsx
│   │   │   ├── SignatureTool.tsx
│   │   │   ├── DrawingTool.tsx
│   │   │   ├── ShapeTool.tsx
│   │   │   ├── HighlightTool.tsx
│   │   │   ├── LinkTool.tsx
│   │   │   └── SelectTool.tsx
│   │   └── utils/
│   │       ├── coordinateUtils.ts
│   │       ├── pdfExport.ts
│   │       ├── editHistory.ts
│   │       └── textExtraction.ts
├── all-tools/pdf/edit-pdf/
│   ├── page.tsx (updated with new editor)
│   └── layout.tsx (kept)
└── api/pdf/
    └── edit-pdf-export/route.ts (new export endpoint)
```

## Phase-by-Phase Implementation

### Phase 1: Core Infrastructure (Week 1)
- [x] Create edit model and data structures
- [ ] Implement coordinate conversion utilities
- [ ] Build edit history system (undo/redo)
- [ ] Create tool hook system
- [ ] Build canvas rendering with edit overlays

### Phase 2: UI Shell (Week 1)
- [ ] Create main PdfEditor layout (toolbar, sidebar, canvas, properties)
- [ ] Build Toolbar component with tool buttons
- [ ] Build Sidebar with page thumbnails
- [ ] Build PropertiesPanel for selected object
- [ ] Implement tool switching

### Phase 3: Basic Tools (Week 2)
- [ ] Text tool (add new text)
- [ ] Whiteout tool (white rectangle)
- [ ] Drawing/Pen tool
- [ ] Shape tools (rectangle, circle)
- [ ] Selection tool (move, resize, delete)

### Phase 4: Advanced Tools (Week 2)
- [ ] Image upload and placement
- [ ] Signature tool (draw + type + upload)
- [ ] Highlight tool
- [ ] Link tool
- [ ] Existing text editing (detection + whiteout + overlay)

### Phase 5: Export & Polish (Week 3)
- [ ] Implement PDF export with all edits
- [ ] Add undo/redo keyboard shortcuts
- [ ] Mobile responsive UI
- [ ] Performance optimization
- [ ] Testing and bug fixes

## Component Details

### PdfEditor.tsx (Main Component)
- Manages global state (edits, selectedId, zoom, page)
- Handles file upload and PDF.js initialization
- Coordinates between sub-components
- Implements undo/redo

### PDFCanvas.tsx
- Renders PDF page using pdf.js
- Renders edit overlays on top
- Handles zoom and pan
- Converts mouse coordinates to PDF coordinates
- Detects click targets for selection

### Toolbar.tsx
- Tool buttons (Select, Text, Image, Whiteout, Signature, Draw, Shape, Highlight, Link)
- Zoom controls (fit, zoom in/out, zoom %)
- Page navigation
- Undo/Redo buttons
- Save & Download button

### Sidebar.tsx
- Page thumbnails with navigation
- Edit list showing all edits per page
- Delete/duplicate edit options
- Lock/unlock edit controls

### PropertiesPanel.tsx
- Shows properties of selected edit
- Text: font, size, color, bold, italic, alignment
- Image: preserve aspect ratio, opacity
- Shapes: stroke color, width, fill
- Drawing: stroke width, color
- All: position, size, rotation, opacity, z-index, delete

## Key Utilities

### coordinateUtils.ts
```typescript
interface ViewportData {
  scale: number;
  offsetX: number;
  offsetY: number;
  pageWidth: number;
  pageHeight: number;
}

function screenToPdfCoords(x: number, y: number, viewport: ViewportData): {x: number; y: number}
function pdfToScreenCoords(x: number, y: number, viewport: ViewportData): {x: number; y: number}
function normalizeRect(rect: DOMRect): {x: number; y: number; width: number; height: number}
```

### editHistory.ts
```typescript
class EditHistory {
  undo()
  redo()
  push(edits: PdfEdit[])
  canUndo(): boolean
  canRedo(): boolean
}
```

### pdfExport.ts
```typescript
async function exportPdfWithEdits(
  originalPdf: ArrayBuffer,
  edits: PdfEdit[],
  pageCount: number
): Promise<Blob>
```

## Dependencies to Add
```json
{
  "pdf-lib": "^1.17.1",
  "pdfjs-dist": "^3.11.174",
  "react-dnd": "^16.0.1",
  "react-dnd-html5-backend": "^16.0.1"
}
```

## Implementation Strategy

### Immediate Tasks (Next session)
1. Keep existing PdfTextEditor working but rename to "SimplePdfEditor"
2. Create new PdfEditor component with full feature set
3. Route edit-pdf page to use new PdfEditor
4. Implement Select tool + text overlay rendering
5. Implement coordinate conversion

### Short-term (Next 2 weeks)
6. Build toolbar and sidebar UI
7. Implement each tool one at a time
8. Add undo/redo
9. Implement PDF export

### SEO & Documentation
- Update page metadata with keywords
- Add FAQ schema
- Document API changes
- Create user guide

## Known Limitations
- Existing PDF text editing is approximate (text + whiteout + overlay)
- Form field detection depends on PDF structure
- Some PDFs may have text encoded as images (not editable)
- Performance may vary with very large PDFs (>100 pages)

## Success Criteria
- ✅ PDF renders without errors
- ✅ All tools functional
- ✅ Export creates valid PDF
- ✅ Undo/redo works smoothly
- ✅ Responsive on mobile
- ✅ No memory leaks
- ✅ Performance acceptable (< 2s to save)

## Timeline
- Phase 1: 2 days
- Phase 2: 1 day
- Phase 3: 3 days
- Phase 4: 3 days
- Phase 5: 2 days
- **Total: ~2 weeks**
