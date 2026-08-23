## Overview

This document explains the schema changes and optimizations performed on the database and gives concrete, prioritized guidance to update your API (realest/app/api/properties/route.ts) so it works efficiently and safely with the new schema. It includes:

- A concise list of database changes performed
- How those changes affect read and write paths in the API
- Concrete code-level adjustments (queries, indexing-aware filters)
- Data validation and storage recommendations (metadata shape)
- Audit logging and security notes
- Migration testing and rollout checklist

Be sure to follow each section when updating the API to maintain compatibility and take advantage of the performance improvements.

---

## 1) Summary of database changes (what changed)

1. property_details schema
    
    - Added metadata jsonb column with default {}.
    - Converted amenities and features to jsonb (from mixed types) and replaced the old columns. Values were converted row-by-row using robust PL/pgSQL logic.
    - property_details now contains:
        - metadata jsonb DEFAULT '{}'
        - amenities jsonb DEFAULT '{}'
        - features jsonb DEFAULT '{}'
2. properties table constraints
    
    - Expanded property_type CHECK to include all new types used by the application (duplex, bungalow, flat, self_contained, mini_flat, room_and_parlor, single_room, penthouse, terrace, detached_house, shop, office, warehouse, showroom, event_center, hotel, restaurant, residential_land, commercial_land, mixed_use_land, farmland) while preserving legacy values (house, apartment, land, commercial).
    - properties.status CHECK updated to include 'draft' (status values now include active, sold, rented, inactive, draft).
3. Indexes added
    
    - GIN index on property_details.metadata for general JSONB search: idx_property_details_metadata_gin.
    - Functional index on metadata -> 'nigeria' ->> 'nepa_status': idx_pd_metadata_nigeria_nepa_status.
    - Additional functional indexes added (per your confirmation):
        - idx_pd_metadata_nigeria_power_source ON (metadata -> 'nigeria' ->> 'power_source')
        - idx_pd_metadata_building_floors ON (((metadata -> 'building' ->> 'floors')::integer))
        - idx_pd_metadata_year_renovated ON (((metadata ->> 'year_renovated')::integer))
        - idx_pd_metadata_city_lower ON (lower(metadata ->> 'city'))
4. Audit log table
    
    - admin_audit_log exists and contains metadata jsonb; used to record administrative actions and context.

---

## 2) Implications for the API

Key principles:

- Use JSONB fields for flexible, extensible Nigerian-market fields (nepa_status, power_source, water info, building info, etc.). Store them under property_details.metadata where appropriate rather than creating many additional columns.
- Prefer indexed JSONB access when filtering: query the specific JSON key paths that we indexed to leverage the functional indexes.
- Avoid joining large result sets in-app for filtering where possible; use server-side filters or limited subqueries to allow Postgres to use indexes.
- Keep property lifecycle statuses in the API consistent with DB CHECK constraints (e.g., use 'draft' when creating incomplete listings).

How to interpret metadata fields:

- metadata is a top-level JSONB that should contain nested namespaces (recommended):
    - nigeria: { nepa_status, power_source, ... }
    - building: { floors, material, year_renovated, ... }
    - utilities: { water_source, water_tank_capacity, has_water_treatment, internet_type }
    - security: { security_type: [ ... ], security_hours, has_security_levy, security_levy_amount }
    - bq: { has_bq, bq_type, bq_bathrooms, ... }
    - city: string (top-level for faster city searches; also useful to copy into properties.city)
- Copy frequently queried scalar values (city, state, price, property_type, listing_type, bedrooms/bathrooms when numeric) into top-level properties or dedicated columns when you need very fast filtering across large datasets.

---

## 3) Concrete API changes and code examples

Below are specific, minimal changes and patterns to integrate into your route.ts implementation to leverage the schema changes and indexes.

A. Validation and mapping

