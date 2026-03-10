#!/usr/bin/env python3
"""
Unblur Image Tool - Image Enhancement & Motion Deblur
Enhances blurry images using enhancement pipeline or motion deconvolution.
"""

import cv2
import numpy as np
from PIL import Image
import argparse
import sys
from pathlib import Path


def ensure_3_channel(img):
    """Ensure image is 3-channel BGR"""
    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    elif img.shape[2] == 4:
        img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
    return img


def calculate_blur_score(img):
    """Calculate blur score using Laplacian variance (lower = more blurry)"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return laplacian_var


def denoise_image(img, strength=10):
    """Apply non-local means denoising"""
    if strength < 1:
        return img
    
    # Adjust strength based on input (1-30 typical range)
    h = max(3, int(strength))
    # Use positional arguments for compatibility with different OpenCV versions
    denoised = cv2.fastNlMeansDenoisingColored(
        img,
        None,
        h,  # h parameter
        h,  # hForColorComponents parameter
        7,  # templateWindowSize
        21  # searchWindowSize
    )
    return denoised


def apply_clahe(img, clahe_strength=2.0):
    """Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) on L channel"""
    if clahe_strength < 0.1:
        return img
    
    # Convert to LAB color space
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    
    # Apply CLAHE to L channel
    clahe = cv2.createCLAHE(clipLimit=clahe_strength * 2, tileGridSize=(8, 8))
    l = clahe.apply(l)
    
    # Merge back
    lab = cv2.merge([l, a, b])
    result = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    return result


def unsharp_mask(img, strength=1.2):
    """Apply unsharp mask sharpening with high-pass filter"""
    if strength < 0.1:
        return img
    
    # Use a smaller blur for more aggressive sharpening
    blurred = cv2.GaussianBlur(img, (3, 3), 0.5)
    
    # Unsharp mask formula: output = input + (input - blurred) * strength
    sharpened = cv2.addWeighted(img, 1.0 + strength, blurred, -strength, 0)
    
    # Clip to valid range
    sharpened = np.clip(sharpened, 0, 255).astype(np.uint8)
    
    # Apply additional adaptive sharpening using high-pass filter
    high_pass = cv2.subtract(img.astype(np.float32), blurred.astype(np.float32))
    high_pass = high_pass + 128
    
    # Blend with original for adaptive sharpening
    result = cv2.addWeighted(sharpened.astype(np.float32), 0.7, high_pass, 0.3, 0)
    result = np.clip(result, 0, 255).astype(np.uint8)
    
    return result


def bilateral_filter_edge_preserve(img):
    """Apply bilateral filter for edge preservation"""
    filtered = cv2.bilateralFilter(img, 9, 75, 75)
    return filtered


def enhancement_pipeline(img, strength=1.2, denoise=10, clahe=2.0, edge_preserve=False):
    """
    MODE 1: Enhancement pipeline
    Applies denoise -> CLAHE -> unsharp mask -> optional edge preservation
    """
    print("[*] Enhancement Pipeline Mode")
    
    # 1. Denoise
    if denoise > 0:
        print(f"    Denoising (strength={denoise})...")
        img = denoise_image(img, denoise)
    
    # 2. Apply CLAHE
    if clahe > 0:
        print(f"    Applying CLAHE (strength={clahe})...")
        img = apply_clahe(img, clahe)
    
    # 3. Unsharp mask
    if strength > 0.1:
        print(f"    Unsharp mask (strength={strength})...")
        img = unsharp_mask(img, strength)
    
    # 4. Additional contrast boost
    print(f"    Boosting contrast...")
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    # Stretch the L channel for more contrast
    l = cv2.normalize(l, None, 0, 255, cv2.NORM_MINMAX)
    lab = cv2.merge([l, a, b])
    img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
    
    # 5. Optional edge preservation
    if edge_preserve:
        print("    Applying bilateral filter...")
        img = bilateral_filter_edge_preserve(img)
    
    return img


def create_motion_psf(length, angle, size=(41, 41)):
    """Create Point Spread Function for motion blur"""
    kernel = np.zeros(size)
    center = (size[0] // 2, size[1] // 2)
    
    # Convert angle to radians
    rad = np.radians(angle)
    
    # Draw line from center
    dx = int(length * np.cos(rad) / 2)
    dy = int(length * np.sin(rad) / 2)
    
    x1 = center[0] - dx
    y1 = center[1] - dy
    x2 = center[0] + dx
    y2 = center[1] + dy
    
    cv2.line(kernel, (y1, x1), (y2, x2), 1, 1)
    
    # Normalize
    kernel = kernel / np.sum(kernel)
    return kernel


def richardson_lucy_deconvolution(img, psf, iterations=50):
    """
    Richardson-Lucy deconvolution for motion deblur
    """
    # Convert to float
    img_float = img.astype(np.float32) / 255.0
    
    # Initialize estimated image
    estimated = np.copy(img_float)
    
    # Get PSF size
    psf_size = psf.shape[0]
    pad = psf_size // 2
    
    print(f"    Running Richardson-Lucy deconvolution ({iterations} iterations)...")
    
    for iteration in range(iterations):
        if (iteration + 1) % 10 == 0:
            print(f"    Iteration {iteration + 1}/{iterations}")
        
        # Convolve estimated with PSF
        convolved = cv2.filter2D(estimated, -1, psf.astype(np.float32))
        
        # Avoid division by zero
        convolved = np.maximum(convolved, 1e-8)
        
        # Correction factor
        correction = img_float / convolved
        
        # Update estimated using transpose of PSF
        psf_transposed = np.rot90(psf, 2)  # 180 degree rotation
        estimated = estimated * cv2.filter2D(correction, -1, psf_transposed.astype(np.float32))
        
        # Clip to valid range
        estimated = np.clip(estimated, 0, 1)
    
    # Convert back to uint8
    result = (estimated * 255).astype(np.uint8)
    return result


def motion_deblur_pipeline(img, motion_length=15, motion_angle=45, iterations=50):
    """
    MODE 2: Motion deblur using Richardson-Lucy deconvolution
    """
    print("[*] Motion Deblur Pipeline")
    print(f"    Motion kernel: length={motion_length}, angle={motion_angle}°, iterations={iterations}")
    
    # Create motion PSF
    psf = create_motion_psf(motion_length, motion_angle)
    
    # Apply Richardson-Lucy deconvolution to each channel
    result = np.zeros_like(img)
    for channel in range(img.shape[2]):
        print(f"    Processing channel {channel + 1}/3...")
        result[:, :, channel] = richardson_lucy_deconvolution(
            img[:, :, channel], psf, iterations
        )
    
    return result


def process_image(input_path, output_path, mode='enhance', strength=1.2, denoise=10, 
                  clahe=2.0, motion_length=15, motion_angle=45, iterations=50, edge_preserve=False):
    """Main processing function"""
    
    try:
        # Load image
        print(f"[*] Loading image: {input_path}")
        img = cv2.imread(input_path)
        
        if img is None:
            print(f"[!] Error: Could not load image from {input_path}")
            return False
        
        # Ensure 3-channel BGR
        img = ensure_3_channel(img)
        
        # Calculate initial blur score
        blur_score = calculate_blur_score(img)
        print(f"[*] Initial blur score: {blur_score:.2f}")
        
        # Process based on mode
        if mode.lower() == 'enhance':
            result = enhancement_pipeline(img, strength, denoise, clahe, edge_preserve)
        elif mode.lower() == 'motion':
            result = motion_deblur_pipeline(img, motion_length, motion_angle, iterations)
        else:
            print(f"[!] Unknown mode: {mode}")
            return False
        
        # Calculate final blur score
        final_blur_score = calculate_blur_score(result)
        improvement = ((final_blur_score - blur_score) / blur_score) * 100 if blur_score > 0 else 0
        print(f"[*] Final blur score: {final_blur_score:.2f} (improvement: {improvement:+.1f}%)")
        
        # Save result
        print(f"[*] Saving result: {output_path}")
        success = cv2.imwrite(output_path, result)
        
        if success:
            print("[+] Done! Image enhanced successfully.")
            return True
        else:
            print(f"[!] Error: Could not save image to {output_path}")
            return False
    
    except Exception as e:
        print(f"[!] Error: {str(e)}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Unblur Image Tool - Enhance blurry images using AI-like techniques',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
  # Enhancement mode (default)
  python unblur_img.py --input blurry.jpg --output enhanced.jpg
  
  # With custom parameters
  python unblur_img.py --input blurry.jpg --output enhanced.jpg --strength 1.5 --denoise 12 --clahe 2.5
  
  # Motion deblur mode
  python unblur_img.py --input motion_blur.jpg --output deblurred.jpg --mode motion --motion_length 20 --motion_angle 45 --iterations 100
        '''
    )
    
    parser.add_argument('--input', '-i', required=True, help='Input image path')
    parser.add_argument('--output', '-o', required=True, help='Output image path')
    parser.add_argument('--mode', '-m', choices=['enhance', 'motion'], default='enhance',
                       help='Processing mode: enhance (default) or motion')
    parser.add_argument('--strength', '-s', type=float, default=1.8,
                       help='Sharpening strength (0.1-2.0, default: 1.8)')
    parser.add_argument('--denoise', '-d', type=float, default=15,
                       help='Denoising strength (0-30, default: 15)')
    parser.add_argument('--clahe', '-c', type=float, default=3.5,
                       help='CLAHE contrast strength (0-5, default: 3.5)')
    parser.add_argument('--edge-preserve', action='store_true',
                       help='Apply edge-preserving bilateral filter')
    parser.add_argument('--motion-length', type=int, default=15,
                       help='Motion kernel length in pixels (default: 15)')
    parser.add_argument('--motion-angle', type=float, default=45,
                       help='Motion angle in degrees (default: 45)')
    parser.add_argument('--iterations', type=int, default=50,
                       help='RL deconvolution iterations (default: 50)')
    
    args = parser.parse_args()
    
    # Validate inputs
    if not Path(args.input).exists():
        print(f"[!] Error: Input file not found: {args.input}")
        return 1
    
    # Process image
    success = process_image(
        args.input,
        args.output,
        mode=args.mode,
        strength=args.strength,
        denoise=args.denoise,
        clahe=args.clahe,
        motion_length=args.motion_length,
        motion_angle=args.motion_angle,
        iterations=args.iterations,
        edge_preserve=args.edge_preserve
    )
    
    return 0 if success else 1


if __name__ == '__main__':
    sys.exit(main())
