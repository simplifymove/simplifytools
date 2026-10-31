import type { PdfEdit, Point } from '@/app/types/pdf-editor';
import type { ResizeHandle } from './interactionGeometry';

export type TransformMode =
  | 'move'
  | 'resize';

export interface PdfTransformSession {
  editId: string;
  mode: TransformMode;
  handle?: ResizeHandle;

  pointerId: number;

  startPointerPdf: Point;
  latestPointerPdf: Point;

  snapshot: PdfEdit;
}

export function createMoveSession(
  edit: PdfEdit,
  pointerId: number,
  pointer: Point
): PdfTransformSession {
  return {
    editId: edit.id,
    mode: 'move',
    pointerId,
    startPointerPdf: { ...pointer },
    latestPointerPdf: { ...pointer },
    snapshot: {
      ...edit,
      points: edit.points?.map((point) => ({ ...point })),
    },
  };
}

export function createResizeSession(
  edit: PdfEdit,
  handle: ResizeHandle,
  pointerId: number,
  pointer: Point
): PdfTransformSession {
  return {
    editId: edit.id,
    mode: 'resize',
    handle,
    pointerId,
    startPointerPdf: { ...pointer },
    latestPointerPdf: { ...pointer },
    snapshot: {
      ...edit,
      points: edit.points?.map((point) => ({ ...point })),
    },
  };
}

export function updateTransformPointer(
  session: PdfTransformSession,
  pointer: Point
): PdfTransformSession {
  return {
    ...session,
    latestPointerPdf: { ...pointer },
  };
}

export function getTransformDelta(
  session: PdfTransformSession
): Point {
  return {
    x:
      session.latestPointerPdf.x -
      session.startPointerPdf.x,
    y:
      session.latestPointerPdf.y -
      session.startPointerPdf.y,
  };
}
