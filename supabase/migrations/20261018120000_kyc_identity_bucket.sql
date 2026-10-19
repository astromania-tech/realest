-- Private copy of the face photo sent to Youverify.
-- No authenticated policy. The service role uploads the object and signs a short URL for an admin.
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-identity', 'kyc-identity', false)
ON CONFLICT (id) DO NOTHING;
