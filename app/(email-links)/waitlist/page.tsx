import WaitlistClient from './WaitlistClient';
import { getWaitlistStats } from '@/lib/waitlist';

export const dynamic = 'force-dynamic';

export default async function WaitlistPage() {
  const stats = await getWaitlistStats();
  return <WaitlistClient initialTotal={stats.active} />;
}
