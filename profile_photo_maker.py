#!/usr/bin/env python3
"""
Profile Photo Maker

Creates professional square profile photos with:
- AI background removal using rembg
- Face-aware portrait framing using OpenCV
- Solid, gradient, or blurred backgrounds
- Safe fallback framing when no face is detected
"""

import argparse
import io
import os
import sys

import cv2
import numpy as np
import rembg
from PIL import Image, ImageFilter


def create_solid_background(width: int, height: int, color: str) -> Image.Image:
    """Create a solid color background."""
    color_map = {
        "white": (255, 255, 255),
        "blue": (40, 120, 200),
        "gray": (128, 128, 128),
        "black": (0, 0, 0),
    }

    rgb = color_map.get(color.lower(), (255, 255, 255))
    return Image.new("RGB", (width, height), rgb)


def create_gradient_background(
    width: int,
    height: int,
    color1: str,
    color2: str,
) -> Image.Image:
    """Create a vertical gradient background."""

    color_map = {
        "blue": (40, 120, 200),
        "purple": (128, 0, 200),
        "pink": (255, 105, 180),
        "teal": (0, 128, 128),
        "white": (255, 255, 255),
        "black": (0, 0, 0),
        "red": (255, 0, 0),
        "green": (0, 255, 0),
    }

    c1 = color_map.get(color1.lower(), (40, 120, 200))
    c2 = color_map.get(color2.lower(), (128, 0, 200))

    img = Image.new("RGB", (width, height))
    pixels = img.load()

    divisor = max(height - 1, 1)

    for y in range(height):
        ratio = y / divisor

        r = int(c1[0] * (1 - ratio) + c2[0] * ratio)
        g = int(c1[1] * (1 - ratio) + c2[1] * ratio)
        b = int(c1[2] * (1 - ratio) + c2[2] * ratio)

        for x in range(width):
            pixels[x, y] = (r, g, b)

    return img


def remove_background(image: Image.Image) -> Image.Image:
    """Remove image background using rembg."""

    try:
        if isinstance(image, Image.Image):
            image_data = image
        else:
            image_data = Image.open(io.BytesIO(image))

        output = rembg.remove(image_data)

        if not isinstance(output, Image.Image):
            output = Image.open(io.BytesIO(output))

        return output.convert("RGBA")

    except Exception as exc:
        print(
            f"Warning: Background removal failed: {exc}",
            file=sys.stderr,
        )
        return image.convert("RGBA")


def detect_primary_face(image: Image.Image):
    """
    Detect the largest frontal face.

    Returns:
        (x, y, width, height) or None
    """

    try:
        rgb = np.array(image.convert("RGB"))

        gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
        gray = cv2.equalizeHist(gray)

        cascade_path = os.path.join(
            cv2.data.haarcascades,
            "haarcascade_frontalface_default.xml",
        )

        detector = cv2.CascadeClassifier(cascade_path)

        if detector.empty():
            print(
                "Warning: OpenCV face detector could not be loaded.",
                file=sys.stderr,
            )
            return None

        min_side = max(
            30,
            int(min(image.width, image.height) * 0.06),
        )

        faces = detector.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(min_side, min_side),
        )

        if len(faces) == 0:
            return None

        # Profile Photo Maker expects one primary subject.
        # Prefer the largest detected face.
        face = max(
            faces,
            key=lambda item: int(item[2]) * int(item[3]),
        )

        x, y, width, height = [int(value) for value in face]

        return x, y, width, height

    except Exception as exc:
        print(
            f"Warning: Face detection failed: {exc}",
            file=sys.stderr,
        )
        return None


def get_foreground_bbox(image: Image.Image):
    """Get non-transparent subject bounding box."""

    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")

    return alpha.getbbox()


