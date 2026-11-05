import { prisma } from "@/lib/prisma";
import { requireStaffPage } from "@/lib/auth/require-staff-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Copy, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListPager } from "@/components/realest/ListPager";
import { pageWindow, parsePage } from "@/lib/ui/page-window";

const PAGE_SIZE = 10;

function duplicatesHref(page: number) {
  return page > 1 ? `/admin/validation/duplicates?page=${page}` : "/admin/validation/duplicates";
}

export default async function DuplicatesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireStaffPage("/admin/validation/duplicates");
  const params = await searchParams;
  const requested = parsePage(params.page);
  const total = await prisma.properties.count({ where: { status: "pending_duplicate_review" } });
  const window = pageWindow(total, requested, PAGE_SIZE);
  if (params.page && requested !== window.page) redirect(duplicatesHref(window.page));

  const duplicates = await prisma.properties.findMany({
    where: { status: "pending_duplicate_review" },
    orderBy: { created_at: "asc" },
    skip: window.start,
    take: PAGE_SIZE,
    select: {
      id: true,
      title: true,
      address: true,
      city: true,
      state: true,
      created_at: true,
      owners: { select: { profiles: { select: { full_name: true } } } },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mb-8">
        <Link href="/admin/validation" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Validation Queue
        </Link>
        <h1 className="text-3xl font-bold">Duplicate Review Queue</h1>
        <p className="text-muted-foreground">Listings the reader matched to another pin, address, or photo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-orange-600" />
            Potential Duplicates ({total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full min-w-0 overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {duplicates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No listings in duplicate review
                  </TableCell>
                </TableRow>
              ) : (
                duplicates.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.title}</TableCell>
                    <TableCell>{property.owners?.profiles?.full_name}</TableCell>
                    <TableCell>{[property.address, property.city, property.state].filter(Boolean).join(", ")}</TableCell>
                    <TableCell>{property.created_at ? new Date(property.created_at).toLocaleDateString() : ""}</TableCell>
                    <TableCell>
                      <Button asChild size="sm">
                        <Link href={`/admin/validation/duplicates/${property.id}`}>
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Review
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
            </div>
            <ListPager
              page={window.page}
              pageCount={window.pageCount}
              from={window.from}
              to={window.to}
              total={total}
              prevHref={window.page > 1 ? duplicatesHref(window.page - 1) : null}
              nextHref={window.page < window.pageCount ? duplicatesHref(window.page + 1) : null}
            />
          </CardContent>
      </Card>
    </div>
  );
}
