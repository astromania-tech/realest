Based on my comprehensive analysis of your RealEST codebase, I now understand the sophisticated architecture, design system, and Nigerian market focus. Let me propose a detailed integration plan for the map component that elevates it to world-class status while perfectly aligning with your project's core values and technical foundation.

## **Detailed Map Integration Plan**

### **Phase 1: Foundation & Data Integration (1-2 weeks)**

#### **1.1 Component Architecture Setup**
- **Location**: `components/property/PropertyMap.tsx` (extend existing property folder)
- **Integration**: Replace sample data with Supabase queries using PostGIS
- **Dependencies**: Add `react-leaflet`, `leaflet`, `@types/leaflet` to package.json
- **SSR Handling**: Use dynamic imports with proper Leaflet CSS loading

#### **1.2 Database Integration**
```typescript
// New hook: components/property/hooks/usePropertyMap.ts
interface UsePropertyMapOptions {
  bounds?: LatLngBounds
  filters?: PropertyFilters
  limit?: number
}

export function usePropertyMap({ bounds, filters, limit = 100 }: UsePropertyMapOptions) {
  return useQuery({
    queryKey: ['properties', 'map', bounds, filters],
    queryFn: async () => {
      const supabase = createClient()
      
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_details(*),
          property_media(*),
          owners(business_name, phone, verified),
          profiles(full_name)
        `)
        .eq('status', 'active')
        .eq('verification_status', 'verified')
        .limit(limit)

      // PostGIS geospatial filtering
      if (bounds) {
        query = query
          .gte('latitude', bounds.getSouth())
          .lte('latitude', bounds.getNorth())
          .gte('longitude', bounds.getWest())
          .lte('longitude', bounds.getEast())
      }

      // Nigerian market filters
      if (filters?.nepa_status) {
        query = query.eq('property_details.nepa_status', filters.nepa_status)
      }
      if (filters?.has_bq) {
        query = query.eq('property_details.has_bq', true)
      }
      if (filters?.state) {
        query = query.eq('state', filters.state)
      }

      const { data, error } = await query
      return { data, error }
    }
  })
}
```

#### **1.3 Nigerian Location Data Integration**
- **State/LGA Boundaries**: Load GeoJSON from `lib/constants/nigerian-locations.ts`
- **Neighborhood Data**: Integrate Lagos neighborhoods for precise filtering
- **Infrastructure Overlay**: Add NEPA coverage zones, water sources, internet providers

### **Phase 2: Advanced Features & UX (2-3 weeks)**

#### **2.1 Marker Clustering & Performance**
- **Implementation**: Use `react-leaflet-markercluster` for performance
- **Clustering Logic**: Group by property type, price range, and verification status
- **Custom Cluster Icons**: Show count + dominant property type icon

#### **2.2 Geospatial Search Features**
- **Draw-to-Search**: Leaflet draw plugin for polygon/area selection
- **Radius Search**: Click-to-search with configurable radius (1-50km)
- **Address Autocomplete**: Google Places API with Nigerian bias
- **LGA/State Filtering**: Dropdown integration with Nigerian administrative divisions

#### **2.3 Real-Time Updates**
- **Supabase Realtime**: Subscribe to property changes within map bounds
- **Live Markers**: Update verification status, prices, availability instantly
- **Notification Integration**: Alert users to new properties in saved areas

#### **2.4 Nigerian Market Enhancements**
- **Infrastructure Indicators**: Overlay NEPA stability, borehole locations, fiber optic coverage
- **Security Layers**: Show gated communities, security posts, CCTV coverage
- **Cultural Features**: Highlight properties with BQ, extended family suitability
- **Price Context**: Show market averages, negotiation indicators

### **Phase 3: Advanced Visualizations & Analytics (1-2 weeks)**

#### **3.1 Heatmaps & Data Visualization**
- **Property Density**: Heatmap showing listing concentration
- **Price Heatmaps**: Color-coded by price ranges
- **Demand Heatmaps**: Based on inquiry frequency and saved properties

#### **3.2 Route Planning & Directions**
- **Google Maps Integration**: Walking/driving directions to properties
- **Traffic Awareness**: Real-time traffic data for Nigerian roads
- **Multi-Modal**: Walking, driving, public transport options

#### **3.3 Advanced Filtering UI**
- **Collapsible Filter Panel**: State/LGA, price, property type, infrastructure
- **Saved Searches**: Store map views with filters for logged-in users
- **Filter Presets**: "Family-friendly", "Power-stable", "Gated-communities"

### **Phase 4: Mobile Optimization & Accessibility (1 week)**

#### **4.1 Mobile-First Enhancements**
- **Touch Interactions**: Optimized for Nigerian mobile networks
- **Offline Mode**: Cache map tiles for poor connectivity areas
- **Progressive Loading**: Load markers based on zoom level and user location

#### **4.2 Accessibility Compliance**
- **Keyboard Navigation**: Full keyboard support for map interactions
- **Screen Reader**: Descriptive labels for markers and controls
- **High Contrast**: Support for accessibility preferences

### **Phase 5: Analytics & Monetization (1 week)**

#### **5.1 Usage Analytics**
- **Map Interaction Tracking**: Popular search areas, filter usage
- **Conversion Funnel**: Map views → property details → inquiries
- **Performance Metrics**: Load times, user engagement

#### **5.2 Premium Features**
- **Enhanced Markers**: Larger icons for premium listings
- **Advanced Filters**: More granular filtering for paid users
- **Export Functionality**: Download property lists from map selections

## **Technical Implementation Details**

### **Component Structure**
```
components/property/
├── PropertyMap.tsx              # Main map component
├── PropertyMapMarker.tsx        # Individual property marker
├── PropertyMapPopup.tsx         # Property details popup
├── PropertyMapFilters.tsx       # Filter controls
├── PropertyMapLegend.tsx        # Map legend/key
├── hooks/
│   ├── usePropertyMap.ts        # Data fetching hook
│   └── useMapClustering.ts      # Clustering logic
└── utils/
    ├── mapUtils.ts              # Map utilities
    └── nigerianLocations.ts     # Location helpers
