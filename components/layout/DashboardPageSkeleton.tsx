/** Instant main-pane placeholder while App Router streams the next page. */
export function DashboardPageSkeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-live="polite">
      <div className="h-8 w-48 max-w-full rounded-lg bg-muted" />
      <div className="h-4 w-full max-w-md rounded bg-muted" />
      <div className="mt-6 space-y-3">
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className="h-16 rounded-xl border border-border bg-card/60"
          />
        ))}
      </div>
      <span className="sr-only">Loading page</span>
    </div>
  );
}
