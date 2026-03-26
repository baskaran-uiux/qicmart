"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateAdminProfile(userId: string, data: { name?: string, email?: string }) {
    try {
        if (!userId) throw new Error("User ID is required")

        await prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
            }
        })

        revalidatePath("/admin/profile")
        return { success: true }
    } catch (error) {
        console.error("Failed to update admin profile:", error)
        return { success: false, error: "Failed to update profile" }
    }
}
