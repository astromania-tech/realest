# emails/

React Email template system for RealEST. All 34 user-facing emails live here.

---

## Quick Start

```bash
# Start the visual preview server (all 34 templates with live reload)
npm run email:dev
# → opens at http://localhost:3001

# Validate all templates build correctly (run before every commit)
npx react-email export --dir emails/templates
# → should print: ✔ Successfully exported emails
```

---

## Directory Layout

```
emails/
├── index.ts                    ← single import surface for the rest of the app
├── styles/
│   └── tokens.ts               ← ALL design values: colors, fonts, spacing, etc.
├── layouts/
│   └── EmailLayout.tsx         ← Html + Head + Body shell, dark-mode CSS
├── components/
│   ├── EmailHeader.tsx         ← RealEST wordmark with dark/light swap
│   ├── EmailFooter.tsx         ← links, unsubscribe, copyright
│   ├── EmailButton.tsx         ← primary / secondary / ghost variants
│   ├── EmailAlert.tsx          ← success / warning / error / info / brand callouts
│   └── EmailUI.tsx             ← EmailSection, EmailDivider, EmailDetailRow,
│                                   EmailHeading, EmailText, OtpBlock, VerifiedBadge
├── templates/
│   ├── platform/               ← core auth, account, onboarding (8)
│   ├── listing/                ← listing lifecycle from submit → live/rejected (6)
│   ├── engagement/             ← inquiries, viewings, price alerts (3)
│   ├── financial/              ← invoices, receipts, renewals, failures (4)
│   ├── security/               ← login alerts, vetting task assignments (2)
│   └── marketing/              ← digest + 10-email waitlist warm-up series (11)
└── utils/
    └── renderEmail.ts          ← renderEmail / renderEmailText / renderEmailFull
```

---

## Template Inventory

### Platform (`templates/platform/`) — 8 templates

| Import name | File | Use case |
|---|---|---|
| `WaitlistConfirmationEmail` | `platform/WaitlistConfirmationEmail.tsx` | User joins waitlist |
| `AdminNotificationEmail` | `platform/AdminNotificationEmail.tsx` | Admin copy of new waitlist sign-up |
| `PasswordResetEmail` | `platform/PasswordResetEmail.tsx` | Password reset OTP |
| `WelcomeEmail` | `platform/WelcomeEmail.tsx` | Account verified, onboarding starts |
| `OnboardingReminderEmail` | `platform/OnboardingReminderEmail.tsx` | Incomplete onboarding (D+3 reminder) |
| `PasswordChangedEmail` | `platform/PasswordChangedEmail.tsx` | Password changed confirmation |
| `InquiryNotificationEmail` | `platform/InquiryNotificationEmail.tsx` | Owner receives buyer inquiry |
| `SubAdminInvitationEmail` | `platform/SubAdminInvitationEmail.tsx` | Admin invites sub-admin |

### Listing Lifecycle (`templates/listing/`) — 6 templates

| Import name | File | Use case |
|---|---|---|
| `ListingSubmissionEmail` | `listing/ListingSubmissionEmail.tsx` | Owner submits property |
| `MLValidationPassedEmail` | `listing/MLValidationPassedEmail.tsx` | Auto-checks passed |
| `MLValidationActionEmail` | `listing/MLValidationActionEmail.tsx` | Auto-checks flagged issues |
| `VettingAppointmentEmail` | `listing/VettingAppointmentEmail.tsx` | Physical inspection booked |
| `ListingLiveEmail` | `listing/ListingLiveEmail.tsx` | Listing approved and live |
| `ListingRejectedEmail` | `listing/ListingRejectedEmail.tsx` | Listing not approved |

### Engagement (`templates/engagement/`) — 3 templates

| Import name | File | Use case |
|---|---|---|
| `InquirySentEmail` | `engagement/InquirySentEmail.tsx` | Buyer's copy of sent inquiry |
| `ViewingReminderEmail` | `engagement/ViewingReminderEmail.tsx` | Upcoming viewing reminder (D-1) |
| `PriceDropAlertEmail` | `engagement/PriceDropAlertEmail.tsx` | Saved search price drop |

### Financial (`templates/financial/`) — 4 templates

| Import name | File | Use case |
|---|---|---|
| `InvoiceEmail` | `financial/InvoiceEmail.tsx` | Invoice issued |
| `PaymentReceiptEmail` | `financial/PaymentReceiptEmail.tsx` | Successful payment |
| `ListingRenewalEmail` | `financial/ListingRenewalEmail.tsx` | Listing approaching expiry |
| `PaymentFailedEmail` | `financial/PaymentFailedEmail.tsx` | Payment declined |

### Security & Admin (`templates/security/`) — 2 templates

| Import name | File | Use case |
|---|---|---|
| `LoginAlertEmail` | `security/LoginAlertEmail.tsx` | New device sign-in detected |
| `VettingTaskEmail` | `security/VettingTaskEmail.tsx` | Field agent inspection task assignment |

### Marketing (`templates/marketing/`) — 11 templates

#### Digest

| Import name | File | Use case |
|---|---|---|
| `WeeklyDigestEmail` | `marketing/WeeklyDigestEmail.tsx` | Weekly new-listings digest |

#### Waitlist Warm-Up Series (10 emails)

