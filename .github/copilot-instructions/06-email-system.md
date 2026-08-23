# RealEST Email System

**Complete reference for the React Email template system** — architecture, design decisions, token constraints, gotchas, and contribution patterns.

---

## 📐 Architecture Overview

The email system lives entirely in `emails/`. It was purpose-built to replace the old string-concatenation system in `lib/email-templates/` (now deleted).

| Layer | Path | Purpose |
|---|---|---|
| Design tokens | `emails/styles/tokens.ts` | Single source of truth for all styling values |
| Layout | `emails/layouts/EmailLayout.tsx` | Base HTML/Head/Body shell with dark-mode CSS |
| Shared components | `emails/components/` | Header, footer, button, alert, UI primitives |
| Templates | `emails/templates/` | 24 fully-rendered React Email components |
| Render utils | `emails/utils/renderEmail.ts` | Thin wrappers around `@react-email/render` |
| Barrel | `emails/index.ts` | Single import surface for the rest of the app |
| Service | `lib/emailService.ts` | Resend SDK wrapper — the only way to send emails |

**Import path**: everything the application needs is exported from `@/emails`.

```ts
import { WelcomeEmail, sendWelcomeEmail, type WelcomeEmailData } from '@/emails';
```

---

## 📁 Directory Structure

```
emails/
├── index.ts                       ← barrel: components + templates + types + utils
├── styles/
│   └── tokens.ts                  ← ALL styling values (hex only, no OKLCH)
├── layouts/
│   └── EmailLayout.tsx            ← Html + Head + Body + dark-mode CSS
├── components/
│   ├── EmailHeader.tsx            ← logo with dark-mode swap
│   ├── EmailFooter.tsx            ← nav links + unsubscribe + copyright
│   ├── EmailButton.tsx            ← primary / secondary / ghost CTA button
│   ├── EmailAlert.tsx             ← success / warning / error / info / brand callout
│   └── EmailUI.tsx                ← EmailSection, EmailDivider, EmailDetailRow,
│                                      EmailHeading, EmailText, OtpBlock, VerifiedBadge
├── templates/                     ← 24 templates, one per user-facing email
│   ├── WaitlistConfirmationEmail.tsx
│   ├── AdminNotificationEmail.tsx
│   ├── PasswordResetEmail.tsx
│   ├── WelcomeEmail.tsx
│   ├── OnboardingReminderEmail.tsx
│   ├── PasswordChangedEmail.tsx
│   ├── InquiryNotificationEmail.tsx
│   ├── SubAdminInvitationEmail.tsx
│   ├── ListingSubmissionEmail.tsx
│   ├── MLValidationPassedEmail.tsx
│   ├── MLValidationActionEmail.tsx
│   ├── VettingAppointmentEmail.tsx
│   ├── ListingLiveEmail.tsx
│   ├── ListingRejectedEmail.tsx
│   ├── InquirySentEmail.tsx
│   ├── ViewingReminderEmail.tsx
│   ├── PriceDropAlertEmail.tsx
│   ├── InvoiceEmail.tsx
│   ├── PaymentReceiptEmail.tsx
│   ├── ListingRenewalEmail.tsx
│   ├── PaymentFailedEmail.tsx
│   ├── LoginAlertEmail.tsx
│   ├── VettingTaskEmail.tsx
│   └── WeeklyDigestEmail.tsx
└── utils/
    └── renderEmail.ts             ← renderEmail / renderEmailText / renderEmailFull
```

---

## 🎨 Design Token Reference (`emails/styles/tokens.ts`)

**All values are hex.** Email clients do not support OKLCH, CSS variables, or Tailwind classes. Use tokens everywhere — never hardcode hex values.

### Colors

```ts
colors.brandDark     '#07402F'  // Dark Green — 60% rule; hero sections, headings
colors.brandNeutral  '#2E322E'  // Deep Neutral — 30% rule; body text
colors.brandAccent   '#ADF434'  // Acid Green — 10% rule; primary CTAs, badges (sparingly)
colors.brandLight    '#F8F9F7'  // Off-White — card/page backgrounds
colors.accentDark    '#8CC428'  // Darker acid green for text on light backgrounds
colors.accentMuted   '#DFF79A'  // Very light tint for brand alert backgrounds

// State colors
colors.success / .successBg / .successBorder
colors.warning / .warningBg / .warningBorder
colors.error   / .errorBg   / .errorBorder    ← correct names (NOT textError / borderError)
colors.info    / .infoBg    / .infoBorder

// UI neutrals
colors.text         // Main body text
colors.textMuted    // Captions, secondary labels
colors.textLight    // Footnotes
colors.cardBg       // '#FFFFFF'
colors.pageBg       // '#F8F9F7'
colors.border       // Dividers, card outlines
colors.borderLight  // Softer dividers
colors.divider      // Stronger horizontal rules
```

