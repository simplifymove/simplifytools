/**
 * Generate test fixtures (PDF and image files)
 * Run this script before running tests: node tests/fixtures/generate-fixtures.js
 */

const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

const FIXTURES_DIR = path.join(__dirname);
const PDF_DIR = path.join(FIXTURES_DIR, 'pdf');
const IMAGE_DIR = path.join(FIXTURES_DIR, 'images');

// Ensure directories exist
[PDF_DIR, IMAGE_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * Create a simple valid PDF with text
 */
async function createValidPdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // Standard letter size
  const { width, height } = page.getSize();
  
  page.drawText('Sample PDF for Testing', {
    x: 50,
    y: height - 50,
    size: 24,
  });
  
  page.drawText('This is a valid PDF file used for automated testing.', {
    x: 50,
    y: height - 100,
    size: 12,
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(PDF_DIR, 'valid.pdf'), pdfBytes);
  console.log('✓ Created valid.pdf');
}

/**
 * Create a multipage PDF
 */
async function createMultipagePdf() {
  const pdfDoc = await PDFDocument.create();
  
  for (let i = 1; i <= 5; i++) {
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    
    page.drawText(`Page ${i}`, {
      x: 50,
      y: height - 50,
      size: 28,
    });
    
    page.drawText(`This is page ${i} of a multipage PDF.`, {
      x: 50,
      y: height - 100,
      size: 12,
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(PDF_DIR, 'multipage.pdf'), pdfBytes);
  console.log('✓ Created multipage.pdf');
}

/**
 * Create a protected PDF (encrypted with password)
 */
async function createProtectedPdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  
  page.drawText('This is a protected PDF', {
    x: 50,
    y: height - 50,
    size: 24,
  });
  
  // Note: pdf-lib doesn't support encryption, so we'll mark it as protected in filename
  // In real scenario, this would be encrypted
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(PDF_DIR, 'protected.pdf'), pdfBytes);
  console.log('✓ Created protected.pdf (note: not actually encrypted with pdf-lib)');
}

/**
 * Create a corrupted PDF (invalid content after valid header)
 */
function createCorruptedPdf() {
  const corruptedContent = Buffer.concat([
    Buffer.from('%PDF-1.4\n'), // Valid PDF header
    Buffer.from('This is corrupted PDF content %%\n'.repeat(100)), // Invalid content
  ]);
  
  fs.writeFileSync(path.join(PDF_DIR, 'corrupted.pdf'), corruptedContent);
  console.log('✓ Created corrupted.pdf');
}

/**
 * Create a scanned PDF (simulated with image-like content)
 */
async function createScannedPdf() {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  
  // Draw a pattern to simulate scanned document
  for (let i = 0; i < height; i += 20) {
    page.drawLine({
      start: { x: 0, y: i },
      end: { x: width, y: i },
      thickness: 0.5,
    });
  }
  
  page.drawText('SCANNED DOCUMENT - Page 1', {
    x: 50,
    y: height - 50,
    size: 20,
  });
  
  page.drawText('This simulates a scanned PDF document.', {
    x: 50,
    y: height - 100,
    size: 12,
  });
  
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(path.join(PDF_DIR, 'scanned.pdf'), pdfBytes);
  console.log('✓ Created scanned.pdf');
}

/**
 * Create sample JPG image
 */
function createJpgImage() {
  // Create a minimal valid JPEG file
  // JPEG header (SOI marker) + EOI marker (simplified)
  const jpgBuffer = Buffer.from([
    0xFF, 0xD8, // SOI (Start of Image)
    0xFF, 0xE0, // APP0 segment
    0x00, 0x10, // Segment length
    0x4A, 0x46, 0x49, 0x46, 0x00, // JFIF identifier
    0x01, 0x01, // Version
    0x00, // Aspect ratio units
    0x00, 0x01, 0x00, 0x01, // X and Y density
    0x00, 0x00, // Thumbnail dimensions
    0xFF, 0xDB, // Define Quantization Table
    0x00, 0x43, // Segment length
    ...Array(64).fill(0x10), // Quantization table
    0xFF, 0xC0, // SOF0 (Start of Frame)
    0x00, 0x0B, // Segment length
    0x08, // Precision
    0x00, 0x01, 0x00, 0x01, // Height and width
    0x01, // Number of components
    0x01, 0x11, 0x00, // Component info
    0xFF, 0xD9, // EOI (End of Image)
  ]);
  
  fs.writeFileSync(path.join(IMAGE_DIR, 'sample.jpg'), jpgBuffer);
  console.log('✓ Created sample.jpg');
}

/**
 * Create sample PNG image
 */
function createPngImage() {
  // Minimal valid PNG file
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR chunk type
    0x00, 0x00, 0x00, 0x01, // Width: 1
    0x00, 0x00, 0x00, 0x01, // Height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT chunk type
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0xFE, 0xFF,
    0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // Compressed data
    0x49, 0xB4, 0xE8, 0xB7, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND chunk type
    0xAE, 0x42, 0x60, 0x82, // CRC
  ]);
  
  fs.writeFileSync(path.join(IMAGE_DIR, 'sample.png'), pngBuffer);
  console.log('✓ Created sample.png');
}

