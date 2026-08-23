#!/usr/bin/env node

/**
 * Route Lockdown Test Utility
 * Tests the coming-soon mode route protection to ensure complete lockdown
 */

const http = require("http");
const { URL } = require("url");

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const VERBOSE = process.env.VERBOSE === "true";

// Test routes - these should be blocked in coming-soon mode
const TEST_ROUTES = [
  // Public routes that should be blocked
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

  // Authentication routes
  "/login",
  "/register",
  "/register-success",

  // Protected dashboard routes
  "/admin",
  "/profile",
  "/owner",
  "/owner/inquiries",
  "/owner/list-property",
  "/onboarding",
  "/onboarding",

  // Demo routes
  "/design-showcase",
  "/design-test",
  "/form-showcase",
  "/phase2-demo",

  // Other routes
  "/search",
  "/realest-status",
  "/property/123",
];

// Routes that should be allowed in coming-soon mode
const ALLOWED_ROUTES = [
  "/", // Home page (coming soon)
  "/not-found", // 404 page
  "/favicon.ico", // Favicon
];

// Colors for console output
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
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const options = {
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

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          url: url,
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

function analyzeResponse(response, route, shouldBeBlocked = true) {
  const { statusCode, body, headers } = response;

  // Check if it's a 404 response (blocked)
  const isNotFound =
    statusCode === 404 ||
    body.includes("Page Not Found") ||
    body.includes("404");

  // Check if it's the coming soon page (home route response)
  const isComingSoon =
    body.includes("Something Amazing") && body.includes("Is Coming Soon");

  // Check if it's an actual page content (not blocked)
  const hasPageContent = !isNotFound && !isComingSoon && statusCode === 200;

  const result = {
    route,
    statusCode,
    isBlocked: isNotFound,
    isComingSoon,
    hasPageContent,
    shouldBeBlocked,
    passed: shouldBeBlocked ? isNotFound : !isNotFound,
    contentType: headers["content-type"] || "unknown",
  };

  if (VERBOSE) {
    console.log(colorize(`\n--- Analysis for ${route} ---`, "cyan"));
    console.log(`Status: ${statusCode}`);
    console.log(`Is Blocked (404): ${isBlocked}`);
    console.log(`Is Coming Soon: ${isComingSoon}`);
    console.log(`Has Page Content: ${hasPageContent}`);
    console.log(`Should Be Blocked: ${shouldBeBlocked}`);
    console.log(`Test Passed: ${result.passed}`);
  }

  return result;
}

async function testRoute(route, shouldBeBlocked = true) {
  try {
    const url = `${BASE_URL}${route}`;
    const response = await makeRequest(url);
    const analysis = analyzeResponse(response, route, shouldBeBlocked);

    // Display result
    const status = analysis.passed
      ? colorize("✓ PASS", "green")
      : colorize("✗ FAIL", "red");
    const expectedBehavior = shouldBeBlocked ? "BLOCKED" : "ALLOWED";
    const actualBehavior = analysis.isBlocked
      ? "BLOCKED"
      : analysis.isComingSoon
        ? "COMING_SOON"
        : analysis.hasPageContent
          ? "ACCESSIBLE"
          : "UNKNOWN";

    console.log(
      `${status} ${route.padEnd(25)} | Expected: ${expectedBehavior.padEnd(10)} | Actual: ${actualBehavior.padEnd(12)} | Status: ${analysis.statusCode}`,
    );

    return analysis;
  } catch (error) {
    console.log(
      colorize(`✗ ERROR ${route.padEnd(24)} | ${error.message}`, "red"),
    );
    return {
      route,
      error: error.message,
      passed: false,
    };
  }
}

async function runTests() {
  console.log(
    colorize("\n🔒 RealProof Marketplace - Route Lockdown Test", "bold"),
  );
  console.log(colorize("=".repeat(55), "blue"));
  console.log(`Testing against: ${colorize(BASE_URL, "cyan")}`);
  console.log(`Mode: Coming Soon Lockdown Test`);
  console.log(colorize("-".repeat(55), "blue"));

  const results = [];

  // Test blocked routes
  console.log(
    colorize("\n📛 Testing Routes That Should Be BLOCKED:", "yellow"),
  );
  console.log(colorize("-".repeat(50), "yellow"));

  for (const route of TEST_ROUTES) {
    const result = await testRoute(route, true);
    results.push(result);
    await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to avoid overwhelming server
  }

  // Test allowed routes
  console.log(colorize("\n✅ Testing Routes That Should Be ALLOWED:", "green"));
  console.log(colorize("-".repeat(50), "green"));

  for (const route of ALLOWED_ROUTES) {
    const result = await testRoute(route, false);
    results.push(result);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Summary
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

// Handle command line arguments
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(colorize("Route Lockdown Test Utility", "bold"));
  console.log("\nUsage:");
  console.log("  node scripts/test-route-lockdown.js [options]");
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

// Run the tests
runTests().catch((error) => {
  console.error(colorize(`\n💥 Test runner error: ${error.message}`, "red"));
  process.exit(1);
});
