import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { templateMeta, CATEGORIES } from "@/emails/preview-registry";
import { EmailPreviewDashboard } from "./_components/EmailPreviewDashboard";

export const metadata = {
  title: "Email Templates | RealEST Admin",
  description: "Preview and audit all transactional email templates",
};

export default async function AdminEmailsPage() {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "admin") {
    redirect("/");
  }

  // ── Pass serialisable data to client ───────────────────────────────────────
  return (
    <EmailPreviewDashboard
      templates={templateMeta}
      categories={CATEGORIES}
      adminEmail={user.email ?? ""}
    />
  );
}