def create_blurred_background(
    input_img: Image.Image,
    size: int,
) -> Image.Image:
    """
    Create a full-cover blurred background without stretching
    the original image.
    """

    source = input_img.convert("RGB")

    scale = max(
        size / source.width,
        size / source.height,
    )

    resized_width = max(1, int(round(source.width * scale)))
    resized_height = max(1, int(round(source.height * scale)))

    source = source.resize(
        (resized_width, resized_height),
        Image.Resampling.LANCZOS,
    )

    left = max(0, (resized_width - size) // 2)
    top = max(0, (resized_height - size) // 2)

    source = source.crop(
        (
            left,
            top,
            left + size,
            top + size,
        )
    )

    return source.filter(
        ImageFilter.GaussianBlur(radius=max(12, size // 34))
    )


def frame_subject_with_face(
    foreground: Image.Image,
    face,
    canvas_size: int,
):
    """
    Scale and position the full foreground using the detected face.

    Desired portrait composition:
    - face height about 32% of the square canvas
    - face horizontally centered
    - eye/head area positioned above canvas center
    - shoulders/body may naturally continue below the image
    """

    original_width, original_height = foreground.size

    face_x, face_y, face_width, face_height = face

    # Face occupies roughly one-third of the final square.
    target_face_height = canvas_size * 0.36

    scale = target_face_height / max(face_height, 1)

    # Avoid extreme enlargement of very small detected faces.
    scale = min(scale, 4.0)

    resized_width = max(
        1,
        int(round(original_width * scale)),
    )
    resized_height = max(
        1,
        int(round(original_height * scale)),
    )

    resized = foreground.resize(
        (resized_width, resized_height),
        Image.Resampling.LANCZOS,
    )

    scaled_face_x = face_x * scale
    scaled_face_y = face_y * scale
    scaled_face_width = face_width * scale
    scaled_face_height = face_height * scale

    face_center_x = (
        scaled_face_x + scaled_face_width / 2
    )

    face_center_y = (
        scaled_face_y + scaled_face_height / 2
    )

    # Standard profile-photo composition:
    # horizontal center and slightly elevated face position.
    desired_face_center_x = canvas_size * 0.50
    desired_face_center_y = canvas_size * 0.35

    x_offset = int(
        round(desired_face_center_x - face_center_x)
    )

    y_offset = int(
        round(desired_face_center_y - face_center_y)
    )

    return resized, x_offset, y_offset


def frame_subject_fallback(
    foreground: Image.Image,
    canvas_size: int,
):
    """
    Fallback framing using the visible foreground alpha bounding box.

    This is used when OpenCV cannot reliably detect a face.
    """

    bbox = get_foreground_bbox(foreground)

    if not bbox:
        bbox = (
            0,
            0,
            foreground.width,
            foreground.height,
        )

    left, top, right, bottom = bbox

    subject_width = max(1, right - left)
    subject_height = max(1, bottom - top)

    # Allow portrait to occupy most of the canvas.
    target_width = canvas_size * 0.86
    target_height = canvas_size * 0.94

    scale = min(
        target_width / subject_width,
        target_height / subject_height,
    )

    scale = min(scale, 4.0)

    resized_width = max(
        1,
        int(round(foreground.width * scale)),
    )
    resized_height = max(
        1,
        int(round(foreground.height * scale)),
    )

    resized = foreground.resize(
        (resized_width, resized_height),
        Image.Resampling.LANCZOS,
    )

    scaled_left = left * scale
    scaled_top = top * scale
    scaled_right = right * scale
    scaled_bottom = bottom * scale

    subject_center_x = (
        scaled_left + scaled_right
    ) / 2

    subject_center_y = (
        scaled_top + scaled_bottom
    ) / 2

    desired_center_x = canvas_size * 0.50
    desired_center_y = canvas_size * 0.53

    x_offset = int(
        round(desired_center_x - subject_center_x)
    )

    y_offset = int(
        round(desired_center_y - subject_center_y)
    )

    return resized, x_offset, y_offset


def create_profile_photo(
    input_path: str,
    output_path: str,
    bg_type: str,
    size: int,
    gradient_color1: str = "blue",
    gradient_color2: str = "purple",
) -> None:
    """Create a professional square profile photo."""

    input_img = Image.open(input_path).convert("RGB")

    print(
        f"Input image: {input_img.width}x{input_img.height}",
        file=sys.stderr,
    )

    # Detect face before removing the background.
    print(
        "Detecting primary face...",
        file=sys.stderr,
    )

    face = detect_primary_face(input_img)

    if face:
        print(
            f"Face detected: x={face[0]}, y={face[1]}, "
            f"w={face[2]}, h={face[3]}",
            file=sys.stderr,
        )
    else:
        print(
            "No reliable face detected; using subject-aware fallback framing.",
            file=sys.stderr,
        )

    print(
        f"Removing background from {input_path}...",
        file=sys.stderr,
    )

    foreground = remove_background(input_img)

    print(
        f"Creating {bg_type} background...",
        file=sys.stderr,
    )

    if bg_type == "gradient":
        background = create_gradient_background(
            size,
            size,
            gradient_color1,
            gradient_color2,
        )

    elif bg_type == "blur":
        background = create_blurred_background(
            input_img,
            size,
        )

    else:
        background = create_solid_background(
            size,
            size,
            bg_type,
        )

    if face:
        framed_subject, x_offset, y_offset = frame_subject_with_face(
            foreground,
            face,
            size,
        )

        print(
            "Using face-aware portrait framing.",
            file=sys.stderr,
        )

    else:
        framed_subject, x_offset, y_offset = frame_subject_fallback(
            foreground,
            size,
        )

        print(
            "Using foreground-aware fallback framing.",
            file=sys.stderr,
        )

    print(
        f"Foreground size: "
        f"{framed_subject.width}x{framed_subject.height}",
        file=sys.stderr,
    )

    print(
        f"Foreground offset: x={x_offset}, y={y_offset}",
        file=sys.stderr,
    )

    background.paste(
        framed_subject,
        (x_offset, y_offset),
        framed_subject,
    )

    print(
        f"Saving profile photo to {output_path}...",
        file=sys.stderr,
    )

    background = background.convert("RGB")

    background.save(
        output_path,
        "PNG",
        optimize=True,
    )

    print(
        f"✓ Profile photo created: {output_path}",
        file=sys.stderr,
    )


def main():
    parser = argparse.ArgumentParser(
        description="Create professional profile photos"
    )

    parser.add_argument(
        "--input",
        required=True,
        help="Input image path",
    )

    parser.add_argument(
        "--output",
        required=True,
        help="Output image path",
    )

    parser.add_argument(
        "--bg",
        choices=[
            "white",
            "blue",
            "gray",
            "gradient",
            "blur",
        ],
        default="white",
        help="Background type",
    )

    parser.add_argument(
        "--size",
        type=int,
        default=1024,
        help="Output size (pixels)",
    )

    parser.add_argument(
        "--gradient",
        nargs=2,
        help="Gradient colors (color1 color2)",
    )

    args = parser.parse_args()

    if args.size < 256 or args.size > 2048:
        parser.error("--size must be between 256 and 2048")

    gradient_color1 = "blue"
    gradient_color2 = "purple"

    if args.gradient and len(args.gradient) == 2:
        gradient_color1, gradient_color2 = args.gradient

    try:
        create_profile_photo(
            args.input,
            args.output,
            args.bg,
            args.size,
            gradient_color1,
            gradient_color2,
        )

    except Exception as exc:
        print(
            f"Error: {exc}",
            file=sys.stderr,
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
