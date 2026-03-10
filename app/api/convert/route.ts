import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

// Max execution time: 10 minutes
export const maxDuration = 600;

interface ConversionRequest {
  from_format: string;
  to_format: string;
  options?: {
    quality?: number;
    dpi?: number;
    fps?: number;
    scale?: number;
    bg_color?: string;
    [key: string]: any;
  };
}

interface ConversionResponse {
  ok: boolean;
  error?: string;
  stderr?: string;
  stdout?: string;
  output_format?: string;
  file_size?: number;
  duration_ms?: number;
}

export async function POST(request: Request): Promise<Response> {
  const startTime = Date.now();
  const uuid = randomUUID();
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `convert-input-${uuid}.tmp`);
  const outputFile = path.join(tempDir, `convert-output-${uuid}.tmp`);

  try {
    // Parse FormData
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const conversionConfig = JSON.parse(
      (formData.get("config") as string) || "{}"
    ) as ConversionRequest;

    console.log(`[API] Conversion request: ${conversionConfig.from_format} → ${conversionConfig.to_format}`);
    console.log(`[API] UUID: ${uuid}`);

    // Validate request
    if (!imageFile) {
      return Response.json(
        { ok: false, error: "No image provided" },
        { status: 400 }
      );
    }

    if (!conversionConfig.from_format || !conversionConfig.to_format) {
      return Response.json(
        { ok: false, error: "Missing from_format or to_format" },
        { status: 400 }
      );
    }

    // Save uploaded image to temp file
    console.log(`[API] Saving uploaded image...`);
    const buffer = await imageFile.arrayBuffer();
    fs.writeFileSync(inputFile, Buffer.from(buffer));
    console.log(`[API] Input file saved: ${inputFile} (${buffer.byteLength} bytes)`);

    // Build Python script path
    const scriptPath = path.join(process.cwd(), "python", "convert.py");
    
    if (!fs.existsSync(scriptPath)) {
      console.error(`[API] Script not found: ${scriptPath}`);
      return Response.json(
        { ok: false, error: "Conversion service not available" },
        { status: 500 }
      );
    }

    console.log(`[API] Using converter: ${scriptPath}`);

    // Build arguments array (safe from command injection)
    const args = [
      scriptPath,
      "--input", inputFile,
      "--output", outputFile,
      "--from", conversionConfig.from_format,
      "--to", conversionConfig.to_format,
      "--options", JSON.stringify(conversionConfig.options || {}),
    ];

    console.log(`[API] Executing: python ${args.slice(0, 4).join(' ')} ...`);

    // Execute Python script safely with execFile
    return new Promise((resolve) => {
      execFile(
        "python",
        args,
        {
          timeout: 600000, // 10 min timeout
          maxBuffer: 100 * 1024 * 1024, // 100MB buffer
          cwd: process.cwd(),
        },
        (error, stdout, stderr) => {
          try {
            const duration = Date.now() - startTime;

            // Log output
            if (stdout) console.log(`[stdout] ${stdout}`);
            if (stderr) console.log(`[stderr] ${stderr}`);

            // Handle execution errors
            if (error) {
              console.error(`[ERROR] Code ${error.code}: ${error.message}`);
              
              const response: ConversionResponse = {
                ok: false,
                error: `Conversion failed: ${error.message}`,
                stderr: stderr || error.message,
                stdout: stdout,
              };

              return resolve(
                Response.json(response, { status: 500 })
              );
            }

            // Check if output was created
            if (!fs.existsSync(outputFile)) {
              console.error(`[ERROR] Output file not created`);
              
              const response: ConversionResponse = {
                ok: false,
                error: "Output file not created",
                stderr: stderr,
                stdout: stdout,
              };

              return resolve(
                Response.json(response, { status: 500 })
              );
            }

            // Stream output file
            const outputBuffer = fs.readFileSync(outputFile);
            const fileSize = outputBuffer.length;
            
            console.log(`[API] ✓ Conversion successful: ${conversionConfig.from_format} → ${conversionConfig.to_format}`);
            console.log(`[API] Output size: ${(fileSize / 1024 / 1024).toFixed(2)} MB, Duration: ${duration}ms`);

            // Return file as download
            const mimeTypes: { [key: string]: string } = {
              jpg: "image/jpeg",
              png: "image/png",
              webp: "image/webp",
              gif: "image/gif",
              bmp: "image/bmp",
              tiff: "image/tiff",
              pdf: "application/pdf",
              mp4: "video/mp4",
              txt: "text/plain",
              json: "application/json",
              zip: "application/zip",
            };

            const mimeType = mimeTypes[conversionConfig.to_format] || "application/octet-stream";
            const filename = `converted.${conversionConfig.to_format}`;

            resolve(
              new Response(outputBuffer, {
                headers: {
                  "Content-Type": mimeType,
                  "Content-Disposition": `attachment; filename="${filename}"`,
                  "Content-Length": fileSize.toString(),
                },
              })
            );
          } catch (e) {
            console.error(`[RESPONSE ERROR] ${e}`);
            resolve(
              Response.json(
                { ok: false, error: "Server error" },
                { status: 500 }
              )
            );
          } finally {
            // Guaranteed cleanup
            try {
              if (fs.existsSync(inputFile)) {
                fs.unlinkSync(inputFile);
                console.log(`[CLEANUP] Removed input file`);
              }
              if (fs.existsSync(outputFile)) {
                fs.unlinkSync(outputFile);
                console.log(`[CLEANUP] Removed output file`);
              }
            } catch (cleanupError) {
              console.warn(`[CLEANUP WARNING] ${cleanupError}`);
            }
          }
        }
      );
    });
  } catch (error) {
    console.error(`[REQUEST ERROR] ${error}`);

    // Cleanup on error
    try {
      if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    } catch (_) {}

    return Response.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
