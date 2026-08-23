/**
 * App Mode Utility Functions
 * Handles branch-specific app mode detection and configuration
 */

export type AppMode = 'coming-soon' | 'full-site' | 'demo' | 'development';

export interface AppModeConfig {
  mode: AppMode;
  releaseDate?: string;
  showDemoPages: boolean;
  showFullSite: boolean;
  enableAuthentication: boolean;
  restrictedRoutes: string[];
}

/**
 * Get the current app mode from environment variables
 */
export function getAppMode(): AppMode {
  const mode = process.env.NEXT_PUBLIC_APP_MODE;

  switch (mode) {
    case 'coming-soon':
      return 'coming-soon';
    case 'demo':
      return 'demo';
    case 'development':
      return 'development';
    case 'full-site':
    default:
      return 'full-site';
  }
}

/**
 * Get the release date from environment variables
 */
export function getReleaseDate(): Date | null {
  const dateStr = process.env.NEXT_PUBLIC_RELEASE_DATE;
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Check if the release date has passed
 */
export function isReleaseDatePassed(): boolean {
  const releaseDate = getReleaseDate();
  if (!releaseDate) return false;

  return new Date() >= releaseDate;
}

/**
 * Get app configuration based on current mode
 */
export function getAppConfig(): AppModeConfig {
  const mode = getAppMode();

  const configs: Record<AppMode, AppModeConfig> = {
    'coming-soon': {
      mode: 'coming-soon',
      releaseDate: process.env.NEXT_PUBLIC_RELEASE_DATE,
      showDemoPages: false,
      showFullSite: false,
      enableAuthentication: false,
      restrictedRoutes: [] // Complete lockdown handled in isRouteAccessible
    },
    'full-site': {
      mode: 'full-site',
      showDemoPages: false,
      showFullSite: true,
      enableAuthentication: true,
      restrictedRoutes: []
    },
    'demo': {
      mode: 'demo',
      showDemoPages: true,
      showFullSite: true,
      enableAuthentication: true,
      restrictedRoutes: []
    },
    'development': {
      mode: 'development',
      showDemoPages: true,
      showFullSite: true,
      enableAuthentication: true,
      restrictedRoutes: []
    }
  };

  return configs[mode];
}

/**
 * Check if a route should be accessible in the current app mode
 */
export function isRouteAccessible(pathname: string): boolean {
  const config = getAppConfig();

  // In coming-soon mode, check if release date has passed
  if (config.mode === 'coming-soon' && isReleaseDatePassed()) {
    return true;
  }

  // In coming-soon mode, implement complete lockdown
  if (config.mode === 'coming-soon') {
    // Only allow specific essential routes
    const allowedRoutes = [
      '/',              // Home page (coming soon)
      '/not-found',     // 404 page
      '/favicon.ico',   // Browser favicon
      '/manifest.json', // PWA manifest
      '/sneak-peek',    // Email link: sneak peek preview
      '/early-access',  // Email link: early access sign-up
      '/refer',         // Email link: referral landing
      '/waitlist',      // Email link: waitlist join page
      '/poll',          // Full poll form page
      '/poll/city',     // Email link: city poll response
    ];
    // Allow /poll/[id] dynamic detail pages
    const isPollDetail = /^\/poll\/[0-9a-f-]{36}$/i.test(pathname);

    // Allow specific API routes for coming-soon functionality
    const allowedApiRoutes = [
      '/api/waitlist',      // Waitlist subscription endpoint
      '/api/poll/city',     // City poll vote endpoint
      '/api/poll/catalog',  // Poll catalog endpoint
      '/api/poll/submit',   // Poll submission endpoint
      '/api/referral/me',  // Referral details endpoint
      '/api/referral/resolve',  // Referral code resolve endpoint
      '/api/referral/invite',  // Referral invitation endpoint
    ];
    // Allow /api/poll/submission/[id] dynamic routes
    const isPollSubmissionApi = /^\/api\/poll\/submission\/[0-9a-f-]{36}$/i.test(pathname);

    // Allow exact matches or static assets
    return allowedRoutes.includes(pathname) ||
           isPollDetail ||
           isPollSubmissionApi ||
           allowedApiRoutes.includes(pathname) || // Essential API routes
           pathname.startsWith('/_next/') ||     // Next.js static assets
           pathname.startsWith('/api/_') ||       // Next.js internal API routes
           !!pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|otf)$/); // Static files
  }

  // For other modes, check restricted routes list
  const isRestricted = config.restrictedRoutes.some(route =>
    pathname.startsWith(route)
  );

  return !isRestricted;
}