### Typography

```ts
fonts.display   // '"Lufga", "Georgia", ...' — display headings (use rarely in email)
fonts.body      // '"Space Grotesk", "Segoe UI", ...' — all body copy (default)
fonts.mono      // '"JetBrains Mono", "Courier New", ...' — OTPs, ref numbers, amounts
```

### Font Sizes

Valid keys: `xs | sm | base | md | lg | xl | 2xl | 3xl`

```ts
fontSize.xs    '11px'
fontSize.sm    '13px'
fontSize.base  '15px'
fontSize.md    '16px'
fontSize.lg    '18px'
fontSize.xl    '22px'
fontSize['2xl'] '26px'
fontSize['3xl'] '32px'   ← maximum — DO NOT invent '4xl', '5xl', etc.
```

### Spacing

Valid keys: `'1' | '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12' | '16'`

```ts
spacing['1']  '4px'
spacing['2']  '8px'
spacing['3']  '12px'
spacing['4']  '16px'
spacing['5']  '20px'
spacing['6']  '24px'
spacing['8']  '32px'    ← jumps from '6' to '8' — there is NO '7'
spacing['10'] '40px'
spacing['12'] '48px'
spacing['16'] '64px'
```

### Border Radius

```ts
radius.sm   '4px'
radius.md   '8px'
radius.lg   '12px'
radius.xl   '16px'
radius.full '9999px'
```

### BASE_URL

```ts
export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'http://localhost:3000';
```

**Critical**: In production, `NEXT_PUBLIC_SITE_URL` must be set in Vercel environment variables. Without it, all logo/image `src` attributes point to `http://localhost:3000` — recipients see broken images.

---

## 🧱 Template Anatomy

Every template follows this exact structure:

```tsx
import * as React from 'react';
// ... React Email component imports
import { EmailLayout } from '../layouts/EmailLayout';
import { EmailHeader, EmailFooter, EmailSection, EmailButton } from '../components/...';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MyEmailData {
  recipientName: string;
  someArray?: string[];       // optional arrays are fine as props
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  headline: { ... },          // shared style objects
  paragraph: { ... },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function MyEmail({
  recipientName = '',          // ← MANDATORY: default all string props to ''
  someArray = [],              // ← MANDATORY: default all array props to []
}: MyEmailData) {
  return (
    <EmailLayout preview="Preview text shown in inbox">
      <EmailHeader />
      <EmailSection>
        {/* content */}
      </EmailSection>
      <EmailFooter showUnsubscribe={false} unsubscribeUrl={undefined} />
    </EmailLayout>
  );
}

// Static subject line — used by emailService.ts
MyEmail.subject = (data: MyEmailData) => `Subject line for ${data.recipientName}`;

// Preview props — used by react-email dev server and export
export const previewProps: MyEmailData = {
  recipientName: 'Tunde Adeyemi',
  someArray: ['item 1', 'item 2'],
};
```

### Why default props are mandatory

`npx react-email export` bundles each template to CJS via esbuild, then calls the default export with **no props at all** to validate the render path. Without defaults, array props become `undefined` and `.length` / `.map()` crash with `TypeError: Cannot read properties of undefined`.

---

## 🧩 Shared Component Reference

### `EmailLayout`

Base wrapper. Injects dark-mode CSS for the logo swap.

```tsx
<EmailLayout preview="Text shown in email client inbox snippet">
  {/* ...children */}
</EmailLayout>
```

### `EmailHeader`

Renders the RealEST wordmark. Includes automatic dark/light swap:
- **Default**: `realest-wordmark-dark.png` (dark text on light bg) — `className="logo-light"`
- **Dark mode**: `realest-wordmark-light.png` (light text on dark bg) — `className="logo-dark"`

Swap is triggered by `@media (prefers-color-scheme: dark)` injected in `EmailLayout`. This responds to the **OS-level** dark mode setting — not the react-email preview toggle (which applies a CSS `filter: invert()` to the iframe, not a real media query).

### `EmailFooter`

```tsx
<EmailFooter showUnsubscribe={true} unsubscribeUrl={data.unsubscribeUrl} />
```

