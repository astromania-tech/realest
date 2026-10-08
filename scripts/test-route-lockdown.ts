#!/usr/bin/env node
/**
 * Route Lockdown Test Utility
 * Tests the coming-soon mode route protection to ensure complete lockdown
 */

import http from "node:http";
import { URL } from "node:url";
import {
  analyzeRouteLockdownResponse,
  type LockdownRouteAnalysis,
} from "../lib/route-lockdown-analysis.ts";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const VERBOSE = process.env.VERBOSE === "true";

const TEST_ROUTES = [
  "/about",
  "/buy",
  "/rent",
  "/sell",
  "/contact",
  "/help",
  "/how-it-works",
  "/safety",
  "/privacy",
  "/verification",
  "/careers",
  "/events",
  "/press",
  "/login",
  "/register",
  "/register-success",
  "/admin",
  "/profile",
  "/owner",
  "/owner/inquiries",
  "/owner/list-property",
  "/onboarding",
  "/design-showcase",
  "/design-test",
  "/form-showcase",
  "/phase2-demo",
  "/search",
  "/realest-status",
  "/property/123",
];

const ALLOWED_ROUTES = ["/", "/not-found", "/favicon.ico"];

const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
} as const;

type ColorName = keyof typeof colors;

type HttpResponse = {
  statusCode: number | undefined;
  headers: http.IncomingHttpHeaders;
  body: string;
  url: string;
};

type RouteAnalysis = LockdownRouteAnalysis & {
  contentType?: string;
  error?: string;
};

function colorize(text: string, color: ColorName): string {
  return `${colors[color]}${text}${colors.reset}`;
}

function makeRequest(url: string): Promise<HttpResponse> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options: http.RequestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      timeout: 10000,
      headers: {
        "User-Agent": "RouteTestBot/1.0",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk: Buffer | string) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url,
        });
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

function analyzeResponse(
  response: HttpResponse,
  route: string,
  shouldBeBlocked = true,
): RouteAnalysis {
  const result: RouteAnalysis = {
    ...analyzeRouteLockdownResponse(
      { statusCode: response.statusCode, body: response.body },
      route,
      shouldBeBlocked,
    ),
    contentType: response.headers["content-type"] || "unknown",
  };

  if (VERBOSE) {
    console.log(colorize(`\n--- Analysis for ${route} ---`, "cyan"));
    console.log(`Status: ${result.statusCode}`);
    console.log(`Is Blocked (404): ${result.isBlocked}`);
    console.log(`Is Coming Soon: ${result.isComingSoon}`);
    console.log(`Has Page Content: ${result.hasPageContent}`);
    console.log(`Should Be Blocked: ${shouldBeBlocked}`);
    console.log(`Actual Behavior: ${result.actualBehavior}`);
    console.log(`Test Passed: ${result.passed}`);
  }

  return result;
}

async function testRoute(
  route: string,
  shouldBeBlocked = true,
): Promise<RouteAnalysis> {
  try {
    const url = `${BASE_URL}${route}`;
    const response = await makeRequest(url);
    const analysis = analyzeResponse(response, route, shouldBeBlocked);

    const status = analysis.passed
      ? colorize("✓ PASS", "green")
      : colorize("✗ FAIL", "red");
    const expectedBehavior = shouldBeBlocked ? "BLOCKED" : "ALLOWED";

    console.log(
      `${status} ${route.padEnd(25)} | Expected: ${expectedBehavior.padEnd(10)} | Actual: ${analysis.actualBehavior.padEnd(12)} | Status: ${analysis.statusCode}`,
    );

    return analysis;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(colorize(`✗ ERROR ${route.padEnd(24)} | ${message}`, "red"));
    return {
      route,
      statusCode: undefined,
      isBlocked: false,
      isComingSoon: false,
      hasPageContent: false,
      shouldBeBlocked,
      actualBehavior: "ERROR",
      error: message,
      passed: false,
    };
  }
}

async function runTests(): Promise<void> {
  console.log(
    colorize("\n🔒 RealProof Marketplace - Route Lockdown Test", "bold"),
  );
  console.log(colorize("=".repeat(55), "blue"));
  console.log(`Testing against: ${colorize(BASE_URL, "cyan")}`);
  console.log(`Mode: Coming Soon Lockdown Test`);
  console.log(colorize("-".repeat(55), "blue"));

  const results: RouteAnalysis[] = [];

  console.log(
    colorize("\n📛 Testing Routes That Should Be BLOCKED:", "yellow"),
  );
  console.log(colorize("-".repeat(50), "yellow"));

  for (const route of TEST_ROUTES) {
    const result = await testRoute(route, true);
    results.push(result);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(colorize("\n✅ Testing Routes That Should Be ALLOWED:", "green"));
  console.log(colorize("-".repeat(50), "green"));

  for (const route of ALLOWED_ROUTES) {
    const result = await testRoute(route, false);
    results.push(result);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = totalTests - passedTests;

  console.log(colorize("\n📊 TEST SUMMARY", "bold"));
  console.log(colorize("=".repeat(30), "blue"));
  console.log(`Total Tests: ${totalTests}`);
  console.log(
    colorize(
      `Passed: ${passedTests}`,
      passedTests === totalTests ? "green" : "yellow",
    ),
  );
  console.log(
    colorize(`Failed: ${failedTests}`, failedTests === 0 ? "green" : "red"),
  );
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (failedTests > 0) {
    console.log(colorize("\n❌ FAILED TESTS:", "red"));
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        const issue = r.error
          ? r.error
          : r.shouldBeBlocked
            ? "Route is accessible but should be blocked"
            : r.route === "/not-found"
              ? "Allowlisted /not-found did not serve the intentional 404 page"
              : "Route is blocked but should be accessible";
        console.log(`   ${r.route}: ${issue}`);
      });
  }

  if (passedTests === totalTests) {
    console.log(
      colorize(
        "\n🎉 ALL TESTS PASSED! Route lockdown is working correctly.",
        "green",
      ),
    );
  } else {
    console.log(
      colorize(
        "\n⚠️  Some tests failed. Please review your middleware configuration.",
        "yellow",
      ),
    );
  }

  console.log(colorize("\n💡 Tips:", "cyan"));
  console.log("   • Make sure NEXT_PUBLIC_APP_MODE=coming-soon is set");
  console.log("   • Verify middleware is properly configured");
  console.log("   • Check that your development server is running");
  console.log("   • Use VERBOSE=true for detailed analysis");

  process.exit(failedTests > 0 ? 1 : 0);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(colorize("Route Lockdown Test Utility", "bold"));
  console.log("\nUsage:");
  console.log("  npx tsx scripts/test-route-lockdown.ts [options]");
  console.log("\nEnvironment Variables:");
  console.log(
    "  TEST_BASE_URL   Base URL to test against (default: http://localhost:3000)",
  );
  console.log("  VERBOSE         Show detailed analysis (default: false)");
  console.log("\nExamples:");
  console.log("  npm run test:lockdown");
  console.log("  VERBOSE=true npm run test:lockdown");
  console.log("  TEST_BASE_URL=https://yourdomain.com npm run test:lockdown");
  process.exit(0);
}

runTests().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(colorize(`\n💥 Test runner error: ${message}`, "red"));
  process.exit(1);
});
