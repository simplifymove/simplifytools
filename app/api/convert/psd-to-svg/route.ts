import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

export const runtime = "nodejs";
export const maxDuration = 600;

const MAX_FILE_SIZE = 200 * 1024 * 1024;
const SVG_IMAGE_PATTERN = /<image\b[^>]*(?:href|xlink:href)=["']data:image\/png;base64,/i;

function cleanupTemporaryFiles(...files: string[]) {
  for (const file of files) {
    try {
      fs.rmSync(file, { force: true });
    } catch (error) {
      console.error("[PSD-TO-SVG] Temporary-file cleanup failed", error);
    }
  }
}

function isValidPsdHeader(buffer: Buffer): boolean {
  if (buffer.length < 26) return false;

  // Photoshop PSD: signature 8BPS, version 1, six reserved zero bytes.
  if (buffer.toString("ascii", 0, 4) !== "8BPS") return false;
  if (buffer.readUInt16BE(4) !== 1) return false;

  for (let i = 6; i < 12; i++) {
    if (buffer[i] !== 0) return false;
  }

  const channels = buffer.readUInt16BE(12);
  const height = buffer.readUInt32BE(14);
  const width = buffer.readUInt32BE(18);
  const depth = buffer.readUInt16BE(22);
  const colorMode = buffer.readUInt16BE(24);

  return (
    channels >= 1 &&
    channels <= 56 &&
    width > 0 &&
    height > 0 &&
    [1, 8, 16, 32].includes(depth) &&
    colorMode <= 9
  );
}

function runConverter(
  executable: string,
  args: string[],
  environment: NodeJS.ProcessEnv
): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      executable,
      args,
      {
        timeout: 600000,
        maxBuffer: 10 * 1024 * 1024,
        cwd: process.cwd(),
        env: environment,
        windowsHide: true,
      },
      (error) => {
        if (error) reject(error);
        else resolve();
      }
    );
  });
}

export async function POST(request: Request): Promise<Response> {
  const uuid = randomUUID();
  const tempDir = os.tmpdir();
  const inputFile = path.join(tempDir, `convert-input-${uuid}.psd`);
  const outputFile = path.join(tempDir, `convert-output-${uuid}.svg`);

  try {
    const formData = await request.formData();
    const value = formData.get("file");

    if (!(value instanceof File)) {
      return Response.json(
        { ok: false, error: "Please upload a PSD file." },
        { status: 400 }
      );
    }

    if (!value.name.toLowerCase().endsWith(".psd")) {
      return Response.json(
        { ok: false, error: "Only .psd files are supported." },
        { status: 400 }
      );
    }

    if (value.size === 0) {
      return Response.json(
        { ok: false, error: "The uploaded file is empty." },
        { status: 400 }
      );
    }

    if (value.size > MAX_FILE_SIZE) {
      return Response.json(
        { ok: false, error: "Maximum PSD file size is 200 MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await value.arrayBuffer());

    if (buffer.length > MAX_FILE_SIZE) {
      return Response.json(
        { ok: false, error: "Maximum PSD file size is 200 MB." },
        { status: 413 }
      );
    }

    if (!isValidPsdHeader(buffer)) {
      return Response.json(
        { ok: false, error: "Invalid or unsupported PSD file." },
        { status: 400 }
      );
    }

    const scriptPath = path.join(
      process.cwd(),
      "python",
      "convert.py"
    );

    if (!fs.existsSync(scriptPath)) {
      console.error("[PSD-TO-SVG] Converter script unavailable");
      return Response.json(
        { ok: false, error: "Conversion service unavailable." },
        { status: 503 }
      );
    }

    fs.writeFileSync(inputFile, buffer);

    const pythonExe =
      process.platform === "win32"
        ? "python"
        : "/var/www/simplifyconvertapp/venv/bin/python";

    const cleanEnv = { ...process.env };
    delete cleanEnv.PYTHONHOME;
    delete cleanEnv.PYTHONPATH;

    const args = [
      scriptPath,
      "--input", inputFile,
      "--output", outputFile,
      "--from", "psd",
      "--to", "svg",
      "--options", JSON.stringify({}),
    ];

    try {
      await runConverter(pythonExe, args, cleanEnv);
    } catch (error) {
      console.error("[PSD-TO-SVG] Conversion failed", error);
      return Response.json(
        {
          ok: false,
          error: "Unable to convert this PSD file. It may be corrupted or unsupported.",
        },
        { status: 422 }
      );
    }

    if (!fs.existsSync(outputFile)) {
      return Response.json(
        { ok: false, error: "The converter did not produce an SVG file." },
        { status: 422 }
      );
    }

    const output = fs.readFileSync(outputFile);

    const svg = output.toString("utf8");

    if (
      !/<svg\b/i.test(svg) ||
      !/<\/svg\s*>/i.test(svg) ||
      !SVG_IMAGE_PATTERN.test(svg)
    ) {
      console.error("[PSD-TO-SVG] Invalid SVG output");
      return Response.json(
        { ok: false, error: "The conversion produced an invalid SVG." },
        { status: 422 }
      );
    }

    return new Response(new Uint8Array(output), {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": 'attachment; filename="converted.svg"',
        "Content-Length": String(output.length),
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[PSD-TO-SVG] Unexpected API failure", error);
    return Response.json(
      { ok: false, error: "Unable to process this conversion request." },
      { status: 500 }
    );
  } finally {
    cleanupTemporaryFiles(inputFile, outputFile);
  }
}
