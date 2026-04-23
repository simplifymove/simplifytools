#!/usr/bin/env python3
"""
Industry-standard Image Unblurring Engine
Supports both enhancement and motion deblurring
"""

import argparse
import sys
import os
import cv2
import numpy as np
from pathlib import Path


class UnblurEngine:
    """Professional image deblurring using industry-standard algorithms"""
    
    @staticmethod
    def enhance_sharpness(image, strength=1.8):
        """
        Enhance image sharpness using unsharp masking
        Industry standard for general image enhancement
        """
        # Convert to floating point
        img = image.astype(np.float32) / 255.0
        
        # Apply Gaussian blur for unsharp mask
        blurred = cv2.GaussianBlur(img, (5, 5), 1.0)
        
        # Unsharp masking: original + (original - blurred) * strength
        sharpened = img + (img - blurred) * strength
        
        # Clip values and convert back
        sharpened = np.clip(sharpened, 0, 1)
        return (sharpened * 255).astype(np.uint8)
    
    @staticmethod
    def denoise_bilateral(image, denoise_strength=15):
        """
        Denoise using bilateral filter (edge-preserving)
        Industry standard for noise reduction
        """
        # Bilateral filter preserves edges while smoothing
        # Parameters: diameter=9, sigma_color, sigma_space
        denoised = cv2.bilateralFilter(
            image,
            d=9,
            sigmaColor=denoise_strength,
            sigmaSpace=denoise_strength
        )
        return denoised
    
    @staticmethod
    def apply_clahe(image, clahe_clip=3.5):
        """
        Contrast Limited Adaptive Histogram Equalization
        Professional technique for improving local contrast
        """
        # Convert to LAB color space for better contrast adjustment
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l_channel, a_channel, b_channel = cv2.split(lab)
        
        # Apply CLAHE to L channel
        clahe = cv2.createCLAHE(clipLimit=clahe_clip, tileGridSize=(8, 8))
        l_enhanced = clahe.apply(l_channel)
        
        # Merge and convert back to BGR
        enhanced_lab = cv2.merge([l_enhanced, a_channel, b_channel])
        result = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
        return result
    
    @staticmethod
    def enhance_mode(image, strength=1.8, denoise=15, clahe=3.5, edge_preserve=False):
        """
        Complete enhancement pipeline combining multiple techniques
        """
        # Step 1: Denoise (bilateral filter for edge preservation)
        denoised = UnblurEngine.denoise_bilateral(image, denoise)
        
        # Step 2: Enhance contrast with CLAHE
        enhanced = UnblurEngine.apply_clahe(denoised, clahe)
        
        # Step 3: Sharpen with unsharp masking
        sharpened = UnblurEngine.enhance_sharpness(enhanced, strength)
        
        # Step 4: Optional edge preservation
        if edge_preserve:
            sharpened = UnblurEngine.preserve_edges(sharpened, image)
        
        return sharpened
    
    @staticmethod
    def preserve_edges(processed, original, alpha=0.7):
        """
        Blend processed image with original to preserve fine edges
        """
        return cv2.addWeighted(processed, alpha, original, 1 - alpha, 0)
    
    @staticmethod
    def motion_deblur_wiener(image, kernel_size=15, angle=45, snr=10):
        """
        Motion deblur using Wiener filtering
        Industry standard for motion blur removal
        
        Args:
            image: Input image
            kernel_size: Size of motion kernel
            angle: Angle of motion (0-180 degrees)
            snr: Signal-to-noise ratio (higher = more aggressive)
        """
        # Create motion blur kernel
        angle_rad = np.deg2rad(angle)
        kernel = np.zeros((kernel_size, kernel_size))
        
        # Create horizontal kernel rotated by angle
        center = kernel_size // 2
        for i in range(kernel_size):
            for j in range(kernel_size):
                x = i - center
                y = j - center
                # Rotate coordinates
                rotx = x * np.cos(angle_rad) - y * np.sin(angle_rad)
                if abs(rotx) < 0.5:
                    kernel[i, j] = 1
        
        kernel = kernel / (np.sum(kernel) + 1e-8)
        
        # Apply Wiener filter for deblurring
        # Convert to float
        img = image.astype(np.float64) / 255.0
        
        # Estimate power spectrum
        img_fft = np.fft.fft2(img[:,:,0] if len(img.shape) == 3 else img)
        kernel_fft = np.fft.fft2(kernel, s=img.shape)
        
        # Wiener filter formula: H* / (|H|^2 + 1/SNR)
        numerator = np.conj(kernel_fft)
        denominator = np.abs(kernel_fft) ** 2 + 1.0 / max(snr, 0.1)
        wiener_filter = numerator / (denominator + 1e-8)
        
        # Apply Wiener filter
        result_fft = img_fft * wiener_filter
        result = np.real(np.fft.ifft2(result_fft))
        
        # Convert to uint8
        result = np.clip(result * 255, 0, 255).astype(np.uint8)
        
        return result
    
    @staticmethod
    def motion_deblur_lucy_richardson(image, kernel_size=15, angle=45, iterations=50):
        """
        Motion deblur using Lucy-Richardson deconvolution
        Gold standard for motion blur removal
        
        Args:
            image: Input image
            kernel_size: Size of motion kernel
            angle: Angle of motion
            iterations: Number of iterations (higher = more aggressive)
        """
        # Create motion blur kernel
        angle_rad = np.deg2rad(angle)
        kernel = np.zeros((kernel_size, kernel_size))
        
        center = kernel_size // 2
        for i in range(kernel_size):
            for j in range(kernel_size):
                x = i - center
                y = j - center
                rotx = x * np.cos(angle_rad) - y * np.sin(angle_rad)
                if abs(rotx) < 0.5:
                    kernel[i, j] = 1
        
        kernel = kernel / (np.sum(kernel) + 1e-8)
        
        # Convert to float
        img = image.astype(np.float64) / 255.0
        
        # Lucy-Richardson deconvolution
        result = img.copy()
        
        for _ in range(min(iterations, 100)):  # Cap iterations for performance
            # Convolve with kernel
            convolved = cv2.filter2D(result, -1, kernel)
            
            # Avoid division by zero
            convolved = np.maximum(convolved, 1e-8)
            
            # Correction factor
            correction = img / convolved
            
            # Deconvolve (correlation with flipped kernel)
            kernel_flip = np.flip(np.flip(kernel, axis=0), axis=1)
            result = result * cv2.filter2D(correction, -1, kernel_flip)
            
            # Normalize
            result = np.clip(result, 0, 1)
        
        # Convert back to uint8
        result = (result * 255).astype(np.uint8)
        
        return result
    
    @staticmethod
    def motion_deblur_advanced(image, motion_length=15, angle=45, iterations=50, method='lucy-richardson'):
        """
        Advanced motion deblur with multiple algorithm options
        """
        if method == 'lucy-richardson':
            return UnblurEngine.motion_deblur_lucy_richardson(
                image, 
                kernel_size=motion_length, 
                angle=angle, 
                iterations=iterations
            )
        else:  # Wiener
            snr = max(5, iterations / 10)  # Use iterations to control SNR
            return UnblurEngine.motion_deblur_wiener(
                image,
                kernel_size=motion_length,
                angle=angle,
                snr=snr
            )


