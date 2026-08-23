## RealEST: Comprehensive Page Architecture & Content Strategy

### Overarching UI/UX Principles:

*   **Trust at a Glance:** "RealEST Verified" badges, clear validation process indicators, and high-quality visuals are paramount.
*   **Intuitive Discovery:** Powerful, prominent search, intelligent filtering, and map-centric navigation.
*   **Action-Oriented:** Clear, engaging CTAs leading users to their desired outcome (directions, inquiry, call, explore more).
*   **Localized Relevance:** Content, language nuances, and featured listings tailored to Nigerian context.
*   **Performance & Responsiveness:** Fast loading times, seamless experience across all devices.
*   **Visual Storytelling:** High-quality images and video are non-negotiable for conveying authenticity.

### 1. Public Pages (Unauthenticated Access)

These pages are the storefront, designed to captivate and convert visitors into users by showcasing RealEST's unique value.

*   **1.1. Homepage (`/`):**
    *   **Headline:** "Your Verified Path to Every Property & Place. RealEST: No Surprises, Just Real."
    *   **Hero Section:** Dynamic, high-quality video/image carousel showcasing diverse Nigerian properties and locations (bustling market, serene home, vibrant event center, modern hospital).
    *   **Prominent Universal Search Bar:** "What are you looking for? Where are you going?" (Input for keywords, address, category). Suggestive autocomplete.
    *   **Quick Category Access:** Visually appealing cards/icons for "Houses," "Lands," "Event Centers," "Shops," "Hospitals," "Hotels," "Restaurants," "Car Wash."
    *   **"Explore Near Me" CTA:** Leveraging geolocation to show nearby verified listings.
    *   **"How RealEST Works" Section:** Short, engaging visuals explaining the ML & Physical Vetting process. Emphasize "Trust & Transparency."
    *   **Featured Listings:** Mix of high-value properties (houses, land) and popular locations (event centers, clubs). "RealEST Verified" badge prominently displayed.
    *   **Testimonials/Success Stories:** Real Nigerian users sharing positive experiences.
    *   **"List Your Property/Business" CTA:** Direct path for owners.
    *   **Footer:** Standard links, social media, app download (future).
    *   **Business Logic:** Maximize immediate engagement, clearly communicate USPs, offer diverse entry points for different user needs.

*   **1.2. Search Results Page (`/search` or `/explore`):**
    *   **Layout:** Dominant interactive map on one side, filtered list/grid of results on the other. Toggle between map/list view.
    *   **Map Features:** Cluster markers, individual pins showing property/location type, click for quick info pop-up.
    *   **Dynamic Filters:** Robust filter sidebar/drawer (e.g., price range, beds/baths, property type, amenities, business hours, specialties, cuisine). Filters adapt to selected category.
    *   **Sort Options:** "Relevance," "Newest," "Price (Low-High)," "Distance."
    *   **Engaging Copy:** "Finding Your Perfect Match. Every Listing RealEST Verified."
    *   **CTAs:** "View Details," "Get Directions."
    *   **Business Logic:** Efficient discovery, caters to diverse search behaviors, maintains visual connection to location.

*   **1.3. Property/Location Details Page (`/listing/[id]`):**
    *   **Hero Section:** Large, immersive image/video gallery. "RealEST Verified" badge (dynamic based on status).
    *   **Title & Price (if applicable):** Prominent.
    *   **Core Information:**
        *   **Dynamic Sections:** Rendered based on `location_type` (e.g., "House Details," "Hotel Amenities," "Shop Specialties," "Hospital Services").
        *   **Mandatory:** Verified address, landmark, description.
        *   **Location Section:** Embedded interactive map, with "Get Directions" CTA (Drive, Walk, Public Transit options linking to Google Maps/Apple Maps).
        *   **Contact Info:** Verified direct contact (phone, email, website link if available). "Call Now" CTA.
    *   **"Why RealEST Verified?" Section:** Small, expandable section explaining the vetting process for this specific listing. Reinforces trust.
    *   **Reviews & Ratings Section:** User-generated content (Phase 3).
    *   **Similar Listings/Nearby Places:** Recommendations.
    *   **CTAs:** "Get Directions," "Call [Name]," "Send Inquiry" (for transactional), "Add to Favorites," "Share."
    *   **Business Logic:** Drive action (get directions, contact), build deep trust, provide comprehensive decision-making information.

