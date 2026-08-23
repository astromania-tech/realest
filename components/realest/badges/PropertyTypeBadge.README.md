realest\components\realest\badges\PropertyTypeBadge.README.md
# PropertyTypeBadge Component

A comprehensive badge component for displaying property types in the RealEST marketplace, designed specifically for the Nigerian real estate market with full design system integration.

## Overview

The `PropertyTypeBadge` component provides visual categorization for all property types supported by RealEST. It follows the design system's 60-30-10 color architecture and includes Nigerian market-specific property types like "Boys Quarters" and "Face-me-I-face-you".

### Key Features

- **34 Property Types**: Complete coverage of Nigerian real estate categories
- **Design System Integration**: Uses RealEST's OKLCH color palette and typography
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels
- **Responsive**: Adapts to different screen sizes with size variants
- **Interactive**: Optional tooltips and hover states
- **Icon Support**: Semantic icons for each property type
- **Dark Mode**: Automatic theme switching
- **Performance**: Optimized with CVA (class-variance-authority)

## Installation

The component is part of the RealEST design system and is automatically available when importing from the badges module:

```tsx
import {
  PropertyTypeBadge,
  HouseBadge,
  ApartmentBadge,
  DuplexBadge,
  // ... other preset components
} from "@/components/realest/badges";
```

## Basic Usage

### Simple Property Type Badge

```tsx
import { PropertyTypeBadge } from "@/components/realest/badges";

function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <PropertyTypeBadge type={property.property_type} />
      <h3>{property.title}</h3>
      {/* ... other content */}
    </div>
  );
}
```

### Preset Components

For common property types, use the preset components for better performance:

```tsx
import {
  HouseBadge,
  ApartmentBadge,
  LandBadge,
  CommercialBadge,
  DuplexBadge,
  BungalowBadge,
  ResidentialLandBadge,
} from "@/components/realest/badges";

function PropertyGrid() {
  return (
    <div className="grid">
      <div className="card">
        <HouseBadge />
        <span>Detached House</span>
      </div>
      <div className="card">
        <ApartmentBadge />
        <span>Modern Apartment</span>
      </div>
      <div className="card">
        <ResidentialLandBadge />
        <span>Residential Plot</span>
      </div>
    </div>
  );
}
```

## Available Property Types

### Broad Categories (Primary Types)

| Type | Badge | Description |
|------|-------|-------------|
| `house` | 🏠 House | Detached houses, mansions, villas |
| `apartment` | 🏢 Apartment | Multi-unit buildings, flats, condominiums |
| `land` | 📍 Land | Vacant land parcels for development |
| `commercial` | 🏢 Commercial | Commercial buildings and spaces |
| `event_center` | 📅 Event Center | Event venues, halls, party spaces |
| `hotel` | 🏨 Hotel | Hospitality properties, hotels, resorts |
| `shop` | 🛍️ Shop | Retail spaces, stores, boutiques |
| `office` | 💼 Office | Commercial office buildings |

### Nigerian Residential Subtypes

| Type | Badge | Description |
|------|-------|-------------|
| `duplex` | 🏠 Duplex | 2-story residential house |
| `bungalow` | 🏠 Bungalow | Single-story residential house |
| `flat` | 🏢 Flat | Apartment unit in a building |
| `self_contained` | 🏢 Self-Contained | Studio apartment with private facilities |
| `mini_flat` | 🏢 Mini Flat | 1 bedroom apartment with parlor |
| `room_and_parlor` | 🏢 Room & Parlor | 1 bedroom + living room apartment |
| `single_room` | 🏢 Single Room | Room with shared facilities |
| `penthouse` | 🏢 Penthouse | Top-floor luxury apartment |
| `terrace` | 🏠 Terrace | Terrace house, townhouse, row house |
| `detached_house` | 🏠 Detached House | Standalone residential house |

### Commercial & Land Subtypes

| Type | Badge | Description |
|------|-------|-------------|
| `warehouse` | 🏭 Warehouse | Storage and warehousing facilities |
| `showroom` | 🏪 Showroom | Display and showroom spaces |
| `restaurant` | 🍽️ Restaurant | Restaurants, food service establishments |
| `residential_land` | 📍 Residential Land | Land zoned for residential development |
| `commercial_land` | 📍 Commercial Land | Land zoned for commercial/business use |
| `mixed_use_land` | 📍 Mixed Use Land | Land with flexible/mixed zoning |
| `farmland` | 🌾 Farmland | Agricultural land, farm land |

### Additional Nigerian Types

