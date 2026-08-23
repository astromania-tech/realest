import { getAuthUser } from "@/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getAppMode,
  isRouteAccessible,
  shouldEnableAuthentication,
} from "@/lib/appMode";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const authorization = request.headers.get('authorization')
  const isBearerAuth = typeof authorization === 'string' && authorization.startsWith('Bearer ')
  const appMode = getAppMode();

  // Check if route is accessible in current app mode
  if (!isRouteAccessible(pathname)) {
    // Allow bearer-authenticated API requests to pass through during coming-soon
    if (appMode === 'coming-soon' && isBearerAuth && pathname.startsWith('/api/')) {
      // proceed — authorized API consumers (e.g. admin token) may access APIs
    } else if (appMode === 'coming-soon') {
      const url = request.nextUrl.clone();
      url.pathname = '/not-found';
      return NextResponse.rewrite(url);
    } else {
      // For other modes, redirect to home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  // Skip authentication for coming-soon mode unless explicitly enabled
  if (!shouldEnableAuthentication() && appMode === "coming-soon") {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await getAuthUser();

  // Guest-only routes: redirect confirmed + authenticated users to dashboard
  const guestOnlyRoutes = ["/login", "/register", "/forgot-password"];
  const isGuestOnlyRoute = guestOnlyRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  if (
    user &&
    user.email_confirmed_at &&
    isGuestOnlyRoute &&
    shouldEnableAuthentication()
  ) {
    const { data: roleData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = roleData?.role ?? "user";
    const url = request.nextUrl.clone();
    switch (role) {
      case "owner":
      case "agent":
        url.pathname = "/onboarding";
        break;
      case "admin":
        url.pathname = "/admin";
        break;
      default:
        url.pathname = "/profile";
    }
    return NextResponse.redirect(url);
  }

  // Protected routes that require authentication
  const protectedRoutes = [
    "/admin",
    "/agent",
    "/owner",
    "/profile",
    "/onboarding",
  ];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Redirect to login if accessing protected routes without auth
  if (
    !user &&
    isProtectedRoute &&
    !pathname.startsWith("/auth") &&
    shouldEnableAuthentication()
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Email confirmation guard: authenticated but unconfirmed users must
  // complete email verification before accessing any protected route.
  if (
    user &&
    !user.email_confirmed_at &&
    isProtectedRoute &&
    shouldEnableAuthentication()
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/success";
    if (user.email) url.searchParams.set("email", user.email);
    return NextResponse.redirect(url);
  }

  // Onboarding guard: owner/agent users who haven't completed onboarding
  // must be redirected to /onboarding before accessing any other protected route.
  if (
    user &&
    isProtectedRoute &&
    !pathname.startsWith("/onboarding") &&
    shouldEnableAuthentication()
  ) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = userData?.role;

    if (role === "owner" || role === "agent") {
      const table = role === "owner" ? "owners" : "agents";

      const { data: onboardingRecord } = await supabase
        .from(table)
        .select("id")
        .eq("profile_id", user.id)
        .single();

      if (!onboardingRecord) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