/**
 * Check if demo pages should be shown
 */
export function shouldShowDemoPages(): boolean {
  const config = getAppConfig();
  return config.showDemoPages;
}

/**
 * Check if full site should be shown
 */
export function shouldShowFullSite(): boolean {
  const config = getAppConfig();

  // If in coming-soon mode, check if release date has passed
  if (config.mode === 'coming-soon') {
    return isReleaseDatePassed();
  }

  return config.showFullSite;
}

/**
 * Check if authentication should be enabled
 */
export function shouldEnableAuthentication(): boolean {
  const config = getAppConfig();

  // If in coming-soon mode and release date has passed, enable auth
  if (config.mode === 'coming-soon' && isReleaseDatePassed()) {
    return true;
  }

  return config.enableAuthentication;
}

/**
 * Get environment-specific configuration for Vercel deployments
 */
export function getVercelBranchConfig() {
  const vercelEnv = process.env.VERCEL_ENV;
  const vercelGitCommitRef = process.env.VERCEL_GIT_COMMIT_REF;

  return {
    environment: vercelEnv, // 'production' | 'preview' | 'development'
    branch: vercelGitCommitRef, // Git branch name
    isProduction: vercelEnv === 'production',
    isPreview: vercelEnv === 'preview',
    isDevelopment: vercelEnv === 'development'
  };
}

/**
 * Get the appropriate app mode based on Vercel branch
 */
export function getAppModeFromBranch(): AppMode {
  const { branch } = getVercelBranchConfig();

  if (!branch) return getAppMode();

  // Branch-specific mode mapping
  if (branch === 'main') return 'coming-soon';
  if (branch === 'staging') return 'full-site';
  if (branch === 'develop') return 'development';

  // Default for feature branches
  return 'development';
}

/**
 * Client-side utility to check if we're in coming soon mode
 */
export function isComingSoonMode(): boolean {
  if (typeof window === 'undefined') {
    // Server-side check
    return getAppMode() === 'coming-soon' && !isReleaseDatePassed();
  }

  // Client-side check
  const mode = getAppMode();
  if (mode !== 'coming-soon') return false;

  const releaseDate = getReleaseDate();
  if (!releaseDate) return true;

  return new Date() < releaseDate;
}

/**
 * Development utilities for testing different modes
 */
/**
 * Check if a route is allowed in coming-soon mode (for testing)
 */
export function isComingSoonRouteAllowed(pathname: string): boolean {
  if (getAppMode() !== 'coming-soon') return true;

  const allowedRoutes = [
    '/',
    '/not-found',
    '/favicon.ico',
  ];

  return allowedRoutes.includes(pathname) ||
         pathname.startsWith('/_next/') ||
         pathname.startsWith('/api/_') ||
         !!pathname.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|otf)$/);
}

/**
 * Development utilities for testing different modes
 */
export const devUtils = {
  /**
   * Force a specific app mode (development only)
   */
  forceAppMode: (mode: AppMode) => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('forceAppMode is only available in development');
      return;
    }

    // Store in localStorage for client-side persistence
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('dev-app-mode', mode);
    }
  },

  /**
   * Clear forced app mode
   */
  clearForcedMode: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('dev-app-mode');
    }
  },

  /**
   * Get forced app mode (development only)
   */
  getForcedMode: (): AppMode | null => {
    if (process.env.NODE_ENV !== 'development') return null;

    if (typeof window !== 'undefined') {
      const forced = window.localStorage.getItem('dev-app-mode');
      return forced as AppMode || null;
    }

    return null;
  }
};
