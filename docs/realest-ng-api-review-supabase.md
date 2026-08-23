# RealEST API — Implementation Guide

Below is a concise, actionable API design that maps to your database schema and the RLS policies applied. It focuses on secure, predictable endpoints that work with Supabase Auth and the RLS rules (using `auth.uid()` and JWT `role` claims). Replace `role` claim name if your JWT uses a different claim.

---

## Assumptions

- Authenticated requests include a Supabase JWT with a `role` claim (or adjust to your claim name).
- Clients use Supabase client libraries or direct REST/RPC endpoints.
- Server-side/background jobs use SUPABASE_SERVICE_ROLE_KEY (never expose to clients).
- RLS policies and helper function `public.current_user_id()` exist as applied.

---

## Common patterns / Cross-cutting concerns

- Authentication:
    
    - Use Supabase Auth for signup/login.
    - All protected endpoints require `Authorization: Bearer <access_token>`.
    - Admin-only operations run server-side with the service role key.
- Pagination:
    
    - Use limit/offset or keyset pagination. Example: `?limit=20&after=created_at:2025-01-01T00:00:00Z`.
- Filtering & Sorting:
    
    - Filters: city, state, price range, bedrooms, property_type, listing_type, status, agent_id, owner_id.
    - Ensure queries use indexed columns.
- Search:
    
    - Use trigram (pg_trgm) or full-text search on title/description.
    - For fuzzy search, use `ILIKE` or `similarity()` with trigram indexes.
- Geo queries:
    
    - Use PostGIS and ST_DWithin on the indexed geog expression to find properties within radius.
- Rate limiting & abuse:
    
    - Enforce limits at API/edge layer for actions like inquiry creation or reviews posting.
- Validation:
    
    - Validate fields server-side (price numeric, allowed enums etc.).
- Background jobs:
    
    - Use Edge Functions or server processes for image processing, KYC calls, payments.
- Notifications:
    
    - Insert into `public.notifications`; use Realtime broadcasts for push.

---

## API Endpoints (Resource by Resource)

1. Authentication & Profile

- POST /auth/signup
    
    - Handled by Supabase Auth. After signup, create `profiles` row with `id = auth.uid()`.
- GET /profile
    
    - Auth: required
    - Implementation: `SELECT * FROM public.profiles WHERE id = auth.uid()`
    - RLS: `profiles_select_own_or_admin`
- PATCH /profile
    
    - Auth: required
    - Implementation: `UPDATE public.profiles SET ... WHERE id = auth.uid()`
    - RLS: `profiles_update_own`
- GET /profiles/:id
    
    - Auth: optional / authenticated
    - Note: Only owners/admins can view profiles unless a public policy is added.*

Notes:

- Ensure `profiles` insertion sets `id = auth.uid()` to satisfy RLS.

---

1. Properties (Listings)

- GET /properties
    
    - Auth: optional
    - Query params: `page`, `limit`, `city`, `min_price`, `max_price`, `bedrooms`, `property_type`, `listing_type`, `q` (search), `lat`, `lng`, `radius_km`, `sort`
    - Implementation notes:
        - Public users see only `status = 'active'` via `properties_public_active`.
        - Authenticated owners/agents/admins see more via `properties_owner_or_admin_select`.
        - Use trigram or full-text search for `q`.
        - Geo: use ST_DWithin on the stored geom expression.
- GET /properties/:id
    
    - Auth: optional
    - RLS: respects `properties_public_active` and `properties_owner_or_admin_select`.
- POST /properties
    
    - Auth: required
    - Body: property fields
    - Implementation: `INSERT INTO public.properties (...)`
    - RLS: `properties_insert_owner_or_agent` — prefer server to set `owner_id = auth.uid()`.
- PATCH /properties/:id
    
    - Auth: required
    - RLS: `properties_update_owner_or_admin`
- DELETE /properties/:id
    
    - Auth: required
    - RLS: `properties_delete_owner_or_admin`

Notes:

- Enforce allowed status transitions in application logic or DB check constraints.
- Validate and sanitize inputs, set owner_id server-side where possible.

---

1. Property Details / Media / Documents

- GET /properties/:id/details
    
    - Auth: required for private details; RLS via `property_details_owner_admin`.
- POST /properties/:id/details
    
    - Auth: required (owner/agent/admin)
- GET /properties/:id/media
    
    - Auth: required for private media; RLS via `property_media_owner_admin`.
- POST /properties/:id/media
    
    - Auth: required (owner/agent/admin)
    - Flow: upload file to Storage, then INSERT into `property_media`.
    - RLS: `property_media_insert_owner`
- GET /properties/:id/documents
    
    - Auth: required; RLS `property_documents_select_owner_admin`
- POST /properties/:id/documents
    
    - Auth: required (owner/agent/admin)
    - Flow: upload to Storage, then INSERT record.
    - RLS: `property_documents_insert_owner`

Notes:

- Protect storage buckets (use RLS on storage.objects and signed URLs).

---

1. Inquiries / Messaging

- POST /properties/:id/inquiries
    
    - Auth: required
    - Body: { message, ... }
    - Implementation: `INSERT INTO public.inquiries (property_id, sender_id, message, owner_id NULL)` — trigger sets `owner_id`.
    - RLS: `inquiries_insert_sender` forces `sender_id = auth.uid()`.
    - After insert: send notification & broadcast realtime event to owner channel.
- GET /inquiries
    
    - Auth: required
    - Implementation: `SELECT * FROM public.inquiries WHERE owner_id = auth.uid() OR sender_id = auth.uid()`
    - RLS: `inquiries_owner_select`
- PATCH /inquiries/:id
    
    - Auth: required (owner/admin)
    - RLS: `inquiries_update_owner*`

