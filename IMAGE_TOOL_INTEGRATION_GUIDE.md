# Image Tool Global Integration Guide

## Overview

SimplifyConvert has implemented a **systematic global validation and error handling architecture** for all 119 image tools. This guide explains how the system works and what tools need to do.

## Global Systems Already Active

### 1. **ImageUploader Component** (Automatic Validation)
Located: `app/components/ImageUploader.tsx`

✅ **Automatically validates on file select:**
- File empty check
- Extension validation (.jpg, .png, .webp, etc)
- MIME type validation
- File size validation (tool-specific limits)

**ALL tools using ImageUploader get validation automatically - no code changes needed.**

**Props:**
```tsx
<ImageUploader
  onFileSelect={handleFileSelect}
  preview={preview}
  onClearPreview={handleClearPreview}
  toolId="compress-image"  // NEW: Enables tool-specific file size limits
  onValidationError={(error) => setValidationError(error)}  // NEW: Callback for validation errors
/>
```

### 2. **Dynamic Layout** (Global Error Boundary)
Located: `app/all-tools/[slug]/layout.tsx`

✅ **Automatically active for all tools at `/all-tools/[tool-slug]/page.tsx`**

Features:
- Global unhandled exception tracking
- Global promise rejection handling
- Auto-reporting to `/api/image-tools/report-error`
- No tool setup required

### 3. **Tool Registry Metadata**
Located: `app/lib/image-tools-registry.ts`

Provides tool-specific configuration:
```ts
{
  id: 'compress-image',
  type: 'editor',  // converter | editor | ai | ocr | filter
  timeout: 30000,  // milliseconds
  maxFileSizeMB: 50,
  supportsTransparency: false,
}
```

## Integration Patterns

### Pattern A: Simple Tools (Converters, Filters)
**For tools that just upload → process → download**

```tsx
'use client';
import { useState } from 'react';
import { ImageUploader } from '../../components/ImageUploader';
import { useImageToolErrors } from '@/app/hooks/useImageToolErrors';
import { ErrorAlert } from '@/app/components/error-components';

const TOOL_ID = 'tool-slug';

export default function ToolPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<Blob | null>(null);
  const { error, clearError, createError } = useImageToolErrors();

  const handleProcess = async () => {
    if (!file) return;
    
    setProcessing(true);
    try {
      // Your processing logic here
      const result = await processImage(file);
      setResult(result.blob);
    } catch (err) {
      // Automatic error handling through hook
      createError(
        ImageToolErrorType.SHARP_FAILED,
        TOOL_ID,
        'Tool Name',
        { error: (err as Error).message },
        { filename: file.name, size: file.size, mimeType: file.type }
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {error && <ErrorAlert error={error} onDismiss={clearError} />}
      <ImageUploader 
        onFileSelect={setFile} 
        preview={preview} 
        onClearPreview={handleClear}
        toolId={TOOL_ID}
      />
      <button onClick={handleProcess} disabled={!file || processing}>
        Process
      </button>
    </>
  );
}
```

### Pattern B: Using Processing Wrapper (Recommended)
**For better error handling, timeouts, retries**

```tsx
import { withImageProcessing } from '@/app/utils/processing/image-processing-wrapper';

// Wrap your processing function
const safeProcessImage = withImageProcessing(
  async (file: File, quality: number) => {
    return await processImage(file, quality);
  },
  {
    toolId: 'compress-image',
    toolName: 'Image Compressor',
    timeout: 30000,
    retryCount: 1,
  }
);

// Use it
const result = await safeProcessImage(file, quality);
if (result.success) {
  setResult(result.data);
} else {
  createError(result.error.type, TOOL_ID, TOOL_NAME);
}
```

### Pattern C: Batch Processing
**For tools handling multiple files**

```tsx
import { withBatchImageProcessing } from '@/app/utils/processing/image-processing-wrapper';

const safeBatchCompress = withBatchImageProcessing(
  async (file: File) => await compressImage(file),
  {
    toolId: 'batch-compress-image',
    parallelLimit: 3,
    timeout: 30000,
  }
);

const { successful, failed } = await safeBatchCompress(files);
console.log(`${successful.length} succeeded, ${failed.length} failed`);
```

## What NOT to Do Anymore

❌ **Never use:**
```tsx
alert('Error: ' + error.message);
console.error('User error:', error);  // Don't log user-facing errors
throw new Error('User facing message');  // Don't throw - use error hook
```

