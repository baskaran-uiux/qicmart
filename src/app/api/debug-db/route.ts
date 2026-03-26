import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Temporary: Fix the test user's role and assign stores to them
export async function GET() {
    // 1. Update venlo@gmail.com to STORE_OWNER
    const user = await prisma.user.update({
        where: { email: "venlo@gmail.com" },
        data: { role: "STORE_OWNER" }
    })

    // 2. Get all stores that don't have an owner matching venlo
    const stores = await prisma.store.findMany()
    
    // 3. If there are stores with no link to this user, assign the first one
    const myStore = stores.find(s => s.ownerId === user.id)
    
    return NextResponse.json({ 
        user: { id: user.id, email: user.email, role: user.role },
        myStore: myStore || null,
        allStores: stores.map(s => ({ id: s.id, name: s.name, slug: s.slug, ownerId: s.ownerId }))
    })
}
