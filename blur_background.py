#!/usr/bin/env python3
"""
Blur Background Tool - Professional Background Blur for Portrait Photography
Creates a sharp subject with beautifully blurred background (portrait mode effect).

Usage Examples:
    python blur_background.py --input photo.jpg --output blurred.jpg --blur 25
    python blur_background.py --input selfie.jpg --output portrait.jpg --blur 45 --feather 5
    python blur_background.py --input image.jpg --output portrait.jpg --blur 35 --feather 5 --portrait
"""

import argparse
import sys
import cv2
import numpy as np
from pathlib import Path
import traceback

print("[INFO] Importing PIL...")
try:
    from PIL import Image
    print("[OK] PIL imported")
except ImportError as e:
    print(f"[ERROR] Failed to import PIL: {e}")
    sys.exit(1)

print("[INFO] Importing rembg...")
try:
    from rembg import remove
    print("[OK] rembg imported")
except ImportError as e:
    print(f"[ERROR] Failed to import rembg: {e}")
    print("[TIP] Run: pip install rembg")
    sys.exit(1)


def load_image(image_path):
    """Load image from disk as BGR (OpenCV format)."""
    try:
        img = cv2.imread(str(image_path))
        if img is None:
            raise RuntimeError(f"Failed to load image: {image_path}")
        return img
    except Exception as e:
        raise RuntimeError(f"Error loading image: {e}")


def extract_foreground_with_alpha(image_path):
    """
    Extract foreground with alpha channel using rembg.
    
    Returns: PIL Image in RGBA mode
    """
    try:
        print(f"[INFO] Loading image: {image_path}")
        with open(image_path, 'rb') as f:
            input_data = f.read()
        print(f"[INFO] Image loaded: {len(input_data)} bytes")
        
        print("[INFO] Removing background with U2Net (30-60 seconds first run)...")
        output_data = remove(input_data)
        print(f"[INFO] Background removal complete: {len(output_data)} bytes")
        
        # Convert bytes to PIL Image
        from io import BytesIO
        img = Image.open(BytesIO(output_data))
        print(f"[INFO] Foreground extracted: {img.size} {img.mode}")
        
        return img
    except Exception as e:
        print(f"[ERROR] Background extraction failed: {e}")
        raise RuntimeError(f"Failed to extract foreground: {e}")


def refine_alpha_mask(alpha_channel, feather_radius=5):
    """
    Refine alpha channel for clean mask.
    
    Steps:
    1. Threshold to binary (0/255)
    2. Morphological close (fill small holes)
    3. Morphological open (remove small noise)
    4. Feather edges with Gaussian blur
    
    alpha_channel: numpy array (0-255)
    feather_radius: radius for feathering (3-7 typical)
    
    Returns: refined alpha channel (0-255)
    """
    print(f"[DEBUG] Refining alpha mask with feather_radius={feather_radius}px")
    
    # Step 1: Threshold to binary
    _, binary_alpha = cv2.threshold(alpha_channel, 128, 255, cv2.THRESH_BINARY)
    print(f"[DEBUG] Alpha thresholded to binary")
    
    # Step 2: Morphological operations to clean mask
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    
    # Close: fill small holes in foreground
    closed = cv2.morphologyEx(binary_alpha, cv2.MORPH_CLOSE, kernel, iterations=1)
    
    # Open: remove small noise
    opened = cv2.morphologyEx(closed, cv2.MORPH_OPEN, kernel, iterations=1)
    print(f"[DEBUG] Morphological operations complete")
    
    # Step 3: Feather edges for smooth transition
    # Apply stronger feathering based on radius
    blur_kernel_size = feather_radius * 2 + 1
    print(f"[DEBUG] Applying Gaussian blur to alpha with kernel size {blur_kernel_size}x{blur_kernel_size}")
    
    # Multiple passes for stronger, smoother feathering
    feathered = opened
    num_passes = 3 if feather_radius >= 5 else 2
    for i in range(num_passes):
        feathered = cv2.GaussianBlur(feathered, (blur_kernel_size, blur_kernel_size), 0)
        print(f"[DEBUG] Feathering pass {i+1}/{num_passes} complete")
    
    # Additional edge smoothing for very smooth transitions
    feathered = cv2.GaussianBlur(feathered, (3, 3), 0)
    
    print(f"[DEBUG] Feathering complete: {np.min(feathered)}-{np.max(feathered)} range")
    return feathered


