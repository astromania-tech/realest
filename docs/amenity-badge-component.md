# AmenityBadge Component Documentation

## Overview

The `AmenityBadge` component is a comprehensive badge system designed specifically for displaying property amenities, utilities, and infrastructure features in the RealEST marketplace. It provides a consistent, visually appealing way to showcase Nigerian property features like NEPA power status, borehole water, security systems, and more.

## Features

- **Comprehensive Coverage**: Supports all major Nigerian property amenities and utilities
- **Type-Safe**: Full TypeScript support with strict typing for amenity types and statuses
- **Consistent Design**: Follows RealEST design system with proper color coding and icons
- **Flexible Display**: Multiple sizes, variants, and display options
- **Accessibility**: Proper ARIA labels and keyboard navigation support
- **Tooltips**: Optional hover tooltips with detailed information
- **Compound Components**: Group components for displaying multiple amenities

## Installation

The component is already integrated into the RealEST component library. Import from:

```typescript
import {
  AmenityBadge,
  AmenityBadgeGroup,
  createAmenityBadges,
  // Preset components
  PowerBadge,
  WaterBadge,
  SecurityBadge,
  // ... etc
} from "@/components/realest/badges";
```

## Basic Usage

### Simple Amenity Badge

```tsx
import { AmenityBadge } from "@/components/realest/badges";

function PropertyCard() {
  return (
    <div>
      <AmenityBadge
        type="power"
        status="stable"
        size="sm"
      />
      {/* Displays: ⚡ Stable NEPA */}
    </div>
  );
}
```

### Using Preset Components

```tsx
import {
  PowerBadge,
  WaterBadge,
  SecurityBadge,
  InternetBadge
} from "@/components/realest/badges";

function PropertyFeatures() {
  return (
    <div className="flex gap-2">
      <PowerBadge status="stable" />
      <WaterBadge status="borehole" />
      <SecurityBadge status="gated_community" />
      <InternetBadge status="fiber" />
    </div>
  );
}
```

## Amenity Types

The component supports the following amenity categories:

### Power & Electricity
```typescript
type PowerAmenity = "power" | "generator" | "inverter" | "solar";
```

**Available Statuses:**
- `stable` - Stable NEPA power
- `intermittent` - Intermittent power supply
- `poor` - Poor power quality
- `none` - No power supply
- `generator_only` - Generator-only power
- `available` - Feature available

### Water & Plumbing
```typescript
type WaterAmenity = "water" | "water_tank" | "water_treatment";
```

**Available Statuses:**
- `borehole` - Borehole water
- `public_water` - Public water supply
- `well` - Well water
- `water_vendor` - Water vendor service
- `available` - Water feature available

### Security & Safety
```typescript
type SecurityAmenity = "security";
```

**Available Statuses:**
- `gated_community` - Gated community
- `security_post` - Security post
- `cctv` - CCTV surveillance
- `perimeter_fence` - Perimeter fencing
- `security_dogs` - Security dogs
- `estate_security` - Estate security
- `24/7` - 24/7 security
- `day_only` - Daytime security
- `night_only` - Nighttime security

### Internet & Connectivity
```typescript
type InternetAmenity = "internet";
```

**Available Statuses:**
- `fiber` - Fiber optic internet
- `starlink` - Starlink satellite
- `4g` - 4G mobile internet
- `3g` - 3G mobile internet

### Boys Quarters
```typescript
type BQAmenity = "boys_quarters";
```

**Available Statuses:**
- `self_contained` - Self-contained BQ
- `room_and_parlor` - Room and parlor BQ
- `single_room` - Single room BQ
- `multiple_rooms` - Multiple rooms BQ
- `excellent` - Excellent condition BQ
- `good` - Good condition BQ
- `fair` - Fair condition BQ
- `needs_renovation` - BQ needs renovation

### Parking & Outdoor
```typescript
type ParkingAmenity = "parking";
```

**Available Statuses:**
- `available` - Parking available (with numeric value for spaces)