*   **1.4. About Us Page (`/about`):**
    *   **Headline:** "RealEST: Our Mission for a Transparent Nigeria."
    *   **Content:** Our story, why we started, our commitment to verification, our team (optional). Highlight the pain points we solve.
    *   **Mission & Vision:** Clearly articulated.
    *   **CTA:** "Join the RealEST Revolution."
    *   **Business Logic:** Build brand credibility and emotional connection.

*   **1.5. How It Works Page (`/how-it-works`):**
    *   **Headline:** "The RealEST Standard: Verification You Can Trust."
    *   **Content:** Visual, step-by-step explanation of the ML document validation and physical vetting process. Use infographics/short animations.
    *   **"For Owners/Businesses":** Explanation of listing process, benefits of being verified.
    *   **"For Users":** Explanation of what "RealEST Verified" means for them.
    *   **CTAs:** "List Your Property," "Explore Properties."
    *   **Business Logic:** Demystify the unique process, reinforce trust, set expectations.

*   **1.6. Contact Us Page (`/contact`):**
    *   Contact form, FAQs, support email, phone number.
    *   **Business Logic:** Provide clear support channels.

*   **1.7. Blog/Resources (`/blog`):**
    *   Articles on Nigerian real estate market trends, neighborhood guides, tips for buyers/sellers/renters, guides to using RealEST.
    *   **Business Logic:** SEO, thought leadership, user education, community building.

*   **1.8. Privacy Policy (`/privacy`), Terms of Service (`/terms`), Cookie Policy (`/cookies`).**
    *   **Business Logic:** Legal compliance, transparency.

### 2. Authentication Pages

*   **2.1. Login Page (`/login`):**
    *   Standard email/password. Social login options.
    *   "Forgot Password?" link. "Don't have an account? Sign Up."
    *   **Copy:** "Welcome Back to RealEST. Your Verified Journey Continues."
    *   **Business Logic:** Secure and easy access.

*   **2.2. Register Page (`/register`):**
    *   Email, password, full name, phone number.
    *   **Role Selection:** Initial prompt: "Are you a Property Owner/Business, or looking to Find Places?" (Sets initial `user_role`).
    *   Social login options.
    *   **Copy:** "Join RealEST: The Future of Property & Place Discovery. Trust. Verified. Real."
    *   **Business Logic:** Clear onboarding, differentiate user types early.

*   **2.3. Forgot Password Page (`/forgot-password`).**
*   **2.4. Reset Password Page (`/reset-password`).**
*   **2.5. OTP/2FA Verification Page (`/verify-otp`).**
    *   **Business Logic:** Enhanced security.

### 3. Role-Based Dynamic Pages

These pages adapt based on the logged-in user's role.

*   **3.1. User Profile Page (`/profile`):** (Accessible by all logged-in users)
    *   Personal details, change password, manage 2FA.
    *   **"My Favorites/Saved" Section:** For buyers/renters (saved properties/locations).
    *   **"My Inquiries" Section:** For buyers/renters (history of inquiries sent).
    *   **Dynamic Link:** "Switch to Owner Dashboard" (if `user_role` allows).
    *   **Business Logic:** Centralized personal management, easy access to user-specific data.

### 4. Property Owner / Business Pages (`/dashboard/owner/*`)

Accessible only to users with `user_role = 'owner'` or `'business_owner'`.

*   **4.1. Owner Dashboard Home (`/dashboard/owner`):**
    *   **Headline:** "Your RealEST Hub: Manage Your Verified Assets."
    *   **Summary Cards:** Total Listings, Live Listings, Pending Validation, Pending Vetting, Total Inquiries, Premium Status.
    *   **Recent Activity Feed:** Latest inquiries, status updates, views.
    *   **Prominent CTAs:** "List New Property/Business," "Upgrade to Premium."
    *   **Business Logic:** Centralized command center, clear call to action for growth and revenue.

