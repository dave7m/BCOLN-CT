import { supabaseAdmin } from "../../offchain/supabaseClient";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed" });

    const { base64, filename } = req.body as {
      base64?: string;
      filename?: string;
    };

    if (!base64 || !filename) {
      return res.status(400).json({ error: "Missing data" });
    }

    // Check if supabaseAdmin is properly initialized
    if (!supabaseAdmin) {
      console.error("supabaseAdmin is not initialized");
      return res.status(500).json({ error: "Storage client not initialized" });
    }

    // Process the base64 data
    const base64Data = base64.split(";base64,").pop();
    if (!base64Data) {
      return res.status(400).json({ error: "Invalid base64 format" });
    }

    const buffer = Buffer.from(base64Data, "base64");

    // Clean the filename
    const safeFilename = filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w.-]/g, "_")
      .replace(/_{2,}/g, "_");

    // Generate a unique path with a cleaned filename
    const path = `uploads/${Date.now()}-${safeFilename}`;

    console.log("Uploading to path:", path);

    // Use supabaseAdmin for storage operations
    const { error } = await supabaseAdmin.storage
      .from("jackpot-images")
      .upload(path, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("jackpot-images").getPublicUrl(path);

    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error("Unexpected error in upload handler:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
