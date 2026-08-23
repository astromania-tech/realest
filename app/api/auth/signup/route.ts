import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from "@/lib/supabase/service";
import { renderCampaignTemplate } from '@/lib/emailBulkSender';
import { Resend } from 'resend';
import { sendVerificationEmail } from '@/lib/emailService';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/auth/signup
 * 
 * Custom signup flow that:
 * 1. Creates user via Supabase Auth Admin API (service_role)
 * 2. Sets email_confirm: false to prevent Supabase's default email
 * 3. Generates a verification link
 * 4. Sends a branded React Email template via Resend
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, userType } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabaseAdmin = createServiceClient();

    // 1. Create user with email_confirm: false
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName || '',
        user_type: userType || 'user',
      },
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: createError.status || 400 });
    }

    // 2. Generate verification link
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

    return NextResponse.json({ success: true, user: userData.user });

  } catch (error: any) {
    console.error('Signup API Route error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during signup' },
      { status: 500 }
    );
  }
}

// Add to app/api/auth/signup/route.ts
export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const supabaseAdmin = createServiceClient();

  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email,
    password: 'REDACTED_NOT_REQUIRED_FOR_LINK_ONLY',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/verify`,
    },
  });

  if (linkError) return NextResponse.json({ error: linkError.message }, { status: 400 });

  const firstName = email.split('@')[0]; // best we can do without the user object here

  const result = await sendVerificationEmail({
    email,
    firstName,
    verificationUrl: linkData.properties.action_link,
  });

  return NextResponse.json({ success: result.success, error: result.error });
}