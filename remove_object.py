#!/usr/bin/env python3
"""
Remove Object Tool - MVP Implementation
Uses OpenCV inpainting to remove masked objects from images.

Usage Examples:
    python remove_object.py --input image.jpg --mask mask.png --output result.jpg
    python remove_object.py --input image.jpg --mask mask.png --output result.jpg --method ns
    python remove_object.py --input image.jpg --mask mask.png --output result.jpg --radius 5
"""

import argparse
import sys
import cv2
import numpy as np
from pathlib import Path


def validate_input_files(input_path, mask_path):
    """
    Validate that input and mask files exist and are readable.
    
    Args:
        input_path (str): Path to the input image
        mask_path (str): Path to the mask image
        
    Returns:
        tuple: (input_path, mask_path) as Path objects
        
    Raises:
        FileNotFoundError: If input or mask file doesn't exist
    """
    input_file = Path(input_path)
    mask_file = Path(mask_path)
    
    if not input_file.exists():
        raise FileNotFoundError(f"Input image not found: {input_path}")
    if not mask_file.exists():
        raise FileNotFoundError(f"Mask image not found: {mask_path}")
    
    return input_file, mask_file


def load_images(input_path, mask_path):
    """
    Load input image and mask from disk.
    
    Args:
        input_path (str): Path to the input image
        mask_path (str): Path to the mask image
        
    Returns:
        tuple: (image, mask) as numpy arrays
        
    Raises:
        RuntimeError: If image loading fails
    """
    try:
        image = cv2.imread(str(input_path), cv2.IMREAD_COLOR)
        if image is None:
            raise RuntimeError(f"Failed to load image: {input_path}")
        
        mask = cv2.imread(str(mask_path), cv2.IMREAD_GRAYSCALE)
        if mask is None:
            raise RuntimeError(f"Failed to load mask: {mask_path}")
        
        return image, mask
    except Exception as e:
        raise RuntimeError(f"Error loading images: {e}")


def validate_dimensions(image, mask):
    """
    Validate that image and mask have the same width and height.
    
    Args:
        image (np.ndarray): Input image
        mask (np.ndarray): Mask image
        
    Raises:
        ValueError: If dimensions don't match
    """
    img_height, img_width = image.shape[:2]
    mask_height, mask_width = mask.shape[:2]
    
    if (img_height, img_width) != (mask_height, mask_width):
        raise ValueError(
            f"Image and mask dimensions don't match. "
            f"Image: {img_width}x{img_height}, Mask: {mask_width}x{mask_height}"
        )


def preprocess_mask(mask):
    """
    Preprocess the mask with sophisticated morphological operations:
    - Ensure single channel
    - Threshold to binary (0 or 255)
    - Apply morphological closing to fill small holes
    - Dilate to ensure edges are fully covered
    - Apply median blur for smooth edges
    
    Args:
        mask (np.ndarray): Input mask
        
    Returns:
        np.ndarray: Preprocessed mask
    """
    # Convert to grayscale if needed
    if len(mask.shape) == 3:
        mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)
    
    # Threshold to binary: values < 127 become 0, >= 127 become 255
    _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    
    # Apply morphological closing to fill small holes
    kernel_close = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel_close, iterations=1)
    
    # Apply morphological opening to remove small noise
    kernel_open = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel_open, iterations=1)
    
    # Dilate to ensure edges are fully covered
    kernel_dilate = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    mask = cv2.dilate(mask, kernel_dilate, iterations=3)
    
    # Apply median blur for smooth, natural edges
    mask = cv2.medianBlur(mask, 5)
    
    # Re-threshold after blur to ensure binary
    _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
    
    return mask


def inpaint_image(image, mask, radius, method):
    """
    Apply inpainting to remove masked regions.
    
    Args:
        image (np.ndarray): Input image (BGR)
        mask (np.ndarray): Binary mask where 255 = remove, 0 = keep
        radius (int): Inpainting radius in pixels
        method (str): 'telea' or 'ns' (Navier-Stokes)
        
    Returns:
        np.ndarray: Inpainted image
        
    Raises:
        ValueError: If method is invalid
    """
    if method.lower() == 'telea':
        inpaint_method = cv2.INPAINT_TELEA
    elif method.lower() == 'ns':
        inpaint_method = cv2.INPAINT_NS
    else:
        raise ValueError(f"Invalid inpainting method: {method}. Use 'telea' or 'ns'")
    
    result = cv2.inpaint(image, mask, radius, inpaint_method)
    return result


def get_mask_coverage(mask):
    """
    Calculate what percentage of the mask is white (255).
    
    Args:
        mask (np.ndarray): Binary mask
        
    Returns:
        float: Percentage of masked pixels (0-100)
    """
    total_pixels = mask.size
    masked_pixels = np.count_nonzero(mask)
    return (masked_pixels / total_pixels) * 100


