# Environment Configuration Guide

## Overview

This guide covers the proper configuration of environment variables and security settings for the RealEST marketplace project.

## Environment Variables

### Required Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: For MCP Supabase integration (development only)
SUPABASE_PROJECT_REF=your_project_reference_id

# Vercel Analytics (production)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# Optional: Development flags
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
```

### Environment-Specific Files

- **`.env.local`** - Local development (not committed)
- **`.env.example`** - Template with dummy values (committed)
- **`.env.production`** - Production values (deployed via CI/CD, not committed)

## Supabase Configuration

### Project Setup

1. **Create Supabase Project**
   ```bash
   npx supabase init
   npx supabase start
   ```

2. **Get Project Credentials**
   - Navigate to your Supabase project dashboard
   - Go to Settings → API
   - Copy the Project URL and API keys

3. **Configure Local Environment**
   ```bash
   # Copy example file
   cp .env.example .env.local
   
   # Edit with your actual values
   nano .env.local
   ```

### Security Best Practices

#### ❌ **Never Do This (Security Risk)**
```json
// .zed/settings.json - WRONG
"supabase": {
  "command": "npx",
  "args": ["-y", "mcp-remote", "https://mcp.supabase.com/mcp?project_ref=hardcoded_project_id"],
  "source": "custom"
}
```

#### ✅ **Correct Approach**
```json
// .zed/settings.json - CORRECT
"supabase": {
  "command": "npx",
  "args": ["-y", "mcp-remote", "https://mcp.supabase.com/mcp"],
  "source": "custom",
  "env": {
    "SUPABASE_PROJECT_REF": "${SUPABASE_PROJECT_REF}"
  }
}
```

## Zed IDE Configuration

### Secure MCP Server Setup

1. **Update Zed Settings**
   ```json
   {
     "context_servers": {
       "supabase": {
         "command": "npx",
         "args": ["-y", "mcp-remote", "https://mcp.supabase.com/mcp"],
         "source": "custom",
         "env": {
           "SUPABASE_PROJECT_REF": "${SUPABASE_PROJECT_REF}"
         }
       }
     }
   }
   ```

2. **Set Environment Variable**
   ```bash
   # Add to your shell profile (.bashrc, .zshrc, etc.)
   export SUPABASE_PROJECT_REF="your_project_reference_id"
   
   # Or use direnv for per-project environment
   echo "export SUPABASE_PROJECT_REF=your_project_reference_id" > .envrc
   direnv allow
   ```

## Development Workflow

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone <repository_url>
   cd realest
   ```

2. **Start the app**
   ```bash
   ./start.sh
   ```

   `./start.sh` installs dependencies, validates `.env.local`, and starts Next.js. If required Supabase keys are missing and Docker is available, it starts a local Supabase stack and writes `.env.local` for you.

   Manual equivalent:
   ```bash
   npm ci
   cp .env.example .env.local
   # Edit .env.local with your actual values
   npm run dev
   ```

### Supabase Development

1. **Start Local Supabase**
   ```bash
   npx supabase start
   ```

2. **Generate Types**
   ```bash
   npx supabase gen types typescript --local > lib/supabase/types.ts
   ```

3. **Apply Migrations**
   ```bash
   npx supabase db reset
   ```

## Deployment Configuration

### Vercel Deployment

1. **Set Environment Variables in Vercel Dashboard**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_VERCEL_ANALYTICS_ID`

2. **Deploy**
   ```bash
   npx vercel --prod
   ```

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Security Checklist

### ✅ **Do**
- Store sensitive data in environment variables
- Use `.env.local` for local development
- Set environment variables in deployment platform
- Use service role keys only on server-side
- Regularly rotate API keys
- Use different projects for dev/staging/production

### ❌ **Don't**
- Commit `.env.local` or `.env.production` files
- Hardcode API keys or project references in source code
- Share environment files via email or chat
- Use production credentials in development
- Expose service role keys to client-side code

## Troubleshooting

### Common Issues

1. **Supabase Connection Failed**
   ```bash
   # Check environment variables
   echo $NEXT_PUBLIC_SUPABASE_URL
   echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
   
   # Verify project status
   npx supabase status
   ```

2. **MCP Server Not Loading**
   ```bash
   # Check project reference
   echo $SUPABASE_PROJECT_REF
   
   # Restart Zed IDE
   # Verify network connectivity to mcp.supabase.com
   ```

3. **Type Generation Failed**
   ```bash
   # Ensure local Supabase is running
   npx supabase start
   
   # Regenerate types
   npx supabase gen types typescript --local > lib/supabase/types.ts
   ```

### Getting Help

- Check Supabase documentation: https://supabase.com/docs
- Review Zed IDE MCP documentation: https://zed.dev/docs/extensions/mcp
- Create issue in project repository for project-specific problems

## Example Files

### `.env.example`
```env
# Supabase Configuration (replace with your values)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development only (for MCP integration)
SUPABASE_PROJECT_REF=your_project_reference_id

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id

# Environment
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development
```

### `.gitignore` Additions
```gitignore
# Environment variables
.env.local
.env.production
.env*.local

# Supabase
.supabase/
supabase/.env
```

---

**Remember**: Security is paramount when handling environment variables. Always follow the principle of least privilege and never expose sensitive credentials in client-side code or version control.