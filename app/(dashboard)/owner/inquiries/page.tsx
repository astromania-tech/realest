import { getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import OwnerInquiriesPage from "@/components/dashboard/OwnerInquiriesPage";

export default async function InquiriesPage() {
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const userRow = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (userRow?.role !== "owner") {
    redirect("/");
  }

  const rows = await prisma.inquiries.findMany({
    where: { owner_id: user.id },
    select: {
      id: true,
      message: true,
      status: true,
      created_at: true,
      property_id: true,
      properties: { select: { id: true, title: true } },
      profiles_inquiries_sender_idToprofiles: {
        select: { full_name: true, email: true, phone: true },
      },
    },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  const inquiries = rows.map((row) => {
    const sender = row.profiles_inquiries_sender_idToprofiles;
    return {
      id: row.id,
      message: row.message,
      status: row.status,
      created_at: row.created_at?.toISOString() ?? "",
      properties: row.properties ?? { id: "", title: "" },
      profiles: {
        full_name: sender?.full_name ?? "",
        email: sender?.email ?? "",
        phone: sender?.phone ?? "",
      },
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OwnerInquiriesPage inquiries={inquiries} />
      <Footer />
    </div>
  );
}
