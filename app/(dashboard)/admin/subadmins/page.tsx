import { redirect } from "next/navigation"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { SubAdminForm } from "@/components/admin/SubAdminForm"
import { ListPager } from "@/components/realest/ListPager"
import { pageWindow, parsePage } from "@/lib/ui/page-window"

const PAGE_SIZE = 6

function adminsHref(page: number) {
  return page > 1 ? `/admin/subadmins?page=${page}` : "/admin/subadmins"
}

export default async function SubAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await getAuthUser()
  if (!user) redirect("/login?redirect=/admin/subadmins")

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
  if (!userRow || userRow.role !== "admin") redirect("/")

  // Fetch existing admins
  const { data: admins } = await supabase
    .from("users")
    .select("id, full_name, email, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: false })

  const rows = admins ?? []
  const params = await searchParams
  const requested = parsePage(params.page)
  const window = pageWindow(rows.length, requested, PAGE_SIZE)
  if (params.page && requested !== window.page) redirect(adminsHref(window.page))
  const visible = rows.slice(window.start, window.end)

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Manage Sub-Admins</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-heading text-xl mb-4">Create New Sub-Admin</h2>
          <SubAdminForm />
        </div>

        <div>
          <h2 className="font-heading text-xl mb-4">Current Admins ({rows.length})</h2>
          {visible.length > 0 ? (
            <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {visible.map((admin) => (
                <div key={admin.id} className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{admin.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{admin.email}</p>
                  </div>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {new Date(admin.created_at).toLocaleDateString("en-NG")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No other admins found.</p>
          )}
          <ListPager
            page={window.page}
            pageCount={window.pageCount}
            from={window.from}
            to={window.to}
            total={rows.length}
            prevHref={window.page > 1 ? adminsHref(window.page - 1) : null}
            nextHref={window.page < window.pageCount ? adminsHref(window.page + 1) : null}
          />
        </div>
      </div>
    </div>
  )
}
