"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ListPager({
  page,
  pageCount,
  from,
  to,
  total,
  prevHref,
  nextHref,
  onPrev,
  onNext,
}: {
  page: number;
  pageCount: number;
  from: number;
  to: number;
  total: number;
  prevHref?: string | null;
  nextHref?: string | null;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  if (total <= 0) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {prevHref && !prevDisabled ? (
          <Button asChild variant="outline" size="sm" className="min-w-24">
            <Link href={prevHref}>Previous</Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-24"
            disabled={prevDisabled}
            onClick={onPrev}
          >
            Previous
          </Button>
        )}
        <span className="min-w-24 text-center text-xs text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        {nextHref && !nextDisabled ? (
          <Button asChild variant="outline" size="sm" className="min-w-24">
            <Link href={nextHref}>Next</Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-24"
            disabled={nextDisabled}
            onClick={onNext}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