### Indoor Amenities
```typescript
type IndoorAmenity = "pool" | "gym" | "kitchen";
```

**Available Statuses:**
- `available` - Amenity available
- `built_in` - Built-in kitchen
- `separate` - Separate kitchen

### Building & Construction
```typescript
type BuildingAmenity = "building";
```

**Available Statuses:**
- `concrete` - Concrete construction
- `brick` - Brick construction
- `wood` - Wood construction
- `steel` - Steel construction
- `glass` - Glass construction

### Road & Accessibility
```typescript
type RoadAmenity = "road";
```

**Available Statuses:**
- `paved` - Paved road
- `tarred` - Tarred road
- `untarred` - Untarred road
- `bad` - Bad road condition
- `all_year` - All year access
- `dry_season_only` - Dry season only
- `limited` - Limited access

## Component Props

### AmenityBadge Props

```typescript
interface AmenityBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: AmenityType;
  status: AmenityStatus;
  value?: string | number; // For numeric values like parking spaces
  showIcon?: boolean; // Default: true
  showTooltip?: boolean; // Default: true
  customLabel?: string;
  size?: "sm" | "md" | "lg"; // Default: "md"
  variant?: "default" | "outline" | "solid" | "ghost"; // Default: "default"
  className?: string;
}
```

### AmenityBadgeGroup Props

```typescript
interface AmenityBadgeGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  amenities: Array<{
    type: AmenityType;
    status: AmenityStatus;
    value?: string | number;
    showIcon?: boolean;
    customLabel?: string;
  }>;
  showTooltip?: boolean; // Default: true
  maxDisplay?: number; // Default: 5 - Shows "+X more" if exceeded
  className?: string;
}
```

## Advanced Usage

### Displaying Multiple Amenities

```tsx
import { AmenityBadgeGroup } from "@/components/realest/badges";

function PropertyAmenities({ property }) {
  const amenities = [
    { type: "power", status: "stable" },
    { type: "water", status: "borehole" },
    { type: "security", status: "gated_community" },
    { type: "internet", status: "fiber" },
    { type: "parking", status: "available", value: 2 },
    { type: "pool", status: "available" },
  ];

  return (
    <AmenityBadgeGroup
      amenities={amenities}
      maxDisplay={4}
      showTooltip={true}
    />
  );
}
```

### Converting Property Data to Badges

```tsx
import { createAmenityBadges, AmenityBadgeGroup } from "@/components/realest/badges";

function PropertyCard({ property }) {
  // Automatically convert property data to amenity badges
  const amenities = createAmenityBadges(property);

  return (
    <div className="property-card">
      <h3>{property.title}</h3>
      <AmenityBadgeGroup
        amenities={amenities}
        maxDisplay={6}
        className="mt-2"
      />
    </div>
  );
}
```

### Custom Styling and Variants

```tsx
<AmenityBadge
  type="power"
  status="stable"
  variant="outline"
  size="lg"
  className="custom-class"
/>

<AmenityBadge
  type="parking"
  status="available"
  value={3}
  variant="solid"
  showIcon={false}
/>
```

## Integration with Property Data

The `createAmenityBadges` helper function automatically converts property data from your API to amenity badges:

```typescript
const propertyData = {
  nepa_status: "stable",
  has_generator: true,
  water_source: "borehole",
  internet_type: "fiber",
  security_type: ["gated_community", "cctv"],
  has_bq: true,
  bq_type: "self_contained",
  parking_spaces: 2,
  has_pool: true,
  has_gym: true,
};

const amenities = createAmenityBadges(propertyData);
// Returns formatted amenity objects ready for AmenityBadgeGroup
```

## Accessibility

The component includes comprehensive accessibility features:

- **ARIA Labels**: Each badge has descriptive aria-labels
- **Keyboard Navigation**: Full keyboard support for interactive elements
- **Screen Reader Support**: Proper semantic markup
- **Color Contrast**: All colors meet WCAG 2.1 AA standards
- **Focus Management**: Clear focus indicators