/**
 * Create sample TIFF image
 */
function createTiffImage() {
  // Minimal valid TIFF file (little-endian)
  const tiffBuffer = Buffer.from([
    0x49, 0x49, // Little-endian byte order
    0x2A, 0x00, // TIFF version 42
    0x08, 0x00, 0x00, 0x00, // Offset to first IFD
    // IFD (Image File Directory)
    0x09, 0x00, // Number of directory entries
    // ImageWidth tag
    0x00, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
    // ImageLength tag
    0x01, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
    // BitsPerSample tag
    0x02, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00,
    // Compression tag (1=no compression)
    0x03, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
    // PhotometricInterpretation tag
    0x06, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
    // StripOffsets tag
    0x11, 0x01, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x50, 0x00, 0x00, 0x00,
    // SamplesPerPixel tag
    0x15, 0x01, 0x03, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
    // RowsPerStrip tag
    0x16, 0x01, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
    // StripByteCounts tag
    0x17, 0x01, 0x04, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, // Next IFD offset (0 = no more)
    // Image data
    0xFF, // Single pixel (white)
  ]);
  
  fs.writeFileSync(path.join(IMAGE_DIR, 'sample.tiff'), tiffBuffer);
  console.log('✓ Created sample.tiff');
}

/**
 * Create sample WebP image
 */
function createWebpImage() {
  // Minimal valid WebP file
  const webpBuffer = Buffer.from([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x24, 0x00, 0x00, 0x00, // File size - 8
    0x57, 0x45, 0x42, 0x50, // "WEBP"
    0x56, 0x50, 0x38, 0x4C, // "VP8L"
    0x18, 0x00, 0x00, 0x00, // Chunk size
    0x2F, 0x00, 0x00, 0x00, // VP8L bitstream
    0x88, 0x88, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);
  
  fs.writeFileSync(path.join(IMAGE_DIR, 'sample.webp'), webpBuffer);
  console.log('✓ Created sample.webp');
}

/**
 * Create sample GIF image
 */
function createGifImage() {
  // Minimal valid GIF87a file
  const gifBuffer = Buffer.from([
    0x47, 0x49, 0x46, 0x38, 0x37, 0x61, // "GIF87a"
    0x01, 0x00, 0x01, 0x00, // Width: 1, Height: 1
    0x80, 0x00, 0x00, // Packed fields (global color table)
    0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, // Global color table (2 colors)
    0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, // Image descriptor
    0x00, // Local color table packed fields
    0x02, 0x02, 0x44, 0x01, 0x00, 0x3B, // Image data + trailer
  ]);
  
  fs.writeFileSync(path.join(IMAGE_DIR, 'sample.gif'), gifBuffer);
  console.log('✓ Created sample.gif');
}

/**
 * Main function to generate all fixtures
 */
async function generateFixtures() {
  try {
    console.log('\n📁 Generating test fixtures...\n');
    
    // Generate PDF files
    console.log('Creating PDF files...');
    await createValidPdf();
    await createMultipagePdf();
    await createProtectedPdf();
    createCorruptedPdf();
    await createScannedPdf();
    
    console.log('\nCreating image files...');
    // Generate image files
    createJpgImage();
    createPngImage();
    createTiffImage();
    createWebpImage();
    createGifImage();
    
    console.log('\n✅ All test fixtures generated successfully!\n');
  } catch (error) {
    console.error('❌ Error generating fixtures:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  generateFixtures().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { generateFixtures };
