import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { firstName, lastName, gender, phone, address, area, landmark, city, state, pincode, storeId, 
            emailNotif, smsNotif, orderUpdates } = await req.json()
        
        const userId = (session.user as any).id

        const fullName = `${firstName} ${lastName}`.trim()
        
        // 1. Update User Record (Global)
        await prisma.user.update({
            where: { id: userId },
            data: {
                name: fullName,
                phone: phone,
                address: address, // Main address field
                gender: gender,
                emailNotif,
                smsNotif,
                orderUpdates,
            }
        })

        // 2. Update/Create Customer Record (Store Specific)
        if (storeId) {
            const userEmail = session?.user?.email || ""
            const existing = await prisma.customer.findFirst({ 
                where: { userId, storeId } 
            })
            
            if (existing) {
                await prisma.customer.update({
                    where: { id: existing.id },
                    data: { firstName, lastName, gender, phone, address, area, landmark, city, state, pincode }
                })
            } else {
                await prisma.customer.create({
                    data: { 
                        userId, 
                        storeId, 
                        email: userEmail, 
                        firstName, 
                        lastName, 
                        phone, 
                        address, 
                        area, 
                        landmark, 
                        city, 
                        state, 
                        pincode,
                        gender
                    }
                })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Profile Update Error:", error)
        return NextResponse.json({ error: "Failed to update profile", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        let storeId = searchParams.get("storeId")

        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const userId = (session.user as any).id
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                address: true,
                image: true,
                gender: true,
                emailNotif: true,
                smsNotif: true,
                orderUpdates: true,
            }
        })

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        let customerData: any = {}

        // Check if Customer record exists for this store
        if (storeId) {
            // Check if Customer record exists for this store (by userId OR email)
            let customer = await prisma.customer.findFirst({
                where: {
                    storeId: storeId,
                    OR: [
                        { userId: user.id },
                        { email: user.email }
                    ]
                }
            })

            if (customer && !customer.userId) {
                // Auto-link guest customer record to this user
                customer = await prisma.customer.update({
                    where: { id: customer.id },
                    data: { userId: user.id }
                })
            }

            if (!customer) {
                // Auto-create customer record if it doesn't exist
                const nameParts = user.name?.split(" ") || ["", ""]
                customer = await prisma.customer.create({
                    data: {
                        userId: user.id,
                        storeId: storeId as string,
                        email: user.email!,
                        firstName: nameParts[0] || "Customer",
                        lastName: nameParts.slice(1).join(" "),
                        phone: user.phone,
                        address: user.address,
                    }
                })
            }
            customerData = customer
        }

        // Extract first and last name from name
        const userNameParts = user.name?.split(" ") || ["", ""]
        const userFirstName = userNameParts[0] || ""
        const userLastName = userNameParts.slice(1).join(" ") || ""

        return NextResponse.json({
            id: user.id,
            firstName: customerData.firstName || userFirstName || "Customer",
            lastName: customerData.lastName || userLastName,
            email: user.email,
            phone: customerData.phone || user.phone,
            address: customerData.address || user.address,
            area: customerData.area,
            landmark: customerData.landmark,
            city: customerData.city,
            state: customerData.state,
            pincode: customerData.pincode,
            gender: customerData.gender || user.gender,
            image: user.image,
            emailNotif: user.emailNotif,
            smsNotif: user.smsNotif,
            orderUpdates: user.orderUpdates,
        })
    } catch (error) {
        console.error("Profile GET Error:", error)
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }
}
