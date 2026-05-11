/**
 * PDF Editor Types and Interfaces
 * Defines the complete data model for the PDF editing system
 */

// Tool types
export type ToolType = 'select' | 'text' | 'image' | 'whiteout' | 'highlight' | 'signature' | 'drawing' | 'shape' | 'link' | 'form';

export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow';
export type DrawingType = 'pen' | 'highlighter' | 'strikethrough' | 'underline';

// Edit object interface - represents any edit/annotation on a PDF
export interface PdfEdit {
  id: string;
  type: 'text' | 'image' | 'shape' | 'whiteout' | 'highlight' | 'signature' | 'drawing' | 'link';
  pageNumber: number;
  
  // Position and dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  
  // Transform properties
  rotation?: number;
  opacity?: number;
  zIndex: number;
  locked?: boolean;
  
  // Text edit specific
  text?: string;
  fontSize?: number;
  fontColor?: string;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  alignment?: 'left' | 'center' | 'right';
  
  // Image edit specific
  imageUrl?: string;
  imageData?: string; // base64 data
  preserveAspectRatio?: boolean;
  
  // Shape/drawing specific
  shapeType?: ShapeType;
  drawingType?: DrawingType;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  points?: Array<{ x: number; y: number }>; // For drawing paths
  
  // Link specific
  linkTarget?: string; // URL or page number
  linkType?: 'external' | 'internal';
  
  // Metadata
  createdAt: number;
  updatedAt: number;
}

// Editor state interface
export interface PdfEditorState {
  edits: PdfEdit[];
  selectedEditId?: string;
  currentPage: number;
  totalPages: number;
  zoom: number;
  panX: number;
  panY: number;
  activeTool: ToolType;
  isDirty: boolean;
}

// Viewport data for coordinate conversion
export interface ViewportData {
  scale: number;
  offsetX: number;
  offsetY: number;
  pageWidth: number;
  pageHeight: number;
  rotation?: number;
}

// Rectangle type for bounds calculations
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Point type
export interface Point {
  x: number;
  y: number;
}

// Tool context for tools to interact with editor
export interface ToolContext {
  state: PdfEditorState;
  addEdit: (edit: PdfEdit) => void;
  updateEdit: (id: string, updates: Partial<PdfEdit>) => void;
  deleteEdit: (id: string) => void;
  selectEdit: (id: string | undefined) => void;
  getViewportData: () => ViewportData;
}

// Drawing context for canvas operations
export interface DrawingContext {
  ctx: CanvasRenderingContext2D;
  viewport: ViewportData;
  zoom: number;
}

// Tool mode (for tools like text that have multiple modes)
export type TextToolMode = 'add' | 'edit';
export type ShapeToolMode = 'draw' | 'select';