*   **4.2. My Listings Page (`/dashboard/owner/listings`):**
    *   Table/List view of all owner's properties/businesses.
    *   **Status Indicators:** Highly visual (color-coded, badges) for `pending_ml_validation`, `pending_vetting`, `live`, `rejected`, `pending_duplicate_review`.
    *   **Actions:** "View Details," "Edit" (if not live), "Manage Documents," "Promote Listing" (Premium CTA).
    *   **Business Logic:** Transparency, clear next steps for owners, monetization gateway.

*   **4.3. List New Property/Business Form (`/dashboard/owner/listings/new`):** (Multi-step Wizard)
    *   **Step 1: Choose Listing Type:** (e.g., "Residential House for Sale," "Event Center for Rent," "Retail Shop," "Hospital").
    *   **Step 2: Core Details:** Name, description, price (if applicable), **address with mandatory geotagging (map pin drop validation)**.
    *   **Step 3: Dynamic Details:** Form fields adapt based on chosen listing type (beds, baths, specialties, business hours, capacity etc.).
    *   **Step 4: Media Upload:** High-res photos, videos.
    *   **Step 5: Document Upload:** Critical legal documents.
    *   **Step 6: Review & Submit:** Confirmation of details.
    *   **Copy:** "List with Confidence. Get Verified. Reach Your Audience."
    *   **Business Logic:** Streamlined data collection, emphasizes verification from the start, adaptable for diverse categories.

*   **4.4. Listing Details & Edit Page (`/dashboard/owner/listings/[id]/edit`):**
    *   View all details of a specific listing.
    *   **Validation Status Section:** Clearly shows ML results, vetting status, `is_duplicate` flag, and `rejection_reason` if applicable.
    *   **Edit Functionality:** Restricted for live properties (e.g., price changes might trigger re-validation).
    *   **Business Logic:** Full transparency for owners on their listing's journey.

*   **4.5. My Inquiries Page (`/dashboard/owner/inquiries`):**
    *   List of inquiries received for all owned properties/businesses.
    *   Filter by property, unread/read.
    *   **CTA:** "Reply to Inquiry."
    *   **Business Logic:** Facilitate direct connections, high-value leads.

*   **4.6. Analytics Page (`/dashboard/owner/analytics`):** (Premium Feature)
    *   Views, clicks on "Get Directions," "Call," "Inquiry Count."
    *   Comparison with similar listings.
    *   **Business Logic:** Data-driven decision making for owners, incentive for premium.

*   **4.7. Upgrade to Premium Page (`/dashboard/owner/premium`):**
    *   Clearly display tiered subscription plans with benefits (more listings, analytics, boosted visibility, priority support).
    *   **CTAs:** "Choose Plan," "Contact Sales."
    *   **Business Logic:** Primary monetization channel.

### 5. Admin & Vetting Team Pages (`/admin/*`)

Accessible only to `user_role = 'admin'`. This is the control center for RealEST's trust pipeline.

*   **5.1. Admin Dashboard Home (`/admin`):**
    *   **Headline:** "RealEST Admin: The Heart of Verified Trust."
    *   **Overview Metrics:** Total Users, Total Listings, Live Listings, Pending ML Review, Pending Vetting, Pending Duplicate Review.
    *   **Priority Queues:** Quick links to lists needing immediate attention (ML, Vetting, Duplicates).
    *   **Recent Activity Log:** System-wide actions.
    *   **Business Logic:** Mission-critical overview, direct access to key operational tasks.

*   **5.2. ML Validation Queue (`/admin/validation/ml`):**
    *   List of properties with `properties.status = 'pending_ml_validation'`.
    *   Click to detailed review page.
    *   **Business Logic:** Manage automated validation process and human override.

*   **5.3. Document Review Page (`/admin/validation/ml/[id]`):**
    *   Detailed view of uploaded documents for a property.
    *   Display ML analysis results (OCR text, detected type, confidence score, flagged anomalies).
    *   **Admin Actions:**
        *   Manually set `property_documents.ml_validation_status` (Pass, Fail, Review Required).
        *   Add `admin_notes`.
        *   Change property status to `pending_vetting` or `rejected_ml`.
    *   **Business Logic:** Granular control over the first validation layer.

