import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from "@/lib/supabase/service";
import { sendVerificationEmail } from '@/lib/emailService';
import { duplicateSignupMessage, signupVerifyRedirect, verificationEmailLink } from '@/lib/auth/signup-mail';

/**
 * POST /api/auth/signup
 *
 * One signup link creates the unconfirmed Auth user and the mail URL.
 * A second signup link is rejected, so the mail never sends.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, userType } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    let redirectTo: string;
    try {
      redirectTo = signupVerifyRedirect();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup verification link is not configured';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const supabaseAdmin = createServiceClient();

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
          user_type: userType || 'user',
        },
        redirectTo,
      },
    });

    if (linkError) {
      const duplicate = duplicateSignupMessage(linkError);
      if (duplicate) {
        return NextResponse.json({ error: duplicate }, { status: 409 });
      }
      throw linkError;
    }

    const actionLink = linkData?.properties?.action_link;
    const created = linkData?.user;
    if (!actionLink || !created) {
      throw new Error('Verification link was not created');
    }

    const verificationUrl = verificationEmailLink(actionLink);
    const sent = await sendVerificationEmail({
      email,
      firstName: fullName?.split(' ')[0] || 'there',
      verificationUrl,
    });

    if (!sent.success) {
      console.error('Resend signup email error:', sent.error);
      return NextResponse.json(
        { success: false, error: 'Your account was created, but the verification email was not sent.' },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, user: created });
  } catch (error: unknown) {
    console.error('Signup API Route error:', error);
    const message = error instanceof Error ? error.message : 'An unexpected error occurred during signup';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/auth/signup?email=
 * Resend. The account already exists, so a second signup link is rejected.
 * A magic link confirms the address and lands on /verify.
 */
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  let redirectTo: string;
  try {
    redirectTo = signupVerifyRedirect();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup verification link is not configured';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const supabaseAdmin = createServiceClient();
  const normalized = email.trim().toLowerCase();

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: normalized,
    options: {
      redirectTo,
    },
  });

  if (linkError || !linkData?.properties?.action_link) {
    return NextResponse.json(
      { success: false, error: linkError?.message || 'Verification link was not created' },
      { status: 400 },
    );
  }

  let verificationUrl: string;
  try {
    verificationUrl = verificationEmailLink(linkData.properties.action_link);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup verification link is not configured';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }

  const result = await sendVerificationEmail({
    email: normalized,
    firstName: normalized.split('@')[0],
    verificationUrl,
  });

  if (!result.success) {
    console.error('Resend signup email error:', result.error);
    return NextResponse.json(
      { success: false, error: 'Verification email was not sent.' },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true });
}
