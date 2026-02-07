import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

/**
 * POST /admin/rug-stories/upload
 * Upload an image for a rug story to S3 using multipart/form-data
 * Stores in stories/[slug]/ directory structure
 *
 * Form fields:
 * - file: The image file (required)
 * - storySlug: Slug of the story for folder organization (required)
 * - imageType: "thumbnail" | "step" (required)
 * - stepIndex: Optional step index for step images
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    // File is attached by multer middleware
    const file = (req as any).file as
      | { originalname: string; mimetype: string; buffer: Buffer; size: number }
      | undefined;

    // Form fields are in req.body
    const { storySlug, imageType, stepIndex } = req.body as {
      storySlug?: string;
      imageType?: string;
      stepIndex?: string;
    };

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    if (!storySlug) {
      return res.status(400).json({ error: "storySlug is required" });
    }

    if (!imageType || !["thumbnail", "step"].includes(imageType)) {
      return res
        .status(400)
        .json({ error: "imageType must be 'thumbnail' or 'step'" });
    }

    // Get the file module service
    const fileModuleService = req.scope.resolve(Modules.FILE) as any;

    // Sanitize the slug and filename
    const sanitizedSlug = storySlug
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .toLowerCase();
    const timestamp = Date.now();
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Build storage path: stories/[slug]/[type]-[timestamp]-[filename]
    let storagePath: string;
    if (imageType === "thumbnail") {
      storagePath = `stories/${sanitizedSlug}/thumbnail-${timestamp}-${sanitizedFilename}`;
    } else {
      const stepNum = stepIndex ? parseInt(stepIndex, 10) : 0;
      storagePath = `stories/${sanitizedSlug}/step-${stepNum}-${timestamp}-${sanitizedFilename}`;
    }

    // Upload to S3 using Medusa's file service
    const uploadedFiles = await fileModuleService.createFiles([
      {
        filename: storagePath,
        mimeType: file.mimetype,
        content: file.buffer,
        access: "public", // Publicly accessible
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
        mimeType: file.mimetype,
        size: file.size,
        path: storagePath,
      },
    });
  } catch (error: any) {
    console.error("Rug story upload error:", error);
    return res.status(500).json({ error: error.message || "Upload failed" });
  }
}