Notes:

- Rate-limit creation; enforce message length and content checks.

---

1. Saved Properties / Favorites

- POST /saved_properties
    
    - Auth: required
    - Implementation: `INSERT user_id = auth.uid(), property_id`
    - RLS: `saved_properties_manage_own`
- GET /saved_properties
    
    - Auth: required — returns user’s saved items via RLS.
- DELETE /saved_properties/:id
    
    - Auth: required — RLS enforces ownership.

---

1. Reviews

- POST /reviews
    
    - Auth: required
    - Implementation: `INSERT reviewer_id = auth.uid(), property_id, rating, comment`
    - RLS: `reviews_insert_authenticated`
- GET /reviews?property_id=...
    
    - Auth: optional
    - RLS: `reviews_select_public` (public)

Notes:

- Consider unique constraint per reviewer/property or moderation workflow.

---

1. Notifications

- GET /notifications
    
    - Auth: required
    - Implementation: `SELECT * FROM public.notifications WHERE user_id = auth.uid() ORDER BY created_at DESC`
    - RLS: `notifications_user`
- POST /notifications
    
    - Auth: admin/service (or via server)
    - RLS: `notifications_insert_system` allows admin or user-owned.
- PATCH /notifications/:id (mark as read)
    
    - Auth: required
    - RLS: `notifications_update_user*`

Realtime:

- Broadcast notifications to `user:USER_ID:notifications` private channels.

---

1. KYC Requests

- POST /kyc_requests
    
    - Auth: required
    - Body: documents JSONB
    - RLS: `kyc_insert_user` enforces `user_id = auth.uid()`
- GET /kyc_requests/:id
    
    - Auth: admin or owner
    - RLS: `kyc_select_user_or_admin`
- PATCH /kyc_requests/:id (approve/reject)
    
    - Auth: admin
    - RLS: `kyc_update_admin`

Notes:

- Use Edge Functions for KYC provider integrations and heavy processing.

---

1. Payments

- POST /payments
    
    - Auth: required
    - Flow: Use payment provider; insert payment record (server-side for webhooks) with `user_id = auth.uid()`.
    - RLS: `payments_insert_user_or_service`
- GET /payments
    
    - Auth: required
    - RLS: `payments_select_user_or_admin`
- PATCH /payments/:id (admin adjustments)
    
    - Auth: admin
    - RLS: `payments_update_admin`

Notes:

- Handle webhooks with Edge Function using service role key.

---

1. Owners & Agents

- CRUD endpoints:
    - Use `owners_manage_own` and `agents_manage_own` RLS policies.
    - Admin-only approval flows should be server-side.

---

1. Admin Audit Log

- Writes & reads restricted to admins via `admin_audit_admin_only`.
- Use server-side/service-role for inserting audit events.

---

## Realtime & Notifications Integration

- Use Supabase Realtime `broadcast` with private channels for:
    
    - inquiry_created -> topic `owner:OWNER_ID:inquiries` event `inquiry_created`
    - property_status_changed -> topic `property:PROPERTY_ID:status` event `property_status_changed`
    - notifications -> topic `user:USER_ID:notifications` event `notification_created`
- Use triggers to call `realtime.broadcast_changes` or `realtime.send` for DB-driven events.
    
- Ensure private channels and RLS are configured on `realtime.messages` and `realtime.presence`.
    

---

## Edge Functions (Server-side Helpers)

Use Edge Functions (service-role) for:

- Payment webhook handling and verification.
- KYC provider callbacks and processing.
- Image processing and upload workflows (use /tmp when writing files).
- Admin utilities (bulk import/export, rebuild search indexes).
- Scheduled tasks (expire listings, send digests) via an external cron hitting Edge Function.

Guidelines:

- Use `Deno.serve` or minimal npm imports (follow Supabase Edge Functions best practices).
- Use SUPABASE_SERVICE_ROLE_KEY for privileged DB operations.
- Use EdgeRuntime.waitUntil for background tasks where supported.

---

## Security Checklist

- Never expose SUPABASE_SERVICE_ROLE_KEY to clients.
- Validate JWT claim name for `role`; update policies if your claim differs.
- Test policies with contexts: anon, authenticated user, admin JWT.
- Revoke EXECUTE on SECURITY DEFINER helper functions (already done).
- Protect storage buckets with RLS or signed URLs.
- Add rate-limiting at edge for abusive endpoints.

---

## Performance & Monitoring

- Indexes created: owner_id, agent_id, status, GIN for arrays, trigram on title/description, PostGIS GiST geog expression. Monitor slow queries.
- Use `EXPLAIN ANALYZE` for heavy queries and optimize indexes accordingly.
- Monitor Supabase advisors and logs for security/performance recommendations.
- Add additional indexes for frequently filtered fields as needed.

---

## Example Request / Response Sketches

- GET /properties?q=beach+house&city=Lagos&limit=20
    
    - Response: { "data": [ { "id": "...", "title": "...", "price": 120000, "city": "Lagos", "latitude": ..., "longitude": ..., "status": "active" } ], "meta": { "page": 1, "limit": 20 } }
- POST /properties (authenticated)
    
    - Body: { "title": "Ocean View Condo", "description": "...", "price": 150000, "city": "Lagos" }
    - Server sets `owner_id = auth.uid()`.
    - Response: { "id": "...", "created_at": "2025-01-01T00:00:00Z" }
- POST /properties/:id/inquiries (authenticated)
    
    - Body: { "message": "Is this still available?" }
    - Response: { "id": "...", "property_id": "...", "sender_id": "<auth.uid()>", "owner_id": "...", "created_at": "..." }
---
