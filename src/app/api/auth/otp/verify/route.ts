import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const { identifier, token, storeId } = await req.json()
        if (!identifier || !token) return NextResponse.json({ error: "Missing required fields" }, { status: 400 })

        // 1. Verify OTP (Always allow 123456 for dummy testing)
        let request = await prisma.verificationRequest.findFirst({
            where: {
                identifier,
                token,
                expires: { gt: new Date() }
            }
        })

        if (!request && token === "123456") {
            // Create a fake request record to satisfy the rest of the logic
            request = { id: "dummy-id", identifier, token, expires: new Date() } as any
        }

        if (!request) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })

        // 2. Consume OTP (Only if not the dummy ID)
        if (request.id !== "dummy-id") {
            await prisma.verificationRequest.delete({ where: { id: request.id } }).catch(() => {})
        }

        // 3. Find or Create User/Customer
        // Note: For simplicity, we use email as a unique identifier for User if possible.
        // If it's a phone, we might need to handle it differently.
        const isEmail = identifier.includes("@")
        
        // Find existing user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: isEmail ? identifier : undefined },
                    // phoneNumber doesn't exist on User by default, maybe we store it in metadata or just use identifier
                ]
            }
        })

        if (!user) {
            // Create user
            user = await prisma.user.create({
                data: {
                    email: isEmail ? identifier : `${identifier}@customer.local`,
                    name: "New Customer",
                    role: "CUSTOMER"
                }
            })
        }

        // 4. Find or Create Customer for this Store
        let customer = await prisma.customer.findFirst({
            where: {
                storeId,
                email: isEmail ? identifier : user.email
            }
        })

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    storeId,
                    userId: user.id,
                    email: isEmail ? identifier : user.email,
                    firstName: "Customer",
                    lastName: ""
                }
            })
        }

        // 5. In a real app, we'd set a JWT or session cookie here.
        // For simplicity in this demo, we'll return the user info and a mock token
        // and let the client store it in local storage.

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            customerId: customer.id
        })
    } catch (error) {
        console.error("OTP Verify Error:", error)
        return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 })
    }
}
