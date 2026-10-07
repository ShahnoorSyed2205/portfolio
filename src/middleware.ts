import { NextRequest, NextResponse } from "next/server";

const LOCALES = ["en", "ar"] as const;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next();
  }

  const saved = req.cookies.get("NEXT_LOCALE")?.value;
  const accept = req.headers.get("accept-language") ?? "";
  const locale =
    saved && (LOCALES as readonly string[]).includes(saved)
      ? saved
      : /(^|,)\s*ar\b/i.test(accept)
        ? "ar"
        : "en";

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|media|brand|.*\\..*).*)"],
};
