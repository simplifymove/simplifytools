"""
Professional image upscaling engine with multiple backends.
Primary: OpenCV Advanced (always available)
Optional: Real-ESRGAN (AI-powered, if dependencies available)
"""

import os
import base64
import json
import sys
import time
from pathlib import Path
from typing import Literal, Optional, Tuple, Dict, Any
import io

try:
    import cv2
    import numpy as np
    from PIL import Image
except ImportError as e:
    print(f"ERROR: Missing core dependency: {e}", file=sys.stderr)
    sys.exit(1)

# Optional imports - Real-ESRGAN
try:
    import torch
    from basicsr.archs.rrdbnet_arch import RRDBNet
    from realesrgan import RealESRGANer
    HAS_REALESRGAN = True
except ImportError:
    HAS_REALESRGAN = False
    torch = None
    RRDBNet = None
    RealESRGANer = None


class UpscaleEngine:
    """Industry-standard image upscaling using Real-ESRGAN models."""
    
    # Class-level cache for models (shared across instances)
    _model_cache = {}
    _max_models = 2  # Keep at most 2 models in memory
    
    def __init__(self, model_path: Optional[str] = None, device: str = 'auto'):
        """
        Initialize the upscale engine.
        
        Args:
            model_path: Path to Real-ESRGAN model weights
            device: 'cuda', 'cpu', or 'auto' for automatic selection
        """
        self.model_path = model_path
        self.device = self._init_device(device)
        self.upscalers = {}
        self._model_stats = {}
        
    def _init_device(self, device: str) -> str:
        """Initialize and select the appropriate device."""
        if not HAS_REALESRGAN:
            return 'cpu'
            
        if device == 'auto':
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
        
        print(f"Device: {device.upper()}", file=sys.stderr)
        return device
    
    def _get_upscaler(self, scale: Literal[2, 3, 4] = 4, model_name: str = 'RealESRGAN_x4plus'):
        """Get or create a Real-ESRGAN upscaler (only if available)."""
        if not HAS_REALESRGAN:
            return None
            
        cache_key = f"{model_name}_{scale}"
        
        # Return cached model if available
        if cache_key in UpscaleEngine._model_cache:
            print(f"Cached: {model_name} ({scale}x)", file=sys.stderr)
            return UpscaleEngine._model_cache[cache_key]
        
        try:
            print(f"Loading: {model_name} ({scale}x)", file=sys.stderr)
            
            # Model architecture
            model = RRDBNet(
                num_in_ch=3,
                num_out_ch=3,
                num_feat=64,
                num_block=23,
                num_grow_ch=32,
                scale=scale,
            )
            
            # Initialize upscaler
            upscaler = RealESRGANer(
                scale=scale,
                model_path=self.model_path,
                upscale_backend='realesrgan',
                model=model,
                tile=400,
                tile_pad=10,
                pre_pad=0,
                half=self.device == 'cuda',
            )
            upscaler.device = torch.device(self.device)
            
            # Store in cache
            UpscaleEngine._model_cache[cache_key] = upscaler
            return upscaler
            
        except Exception as e:
            print(f"Failed to load {model_name}: {e}", file=sys.stderr)
            return None
    
    def detect_image_type(self, image: np.ndarray) -> Literal['photo', 'anime']:
        """
        Detect if image is photo/real or anime/illustration.
        
        Uses color analysis and edge detection for robust classification.
        """
        try:
            # Convert to HSV for color analysis
            if image.shape[2] == 4:  # RGBA
                image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
            elif len(image.shape) == 2:  # Grayscale
                return 'photo'
            
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            
            # Analyze saturation (anime typically has high saturation)
            saturation = hsv[:, :, 1]
            mean_saturation = np.mean(saturation)
            
            # Analyze edge sharpness using Laplacian (anime has sharper edges)
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # Color quantization analysis
            downsample = cv2.resize(image, (50, 50))
            colors = downsample.reshape(-1, 3)
            unique_colors = len(np.unique(colors, axis=0))
            
            # Decision logic
            anime_score = 0
            if mean_saturation > 120:
                anime_score += 1
            if laplacian_var > 200:
                anime_score += 1
            if unique_colors < 300:
                anime_score += 1
            
            return 'anime' if anime_score >= 2 else 'photo'
            
        except Exception as e:
            print(f"Warning: Image type detection failed: {e}, defaulting to photo")
            return 'photo'
    
    def upscale(
        self,
        image_input: np.ndarray | Image.Image | bytes,
        scale: Literal[2, 3, 4] = 4,
        mode: Literal['auto', 'photo', 'anime'] = 'auto',
        face_enhance: bool = False,
        output_format: Literal['png', 'jpg', 'webp'] = 'png',
    ) -> Tuple[bytes, Dict[str, Any]]:
        """
        Upscale an image using Real-ESRGAN with memory optimization.
        
        Args:
            image_input: Image as numpy array, PIL Image, or bytes
            scale: Upscale factor (2x, 3x, or 4x)
            mode: Image type ('auto', 'photo', 'anime')
            face_enhance: Enable face enhancement
            output_format: Output image format
            
        Returns:
            Tuple of (output_bytes, metadata_dict)
        """
        start_time = time.time()
        
        # Convert input to numpy array
        if isinstance(image_input, bytes):
            image = cv2.imdecode(np.frombuffer(image_input, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError("Failed to decode image bytes")
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        elif isinstance(image_input, Image.Image):
            image = np.array(image_input)
            if len(image.shape) == 3 and image.shape[2] == 4:  # RGBA
                image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
        else:
            image = image_input
        
        # Validate dimensions
        h, w = image.shape[:2]
        max_input_dim = 8000
        max_output_dim = 16000
        
        if h > max_input_dim or w > max_input_dim:
            raise ValueError(f"Input image exceeds {max_input_dim}px: {w}x{h}")
        
        output_h, output_w = h * scale, w * scale
        if output_h > max_output_dim or output_w > max_output_dim:
            max_scale = min(max_output_dim // h, max_output_dim // w)
            raise ValueError(
                f"Output would be {output_w}x{output_h}px (max {max_output_dim}px). "
                f"Max scale for this image: {max_scale}x"
            )
        
        # Auto-detect image type if needed
        if mode == 'auto':
            detected_mode = self.detect_image_type(image)
            print(f"Mode: {detected_mode}", file=sys.stderr)
        else:
            detected_mode = mode
        
        print(f"Upscaling {w}x{h} -> {output_w}x{output_h} ({scale}x)", file=sys.stderr)
        
        upscaled = None
        engine_used = 'OpenCV Advanced'
        
        # Try Real-ESRGAN if available
        if HAS_REALESRGAN:
            try:
                model_name = 'RealESRGAN_x4plus_anime' if detected_mode == 'anime' else 'RealESRGAN_x4plus'
                upscaler = self._get_upscaler(scale, model_name)
                
                if upscaler is not None:
                    if self.device == 'cuda':
                        torch.cuda.empty_cache()
                    
                    upscaled, _ = upscaler.enhance(image, outscale=scale)
                    engine_used = 'Real-ESRGAN'
                    
                    if self.device == 'cuda':
                        torch.cuda.empty_cache()
                    
                    print(f"Engine: Real-ESRGAN", file=sys.stderr)
                else:
                    print(f"Real-ESRGAN unavailable, using OpenCV", file=sys.stderr)
                    
            except Exception as e:
                print(f"ESRGAN error: {str(e)[:100]}, using OpenCV", file=sys.stderr)
                upscaled = None
        
        # Use OpenCV fallback
        if upscaled is None:
            print(f"Engine: OpenCV Advanced", file=sys.stderr)
            upscaled = self._upscale_with_opencv(image, scale, detected_mode)
            engine_used = 'OpenCV Advanced'
        
        # Face enhancement (if enabled)
        if face_enhance:
            upscaled = self._enhance_faces(upscaled)
        
        # Convert to PIL Image for format conversion
        output_image = Image.fromarray(upscaled)
        
        # Save in requested format with optimization
        output_buffer = io.BytesIO()
        if output_format == 'png':
            # Optimize PNG with maximum compression
            output_image.save(
                output_buffer, 
                format='PNG', 
                optimize=True,
                compress_level=9  # Maximum compression (0-9)
            )
        elif output_format == 'jpg':
            # Convert RGBA to RGB if needed
            if output_image.mode == 'RGBA':
                bg = Image.new('RGB', output_image.size, (255, 255, 255))
                bg.paste(output_image, mask=output_image.split()[3])
                bg.save(output_buffer, format='JPEG', quality=92, optimize=True, progressive=True)
            else:
                output_image.save(output_buffer, format='JPEG', quality=92, optimize=True, progressive=True)
        else:  # webp
            # WebP with good compression
            output_image.save(output_buffer, format='WEBP', quality=90, method=6)
        
        output_buffer.seek(0)
        output_bytes = output_buffer.getvalue()
        
        elapsed = time.time() - start_time
        
        # Calculate quality metrics
        compression_ratio = len(output_bytes) / (output_w * output_h * 3) if output_w * output_h > 0 else 0
        
        metadata = {
            'original_size': f"{w}x{h}",
            'upscaled_size': f"{output_w}x{output_h}",
            'scale': scale,
            'mode': detected_mode,
            'engine': engine_used,
            'face_enhance': face_enhance,
            'format': output_format,
            'output_size_bytes': len(output_bytes),
            'compression_ratio': compression_ratio,
            'processing_time_ms': int(elapsed * 1000),
            'device': self.device.upper(),
        }
        
        print(f"Done: {elapsed:.2f}s, {len(output_bytes) / (1024*1024):.2f}MB", file=sys.stderr)
        
        return output_bytes, metadata
    
    def _upscale_with_opencv(
        self,
        image: np.ndarray,
        scale: int,
        mode: str,
    ) -> np.ndarray:
        """
        Fallback upscaling using advanced OpenCV algorithms.
        Provides professional-quality results without deep learning.
        """
        h, w = image.shape[:2]
        new_h, new_w = h * scale, w * scale
        
        print(f"Using OpenCV advanced upscaling ({scale}x)")
        
        # Pre-upscale with Lanczos for smooth base
        upscaled = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
        
        # Apply unsharp masking for detail enhancement
        gaussian = cv2.GaussianBlur(upscaled, (0, 0), 2.0)
        upscaled = cv2.addWeighted(upscaled, 1.3, gaussian, -0.3, 0)
        
        # Bilateral filtering to preserve edges while smoothing
        upscaled = cv2.bilateralFilter(upscaled, 9, 75, 75)
        
        # Additional sharpening for clarity
        kernel = np.array([[-1, -1, -1],
                          [-1,  9, -1],
                          [-1, -1, -1]]) / 1.0
        sharpened = cv2.filter2D(upscaled, -1, kernel)
        upscaled = cv2.addWeighted(upscaled, 0.8, sharpened, 0.2, 0)
        
        return np.clip(upscaled, 0, 255).astype(np.uint8)
        """Enhance facial features using sharpening and detail enhancement."""
        try:
            # Use unsharp masking for face enhancement
            blurred = cv2.GaussianBlur(image, (0, 0), 2.0)
            enhanced = cv2.addWeighted(image, 1.5, blurred, -0.5, 0)
            return np.clip(enhanced, 0, 255).astype(np.uint8)
        except Exception as e:
            print(f"Warning: Face enhancement failed: {e}")
            return image


def main():
    """CLI interface for upscaling."""
    if len(sys.argv) < 3:
        print("Usage: python upscale_engine.py <input_image> <scale> [mode] [face_enhance] [format] [output_path]")
        print("  scale: 2, 3, or 4")
        print("  mode: auto, photo, anime")
        print("  face_enhance: true or false")
        print("  format: png, jpg, webp")
        print("  output_path: optional output file path")
        sys.exit(1)
    
    input_file = sys.argv[1]
    scale = int(sys.argv[2])
    mode = sys.argv[3] if len(sys.argv) > 3 else 'auto'
    face_enhance = sys.argv[4].lower() == 'true' if len(sys.argv) > 4 else False
    output_format = sys.argv[5] if len(sys.argv) > 5 else 'png'
    output_file = sys.argv[6] if len(sys.argv) > 6 else f"upscaled_{scale}x.{output_format}"
    
    try:
        # Load image
        image = Image.open(input_file)
        
        # Upscale
        engine = UpscaleEngine(device='auto')
        output_bytes, metadata = engine.upscale(
            image,
            scale=scale,
            mode=mode,
            face_enhance=face_enhance,
            output_format=output_format,
        )
        
        # Output file - write and flush
        with open(output_file, 'wb') as f:
            f.write(output_bytes)
            f.flush()  # Ensure data is written to disk
            import os
            os.fsync(f.fileno())  # Force filesystem sync
        
        # Output metadata as JSON to stdout (required for API parsing)
        print(f"METADATA:{json.dumps(metadata)}")
        print(f"Output saved to: {output_file}", file=sys.stderr)
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
