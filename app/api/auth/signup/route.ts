import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from "@/lib/supabase/service";
import { sendVerificationEmail } from '@/lib/emailService';
import { duplicateSignupError, localEmailConfirmAllowed } from '@/lib/auth/local-email-confirm';
import { signupVerifyRedirect } from '@/lib/auth/signup-mail';
import {
  resolveRoleThenCreate,
  resolveSignupRoleFromWaitlist,
} from '@/lib/auth/signup-waitlist-role';
import { clientAddress, consumeRateLimit } from '@/lib/http/rate-limit';
import { syncWaitlistContextToProfile } from '@/lib/reward-engine';
import { prisma } from '@/lib/prisma';
import type { User } from '@supabase/supabase-js';

async function syncWaitlistAfterSignup(email: string, userId: string | undefined) {
  if (!userId) return;
  try {
    await syncWaitlistContextToProfile(email.trim().toLowerCase(), userId);
  } catch (error) {
    console.error('Waitlist context sync after signup failed:', error);
  }
}

async function confirmLocalAuthUser(email: string): Promise<User | null> {
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
      });
      if (updated.error || !updated.data.user) return null;
      return updated.data.user;
    }
    if (listed.data.users.length < 200) break;
  }
  return null;
}

/**
 * POST /api/auth/signup
 * 
 * Custom signup flow that:
 * On this PC, against local Supabase only, the address is confirmed and no mail is sent.
 * Production creates the unconfirmed user with a signup link and sends that link through Resend.
 * Resend of an existing account uses a magic link, because a second signup link is rejected.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, userType } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Never accept staff/admin from the client. Waitlist candidate_role may
    // override the UI choice — resolved server-side so public GET cannot leak it.
    const confirmLocally = localEmailConfirmAllowed();
    const { signupRole, account: accountCreation } = await resolveRoleThenCreate(
      () => resolveSignupRoleFromWaitlist(email, userType),
      async (signupRole) => {
        const supabaseAdmin = createServiceClient();

        if (confirmLocally) {
          const result = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName || '',
              user_type: signupRole,
            },
          });
          return { kind: 'local' as const, result };
        }

        const result = await supabaseAdmin.auth.admin.generateLink({
          type: 'signup',
          email,
          password,
          options: {
            data: {
              full_name: fullName || '',
              user_type: signupRole,
            },
            redirectTo: signupVerifyRedirect(),
          },
        });
        return { kind: 'hosted' as const, result };
      },
    );

    if (accountCreation.kind === 'local') {
      const { data: userData, error: createError } = accountCreation.result;

      if (createError) {
        const duplicate = duplicateSignupError(createError);
        if (duplicate) {
          return NextResponse.json({ error: duplicate }, { status: 409 });
        }
        return NextResponse.json({ error: createError.message }, { status: createError.status || 400 });
      }

      if (userData.user?.id) {
        await prisma.users.upsert({
          where: { id: userData.user.id },
          update: { role: signupRole },
          create: {
            id: userData.user.id,
            email: email.trim().toLowerCase(),
            full_name: fullName || null,
            role: signupRole,
          },
        });
      }

      await syncWaitlistAfterSignup(email, userData.user?.id);
      return NextResponse.json({ success: true, user: userData.user, localConfirmed: true });
    }

    // Hosted Auth: this signup link creates the unconfirmed user and the mail URL.
    // Creating the Auth user first makes a second signup link fail with email_exists.
    const { data: linkData, error: linkError } = accountCreation.result;

    if (linkError) {
      const duplicate = duplicateSignupError(linkError);
      if (duplicate) {
        return NextResponse.json({ error: duplicate }, { status: 409 });
      }
      throw linkError;
    }

    const actionLink = linkData?.properties?.action_link;
    const created = linkData?.user;
    if (!actionLink || !created?.id) {
      throw new Error('Verification link was not created');
    }

    await prisma.users.upsert({
      where: { id: created.id },
      update: { role: signupRole },
      create: {
        id: created.id,
        email: email.trim().toLowerCase(),
        full_name: fullName || null,
        role: signupRole,
      },
    });

    await syncWaitlistAfterSignup(email, created.id);

    const sent = await sendVerificationEmail({
      email: email.trim().toLowerCase(),
      firstName: fullName?.split(' ')[0] || 'there',
      verificationUrl: actionLink,
    });

    if (!sent.success) {
      console.error('Resend signup email error:', sent.error);
    }

    return NextResponse.json({
      success: true,
      user: created,
      emailSent: sent.success,
    });

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

  // The account already exists. A signup link is rejected with email_exists.
  // A magic link confirms the address and signs them in on /verify.
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: normalized,
    options: {
      redirectTo: signupVerifyRedirect(),
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json({ error: linkError?.message || 'Verification link was not created' }, { status: 400 });
  }

  const firstName = normalized.split('@')[0];

  const result = await sendVerificationEmail({
    email: normalized,
    firstName,
    verificationUrl: linkData.properties.action_link,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error || 'Verification email was not sent' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
