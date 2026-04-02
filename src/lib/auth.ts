import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import AppleProvider from "next-auth/providers/apple"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        AppleProvider({
            clientId: process.env.APPLE_ID!,
            clientSecret: process.env.APPLE_SECRET!,
        }),
        EmailProvider({
            server: {
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS,
                },
            },
            from: process.env.GMAIL_USER,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                otp: { label: "OTP", type: "text" },
            },
            async authorize(credentials) {
                console.log("Authorize attempt:", credentials?.email)
                if (!credentials?.email) {
                    throw new Error("Email is required")
                }

                const sanitizedEmail = credentials.email.trim().toLowerCase()
                
                // 1. Find User
                let user = await prisma.user.findUnique({
                    where: { email: sanitizedEmail }
                })

                // 2. Verify Password if provided
                if (credentials.password) {
                    if (!user) {
                        throw new Error("User not found")
                    }
                    if (!user.password) {
                        throw new Error("This account does not have a password set. Try another method.")
                    }
                    const isCorrectPassword = await bcrypt.compare(credentials.password, user.password)
                    if (!isCorrectPassword) {
                        throw new Error("Invalid password")
                    }
                } 
                // 3. Verify OTP if provided (and no password)
                else if (credentials.otp) {
                    // --- TEST MODE BYPASS ---
                    const isTestUser = sanitizedEmail === "venlo@gmail.com" && credentials.otp === "dummy"
                    
                    if (!isTestUser) {
                        const verificationToken = await prisma.verificationToken.findFirst({
                            where: { 
                                identifier: sanitizedEmail,
                                expires: { gte: new Date() }
                            },
                            orderBy: { expires: 'desc' }
                        })

                        if (!verificationToken) {
                            throw new Error("OTP expired or not found. Please request a new one.")
                        }

                        const isCorrectOtp = await bcrypt.compare(credentials.otp, verificationToken.token)
                        if (!isCorrectOtp) {
                            throw new Error("Invalid OTP code")
                        }

                        // RESTRICTION: SUPER_ADMIN cannot login via OTP (Storefront)
                        if (user && user.role === "SUPER_ADMIN") {
                            throw new Error("Platform administrators cannot login via OTP. Please use the Admin Portal.")
                        }

                        // Clean up token
                        await prisma.verificationToken.deleteMany({
                            where: { identifier: sanitizedEmail }
                        })

                        // Auto-create user if not found for OTP (Shopper Auto-Registration)
                        if (!user) {
                            user = await prisma.user.create({
                                data: {
                                    email: sanitizedEmail,
                                    name: sanitizedEmail.split('@')[0],
                                    role: "CUSTOMER"
                                }
                            })
                        }
                    } else {
                        // Dummy test user handling
                        if (!user) {
                            user = await prisma.user.create({
                                data: {
                                    email: sanitizedEmail,
                                    name: "Test User",
                                    role: "CUSTOMER"
                                }
                            })
                        }
                    }
                } else {
                    throw new Error("Password or OTP is required")
                }

                console.log("Authorize Success - Returning user:", user.id, user.email, user.role)
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    address: (user as any).address,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account, profile, isNewUser }) {
            console.log("JWT Callback - User present:", !!user)
            if (user) {
                token.id = user.id
                token.role = (user as any).role
                token.address = (user as any).address
            }
            return token
        },
        async session({ session, token }) {
            console.log("Session Callback - Token present:", !!token)
            if (token && session.user) {
                ; (session.user as any).id = token.id
                    ; (session.user as any).role = token.role
                    ; (session.user as any).address = token.address
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            console.log("Redirect Callback - url:", url, "baseUrl:", baseUrl)
            // Priority: If the URL is absolute and on the same origin, use it.
            if (url.startsWith("http")) {
                try {
                    const urlObj = new URL(url)
                    if (urlObj.origin === baseUrl) {
                        return url
                    }
                } catch (e) {
                    console.error("Redirect URL error:", e)
                }
            }

            // Fallback for relative URLs
            if (url.startsWith("/")) {
                return `${baseUrl}${url}`
            }
            
            return baseUrl
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
}
