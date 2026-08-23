The following list is organized by the main functional areas of the RealEST application and follows standard RESTful conventions.

---

## RealEST: Low-Level API Endpoint List

### 1. Authentication & Users (Handled by Supabase Auth & Edge Functions)

| Method | Endpoint                       | Description                                  | Auth Required | Permissions/Notes                                                 |
| :----- | :----------------------------- | :------------------------------------------- | :------------ | :---------------------------------------------------------------- |
| `POST` | `/auth/register`               | Register a new user (Owner/Agent/User).      | No            | Supabase Auth. Sets default `user_role`.                          |
| `POST` | `/auth/login`                  | Authenticate and log in a user.              | No            | Supabase Auth. Returns JWT.                                       |
| `POST` | `/auth/logout`                 | Log out the user.                            | Yes           | Supabase Auth. Invalidates session.                               |
| `GET`  | `/users/profile`               | Retrieve the logged-in user's profile data.  | Yes           | All Roles. Protected by RLS on `profiles` table.                  |
| `PUT`  | `/users/profile`               | Update the logged-in user's profile details. | Yes           | All Roles. Protected by RLS (user can only update their own row). |
| `PUT`  | `/users/password`              | Change the user's password.                  | Yes           | Supabase Auth.                                                    |
| `POST` | `/users/profile/upgrade-owner` | Request an upgrade of role to 'owner'.       | Yes           | User Role. Triggers Admin notification.                           |

### 2. Public Property Discovery (Read-Only)

| Method | Endpoint | Description | Auth Required | Permissions/Notes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/properties/explore` | Get all public, **live** properties and locations (Search/Map View). | No | Filters by `status=live`. Supports `q`, `category`, `min_price`, `max_price`, `beds`, `baths`, `amenities`. |
| `GET` | `/properties/explore/nearby` | Get listings within a radius of a coordinate. | No | Requires `lat`, `lon`, `radius`. Uses PostGIS. |
| `GET` | `/properties/[id]` | Get full details for a single, public, **live** property/location. | No | Returns all structured data, media, location, and owner contact (but not private info). |
| `GET` | `/properties/featured` | Get a list of featured/premium listings. | No | Returns a smaller, boosted list of `is_premium=true` listings. |
| `GET` | `/categories` | Get all supported property/location categories (for filter UI). | No | Static/System table data. |

### 3. Property Management (Owner/Business Access)

| Method | Endpoint | Description | Auth Required | Permissions/Notes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/dashboard/listings` | Create a new property/location listing (Step 1 of 6). | Yes | Owner/Business Role. Inserts into `properties` table; default `status=pending_ml_validation`. |
| `PUT` | `/dashboard/listings/[id]` | Update details of a specific property. | Yes | Owner/Business Role. RLS: Must be `owner_id` of the property. Logic: restricted edits on `status=live` properties. |
| `GET` | `/dashboard/listings` | Get all listings owned by the authenticated user. | Yes | Owner/Business Role. RLS: Filters by `owner_id`. Supports `status` filter. |
| `GET` | `/dashboard/listings/[id]` | Get detailed view of one of the owner's listings (including status, ML notes). | Yes | Owner/Business Role. RLS: Must be `owner_id` of the property. |
| `POST` | `/dashboard/listings/[id]/media` | Upload new media (image/video) for a property. | Yes | Owner/Business Role. Writes to Supabase Storage, creates entry in `property_media` table. |
| `POST` | `/dashboard/listings/[id]/documents` | Upload a new legal document for a property. | Yes | Owner/Business Role. Writes to Supabase Storage, creates entry in `property_documents` table. |
| `POST` | `/dashboard/listings/[id]/renew` | Renew a listing (payment trigger). | Yes | Owner/Business Role. Triggers payment/billing Edge Function. Updates `expiry_date`. |
| `POST` | `/dashboard/listings/[id]/duplicate-check` | Manually run/request a duplicate check (for a fee, maybe). | Yes | Owner/Business Role. Triggers ML microservice. |

### 4. Communication & Engagement

| Method | Endpoint | Description | Auth Required | Permissions/Notes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/inquiries` | Send a new inquiry about a property. | Yes (or No, with form details) | Requires `property_id`, `message`. Writes to `inquiries` table. |
| `GET` | `/dashboard/owner/inquiries` | Get all inquiries received for the owner's properties. | Yes | Owner/Business Role. RLS: Filters by `owner_id` of the property. |
| `PUT` | `/dashboard/owner/inquiries/[id]` | Update inquiry status (e.g., mark as read/archived). | Yes | Owner/Business Role. |
| `GET` | `/properties/reviews` | Get all public reviews for a property/location. | No | Read from `reviews` table. Supports pagination. |
| `POST` | `/properties/[id]/review` | Submit a new user review for a property/location. | Yes | All Roles. Writes to `reviews` table; requires moderation flag. |
| `POST` | `/properties/[id]/favorite` | Toggle the favorite status of a property. | Yes | All Roles. Writes to `user_favorites` table. |

### 5. Admin & Validation (Vetting Team Access)

| Method | Endpoint | Description | Auth Required | Permissions/Notes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/admin/validation/ml` | Get the queue of properties awaiting ML review. | Yes | Admin Role. Filters by `status=pending_ml_validation`. |
| `PUT` | `/admin/validation/ml/[id]` | Update ML document status after manual review. | Yes | Admin Role. Updates `property_documents.ml_validation_status`. |
| `GET` | `/admin/validation/vetting` | Get the queue of properties ready for physical vetting. | Yes | Admin Role. Filters by `status=pending_vetting`. |
| `POST` | `/admin/validation/vetting/[id]/report` | Submit the physical vetting report. | Yes | Admin Role. Updates `properties.status` to `live` or `rejected`. |
| `GET` | `/admin/validation/duplicates` | Get the queue of properties flagged as potential duplicates. | Yes | Admin Role. Filters by `is_duplicate=true`. |
| `POST` | `/admin/validation/duplicates/[id]/resolve` | Resolve a duplicate flag (approve, reject, merge). | Yes | Admin Role. |
| `GET` | `/admin/users` | Get a list of all users and their details. | Yes | Admin Role. Supports filtering by `user_role`. |
| `PUT` | `/admin/users/[id]/role` | Update a user's role. | Yes | Admin Role. |
| `GET` | `/admin/analytics/summary` | Get high-level platform performance metrics. | Yes | Admin Role. Edge Function for calculation. |
| `GET` | `/admin/settings/categories` | Get/manage system categories and dynamic fields. | Yes | Admin Role. |

### 6. System & Utility Endpoints

| Method | Endpoint | Description | Auth Required | Permissions/Notes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/status` | Health check for the application. | No | Serverless function returns a simple JSON status. |
| `GET` | `/api/system/amenities` | Get a list of all standardized amenities for filtering/listing. | No | Read from `system_amenities` table. |
| `GET` | `/api/geocoding/address` | Proxy for third-party geocoding API (e.g., Mapbox, Google). | No | Edge Function handles API key and request; protects keys. |
| `GET` | `/api/site-status` | **(Critical for Coming Soon Logic)** Check the launch date and status. | No | Edge Function returns `{ isLive: boolean, launchDate: string }`. |

### Summary for Next Steps

This endpoint list defines the **contract** between your Next.js frontend, your Supabase PostgreSQL database, and your serverless backend logic (Edge Functions/Microservices).

**Next Logical Step:** Use this list to design the exact columns and relationships for your core database tables (`properties`, `property_documents`, `inquiries`, `profiles`, etc.) and to define the precise **Row Level Security (RLS)** policies that will govern access to each endpoint.