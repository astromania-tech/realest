import { createClient } from '@/lib/supabase/client';
import {
  getCandidateRoleFromPersona,
  isSupplySidePersona,
  isWaitlistPersona,
  computeQueueScore,
  type WaitlistPersona,
} from '@/lib/referral-system';
import type { Database } from '@/lib/supabase/types';
import prisma from '@/lib/prisma';

type WaitlistEntry = Database['public']['Tables']['waitlist']['Row'];
type WaitlistInsert = Database['public']['Tables']['waitlist']['Insert'];
type WaitlistUpdate = Database['public']['Tables']['waitlist']['Update'];

// function getBaseUrl() {
//   if (typeof window !== 'undefined') return '';
//   return process.env.NEXT_PUBLIC_APP_URL || 'https://realest.ng';
// }

export interface WaitlistSubscriptionData {
  email: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  persona: WaitlistPersona;
  personaDetails?: Record<string, string | string[] | null | undefined>;
  source?: string;
  interests?: string[];
  locationPreference?: string;
  propertyTypePreference?: string;
  budgetRange?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrerUrl?: string;
}

export interface WaitlistSubscriptionResult {
  success: boolean;
  data?: WaitlistEntry;
  error?: string;
  isExistingUser?: boolean;
}

function normalizePersona(value: string | null | undefined): WaitlistPersona {
  return isWaitlistPersona(value) ? value : 'buyer_renter';
}

// ─── SERVER-SIDE: called directly from the route handler ─────────────────────
 