- Keep your Zod validation for property creation but move many Nigerian-specific fields into `metadata` on the property_details insert rather than columns that don't exist anymore.
- Recommended new createPropertySchema difference:
    - Remove nepa_status, water_source, etc. from direct property_details columns and instead accept a single nested `metadata` object validated by Zod (you can still accept top-level convenience fields but map them into metadata on write).

Suggested validation (example snippet — integrate into your existing schema):

- Create a metadata schema and accept it as optional in body:
    - metadata: MetadataSchema.optional()

B. POST handler (create flow): store metadata under property_details.metadata

- Instead of inserting nepa_status etc. directly into separate columns (which no longer exist), insert them into property_details.metadata.
- Keep numeric columns (bedrooms, bathrooms, square_feet) as separate columns in property_details for easier numeric filtering and indexing.

Example transform before insert (pseudocode):

- Let metadata = validatedData.metadata ?? {}
- If validatedData.nepa_status !== undefined then metadata.nigeria = { ...(metadata.nigeria||{}), nepa_status: validatedData.nepa_status }
- If validatedData.water_source !== undefined then metadata.utilities = { ...(metadata.utilities||{}), water_source: validatedData.water_source, water_tank_capacity: validatedData.water_tank_capacity }
- If security fields present then metadata.security = {...}
- Insert into property_details:
    - property_id: property.id
    - bedrooms, bathrooms, square_feet: numeric columns
    - metadata: metadata (JSON object)
    - amenities and features: populate as arrays/objects into those jsonb columns

C. GET handler (search and filtering): push filters into DB using indexed JSONB expressions

- For filters on JSON keys that we indexed, apply `.filter()`/`.eq()` style queries via PostgREST or raw SQL with expression comparisons. Examples below use supabase-js PostgREST style or a raw SQL fallback.

Important: Supabase PostgREST JSONB filtering options:

- Use RPC (stored procedure) or filter expressions like:
    - filter metadata->'nigeria'->>'nepa_status' equals: in raw SQL: (metadata -> 'nigeria' ->> 'nepa_status') = 'stable'
    - PostgREST allows `eq` on jsonb path via RPC or using `select` + `filter` with `filter("metadata->>city", "ilike", "%lagos%")` depending on client support. If client doesn't support such keys, use a small SQL RPC to encapsulate the logic (recommended).

Updated GET flow:

1. Keep property-level filters (title, description, city from properties table) as-is using indexed columns for fast filtering.
2. For JSONB filters:
    - nepa_status: use an indexed functional expression: metadata -> 'nigeria' ->> 'nepa_status' = 'stable'
    - city inside metadata: use lower(metadata ->> 'city') ILIKE '%term%' (we added idx_pd_metadata_city_lower)
    - building floors: cast and compare ((metadata -> 'building' ->> 'floors')::int) >= X (we added idx_pd_metadata_building_floors)
3. Avoid joining everything at once if you only need a subset: fetch properties with necessary property_details fields via a targeted select or use a subquery to filter by property id then fetch full relations.

Practical examples for supabase-js (replace createClient usage with your wrapper):

- Filter by nepa_status using RPC (recommended approach):
    
    - Create RPC in DB:
        - CREATE FUNCTION public.filter_properties_by_nepa(_status text, _limit int, _offset int) RETURNS TABLE (...) AS SELECTp.∗FROMpublic.propertiespJOINpublic.propertydetailspdONpd.propertyid=p.idWHERE(pd.metadata−>′nigeria′−>>′nepastatus′)=statusORDERBYp.createdatDESCLIMITlimitOFFSEToffset;SELECTp.∗FROMpublic.propertiespJOINpublic.propertyd​etailspdONpd.propertyi​d=p.idWHERE(pd.metadata−>′nigeria′−>>′nepas​tatus′)=s​tatusORDERBYp.createda​tDESCLIMITl​imitOFFSETo​ffset; LANGUAGE sql STABLE;
    - Call from API: supabase.rpc('filter_properties_by_nepa', { status: 'stable', limit, offset });
