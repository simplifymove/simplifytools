'use client';

import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import type {
  PdfEdit,
  ViewportData,
} from '@/app/types/pdf-editor';

import {
  normalizeBox,
  pdfToScreenCoords,
  screenToPdfCoords,
} from '@/app/lib/pdf-editor/coordinateUtils';

import {
  editToScreenRect,
  findTopmostEdit,
  getDrawingBounds,
  getResizeHandleAtPoint,
  moveEditFromSnapshot,
  resizeEditFromSnapshot,
  type ResizeHandle,
} from '@/app/lib/pdf-editor/interactionGeometry';

import {
  createMoveSession,
  createResizeSession,
  getTransformDelta,
  updateTransformPointer,
  type PdfTransformSession,
} from '@/app/lib/pdf-editor/transformSession';

import SelectionOverlay from './SelectionOverlay';

interface Props {
  pdfDoc: any;
  currentPage: number;
  zoom: number;
  edits: PdfEdit[];
  selectedEditId?: string;
  activeTool: string;
  shapeType?: string;
  drawingType?: string;
  strokeColor?: string;
  strokeWidth?: number;
  highlightColor?: string;
  currentImageData?: string;
  extractedText?: any[];
  editedTexts?: Record<string, string>;
  editingTextId?: string | null;
  onSelectEdit?: (id: string | undefined) => void;
  onUpdateEdit?: (id: string, updates: Partial<PdfEdit>) => void;
  onAddEdit?: (edit: PdfEdit) => void;
  onDeleteEdit?: (id: string) => void;
  onPan?: (x: number, y: number) => void;
  onTextClick?: (textId: string) => void;
  onTextEditChange?: (textId: string, newText: string) => void;
  onToolChange?: (tool: string) => void;
}

interface CanvasSize {
  width: number;
  height: number;
}

const DEFAULT_VIEWPORT: ViewportData = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  pageWidth: 612,
  pageHeight: 792,
};