export async function createWaitlistEntry(
  data: WaitlistSubscriptionData & {
    userAgent?: string | null;
    ipAddress?: string | null;
  }
): Promise<WaitlistSubscriptionResult> {
  try {
    const normalizedEmail = data.email.toLowerCase().trim();
 
    // Check for existing entry
    const existing = await prisma.waitlist.findUnique({
      where: { email: normalizedEmail },
    });
 
    if (existing) {
      return {
        success: false,
        error: 'This email is already on the waitlist.',
        isExistingUser: true,
        // Cast to WaitlistEntry — existing row satisfies the shape
        data: existing as unknown as WaitlistEntry,
      };
    }
 
    const persona = data.persona;
    const referralCode = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
    const queueScore = computeQueueScore({
      persona,
      referralCount: 0,
      pollCompletionCount: 0,
    });
 
    const entry = await prisma.waitlist.create({
      data: {
        email: normalizedEmail,
        first_name: data.firstName.trim(),
        last_name: data.lastName?.trim() ?? null,
        phone: data.phone?.trim() ?? null,
        persona,
        persona_details: data.personaDetails ?? undefined,
        source: data.source ?? 'website',
        interests: data.interests ?? [],
        location_preference: data.locationPreference ?? null,
        property_type_preference: data.propertyTypePreference ?? null,
        budget_range: data.budgetRange ?? null,
        utm_source: data.utmSource ?? null,
        utm_medium: data.utmMedium ?? null,
        utm_campaign: data.utmCampaign ?? null,
        referrer_url: data.referrerUrl ?? null,
        user_agent: data.userAgent ?? null,
        referral_code: referralCode,
        queue_score: queueScore,
        candidate_role: getCandidateRoleFromPersona(persona),
        waitlist_reward_eligible: isSupplySidePersona(persona),
        status: 'active',
      },
    });
 
    return {
      success: true,
      data: entry as unknown as WaitlistEntry,
    };
  } catch (error) {
    console.error('Unexpected error in createWaitlistEntry:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    };
  }
}

/**
 * Subscribe a user to the waitlist
 */
export async function subscribeToWaitlist(
  data: WaitlistSubscriptionData
): Promise<WaitlistSubscriptionResult> {
  try {
    // Get browser info for tracking (if available)
    const userAgent = typeof window !== 'undefined' ? navigator.userAgent : null;
    const referrerUrl = typeof window !== 'undefined' ? document.referrer : null;

    const response = await fetch("/api/waitlist", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        userAgent,
        referrerUrl: data.referrerUrl || referrerUrl,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Unable to add you to the waitlist. Please try again.',
        isExistingUser: response.status === 409 || result.error?.includes('already')
      };
    }

    return {
      success: true,
      data: result.data
    };
  } catch (error) {
    console.error('Unexpected error in subscribeToWaitlist:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Unsubscribe a user from the waitlist
 */
export async function unsubscribeFromWaitlist(email: string): Promise<WaitlistSubscriptionResult> {
  try {
    const response = await fetch("/api/waitlist", {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase(), action: 'unsubscribe' }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Unable to unsubscribe. Please try again.'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error in unsubscribeFromWaitlist:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.'
    };
  }
}

/**
 * Get waitlist statistics (for admin use)
 */
// export async function getWaitlistStats() {
//   try {
//     const response = await fetch("/api/waitlist?stats=true");
//     const data = await response.json();

//     return {
//       total: data.total || 0,
//       active: data.active || 0,
//       todaySignups: data.todaySignups || 0
//     };
//   } catch (error) {
//     console.error('Error fetching waitlist stats:', error);
//     return {
//       total: 0,
//       active: 0,
//       todaySignups: 0
//     };
//   }
// }

export async function getWaitlistStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
 
    const [total, active, todaySignups] = await Promise.all([
      prisma.waitlist.count(),
      prisma.waitlist.count({ where: { status: 'active' } }),
      prisma.waitlist.count({ where: { subscribed_at: { gte: today } } }),
    ]);
 
    return { total, active, todaySignups };
  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    return { total: 0, active: 0, todaySignups: 0 };
  }
}
 

/**
 * Get recent waitlist entries (for admin use)
 */
export async function getRecentWaitlistEntries(limit: number = 10) {
  try {
    return await prisma.waitlist.findMany({
      orderBy: { subscribed_at: 'desc' },
      take: limit,
    });
  } catch (error) {
    console.error('Unexpected error in getRecentWaitlistEntries:', error);
    return [];
  }
}

/**
 * Check if an email is already in the waitlist
 */
// export async function checkEmailInWaitlist(email: string): Promise<{
//   exists: boolean;
//   status?: 'active' | 'unsubscribed' | 'bounced';
//   firstName?: string;
// }> {
//   try {
//     const response = await fetch(
//       `/api/waitlist?email=${encodeURIComponent(email.toLowerCase())}`
//     );
//     const result = await response.json();

//     if (!response.ok || !result.exists) {
//       return { exists: false };
//     }

//     return {
//       exists: true,
//       status: result.status,
//       firstName: result.firstName
//     };
//   } catch (error) {
//     console.error('Unexpected error in checkEmailInWaitlist:', error);
//     return { exists: false };
//   }
// }

export async function checkEmailInWaitlist(email: string): Promise<{
  exists: boolean;
  status?: 'active' | 'unsubscribed' | 'bounced';
  firstName?: string;
}> {
  try {
    const entry = await prisma.waitlist.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { status: true, first_name: true },
    });
 
    if (!entry) return { exists: false };
 
    return {
      exists: true,
      status: entry.status as 'active' | 'unsubscribed' | 'bounced',
      firstName: entry.first_name ?? undefined,
    };
  } catch (error) {
    console.error('Unexpected error in checkEmailInWaitlist:', error);
    return { exists: false };
  }
}


/**
 * Get user's position in the waitlist
 */
// export async function getWaitlistPosition(email: string): Promise<{
//   position?: number;
//   totalCount: number;
//   error?: string;
// }> {
//   try {
//     const response = await fetch(
//       `/api/waitlist?email=${encodeURIComponent(email.toLowerCase())}`
//     );
//     const result = await response.json();