- If you prefer inline PostgREST style (may require feature support):
    
    - query.filter("metadata->nigeria->>nepa_status", "eq", "stable") // if client supports this expression*_

D. Pagination and counts

- Use range() and .limit/.offset properly. For counts, PostgREST count may be expensive when joined; consider a separate count query:
    - SELECT count(*) FROM properties p WHERE (apply same filters)
    - Or maintain a materialized view for expensive aggregated queries.*

E. Duplicate detection

- Your existing duplicate detection checks address and lat/long — keep it. Consider creating a GiST index on (latitude, longitude) or a spatial index (PostGIS) for robust geo-queries if you plan radius searches.

F. Audit logging

- When creating/updating property_details.metadata, insert an admin_audit_log entry with:
    - actor_id: user id
    - action: 'create_property' or 'update_property_metadata'
    - target_id: property id
    - metadata: copy of the payload (or minimal diff) and source

Use the service or server role key when inserting audit rows server-side to bypass RLS. Record only essential data to avoid storing secrets.

---

## 4) Concrete code edits for your route.ts

Below are specific, minimal edits and snippets you can apply to your existing route.ts.

A. Validation: Accept metadata and map fields into metadata

Replace the top-level Nigerian-specific fields in your createPropertySchema with an optional `metadata` object. Example (shortened):

```ts
// new metadata schema
const MetadataSchema = z.object({
  nigeria: z.object({
    nepa_status: z.enum(["stable","intermittent","poor","none","generator_only"]).optional(),
    power_source: z.string().optional()
  }).optional(),
  utilities: z.object({
    water_source: z.enum(["borehole","public_water","well","water_vendor","none"]).optional(),
    water_tank_capacity: z.number().positive().optional(),
    has_water_treatment: z.boolean().optional(),
    internet_type: z.enum(["fiber","starlink","4g","3g","none"]).optional()
  }).optional(),
  security: z.object({
    security_type: z.array(z.string()).optional(),
    security_hours: z.enum(["24/7","day_only","night_only","none"]).optional(),
    has_security_levy: z.boolean().optional(),
    security_levy_amount: z.number().positive().optional()
  }).optional(),
  bq: z.object({
    has_bq: z.boolean().optional(),
    bq_type: z.enum(["self_contained","room_and_parlor","single_room","multiple_rooms"]).optional(),
    bq_bathrooms: z.number().min(0).optional(),
    bq_kitchen: z.boolean().optional(),
    bq_separate_entrance: z.boolean().optional(),
    bq_condition: z.enum(["excellent","good","fair","needs_renovation"]).optional()
  }).optional()
}).passthrough();
const createPropertySchema = originalSchema.extend({
  metadata: MetadataSchema.optional()
});
```

B. POST insert: populate metadata and write into property_details.metadata

Replace the property_details insert block with something like:

```ts
// Build metadata by merging top-level convenience fields into metadata object
const metadata = validatedData.metadata ?? {};
// if top-level convenience fields present, merge them:
// e.g. if validatedData.nepa_status exists:
if (validatedData.nepa_status) {
  metadata.nigeria = { ...(metadata.nigeria || {}), nepa_status: validatedData.nepa_status };
}
// repeat for other convenience fields if you keep them
// Insert property_details
const { error: detailsError } = await supabase
  .from("property_details")
  .insert({
    property_id: property.id,
    bedrooms: validatedData.bedrooms ?? null,
    bathrooms: validatedData.bathrooms ?? null,
    square_feet: validatedData.square_feet ?? null,
    metadata,
    // if you have amenities/features as arrays:
    amenities: validatedData.amenities ?? {},
    features: validatedData.features ?? {}
  });
```

C. GET filters: use indexed JSONB expressions (example for nepa_status and city)

If supabase-js doesn't allow JSON path filters directly, use RPC or raw SQL via Postgres function. Example RPC creation (run once in DB):

### SQL Query

Write