✅ **Always use:**
```tsx
// For validation errors
const validationError = validateImageFileSize(file, toolId);
if (!validationError.valid) {
  createError(ImageToolErrorType.FILE_TOO_LARGE, toolId, toolName);
  return;
}

// For processing errors
try {
  const result = await processImage(file);
} catch (err) {
  createError(ImageToolErrorType.SHARP_FAILED, toolId, toolName, {}, fileMeta);
}
```

## Error Types Reference

See: `app/utils/types/errors.ts`

Common error types:
- `EMPTY_FILE` - File is 0 bytes
- `UNSUPPORTED_FORMAT` - File extension not supported
- `INVALID_MIME_TYPE` - MIME type doesn't match
- `FILE_TOO_LARGE` - Exceeds file size limit
- `INVALID_DIMENSIONS` - Image width/height invalid
- `SHARP_FAILED` - Image processing failed
- `PROCESSING_TIMEOUT` - Processing took too long
- `MEMORY_ERROR` - Out of memory
- And 40+ more...

## Validation Functions Reference

Located: `app/utils/validation/image-validation.ts`

```ts
// File validations
validateImageNotEmpty(file)
validateImageExtension(filename)
validateImageMimeType(file)
validateImageFileSize(file, toolId?)

// Dimension validations
validateImageDimensions(metadata)
validateResizeDimensions(width, height)

// Tool-specific validations
validateCompressionQuality(quality)
validateCropBounds(x, y, w, h, imgW, imgH)
validateWatermarkText(text)
validateQRCodeText(text)
// ... and more
```

## Error Reporting (Automatic)

### What Gets Reported?
✅ **Processing failures** → Email to info@simplifyconvert.com
❌ **Validation errors** → NOT emailed (user correctable)
❌ **Console errors** → NOT emailed

### Server-side Debouncing
The system prevents email spam:
- Max 1 email per 5 seconds per tool/error combo
- Max 10 emails per hour per error type
- Configurable in: `app/utils/error-reporting/send-error-email.ts`

## Testing Your Integration

```tsx
// 1. Test validation
await user.upload(new File([], 'test.pdf'));  // Should show error

// 2. Test file size
const largeFile = new File([new ArrayBuffer(100 * 1024 * 1024)], 'large.jpg');
await user.upload(largeFile);  // Should show "File too large"

// 3. Test processing failure
// Mock the processing function to throw error
// Should show user-friendly error, email should be sent

// 4. Test UI recovery
// After error, user should be able to retry without refreshing
```

## Migration Checklist for Existing Tools

For each tool page at `app/all-tools/[tool-slug]/page.tsx`:

- [ ] Import `useImageToolErrors` hook
- [ ] Import `ErrorAlert` component
- [ ] Add `const { error, clearError, createError } = useImageToolErrors();`
- [ ] Add `toolId` and `onValidationError` props to `<ImageUploader>`
- [ ] Display `{error && <ErrorAlert error={error} onDismiss={clearError} />}`
- [ ] Remove all `alert()` calls
- [ ] Wrap processing in try/catch with `createError()`
- [ ] Test with invalid inputs (PDF, zero-byte file, oversized file)
- [ ] Verify no browser console errors
- [ ] Run `npm run build` and `npm run lint`

## Auto-Integration Status

**Automatic (no changes needed):**
- ImageUploader validation
- Global error boundary
- Unhandled exception tracking

**Semi-automatic (add error display):**
- Most converter/filter/editor tools
- Using ImageUploader + hook + ErrorAlert

**Manual integration required:**
- AI tools (require custom API handling)
- OCR tools (special error types)
- Batch processing tools
- Canvas-based editors

## FAQ

**Q: Do I need to update all 119 tools?**
A: Tools using ImageUploader are 90% done. Just add error display component.

**Q: What if the processing function is in a shared utility?**
A: Wrap it with `withImageProcessing()` once, import the wrapped version.

**Q: How do I test error reporting?**
A: Trigger a processing error, check email at info@simplifyconvert.com, verify logs.

**Q: Can I customize error messages?**
A: Yes, pass `customUserMessage` to `createError()`.

**Q: What about multi-step tools (upload → edit → download)?**
A: Each step should have its own validation and error handling.

## Support

Questions? Check:
- Error types: `app/utils/types/errors.ts`
- Validation: `app/utils/validation/image-validation.ts`
- Hook: `app/hooks/useImageToolErrors.ts`
- Example: `app/components/examples/CompressImageToolExample.tsx`
