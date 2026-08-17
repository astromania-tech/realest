// app/waitlist/page.tsx — Server Component
import WaitlistClient from './WaitlistClient'; // the "use client" part
import { getWaitlistStats } from '@/lib/waitlist';

export default async function WaitlistPage() {
  const stats = await getWaitlistStats(); // runs once on the server, no fetch needed
  return <WaitlistClient initialTotal={stats.total} />;
}