```

### **Styling Integration**
- **Theme Compliance**: Use RealEST OKLCH colors, HeroUI components
- **Typography**: Apply 4-tier system (Lufga for headings, Space Grotesk for body)
- **Infrastructure Colors**: NEPA green, water blue, security orange
- **Responsive Design**: Mobile-first with Nigerian device considerations

### **Database Optimizations**
- **PostGIS Indexes**: Ensure spatial indexes on latitude/longitude
- **Query Optimization**: Use bounding box queries for map bounds
- **Caching Strategy**: Redis for frequently accessed property data

### **Performance Considerations**
- **Lazy Loading**: Load markers only within viewport + buffer
- **Image Optimization**: WebP format with responsive sizing
- **Bundle Splitting**: Separate map code from main application bundle

## **Integration with Existing Systems**

### **App Mode Compatibility**
- **Coming-Soon**: Hide map, show static property previews
- **Demo Mode**: Enable all features with sample data
- **Full-Site**: Full functionality with real data
- **Development**: Debug tools and performance monitoring

### **Authentication Integration**
- **Saved Searches**: Require login to save map views
- **Premium Features**: Role-based access (agents get advanced filters)
- **Contact Actions**: Integrate with inquiry system

### **RealEST Brand Alignment**
- **Color Usage**: 60% Dark Green, 30% Neutral, 10% Acid Green
- **Trust Indicators**: Verification badges on all markers
- **Nigerian Focus**: BQ highlighting, NEPA status, local terminology
- **Professional Tone**: Clean UI, clear CTAs, reassuring messaging

## **Success Metrics & Testing**

### **Key Metrics**
- **User Engagement**: Time spent on map, properties viewed
- **Conversion Rate**: Map interactions leading to inquiries
- **Performance**: Load times, marker rendering speed
- **Mobile Usage**: Usage patterns on Nigerian networks

### **Testing Strategy**
- **Unit Tests**: Component logic, data fetching, filtering
- **Integration Tests**: Supabase queries, PostGIS operations
- **E2E Tests**: Full user journeys, mobile responsiveness
- **Performance Tests**: Load testing with 1000+ properties

## **Timeline & Milestones**

**Week 1-2**: Foundation setup, basic integration
**Week 3-5**: Advanced features, Nigerian market enhancements  
**Week 6-7**: Visualizations, mobile optimization
**Week 8**: Analytics, final testing, deployment

This plan transforms your basic map script into a world-class, Nigerian-market-specific mapping solution that leverages your existing PostGIS infrastructure, design system, and cultural understanding. The result will be a powerful tool that addresses real Nigerian property search needs while maintaining RealEST's professional, trustworthy brand identity.
