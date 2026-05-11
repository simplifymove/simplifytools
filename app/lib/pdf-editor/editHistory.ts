/**
 * Edit History System
 * Manages undo/redo stack for PDF editor changes
 */

import { PdfEdit } from '@/app/types/pdf-editor';

export interface HistorySnapshot {
  edits: PdfEdit[];
  timestamp: number;
  action: string;
}

export class EditHistory {
  private undoStack: HistorySnapshot[] = [];
  private redoStack: HistorySnapshot[] = [];
  private maxStackSize: number = 100;

  /**
   * Push a new state onto the undo stack
   */
  push(edits: PdfEdit[], action: string = 'Edit'): void {
    const snapshot: HistorySnapshot = {
      edits: JSON.parse(JSON.stringify(edits)), // Deep copy
      timestamp: Date.now(),
      action,
    };

    this.undoStack.push(snapshot);

    // Clear redo stack when new action is performed
    this.redoStack = [];

    // Limit stack size to prevent memory issues
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
  }

  /**
   * Undo the last action
   */
  undo(): HistorySnapshot | null {
    if (!this.canUndo()) return null;

    // Get the current state before undoing
    const currentEdits = this.undoStack[this.undoStack.length - 1];

    // If we're at the original state, we need to track it
    if (this.undoStack.length === 1) {
      // Push current state to redo before removing
      this.redoStack.push(currentEdits);
      this.undoStack.pop();
      return null; // Return to initial state
    }

    // Move current to redo
    const toRedo = this.undoStack.pop();
    if (toRedo) {
      this.redoStack.push(toRedo);
    }

    // Return the previous state
    const previous = this.undoStack[this.undoStack.length - 1];
    return previous || null;
  }

  /**
   * Redo the last undone action
   */
  redo(): HistorySnapshot | null {
    if (!this.canRedo()) return null;

    const toUndoAgain = this.redoStack.pop();
    if (toUndoAgain) {
      this.undoStack.push(toUndoAgain);
      return toUndoAgain;
    }

    return null;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get the last action description
   */
  getLastAction(): string {
    if (this.undoStack.length === 0) return '';
    return this.undoStack[this.undoStack.length - 1].action;
  }

  /**
   * Get the next redo action description
   */
  getNextRedoAction(): string {
    if (this.redoStack.length === 0) return '';
    return this.redoStack[this.redoStack.length - 1].action;
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Get the size of undo stack
   */
  getUndoCount(): number {
    return this.undoStack.length;
  }

  /**
   * Get the size of redo stack
   */
  getRedoCount(): number {
    return this.redoStack.length;
  }
}
