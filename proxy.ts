// Runs before every page. Two jobs:
// 1. Keeps her login fresh (Supabase login cookies).
// 2. The login gate: logged-out visitors can't open the app pages.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages that need her to be logged in
const PROTECTED = ["/home", "/talk", "/patterns", "/doctor", "/settings"];
// Pages a logged-in woman doesn't need
const AUTH_ONLY = ["/login", "/signup", "/forgot-password"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const startsWithAny = (list: string[]) =>
    list.some((p) => path === p || path.startsWith(p + "/"));

  // Logged out and trying to open an app page: send to Welcome
  if (!user && startsWithAny(PROTECTED)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Already logged in: no need for Sign up / Log in
  if (user && startsWithAny(AUTH_ONLY)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  // Skip static files and images, and the API routes (they check login themselves)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
