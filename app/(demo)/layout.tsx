import { notFound } from "next/navigation";
import { shouldShowDemoPages } from "@/lib/appMode";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!shouldShowDemoPages()) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header Banner */}
      <div className="bg-linear-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Demo Environment
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Development & Testing Only
            </div>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <main>{children}</main>
    </div>
  );
}