| Type | Badge | Description |
|------|-------|-------------|
| `boys_quarters` | 🏠 Boys Quarters | Separate quarters for domestic staff |
| `face_me_i_face_you` | 🏠 Face Me I Face You | Traditional Nigerian compound housing |
| `mansion` | 🏰 Mansion | Large luxury residential properties |
| `estate_property` | 🏢 Estate Property | Properties within gated estates |
| `individual_house` | 🏠 Individual House | Standalone individual houses |

## Props API

### PropertyTypeBadge Props

```tsx
interface PropertyTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: PropertyType;           // Required: Property type identifier
  size?: "sm" | "md" | "lg";    // Optional: Badge size (default: "md")
  variant?: "default" | "outline" | "solid" | "ghost"; // Optional: Visual variant
  showIcon?: boolean;          // Optional: Show/hide icon (default: true)
  showTooltip?: boolean;       // Optional: Show/hide tooltip (default: true)
  customLabel?: string;        // Optional: Override default label
}
```

### PropertyType Type Definition

```tsx
type PropertyType =
  // Broad categories
  | 'house' | 'apartment' | 'land' | 'commercial'
  | 'event_center' | 'hotel' | 'shop' | 'office'
  // Nigerian residential subtypes
  | 'duplex' | 'bungalow' | 'flat' | 'self_contained'
  | 'mini_flat' | 'room_and_parlor' | 'single_room'
  | 'penthouse' | 'terrace' | 'detached_house'
  // Commercial subtypes
  | 'warehouse' | 'showroom'
  // Event/Hospitality subtypes
  | 'restaurant'
  // Land subtypes
  | 'residential_land' | 'commercial_land'
  | 'mixed_use_land' | 'farmland'
  // Additional Nigerian types
  | 'boys_quarters' | 'face_me_i_face_you'
  | 'mansion' | 'estate_property' | 'individual_house';
```

## Customization Examples

### Size Variants

```tsx
// Small badges for compact layouts
<PropertyTypeBadge type="apartment" size="sm" />

// Medium badges (default)
<PropertyTypeBadge type="house" size="md" />

// Large badges for hero sections
<PropertyTypeBadge type="land" size="lg" />
```

### Visual Variants

```tsx
// Default filled badge
<PropertyTypeBadge type="duplex" variant="default" />

// Outline style
<PropertyTypeBadge type="bungalow" variant="outline" />

// Solid background
<PropertyTypeBadge type="apartment" variant="solid" />

// Ghost style (transparent)
<PropertyTypeBadge type="land" variant="ghost" />
```

### Custom Labels and Icons

```tsx
// Custom label
<PropertyTypeBadge
  type="self_contained"
  customLabel="Studio Apt"
/>

// Hide icon
<PropertyTypeBadge
  type="commercial"
  showIcon={false}
/>

// Hide tooltip
<PropertyTypeBadge
  type="hotel"
  showTooltip={false}
/>
```

## Integration Patterns

### Property Cards

```tsx
function PropertyCard({ property }) {
  return (
    <Card className="relative">
      {/* Property type badge in top-left corner */}
      <div className="absolute top-3 left-3 z-10">
        <PropertyTypeBadge
          type={property.property_type}
          size="sm"
        />
      </div>

      {/* Property status in top-right corner */}
      <div className="absolute top-3 right-3 z-10">
        <PropertyStatusChip status={property.status} size="sm" />
      </div>

      <CardContent className="pt-12">
        <h3 className="font-heading text-lg">{property.title}</h3>
        {/* ... other content */}
      </CardContent>
    </Card>
  );
}
```

### Search Filters

