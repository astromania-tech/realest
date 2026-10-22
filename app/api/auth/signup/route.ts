import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from "@/lib/supabase/service";
import { renderCampaignTemplate } from '@/lib/emailBulkSender';
import { Resend } from 'resend';
import { sendVerificationEmail } from '@/lib/emailService';
import { alreadyRegisteredEmail, localEmailConfirmAllowed } from '@/lib/auth/local-email-confirm';
import { marketplaceSignupRole } from '@/lib/auth/marketplace-signup-role';
import { clientAddress, consumeRateLimit } from '@/lib/http/rate-limit';
import { syncWaitlistContextToProfile } from '@/lib/reward-engine';
import type { User } from '@supabase/supabase-js';

async function syncWaitlistAfterSignup(email: string, userId: string | undefined) {
  if (!userId) return;
  try {
    await syncWaitlistContextToProfile(email.trim().toLowerCase(), userId);
  } catch (error) {
    console.error('Waitlist context sync after signup failed:', error);
  }
}

async function confirmLocalAuthUser(email: string, password?: string): Promise<User | null> {
  if (!localEmailConfirmAllowed()) return null;
  const admin = createServiceClient();
  const target = email.trim().toLowerCase();
  for (let page = 1; page <= 5; page += 1) {
    const listed = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (listed.error || !listed.data?.users) return null;
    const found = listed.data.users.find((user) => (user.email || "").toLowerCase() === target);
    if (found) {
      const updated = await admin.auth.admin.updateUserById(found.id, {
        email_confirm: true,
        ...(password ? { password } : {}),
      });
      if (updated.error || !updated.data.user) return null;
      return updated.data.user;
    }
    if (listed.data.users.length < 200) break;
  }
  return null;
}

function mailClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/**
 * POST /api/auth/signup
 * 
 * Custom signup flow that:
 * 1. Creates user via Supabase Auth Admin API (service_role)
 * 2. Leaves email unconfirmed, then sends the branded link via Resend
 * On this PC, against local Supabase only, the address is confirmed and no mail is sent.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, userType } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Never accept staff/admin from the client — invite/promote only.
    const signupRole = marketplaceSignupRole(userType);

    const supabaseAdmin = createServiceClient();
    const confirmLocally = localEmailConfirmAllowed();

    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: confirmLocally,
      user_metadata: {
        full_name: fullName || '',
        user_type: signupRole,
      },
    });

    if (createError) {
      if (confirmLocally && alreadyRegisteredEmail(createError.message)) {
        const confirmed = await confirmLocalAuthUser(email, password);
        if (confirmed) {
          await syncWaitlistAfterSignup(email, confirmed.id);
          return NextResponse.json({ success: true, user: confirmed, localConfirmed: true });
        }
      }
      return NextResponse.json({ error: createError.message }, { status: createError.status || 400 });
    }

    await syncWaitlistAfterSignup(email, userData.user?.id);

    if (confirmLocally) {
      return NextResponse.json({ success: true, user: userData.user, localConfirmed: true });
    }

    // Generate verification link and send it. Production always takes this path.
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify`,
      },
    });

    if (linkError) throw linkError;

    // 3. Render and send custom branded email
    const verificationUrl = linkData.properties.action_link;
    const { html } = await renderCampaignTemplate('VerificationEmail', {
      firstName: fullName?.split(' ')[0] || 'there',
      verificationUrl,
    });

    const from = process.env.FROM_EMAIL_AUTH || process.env.FROM_EMAIL || 'RealEST <noreply@realest.ng>';

    const resend = mailClient();
    if (!resend) {
      console.error('Resend signup email skipped: RESEND_API_KEY is not set');
    } else {
      const { error: resendError } = await resend.emails.send({
        from,
        to: email,
        subject: 'Verify your RealEST account',
        html,
      });

      if (resendError) {
        console.error('Resend signup email error:', resendError);
        // Note: User record is created, they can request a resend later if this fails
      }
    }

    return NextResponse.json({ success: true, user: userData.user });

  } catch (error: any) {
    console.error('Signup API Route error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during signup' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/auth/signup?email=
 * Resend verification (or local confirm). Rate-limited — never an open mail bomb.
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const normalized = email.trim().toLowerCase();
  const ip = clientAddress(request.headers);
  const limited = await consumeRateLimit({
    bucket: 'signup_resend',
    subject: `${ip}:${normalized}`,
    limit: 3,
  });
  if (!limited.allowed) {
    return NextResponse.json(
      { error: 'Too many verification requests. Please try again later.' },
      { status: 429 },
    );
  }

  if (localEmailConfirmAllowed()) {
    const confirmed = await confirmLocalAuthUser(normalized);
    if (!confirmed) return NextResponse.json({ error: 'Local account was not found' }, { status: 404 });
    return NextResponse.json({ success: true, localConfirmed: true });
  }

  const supabaseAdmin = createServiceClient();

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email: normalized,
    password: 'REDACTED_NOT_REQUIRED_FOR_LINK_ONLY',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify`,
    },
  });

  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 400 });

  const firstName = normalized.split('@')[0];

  const result = await sendVerificationEmail({
    email: normalized,
    firstName,
    verificationUrl: linkData.properties.action_link,
  });

  return NextResponse.json({ success: result.success, error: result.error });
}