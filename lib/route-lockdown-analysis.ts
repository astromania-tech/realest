/**
 * Classify HTTP responses for the coming-soon route lockdown check.
 *
 * Locked routes must rewrite to the not-found experience (HTTP 404).
 * Allowlisted routes must remain reachable: home (200 coming-soon),
 * /not-found (intentional 404 page), and static assets (200).
 *
 * Do not treat body substrings alone as block signals on HTTP 200 —
 * Next.js HTML/RSC payloads can embed "Page Not Found" / "404" without
 * the response being the lockdown rewrite.
 */

export type LockdownHttpResponse = {
  statusCode: number | undefined;
  body: string;
};

export type LockdownRouteAnalysis = {
  route: string;
  statusCode: number | undefined;
  isBlocked: boolean;
  isComingSoon: boolean;
  hasPageContent: boolean;
  shouldBeBlocked: boolean;
  passed: boolean;
  actualBehavior: string;
};

/** Lockdown rewrite signal: HTTP 404 is authoritative. */
export function isLockdownBlocked(statusCode?: number): boolean {
  return statusCode === 404;
}

/** Distinctive copy from ComingSoonHero — keep legacy markers for older deploys. */
export function isComingSoonHome(body: string, statusCode?: number): boolean {
  if (statusCode !== undefined && statusCode !== 200) return false;
  return (
    body.includes("Nigeria's Most Trusted") ||
    body.includes("Get Ready for Launch") ||
    body.includes("Join Waitlist") ||
    body.includes("Get Notified at Launch") ||
    body.includes("Launch date coming soon") ||
    (body.includes("Something Amazing") && body.includes("Is Coming Soon"))
  );
}

function actualBehaviorFor(
  analysis: Pick<
    LockdownRouteAnalysis,
    "isBlocked" | "isComingSoon" | "hasPageContent"
  > & { route: string; shouldBeBlocked: boolean; statusCode?: number },
): string {
  if (!analysis.shouldBeBlocked && analysis.route === "/not-found") {
    return analysis.isBlocked ? "NOT_FOUND_OK" : "BROKEN";
  }
  if (analysis.isBlocked) return "BLOCKED";
  if (analysis.isComingSoon) return "COMING_SOON";
  if (analysis.hasPageContent) return "ACCESSIBLE";
  if (analysis.statusCode === 200) return "ACCESSIBLE";
  return "UNKNOWN";
}

export function analyzeRouteLockdownResponse(
  response: LockdownHttpResponse,
  route: string,
  shouldBeBlocked = true,
): LockdownRouteAnalysis {
  const { statusCode, body } = response;

  const isBlocked = isLockdownBlocked(statusCode);
  const isComingSoon = isComingSoonHome(body, statusCode);
  const hasPageContent =
    statusCode === 200 && !isBlocked && !isComingSoon;

  let passed: boolean;
  if (shouldBeBlocked) {
    passed = statusCode === 404;
  } else if (route === "/not-found") {
    // Allowlisted: intentional not-found page must work (404 + copy).
    passed = statusCode === 404 && body.includes("Page Not Found");
  } else if (route === "/favicon.ico") {
    passed = statusCode === 200;
  } else {
    // Home and other allowlisted pages: HTTP 200 means reachable.
    // Body may still mention "Page Not Found" via RSC/module preload — ignore that.
    passed = statusCode === 200;
  }

  const result: LockdownRouteAnalysis = {
    route,
    statusCode,
    isBlocked,
    isComingSoon,
    hasPageContent,
    shouldBeBlocked,
    passed,
    actualBehavior: "",
  };
  result.actualBehavior = actualBehaviorFor(result);
  return result;
}
