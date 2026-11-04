/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    '169.254.207.104'
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: process.cwd(),
  },
  env: {
    NEXT_PUBLIC_APP_MODE: process.env.NEXT_PUBLIC_APP_MODE || 'full-site',
    NEXT_PUBLIC_RELEASE_DATE: process.env.NEXT_PUBLIC_RELEASE_DATE,
  },
  async redirects() {
    return [
      // ── Property paths: emails use /properties/:id, app uses /property/:id ──
      { source: '/properties/:id', destination: '/property/:id', permanent: false },
      { source: '/properties', destination: '/search', permanent: false },

      // ── Owner section: emails use /owner/properties/*, app uses /owner/listings/* ──
      { source: '/owner/properties/:id/documents', destination: '/owner/listings/:id/documents', permanent: false },
      { source: '/owner/properties/:id/renew',     destination: '/owner/listings/:id', permanent: false },
      { source: '/owner/properties/:id/appeal',    destination: '/owner/listings/:id', permanent: false },
      { source: '/owner/properties/:id',           destination: '/owner/listings/:id', permanent: false },
      { source: '/owner/properties',               destination: '/owner/listings', permanent: false },
      // Invoice detail not yet built — fall back to billing overview
      { source: '/owner/billing/:invoiceNumber',   destination: '/owner/billing', permanent: false },

      // ── Settings: emails use /settings/*, app uses /setting/* (no 's') ──
      { source: '/settings/:path*', destination: '/setting/:path*', permanent: false },

      // ── Admin vetting path alias ──
      { source: '/admin/vetting/tasks/:id', destination: '/admin/validation/vetting/:id', permanent: false },

      // ── Misc marketing/support routes ──
      { source: '/support',       destination: '/help',              permanent: false },
      { source: '/list',          destination: '/owner/list-property', permanent: false },
      { source: '/status',        destination: '/realest-status',    permanent: false },
      { source: '/join',          destination: '/register',          permanent: false },
      { source: '/unsubscribe',   destination: '/profile/notifications', permanent: false },

      // ── Sub-admin setup password (email links to /admin/setup-password) ──
      { source: '/admin/setup-password', destination: '/setup-password', permanent: false },
    ];
  },
}

export default nextConfig
