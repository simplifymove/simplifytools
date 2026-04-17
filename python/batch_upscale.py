"""
Batch image upscaling using Real-ESRGAN.
Process multiple images with consistent settings.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

from upscale_engine import UpscaleEngine
from PIL import Image


class BatchUpscaler:
    """Batch processing for multiple images."""
    
    def __init__(self, max_workers: int = 4, device: str = 'auto'):
        """
        Initialize batch upscaler.
        
        Args:
            max_workers: Number of concurrent upscale processes
            device: 'cuda', 'cpu', or 'auto'
        """
        self.max_workers = max_workers
        self.device = device
        self.engine = UpscaleEngine(device=device)
        self.results = []
        
    def upscale_file(
        self,
        input_path: str,
        output_dir: str,
        scale: int = 4,
        mode: str = 'auto',
        face_enhance: bool = False,
        output_format: str = 'png',
    ) -> dict:
        """
        Upscale a single image file.
        
        Returns:
            Dictionary with input_file, output_file, and metadata
        """
        try:
            input_path = Path(input_path)
            output_dir = Path(output_dir)
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Load image
            image = Image.open(input_path)
            
            # Upscale
            output_bytes, metadata = self.engine.upscale(
                image,
                scale=scale,
                mode=mode,
                face_enhance=face_enhance,
                output_format=output_format,
            )
            
            # Save output
            output_filename = f"{input_path.stem}_{scale}x.{output_format}"
            output_path = output_dir / output_filename
            
            with open(output_path, 'wb') as f:
                f.write(output_bytes)
            
            result = {
                'input': str(input_path),
                'output': str(output_path),
                'status': 'success',
                'metadata': metadata,
            }
            
            print(f"✓ {input_path.name} → {output_filename}")
            return result
            
        except Exception as e:
            result = {
                'input': str(input_path),
                'status': 'failed',
                'error': str(e),
            }
            print(f"✗ {input_path.name}: {e}")
            return result
    
    def upscale_directory(
        self,
        input_dir: str,
        output_dir: str,
        scale: int = 4,
        mode: str = 'auto',
        face_enhance: bool = False,
        output_format: str = 'png',
        extensions: list = None,
    ) -> dict:
        """
        Upscale all images in a directory.
        
        Args:
            input_dir: Directory containing images
            output_dir: Output directory for upscaled images
            scale: Upscale factor
            mode: 'auto', 'photo', or 'anime'
            face_enhance: Enable face enhancement
            output_format: Output format (png, jpg, webp)
            extensions: List of file extensions to process (default: png, jpg, jpeg, webp)
            
        Returns:
            Summary dictionary with results and statistics
        """
        if extensions is None:
            extensions = ['.png', '.jpg', '.jpeg', '.webp']
        
        input_path = Path(input_dir)
        if not input_path.is_dir():
            raise ValueError(f"Input directory not found: {input_dir}")
        
        # Find all images
        image_files = []
        for ext in extensions:
            image_files.extend(input_path.glob(f'*{ext}'))
            image_files.extend(input_path.glob(f'*{ext.upper()}'))
        
        if not image_files:
            print(f"No images found in {input_dir}")
            return {'status': 'no_images', 'count': 0}
        
        print(f"Found {len(image_files)} images to process")
        print(f"Settings: scale={scale}x, mode={mode}, format={output_format}")
        print()
        
        start_time = time.time()
        self.results = []
        
        # Process in parallel
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            futures = {
                executor.submit(
                    self.upscale_file,
                    str(img_file),
                    output_dir,
                    scale,
                    mode,
                    face_enhance,
                    output_format,
                ): img_file for img_file in image_files
            }
            
            completed = 0
            for future in as_completed(futures):
                result = future.result()
                self.results.append(result)
                completed += 1
                print(f"[{completed}/{len(image_files)}]", end='\r')
        
        elapsed = time.time() - start_time
        
        # Summary
        successful = sum(1 for r in self.results if r['status'] == 'success')
        failed = sum(1 for r in self.results if r['status'] == 'failed')
        
        summary = {
            'status': 'completed',
            'total': len(image_files),
            'successful': successful,
            'failed': failed,
            'duration_seconds': elapsed,
            'output_directory': output_dir,
            'results': self.results,
        }
        
        print(f"\n{'='*50}")
        print(f"Batch Processing Complete!")
        print(f"{'='*50}")
        print(f"Total: {len(image_files)}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        print(f"Duration: {elapsed:.2f}s")
        print(f"Avg per image: {elapsed/len(image_files):.2f}s")
        print(f"Output: {output_dir}")
        
        return summary


def main():
    """CLI for batch upscaling."""
    parser = argparse.ArgumentParser(
        description='Batch image upscaling with Real-ESRGAN'
    )
    parser.add_argument('input', help='Input image or directory')
    parser.add_argument('--output', '-o', help='Output directory')
    parser.add_argument('--scale', type=int, default=4, choices=[2, 3, 4])
    parser.add_argument('--mode', default='auto', choices=['auto', 'photo', 'anime'])
    parser.add_argument('--format', default='png', choices=['png', 'jpg', 'webp'])
    parser.add_argument('--face-enhance', action='store_true')
    parser.add_argument('--workers', type=int, default=4, help='Max parallel workers')
    parser.add_argument('--output-json', help='Save results as JSON')
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_dir = args.output or 'upscaled_output'
    
    # Initialize batch upscaler
    upscaler = BatchUpscaler(max_workers=args.workers)
    
    # Process
    if input_path.is_file():
        # Single file
        result = upscaler.upscale_file(
            str(input_path),
            output_dir,
            scale=args.scale,
            mode=args.mode,
            face_enhance=args.face_enhance,
            output_format=args.format,
        )
        print(json.dumps(result, indent=2))
    elif input_path.is_dir():
        # Directory
        summary = upscaler.upscale_directory(
            str(input_path),
            output_dir,
            scale=args.scale,
            mode=args.mode,
            face_enhance=args.face_enhance,
            output_format=args.format,
        )
        
        # Save JSON report if requested
        if args.output_json:
            with open(args.output_json, 'w') as f:
                json.dump(summary, f, indent=2)
            print(f"Results saved to: {args.output_json}")
    else:
        print(f"Input not found: {args.input}")
        sys.exit(1)


if __name__ == '__main__':
    main()