//     if (!response.ok) {
//       return { totalCount: 0, error: result.error || 'Unable to fetch position data' };
//     }

//     return {
//       position: result.position,
//       totalCount: result.totalCount
//     };
//   } catch (error) {
//     console.error('Unexpected error in getWaitlistPosition:', error);
//     return { totalCount: 0, error: 'Unexpected error occurred' };
//   }
// }

export async function getWaitlistPosition(email: string): Promise<{
  position?: number;
  totalCount: number;
  error?: string;
}> {
  try {
    const entry = await prisma.waitlist.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { queue_score: true },
    });
 
    if (!entry) return { totalCount: 0, error: 'Email not found' };
 
    const [aheadCount, totalCount] = await Promise.all([
      prisma.waitlist.count({
        where: {
          status: 'active',
          queue_score: { gt: entry.queue_score ?? 0 },
        },
      }),
      prisma.waitlist.count({ where: { status: 'active' } }),
    ]);
 
    return { position: aheadCount + 1, totalCount };
  } catch (error) {
    console.error('Unexpected error in getWaitlistPosition:', error);
    return { totalCount: 0, error: 'Unexpected error occurred' };
  }
}

/**
 * Enhanced email check with position data
 */
export async function checkEmailWithPosition(email: string): Promise<{
  exists: boolean;
  status?: 'active' | 'unsubscribed' | 'bounced';
  firstName?: string;
  position?: number;
  totalCount?: number;
  persona?: WaitlistPersona;
  candidateRole?: string | null;
  queueScore?: number | null;
  referralCount?: number;
  referralCode?: string | null;
  waitlistRewardEligible?: boolean;
}> {
  try {
    // const response = await fetch(
    //   `/api/waitlist?email=${encodeURIComponent(email.toLowerCase())}`
    // );
    // const result = await response.json();

    // if (!response.ok || !result.exists) {
    //   return { exists: false };
    // }

    const entry = await prisma.waitlist.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
 
    if (!entry) return { exists: false };
 
    const [aheadCount, totalCount] = await Promise.all([
      prisma.waitlist.count({
        where: {
          status: 'active',
          queue_score: { gt: entry.queue_score ?? 0 },
        },
      }),
      prisma.waitlist.count({ where: { status: 'active' } }),
    ]);
 
    return {
      exists: true,
      status: entry.status as 'active' | 'unsubscribed' | 'bounced',
      firstName: entry.first_name ?? undefined,
      position: aheadCount + 1,
      totalCount,
      persona: normalizePersona(entry.persona) ?? undefined,
      candidateRole: entry.candidate_role ?? null,
      queueScore: entry.queue_score ?? null,
      referralCount: entry.referral_count ?? 0,
      referralCode: entry.referral_code ?? null,
      waitlistRewardEligible: Boolean(entry.waitlist_reward_eligible),
    };
    
    // return {
    //   exists: true,
    //   status: result.status,
    //   firstName: result.firstName,
    //   position: result.position,
    //   totalCount: result.totalCount,
    //   persona: normalizePersona(result.persona),
    //   candidateRole: result.candidateRole ?? null,
    //   queueScore: result.queueScore ?? null,
    //   referralCount: result.referralCount ?? 0,
    //   referralCode: result.referralCode ?? null,
    //   waitlistRewardEligible: Boolean(result.waitlistRewardEligible)
    // };
  } catch (error) {
    console.error('Unexpected error in checkEmailWithPosition:', error);
    return { exists: false };
  }
}

/**
 * Extract UTM parameters from URL (client-side only)
 */
export function extractUtmParams(): {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
} {
  if (typeof window === 'undefined') {
    return {};
  }

  const urlParams = new URLSearchParams(window.location.search);

  return {
    utmSource: urlParams.get('utm_source') || undefined,
    utmMedium: urlParams.get('utm_medium') || undefined,
    utmCampaign: urlParams.get('utm_campaign') || undefined
  };
}
