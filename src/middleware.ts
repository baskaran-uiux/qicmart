import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export const config = {
    matcher: [
        "/((?!api/|_next/|_static/|uploads/|favicon.ico).*)",
    ],
}

export async function middleware(req: NextRequest) {
    const url = req.nextUrl.clone()
    const hostname = req.headers.get("host") || ""
    const pathname = url.pathname

    // DEBUG LOG
    // console.log(`[MIDDLEWARE] Host: ${hostname}, Path: ${pathname}`)

    // 1. Skip if it's an API, Static, or _Next route or already in /s/
    if (
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/_static") ||
        pathname.startsWith("/uploads") ||
        pathname.startsWith("/favicon.ico") ||
        pathname.startsWith("/public") ||
        pathname.startsWith("/s/")
    ) {
        return NextResponse.next();
    }

    // 2. Ignore main domain and reserved subdomains (skip rewrites)
    if (
        hostname === "qicmart.com" ||
        hostname === "localhost:3000" ||
        hostname.startsWith("www.")
    ) {
        // Handle auth protection for dashboard/admin on main domain
        if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
            const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
            
            if (!token) {
                console.log(`[MIDDLEWARE] No token for ${pathname}, redirecting to /login`)
                url.pathname = "/login"
                return NextResponse.redirect(url)
            }

            const userRole = (token as any).role
            
            // 1. Super Admin ONLY for /admin
            if (pathname.startsWith("/admin")) {
                if (userRole !== "SUPER_ADMIN") {
                    console.log(`[MIDDLEWARE] Role ${userRole} denied for /admin`)
                    url.pathname = "/"
                    return NextResponse.redirect(url)
                }
            }

            // 2. Admin or Super Admin for /dashboard
            if (pathname.startsWith("/dashboard")) {
                if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN" && userRole !== "STORE_OWNER") {
                    console.log(`[MIDDLEWARE] Role ${userRole} denied for /dashboard`)
                    url.pathname = "/"
                    return NextResponse.redirect(url)
                }
            }
        }
        return NextResponse.next();
    }

    // 3. Multi-tenant Subdomain Logic
    // Only attempt rewrite if it LOOKS like a subdomain (contains .localhost:3000 or .qicmart.com)
    let slug = "";
    if (hostname.includes(".localhost:3000")) {
        slug = hostname.replace(".localhost:3000", "");
    } else if (hostname.includes(".qicmart.com")) {
        slug = hostname.replace(".qicmart.com", "");
    }

    if (slug && slug !== "www") {
        console.log(`[MIDDLEWARE] Rewriting ${hostname}${pathname} -> /s/${slug}${pathname}`)
        url.pathname = `/s/${slug}${pathname}`;
        return NextResponse.rewrite(url);
    }

    return NextResponse.next()
}