```sql
CREATE OR REPLACE FUNCTION public.search_properties(
  p_query text DEFAULT null,
  p_city text DEFAULT null,
  p_state text DEFAULT null,
  p_property_type text DEFAULT null,
  p_listing_type text DEFAULT null,
  p_min_price numeric DEFAULT null,
  p_max_price numeric DEFAULT null,
  p_nepa_status text DEFAULT null,
  p_has_bq boolean DEFAULT null,
  p_limit int DEFAULT 20,
  p_offset int DEFAULT 0
) RETURNS TABLE (
  id uuid,
  owner_id uuid,
  title text,
  description text,
  price numeric,
  property_type text,
  listing_type text,
  city text,
  state text,
  created_at timestamptz
) LANGUAGE sql STABLE AS $$
SELECT p.id, p.owner_id, p.title, p.description, p.price, p.property_type, p.listing_type, p.city, p.state, p.created_at
FROM public.properties p
LEFT JOIN public.property_details pd ON pd.property_id = p.id
WHERE (p.verification_status = 'verified')
  AND (p.status = 'live')
  AND (p_query IS NULL OR (p.title ILIKE ('%'||p_query||'%') OR p.description ILIKE ('%'||p_query||'%') OR p.address ILIKE ('%'||p_query||'%')))
  AND (p_city IS NULL OR lower(pd.metadata ->> 'city') ILIKE ('%'||lower(p_city)||'%'))
  AND (p_state IS NULL OR p.state ILIKE ('%'||p_state||'%'))
  AND (p_property_type IS NULL OR p.property_type = p_property_type)
  AND (p_listing_type IS NULL OR p.listing_type = p_listing_type)
  AND (p_min_price IS NULL OR p.price >= p_min_price)
  AND (p_max_price IS NULL OR p.price <= p_max_price)
  AND (p_nepa_status IS NULL OR (pd.metadata -> 'nigeria' ->> 'nepa_status') = p_nepa_status)
  AND (p_has_bq IS NULL OR ((pd.metadata -> 'bq' ->> 'has_bq')::boolean IS NOT DISTINCT FROM p_has_bq))
ORDER BY p.created_at DESC
LIMIT p_limit OFFSET p_offset;
$$;
```

Success. No rows returned

Call from API:

```ts
const { data, error } = await supabase.rpc('search_properties', {
  p_query: validatedSearch.query ?? null,
  p_city: validatedSearch.city ?? null,
  p_state: validatedSearch.state ?? null,
  p_property_type: validatedSearch.property_type ?? null,
  p_listing_type: validatedSearch.listing_type ?? null,
  p_min_price: validatedSearch.min_price ?? null,
  p_max_price: validatedSearch.max_price ?? null,
  p_nepa_status: validatedSearch.nepa_status ?? null,
  p_has_bq: validatedSearch.has_bq ?? null,
  p_limit: validatedSearch.limit,
  p_offset: from
});
```

Using an RPC ensures Postgres uses the functional indexes you created and avoids client-side assembly of complex JSONB filters.

D. Post-processing and projections

- Keep JOINs light. If you need to return property_details payload, add an additional select or fetch by property id after applying the filtered list of ids (two-step pattern). This helps the database use indexes to filter first and fetch heavy JSON payloads afterwards.

Example two-step pattern:

1. Use RPC/search to get matching property ids.
2. Fetch full property rows with property_details, media, documents for only those IDs (using IN (list_of_ids)).

This avoids expensive row-by-row JSONB scanning when you only need a page of results.

---

## 5) Audit logging & RLS considerations

- admin_audit_log should be written server-side using the service role key or a Postgres function that writes with SECURITY DEFINER; do not allow client-side writes.
- RLS is enabled on many tables — server-side writes should use the service role key to bypass RLS where appropriate.
- If you wish to keep writes via authenticated users (not service role), create narrowly scoped policies that allow authenticated users to insert audit entries for their own actions, but prefer server-side logging for security and integrity.