def main():
    parser = argparse.ArgumentParser(description='Industry-standard Image Unblurring')
    parser.add_argument('--input', required=True, help='Input image path')
    parser.add_argument('--output', required=True, help='Output image path')
    parser.add_argument('--mode', default='enhance', choices=['enhance', 'motion'],
                      help='Processing mode')
    
    # Enhancement parameters
    parser.add_argument('--strength', type=float, default=1.8,
                      help='Sharpening strength (0.5-3.0)')
    parser.add_argument('--denoise', type=float, default=15,
                      help='Denoise strength (5-50)')
    parser.add_argument('--clahe', type=float, default=3.5,
                      help='CLAHE clip limit (1.0-10.0)')
    parser.add_argument('--edge-preserve', action='store_true',
                      help='Preserve edges in enhancement')
    
    # Motion deblur parameters
    parser.add_argument('--motion-length', type=int, default=15,
                      help='Motion kernel length (5-50)')
    parser.add_argument('--motion-angle', type=int, default=45,
                      help='Motion angle in degrees (0-180)')
    parser.add_argument('--iterations', type=int, default=50,
                      help='Deconvolution iterations (10-200)')
    
    args = parser.parse_args()
    
    try:
        # Validate inputs
        if not os.path.exists(args.input):
            print(f"[ERROR] Input file not found: {args.input}")
            sys.exit(1)
        
        # Load image
        image = cv2.imread(args.input)
        if image is None:
            print(f"[ERROR] Failed to load image: {args.input}")
            sys.exit(1)
        
        print(f"[INFO] Loaded image: {image.shape}")
        
        # Process based on mode
        if args.mode == 'enhance':
            print(f"[INFO] Running ENHANCEMENT mode")
            print(f"  - Strength: {args.strength}")
            print(f"  - Denoise: {args.denoise}")
            print(f"  - CLAHE: {args.clahe}")
            print(f"  - Edge preserve: {args.edge_preserve}")
            
            result = UnblurEngine.enhance_mode(
                image,
                strength=args.strength,
                denoise=args.denoise,
                clahe=args.clahe,
                edge_preserve=args.edge_preserve
            )
        
        elif args.mode == 'motion':
            print(f"[INFO] Running MOTION DEBLUR mode (Lucy-Richardson)")
            print(f"  - Motion length: {args.motion_length}")
            print(f"  - Motion angle: {args.motion_angle}°")
            print(f"  - Iterations: {args.iterations}")
            
            result = UnblurEngine.motion_deblur_advanced(
                image,
                motion_length=args.motion_length,
                angle=args.motion_angle,
                iterations=args.iterations,
                method='lucy-richardson'
            )
        
        # Save result
        success = cv2.imwrite(args.output, result)
        if not success:
            print(f"[ERROR] Failed to save output: {args.output}")
            sys.exit(1)
        
        print(f"[SUCCESS] Image unblurred and saved to: {args.output}")
        
    except Exception as e:
        print(f"[ERROR] {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
