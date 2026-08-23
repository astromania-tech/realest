import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { z } from "zod";

export const signedUrlSchema = z.object({
  file_name: z.string().min(1),
  file_type: z.string().min(1),
  file_size: z
    .number()
    .positive()
    .max(10 * 1024 * 1024), // 10MB max
  bucket: z
    .enum(["property-media", "property-documents", "avatars"])
    .default("property-media"),
  user_id: z.string().uuid(),
  property_id: z.string().uuid().optional(),
});

export type SignedUrlInput = z.infer<typeof signedUrlSchema>;

export interface SignedUrlResponse {
  signed_url: string;
  public_url: string;
  file_path: string;
  token: string;
}

export async function generateSignedUrl(input: SignedUrlInput): Promise<SignedUrlResponse> {
  const supabase = await createClient();
  const serviceSupabase = createServiceClient();

  // Validate permissions for property-related buckets
  if (input.bucket === "property-media" || input.bucket === "property-documents") {
    if (!input.property_id) {
      throw new Error("Property ID required for property-related uploads");
    }

    // Check if user owns the property, is the assigned agent, or is admin
    const { data: userRow } = await supabase
      .from("users")
      .select("role")
      .eq("id", input.user_id)
      .single();

    if (!userRow || !["owner", "agent", "admin"].includes(userRow.role)) {
      throw new Error("Unauthorized: Only property owners, agents or admins can upload");
    }

    // Verify property ownership (unless admin)
    if (userRow.role !== "admin") {
      const { data: property } = await supabase
        .from("properties")
        .select("owner_id, agent_id, owners(profile_id)")
        .eq("id", input.property_id)
        .single();

      if (!property) {
        throw new Error(`Property not found: ${input.property_id}. It may have been deleted or doesn't exist yet.`);
      }

      // owner_id is now owners.id (not profile UUID); resolve via the nested owners.profile_id
      // Supabase returns a single object for many-to-one FK joins
      const ownersData = property.owners as { profile_id: string } | { profile_id: string }[] | null;
      const ownerProfileId = Array.isArray(ownersData) ? ownersData[0]?.profile_id : ownersData?.profile_id;
      const { data: agentRow } = await supabase
        .from("agents")
        .select("id, profile_id")
        .eq("profile_id", input.user_id)
        .maybeSingle();

      if (ownerProfileId !== input.user_id && property.agent_id !== agentRow?.id) {
        throw new Error(`Access denied: You don't own property ${input.property_id}`);
      }
    }
  } else if (input.bucket === "avatars") {
    // For avatars, only require an authenticated user.
    // Onboarding can upload a photo before the full profile row exists.
    const { data: authUser, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser?.user || authUser.user.id !== input.user_id) {
      throw new Error("Unauthorized: user session is invalid");
    }
  }

  // Generate unique file path
  const fileExtension = input.file_name.split(".").pop();
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  let filePath: string;

  if (input.bucket === "avatars") {
    filePath = `${input.user_id}/${timestamp}_${randomId}.${fileExtension}`;
  } else if (input.bucket === "property-media" || input.bucket === "property-documents") {
    filePath = `${input.user_id}/${input.property_id}/${timestamp}_${randomId}.${fileExtension}`;
  } else {
    filePath = `${timestamp}_${randomId}.${fileExtension}`;
  }

  // Generate signed URL for upload
  const { data: signedUrlData, error: signedUrlError } =
    await serviceSupabase.storage
      .from(input.bucket)
      .createSignedUploadUrl(filePath);

  if (signedUrlError) {
    throw new Error(`Failed to generate upload URL: ${signedUrlError.message}`);
  }

  // Generate public URL for accessing the file after upload
  const { data: publicUrlData } = serviceSupabase.storage
    .from(input.bucket)
    .getPublicUrl(filePath);

  return {
    signed_url: signedUrlData.signedUrl,
    public_url: publicUrlData.publicUrl,
    file_path: filePath,
    token: signedUrlData.token,
  };
}