- Renders Privacy Policy / Terms of Service links always
- Unsubscribe link is suppressed if `unsubscribeUrl` is undefined, empty, or starts with `{` (ESP placeholder)
- Set `showUnsubscribe={false}` on transactional emails (security alerts, OTPs)

### `EmailButton`

```tsx
<EmailButton href={url} variant="primary">CTA text</EmailButton>
<EmailButton href={url} variant="secondary">Secondary CTA</EmailButton>
<EmailButton href={url} variant="ghost" block={false}>Inline link</EmailButton>
```

- **primary**: Acid green (`brandAccent`) bg, dark green text — use for main action
- **secondary**: Transparent bg, dark green border — use for supplementary actions
- **ghost**: No border, underlined text — use for tertiary/in-copy links
- `block={true}` (default) makes button full-width

### `EmailAlert`

```tsx
<EmailAlert variant="warning">
  <p style={{ fontFamily: fonts.body, fontSize: fontSize.sm, ... }}>Title</p>
  <p style={{ ... }}>Body copy</p>
</EmailAlert>
```

Available variants: `success | warning | error | info | brand`

**⚠️ Critical constraint**: `EmailAlert` renders a `<Section>` at its root. **Never put React Email primitives** (`<Text>`, `<Section>`, `<Row>`, etc.) as direct children. Use native HTML elements (`<p>`, `<span>`, `<strong>`, `<a>`) only. Violating this causes the CJS bundle to fail silently or crash during `react-email export`.

### `EmailSection`

```tsx
<EmailSection padding={`${spacing['6']} ${spacing['8']}`} bg={colors.cardBg}>
  {/* accepts React Email primitives normally — no restriction here */}
</EmailSection>
```

### `EmailUI` primitives

```tsx
<EmailDetailRow label="Reference" value="REF-20260310" accent />
<EmailHeading>Section Title</EmailHeading>
<EmailText>Body paragraph</EmailText>
<OtpBlock code="847291" />
<VerifiedBadge>✓ Verified</VerifiedBadge>
<EmailDivider />
```

---

## 📧 Template Inventory

### Platform (pre-launch / auth)

| Template | Trigger | Key props |
|---|---|---|
| `WaitlistConfirmationEmail` | Waitlist sign-up | `firstName`, `position` |
| `AdminNotificationEmail` | New waitlist sign-up (admin copy) | `email`, `position` |
| `PasswordResetEmail` | Password reset request | `otpCode`, `resetLink` |
| `WelcomeEmail` | New account verified | `firstName`, `userType` |
| `OnboardingReminderEmail` | Incomplete onboarding (D+3) | `firstName`, `incompleteSteps` |
| `PasswordChangedEmail` | Password changed | `firstName`, `changedAt` |
| `InquiryNotificationEmail` | Owner receives inquiry | `ownerName`, `inquirerName`, `propertyTitle` |
| `SubAdminInvitationEmail` | Admin invites sub-admin | `inviteeName`, `inviteUrl`, `role` |

### Listing Lifecycle

| Template | Trigger | Key props |
|---|---|---|
| `ListingSubmissionEmail` | Property submitted for review | `ownerName`, `propertyTitle`, `referenceId` |
| `MLValidationPassedEmail` | Auto-checks passed | `ownerName`, `propertyTitle` |
| `MLValidationActionEmail` | Auto-check flagged issues | `ownerName`, `flaggedDocuments[]`, `flagReason: MLFlagReason` |
| `VettingAppointmentEmail` | Physical inspection booked | `ownerName`, `appointmentDate`, `agentName` |
| `ListingLiveEmail` | Listing approved & live | `ownerName`, `propertyTitle`, `listingUrl` |
| `ListingRejectedEmail` | Listing not approved | `ownerName`, `rejectionReason: RejectionReason` |

### Engagement

| Template | Trigger | Key props |
|---|---|---|
| `InquirySentEmail` | Buyer sends inquiry (buyer copy) | `buyerName`, `propertyTitle`, `ownerResponse` |
| `ViewingReminderEmail` | Viewing appointment reminder (D-1) | `buyerName`, `viewingDate`, `propertyAddress` |
| `PriceDropAlertEmail` | Saved search price drop | `buyerName`, `propertyTitle`, `oldPrice`, `newPrice` |

### Financial

