#!/bin/bash

echo "================================================================================"
echo "VPS NODE.JS DEPENDENCIES CHECK"
echo "================================================================================"

cd /var/www/simplifytools

echo ""
echo "✓ NPM & Node Status:"
npm -v
node -v

echo ""
echo "✓ Node modules directory:"
ls -lh node_modules | head -5
echo "... (total $(ls -1 node_modules | wc -l) items)"

echo ""
echo "================================================================================"
echo "CORE DEPENDENCIES STATUS"
echo "================================================================================"

# Array of core dependencies
DEPS=(
    "@mediapipe/selfie_segmentation"
    "@tensorflow-models/body-pix"
    "@tensorflow/tfjs"
    "clean-css"
    "docx"
    "enhanced-resolve"
    "framer-motion"
    "html-minifier-terser"
    "html2canvas"
    "jspdf"
    "lucide-react"
    "next"
    "next-auth"
    "nodemailer"
    "pdf-lib"
    "pdfjs-dist"
    "react"
    "react-dom"
    "sharp"
    "signature_pad"
    "tesseract.js"
    "uuid"
    "prettier"
)

INSTALLED=0
MISSING=0

for dep in "${DEPS[@]}"; do
    if [ -d "node_modules/$dep" ]; then
        echo "✅ $dep"
        ((INSTALLED++))
    else
        echo "❌ $dep"
        ((MISSING++))
    fi
done

echo ""
echo "================================================================================"
echo "SUMMARY"
echo "================================================================================"
echo "✅ Installed: $INSTALLED/${#DEPS[@]}"
echo "❌ Missing:   $MISSING/${#DEPS[@]}"

echo ""
echo "================================================================================"
echo "PACKAGE.JSON INFO"
echo "================================================================================"
echo "Total dependencies:"
grep -c '"' package.json | head -1

echo ""
echo "Node modules size:"
du -sh node_modules

echo ""
echo "================================================================================"
echo "BUILD VERIFICATION"
echo "================================================================================"
ls -lah .next/static/ 2>/dev/null | head -10 || echo "Build directory not fully ready"

echo ""
echo "Done!"
