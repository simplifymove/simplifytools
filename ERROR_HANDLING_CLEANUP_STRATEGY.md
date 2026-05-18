# Image Tool Error Handling Cleanup Strategy

## Summary Statistics

Based on grep analysis of `app/all-tools/*/page.tsx`:

- **Tools with `alert()` statements:** 4 tools (batch-resize-images, batch-compress-images, blur-image)
- **Tools with `console.error()` statements:** 20+ tools (canvas-based editors, converters)
- **Tools with `throw new Error()` statements:** 3 tools (blur-background, jpg-to-tiff, gif-to-mp4)
- **Total files affected:** ~25 tool pages

## Priority 1: Replace alert() statements (4 tools)

### Pattern: Simple Alert to Error Hook

**Files affected:**
1. `app/all-tools/batch-resize-images/page.tsx`
2. `app/all-tools/batch-compress-images/page.tsx`
3. `app/all-tools/blur-image/page.tsx`

**Pattern to replace:**
```tsx
// BEFORE
catch (error) {
  alert('Error processing images: ' + (error as Error).message);
  return;
}

// AFTER
catch (error) {
  createError(
    ImageToolErrorType.SHARP_FAILED,
    TOOL_ID,
    'Tool Name',
    { error: (error as Error).message },
    { filename: file?.name, size: file?.size, mimeType: file?.type }
  );
  return;
}
```

**Setup required (add to each tool):**
```tsx
const TOOL_ID = 'tool-slug-here';
const TOOL_NAME = 'Tool Display Name';
const { error, clearError, createError } = useImageToolErrors();
```

**Error display:**
```tsx
{error && <ErrorAlert error={error} onDismiss={clearError} />}
```

## Priority 2: Replace throw new Error() statements (3 tools)

### Pattern: Thrown Error to Error Hook

**Files affected:**
1. `app/all-tools/blur-background/page.tsx` (line 70)
2. `app/all-tools/jpg-to-tiff/page.tsx` (line 57)
3. `app/all-tools/gif-to-mp4/page.tsx` (line 54)

**Pattern to replace:**
```tsx
// BEFORE
if (!response.ok) {
  const data = await response.json();
  throw new Error(data.error || 'Processing failed');
}

// AFTER
if (!response.ok) {
  const data = await response.json();
  const errorType = data.error?.includes('timeout') 
    ? ImageToolErrorType.PROCESSING_TIMEOUT 
    : ImageToolErrorType.SHARP_FAILED;
  createError(errorType, TOOL_ID, TOOL_NAME);
  return;
}
```

## Priority 3: Replace console.error() statements (20+ tools)

### Pattern 1: Canvas Processing Errors

**Affected tools:** white-balance, add-opacity, duotone-effect, blur-zoom, cartoon-effect, brightness-contrast, color-balance, chromatic-aberration, dream-effect, color-grader

**Pattern:**
```tsx
// BEFORE
} catch (error) {
  console.error('Error applying blur zoom:', error);
}

// AFTER
} catch (error) {
  createError(
    ImageToolErrorType.CANVAS_RENDERING_FAILED,
    TOOL_ID,
    TOOL_NAME,
    { error: (error as Error).message }
  );
}
```

### Pattern 2: Blob Creation Errors

**Common in canvas tools:**
```tsx
// BEFORE
canvas.toBlob((blob) => {
  // ...
}, (error) => {
  console.error('Failed to create blob');
});

// AFTER
canvas.toBlob((blob) => {
  // ...
}, (error) => {
  createError(
    ImageToolErrorType.FILE_GENERATION_FAILED,
    TOOL_ID,
    TOOL_NAME,
    { error: 'Canvas blob creation failed' }
  );
});
```

### Pattern 3: Image Loading Errors

```tsx
// BEFORE
img.onerror = () => {
  console.error('Error loading image');
};

// AFTER
img.onerror = () => {
  createError(
    ImageToolErrorType.FILE_CORRUPTED,
    TOOL_ID,
    TOOL_NAME,
    { error: 'Image failed to load' }
  );
};
```

## Implementation Order

### Phase 1: Critical Tools (HIGH PRIORITY)
1. ✅ batch-resize-images - Replace 2x alert()
2. ✅ batch-compress-images - Replace 1x alert()
3. ✅ blur-image - Replace 1x alert()
4. ✅ blur-background - Replace 1x throw
5. ✅ jpg-to-tiff - Replace 1x throw
6. ✅ gif-to-mp4 - Replace 1x throw

**Expected time:** 30 minutes (6 files × 5 min each)

### Phase 2: Canvas Tools (MEDIUM PRIORITY)
1. white-balance - Replace 4x console.error()
2. add-opacity - Replace 4x console.error()
3. duotone-effect - Replace 4x console.error()
4. blur-zoom - Replace 4x console.error()
5. cartoon-effect - Replace 4x console.error()
6. brightness-contrast - Replace 4x console.error()
7. color-balance - Replace 4x console.error()
8. chromatic-aberration - Replace 4x console.error()
9. dream-effect - Replace 4x console.error()
10. color-grader - Replace 4x console.error()

**Expected time:** 90 minutes (10 files × 9 min each)

### Phase 3: Remaining Tools (LOW PRIORITY)
1. add-images - Replace 2x console.error()
2. All other console.error() instances

**Expected time:** 60 minutes

## Verification Checklist

After each replacement:
- [ ] Tool imports `useImageToolErrors` hook
- [ ] Tool defines `TOOL_ID` and `TOOL_NAME` constants
- [ ] Tool includes `const { error, clearError, createError } = useImageToolErrors();`
- [ ] Tool displays `{error && <ErrorAlert error={error} onDismiss={clearError} />}`
- [ ] All `alert()` removed
- [ ] All relevant `console.error()` replaced with `createError()`
- [ ] All `throw new Error()` replaced with `createError()` + `return`
- [ ] Tool compiles: `npm run build`
- [ ] Tool has no TypeScript errors

## Automated Approach (Optional)

Could also create a script:
```bash
# For each tool directory:
find app/all-tools -name "page.tsx" -exec sed -i \
  -e "s/alert('/createError(/g" \
  -e "s/console\.error(/\/\/ Log removed - use error hook instead: console.error(/g" \
  {} \;
```

However, manual approach is safer as it allows verification of context and correct error types.

## Success Criteria

- ✅ 0x alert() statements remaining
- ✅ 0x `throw new Error()` statements for user-facing errors
- ✅ All console.error() in error paths replaced with createError()
- ✅ npm run build passes
- ✅ npm run lint passes
- ✅ All 119 image tools follow consistent error pattern
- ✅ Error reporting sends 2+ real processing errors to email

## Next Steps

1. Start with Phase 1 (6 critical files)
2. Verify build passes
3. Continue with Phase 2 (10 canvas tools)
4. Verify build and lint pass
5. Complete Phase 3 (remaining tools)
6. Generate final integration report
