import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// NEXTAUTH_URL stays as http://localhost:3000 (from .env) always.
// Session cookies are shared cross-subdomain via cookie domain: ".localhost"
// so no need to override NEXTAUTH_URL per-request.
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
