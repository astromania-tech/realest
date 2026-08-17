import { PollPageClient } from './PollPageClient';
import prisma from '@/lib/prisma';

export default async function PollPage() {
  let segments: any[] = [];
  let formSlug = "realest-launch-intelligence-2026";
  let catalogError: string | null = null;

  try {
    const form = await prisma.poll_forms.findFirst({
      where: { slug: formSlug, is_active: true },
      include: { questions: { orderBy: { display_order: 'asc' } } },
    });

    if (!form) {
      catalogError = "Poll not found.";
    } else {
      // Group questions by segment (category)
      const segmentsMap: Record<string, any> = {
        buyer_renter: { label: "Buyer / Renter", description: "Looking for a home or office to buy or rent." },
        owner_landlord: { label: "Owner / Landlord", description: "I own property and want to sell or lease it." },
        agent: { label: "Agent / Broker", description: "I help clients buy, sell, or manage properties." },
        investor: { label: "Investor", description: "Looking for high-yield real estate opportunities." },
        developer_agency: { label: "Developer / Agency", description: "Building or managing large-scale projects." },
        bank_mortgage: { label: "Bank / Mortgage", description: "Providing financing and home loans." },
      };

      const grouped = form.questions.reduce((acc: any, q) => {
        const sKey = q.segment || "buyer_renter";
        if (!acc[sKey]) acc[sKey] = [];
        acc[sKey].push({
          key: q.question_key,
          prompt: q.prompt,
          type: q.question_type,
          required: q.is_required,
          options: (q.options as any[]) || [],
          order: q.display_order,
          show_if: q.show_if,
        });
        return acc;
      }, {});

      segments = Object.keys(segmentsMap).map((key) => ({
        key,
        label: segmentsMap[key].label,
        description: segmentsMap[key].description,
        questions: grouped[key] || [],
      }));
    }
  } catch (e) {
    catalogError = "Unable to load poll.";
  }

  return (
    <PollPageClient
      initialSegments={segments}
      initialFormSlug={formSlug}
      initialError={catalogError}
    />
  );
}
