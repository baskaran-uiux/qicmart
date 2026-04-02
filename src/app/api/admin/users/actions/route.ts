import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { userId, action, payload } = await req.json()

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { ownedStores: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        switch (action) {
            case "TOGGLE_STATUS":
                const updatedUser = await prisma.user.update({
                    where: { id: userId },
                    data: { isPlatformDisabled: !user.isPlatformDisabled }
                })
                return NextResponse.json({ message: `User access ${updatedUser.isPlatformDisabled ? 'disabled' : 'enabled'}`, user: updatedUser })

            case "UPDATE":
                if (!payload) return NextResponse.json({ error: "Missing update payload" }, { status: 400 })
                
                const { name: newName, email: newEmail, storeName: newStoreName } = payload
                
                await prisma.$transaction(async (tx) => {
                    await tx.user.update({
                        where: { id: userId },
                        data: {
                            name: newName,
                            email: newEmail,
                        }
                    })

                    if (user.ownedStores.length > 0 && newStoreName) {
                        await tx.store.update({
                            where: { id: user.ownedStores[0].id },
                            data: { name: newStoreName }
                        })
                    }
                })
                
                return NextResponse.json({ message: "User and Store updated successfully" })

            case "DELETE":
                // Manual cascade if not fully governed by DB constraints
                await prisma.$transaction([
                    prisma.subscription.deleteMany({
                        where: { store: { ownerId: userId } }
                    }),
                    prisma.store.deleteMany({
                        where: { ownerId: userId }
                    }),
                    prisma.user.delete({
                        where: { id: userId }
                    })
                ])
                return NextResponse.json({ message: "User and associated data deleted successfully" })

            case "RESET_PASSWORD":
                const { newPassword } = payload || {}
                if (!newPassword) return NextResponse.json({ error: "New password is required" }, { status: 400 })

                const hashedPassword = await bcrypt.hash(newPassword, 10)
                await prisma.user.update({
                    where: { id: userId },
                    data: { password: hashedPassword }
                })
                return NextResponse.json({ message: "Password reset successfully" })

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 })
        }

    } catch (error: any) {
        console.error("User Action Error:", error)
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
}
