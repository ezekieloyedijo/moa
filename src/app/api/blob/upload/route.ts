import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Issues short-lived tokens for Vercel Blob CLIENT uploads.
 * The browser uploads the (already compressed WebP) file straight to Blob,
 * so the image never passes through a serverless function.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user) throw new Error("Unauthorized");
        return {
          // Images only — videos belong on YouTube/Vimeo, never in Blob.
          allowedContentTypes: ["image/webp", "image/jpeg", "image/png", "image/avif", "image/svg+xml"],
          maximumSizeInBytes: 4 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      // Called by Vercel after upload (not in local dev). Nothing to do: the
      // dashboard saves the URL with the form.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
