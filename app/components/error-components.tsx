/**
 * Error & Validation UI Components
 * Reusable error display and validation feedback components
 */

'use client';

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { ToolError } from '@/app/utils/types/errors';

interface ErrorAlertProps {
  error: ToolError | string | null;
  onDismiss?: () => void;
  showDetails?: boolean;
  className?: string;
}

/**
 * Main error alert component
 */
export function ErrorAlert({ error, onDismiss, showDetails = false, className = '' }: ErrorAlertProps) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.userFriendlyMessage;
  const details = typeof error !== 'string' ? error.details : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        w-full bg-red-50 border-l-4 border-red-500 p-4 rounded-lg
        shadow-sm flex gap-3 items-start
        ${className}
      `}
    >
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-red-800 text-sm">Processing Failed</h3>
        <p className="text-red-700 text-sm mt-1 break-words">{message}</p>
        
        {showDetails && details && (
          <div className="mt-3 text-xs text-red-600 bg-white rounded p-2 border border-red-200">
            <details className="cursor-pointer">
              <summary className="font-semibold hover:text-red-700">Additional Details</summary>
              <pre className="mt-2 overflow-auto max-h-40 whitespace-pre-wrap">
                {JSON.stringify(details, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-red-400 hover:text-red-600 transition"
          aria-label="Dismiss error"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

interface ValidationErrorsProps {
  errors: string[];
  onDismiss?: () => void;
  className?: string;
}

/**
 * Validation errors list component
 */
export function ValidationErrors({ errors, onDismiss, className = '' }: ValidationErrorsProps) {
  if (!errors || errors.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        w-full bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg
        shadow-sm
        ${className}
      `}
    >
      <div className="flex gap-3 items-start">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 text-sm mb-2">
            {errors.length === 1 ? 'Validation Error' : 'Validation Errors'}
          </h3>
          
          <ul className="space-y-1">
            {errors.map((error, idx) => (
              <li key={idx} className="text-amber-700 text-sm flex gap-2">
                <span className="text-amber-500 flex-shrink-0">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface SuccessAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Success message component
 */
export function SuccessAlert({ message, onDismiss, className = '' }: SuccessAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        w-full bg-green-50 border-l-4 border-green-500 p-4 rounded-lg
        shadow-sm flex gap-3 items-start
        ${className}
      `}
    >
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      
      <div className="flex-1">
        <p className="text-green-700 text-sm font-medium">{message}</p>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-green-400 hover:text-green-600 transition"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}

interface InfoAlertProps {
  message: string;
  className?: string;
}

/**
 * Info message component
 */
export function InfoAlert({ message, className = '' }: InfoAlertProps) {
  return (
    <div
      className={`
        w-full bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg
        shadow-sm flex gap-3 items-start
        ${className}
      `}
    >
      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <p className="text-blue-700 text-sm">{message}</p>
    </div>
  );
}

interface FileUploadHelpProps {
  acceptedFormats: string[];
  maxSizeMB: number;
  toolName: string;
}

/**
 * File upload guidance component
 */
export function FileUploadHelp({ acceptedFormats, maxSizeMB, toolName }: FileUploadHelpProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm text-gray-600 space-y-2">
      <p className="font-semibold text-gray-700">Upload Requirements:</p>
      <ul className="space-y-1 ml-4">
        <li>✓ Supported formats: {acceptedFormats.join(', ')}</li>
        <li>✓ Maximum file size: {maxSizeMB}MB</li>
        <li>✓ Drag & drop or browse to upload</li>
        <li>✓ Your files are processed securely and not stored</li>
      </ul>
    </div>
  );
}

interface ProcessingProgressProps {
  progress: number;
  status: string;
  isVisible: boolean;
}

/**
 * Processing progress indicator
 */
export function ProcessingProgress({ progress, status, isVisible }: ProcessingProgressProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{status}</p>
        <span className="text-sm font-semibold text-gray-600">{progress}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  );
}

interface RetryButtonProps {
  onRetry: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Retry button component
 */
export function RetryButton({ onRetry, isLoading, className = '' }: RetryButtonProps) {
  return (
    <motion.button
      onClick={onRetry}
      disabled={isLoading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium
        hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
        transition duration-200 flex items-center gap-2
        ${className}
      `}
    >
      {isLoading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
        />
      )}
      {isLoading ? 'Retrying...' : 'Try Again'}
    </motion.button>
  );
}

interface DragDropZoneProps {
  isDragging: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (files: FileList) => void;
  children?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Drag & drop zone component
 */
export function DragDropZone({
  isDragging,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  children,
  disabled,
}: DragDropZoneProps) {
  const handleDrop = (e: React.DragEvent) => {
    onDrop(e.dataTransfer.files);
  };

  return (
    <motion.div
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={handleDrop}
      animate={{
        borderColor: isDragging ? '#3b82f6' : '#d1d5db',
        backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
      }}
      transition={{ duration: 0.2 }}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center
        transition duration-200 cursor-pointer
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </motion.div>
  );
}
