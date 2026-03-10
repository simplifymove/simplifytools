#!/usr/bin/env python3
"""
Profile Photo Maker - Professional Profile Picture Generator
Turns any photo into a LinkedIn/Instagram ready profile picture.

Usage Examples:
    python profile_photo_maker.py --input selfie.jpg --output profile.png --bg white
    python profile_photo_maker.py --input photo.jpg --output profile.png --bg blue --size 1024
    python profile_photo_maker.py --input image.jpg --output profile.png --bg gradient --gradient "blue-purple"
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
    """Load image from disk."""
    try:
        img = cv2.imread(str(image_path))
        if img is None:
            raise RuntimeError(f"Failed to load image: {image_path}")
        return img
    except Exception as e:
        raise RuntimeError(f"Error loading image: {e}")


def detect_face(image):
    """
    Detect face using OpenCV Haar Cascade.
    Returns (x, y, w, h) or None if no face found.
    """
    # Load face cascade
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    # Convert to grayscale for detection
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        return None
    
    # Return largest face
    return max(faces, key=lambda f: f[2] * f[3])


def remove_background(image_path):
    """
    Remove background using rembg (U2Net model).
    Returns RGBA image as PIL Image.
    """
    try:
        print(f"[INFO] Loading image: {image_path}")
        with open(image_path, 'rb') as f:
            input_data = f.read()
        print(f"[INFO] Image loaded: {len(input_data)} bytes")
        
        print("[INFO] Running background removal (this may take 30-60 seconds on first run)...")
        output_data = remove(input_data)
        print(f"[INFO] Background removal complete: {len(output_data)} bytes")
        
        # Convert bytes to PIL Image
        from io import BytesIO
        img = Image.open(BytesIO(output_data))
        print(f"[INFO] Image converted to PIL: {img.size} {img.mode}")
        
        return img
    except Exception as e:
        print(f"[ERROR] Background removal failed: {e}")
        print(f"[DEBUG] {traceback.format_exc()}")
        raise RuntimeError(f"Failed to remove background: {e}")


def detect_face_pil(image_cv_bgr):
    """
    Detect face in OpenCV BGR image.
    Returns bounding box (x, y, w, h) or None.
    """
    cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    face_cascade = cv2.CascadeClassifier(cascade_path)
    
    gray = cv2.cvtColor(image_cv_bgr, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        return None
    
    return max(faces, key=lambda f: f[2] * f[3])


def calculate_crop_area(face_bbox, image_width, image_height):
    """
    Calculate crop area centered on face with natural proportions.
    
    Face bbox: (x, y, w, h)
    
    Improved crop ratio:
    - Width: face_width * 2.8 (includes shoulders naturally)
    - Height: face_height * 3.2 (head + shoulders)
    """
    x, y, w, h = face_bbox
    
    # Face center
    face_cx = x + w // 2
    face_cy = y + h // 2
    
    # Crop dimensions with better proportions
    crop_w = int(w * 2.8)
    crop_h = int(h * 3.2)
    
    # Ensure square for profile
    crop_size = max(crop_w, crop_h)
    
    # Top-left corner, centered on face
    crop_x = max(0, face_cx - crop_size // 2)
    crop_y = max(0, face_cy - crop_size // 2)
    
    # Adjust if crop goes out of bounds
    if crop_x + crop_size > image_width:
        crop_x = image_width - crop_size
    if crop_y + crop_size > image_height:
        crop_y = image_height - crop_size
    
    # Ensure within bounds
    crop_x = max(0, crop_x)
    crop_y = max(0, crop_y)
    
    return crop_x, crop_y, crop_size, crop_size


def create_background(width, height, bg_type, gradient_colors=None):
    """
    Create background image.
    
    bg_type: 'white', 'blue', 'gray', 'gradient'
    gradient_colors: tuple like ('blue', 'purple')
    
    Returns PIL Image (RGB).
    """
    if bg_type == 'white':
        return Image.new('RGB', (width, height), (255, 255, 255))
    
    elif bg_type == 'blue':
        return Image.new('RGB', (width, height), (29, 78, 216))  # LinkedIn blue
    
    elif bg_type == 'gray':
        return Image.new('RGB', (width, height), (107, 114, 128))  # Professional gray
    
    elif bg_type == 'gradient':
        color_map = {
            'blue': (29, 78, 216),
            'purple': (139, 92, 246),
            'pink': (236, 72, 153),
            'teal': (32, 201, 201),
            'white': (255, 255, 255),
            'black': (0, 0, 0),
        }
        
        if gradient_colors is None:
            gradient_colors = ('blue', 'purple')
        
        color1 = color_map.get(gradient_colors[0], (29, 78, 216))
        color2 = color_map.get(gradient_colors[1], (139, 92, 246))
        
        # Create gradient from top to bottom
        img = Image.new('RGB', (width, height))
        pixels = img.load()
        
        for y in range(height):
            ratio = y / height
            r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
            g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
            b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
            
            for x in range(width):
                pixels[x, y] = (r, g, b)
        
        return img
    
    else:
        return Image.new('RGB', (width, height), (255, 255, 255))


def blur_background(image_cv_bgr, mask_rgba, blur_strength=15):
    """
    Blur the background while keeping foreground sharp.
    
    mask_rgba: PIL Image with alpha channel
    
    Returns blurred background as numpy BGR.
    """
    # Convert PIL alpha mask to binary
    alpha = np.array(mask_rgba.split()[3])
    
    # Blur the original image
    blurred = cv2.GaussianBlur(image_cv_bgr, (blur_strength, blur_strength), 0)
    
    # Create output by blending original + blurred using mask
    mask_normalized = alpha.astype(float) / 255.0
    mask_3ch = cv2.cvtColor(alpha, cv2.COLOR_GRAY2BGR).astype(float) / 255.0
    
    result = (image_cv_bgr.astype(float) * mask_3ch + 
              blurred.astype(float) * (1 - mask_3ch)).astype(np.uint8)
    
    return result


def feather_alpha_edges(image_with_alpha_pil, feather_radius=5):
    """
    Apply feather effect to alpha channel for smooth, blended edges.
    
    Creates a smooth transition at edges instead of hard cutout.
    This removes the "cutting" effect and creates professional soft edges.
    
    image_with_alpha_pil: PIL Image in RGBA mode
    feather_radius: Radius of feather effect (higher = softer, default 5)
    Returns: PIL Image in RGBA mode with feathered edges
    """
    if image_with_alpha_pil.mode != 'RGBA':
        return image_with_alpha_pil
    
    # Extract alpha channel
    alpha_array = np.array(image_with_alpha_pil.split()[3])
    
    # Step 1: Smooth the alpha channel with bilateral filter (preserves edges but smooths)
    alpha_smooth = cv2.bilateralFilter(alpha_array.astype(np.uint8), 5, 75, 75)
    
    # Step 2: Apply Gaussian blur to create smooth feathering
    feather_blur = cv2.GaussianBlur(alpha_smooth, (feather_radius * 2 + 1, feather_radius * 2 + 1), 0)
    
    # Step 3: Create edge mask
    edges = cv2.Canny(alpha_array, 50, 150)
    edges = cv2.dilate(edges, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)), iterations=2)
    
    # Step 4: Blend blurred version at edges to create feather
    alpha_feathered = np.where(edges > 0, feather_blur, alpha_smooth).astype(np.uint8)
    
    # Step 5: Apply final soft Gaussian for ultra-smooth edges
    alpha_final = cv2.GaussianBlur(alpha_feathered, (3, 3), 0)
    
    # Split image channels
    r, g, b, _ = image_with_alpha_pil.split()
    
    # Create new RGBA with feathered alpha
    result = Image.merge('RGBA', (r, g, b, Image.fromarray(alpha_final)))
    
    return result


def apply_sharpening_filter(image_pil):
    """
    Apply professional light sharpening filter to image.
    
    Uses unsharp mask kernel for subtle but effective sharpening.
    Good for professional profile photos.
    
    image_pil: PIL Image (any mode)
    Returns: PIL Image (same mode) with sharpening applied
    """
    # Convert to RGB if needed
    if image_pil.mode == 'RGBA':
        rgb = Image.new('RGB', image_pil.size, (255, 255, 255))
        rgb.paste(image_pil, mask=image_pil.split()[3])
        image_pil = rgb
    elif image_pil.mode != 'RGB':
        image_pil = image_pil.convert('RGB')
    
    # Convert to numpy for filtering
    img_array = np.array(image_pil)
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    
    # Sharpening kernel (unsharp mask style)
    kernel = np.array([
        [-1, -1, -1],
        [-1,  9, -1],
        [-1, -1, -1]
    ], dtype=np.float32) / 1.0
    
    # Apply filter with gentle strength
    sharpened = cv2.filter2D(img_bgr, -1, kernel * 0.5)
    
    # Blend original with sharpened (80% sharpened, 20% original for subtlety)
    result = cv2.addWeighted(img_bgr, 0.8, sharpened, 0.2, 0)
    
    # Convert back to PIL RGB
    result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
    return Image.fromarray(result_rgb)



def composite_images(foreground_pil, background_pil):
    """
    Composite foreground (with alpha) on background.
    
    Returns PIL Image (RGB).
    """
    # Ensure background is RGB
    if background_pil.mode != 'RGB':
        background_pil = background_pil.convert('RGB')
    
    # Ensure foreground is RGBA
    if foreground_pil.mode != 'RGBA':
        foreground_pil = foreground_pil.convert('RGBA')
    
    # Composite
    result = Image.new('RGB', background_pil.size, (255, 255, 255))
    result.paste(background_pil, (0, 0))
    result.paste(foreground_pil, (0, 0), foreground_pil)
    
    return result


def save_image(image_pil, output_path):
    """Save PIL Image to disk."""
    try:
        image_pil.save(str(output_path), 'PNG')
        return True
    except Exception as e:
        raise RuntimeError(f"Failed to save image: {e}")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Profile Photo Maker - Turn any photo into a professional profile picture',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python profile_photo_maker.py --input photo.jpg --output profile.png --bg white
  python profile_photo_maker.py --input photo.jpg --output profile.png --bg blue --size 1024
  python profile_photo_maker.py --input photo.jpg --output profile.png --bg gradient --gradient blue purple
  python profile_photo_maker.py --input photo.jpg --output profile.png --bg blur
        """
    )
    
    parser.add_argument('--input', required=True, help='Path to input image')
    parser.add_argument('--output', required=True, help='Path to output profile photo')
    parser.add_argument('--bg', default='white', 
                        choices=['white', 'blue', 'gray', 'gradient', 'blur'],
                        help='Background type')
    parser.add_argument('--gradient', nargs=2, default=['blue', 'purple'],
                        help='Gradient colors (e.g., blue purple)')
    parser.add_argument('--size', type=int, default=1024,
                        help='Output size in pixels (square, default: 1024)')
    parser.add_argument('--blur-strength', type=int, default=15,
                        help='Blur strength for blur background (default: 15)')
    
    args = parser.parse_args()
    
    try:
        # Step 1: Load original image
        print("[1/9] Loading original image...")
        sys.stdout.flush()
        input_path = Path(args.input)
        if not input_path.exists():
            raise FileNotFoundError(f"Input image not found: {args.input}")
        
        original_image_cv = load_image(str(args.input))
        height, width = original_image_cv.shape[:2]
        print(f"  [OK] Original image loaded: {width}x{height}")
        sys.stdout.flush()
        
        # Step 2: Remove background from original
        print("[2/9] Removing background (using U2Net model, 30-60 seconds first run)...")
        sys.stdout.flush()
        foreground_pil = remove_background(str(args.input))
        print(f"  [OK] Background removed: {foreground_pil.size}")
        sys.stdout.flush()
        
        # Step 3: Feather alpha edges
        print("[3/9] Feathering edges for smooth blend (removing hard cutout)...")
        sys.stdout.flush()
        foreground_pil = feather_alpha_edges(foreground_pil, feather_radius=5)
        print(f"  [OK] Edges feathered smoothly")
        sys.stdout.flush()
        
        # Step 4: Detect face in ORIGINAL image
        print("[4/9] Detecting face in original image...")
        sys.stdout.flush()
        face_bbox = detect_face(original_image_cv)
        if face_bbox is None:
            print("  [WARNING] No face detected. Using center crop instead.")
            # Use center crop as fallback
            crop_size = int(min(height, width) * 0.6)
            crop_x = (width - crop_size) // 2
            crop_y = (height - crop_size) // 2
        else:
            x, y, w, h = face_bbox
            print(f"  [OK] Face detected: {w}x{h}")
            crop_x, crop_y, crop_size, _ = calculate_crop_area(face_bbox, width, height)
            print(f"  [OK] Crop area: {crop_size}x{crop_size}")
        sys.stdout.flush()
        
        # Step 5: Crop from ORIGINAL image (KEY FIX: maintains full resolution)
        print("[5/9] Cropping region from original image (high resolution)...")
        sys.stdout.flush()
        original_cropped_cv = original_image_cv[crop_y:crop_y+crop_size, crop_x:crop_x+crop_size]
        original_cropped_pil = Image.fromarray(cv2.cvtColor(original_cropped_cv, cv2.COLOR_BGR2RGB))
        print(f"  [OK] Cropped to {crop_size}x{crop_size} from full resolution")
        sys.stdout.flush()
        
        # Step 6: Create mask-based foreground from cropped area
        print("[6/9] Extracting foreground with background mask...")
        sys.stdout.flush()
        # Crop the rembg result to match
        foreground_cropped = foreground_pil.crop((crop_x, crop_y, crop_x + crop_size, crop_y + crop_size))
        # Composite original onto background using alpha mask
        background_pil = Image.new('RGB', (crop_size, crop_size), (255, 255, 255))
        background_pil.paste(original_cropped_pil, (0, 0), foreground_cropped)
        print(f"  [OK] Foreground extracted with proper alpha mask")
        sys.stdout.flush()
        
        # Step 7: Apply selected background
        print(f"[7/9] Creating {args.bg} background...")
        sys.stdout.flush()
        if args.bg == 'white':
            background_final = Image.new('RGB', (crop_size, crop_size), (255, 255, 255))
        elif args.bg == 'blue':
            background_final = Image.new('RGB', (crop_size, crop_size), (29, 78, 216))
        elif args.bg == 'gray':
            background_final = Image.new('RGB', (crop_size, crop_size), (107, 114, 128))
        elif args.bg == 'gradient':
            background_final = create_background(crop_size, crop_size, 'gradient', tuple(args.gradient))
        elif args.bg == 'blur':
            # Blur the cropped original
            blurred_cv = cv2.GaussianBlur(original_cropped_cv, (args.blur_strength, args.blur_strength), 0)
            background_final = Image.fromarray(cv2.cvtColor(blurred_cv, cv2.COLOR_BGR2RGB))
        else:
            background_final = Image.new('RGB', (crop_size, crop_size), (255, 255, 255))
        
        print(f"  [OK] Background created")
        sys.stdout.flush()
        
        # Step 8: Composite with transparent foreground
        print("[8/9] Compositing foreground on background...")
        sys.stdout.flush()
        profile_pil = Image.new('RGB', (crop_size, crop_size), (255, 255, 255))
        profile_pil.paste(background_final, (0, 0))
        profile_pil.paste(background_pil, (0, 0), foreground_cropped)
        print(f"  [OK] Composite complete")
        sys.stdout.flush()
        
        # Step 9: Apply sharpening and resize with LANCZOS
        print("[9/9] Applying sharpening and resizing to final size...")
        sys.stdout.flush()
        
        # Apply sharpening for professional look
        profile_pil = apply_sharpening_filter(profile_pil)
        print(f"  [OK] Sharpening applied")
        
        # Resize to final size using LANCZOS (best for photos)
        profile_pil = profile_pil.resize((args.size, args.size), Image.Resampling.LANCZOS)
        print(f"  [OK] Resized to {args.size}x{args.size} with LANCZOS")
        
        # Save
        save_image(profile_pil, args.output)
        print(f"  [OK] Output saved: {args.output}")
        
        print(f"\n[SUCCESS] Professional profile photo created!")
        print(f"[INFO] Size: {args.size}x{args.size}")
        print(f"[INFO] Background: {args.bg}")
        print(f"[INFO] Quality: Enhanced with alpha sharpening and professional filter")
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