def blur_background(image_cv, alpha_mask, blur_strength=35):
    """
    Blur the background using alpha mask.
    
    image_cv: BGR image (numpy array)
    alpha_mask: alpha channel (0-255)
    blur_strength: Gaussian blur kernel size (odd number, 15-51 typical)
    
    Returns: blurred background as BGR
    """
    # Ensure blur strength is odd
    if blur_strength % 2 == 0:
        blur_strength += 1
    
    print(f"[DEBUG] Blurring background with kernel size {blur_strength}x{blur_strength}")
    
    # Apply Gaussian blur to image with specified kernel
    blurred = cv2.GaussianBlur(image_cv, (blur_strength, blur_strength), 0)
    
    print(f"[DEBUG] Blur kernel applied successfully")
    
    return blurred


def composite_sharp_subject_blurred_background(
    original_cv, 
    foreground_pil, 
    alpha_mask, 
    blurred_bg, 
    apply_portrait_darkening=False
):
    """
    Composite: sharp foreground + blurred background.
    
    out = fg_rgb * (alpha/255) + blurred_bg * (1 - alpha/255)
    
    If portrait_darkening: multiply blurred background by 0.95 for subtle depth
    
    original_cv: original BGR image
    foreground_pil: PIL RGBA foreground
    alpha_mask: refined alpha (0-255)
    blurred_bg: blurred background
    apply_portrait_darkening: bool, add background darkening for portrait mode
    
    Returns: composited BGR image
    """
    print(f"[DEBUG] Compositing with alpha range: {np.min(alpha_mask)}-{np.max(alpha_mask)}")
    
    # Convert foreground to BGR for compositing
    fg_rgb = cv2.cvtColor(np.array(foreground_pil.convert('RGB')), cv2.COLOR_RGB2BGR)
    print(f"[DEBUG] Foreground shape: {fg_rgb.shape}, Blurred BG shape: {blurred_bg.shape}")
    
    # Normalize alpha to 0-1
    alpha_normalized = alpha_mask.astype(float) / 255.0
    
    # Expand alpha to 3 channels for BGR
    alpha_3ch = cv2.cvtColor(alpha_mask, cv2.COLOR_GRAY2BGR).astype(float) / 255.0
    
    print(f"[DEBUG] Alpha normalized range: {np.min(alpha_3ch)}-{np.max(alpha_3ch)}")
    
    # Darkening effect for background (optional portrait mode)
    bg_to_use = blurred_bg.copy()
    if apply_portrait_darkening:
        bg_to_use = (bg_to_use.astype(float) * 0.95).astype(np.uint8)
        print(f"[DEBUG] Portrait mode darkening applied (0.95 multiplier)")
    
    # Composite: foreground * alpha + background * (1 - alpha)
    # This ensures sharp subject where alpha is high, blurred bg where alpha is low
    composited = (
        fg_rgb.astype(float) * alpha_3ch +
        bg_to_use.astype(float) * (1.0 - alpha_3ch)
    ).astype(np.uint8)
    
    print(f"[DEBUG] Composite complete: {composited.shape}")
    
    return composited