| Import name | File | Use case |
|---|---|---|
| `FrontierReengagementEmail` | `marketing/FrontierReengagementEmail.tsx` | Re-engage long-term waitlist; "why we've been quiet" |
| `AuthorityGeotagEmail` | `marketing/AuthorityGeotagEmail.tsx` | Authority series pt.1 — GPS-first verification standard |
| `AuthorityBootsGroundEmail` | `marketing/AuthorityBootsGroundEmail.tsx` | Authority series pt.2 — physical field vetting |
| `LaunchWindowEmail` | `marketing/LaunchWindowEmail.tsx` | Launch delay explanation + waitlist reward (free listings) |
| `SystemUpdateEmail` | `marketing/SystemUpdateEmail.tsx` | Modular system maintenance / update notification |
| `WaitlistMilestoneEmail` | `marketing/WaitlistMilestoneEmail.tsx` | Celebrate user count milestone |
| `AgentVsLandlordEmail` | `marketing/AgentVsLandlordEmail.tsx` | 1% vs 2% listing fee explainer |
| `PropertyCategoriesEmail` | `marketing/PropertyCategoriesEmail.tsx` | 7 property types — BQ, event centers, schools, etc. |
| `LaunchEveEmail` | `marketing/LaunchEveEmail.tsx` | T-24hr countdown with role-specific document checklist |
| `ReferralInviteEmail` | `marketing/ReferralInviteEmail.tsx` | Referral invite with dual reward block |

---

## Sending an Email

All email dispatch goes through `lib/emailService.ts`. Never import Resend directly in routes.

```ts
import { sendWelcomeEmail } from '@/lib/emailService';

const result = await sendWelcomeEmail({
  email: 'tunde@example.com',
  firstName: 'Tunde',
  userType: 'owner',
});

if (!result.success) {
  console.error('Email failed:', result.error);
}
```

In **Vercel serverless route handlers**, wrap sends in `after()` so they run after the response returns:

```ts
import { NextResponse, after } from 'next/server';

export async function POST(req: NextRequest) {
  // ... handle request ...

  after(async () => {
    await sendWelcomeEmail({ ... });
  });

  return NextResponse.json({ ok: true });
}
```

---

## Adding a New Template

1. Pick the right category folder: `platform/`, `listing/`, `engagement/`, `financial/`, `security/`, or `marketing/`.
2. Copy an existing template in that folder as your starting point.
3. Name the file `MyNewEmail.tsx` and export a component named `MyNewEmail`.
4. Add default values for **all** props in the destructuring signature:
   - Arrays: `items = []`
   - Strings: `name = ''`
   - Enum/union props: a sensible literal default, e.g. `status = 'pending'`
5. Add `MyNewEmail.subject = (data) => '...'` static subject line.
6. Export `previewProps` with realistic data.
7. Add `export default MyNewEmail;` at the bottom.
8. Add to `emails/index.ts`:
   - Named export of the component (under the correct category comment)
   - Named export of the data type
9. Add a `sendMyNewEmail()` function in `lib/emailService.ts`.
10. Run `npx react-email export --dir emails/templates` — must succeed.
11. Run `npm run typecheck` — must be clean.

---

## Token Quick Reference

### Key color names

```ts
colors.brandDark     '#07402F'   // Dark green — hero sections, primary headings
colors.brandAccent   '#ADF434'   // Acid green — CTAs, badges (use ≤10%)
colors.brandLight    '#F8F9F7'   // Off-white — page/card backgrounds
colors.brandNeutral  '#2E322E'   // Deep neutral — body text

// State colors — the only valid suffixes are (none), Bg, Border:
colors.error / colors.errorBg / colors.errorBorder
colors.warning / colors.warningBg / colors.warningBorder
colors.success / colors.successBg / colors.successBorder
colors.info / colors.infoBg / colors.infoBorder

// ❌ NEVER: colors.textError, colors.borderError — these do not exist
```

### Font size keys (max is `'3xl'`)

`xs` `sm` `base` `md` `lg` `xl` `2xl` `3xl`

### Spacing keys (no `'7'`)

`'1'` `'2'` `'3'` `'4'` `'5'` `'6'` `'8'` `'10'` `'12'` `'16'`

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| `colors.textError` | Use `colors.error` |
| `fontSize['4xl']` | Max is `fontSize['3xl']` |
| `spacing['7']` | Use `spacing['6']` or `spacing['8']` |
| React Email `<Text>` inside `<EmailAlert>` | Use native `<p>` elements inside EmailAlert |
| Array prop with no default | Add `= []` in destructuring — required for export |
| `(async () => { await sendEmail() })()` in a route handler | Use `after()` from `next/server` |
| No `NEXT_PUBLIC_SITE_URL` in Vercel | Set it — without it, all images are broken in production |
| Tailwind classes on email elements | Inline styles only — email clients strip class-based CSS |

---

## Dark Mode & Logo

The `EmailHeader` swaps between `realest-wordmark-dark.png` (shown by default) and `realest-wordmark-light.png` via `@media (prefers-color-scheme: dark)` CSS in the document `<head>`.

The **dark toggle in the react-email preview** applies `filter: invert()` to the iframe — it does not simulate `prefers-color-scheme`. To see the actual OS dark mode swap, change your system appearance to Dark.

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes (Vercel)** | Base URL for logo/image `src` attributes |
| `RESEND_API_KEY` | **Yes** | Resend API authentication |
| `RESEND_FROM_EMAIL` | Optional | Override default `from` address |

---

## Tech Stack

- [`@react-email/components`](https://react.email/docs/components/html) v1.0.8 — layout & primitive components
- [`@react-email/render`](https://react.email/docs/utilities/render) v2.0.4 — HTML/text rendering
- [`react-email`](https://react.email) v5.2.9 — dev server and export CLI
- [Resend](https://resend.com) — email delivery API

See `copilot-instructions/06-email-system.md` for the full architectural reference.
