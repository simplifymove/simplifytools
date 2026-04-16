import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import sharp from "sharp";

const execAsync = promisify(exec);
const MAX_FILE_SIZE = 20 * 1024 * 1024;

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "unknown";
}

function validateImageType(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return true;
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;
  return false;
}

async function removeBackgroundWithRembg(imageBuffer: Buffer, hqMode: boolean): Promise<Buffer> {
  const tempDir = os.tmpdir();
  const uniqueId = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const inputPath = path.join(tempDir, `rembg_in_${uniqueId}.png`);
  const outputPath = path.join(tempDir, `rembg_out_${uniqueId}.png`);
  const pythonScript = path.join(tempDir, `rembg_script_${uniqueId}.py`);

  try {
    await fs.writeFile(inputPath, imageBuffer);
    
    const model = hqMode ? "birefnet-general" : "u2net";
    // Use JSON.stringify to properly escape paths
    const pythonCode = `import sys
import os
from PIL import Image
from rembg import remove, new_session

input_path = ${JSON.stringify(inputPath)}
output_path = ${JSON.stringify(outputPath)}
model = ${JSON.stringify(model)}

try:
    print(f"[DEBUG] Loading image from: {input_path}")
    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found: {input_path}")
    
    input_img = Image.open(input_path)
    print(f"[DEBUG] Image opened: {input_img.size} {input_img.mode}")
    print(f"[DEBUG] Starting background removal with model: {model}")
    
    # Create session with specific model
    session = new_session(model)
    output_img = remove(input_img, session=session)
    print(f"[DEBUG] Background removed successfully")
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    output_img.save(output_path, "PNG")
    print(f"[DEBUG] Saved to: {output_path}")
    print(f"SUCCESS: {os.path.getsize(output_path)} bytes")
except Exception as e:
    import traceback
    print(f"ERROR: {str(e)}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)
`;

    await fs.writeFile(pythonScript, pythonCode);
    console.log(`[bg-remove] Processing with ${model} model (HQ: ${hqMode})`);
    
    const { stdout, stderr } = await execAsync(`python "${pythonScript}"`, { 
      timeout: 120000, 
      maxBuffer: 50 * 1024 * 1024
    });
    
    console.log(`[bg-remove] Python output:`, stdout);
    if (stderr) console.log(`[bg-remove] Python stderr:`, stderr);
    
    const result = await fs.readFile(outputPath);
    console.log(`[bg-remove] Success: ${result.length} bytes output`);
    return result;
  } catch (error) {
    throw new Error(`Rembg failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});
    await fs.unlink(pythonScript).catch(() => {});
  }
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const startTime = Date.now();

  try {
    // Debug: Log request info
    console.log(`[bg-remove] REQUEST INFO:`);
    console.log(`  Method: ${request.method}`);
    console.log(`  Content-Type: ${request.headers.get('content-type')}`);
    console.log(`  Content-Length: ${request.headers.get('content-length')}`);
    console.log(`  URL: ${request.url}`);
    
    const formData = await request.formData();
    
    // Debug: Log all form fields
    console.log(`[bg-remove] FormData fields received:`);
    let fieldCount = 0;
    for (const [key, value] of formData.entries()) {
      fieldCount++;
      if (value instanceof File) {
        console.log(`  - ${key}: File(name=${value.name}, size=${value.size}, type=${value.type})`);
      } else {
        console.log(`  - ${key}: ${value}`);
      }
    }
    console.log(`  Total fields: ${fieldCount}`);
    
    const file = formData.get("file") as File;
    const hqParam = formData.get("hq") as string;
    const format = (formData.get("format") as string) || "png";

    if (!file) {
      const keysArray = Array.from(formData.keys());
      console.error(`[bg-remove] ERROR: No file in formData. Keys received: ${keysArray.join(", ")} (${keysArray.length} keys)`);
      return NextResponse.json({ error: "No file provided", debug: { keysReceived: keysArray } }, { status: 400 });
    }
    console.log(`[bg-remove] File: ${file.name} (${file.size} bytes) from ${clientIp}`);

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Max ${MAX_FILE_SIZE / (1024 * 1024)}MB` }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!validateImageType(buffer)) {
      return NextResponse.json({ error: "Invalid image type. Supported: JPEG, PNG, WebP" }, { status: 400 });
    }

    const hqMode = hqParam === "true";
    let resultBuffer = await removeBackgroundWithRembg(buffer, hqMode);
    let contentType = "image/png";

    if (format === "jpg" || format === "jpeg") {
      resultBuffer = await sharp(resultBuffer).flatten({ background: { r: 255, g: 255, b: 255 } }).jpeg({ quality: 90, progressive: true }).toBuffer();
      contentType = "image/jpeg";
    } else if (format === "webp") {
      resultBuffer = await sharp(resultBuffer).webp({ quality: 85 }).toBuffer();
      contentType = "image/webp";
    } else {
      resultBuffer = await sharp(resultBuffer).png({ progressive: true, compressionLevel: 9 }).toBuffer();
      contentType = "image/png";
    }

    const elapsed = Date.now() - startTime;
    console.log(`[bg-remove] Complete: ${elapsed}ms, output: ${format}, size: ${resultBuffer.length} bytes`);

    return new Response(new Uint8Array(resultBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store",
        "X-Processing-Time": `${elapsed}ms`,
      },
    });
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[bg-remove] ERROR (${elapsed}ms) from ${clientIp}:`, msg);
    return NextResponse.json({ error: msg || "Processing failed" }, { status: 500 });
  }
}