def create_debug_overlay(image, mask, output_path):
    """
    Create a debug overlay showing the mask over the original image.
    Useful for verifying the mask is correct.
    
    Args:
        image (np.ndarray): Original image (BGR)
        mask (np.ndarray): Binary mask
        output_path (str): Path to save debug overlay
    """
    # Convert mask to 3-channel for overlay
    mask_3ch = cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR)
    
    # Create overlay: red = masked area
    overlay = image.copy()
    overlay[mask == 255] = [0, 0, 255]  # Red for masked areas
    
    # Blend
    result = cv2.addWeighted(image, 0.7, overlay, 0.3, 0)
    
    cv2.imwrite(output_path, result)
    return result


def save_image(image, output_path):
    """
    Save image to disk.
    
    Args:
        image (np.ndarray): Image to save
        output_path (str): Output file path
        
    Returns:
        bool: True if successful
        
    Raises:
        RuntimeError: If save fails
    """
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    success = cv2.imwrite(str(output_file), image)
    if not success:
        raise RuntimeError(f"Failed to save image to: {output_path}")
    
    return True


def main():
    """Main entry point for the Remove Object tool."""
    parser = argparse.ArgumentParser(
        description='Remove objects from images using inpainting',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python remove_object.py --input image.jpg --mask mask.png --output result.jpg
  python remove_object.py --input image.jpg --mask mask.png --output result.jpg --method ns
  python remove_object.py --input image.jpg --mask mask.png --output result.jpg --radius 5 --method telea
        """
    )
    
    parser.add_argument(
        '--input',
        required=True,
        help='Path to input image'
    )
    parser.add_argument(
        '--mask',
        required=True,
        help='Path to mask image (white=255 for regions to remove, black=0 to keep)'
    )
    parser.add_argument(
        '--output',
        required=True,
        help='Path to output image'
    )
    parser.add_argument(
        '--method',
        default='telea',
        choices=['telea', 'ns'],
        help='Inpainting method: telea (faster, default) or ns (Navier-Stokes, sometimes smoother)'
    )
    parser.add_argument(
        '--radius',
        type=int,
        default=3,
        help='Inpainting radius in pixels (default: 3)'
    )
    
    args = parser.parse_args()
    
    try:
        # Validate input files exist
        print("[1/6] Validating input files...")
        input_path, mask_path = validate_input_files(args.input, args.mask)
        print(f"  [OK] Input: {input_path}")
        print(f"  [OK] Mask: {mask_path}")
        
        # Load images
        print("[2/6] Loading images...")
        image, mask = load_images(args.input, args.mask)
        print(f"  [OK] Image loaded: {image.shape}")
        print(f"  [OK] Mask loaded: {mask.shape}")
        
        # Validate dimensions match
        print("[3/6] Validating dimensions...")
        validate_dimensions(image, mask)
        print(f"  [OK] Dimensions match: {image.shape[1]}x{image.shape[0]}")
        
        # Preprocess mask
        print("[4/6] Preprocessing mask...")
        mask = preprocess_mask(mask)
        
        # Calculate mask coverage
        coverage = get_mask_coverage(mask)
        print(f"  [OK] Mask coverage: {coverage:.2f}% of image will be inpainted")
        
        if coverage > 15:
            print(f"  [WARNING] High mask coverage ({coverage:.2f}%). OpenCV inpaint may produce poor results.")
            print(f"  [TIP] For large areas, consider using LaMa or Stable Diffusion inpaint instead.")
        
        # Create debug overlay (to verify mask is correct)
        debug_overlay_path = str(Path(args.output).parent / f"debug_mask_preview_{Path(args.output).stem}.jpg")
        create_debug_overlay(image, mask, debug_overlay_path)
        print(f"  [OK] Debug overlay saved: {debug_overlay_path}")
        
        # Run inpainting
        print(f"[5/6] Running inpainting (method={args.method}, radius={args.radius})...")
        result = inpaint_image(image, mask, args.radius, args.method)
        print(f"  [OK] Inpainting complete")
        
        # Save result
        print("[6/6] Saving output...")
        save_image(result, args.output)
        print(f"  [OK] Output saved: {args.output}")
        
        print("\n[SUCCESS] Object removal complete.")
        print(f"[DEBUG] Masked area: {coverage:.2f}%")
        print(f"[DEBUG] Inpaint method: {args.method}")
        print(f"[DEBUG] Inpaint radius: {args.radius}px")
        return 0
        
    except FileNotFoundError as e:
        print(f"\n[ERROR] {e}", file=sys.stderr)
        return 1
    except ValueError as e:
        print(f"\n[ERROR] {e}", file=sys.stderr)
        return 1
    except RuntimeError as e:
        print(f"\n[ERROR] {e}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"\n[ERROR] Unexpected error: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