Example audit insertion (server-side after property creation):

```ts
await supabase.from('admin_audit_log').insert({
  actor_id: user.id,
  action: 'create_property',
  target_id: property.id,
  metadata: { payload: validatedData, note: 'Created via API v2 mapping to metadata' }
});
```

---

## 6) Performance & index usage notes

- The GIN index on metadata helps containment queries (metadata @> '{"nigeria": {"nepa_status":"stable"}}'), but the functional text indexes are best for equality or range queries on specific keys.
- Casting expressions (e.g., (metadata -> 'building' ->> 'floors')::int) can use the integer functional index we created; ensure you use the same expression in WHERE clauses.
- For case-insensitive city search, use lower(metadata ->> 'city') ILIKE '%term%' to use the idx_pd_metadata_city_lower index.
- For multi-key searches across metadata, prefer a small RPC that uses boolean expressions so Postgres can leverage indexes efficiently.

---

## 7) Testing plan & rollout checklist

1. Unit tests
    
    - Validate createProperty POST flow: payload -> DB rows
    - Validate metadata mapping and that important fields appear in property_details.metadata
    - Validate admin_audit_log entry created
2. Integration tests
    
    - Create properties with various metadata combinations and assert that RPC filtering by nepa_status, city, building floors works correctly and uses indexes (EXPLAIN ANALYZE if possible).
3. Staging rollout
    
    - Deploy schema changes to staging
    - Point API to staging DB with service role
    - Run a synthetic load test for GET search with filters to confirm performance
4. Production rollout
    
    - Run migration during a low-traffic window
    - Monitor slow queries / p99 latencies
    - Reindex if necessary after large data loads
5. Backout plan
    
    - Keep SQL migration scripts reversible (backups)
    - If metadata mapping had problems, restore from backup or keep old columns until cutover is validated — but note we've already dropped old columns in your migration.

---

## 8) Recommended next steps / checklist for you to implement in code

1. Update createPropertySchema to accept a `metadata` object and/or keep convenience fields but map them into `metadata` before writing.
2. Change property_details insert to write `metadata` jsonb and keep numeric columns for numeric filters.
3. Implement RPC(s) for search filtering that reference functional indexes (examples provided).
4. Replace client-side complex JOIN filters using metadata with RPC calls or server-side SQL to ensure index usage.
5. Add audit logging server-side using service role key after each create/update that modifies metadata or critical fields.
6. Add integration tests for:
    - metadata persistence
    - RPC search correctness
    - pagination correctness
7. Monitor the DB after deployment (slow queries, index hits) and tune as needed.

---

## 9) Appendix — Quick code snippets

A. Merge convenience fields into metadata (JS/TS):

```ts
function mergeMetadata(base = {}, convenience = {}) {
  const out = { ...base };
  if (convenience.nepa_status) {
    out.nigeria = { ...(out.nigeria || {}), nepa_status: convenience.nepa_status };
  }
  if (convenience.water_source) {
    out.utilities = { ...(out.utilities || {}), water_source: convenience.water_source, water_tank_capacity: convenience.water_tank_capacity };
  }
  if (convenience.has_bq !== undefined) {
    out.bq = { ...(out.bq || {}), has_bq: convenience.has_bq, bq_type: convenience.bq_type, bq_bathrooms: convenience.bq_bathrooms, bq_kitchen: convenience.bq_kitchen, bq_separate_entrance: convenience.bq_separate_entrance, bq_condition: convenience.bq_condition };
  }
  // security, building, etc...
  return out;
}
```

B. Example WHERE expressions that use the exact indexed expressions:

- nepa_status equality:
    - WHERE (property_details.metadata -> 'nigeria' ->> 'nepa_status') = 'stable'
- city (case-insensitive):
    - WHERE lower(property_details.metadata ->> 'city') ILIKE lower('%lagos%')
- building floors >= N:
    - WHERE ((property_details.metadata -> 'building' ->> 'floors')::int) >= 2