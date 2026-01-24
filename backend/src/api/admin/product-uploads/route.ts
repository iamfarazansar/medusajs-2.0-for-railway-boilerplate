import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

interface Base64UploadInput {
  file: string; // base64 encoded file content
  filename: string;
  mimeType: string;
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const input = req.body as Base64UploadInput;

    if (!input.file || !input.filename) {
      return res.status(400).json({ error: "File and filename are required" });
    }

    // Decode base64 to buffer
    const fileBuffer = Buffer.from(input.file, "base64");

    // Get the file module service
    const fileModuleService = req.scope.resolve(Modules.FILE) as any;

    // Generate a unique filename
    const timestamp = Date.now();
    const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `products/${timestamp}-${sanitizedFilename}`;

    // Upload to S3 using Medusa's file service
    const uploadedFiles = await fileModuleService.createFiles([
      {
        filename: storagePath,
        mimeType: input.mimeType || "application/octet-stream",
        content: fileBuffer,
        access: "public", // Set public-read ACL so files are accessible via URL
      },
    ]);

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(500).json({ error: "File upload failed" });
    }

    return res.json({
      file: {
        id: uploadedFiles[0].id,
        url: uploadedFiles[0].url,
        filename: sanitizedFilename,
        mimeType: input.mimeType,
        size: fileBuffer.length,
      },
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: error.message || "Upload failed" });
  }
}