| Template | Trigger | Key props |
|---|---|---|
| `InvoiceEmail` | Invoice issued | `ownerName`, `invoiceNumber`, `lineItems[]`, `total` |
| `PaymentReceiptEmail` | Successful payment | `ownerName`, `amountPaid`, `receiptNumber` |
| `ListingRenewalEmail` | Listing approaching expiry | `ownerName`, `daysRemaining`, `renewUrl` |
| `PaymentFailedEmail` | Payment declined | `ownerName`, `failureReason: PaymentFailureReason`, `gracePeriodDays` |

### Security & Admin

| Template | Trigger | Key props |
|---|---|---|
| `LoginAlertEmail` | New device sign-in detected | `recipientName`, `device`, `ipAddress` |
| `VettingTaskEmail` | Field agent inspection task | `agentName`, `propertyTitle`, `appointmentDate` |

### Marketing

| Template | Trigger | Key props |
|---|---|---|
| `WeeklyDigestEmail` | Weekly new-listings digest | `recipientName`, `locationName`, `listings: DigestListing[]` |

---

## 🚀 Development Workflow

### Preview server

```bash
npm run email:dev          # starts at http://localhost:3001
```

Shows all 24 templates using their `previewProps`. The **dark/light toggle** in the preview applies `filter: invert()` to the iframe — it does NOT change `prefers-color-scheme`. To test the real dark-mode logo swap, toggle your OS dark mode setting.

### Export validation

```bash
npx react-email export --dir emails/templates
```

Bundles every template to CJS and renders it. Run this before every commit touching `emails/`. All 24 templates should report `✔ Successfully exported emails`.

### TypeScript check

```bash
npm run typecheck
```

Errors in `emails/` are blockers. Errors in unrelated API routes are pre-existing and can be ignored for email-only work.

---

## 📤 Sending Emails (`lib/emailService.ts`)

All email dispatch goes through `lib/emailService.ts`. **Never call Resend directly from a route handler.**

```ts
import { sendWaitlistConfirmationEmail } from '@/lib/emailService';

const result = await sendWaitlistConfirmationEmail({
  email: 'buyer@example.com',
  firstName: 'Tunde',
  position: 42,
});

if (!result.success) {
  console.error('Email failed:', result.error);
  if (result.quotaExceeded) { /* handle quota */ }
}
```

### Return type

```ts
type EmailResult = {
  success: boolean;
  error?: string;
  messageId?: string;
  quotaExceeded?: boolean;
};
```

### From addresses

| Variable | Default value | Used for |
|---|---|---|
| `FROM_EMAIL` | `RealEST Connect <info@connect.realest.ng>` | General / admin |
| `FROM_EMAIL_AUTH` | `RealEST Connect Auth <auth@connect.realest.ng>` | Password, OTP |
| `FROM_EMAIL_WAITLIST` | `RealEST Connect <hello@connect.realest.ng>` | Waitlist |
| `FROM_EMAIL_INQUIRIES` | `RealEST Connect <inquiries@connect.realest.ng>` | Inquiry notifications |

### ⚠️ Vercel serverless: use `after()` for post-response sends

In Vercel's serverless runtime, the execution context is frozen the moment `return NextResponse.json(...)` runs. Any fire-and-forget IIFE (`(async () => { await sendEmail(...) })()`) is killed immediately — emails will never be sent in production.

**Always use `after()` from `next/server` for background sends:**

```ts
import { NextResponse, after } from 'next/server';

// In your route handler:
after(async () => {
  await sendWaitlistConfirmationEmail({ ... });
  await new Promise(r => setTimeout(r, 600)); // 600ms gap: stays under Resend 2 req/sec
  await sendWaitlistAdminNotification({ ... });
});

return NextResponse.json({ success: true }, { status: 201 });
```

### Resend rate limit

Resend allows **2 requests per second** on most plans. When sending multiple emails per request, add a 600ms `setTimeout` between each call to avoid HTTP 429.

---

## 🎨 Visual Design Conventions

### 60-30-10 color rule

- **60%** — `colors.brandDark` (`#07402F`): hero background sections, primary headings, important text
- **30%** — `colors.brandNeutral` (`#2E322E`): body copy, secondary labels
- **10%** — `colors.brandAccent` (`#ADF434`): primary CTA buttons, verified badges, key metrics — **use sparingly**

### Dark hero sections

Used in every template as the first content block after the header:
```tsx
<Section style={{ backgroundColor: colors.brandDark, padding: `${spacing['8']} ${spacing['6']}` }}>
  <Text style={{ color: colors.brandAccent, fontSize: fontSize.xs, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
    Section label
  </Text>
  <Text style={{ color: colors.brandLight, fontSize: fontSize['2xl'], fontWeight: 700 }}>
    Headline text
  </Text>
</Section>
```

