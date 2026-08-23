import { randomUUID } from "node:crypto";

import { createServiceClient } from "@/lib/supabase/service";

export type ValidationAssetSource =
  | {
      kind: "url";
      fileUrl: string;
      mimeType?: string;
    }
  | {
      kind: "inline";
      contentBase64: string;
      mimeType: string;
      originalName?: string;
    }
  | {
      kind: "storage";
      bucket: string;
      path: string;
      mimeType?: string;
      originalName?: string;
    };

function sanitizeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120) || "asset";
}

export async function uploadValidationAsset(options: {
  file: File;
  bucket: "property-media" | "property-documents";
  propertyId: string;
  jobKind: "document" | "image";
}): Promise<ValidationAssetSource> {
  const serviceSupabase = createServiceClient();
  const fileName = sanitizeFileName(options.file.name || "validation-asset");
  const path = `${options.propertyId}/${options.jobKind}/${randomUUID()}-${fileName}`;
  const arrayBuffer = await options.file.arrayBuffer();

  const uploadResult = await serviceSupabase.storage.from(options.bucket).upload(path, new Uint8Array(arrayBuffer), {
    contentType: options.file.type || "application/octet-stream",
    upsert: true,
  });

  if (uploadResult.error) {
    throw new Error(`Failed to upload validation asset: ${uploadResult.error.message}`);
  }

  return {
    kind: "storage",
    bucket: options.bucket,
    path,
    mimeType: options.file.type || undefined,
    originalName: options.file.name,
  };
}

export async function createInlineValidationAsset(file: File): Promise<ValidationAssetSource> {
  const arrayBuffer = await file.arrayBuffer();

  return {
    kind: "inline",
    contentBase64: Buffer.from(arrayBuffer).toString("base64"),
    mimeType: file.type || "application/octet-stream",
    originalName: file.name,
  };
}

async function downloadStorageAsset(bucket: string, path: string): Promise<{ buffer: Buffer; mimeType: string }> {
  const serviceSupabase = createServiceClient();
  const { data, error } = await serviceSupabase.storage.from(bucket).download(path);

  if (error || !data) {
    throw new Error(error?.message || `Failed to download ${bucket}/${path}`);
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  return {
    buffer,
    mimeType: data.type || "application/octet-stream",
  };
}

function parseSupabaseStorageUrl(fileUrl: string): { bucket: string; path: string } | null {
  try {
    const url = new URL(fileUrl);
    const storagePrefix = "/storage/v1/object/";
    const index = url.pathname.indexOf(storagePrefix);

    if (index === -1) {
      return null;
    }

    const parts = url.pathname.slice(index + storagePrefix.length).split("/").filter(Boolean);
    if (parts[0] === "public" || parts[0] === "private") {
      parts.shift();
    }

    const bucket = parts.shift();
    const path = parts.join("/");

    if (!bucket || !path) {
      return null;
    }

    return { bucket, path };
  } catch {
    return null;
  }
}

export async function readValidationAsset(source: ValidationAssetSource): Promise<{ buffer: Buffer; mimeType: string }> {
  if (source.kind === "inline") {
    return {
      buffer: Buffer.from(source.contentBase64, "base64"),
      mimeType: source.mimeType || "application/octet-stream",
    };
  }

  if (source.kind === "storage") {
    return downloadStorageAsset(source.bucket, source.path);
  }

  const fetchResult = await fetch(source.fileUrl);
  if (fetchResult.ok) {
    return {
      buffer: Buffer.from(await fetchResult.arrayBuffer()),
      mimeType: fetchResult.headers.get("content-type")?.split(";")[0] ?? source.mimeType ?? "application/octet-stream",
    };
  }

  const storageLocation = parseSupabaseStorageUrl(source.fileUrl);
  if (storageLocation) {
    return downloadStorageAsset(storageLocation.bucket, storageLocation.path);
  }

  throw new Error(`Failed to fetch validation asset: ${fetchResult.status} ${fetchResult.statusText}`);
}
