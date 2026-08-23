"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  MapPin,
  Search,
  Home,
  Building2,
  Hotel,
  Calendar,
  Bed,
  Bath,
  Square,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Navigation,
  Zap,
  Droplets,
  Wifi,
  Shield,
  Bookmark,
  Flame,
  DollarSign,
  TrendingUp,
  WifiOff,
  Keyboard,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LatLngExpression, LatLngBounds } from "leaflet";
import { Loader } from "@googlemaps/js-api-loader";
const EditControl = dynamic(
  () => import("react-leaflet-draw").then((mod) => mod.EditControl),
  { ssr: false },
);
const GeoJSON = dynamic(
  () => import("react-leaflet").then((mod) => mod.GeoJSON),
  { ssr: false },
);

const MarkerClusterGroup = dynamic(
  () => import("react-leaflet-markercluster").then((mod) => mod.default),
  { ssr: false },
) as any;
import { usePropertyMap } from "@/lib/hooks/usePropertyMap";
import {
  formatMapPrice,
  createMarkerIconHTML,
  leafletBoundsToBounds,
  isValidCoordinates,
  calculateDistance,
  NIGERIAN_STATES,
  LAGOS_LGAS,
  INFRASTRUCTURE_FILTERS,
  getPropertyTypeColor,
  getPropertyTypeIcon,
} from "@/lib/utils/mapUtils";
import {
  getDefaultMapCenter,
  getDefaultMapBounds,
  getLGAsByState,
} from "@/lib/utils/nigerianLocations";
import { PropertyMapMarker } from "./PropertyMapMarker";
import { PropertyMapLegend } from "./PropertyMapLegend";
import { useMapClustering } from "@/lib/hooks/useMapClustering";
import { useOfflineCache, offlineTileCache } from "@/lib/utils/offlineCache";

// Dynamic imports for SSR compatibility
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});
const FeatureGroup = dynamic(
  () => import("react-leaflet").then((mod) => mod.FeatureGroup),
  { ssr: false },
);

import { useMapEvents, useMap } from "react-leaflet";