### Monospace for data

OTP codes, reference numbers, amounts, and property IDs always use `fonts.mono`:
```tsx
<Text style={{ fontFamily: fonts.mono, fontSize: fontSize['3xl'], letterSpacing: '0.15em' }}>
  847291
</Text>
```

### State-sensitive urgency

Templates with time-based urgency (e.g. `ListingRenewalEmail`) vary their alert variant and content based on data:
```tsx
const variant = daysRemaining <= 3 ? 'error' : daysRemaining <= 7 ? 'warning' : 'info';
```

---

## ⚠️ Critical Gotchas & Anti-Patterns

### Token mistakes (will cause TS errors)

```ts
❌ colors.textError        → ✅ colors.error
❌ colors.borderError      → ✅ colors.errorBorder
❌ fontSize['4xl']         → ✅ fontSize['3xl']  (max)
❌ fontSize['5xl']         → ✅ fontSize['3xl']  (max)
❌ spacing['7']            → ✅ spacing['6'] or spacing['8']
```

### CJS bundler constraints

**Never put React Email primitives inside `EmailAlert` children:**
```tsx
❌ WRONG — crashes react-email export:
<EmailAlert variant="warning">
  <Text style={...}>Title</Text>
  <Text style={...}>Body</Text>
</EmailAlert>

✅ CORRECT — use native HTML elements:
<EmailAlert variant="warning">
  <p style={{ fontFamily: fonts.body, fontSize: fontSize.sm, ... }}>Title</p>
  <p style={{ fontFamily: fonts.body, ... }}>Body</p>
</EmailAlert>
```

**Array and string props MUST have defaults in the component destructuring:**
```tsx
❌ WRONG — undefined.length crashes on export:
export function WeeklyDigestEmail({ listings }: WeeklyDigestEmailData) { ... }

✅ CORRECT:
export function WeeklyDigestEmail({ listings = [], recipientName = '' }: WeeklyDigestEmailData) { ... }
```

### Sub-component scope

Local helper functions used inside a template (e.g., a `ListingCard` render function) must be defined **inside the component function** (`const ListingCard = ...`), not at module scope. Module-scope sub-components can confuse esbuild's tree-shaking and cause the CJS bundle to fail.

### Never use Tailwind in email templates

Email clients strip `<style>` tags and class-based CSS. All styling must be **inline `style` prop objects**. Never use `className` with Tailwind utility classes in any file under `emails/`.

---

## 🔧 Adding a New Template

1. **Create** `emails/templates/{category}/MyNewEmail.tsx` — pick the right folder (`platform/`, `listing/`, `engagement/`, `financial/`, `security/`, `marketing/`) and follow the template anatomy pattern above.
2. **Add defaults** for all array and string props in the destructuring signature.
3. **Add `previewProps`** export with realistic Nigerian market data.
4. **Export** the component, its data type, and any union types from `emails/index.ts`.
5. **Add** a send function in `lib/emailService.ts` following the `sendReactEmail()` pattern.
6. **Validate** the build: `npx react-email export --dir emails/templates` — must exit 0.
7. **Run** `npm run typecheck` — must be clean in `emails/` paths.

---

## 🌍 Nigerian Market Context

See `05-nigerian-market.md` for full cultural guidance. Email-specific notes:

- **Currency**: always format as `₦1,500,000` or `₦3,500,000 / year` — never as `NGN 1500000`
- **Phone**: display as `0706 153 9439` or `+234 706 153 9439` — format for readability
- **Addresses**: include area, LGA, and state — e.g., `12 Akin Adesola St, Victoria Island, Lagos`
- **Property types**: include Boys Quarters (BQ) as a first-class property type
- **Trust signals**: always reference "physical vetting" and "field agents" — critical for market credibility
- **Formal tone**: use respectful salutations; avoid overly casual language

---

## 🔗 Related Files

| File | Purpose |
|---|---|
| `lib/emailService.ts` | Resend SDK wrapper and all send functions |
| `app/api/waitlist/route.ts` | Example of correct `after()` usage for serverless sends |
| `emails/styles/tokens.ts` | Token definitions — read before touching any styles |
| `emails/index.ts` | Barrel — update here when adding/removing templates |
| `components/ui/RealEstLogo.tsx` | UI logo component (not used in emails; uses `EmailHeader` instead) |
| `.env` → `NEXT_PUBLIC_SITE_URL` | **Must be set** in Vercel for images to resolve in production |