*   **5.4. Physical Vetting Queue (`/admin/validation/vetting`):**
    *   List of properties with `properties.status = 'pending_vetting'`.
    *   Assign to specific vetting team members (Phase 4).
    *   **Business Logic:** Manage logistical aspects of physical verification.

*   **5.5. Physical Vetting Details Page (`/admin/validation/vetting/[id]`):**
    *   Comprehensive property details (as listed by owner).
    *   ML validation results.
    *   **Vetting Report Input:** Fields for vetting team to input their findings, upload geotagged photos/videos taken on-site.
    *   **Admin Actions:**
        *   Verify `latitude`/`longitude`.
        *   Confirm physical attributes match listing.
        *   Update `properties.status` to `live` or `rejected_vetting`.
        *   Add `admin_vetting_notes`, `rejection_reason`.
    *   **Business Logic:** Critical stage for establishing "RealEST Verified" trust.

*   **5.6. Duplicate Review Queue (`/admin/validation/duplicates`):**
    *   List of properties with `properties.is_duplicate = TRUE`.
    *   Side-by-side comparison with suspected duplicate properties (images, addresses, coordinates, owner info).
    *   **Admin Actions:**
        *   `Approve` (false positive).
        *   `Reject as Duplicate`.
        *   `Merge` (Advanced - potentially with data migration).
    *   **Business Logic:** Maintain database integrity and prevent listing fraud.

*   **5.7. User Management Page (`/admin/users`):**
    *   List of all users. Search, filter by role.
    *   View user details, change `user_role`, ban/unban, reset password.
    *   **Business Logic:** Platform governance.

*   **5.8. System Settings Page (`/admin/settings`):**
    *   Manage property types, amenities, currency, platform fees.
    *   **Business Logic:** Global platform configuration.

*   **5.9. Content Moderation Page (`/admin/content`):** (Phase 3+)
    *   Review user-submitted reviews, photos/videos.
    *   **Business Logic:** Maintain platform quality and safety.

### 6. System Owner / Analytics Pages (`/analytics/*`)

(Potentially integrated into the Admin Dashboard for V0, but distinct for scalability). Accessible by specific higher-level admins/product managers.

*   **6.1. Platform Performance Dashboard (`/analytics/platform`):**
    *   Key metrics: User growth, listing growth, validation pipeline throughput, conversion funnels (views to inquiry, etc.).
    *   Geographical distribution of listings and user activity.
    *   **Business Logic:** High-level strategic insights for product and business growth.

*   **6.2. Monetization Dashboard (`/analytics/monetization`):**
    *   Revenue tracking (premium listings, subscriptions).
    *   Performance of different monetization strategies.
    *   **Business Logic:** Financial health and revenue optimization.

*   **6.3. Vetting Efficiency Report (`/analytics/vetting`):**
    *   Average time for ML validation, average time for physical vetting.
    *   Vetting team workload, success/rejection rates.
    *   **Business Logic:** Operational efficiency, resource allocation.

### 7. Core Component Pages (UI Library)

These aren't standalone pages but reusable building blocks critical for consistency and speed.

*   **7.1. Navigation Bar (Header):** Logo, main nav links, search bar, Auth/Dashboard buttons.
*   **7.2. Footer:** Copyright, legal links, social media.
*   **7.3. Property Card/Tile Component:** Consistent display of listings in search results, dashboards.
*   **7.4. Location Pin Component:** For map markers, dynamic based on location type.
*   **7.5. "RealEST Verified" Badge Component:** Reusable badge with tooltip explaining its meaning.
*   **7.6. Form Input Components:** Text fields, dropdowns, checkboxes, file upload.
*   **7.7. Button Components:** Primary, secondary, danger, disabled states.
*   **7.8. Modal/Dialog Components:** For confirmations, quick info.
*   **7.9. Notification/Toast Components:** For system messages.
*   **7.10. Map Component:** Reusable map display with interactive features.
*   **7.11. Image/Video Gallery Component.**
*   **7.12. Rating/Review Component.**

---

This comprehensive plan lays out a strategic path for RealEST, ensuring every page serves a purpose in building trust, engaging users, and driving the business forward. The focus on geotagging and rigorous validation, communicated effectively through purposeful design and copy, will make RealEST an indispensable and beloved platform for Nigerians.