const PDFCanvasV2Component = function PDFCanvasV2({
  pdfDoc,
  currentPage,
  zoom,
  edits,
  selectedEditId,
  activeTool,
  shapeType = 'rectangle',
  drawingType = 'pen',
  strokeColor = '#000000',
  strokeWidth = 2,
  highlightColor = 'rgba(255, 255, 0, 0.3)',
  onSelectEdit,
  onUpdateEdit,
  onAddEdit,
  onToolChange,
}: Props) {
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);

  const renderTaskRef = useRef<any>(null);

  const viewportRef = useRef<ViewportData>({
    ...DEFAULT_VIEWPORT,
  });

  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(
    new Map()
  );

  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    width: DEFAULT_VIEWPORT.pageWidth,
    height: DEFAULT_VIEWPORT.pageHeight,
  });

  const interactionSurfaceRef = useRef<HTMLDivElement>(null);

  const transformSessionRef = useRef<PdfTransformSession | null>(null);

  const creationStartRef = useRef<{ x: number; y: number } | null>(null);

  const drawingPointsRef = useRef<Array<{ x: number; y: number }>>([]);

  const [transientEdit, setTransientEdit] = useState<PdfEdit | null>(null);

  const [creationPreview, setCreationPreview] = useState<PdfEdit | null>(null);

  const [inlineTextEdit, setInlineTextEdit] = useState<{
    editId: string;
    value: string;
  } | null>(null);

  /*
   * ----------------------------------------------------------
   * IMAGE CACHE
   * ----------------------------------------------------------
   */

  useEffect(() => {
    const imageEdits = edits.filter(
      (edit) =>
        (edit.type === 'image' || edit.type === 'signature') &&
        edit.imageData
    );

    for (const edit of imageEdits) {
      if (!edit.imageData) continue;

      const existing = imageCacheRef.current.get(edit.id);

      if (existing?.src === edit.imageData) {
        continue;
      }

      const image = new Image();

      image.onload = () => {
        renderEditsRef.current();
      };

      image.src = edit.imageData;

      imageCacheRef.current.set(edit.id, image);
    }

    const activeIds = new Set(imageEdits.map((edit) => edit.id));

    for (const id of imageCacheRef.current.keys()) {
      if (!activeIds.has(id)) {
        imageCacheRef.current.delete(id);
      }
    }
  }, [edits]);

  /*
   * ----------------------------------------------------------
   * PDF.JS BASE PAGE
   * ----------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;
    let localRenderTask: any = null;

    const renderPage = async () => {
      if (!pdfDoc || !baseCanvasRef.current) {
        return;
      }

      if (
        currentPage < 1 ||
        !pdfDoc.numPages ||
        currentPage > pdfDoc.numPages
      ) {
        return;
      }

      try {
        if (renderTaskRef.current?.cancel) {
          try {
            renderTaskRef.current.cancel();
          } catch {
            // Ignore cancellation races.
          }
        }

        const page = await pdfDoc.getPage(currentPage);

        if (!mounted) return;

        const viewport = page.getViewport({
          scale: zoom,
        });

        const width = Math.ceil(viewport.width);
        const height = Math.ceil(viewport.height);

        /*
         * V2 coordinate contract:
         *
         * edit geometry is stored in unscaled PDF-page coordinates.
         * viewport.scale is the only zoom multiplier.
         *
         * pageWidth/pageHeight remain in PDF coordinates rather than
         * storing already-scaled viewport dimensions.
         */
        viewportRef.current = {
          scale: zoom,
          offsetX: 0,
          offsetY: 0,
          pageWidth: viewport.width / zoom,
          pageHeight: viewport.height / zoom,
        };

        const canvas = baseCanvasRef.current;

        canvas.width = width;
        canvas.height = height;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const context = canvas.getContext('2d');

        if (!context || !mounted) {
          return;
        }

        localRenderTask = page.render({
          canvasContext: context,
          viewport,
        });

        renderTaskRef.current = localRenderTask;

        await localRenderTask.promise;

        if (!mounted) return;

        renderTaskRef.current = null;

        setCanvasSize({
          width,
          height,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        if (
          mounted &&
          !message.toLowerCase().includes('cancel')
        ) {
          console.error(
            '[PDFCanvasV2] Failed to render PDF page:',
            error
          );
        }
      }
    };

    void renderPage();

    return () => {
      mounted = false;

      if (localRenderTask?.cancel) {
        try {
          localRenderTask.cancel();
        } catch {
          // Ignore cancellation races.
        }
      }

      if (renderTaskRef.current === localRenderTask) {
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage, zoom]);

  /*
   * ----------------------------------------------------------
   * EDIT RENDER HELPERS
   * ----------------------------------------------------------
   */

  const renderText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      edit: PdfEdit,
      x: number,
      y: number
    ) => {
      const width = edit.width * zoom;
      const height = edit.height * zoom;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x, y, width, height);

      ctx.fillStyle = edit.fontColor || '#000000';

      const fontSize = Math.max(
        1,
        (edit.fontSize || 16) * zoom
      );

      const fontFamily = edit.fontFamily || 'Arial';

      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textBaseline = 'top';

      const text = edit.text || '';

      ctx.fillText(
        text,
        x,
        y,
        Math.max(1, width)
      );
    },
    [zoom]
  );

  const renderWhiteout = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      edit: PdfEdit,
      x: number,
      y: number
    ) => {
      ctx.fillStyle = '#ffffff';

      ctx.fillRect(
        x,
        y,
        edit.width * zoom,
        edit.height * zoom
      );
    },
    [zoom]
  );

  const renderShape = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      edit: PdfEdit,
      x: number,
      y: number
    ) => {
      const width = edit.width * zoom;
      const height = edit.height * zoom;

      ctx.strokeStyle =
        edit.strokeColor || '#000000';

      ctx.lineWidth = Math.max(
        0.5,
        (edit.strokeWidth || 2) * zoom
      );

      if (
        edit.fillColor &&
        edit.fillColor !== 'transparent'
      ) {
        ctx.fillStyle = edit.fillColor;
      }

      const shapeType =
        edit.shapeType || 'rectangle';

      ctx.beginPath();

      if (shapeType === 'circle') {
        ctx.ellipse(
          x + width / 2,
          y + height / 2,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0,
          0,
          Math.PI * 2
        );
      } else if (shapeType === 'line') {
        ctx.moveTo(x, y);
        ctx.lineTo(
          x + width,
          y + height
        );
      } else {
        ctx.rect(
          x,
          y,
          width,
          height
        );
      }

      if (
        shapeType !== 'line' &&
        edit.fillColor &&
        edit.fillColor !== 'transparent'
      ) {
        ctx.fill();
      }

      ctx.stroke();
    },
    [zoom]
  );

  const renderHighlight = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      edit: PdfEdit,
      x: number,
      y: number
    ) => {
      ctx.fillStyle =
        edit.fillColor ||
        'rgba(255, 255, 0, 0.3)';

      ctx.fillRect(
        x,
        y,
        edit.width * zoom,
        edit.height * zoom
      );
    },
    [zoom]
  );

  const renderDrawing = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      edit: PdfEdit
    ) => {
      if (!edit.points || edit.points.length < 2) {
        return;
      }

      ctx.strokeStyle =
        edit.strokeColor || '#000000';

      ctx.lineWidth = Math.max(
        0.5,
        (edit.strokeWidth || 2) * zoom
      );

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (edit.drawingType === 'highlighter') {
        ctx.globalAlpha =
          Math.min(
            ctx.globalAlpha,
            0.3
          );
      }

      ctx.beginPath();

      edit.points.forEach((point, index) => {
        const screenPoint = pdfToScreenCoords(
          point.x,
          point.y,
          viewportRef.current
        );

        if (index === 0) {
          ctx.moveTo(
            screenPoint.x,
            screenPoint.y
          );
        } else {
          ctx.lineTo(
            screenPoint.x,
            screenPoint.y
          );
        }
      });

      ctx.stroke();
    },
    [zoom]
  );

  const renderImage = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      edit: PdfEdit,
      x: number,
      y: number
    ) => {
      const image =
        imageCacheRef.current.get(edit.id);

      if (
        !image ||
        !image.complete ||
        image.naturalWidth === 0
      ) {
        return;
      }

      ctx.drawImage(
        image,
        x,
        y,
        edit.width * zoom,
        edit.height * zoom
      );
    },
    [zoom]
  );

  const renderLink = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      edit: PdfEdit,
      x: number,
      y: number
    ) => {
      ctx.save();

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = Math.max(1, zoom);
      ctx.setLineDash([
        5 * zoom,
        3 * zoom,
      ]);

      ctx.strokeRect(
        x,
        y,
        edit.width * zoom,
        edit.height * zoom
      );

      ctx.restore();
    },
    [zoom]
  );

  /*
   * ----------------------------------------------------------
   * EDIT LAYER
   * ----------------------------------------------------------
   */

  const renderEdits = useCallback(() => {
    const canvas = editCanvasRef.current;

    if (!canvas) {
      return;
    }

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    canvas.style.width =
      `${canvasSize.width}px`;

    canvas.style.height =
      `${canvasSize.height}px`;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    const pageEdits = edits
      .filter(
        (edit) =>
          edit.pageNumber === currentPage
      )
      .map((edit) =>
        transientEdit && edit.id === transientEdit.id
          ? transientEdit
          : edit
      )
      .concat(
        creationPreview && creationPreview.pageNumber === currentPage
          ? [creationPreview]
          : []
      )
      .slice()
      .sort(
        (a, b) =>
          (a.zIndex || 0) -
          (b.zIndex || 0)
      );

    for (const edit of pageEdits) {
      const coords = pdfToScreenCoords(
        edit.x,
        edit.y,
        viewportRef.current
      );

      ctx.save();

      ctx.globalAlpha =
        edit.opacity ?? 1;

      switch (edit.type) {
        case 'text':
          renderText(
            ctx,
            edit,
            coords.x,
            coords.y
          );
          break;

        case 'whiteout':
          renderWhiteout(
            ctx,
            edit,
            coords.x,
            coords.y
          );
          break;

        case 'shape':
          renderShape(
            ctx,
            edit,
            coords.x,
            coords.y
          );
          break;

        case 'highlight':
          renderHighlight(
            ctx,
            edit,
            coords.x,
            coords.y
          );
          break;

        case 'drawing':
          renderDrawing(
            ctx,
            edit
          );
          break;

        case 'image':
        case 'signature':
          renderImage(
            ctx,
            edit,
            coords.x,
            coords.y
          );
          break;

        case 'link':
          renderLink(
            ctx,
            edit,
            coords.x,
            coords.y
          );
          break;
      }

      ctx.restore();
    }
  }, [
    canvasSize,
    currentPage,
    edits,
    transientEdit,
    creationPreview,
    renderDrawing,
    renderHighlight,
    renderImage,
    renderLink,
    renderShape,
    renderText,
    renderWhiteout,
  ]);

  const renderEditsRef = useRef(
    () => {}
  );

  useEffect(() => {
    renderEditsRef.current =
      renderEdits;
  }, [renderEdits]);

  useEffect(() => {
    renderEdits();
  }, [renderEdits]);

  /*
   * ----------------------------------------------------------
   * SELECTION
   * ----------------------------------------------------------
   */

  const selectedEdit =
    selectedEditId
      ? transientEdit && transientEdit.id === selectedEditId
        ? transientEdit
        : edits.find(
            (edit) =>
              edit.id === selectedEditId &&
              edit.pageNumber === currentPage
          )
      : undefined;

  const selectionRect =
    selectedEdit
      ? editToScreenRect(
          selectedEdit,
          viewportRef.current
        )
      : null;

  const inlineTextTarget =
    inlineTextEdit
      ? edits.find(
          (edit) =>
            edit.id === inlineTextEdit.editId &&
            edit.pageNumber === currentPage &&
            edit.type === 'text'
        )
      : undefined;

  const inlineTextRect =
    inlineTextTarget
      ? editToScreenRect(
          inlineTextTarget,
          viewportRef.current
        )
      : null;

  const commitInlineText = () => {
    if (!inlineTextEdit) {
      return;
    }

    onUpdateEdit?.(
      inlineTextEdit.editId,
      {
        text: inlineTextEdit.value,
        updatedAt: Date.now(),
      }
    );

    setInlineTextEdit(null);
  };

  const getPointerCoordinates = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const surface = interactionSurfaceRef.current;

      if (!surface) {
        return null;
      }

      const rect = surface.getBoundingClientRect();

      const screenPoint = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      const pdfPoint = screenToPdfCoords(
        screenPoint.x,
        screenPoint.y,
        viewportRef.current
      );

      return {
        screenPoint,
        pdfPoint,
      };
    },
    []
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      const coordinates = getPointerCoordinates(event);

      if (!coordinates) {
        return;
      }

      const { screenPoint, pdfPoint } = coordinates;

      const surface = interactionSurfaceRef.current;

      surface?.setPointerCapture(event.pointerId);

      const currentSelectedEdit =
        selectedEditId
          ? edits.find(
              (edit) =>
                edit.id === selectedEditId &&
                edit.pageNumber === currentPage
            )
          : undefined;

      if (activeTool === 'select') {
        if (currentSelectedEdit) {
          const screenRect = editToScreenRect(
            currentSelectedEdit,
            viewportRef.current
          );

          const resizeHandle = getResizeHandleAtPoint(
            screenPoint,
            screenRect,
            14
          );

          if (resizeHandle) {
            transformSessionRef.current = createResizeSession(
              currentSelectedEdit,
              resizeHandle,
              event.pointerId,
              pdfPoint
            );

            setTransientEdit({
              ...currentSelectedEdit,
              points: currentSelectedEdit.points?.map((point) => ({ ...point })),
            });

            event.preventDefault();
            return;
          }
        }

        const targetEdit = findTopmostEdit(
          edits,
          currentPage,
          pdfPoint
        );

        if (targetEdit) {
          onSelectEdit?.(targetEdit.id);

          transformSessionRef.current = createMoveSession(
            targetEdit,
            event.pointerId,
            pdfPoint
          );

          setTransientEdit({
            ...targetEdit,
            points: targetEdit.points?.map((point) => ({ ...point })),
          });

          event.preventDefault();
          return;
        }

        onSelectEdit?.(undefined);
        setTransientEdit(null);

        return;
      }

      if (activeTool === 'drawing') {
        drawingPointsRef.current = [
          { x: pdfPoint.x, y: pdfPoint.y },
        ];

        const now = Date.now();

        setCreationPreview({
          id: '__creation_preview__',
          type: 'drawing',
          pageNumber: currentPage,
          x: pdfPoint.x,
          y: pdfPoint.y,
          width: 1,
          height: 1,
          zIndex: 999999,
          createdAt: now,
          updatedAt: now,
          drawingType: drawingType as any,
          strokeColor,
          strokeWidth,
          points: [{ x: pdfPoint.x, y: pdfPoint.y }],
        });

        event.preventDefault();
        return;
      }

      if (
        activeTool === 'text' ||
        activeTool === 'shape' ||
        activeTool === 'highlight' ||
        activeTool === 'whiteout'
      ) {
        creationStartRef.current = {
          x: pdfPoint.x,
          y: pdfPoint.y,
        };

        const now = Date.now();

        setCreationPreview({
          id: '__creation_preview__',
          type: activeTool,
          pageNumber: currentPage,
          x: pdfPoint.x,
          y: pdfPoint.y,
          width: 1,
          height: 1,
          zIndex: 999999,
          createdAt: now,
          updatedAt: now,
          ...(activeTool === 'text'
            ? {
                text: '',
                fontSize: 16,
                fontColor: '#000000',
                fontFamily: 'Arial',
                opacity: 1,
              }
            : {}),
          ...(activeTool === 'shape'
            ? {
                shapeType: shapeType as any,
                strokeColor,
                strokeWidth,
              }
            : {}),
          ...(activeTool === 'highlight'
            ? {
                fillColor: highlightColor,
                opacity: 0.35,
              }
            : {}),
        });

        event.preventDefault();
      }
    },
    [
      activeTool,
      currentPage,
      drawingType,
      edits,
      getPointerCoordinates,
      highlightColor,
      onSelectEdit,
      selectedEditId,
      shapeType,
      strokeColor,
      strokeWidth,
    ]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const coordinates = getPointerCoordinates(event);

      if (!coordinates) {
        return;
      }

      const { pdfPoint } = coordinates;

      const session = transformSessionRef.current;

      if (
        session &&
        session.pointerId === event.pointerId
      ) {
        const nextSession = updateTransformPointer(
          session,
          pdfPoint
        );

        transformSessionRef.current = nextSession;

        const delta = getTransformDelta(nextSession);

        if (nextSession.mode === 'move') {
          const result = moveEditFromSnapshot(
            nextSession.snapshot,
            delta.x,
            delta.y,
            viewportRef.current.pageWidth,
            viewportRef.current.pageHeight
          );

          setTransientEdit(result.edit);
        } else if (
          nextSession.mode === 'resize' &&
          nextSession.handle
        ) {
          const result = resizeEditFromSnapshot(
            nextSession.snapshot,
            nextSession.handle,
            delta.x,
            delta.y,
            4
          );

          setTransientEdit(result.edit);
        }

        event.preventDefault();
        return;
      }

      if (
        activeTool === 'drawing' &&
        drawingPointsRef.current.length > 0
      ) {
        const previous =
          drawingPointsRef.current[
            drawingPointsRef.current.length - 1
          ];

        const distance = Math.hypot(
          pdfPoint.x - previous.x,
          pdfPoint.y - previous.y
        );

        if (distance >= 0.75) {
          drawingPointsRef.current.push({
            x: pdfPoint.x,
            y: pdfPoint.y,
          });

          const bounds = getDrawingBounds(
            drawingPointsRef.current,
            strokeWidth
          );

          if (bounds) {
            const now = Date.now();

            setCreationPreview({
              id: '__creation_preview__',
              type: 'drawing',
              pageNumber: currentPage,
              x: bounds.x,
              y: bounds.y,
              width: bounds.width,
              height: bounds.height,
              zIndex: 999999,
              createdAt: now,
              updatedAt: now,
              drawingType: drawingType as any,
              strokeColor,
              strokeWidth,
              points: drawingPointsRef.current.map((point) => ({ ...point })),
            });
          }
        }

        event.preventDefault();
        return;
      }

      if (
        creationStartRef.current &&
        (
          activeTool === 'text' ||
          activeTool === 'shape' ||
          activeTool === 'highlight' ||
          activeTool === 'whiteout'
        )
      ) {
        const box = normalizeBox(
          creationStartRef.current.x,
          creationStartRef.current.y,
          pdfPoint.x,
          pdfPoint.y
        );

        const now = Date.now();

        setCreationPreview({
          id: '__creation_preview__',
          type: activeTool,
          pageNumber: currentPage,
          x: box.x,
          y: box.y,
          width: Math.max(1, box.width),
          height: Math.max(1, box.height),
          zIndex: 999999,
          createdAt: now,
          updatedAt: now,
          ...(activeTool === 'text'
            ? {
                text: '',
                fontSize: 16,
                fontColor: '#000000',
                fontFamily: 'Arial',
                opacity: 1,
              }
            : {}),
          ...(activeTool === 'shape'
            ? {
                shapeType: shapeType as any,
                strokeColor,
                strokeWidth,
              }
            : {}),
          ...(activeTool === 'highlight'
            ? {
                fillColor: highlightColor,
                opacity: 0.35,
              }
            : {}),
        });

        event.preventDefault();
      }
    },
    [
      activeTool,
      currentPage,
      drawingType,
      getPointerCoordinates,
      highlightColor,
      shapeType,
      strokeColor,
      strokeWidth,
    ]
  );

  const finishPointerInteraction = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const surface = interactionSurfaceRef.current;

      if (surface?.hasPointerCapture(event.pointerId)) {
        surface.releasePointerCapture(event.pointerId);
      }

      const session = transformSessionRef.current;

      if (
        session &&
        session.pointerId === event.pointerId
      ) {
        if (transientEdit) {
          const {
            id,
            ...nextEdit
          } = transientEdit;

          onUpdateEdit?.(
            id,
            nextEdit
          );
        }

        transformSessionRef.current = null;
        setTransientEdit(null);

        event.preventDefault();
        return;
      }

      if (
        activeTool === 'drawing' &&
        drawingPointsRef.current.length > 1
      ) {
        const bounds = getDrawingBounds(
          drawingPointsRef.current,
          strokeWidth
        );

        if (bounds) {
          const now = Date.now();

          const newEdit: PdfEdit = {
            id: `drawing-${now}-${Math.random().toString(36).slice(2, 8)}`,
            type: 'drawing',
            pageNumber: currentPage,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            zIndex: Date.now(),
            createdAt: now,
            updatedAt: now,
            drawingType: drawingType as any,
            strokeColor,
            strokeWidth,
            points: drawingPointsRef.current.map((point) => ({ ...point })),
          };

          onAddEdit?.(newEdit);
          onSelectEdit?.(newEdit.id);
          onToolChange?.('select');
        }

        drawingPointsRef.current = [];
        setCreationPreview(null);

        event.preventDefault();
        return;
      }

      if (
        creationStartRef.current &&
        creationPreview &&
        creationPreview.width >= 2 &&
        creationPreview.height >= 2
      ) {
        const now = Date.now();

        const newEdit: PdfEdit = {
          ...creationPreview,
          id: `${creationPreview.type}-${now}-${Math.random().toString(36).slice(2, 8)}`,
          zIndex: Date.now(),
          createdAt: now,
          updatedAt: now,
        };

        onAddEdit?.(newEdit);
        onSelectEdit?.(newEdit.id);
        onToolChange?.('select');

        if (newEdit.type === 'text') {
          setInlineTextEdit({
            editId: newEdit.id,
            value: newEdit.text || '',
          });
        }
      }

      creationStartRef.current = null;
      drawingPointsRef.current = [];
      setCreationPreview(null);
    },
    [
      activeTool,
      creationPreview,
      currentPage,
      drawingType,
      onAddEdit,
      onSelectEdit,
      onUpdateEdit,
      strokeColor,
      strokeWidth,
      transientEdit,
    ]
  );

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-auto bg-slate-950">
      <div className="m-auto flex min-h-full min-w-full items-center justify-center p-2 md:p-3">
        <div
          ref={interactionSurfaceRef}
          className="relative touch-none overflow-hidden bg-white shadow-2xl"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            cursor:
              activeTool === 'select'
                ? selectedEditId
                  ? 'move'
                  : 'default'
                : activeTool === 'drawing'
                  ? 'crosshair'
                  : 'crosshair',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointerInteraction}
          onPointerCancel={finishPointerInteraction}
        >
          <canvas
            ref={baseCanvasRef}
            className="absolute inset-0 block"
          />

          <canvas
            ref={editCanvasRef}
            className="pointer-events-none absolute inset-0 block"
          />

          {selectionRect && (
            <SelectionOverlay
              x={selectionRect.x}
              y={selectionRect.y}
              width={selectionRect.width}
              height={selectionRect.height}
            />
          )}

          {inlineTextEdit && inlineTextRect && (
            <textarea
              autoFocus
              value={inlineTextEdit.value}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onPointerMove={(event) => {
                event.stopPropagation();
              }}
              onChange={(event) => {
                const value = event.target.value;

                setInlineTextEdit((current) =>
                  current
                    ? {
                        ...current,
                        value,
                      }
                    : current
                );
              }}
              onBlur={commitInlineText}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  (event.ctrlKey || event.metaKey)
                ) {
                  event.preventDefault();
                  commitInlineText();
                }

                if (event.key === 'Escape') {
                  event.preventDefault();
                  setInlineTextEdit(null);
                }
              }}
              className="absolute z-30 resize-none overflow-auto border-2 border-orange-500 bg-white/95 p-1 text-gray-950 shadow-lg outline-none"
              style={{
                left: inlineTextRect.x,
                top: inlineTextRect.y,
                width: Math.max(80, inlineTextRect.width),
                height: Math.max(36, inlineTextRect.height),
                fontSize: `${Math.max(
                  10,
                  (inlineTextTarget?.fontSize || 16) *
                    viewportRef.current.scale
                )}px`,
                fontFamily:
                  inlineTextTarget?.fontFamily || 'Arial',
                color:
                  inlineTextTarget?.fontColor || '#000000',
              }}
              placeholder="Type textâ€¦"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const PDFCanvasV2 =
  memo(PDFCanvasV2Component);

export default PDFCanvasV2;
