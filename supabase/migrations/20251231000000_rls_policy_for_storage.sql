-- Enable RLS on storage.objects
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('property-media', 'property-media', false),
  ('property-documents', 'property-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create policies (idempotent checks)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_insert_avatars_by_owner'
  ) THEN
    CREATE POLICY allow_insert_avatars_by_owner ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'::text
        AND (split_part(name, '/', 1) = auth.uid()::text)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_select_avatars_by_owner'
  ) THEN
    CREATE POLICY allow_select_avatars_by_owner ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'avatars'::text
        AND (split_part(name, '/', 1) = auth.uid()::text)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_insert_property_media_by_owner'
  ) THEN
    CREATE POLICY allow_insert_property_media_by_owner ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'property-media'::text
        AND (split_part(name, '/', 1) = auth.uid()::text)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_select_property_media_by_owner'
  ) THEN
    CREATE POLICY allow_select_property_media_by_owner ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'property-media'::text
        AND (split_part(name, '/', 1) = auth.uid()::text)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_insert_property_documents_by_owner'
  ) THEN
    CREATE POLICY allow_insert_property_documents_by_owner ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'property-documents'::text
        AND (split_part(name, '/', 1) = auth.uid()::text)
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_select_property_documents_by_owner'
  ) THEN
    CREATE POLICY allow_select_property_documents_by_owner ON storage.objects
      FOR SELECT TO authenticated
      USING (
        bucket_id = 'property-documents'::text
        AND (split_part(name, '/', 1) = auth.uid()::text)
      );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Grant SELECT and INSERT to authenticated role
GRANT SELECT, INSERT ON storage.objects TO authenticated;