def save_image(image_cv, output_path):
    """Save BGR image to disk."""
    try:
        cv2.imwrite(str(output_path), image_cv)
        return True
    except Exception as e:
        raise RuntimeError(f"Failed to save image: {e}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Blur Background - Professional portrait mode background blur',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python blur_background.py --input photo.jpg --output blurred.jpg --blur 25
  python blur_background.py --input selfie.jpg --output portrait.jpg --blur 45 --feather 5
  python blur_background.py --input image.jpg --output portrait.jpg --blur 35 --feather 5 --portrait

Recommended Settings:
  --blur 25 --feather 5 : Natural, subtle blur
  --blur 45 --feather 5 : Strong portrait look
  --blur 35 --feather 5 --portrait : Portrait mode with darkened background
        """
    )
    
    parser.add_argument('--input', required=True, help='Path to input image')
    parser.add_argument('--output', required=True, help='Path to output image')
    parser.add_argument('--blur', type=int, default=35,
                        help='Blur strength (15-51, default: 35). Higher = more blur')
    parser.add_argument('--feather', type=int, default=5,
                        help='Alpha feathering radius (3-7, default: 5). Controls edge smoothness')
    parser.add_argument('--portrait', action='store_true',
                        help='Enable portrait mode: darkens background slightly for depth effect')
    
    args = parser.parse_args()
    
    # Validate blur strength
    if args.blur < 15 or args.blur > 51:
        print("[ERROR] Blur strength must be between 15 and 51")
        return 1
    
    # Validate feather radius
    if args.feather < 3 or args.feather > 7:
        print("[ERROR] Feather radius must be between 3 and 7")
        return 1
    
    # Ensure blur is odd
    blur_to_use = args.blur if args.blur % 2 == 1 else args.blur + 1
    
    print(f"\n[CONFIG] Blur strength: {blur_to_use}px (kernel size {blur_to_use}x{blur_to_use})")
    print(f"[CONFIG] Feather radius: {args.feather}px")
    print(f"[CONFIG] Portrait mode: {args.portrait}")
    sys.stdout.flush()
    print()
    
    try:
        # Step 1: Load original image
        print("[1/7] Loading original image...")
        sys.stdout.flush()
        input_path = Path(args.input)
        if not input_path.exists():
            raise FileNotFoundError(f"Input image not found: {args.input}")
        
        original_image_cv = load_image(str(args.input))
        height, width = original_image_cv.shape[:2]
        print(f"  [OK] Image loaded: {width}x{height}")
        sys.stdout.flush()
        
        # Step 2: Extract foreground with alpha
        print("[2/7] Extracting foreground with alpha channel...")
        sys.stdout.flush()
        foreground_pil = extract_foreground_with_alpha(str(args.input))
        print(f"  [OK] Foreground extracted: {foreground_pil.size}")
        sys.stdout.flush()
        
        # Step 3: Refine alpha mask
        print(f"[3/7] Refining alpha mask (threshold + morphology + feather)...")
        sys.stdout.flush()
        alpha_channel = np.array(foreground_pil.split()[3])
        refined_alpha = refine_alpha_mask(alpha_channel, feather_radius=args.feather)
        print(f"  [OK] Alpha mask refined with {args.feather}px feathering")
        sys.stdout.flush()
        
        # Step 4: Create blurred background
        print(f"[4/7] Creating blurred background (blur strength: {args.blur})...")
        sys.stdout.flush()
        blurred_bg = blur_background(original_image_cv, refined_alpha, blur_strength=args.blur)
        print(f"  [OK] Background blurred with {args.blur}px Gaussian kernel")
        sys.stdout.flush()
        
        # Step 5: Composite sharp subject + blurred background
        print("[5/7] Compositing sharp subject with blurred background...")
        sys.stdout.flush()
        composite = composite_sharp_subject_blurred_background(
            original_image_cv,
            foreground_pil,
            refined_alpha,
            blurred_bg,
            apply_portrait_darkening=args.portrait
        )
        portrait_msg = " (with portrait darkening)" if args.portrait else ""
        print(f"  [OK] Composite complete{portrait_msg}")
        sys.stdout.flush()
        
        # Step 6: Save output
        print("[6/7] Saving output image...")
        sys.stdout.flush()
        save_image(composite, args.output)
        print(f"  [OK] Output saved: {args.output}")
        sys.stdout.flush()
        
        # Step 7: Summary
        print("[7/7] Complete!")
        sys.stdout.flush()
        print(f"\n[SUCCESS] Background blur applied!")
        print(f"[INFO] Input: {args.input} ({width}x{height})")
        print(f"[INFO] Output: {args.output}")
        print(f"[INFO] Blur strength: {args.blur}px")
        print(f"[INFO] Feather radius: {args.feather}px")
        if args.portrait:
            print(f"[INFO] Portrait mode: enabled (background darkened)")
        
        return 0
        
    except Exception as e:
        print(f"\n[ERROR] {e}", file=sys.stderr)
        print(f"\n[DEBUG TRACEBACK]")
        traceback.print_exc(file=sys.stdout)
        sys.stdout.flush()
        sys.stderr.flush()
        return 1


if __name__ == '__main__':
    sys.exit(main())
