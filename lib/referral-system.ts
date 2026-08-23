export type WaitlistPersona =
  | 'buyer_renter'
  | 'owner_landlord'
  | 'agent'
  | 'investor'
  | 'developer_agency'
  | 'bank_mortgage';

export type CandidateRole = 'user' | 'owner' | 'agent';

export type LaunchWindowAudience = 'general' | 'supply' | 'developer';

export interface WaitlistIntentOption {
  id: string;
  label: string;
  description: string;
  persona: WaitlistPersona;
}

export interface ReferralMilestone {
  count: number;
  key:
    | 'early_sneak_peek'
    | 'move_up_waitlist'
    | 'early_access'
    | 'realest_insider_badge'
    | 'vip_launch_access'
    | 'realest_ambassador';
  label: string;
  description: string;
}

export const WAITLIST_PERSONAS: Array<{
  value: WaitlistPersona;
  label: string;
  description: string;
  audience: LaunchWindowAudience;
}> = [
  {
    value: 'buyer_renter',
    label: 'Buyer or renter',
    description: 'You want verified places to buy, rent, or lease.',
    audience: 'general',
  },
  {
    value: 'owner_landlord',
    label: 'Property owner or landlord',
    description: 'You want qualified, verified demand for a property you control.',
    audience: 'supply',
  },
  {
    value: 'agent',
    label: 'Real estate agent',
    description: 'You manage listings and want verified leads, status, and tools.',
    audience: 'supply',
  },
  {
    value: 'investor',
    label: 'Investor',
    description: 'You are tracking opportunities, demand, and market clarity.',
    audience: 'general',
  },
  {
    value: 'developer_agency',
    label: 'Developer or agency',
    description: 'You manage supply at scale and want buyer demand insights.',
    audience: 'developer',
  },
  {
    value: 'bank_mortgage',
    label: 'Bank or mortgage partner',
    description: 'You want financing and partnership opportunities tied to verified supply.',
    audience: 'general',
  },
];

export const WAITLIST_INTENT_OPTIONS: WaitlistIntentOption[] = [
  {
    id: 'buy_property',
    label: 'I want to buy property',
    description: 'I am searching for verified homes or investment-ready properties to buy.',
    persona: 'buyer_renter',
  },
  {
    id: 'rent_property',
    label: 'I want to rent property',
    description: 'I need safe, verified homes to rent without agent scams.',
    persona: 'buyer_renter',
  },
  {
    id: 'list_my_property',
    label: 'I want to list my property',
    description: 'I am a landlord or owner looking for qualified verified demand.',
    persona: 'owner_landlord',
  },
  {
    id: 'work_as_agent',
    label: 'I am a real estate agent',
    description: 'I want verified leads and a trusted marketplace for my listings.',
    persona: 'agent',
  },
  {
    id: 'invest_in_real_estate',
    label: 'I invest in real estate',
    description: 'I am tracking opportunities and market performance data.',
    persona: 'investor',
  },
  {
    id: 'develop_or_manage_projects',
    label: 'I develop or manage projects',
    description: 'I am a developer or agency managing supply at scale.',
    persona: 'developer_agency',
  },
  {
    id: 'mortgage_or_finance_partner',
    label: 'I provide mortgage or financing',
    description: 'I represent a bank or financing institution exploring partnerships.',
    persona: 'bank_mortgage',
  },
];

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  {
    count: 3,
    key: 'early_sneak_peek',
    label: 'Early sneak peek',
    description: 'Get a private preview of what RealEST is launching next.',
  },
  {
    count: 5,
    key: 'move_up_waitlist',
    label: 'Move up the waitlist',
    description: 'Your queue score gets boosted so you are invited earlier.',
  },
  {
    count: 10,
    key: 'early_access',
    label: 'Early access',
    description: 'You qualify for launch access ahead of the general rollout.',
  },
  {
    count: 20,
    key: 'realest_insider_badge',
    label: 'RealEST Insider badge',
    description: 'Unlock public insider status during the pre-launch campaign.',
  },
  {
    count: 50,
    key: 'vip_launch_access',
    label: 'VIP launch access',
    description: 'Join the priority launch cohort with premium launch-day access.',
  },
  {
    count: 100,
    key: 'realest_ambassador',
    label: 'RealEST Ambassador',
    description: 'Reach ambassador status for the launch campaign and leaderboard.',
  },
];

export const WAITLIST_REWARD_KEY = 'first_listing_fee_waiver';

export function isWaitlistPersona(value: string | null | undefined): value is WaitlistPersona {
  return WAITLIST_PERSONAS.some((persona) => persona.value === value);
}

export function getPersonaMeta(persona: WaitlistPersona) {
  return WAITLIST_PERSONAS.find((item) => item.value === persona)!;
}

export function getCandidateRoleFromPersona(persona: WaitlistPersona): CandidateRole {
  switch (persona) {
    case 'owner_landlord':
      return 'owner';
    case 'agent':
      return 'agent';
    case 'developer_agency':
      return 'owner';
    default:
      return 'user';
  }
}

export function isSupplySidePersona(persona: WaitlistPersona): boolean {
  return persona === 'owner_landlord' || persona === 'agent';
}

export function getLaunchWindowAudience(persona: WaitlistPersona): LaunchWindowAudience {
  return getPersonaMeta(persona).audience;
}

export function getLaunchDate(): Date {
  const raw = process.env.NEXT_PUBLIC_RELEASE_DATE;
  const parsed = raw ? new Date(raw) : new Date('2026-03-31T00:00:00Z');
  return Number.isNaN(parsed.getTime()) ? new Date('2026-03-31T00:00:00Z') : parsed;
}

export function getLaunchRewardWindowEnd(): Date {
  const launchDate = getLaunchDate();
  const end = new Date(launchDate);
  end.setMonth(end.getMonth() + 6);
  return end;
}

export function computeQueueScore(input: {
  persona: WaitlistPersona;
  referralCount: number;
  pollCompletionCount: number;
}): number {
  const base = 100;
  const referralScore = input.referralCount * 15;
  const pollScore = input.pollCompletionCount * 20;

  let personaBonus = 0;
  if (input.persona === 'owner_landlord') personaBonus = 15;
  if (input.persona === 'agent') personaBonus = 20;
  if (input.persona === 'developer_agency') personaBonus = 25;

  const milestoneBonus = getReachedMilestones(input.referralCount).some(
    (milestone) => milestone.key === 'move_up_waitlist',
  )
    ? 40
    : 0;

  return base + referralScore + pollScore + personaBonus + milestoneBonus;
}

export function getReachedMilestones(referralCount: number): ReferralMilestone[] {
  return REFERRAL_MILESTONES.filter((milestone) => referralCount >= milestone.count);
}

export function getCurrentMilestone(referralCount: number): ReferralMilestone | null {
  const reached = getReachedMilestones(referralCount);
  return reached.at(-1) ?? null;
}

export function getNextMilestone(referralCount: number): ReferralMilestone | null {
  return REFERRAL_MILESTONES.find((milestone) => referralCount < milestone.count) ?? null;
}

export function getWaitlistRewardCopy(persona: WaitlistPersona): string | null {
  if (!isSupplySidePersona(persona)) {
    return null;
  }

  return 'Your first listing as an agent or property owner within 6 months of launch will be free.';
}

export function buildReferralShareUrl(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://realest.ng';
  return `${baseUrl}/refer?ref=${encodeURIComponent(code)}`;
}