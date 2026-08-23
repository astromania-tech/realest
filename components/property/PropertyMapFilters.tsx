"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Home,
  Zap,
  Shield,
  Flame,
  DollarSign,
  TrendingUp,
  Bookmark,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMapPrice, INFRASTRUCTURE_FILTERS } from "@/lib/utils/mapUtils";
import { NIGERIAN_STATES } from "@/lib/utils/nigerianLocations";

interface PropertyMapFiltersProps {
  showFilterPanel: boolean;
  filters: any;
  updateFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  showStateBoundaries: boolean;
  setShowStateBoundaries: (value: boolean) => void;
  showInfraOverlays: any;
  setShowInfraOverlays: (value: any) => void;
  radiusSearch: any;
  setRadiusSearch: (value: any) => void;
  applyFilterPreset: (preset: string) => void;
  heatmapType: string | null;
  setHeatmapType: (value: string | null) => void;
  savedSearches: any[];
  loadSavedSearch: (search: any) => void;
  setShowSaveDialog: (value: boolean) => void;
  availableLGAs: any[];
}

export function PropertyMapFilters({
  showFilterPanel,
  filters,
  updateFilter,
  resetFilters,
  showStateBoundaries,
  setShowStateBoundaries,
  showInfraOverlays,
  setShowInfraOverlays,
  radiusSearch,
  setRadiusSearch,
  applyFilterPreset,
  heatmapType,
  setHeatmapType,
  savedSearches,
  loadSavedSearch,
  setShowSaveDialog,
  availableLGAs,
}: PropertyMapFiltersProps) {
  if (!showFilterPanel) return null;

  return (
    <Card
      className="absolute top-24 left-6 w-[320px] max-h-[calc(100vh-8rem)] overflow-y-auto z-20 bg-background/95 backdrop-blur-sm border-border/50"
      role="dialog"
      aria-labelledby="filter-title"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 id="filter-title" className="text-lg font-semibold">
            Filters
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStateBoundaries(!showStateBoundaries)}
              className={cn(
                "text-sm",
                showStateBoundaries && "bg-primary/10 text-primary",
              )}
            >
              <Layers className="h-4 w-4 mr-1" />
              State Boundaries
            </Button>
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset All
            </Button>
          </div>

          {/* Infrastructure Overlays */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Infrastructure Overlays
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="nepa-overlay"
                  checked={showInfraOverlays.nepa}
                  onCheckedChange={(checked) =>
                    setShowInfraOverlays((prev: any) => ({
                      ...prev,
                      nepa: !!checked,
                    }))
                  }
                />
                <Label htmlFor="nepa-overlay" className="text-xs">
                  NEPA Zones
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="water-overlay"
                  checked={showInfraOverlays.water}
                  onCheckedChange={(checked) =>
                    setShowInfraOverlays((prev: any) => ({
                      ...prev,
                      water: !!checked,
                    }))
                  }
                />
                <Label htmlFor="water-overlay" className="text-xs">
                  Water Sources
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="internet-overlay"
                  checked={showInfraOverlays.internet}
                  onCheckedChange={(checked) =>
                    setShowInfraOverlays((prev: any) => ({
                      ...prev,
                      internet: !!checked,
                    }))
                  }
                />
                <Label htmlFor="internet-overlay" className="text-xs">
                  Internet Coverage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="security-overlay"
                  checked={showInfraOverlays.security}
                  onCheckedChange={(checked) =>
                    setShowInfraOverlays((prev: any) => ({
                      ...prev,
                      security: !!checked,
                    }))
                  }
                />
                <Label htmlFor="security-overlay" className="text-xs">
                  Security Areas
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Price Range (₦)
            </Label>
            <div className="px-2">
              <Slider
                value={[filters.minPrice, filters.maxPrice]}
                onValueChange={([min, max]) => {
                  updateFilter("minPrice", min);
                  updateFilter("maxPrice", max);
                }}
                max={100000000}
                step={1000000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatMapPrice(filters.minPrice)}</span>
                <span>{formatMapPrice(filters.maxPrice)}</span>
              </div>
            </div>
          </div>

          {/* Bedrooms/Bathrooms */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Min Bedrooms
              </Label>
              <Select
                value={filters.bedrooms.toString()}
                onValueChange={(value) =>
                  updateFilter("bedrooms", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                  <SelectItem value="5">5+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Min Bathrooms
              </Label>
              <Select
                value={filters.bathrooms.toString()}
                onValueChange={(value) =>
                  updateFilter("bathrooms", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Radius Search */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Location Search
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="radiusSearch"
                  checked={radiusSearch.enabled}
                  onCheckedChange={(checked) =>
                    setRadiusSearch((prev: any) => ({
                      ...prev,
                      enabled: !!checked,
                    }))
                  }
                />
                <Label htmlFor="radiusSearch" className="text-sm">
                  Search within radius of map center
                </Label>
              </div>

              {radiusSearch.enabled && (
                <div>
                  <Slider
                    value={[radiusSearch.radius]}
                    onValueChange={([value]) =>
                      setRadiusSearch((prev: any) => ({
                        ...prev,
                        radius: value,
                      }))
                    }
                    min={1}
                    max={50}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1 km</span>
                    <span>{radiusSearch.radius} km</span>
                    <span>50 km</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Presets */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Quick Filters
            </Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyFilterPreset("family-friendly")}
                className="justify-start"
              >
                <Home className="h-4 w-4 mr-2" />
                Family-Friendly
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyFilterPreset("power-stable")}
                className="justify-start"
              >
                <Zap className="h-4 w-4 mr-2" />
                Power Stable
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyFilterPreset("gated-communities")}
                className="justify-start"
              >
                <Shield className="h-4 w-4 mr-2" />
                Gated Communities
              </Button>
            </div>
          </div>

          {/* Heatmap Controls */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Data Visualization
            </Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={heatmapType === "density" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setHeatmapType(
                    heatmapType === "density" ? null : "density",
                  )
                }
                className="justify-start"
              >
                <Flame className="h-4 w-4 mr-2" />
                Property Density
              </Button>
              <Button
                variant={heatmapType === "price" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setHeatmapType(heatmapType === "price" ? null : "price")
                }
                className="justify-start"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Price Heatmap
              </Button>
              <Button
                variant={heatmapType === "demand" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setHeatmapType(heatmapType === "demand" ? null : "demand")
                }
                className="justify-start"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Demand Heatmap
              </Button>
            </div>
          </div>

          {/* Saved Searches */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Saved Searches
            </Label>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="w-full"
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Save Current Search
              </Button>

              {savedSearches.length > 0 && (
                <div className="space-y-1">
                  {savedSearches.map((search) => (
                    <Button
                      key={search.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => loadSavedSearch(search)}
                      className="w-full justify-start text-left"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      {search.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nigerian Infrastructure */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Infrastructure
            </Label>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Power (NEPA)
                </Label>
                <Select
                  value={filters.nepaStatus}
                  onValueChange={(value) =>
                    updateFilter("nepaStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any power status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {INFRASTRUCTURE_FILTERS.nepa_status.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Water Source
                </Label>
                <Select
                  value={filters.waterSource}
                  onValueChange={(value) =>
                    updateFilter("waterSource", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any water source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    {INFRASTRUCTURE_FILTERS.water_source.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasBq"
                  checked={filters.hasBq}
                  onCheckedChange={(checked) =>
                    updateFilter("hasBq", checked)
                  }
                />
                <Label htmlFor="hasBq" className="text-sm">
                  Has Boys Quarters (BQ)
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