## Design System Integration

### Color Coding
- **Power**: Blue variants (⚡)
- **Water**: Cyan variants (💧)
- **Security**: Green variants (🛡️)
- **Internet**: Purple variants (📡)
- **Boys Quarters**: Orange variants (🏠)
- **Parking**: Gray variants (🚗)
- **Pool/Gym**: Blue/Red variants (🏊‍♂️/🏋️‍♂️)
- **Building**: Stone variants (🏗️)
- **Road**: Amber variants (🛣️)

### Typography
- Uses RealEST font system (font-medium for labels)
- Responsive text sizing (xs, sm, md, lg)
- Proper line heights and spacing

### Spacing
- Consistent padding and margins
- Flexible gap system for groups
- Responsive spacing adjustments

## Performance Considerations

- **Lazy Loading**: Icons are imported individually to reduce bundle size
- **Memoization**: Consider using React.memo for frequently re-rendering lists
- **Tooltip Optimization**: Tooltips only render on hover to improve performance
- **Bundle Splitting**: Component can be dynamically imported if needed

## Browser Support

- **Modern Browsers**: Full support for all features
- **CSS Grid/Flexbox**: Required for layout features
- **CSS Custom Properties**: Uses CSS variables for theming
- **ES6+ Features**: Arrow functions, destructuring, etc.

## Troubleshooting

### Common Issues

1. **Icons not displaying**: Ensure Lucide React is properly installed
2. **TypeScript errors**: Check that AmenityType and AmenityStatus are correctly imported
3. **Styling issues**: Verify Tailwind CSS classes are available
4. **Tooltip positioning**: Ensure parent containers have proper positioning context

### Debug Mode

Enable debug mode by adding `data-debug="true"` attribute:

```tsx
<AmenityBadge
  type="power"
  status="stable"
  data-debug="true"
/>
```

## Examples in RealEST

### Property Card Integration

```tsx
// In FeaturedProperties.tsx
<div className="property-card">
  <div className="image-section">
    {/* Property image */}
  </div>
  
  <div className="content-section">
    <h3>{property.title}</h3>
    <p>{property.price}</p>
    
    {/* Amenity badges */}
    <AmenityBadgeGroup
      amenities={createAmenityBadges(property)}
      maxDisplay={4}
      className="mt-3"
    />
  </div>
</div>
```

### Search Results

```tsx
// In search results
{properties.map(property => (
  <div key={property.id} className="search-result">
    <div className="property-info">
      <h4>{property.title}</h4>
      <AmenityBadgeGroup
        amenities={createAmenityBadges(property)}
        maxDisplay={3}
        size="sm"
      />
    </div>
  </div>
))}
```

### Property Details Page

```tsx
// In PropertyDetails.tsx
<section className="amenities-section">
  <h3>Amenities & Features</h3>
  <AmenityBadgeGroup
    amenities={createAmenityBadges(property)}
    maxDisplay={10}
    showTooltip={true}
  />
</section>
```

## Migration Guide

### From InfrastructureIndicators

If migrating from the older `InfrastructureIndicators` component:

```tsx
// Old way
<InfrastructureIndicator type="power" status="stable" />

// New way
<AmenityBadge type="power" status="stable" />
```

### From Generic Badges

```tsx
// Old way
<Badge variant="secondary">Stable Power</Badge>

// New way
<PowerBadge status="stable" />
```

## Contributing

When adding new amenity types:

1. Add the type to `AmenityType` union
2. Add corresponding statuses to `AmenityStatus` union
3. Add icon import from Lucide React
4. Add type mapping in `typeIcons`
5. Add color scheme in `amenityBadgeVariants`
6. Add status label logic in `getStatusLabel`
7. Update `createAmenityBadges` helper if needed
8. Add documentation and examples

---

This component provides a complete solution for displaying property amenities in the RealEST marketplace, ensuring consistency, accessibility, and a great user experience across all property listings and detail pages.
