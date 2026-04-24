#!/usr/bin/env python3
"""
Profile Photo Maker
Generates professional profile photos with background removal and styling
"""
import argparse
import sys
from PIL import Image, ImageFilter, ImageDraw
import rembg
import io

def create_solid_background(width: int, height: int, color: str) -> Image.Image:
    """Create a solid color background"""
    color_map = {
        'white': (255, 255, 255),
        'blue': (40, 120, 200),
        'gray': (128, 128, 128),
        'black': (0, 0, 0),
    }
    rgb = color_map.get(color.lower(), (255, 255, 255))
    return Image.new('RGB', (width, height), rgb)

def create_gradient_background(width: int, height: int, color1: str, color2: str) -> Image.Image:
    """Create a gradient background"""
    # Map color names to RGB
    color_map = {
        'blue': (40, 120, 200),
        'purple': (128, 0, 200),
        'pink': (255, 105, 180),
        'teal': (0, 128, 128),
        'white': (255, 255, 255),
        'black': (0, 0, 0),
        'red': (255, 0, 0),
        'green': (0, 255, 0),
    }
    
    c1 = color_map.get(color1.lower(), (40, 120, 200))
    c2 = color_map.get(color2.lower(), (128, 0, 200))
    
    # Create gradient
    img = Image.new('RGB', (width, height))
    pixels = img.load()
    
    for y in range(height):
        # Linear interpolation between colors
        ratio = y / height
        r = int(c1[0] * (1 - ratio) + c2[0] * ratio)
        g = int(c1[1] * (1 - ratio) + c2[1] * ratio)
        b = int(c1[2] * (1 - ratio) + c2[2] * ratio)
        
        for x in range(width):
            pixels[x, y] = (r, g, b)
    
    return img

def remove_background(image: Image.Image) -> Image.Image:
    """Remove background from image using rembg"""
    try:
        # Convert to PIL if needed
        if isinstance(image, Image.Image):
            image_data = image
        else:
            image_data = Image.open(io.BytesIO(image))
        
        # Use rembg to remove background
        output = rembg.remove(image_data)
        return output
    except Exception as e:
        print(f"Warning: Background removal failed: {e}", file=sys.stderr)
        # Return original if background removal fails
        return image.convert('RGBA')

def create_profile_photo(input_path: str, output_path: str, bg_type: str, size: int, 
                        gradient_color1: str = 'blue', gradient_color2: str = 'purple') -> None:
    """Create a professional profile photo"""
    
    # Load input image
    input_img = Image.open(input_path).convert('RGB')
    
    # Remove background
    print(f"Removing background from {input_path}...", file=sys.stderr)
    fg_img = remove_background(input_img)
    
    # Convert to RGBA if needed
    if fg_img.mode != 'RGBA':
        fg_img = fg_img.convert('RGBA')
    
    # Create background
    print(f"Creating {bg_type} background...", file=sys.stderr)
    if bg_type == 'gradient':
        bg_img = create_gradient_background(size, size, gradient_color1, gradient_color2)
    elif bg_type == 'blur':
        # Create blurred version of input as background
        bg_img = input_img.resize((size, size), Image.Resampling.LANCZOS)
        bg_img = bg_img.filter(ImageFilter.GaussianBlur(radius=30))
    else:
        bg_img = create_solid_background(size, size, bg_type)
    
    # Resize foreground to fit in background
    # Leave 10% padding on each side
    max_fg_size = int(size * 0.8)
    
    # Calculate aspect ratio
    fg_width, fg_height = fg_img.size
    aspect_ratio = fg_width / fg_height
    
    if aspect_ratio > 1:
        # Width is larger
        new_width = max_fg_size
        new_height = int(max_fg_size / aspect_ratio)
    else:
        # Height is larger
        new_height = max_fg_size
        new_width = int(max_fg_size * aspect_ratio)
    
    fg_img = fg_img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    
    # Center foreground on background
    x_offset = (size - new_width) // 2
    y_offset = (size - new_height) // 2
    
    # Composite images
    bg_img.paste(fg_img, (x_offset, y_offset), fg_img)
    
    # Save result
    print(f"Saving profile photo to {output_path}...", file=sys.stderr)
    bg_img = bg_img.convert('RGB')
    bg_img.save(output_path, 'PNG', quality=95)
    print(f"✓ Profile photo created: {output_path}", file=sys.stderr)

def main():
    parser = argparse.ArgumentParser(description='Create professional profile photos')
    parser.add_argument('--input', required=True, help='Input image path')
    parser.add_argument('--output', required=True, help='Output image path')
    parser.add_argument('--bg', choices=['white', 'blue', 'gray', 'gradient', 'blur'], 
                       default='white', help='Background type')
    parser.add_argument('--size', type=int, default=1024, help='Output size (pixels)')
    parser.add_argument('--gradient', nargs=2, help='Gradient colors (color1 color2)')
    
    args = parser.parse_args()
    
    gradient_color1 = 'blue'
    gradient_color2 = 'purple'
    if args.gradient and len(args.gradient) == 2:
        gradient_color1, gradient_color2 = args.gradient
    
    try:
        create_profile_photo(
            args.input,
            args.output,
            args.bg,
            args.size,
            gradient_color1,
            gradient_color2
        )
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