// Heatmap Layer Component
function HeatmapLayer({
  points,
  options,
}: {
  points: [number, number, number][];
  options: any;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return;

    // @ts-ignore
    const heatLayer = (window as any).L.heatLayer(points, options);
    map.addLayer(heatLayer);

    return () => {
      if (map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, points, options]);

  return null;
}

// Map bounds handling with event synchronization
function useMapBounds() {
  const [bounds, setBounds] = useState(getDefaultMapBounds());

  return { bounds, setBounds };
}

// Component to handle map events and update bounds
function MapEventHandler({
  onBoundsChange,
  onZoomChange,
}: {
  onBoundsChange: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
  onZoomChange?: (zoom: number) => void;
}) {
  useMapEvents({
    moveend: (e: any) => {
      const leafletBounds = e.target.getBounds();
      onBoundsChange(leafletBoundsToBounds(leafletBounds));
    },
    zoomend: (e: any) => {
      const leafletBounds = e.target.getBounds();
      const currentZoom = e.target.getZoom();
      onBoundsChange(leafletBoundsToBounds(leafletBounds));
      onZoomChange?.(currentZoom);
    },
  });

  return null;
}

// Component to control map view programmatically
function MapController({
  bounds,
}: {
  bounds: { north: number; south: number; east: number; west: number };
}) {
  const leafletMap = useMap();

  useEffect(() => {
    if (!leafletMap) return;

    const leafletBounds = new (window as any).L.LatLngBounds(
      [bounds.south, bounds.west],
      [bounds.north, bounds.east],
    );

    try {
      const current = leafletMap.getBounds();

      // If current bounds are effectively equal to target bounds, skip fitBounds
      const almostEqual = (a: number, b: number, eps = 1e-6) =>
        Math.abs(a - b) <= eps;

      if (
        current &&
        almostEqual(current.getNorth(), leafletBounds.getNorth()) &&
        almostEqual(current.getSouth(), leafletBounds.getSouth()) &&
        almostEqual(current.getEast(), leafletBounds.getEast()) &&
        almostEqual(current.getWest(), leafletBounds.getWest())
      ) {
        return;
      }

      // Only animate/fit when bounds meaningfully differ
      leafletMap.fitBounds(leafletBounds);
    } catch (err) {
      // Fallback: call fitBounds if any unexpected error occurs
      leafletMap.fitBounds(leafletBounds);
    }
  }, [bounds, leafletMap]);

  return null;
}

interface PropertyMapProps {
  className?: string;
  initialCenter?: LatLngExpression;
  initialZoom?: number;
  showFilters?: boolean;
  showLegend?: boolean;
}

export function PropertyMap({
  className,
  initialCenter = [getDefaultMapCenter().lat, getDefaultMapCenter().lng],
  initialZoom = 11,
  showFilters = true,
  showLegend = true,
}: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [showStateBoundaries, setShowStateBoundaries] = useState(false);
  const [showInfraOverlays, setShowInfraOverlays] = useState({
    nepa: false,
    water: false,
    internet: false,
    security: false,
  });
  const [stateGeoJson, setStateGeoJson] = useState<any>(null);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState("");
  const [heatmapType, setHeatmapType] = useState<
    "density" | "price" | "demand" | null
  >(null);
  const [showDirections, setShowDirections] = useState(false);
  const [directionsProperty, setDirectionsProperty] = useState<any>(null);
  const [zoom, setZoom] = useState(initialZoom); // Track current zoom level
  const [highContrast, setHighContrast] = useState(false); // Accessibility: high contrast mode
  const [keyboardMode, setKeyboardMode] = useState(false); // Accessibility: keyboard navigation
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<any>(null);
  const featureGroupRef = useRef<any>(null);

  // Offline cache hook
  const { isOnline, cacheStats, updateStats, preCacheTiles } =
    useOfflineCache();

  // Filter states
  const [filters, setFilters] = useState({
    propertyType: "all",
    listingType: "all",
    state: "",
    lga: "",
    minPrice: 0,
    maxPrice: 100000000, // 100M Naira
    bedrooms: 0,
    bathrooms: 0,
    hasBq: false,
    nepaStatus: "",
    waterSource: "",
    internetType: "",
    securityTypes: [] as string[],
  });

  // Radius search state
  const [radiusSearch, setRadiusSearch] = useState({
    enabled: false,
    radius: 5,
  });

  const { bounds, setBounds } = useMapBounds();
  const clusterOptions = useMapClustering();

  // Compute center from current bounds
  const center = {
    lat: (bounds.north + bounds.south) / 2,
    lng: (bounds.east + bounds.west) / 2,
  };

  // Memoize filters to prevent infinite re-renders
  const memoizedFilters = useMemo(
    () => ({
      propertyType: filters.propertyType && filters.propertyType !== "all" ? filters.propertyType : undefined,
      listingType:
        filters.listingType && filters.listingType !== "all" ? filters.listingType : undefined,
      state: filters.state || undefined,
      lga: filters.lga || undefined,
      minPrice: filters.minPrice || undefined,
      maxPrice: filters.maxPrice < 100000000 ? filters.maxPrice : undefined,
      bedrooms: filters.bedrooms || undefined,
      bathrooms: filters.bathrooms || undefined,
      hasBq: filters.hasBq || undefined,
      nepaStatus: filters.nepaStatus || undefined,
      waterSource: filters.waterSource || undefined,
      internetType: filters.internetType || undefined,
      securityTypes:
        filters.securityTypes.length > 0 ? filters.securityTypes : undefined,
    }),
    [
      filters.propertyType,
      filters.listingType,
      filters.state,
      filters.lga,
      filters.minPrice,
      filters.maxPrice,
      filters.bedrooms,
      filters.bathrooms,
      filters.hasBq,
      filters.nepaStatus,
      filters.waterSource,
      filters.internetType,
      filters.securityTypes,
    ]
  );

  // Fetch properties with current filters and bounds
  const { properties, isLoading, error } = usePropertyMap({
    bounds: radiusSearch.enabled ? undefined : bounds,
    center: radiusSearch.enabled ? center : undefined,
    radius: radiusSearch.enabled ? radiusSearch.radius : undefined,
    zoom: zoom, // Pass zoom level for progressive loading
    filters: memoizedFilters,
    limit: 200,
  });

  // Load Leaflet CSS, Google Maps API, and state boundaries
  useEffect(() => {
    const cleanupFunctions: (() => void)[] = [];

    const loadLeafletCSS = async () => {
      if (typeof window !== "undefined") {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Load Leaflet Draw CSS
        const drawLink = document.createElement("link");
        drawLink.rel = "stylesheet";
        drawLink.href =
          "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css";
        document.head.appendChild(drawLink);
        setLeafletLoaded(true);

        // Fetch Nigerian states GeoJSON
        try {
          const response = await fetch(
            "https://raw.githubusercontent.com/codefornigeria/popumap/master/static/geo/state.geojson",
          );
          const data = await response.json();
          setStateGeoJson(data);
        } catch (error) {
          console.warn("Failed to load state boundaries:", error);
        }

        // Load Google Maps API for autocomplete
        const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (googleMapsApiKey) {
          const loader = new Loader({
            apiKey: googleMapsApiKey,
            version: "weekly",
            libraries: ["places"],
          });

          (loader as any)
            .load()
            .then(() => {
              if (searchInputRef.current && (window as any).google) {
                const autocomplete = new (
                  window as any
                ).google.maps.places.Autocomplete(searchInputRef.current, {
                  componentRestrictions: { country: "ng" },
                  fields: ["geometry", "formatted_address"],
                });

                autocomplete.addListener("place_changed", () => {
                  const place = autocomplete.getPlace();
                  if (place.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();

                    // Center map on selected location with small bounds
                    const newBounds = {
                      north: lat + 0.01,
                      south: lat - 0.01,
                      east: lng + 0.01,
                      west: lng - 0.01,
                    };
                    setBounds(newBounds);

                    // Update search query with formatted address
                    setSearchQuery(place.formatted_address || "");
                  }
                });
              }
            })
            .catch((error: any) => {
              console.warn("Failed to load Google Maps API:", error);
            });
        }

        // Load saved searches (assuming user is logged in)
        // TODO: Replace with actual API call
        // const user = getCurrentUser();
        // if (user) {
        //   const response = await fetch('/api/saved-searches');
        //   const data = await response.json();
        //   setSavedSearches(data);
        // }

        // Load Leaflet Heatmap
        const heatmapScript = document.createElement("script");
        heatmapScript.src =
          "https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js";
        document.head.appendChild(heatmapScript);

        // Detect high contrast mode
        if (window.matchMedia) {
          const highContrastQuery = window.matchMedia(
            "(prefers-contrast: high)",
          );
          setHighContrast(highContrastQuery.matches);

          const handleContrastChange = (e: MediaQueryListEvent) => {
            setHighContrast(e.matches);
          };

          highContrastQuery.addEventListener("change", handleContrastChange);

          // Store the cleanup function
          cleanupFunctions.push(() => {
            highContrastQuery.removeEventListener("change", handleContrastChange);
          });
        }

        // Keyboard navigation detection
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Tab") {
            setKeyboardMode(true);
          }
        };

        const handleMouseDown = () => {
          setKeyboardMode(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleMouseDown);

        return () => {
          document.removeEventListener("keydown", handleKeyDown);
          document.removeEventListener("mousedown", handleMouseDown);
          // Clean up all stored cleanup functions
          cleanupFunctions.forEach(cleanup => cleanup());
        };
      }
    };
    loadLeafletCSS();
  }, []);

  // Pre-cache tiles when online and bounds change
  useEffect(() => {
    if (isOnline && leafletLoaded && mapRef.current) {
      const leafletMap = mapRef.current;
      const currentBounds = leafletMap.getBounds();
      const currentZoom = leafletMap.getZoom();

      // Pre-cache tiles for current viewport
      preCacheTiles(currentBounds, currentZoom, {
        getTileUrl: ({ x, y, z }: { x: number; y: number; z: number }) =>
          `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
      });
    }
  }, [bounds, zoom, isOnline, leafletLoaded, preCacheTiles]);

  // Filter properties by search query
  const searchFilteredProperties = properties.filter((property) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      property.title?.toLowerCase().includes(query) ||
      property.address?.toLowerCase().includes(query) ||
      property.city?.toLowerCase().includes(query) ||
      property.state?.toLowerCase().includes(query)
    );
  });

  // Filter by radius if enabled
  const filteredProperties = radiusSearch.enabled
    ? searchFilteredProperties.filter(
        (property) =>
          calculateDistance(
            property.latitude!,
            property.longitude!,
            center.lat,
            center.lng,
          ) <= radiusSearch.radius,
      )
    : searchFilteredProperties;

  // Get available LGAs for selected state
  const availableLGAs = useMemo(
    () => getLGAsByState(filters.state),
    [filters.state],
  );

  // Generate heatmap data
  const heatmapData = useMemo(() => {
    if (!heatmapType || !properties.length) return [];

    return properties
      .filter((property) =>
        isValidCoordinates(property.latitude, property.longitude),
      )
      .map((property): [number, number, number] => {
        let intensity = 1;

        if (heatmapType === "price") {
          // Normalize price to 0-1 scale (assuming max price is 1B)
          intensity = Math.min(property.price / 1000000000, 1);
        } else if (heatmapType === "demand") {
          // Simulate demand based on property age and verification
          // In production, use actual inquiry data
          intensity = property.verification_status === "verified" ? 0.8 : 0.4;
          if (property.created_at) {
            const daysOld =
              (Date.now() - new Date(property.created_at).getTime()) /
              (1000 * 60 * 60 * 24);
            intensity *= Math.max(0.3, 1 - daysOld / 365); // Newer properties have higher intensity
          }
        }

        return [property.latitude!, property.longitude!, intensity];
      });
  }, [properties, heatmapType]);

  // Handle filter changes
  const updateFilter = (key: string, value: any) => {
    // Debug: log filter updates to detect rapid/looping changes
    // eslint-disable-next-line no-console
    console.debug('[PropertyMap] updateFilter', { key, value });
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      // Reset LGA when state changes
      if (key === "state") {
        newFilters.lga = "";
      }
      return newFilters;
    });
  };

  // Save current search
  const saveCurrentSearch = async () => {
    if (!saveSearchName.trim()) return;

    const searchData = {
      name: saveSearchName,
      filters,
      bounds,
      radiusSearch,
      searchQuery,
    };

    // TODO: Replace with actual API call
    // await fetch('/api/saved-searches', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(searchData),
    // });

    // For now, add to local state
    setSavedSearches((prev) => [...prev, { id: Date.now(), ...searchData }]);
    setShowSaveDialog(false);
    setSaveSearchName("");
  };

  // Load saved search
  const loadSavedSearch = (search: any) => {
    setFilters(search.filters);
    setBounds(search.bounds);
    setRadiusSearch(search.radiusSearch);
    setSearchQuery(search.searchQuery);
  };

  // Apply filter preset
  const applyFilterPreset = (preset: string) => {
    const presets = {
      "family-friendly": {
        hasBq: true,
        bedrooms: 3,
        bathrooms: 2,
        propertyType: "",
        listingType: "",
      },
      "power-stable": {
        nepaStatus: "stable",
        propertyType: "",
        listingType: "",
      },
      "gated-communities": {
        securityTypes: ["gated_community"],
        propertyType: "",
        listingType: "",
      },
    };

    if (presets[preset as keyof typeof presets]) {
      setFilters((prev) => ({
        ...prev,
        ...presets[preset as keyof typeof presets],
      }));
    }
  };

  // Get directions URL
  const getDirectionsUrl = (property: any) => {
    const origin = `${center.lat},${center.lng}`;
    const destination = `${property.latitude},${property.longitude}`;
    return `https://www.google.com/maps/dir/${origin}/${destination}`;
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      propertyType: "all",
      listingType: "all",
      state: "",
      lga: "",
      minPrice: 0,
      maxPrice: 100000000,
      bedrooms: 0,
      bathrooms: 0,
      hasBq: false,
      nepaStatus: "",
      waterSource: "",
      internetType: "",
      securityTypes: [],
    });
  };

  // Image navigation
  const nextImage = () => {
    if (selectedProperty?.property_media?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedProperty.property_media.length - 1 ? 0 : prev + 1,
      );
    }
  };

  const prevImage = () => {
    if (selectedProperty?.property_media?.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProperty.property_media.length - 1 : prev - 1,
      );
    }
  };

  // Get current image URL
  const getCurrentImageUrl = (property: any) => {
    if (property?.property_media?.length > 0) {
      const currentMedia = property.property_media[currentImageIndex];
      if (currentMedia?.media_type === "image") {
        return currentMedia.file_url;
      }
    }
    return "/placeholder-property.jpg";
  };

  // Keyboard navigation handlers
  const handleKeyNavigation = useCallback(
    (e: KeyboardEvent) => {
      if (!keyboardMode) return;

      const step = 0.01; // Small movement step
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setBounds((prev) => ({
            ...prev,
            north: prev.north + step,
            south: prev.south + step,
          }));
          break;
        case "ArrowDown":
          e.preventDefault();
          setBounds((prev) => ({
            ...prev,
            north: prev.north - step,
            south: prev.south - step,
          }));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setBounds((prev) => ({
            ...prev,
            east: prev.east - step,
            west: prev.west - step,
          }));
          break;
        case "ArrowRight":
          e.preventDefault();
          setBounds((prev) => ({
            ...prev,
            east: prev.east + step,
            west: prev.west + step,
          }));
          break;
        case "+":
        case "=":
          e.preventDefault();
          setZoom((prev) => Math.min(prev + 1, 18));
          break;
        case "-":
          e.preventDefault();
          setZoom((prev) => Math.max(prev - 1, 1));
          break;
      }
    },
    [keyboardMode],
  );

  useEffect(() => {
    if (keyboardMode) {
      // Inline the handler to avoid dependency cycle
      const handler = (e: KeyboardEvent) => {
        if (!keyboardMode) return;

        const step = 0.01; // Small movement step
        switch (e.key) {
          case "ArrowUp":
            e.preventDefault();
            setBounds((prev) => ({
              ...prev,
              north: prev.north + step,
              south: prev.south + step,
            }));
            break;
          case "ArrowDown":
            e.preventDefault();
            setBounds((prev) => ({
              ...prev,
              north: prev.north - step,
              south: prev.south - step,
            }));
            break;
          case "ArrowLeft":
            e.preventDefault();
            setBounds((prev) => ({
              ...prev,
              east: prev.east - step,
              west: prev.west - step,
            }));
            break;
          case "ArrowRight":
            e.preventDefault();
            setBounds((prev) => ({
              ...prev,
              east: prev.east + step,
              west: prev.west + step,
            }));
            break;
          case "+":
          case "=":
            e.preventDefault();
            setZoom((prev) => Math.min(prev + 1, 18));
            break;
          case "-":
            e.preventDefault();
            setZoom((prev) => Math.max(prev - 1, 1));
            break;
        }
      };

      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
    }
  }, [keyboardMode]); // Removed handleKeyNavigation dependency

  if (!leafletLoaded) {
    return (
      <div className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-background">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Map...</h2>
          <p className="text-muted-foreground">
            Please wait while we initialize the property map.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Accessibility Status Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-background/90 backdrop-blur-sm border-b border-border/50 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {/* Online/Offline Status */}
            <div
              className={cn(
                "flex items-center gap-2 px-2 py-1 rounded-md",
                isOnline
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800",
              )}
            >
              {isOnline ? (
                <Wifi className="h-4 w-4" />
              ) : (
                <WifiOff className="h-4 w-4" />
              )}
              <span className="sr-only">{isOnline ? "Online" : "Offline"}</span>
              <span className="hidden sm:inline">
                {isOnline ? "Online" : "Offline"} • Cache: {cacheStats.size}{" "}
                tiles ({cacheStats.sizeMB}MB)
              </span>
            </div>

            {/* Accessibility Indicators */}
            {keyboardMode && (
              <div className="flex items-center gap-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                <Keyboard className="h-4 w-4" />
                <span className="sr-only">Keyboard navigation active</span>
                <span className="hidden sm:inline">Keyboard Mode</span>
              </div>
            )}

            {highContrast && (
              <div className="flex items-center gap-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-md">
                <Eye className="h-4 w-4" />
                <span className="sr-only">High contrast mode active</span>
                <span className="hidden sm:inline">High Contrast</span>
              </div>
            )}
          </div>

          {/* Zoom Level Indicator */}
          <div className="text-muted-foreground">Zoom: {zoom}</div>
        </div>
      </div>

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%" }}
        className={cn("z-0", highContrast && "high-contrast")}
        aria-label="Interactive property map - use arrow keys for navigation when focused"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEventHandler onBoundsChange={setBounds} onZoomChange={setZoom} />
        <MapController bounds={bounds} />
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={(e: any) => {
              const layer = e.layer;
              const bounds = layer.getBounds();
              const newBounds = leafletBoundsToBounds(bounds);
              setBounds(newBounds);
            }}
            draw={{
              rectangle: true,
              polygon: true,
              circle: false,
              marker: false,
              polyline: false,
              circlemarker: false,
            }}
          />
        </FeatureGroup>
        {showStateBoundaries && stateGeoJson && (
          <GeoJSON
            data={stateGeoJson}
            style={{
              color: "#374151",
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0.1,
            }}
          />
        )}
        {/* Infrastructure Overlays */}
        {showInfraOverlays.nepa && stateGeoJson && (
          <GeoJSON
            data={stateGeoJson}
            style={{
              color: "#10B981",
              weight: 2,
              opacity: 0.8,
              fillColor: "#10B981",
              fillOpacity: 0.2,
            }}
          />
        )}
        {showInfraOverlays.water && stateGeoJson && (
          <GeoJSON
            data={stateGeoJson}
            style={{
              color: "#3B82F6",
              weight: 2,
              opacity: 0.8,
              fillColor: "#3B82F6",
              fillOpacity: 0.2,
            }}
          />
        )}
        {showInfraOverlays.internet && stateGeoJson && (
          <GeoJSON
            data={stateGeoJson}
            style={{
              color: "#8B5CF6",
              weight: 2,
              opacity: 0.8,
              fillColor: "#8B5CF6",
              fillOpacity: 0.2,
            }}
          />
        )}
        {showInfraOverlays.security && stateGeoJson && (
          <GeoJSON
            data={stateGeoJson}
            style={{
              color: "#84CC16",
              weight: 2,
              opacity: 0.8,
              fillColor: "#84CC16",
              fillOpacity: 0.2,
            }}
          />
        )}

        {/* Heatmap Layer */}
        {heatmapType && heatmapData.length > 0 && (
          <HeatmapLayer
            points={heatmapData}
            options={{
              radius: 25,
              blur: 15,
              maxZoom: 11,
              max: heatmapType === "price" ? 1 : 1,
              gradient:
                heatmapType === "price"
                  ? {
                      0.2: "blue",
                      0.4: "lime",
                      0.6: "yellow",
                      0.8: "orange",
                      1.0: "red",
                    }
                  : {
                      0.2: "blue",
                      0.4: "cyan",
                      0.6: "lime",
                      0.8: "yellow",
                      1.0: "red",
                    },
            }}
          />
        )}

        <MarkerClusterGroup {...clusterOptions}>
          {filteredProperties.map((property: any) => (
            <PropertyMapMarker
              key={property.id}
              property={property}
              onPropertyClick={(property) => {
                setSelectedProperty(property);
                setCurrentImageIndex(0);
              }}
              selectedPropertyId={selectedProperty?.id}
            />
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* Header Overlay - Adjusted for status bar */}
      <div className="absolute top-12 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                RealEST Property Map
              </h1>
              <p className="text-white/80 text-xs sm:text-sm">
                Discover verified properties across Nigeria
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-white">
              {/* Mobile Filter Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden bg-black/20 hover:bg-black/40 text-white border border-white/20 h-10 w-10"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                aria-label="Toggle mobile filter menu"
                aria-expanded={showFilterPanel}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold">
                  {filteredProperties.length}
                </p>
                <p className="text-xs sm:text-sm text-white/80">
                  Properties Found
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="Search by location, property type, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 bg-background/95 backdrop-blur-sm border-border/50 text-base", // Larger touch target
                highContrast && "border-2 border-white",
              )}
              aria-label="Search properties by location, type, or features"
            />
            {showFilters && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10", // Larger touch target
                  highContrast && "border-2 border-white",
                )}
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                aria-label="Toggle filters panel"
                aria-expanded={showFilterPanel}
              >
                <SlidersHorizontal className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Quick Filters - Mobile optimized */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {/* <Select
                value={filters.propertyType}
                onValueChange={(value) => updateFilter("propertyType", value)}
              >
                <SelectTrigger
                  className={cn(
                    "w-full sm:w-[140px] bg-background/95 backdrop-blur-sm h-11", // Full width on mobile, larger touch target
                    highContrast && "border-2 border-white",
                  )}
                >
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="duplex">Duplex</SelectItem>
                  <SelectItem value="detached_house">Detached House</SelectItem>
                  <SelectItem value="terrace">Terrace / Townhouse</SelectItem>
                  <SelectItem value="bungalow">Bungalow</SelectItem>
                  <SelectItem value="penthouse">Penthouse</SelectItem>
                  <SelectItem value="flat">Flat / Apartment</SelectItem>
                  <SelectItem value="mini_flat">Mini Flat</SelectItem>
                  <SelectItem value="self_contained">Self-Contained</SelectItem>
                  <SelectItem value="room_and_parlor">Room &amp; Parlor</SelectItem>
                  <SelectItem value="single_room">Single Room</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="office">Office Space</SelectItem>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="showroom">Showroom</SelectItem>
                  <SelectItem value="hotel">Hotel</SelectItem>
                  <SelectItem value="event_center">Event Center</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="residential_land">Residential Land</SelectItem>
                  <SelectItem value="commercial_land">Commercial Land</SelectItem>
                </SelectContent>
              </Select> */}

              {/* Temporary native select to isolate Radix */}
              <select
                aria-label="Property Type (temporary)"
                value={filters.propertyType}
                onChange={(e) => updateFilter('propertyType', e.target.value)}
                className="w-full sm:w-[160px] bg-background/95 backdrop-blur-sm h-11 px-3"
              >
                <option value="all">All Types</option>
                <optgroup label="Residential">
                  <option value="duplex">Duplex</option>
                  <option value="detached_house">Detached House</option>
                  <option value="terrace">Terrace / Townhouse</option>
                  <option value="bungalow">Bungalow</option>
                  <option value="penthouse">Penthouse</option>
                  <option value="flat">Flat / Apartment</option>
                  <option value="mini_flat">Mini Flat</option>
                  <option value="self_contained">Self-Contained</option>
                  <option value="room_and_parlor">Room &amp; Parlor</option>
                  <option value="single_room">Single Room</option>
                </optgroup>
                <optgroup label="Commercial">
                  <option value="shop">Shop</option>
                  <option value="office">Office Space</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="showroom">Showroom</option>
                </optgroup>
                <optgroup label="Hospitality">
                  <option value="hotel">Hotel</option>
                  <option value="event_center">Event Center</option>
                  <option value="restaurant">Restaurant</option>
                </optgroup>
                <optgroup label="Land">
                  <option value="residential_land">Residential Land</option>
                  <option value="commercial_land">Commercial Land</option>
                </optgroup>
              </select>

              <select
                aria-label="Listing Type (temporary)"
                value={filters.listingType}
                onChange={(e) => updateFilter('listingType', e.target.value)}
                className={cn(
                  "w-full sm:w-[120px] bg-background/95 backdrop-blur-sm h-11 px-3",
                  highContrast && "border-2 border-white",
                )}
              >
                <option value="all">All Listings</option>
                <option value="for_sale">For Sale</option>
                <option value="for_rent">For Rent</option>
                <option value="for_lease">For Lease</option>
                <option value="short_let">Short Let</option>
              </select>

              <select
                aria-label="State (temporary)"
                value={filters.state}
                onChange={(e) => updateFilter('state', e.target.value)}
                className={cn(
                  "w-full sm:w-[120px] bg-background/95 backdrop-blur-sm h-11 px-3",
                  highContrast && "border-2 border-white",
                )}
              >
                <option value="all">All States</option>
                {NIGERIAN_STATES.map((state: any) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="LGA (temporary)"
                value={filters.lga}
                onChange={(e) => updateFilter('lga', e.target.value)}
                disabled={!filters.state}
                className={cn(
                  "w-full sm:w-[120px] bg-background/95 backdrop-blur-sm h-11 px-3",
                  highContrast && "border-2 border-white",
                )}
              >
                <option value="all">All LGAs</option>
                {availableLGAs.map((lga: any) => (
                  <option key={lga.name} value={lga.name}>
                    {lga.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel - Mobile optimized */}
      {showFilterPanel && (
        <>
          {/* Mobile Overlay Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-15 sm:hidden"
            onClick={() => setShowFilterPanel(false)}
            aria-hidden="true"
          />
          <Card
            className={cn(
              "fixed sm:absolute top-32 sm:top-32 left-2 sm:left-6 right-2 sm:right-auto w-auto sm:w-[320px] h-[calc(100vh-8rem)] sm:h-auto max-h-[calc(100vh-12rem)] overflow-y-auto z-20 bg-background/95 backdrop-blur-sm border-border/50 sm:max-h-[calc(100vh-10rem)]",
              highContrast && "border-2 border-white",
            )}
            role="dialog"
            aria-labelledby="filter-title"
          >
            <div className="p-4 sm:p-6">
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
                      "text-xs sm:text-sm h-8 w-8 sm:h-9 sm:w-auto px-2 sm:px-3", // Smaller on mobile
                      showStateBoundaries && "bg-primary/10 text-primary",
                    )}
                  >
                    <Layers className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">State Boundaries</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs sm:text-sm h-8 px-2 sm:px-3"
                  >
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
                          setShowInfraOverlays((prev) => ({
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
                          setShowInfraOverlays((prev) => ({
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
                          setShowInfraOverlays((prev) => ({
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
                          setShowInfraOverlays((prev) => ({
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
                    <select
                      aria-label="Min Bedrooms (temporary)"
                      value={filters.bedrooms.toString()}
                      onChange={(e) =>
                        updateFilter("bedrooms", parseInt(e.target.value))
                      }
                      className={cn(
                        "w-full bg-background/95 backdrop-blur-sm h-11 px-3",
                        highContrast && "border-2 border-white",
                      )}
                    >
                      <option value="0">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Min Bathrooms
                    </Label>
                    <select
                      aria-label="Min Bathrooms (temporary)"
                      value={filters.bathrooms.toString()}
                      onChange={(e) =>
                        updateFilter("bathrooms", parseInt(e.target.value))
                      }
                      className={cn(
                        "w-full bg-background/95 backdrop-blur-sm h-11 px-3",
                        highContrast && "border-2 border-white",
                      )}
                    >
                      <option value="0">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
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
                          setRadiusSearch((prev) => ({
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
                            setRadiusSearch((prev) => ({
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
                      variant={
                        heatmapType === "density" ? "default" : "outline"
                      }
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
                        setHeatmapType(
                          heatmapType === "demand" ? null : "demand",
                        )
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
                      <select
                        aria-label="Power status (temporary)"
                        value={filters.nepaStatus}
                        onChange={(e) => updateFilter("nepaStatus", e.target.value)}
                        className={cn(
                          "w-full bg-background/95 backdrop-blur-sm h-11 px-3",
                          highContrast && "border-2 border-white",
                        )}
                      >
                        <option value="all">Any</option>
                        {INFRASTRUCTURE_FILTERS.nepa_status.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">
                        Water Source
                      </Label>
                      <select
                        aria-label="Water source (temporary)"
                        value={filters.waterSource}
                        onChange={(e) => updateFilter("waterSource", e.target.value)}
                        className={cn(
                          "w-full bg-background/95 backdrop-blur-sm h-11 px-3",
                          highContrast && "border-2 border-white",
                        )}
                      >
                        <option value="all">Any</option>
                        {INFRASTRUCTURE_FILTERS.water_source.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
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
        </>
      )}

      {/* Property Details Card - Mobile optimized */}
      {selectedProperty && (
        <Card
          className={cn(
            "absolute right-2 sm:right-6 top-32 left-2 sm:left-auto w-auto sm:w-[400px] max-h-[calc(100vh-12rem)] overflow-y-auto z-20 bg-background/95 backdrop-blur-sm border-border/50",
            highContrast && "border-2 border-white",
          )}
          role="dialog"
          aria-labelledby="property-title"
        >
          <div className="relative">
            {/* Property Images */}
            <div className="relative h-48 sm:h-64 overflow-hidden rounded-t-lg">
              <img
                src={getCurrentImageUrl(selectedProperty)}
                alt={selectedProperty.title}
                className="w-full h-full object-cover"
              />

              {/* Image Navigation */}
              {selectedProperty.property_media?.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-10 w-10 sm:h-12 sm:w-12" // Larger touch targets
                    onClick={prevImage}
                    aria-label="Previous property image"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-10 w-10 sm:h-12 sm:w-12" // Larger touch targets
                    onClick={nextImage}
                    aria-label="Next property image"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>

                  {/* Image Indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {selectedProperty.property_media.map(
                      (_: any, idx: number) => (
                        <div
                          key={idx}
                          className={cn(
                            "h-1.5 w-1.5 rounded-full transition-all",
                            idx === currentImageIndex
                              ? "bg-white w-4"
                              : "bg-white/50",
                          )}
                        />
                      ),
                    )}
                  </div>
                </>
              )}

              {/* Verification Badge */}
              {selectedProperty.verification_status === "verified" && (
                <Badge className="absolute top-3 left-3 bg-green-600 hover:bg-green-700 text-sm">
                  ✓ Verified
                </Badge>
              )}

              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white h-10 w-10 sm:h-12 sm:w-12" // Larger touch target
                onClick={() => setSelectedProperty(null)}
                aria-label="Close property details"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Property Details */}
            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 id="property-title" className="text-2xl font-bold">
                    {selectedProperty.title}
                  </h3>
                  <Badge
                    variant="outline"
                    style={{
                      backgroundColor: `${getPropertyTypeColor(selectedProperty.property_type)}20`,
                      borderColor: getPropertyTypeColor(
                        selectedProperty.property_type,
                      ),
                    }}
                  >
                    {selectedProperty.property_type.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {selectedProperty.address}, {selectedProperty.city},{" "}
                    {selectedProperty.state}
                  </span>
                </div>

                <div className="text-3xl font-bold text-primary">
                  {formatMapPrice(
                    selectedProperty.price,
                    selectedProperty.currency,
                  )}
                  <span className="text-sm text-muted-foreground ml-2">
                    for {selectedProperty.listing_type}
                  </span>
                </div>
              </div>

              {/* Property Specs — bedrooms/bathrooms/square_feet live on `properties` table */}
              {(selectedProperty.bedrooms || selectedProperty.bathrooms || selectedProperty.square_feet) && (
                <div className="flex flex-wrap gap-4 py-4 border-y border-border">
                  {selectedProperty.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">
                        {selectedProperty.bedrooms}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Beds
                      </span>
                    </div>
                  )}
                  {selectedProperty.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">
                        {selectedProperty.bathrooms}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Baths
                      </span>
                    </div>
                  )}
                  {selectedProperty.square_feet && (
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">
                        {Number(selectedProperty.square_feet).toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        sqft
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Nigerian Infrastructure — stored in property_details[0].metadata */}
              {selectedProperty.property_details?.[0]?.metadata && (
                <div>
                  <h4 className="font-semibold mb-3">Infrastructure</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProperty.property_details[0].metadata.nepa_status && (
                      <div className="flex items-center gap-2 text-sm">
                        <Zap className="h-4 w-4 text-orange-500" />
                        <span>
                          NEPA: {String(selectedProperty.property_details[0].metadata.nepa_status)}
                        </span>
                      </div>
                    )}
                    {selectedProperty.property_details[0].metadata.water_source && (
                      <div className="flex items-center gap-2 text-sm">
                        <Droplets className="h-4 w-4 text-blue-500" />
                        <span>
                          Water:{" "}
                          {String(selectedProperty.property_details[0].metadata.water_source).replace("_", " ")}
                        </span>
                      </div>
                    )}
                    {selectedProperty.property_details[0].metadata.internet_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <Wifi className="h-4 w-4 text-purple-500" />
                        <span>
                          Internet:{" "}
                          {String(selectedProperty.property_details[0].metadata.internet_type)}
                        </span>
                      </div>
                    )}
                    {selectedProperty.property_details[0].metadata.has_bq && (
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-4 w-4 text-green-500" />
                        <span>Has BQ</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedProperty.description && (
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedProperty.description}
                  </p>
                </div>
              )}

              {/* Action Buttons - Mobile optimized */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button className="flex-1 h-12 text-base font-semibold">
                  View Details
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-base"
                  onClick={() => {
                    setDirectionsProperty(selectedProperty);
                    setShowDirections(true);
                  }}
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <PropertyMapLegend
        showLegend={showLegend}
        filteredProperties={filteredProperties}
      />

      {/* Keyboard Navigation Instructions - Mobile hidden */}
      {keyboardMode && (
        <Card className="absolute bottom-32 left-2 sm:left-6 p-3 sm:p-4 z-20 bg-background/95 backdrop-blur-sm border-border/50 max-w-sm hidden sm:block">
          <h4 className="font-semibold mb-2">Keyboard Navigation</h4>
          <div className="text-sm space-y-1">
            <p>
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑↓←→</kbd>{" "}
              Move map
            </p>
            <p>
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">+/-</kbd>{" "}
              Zoom in/out
            </p>
            <p>
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd>{" "}
              Navigate controls
            </p>
          </div>
        </Card>
      )}

      {/* Directions Dialog */}
      {showDirections && directionsProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-[500px] mx-4">
            <h3 className="text-lg font-semibold mb-4">Get Directions</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Get directions to {directionsProperty.title}
                </p>
                <p className="text-sm">
                  {directionsProperty.address}, {directionsProperty.city},{" "}
                  {directionsProperty.state}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() =>
                    window.open(getDirectionsUrl(directionsProperty), "_blank")
                  }
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Driving
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() =>
                    window.open(
                      `${getDirectionsUrl(directionsProperty)}&dirflg=w`,
                      "_blank",
                    )
                  }
                >
                  Walking
                </Button>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDirections(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-[400px] mx-4">
            <h3 className="text-lg font-semibold mb-4">Save Search</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchName" className="text-sm font-medium">
                  Search Name
                </Label>
                <Input
                  id="searchName"
                  value={saveSearchName}
                  onChange={(e) => setSaveSearchName(e.target.value)}
                  placeholder="Enter a name for this search"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveCurrentSearch}
                  disabled={!saveSearchName.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Loading/Error States */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-30">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Loading properties...</span>
            </div>
          </Card>
        </div>
      )}

      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30">
          <Card className="p-4 bg-destructive/10 border-destructive/20">
            <p className="text-destructive text-sm">{error}</p>
          </Card>
        </div>
      )}

      {/* High Contrast Styles */}
      <style jsx>{`
        .high-contrast {
          filter: contrast(1.5) brightness(0.9);
        }
        .high-contrast .leaflet-popup-content-wrapper {
          background: #000 !important;
          color: #fff !important;
          border: 2px solid #fff !important;
        }
        .high-contrast .leaflet-popup-tip {
          background: #000 !important;
        }
        .high-contrast .custom-marker {
          filter: brightness(1.2) contrast(1.3);
        }
      `}</style>
    </div>
  );
}

export default PropertyMap;