```tsx
function PropertyTypeFilter({ selectedTypes, onTypeChange }) {
  const propertyTypes = [
    { value: 'house', label: 'Houses' },
    { value: 'apartment', label: 'Apartments' },
    { value: 'land', label: 'Land' },
    { value: 'commercial', label: 'Commercial' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {propertyTypes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onTypeChange(value)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
            selectedTypes.includes(value)
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background hover:bg-muted border-border'
          }`}
        >
          <PropertyTypeBadge
            type={value}
            size="sm"
            showTooltip={false}
          />
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
}
```

### Property Listings Table

```tsx
function PropertyTable({ properties }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Title</th>
          <th>Location</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {properties.map(property => (
          <tr key={property.id}>
            <td>
              <PropertyTypeBadge
                type={property.property_type}
                size="sm"
                showTooltip={false}
              />
            </td>
            <td>{property.title}</td>
            <td>{property.location}</td>
            <td>{property.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Design System Alignment

### Color Mapping

The component uses RealEST's semantic color system:

- **Residential Types**: Success colors (green variants)
- **Commercial Types**: Secondary colors (neutral variants)
- **Land Types**: Warning colors (amber variants)
- **Event/Hospitality**: Accent violet colors

### Typography

- **Font**: Body font (Space Grotesk) for consistency
- **Sizes**: Follows the 4px base scale (xs: 12px, sm: 14px, md: 16px, lg: 18px)
- **Weights**: Medium (500) for readability

### Spacing

- **Padding**: 4px base unit (sm: 8px, md: 12px, lg: 16px)
- **Icon Spacing**: 8px gap between icon and text
- **Border Radius**: xl (24px) for modern, approachable feel

### Accessibility

- **WCAG 2.1 AA**: Minimum 4.5:1 contrast ratio
- **ARIA Labels**: Proper labeling for screen readers
- **Focus States**: Visible focus indicators
- **Keyboard Navigation**: Full keyboard support
- **Color Independence**: Works without color cues

## Performance Considerations

### Bundle Size

- **Tree Shaking**: Only imports used property types
- **Icon Optimization**: Lucide React icons are tree-shakeable
- **CVA Optimization**: Class variance authority minimizes CSS generation

### Rendering Performance

```tsx
// ✅ Recommended: Use preset components for common types
<HouseBadge /> // Faster than <PropertyTypeBadge type="house" />

// ✅ Recommended: Disable tooltips in lists
<PropertyTypeBadge type="apartment" showTooltip={false} />

// ✅ Recommended: Memoize in loops
const MemoizedBadge = memo(PropertyTypeBadge);
```

### Memory Usage

- **Icon Caching**: Icons are cached after first render
- **Style Caching**: CVA caches computed styles
- **Tooltip Debouncing**: Hover states are debounced

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { PropertyTypeBadge } from '@/components/realest/badges';

describe('PropertyTypeBadge', () => {
  it('renders house badge correctly', () => {
    render(<PropertyTypeBadge type="house" />);
    expect(screen.getByText('House')).toBeInTheDocument();
  });

  it('shows tooltip on hover', async () => {
    render(<PropertyTypeBadge type="apartment" />);
    const badge = screen.getByRole('status');
    fireEvent.mouseEnter(badge);
    await waitFor(() => {
      expect(screen.getByText('Apartment')).toBeInTheDocument();
    });
  });

  it('is accessible', () => {
    render(<PropertyTypeBadge type="land" />);
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Property type: Land'
    );
  });
});
```

### Visual Regression Tests

```tsx
// Playwright visual test
test('property type badges match design', async ({ page }) => {
  await page.goto('/design-showcase');
  await expect(page.locator('[data-testid="property-type-badges"]'))
    .toHaveScreenshot('property-type-badges.png');
});
```

## Migration Guide

### From Generic Badges

```tsx
// Before
<Badge variant="secondary">House</Badge>

// After
<PropertyTypeBadge type="house" />
```

### From Custom Components

```tsx
// Before
function PropertyTypeIcon({ type }) {
  const icons = { house: '🏠', apartment: '🏢' };
  return <span>{icons[type]}</span>;
}

// After
<PropertyTypeBadge type={type} size="sm" showTooltip={false} />
```

## Troubleshooting

### Common Issues

**Badge not showing correct color:**
- Check if the property type is in the supported list
- Verify theme provider is properly configured

**Tooltip not appearing:**
- Ensure `showTooltip` is not set to `false`
- Check for CSS conflicts with `pointer-events`

**Icon not loading:**
- Verify Lucide React is installed
- Check network connectivity for icon fonts

**Performance issues:**
- Use preset components for common types
- Disable tooltips in large lists
- Implement virtualization for long lists

## Contributing

When adding new property types:

1. Add the type to the `PropertyType` union type
2. Add color mapping in `propertyTypeBadgeVariants`
3. Add icon mapping in `typeIcons`
4. Add label mapping in `typeLabels`
5. Create a preset component if commonly used
6. Update this documentation
7. Add tests for the new type

## Related Components

- **PropertyStatusChip**: For property availability/status
- **AmenityBadge**: For property features and infrastructure
- **VerificationBadge**: For property verification status
- **LocationPin**: For map markers (uses similar type system)

## Changelog

### v1.0.0
- Initial release with 34 property types
- Full design system integration
- Accessibility compliance
- Performance optimizations
- Comprehensive documentation
</file_path>
