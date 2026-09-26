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

- Git
- Node.js 20.x or later (fnm or nvm is enough if `node` is not on PATH)
- npm (comes with Node)
- Docker, for the local database on a first clone

### Clone

```bash
git clone https://github.com/astromania-tech/realest.git
cd realest
```

### Installation

From the repo root, one command installs dependencies, checks env, and boots Next.js:

```bash
./start.sh
```

That script:

1. Finds Node 20+ (fnm or nvm if your shell has no `node` yet)
2. Runs `npm ci` when `node_modules` is missing
3. Uses `.env.local` if the required Supabase keys are set
4. If those keys are missing and Docker is installed, starts local Supabase and writes `.env.local`
5. Starts the app at [http://localhost:3000](http://localhost:3000), or the next free port if 3000 is already taken by another process

Required keys (homepage will not load without them):

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

To skip Docker and point the app at a hosted project (read/write that project's data):

```bash
cp .env.example .env.local
# paste keys from Supabase > Project Settings > API
./start.sh --no-local-supabase
```

Manual equivalent after clone:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`supabase/` is already in the repo. Do not run `supabase init`. Do not paste numbered files from `scripts/001_*.sql` into the dashboard; those files are not in this project. Schema lives in `supabase/migrations/`.

### Local database vs production

Local Docker and production are **two databases**. They share schema only when git says so. They never share rows.

| | Your laptop | Production (`realest.ng`) |
|---|---|---|
| Database | Docker via `./start.sh` / `npx supabase start` | Hosted project |
| Data | Empty or whatever you inserted locally | Waitlist and live data. Never `db reset` |
| Schema | Files in `supabase/migrations/` applied on start/reset | Same version IDs already recorded in `schema_migrations` |

A developer change does **not** appear on production because the app is running locally. Production captures a schema change only through git. Follow **Adding a schema migration** below.

Do not run `npx supabase db push` against production from a laptop unless that pending file is already reviewed and you intend to change the live schema.

### Adding a schema migration

Put new SQL in `supabase/migrations/` only. Local Docker and production both apply those files. The filename **is** the version id.

#### Naming

```
supabase/migrations/YYYYMMDDHHMMSS_snake_case_what_changed.sql
```

| Part | Rule |
|---|---|
| `YYYYMMDDHHMMSS` | Exactly 14 digits (UTC date + time). This prefix is the version stored in `schema_migrations`. It must be unique in the folder. |
| `_` | One underscore after the digits |
| `snake_case_what_changed` | Lowercase letters, digits, and underscores. Name the change. No spaces, hyphens, or capitals. |
| `.sql` | Required |

Good names in this repo:

- `20260601000000_property_validation_jobs_queue.sql`
- `20260502000002_waitlist_persona_rewards.sql`

Bad names (do not add these):

- `001_create_profiles.sql` (old numbered scripts; not how this project ships schema)
- `add_listing_expiry.sql` (missing the 14-digit prefix)
- `20260917143000-Add-Listing-Expiry.sql` (hyphens and capitals)

Do not put new SQL under `scripts/`. Do not run `supabase init`. Do not edit a migration file that already exists on `main` or on production. Add a new file instead.

#### Procedure

1. From the repo root, let the CLI stamp a unique time:

```bash
npx supabase migration new add_listing_expiry
```

That creates an empty file such as `supabase/migrations/20260917143000_add_listing_expiry.sql`. Keep the 14-digit prefix. You may tighten the snake_case tail before you commit.

2. Write the SQL in that file only. One concern per file.

3. Apply it on **local Docker only**, then confirm the app:

```bash
npx supabase db reset
```

`./start.sh` also applies pending files when it boots local Supabase. Open [http://localhost:3000](http://localhost:3000). Never `db reset` production.

4. Commit on a feature branch. PR into `develop`, then `staging`, then `main`.

5. GitHub's **Supabase Preview** check (required on `main`) compares those files to production `schema_migrations` and applies **only versions production does not already have**. Vercel deploys the app code. The hosted API URL already points at production Postgres.

If you already ran SQL in the production SQL Editor, add a git file whose name starts with the **same 14-digit version** production recorded. A new timestamp for SQL that already ran will try to apply it a second time. Editor-only SQL with no matching file is what made the last `main` deploy fail (`Remote migration versions not found in local migrations directory`).

### Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

### Local validation smoke (admin ML pipeline)

After local Supabase and the app are running, engineers can exercise the same admin validation path used in production (document → image → duplicate jobs). This is a **manual smoke**, not a CI gate.

1. Ensure local Supabase is up (`npx supabase start` or `./start.sh`).
2. Put admin login credentials in `.env.local` (Auth user that will be promoted to admin):

```env
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=your-local-password
```

3. Bootstrap local Auth + Storage (safe: both scripts refuse non-local Supabase URLs):

```bash
npm run create:local-admin
npm run ensure:local-buckets
```

4. Start the app on port 3000, then:

```bash
npm run test:validation
```

Expect document/image/duplicate jobs to enqueue and complete. Synthetic fixtures may be **rejected**; a green smoke means the pipeline finished, not that junk inputs were accepted.

Coming-soon route lockdown (app must be in coming-soon mode):

```bash
npm run dev:coming-soon
# other terminal
npm run test:lockdown
```

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
├── scripts/              # Launchers, tests, and tooling
├── supabase/migrations/  # Schema. Local Docker and production both use these files
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
node scripts/generate-api-spec.ts
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
