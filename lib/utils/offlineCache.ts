import React from "react";
import { LatLngBounds } from "leaflet";

// Offline tile caching for map tiles
class OfflineTileCache {
  private static instance: OfflineTileCache;
  private cache: Map<string, string> = new Map();
  private readonly MAX_CACHE_SIZE = 1000; // Maximum number of tiles to cache
  private readonly CACHE_KEY = "realest_map_tiles";
  private initialized = false;

  private constructor() {
    // Defer localStorage access until explicitly initialized
  }

  static getInstance(): OfflineTileCache {
    if (!OfflineTileCache.instance) {
      OfflineTileCache.instance = new OfflineTileCache();
    }
    return OfflineTileCache.instance;
  }

  // Generate cache key for tile
  private getTileKey(url: string): string {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, "");
  }

  // Initialize cache from localStorage (call this only in browser environment)
  initialize(): void {
    if (this.initialized || typeof window === "undefined") return;

    try {
      this.loadFromStorage();
      this.initialized = true;
    } catch (error) {
      console.warn("Failed to initialize tile cache:", error);
    }
  }

  // Store tile in cache
  async storeTile(url: string, blob: Blob): Promise<void> {
    try {
      const key = this.getTileKey(url);

      // Convert blob to base64 for storage
      const base64 = await this.blobToBase64(blob);

      // Check cache size limit
      if (this.cache.size >= this.MAX_CACHE_SIZE) {
        // Remove oldest entries (simple FIFO)
        const keys = Array.from(this.cache.keys()).slice(0, 100);
        keys.forEach((k) => this.cache.delete(k));
      }

      this.cache.set(key, base64);
      this.saveToStorage();
    } catch (error) {
      console.warn("Failed to cache tile:", error);
    }
  }

  // Retrieve tile from cache
  getTile(url: string): string | null {
    const key = this.getTileKey(url);
    return this.cache.get(key) || null;
  }

  // Check if tile is cached
  hasTile(url: string): boolean {
    const key = this.getTileKey(url);
    return this.cache.has(key);
  }

  // Pre-cache tiles for a given bounds and zoom level
  async preCacheTiles(
    bounds: LatLngBounds,
    zoom: number,
    tileLayer: any,
  ): Promise<void> {
    if (!navigator.onLine) return; // Don't pre-cache when offline

    try {
      const promises: Promise<void>[] = [];

      // Get tile coordinates for the bounds
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();

      // Convert lat/lng to tile coordinates
      const tileCoords = this.getTileCoords(southWest.lat, southWest.lng, zoom);
      const tileCoordsNE = this.getTileCoords(
        northEast.lat,
        northEast.lng,
        zoom,
      );

      // Cache tiles in the viewport + buffer
      for (let x = tileCoords.x - 1; x <= tileCoordsNE.x + 1; x++) {
        for (let y = tileCoords.y - 1; y <= tileCoordsNE.y + 1; y++) {
          const tileUrl = tileLayer.getTileUrl({ x, y, z: zoom });

          if (!this.hasTile(tileUrl)) {
            promises.push(this.cacheTile(tileUrl));
          }
        }
      }

      await Promise.allSettled(promises);
      console.log(`Pre-cached ${promises.length} tiles for offline use`);
    } catch (error) {
      console.warn("Failed to pre-cache tiles:", error);
    }
  }

  // Cache a single tile
  private async cacheTile(url: string): Promise<void> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        await this.storeTile(url, blob);
      }
    } catch (error) {
      // Silently fail for individual tile caching
    }
  }

  // Convert blob to base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Get tile coordinates from lat/lng
  private getTileCoords(lat: number, lng: number, zoom: number) {
    const latRad = (lat * Math.PI) / 180;
    const n = Math.pow(2, zoom);

    const x = Math.floor(((lng + 180) / 360) * n);
    const y = Math.floor(
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
        n,
    );

    return { x, y };
  }

  // Save cache to localStorage
  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const cacheObject = Object.fromEntries(this.cache);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      // localStorage might be full, clear some entries
      console.warn("Failed to save tile cache to storage:", error);
      this.clearOldEntries();
    }
  }

  // Load cache from localStorage
  private loadFromStorage(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const cacheObject = JSON.parse(stored);
        this.cache = new Map(Object.entries(cacheObject));
      }
    } catch (error) {
      console.warn("Failed to load tile cache from storage:", error);
    }
  }

  // Clear old entries when storage is full
  private clearOldEntries(): void {
    const keys = Array.from(this.cache.keys()).slice(0, 200);
    keys.forEach((key) => this.cache.delete(key));
    this.saveToStorage();
  }

  // Clear entire cache
  clearCache(): void {
    this.cache.clear();
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.CACHE_KEY);
    }
  }

  // Get cache statistics
  getStats(): { size: number; sizeMB: number } {
    let totalSize = 0;
    this.cache.forEach((base64) => {
      // Rough estimation: base64 is ~33% larger than binary
      totalSize += base64.length * 0.75;
    });

    return {
      size: this.cache.size,
      sizeMB: Math.round((totalSize / (1024 * 1024)) * 100) / 100,
    };
  }
}

// Export singleton instance
export const offlineTileCache = OfflineTileCache.getInstance();

// Hook for using offline cache in React components
export function useOfflineCache() {
  const [isOnline, setIsOnline] = React.useState(false);
  const [cacheStats, setCacheStats] = React.useState({ size: 0, sizeMB: 0 });

  React.useEffect(() => {
    // Initialize cache on client-side mount
    offlineTileCache.initialize();

    // Set initial online status and cache stats
    setIsOnline(navigator.onLine);
    setCacheStats(offlineTileCache.getStats());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const updateStats = React.useCallback(() => {
    setCacheStats(offlineTileCache.getStats());
  }, []);

  return {
    isOnline,
    cacheStats,
    updateStats,
    clearCache: offlineTileCache.clearCache.bind(offlineTileCache),
    preCacheTiles: offlineTileCache.preCacheTiles.bind(offlineTileCache),
  };
}
