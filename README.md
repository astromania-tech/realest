# RealEST - Vetted & Verified Property Marketplace

Nigeria's premier property marketplace that revolutionizes real estate through geotag verification, ML-powered document validation, and physical vetting. Find Your Next Move with RealEST.

## Features

- **No Duplicates**: Advanced ML algorithms detect and prevent duplicate property listings
- **Verified Listings**: Physical vetting and document validation ensure authenticity
- **Live Location Mapping**: Accurate geolocation for all properties
- **Comprehensive Search**: Advanced filters and map-based search
- **Role-Based Access**: Separate dashboards for property owners, agents, users, and admins
- **Nigerian Market Focus**: Culturally-aware design with local property types and infrastructure
- **Modern Design System**: Built with Next.js 16, Supabase, HeroUI v3, and RealEST design tokens

## Tech Stack

- **Frontend**: Next.js 16, React 19, HeroUI v3 (Primary), UntitledUI (Status), Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Database**: PostgreSQL with PostGIS for geospatial data
- **Design System**: RealEST OKLCH color system, 4-tier typography (Lufga, Neulis Neue, Space Grotesk, JetBrains Mono)
- **Deployment**: Vercel (recommended)
- **Version Control**: Git with Commitlint

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd realest
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Database Setup

#### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Initialize Supabase in your project:
```bash
supabase init
```

3. Start local Supabase:
```bash
supabase start
```

4. Run migrations:
```bash
supabase db push
```

#### Option 2: Manual Setup

If you prefer not to use the CLI, you can run the SQL scripts directly in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the scripts in order:
   - `scripts/001_create_profiles.sql`
   - `scripts/002_create_properties.sql`
   - `scripts/003_create_property_details.sql`
   - `scripts/004_create_property_documents.sql`
   - `scripts/005_create_property_media.sql`
   - `scripts/006_create_inquiries.sql`
   - `scripts/007_create_profile_trigger.sql`

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Zed IDE Integration

This project is optimized for Zed IDE with AI-powered development features:

#### Context-Aware AI Assistant
- **Design System Context**: Comprehensive design system documentation in `docs/zed-context-realest-design-system.md`
- **Project Context**: Automatic context detection via `.zed_context` file
- **MCP Servers**: Integrated HeroUI and Supabase documentation servers

#### Available Tasks (Cmd+Shift+P → "task")
- `dev` - Start development server
- `build` - Build production version
- `lint` - Run ESLint
- `format` - Format code with Prettier
- `type-check` - Run TypeScript validation
- `supabase:start` - Start local Supabase
- `supabase:generate-types` - Generate TypeScript types

#### AI Assistant Features
The Zed AI assistant automatically:
- References RealEST design system guidelines
- Suggests HeroUI v3 component implementations (70% usage)
- Recommends UntitledUI for status components (25% usage)
- Provides Supabase integration patterns
- Maintains Nigerian market cultural sensitivity
- Ensures brand color palette compliance (Dark Green #07402F, Acid Green #ADF434, Deep Neutral #2E322E)
- Applies 4-tier typography system (Display, Heading, Body, Mono)

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
realest/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── property/          # Property detail pages
│   ├── search/            # Search page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # HeroUI components
│   └── ...               # Feature components
├── lib/                  # Utility libraries
│   └── supabase/         # Supabase client and types
├── scripts/              # Database setup scripts
├── docs/                 # Documentation and mockups
└── public/               # Static assets
```

## Database Schema

The application uses the following main tables:

- `profiles`: User profiles with role-based access
- `properties`: Property listings with verification status
- `property_details`: Detailed property information
- `property_documents`: Document storage with ML validation
- `property_media`: Images, videos, and virtual tours
- `inquiries`: Communication between users and owners

## Key Features Implementation

### ML Document Validation
- OCR for text extraction from documents
- Computer vision for authenticity checks
- NLP for content validation

### Physical Vetting Process
- Mobile app for vetting team
- GPS tracking and timestamp verification
- Photo/video evidence collection

### Duplicate Prevention
- Fuzzy matching algorithms
- Image hashing for media comparison
- Geospatial clustering

## Contributing

1. Follow conventional commit messages:
```bash
npm run commit
```

2. Ensure all tests pass:
```bash
npm test
```

3. Reference design system guidelines in `docs/zed-context-realest-design-system.md`

4. Use Zed AI assistant for context-aware development

5. Create a pull request with a clear description

### OpenAPI Generation

When API routes change, regenerate the canonical OpenAPI artifact with:

```bash
node scripts/generate-api-spec.mjs
```

Do not edit `lib/openapi/generated.json` by hand. Always regenerate it from the source routes so the Swagger output stays in sync.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the contribution workflow and API documentation rules.

### Design System Compliance

All contributions must adhere to:
- RealEST design system guidelines (docs/zed-context-realest-design-system.md)
- Component library strategy: HeroUI (70%), UntitledUI (25%), Shadcn (5%)
- OKLCH color system and 60-30-10 color usage rule
- 4-tier typography hierarchy with proper font usage
- Nigerian market cultural considerations
- Accessibility standards (WCAG 2.1 AA)
- Performance optimization guidelines

## License

This project is licensed under the MIT License.

## Design System

RealEST uses a comprehensive design system built on:

### Color System (OKLCH)
- **Primary Dark**: #07402F (60% usage) - Dark Green foundation
- **Primary Neutral**: #2E322E (30% usage) - Deep Neutral secondary  
- **Primary Accent**: #ADF434 (10% usage) - Acid Green primary accent/CTA

### Typography Hierarchy
- **Display**: Lufga - Hero sections and brand moments
- **Heading**: Neulis Neue - Page titles and section headers
- **Body**: Space Grotesk - Content, forms, and descriptions
- **Mono**: JetBrains Mono - Data, coordinates, and technical info

### Component Strategy
- **HeroUI v3**: Primary components (buttons, cards, forms, navigation)
- **UntitledUI**: Status components (badges, chips, alerts, progress)
- **Shadcn/UI**: Complex patterns (data tables, specialized forms)

### Nigerian Market Features
- States and LGAs support
- Boys Quarters (BQ) property type
- Infrastructure indicators (power, water, internet)
- Security features emphasis
- Cultural sensitivity in messaging

For complete design system documentation, see `docs/zed-context-realest-design-system.md`.

## Support

For support, please contact the development team or create an issue in the repository.
