import { PropertyMap } from "@/components/property/PropertyMap";

export default function MapDemoPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Property Map Demo</h1>
          <p className="text-muted-foreground">
            Test the interactive property map with all Phase 4 features:
            mobile optimization, accessibility, offline caching, and progressive loading.
          </p>
        </div>

        {/* Full-screen map container */}
        <div className="h-[calc(100vh-200px)] w-full rounded-lg overflow-hidden border">
          <PropertyMap
            showFilters={true}
            showLegend={true}
            className="w-full h-full"
          />
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <h3 className="font-semibold mb-2">Demo Features:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Progressive loading based on zoom level</li>
            <li>Offline tile caching (check status bar)</li>
            <li>Keyboard navigation (Tab to focus, arrow keys to move)</li>
            <li>High contrast mode support</li>
            <li>Mobile-optimized touch targets</li>
            <li>Full-screen filter overlay on mobile</li>
            <li>Accessibility compliance (ARIA labels, screen reader support)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
