import { prisma } from "../src/lib/prisma"

/**
 * Helper to seed activities for demo/testing
 */
export async function seedActivities(customerId: string) {
    const activities = [
        {
            type: "ADD_WISHLIST",
            description: "Fresh Eggs, Packs",
            metadata: JSON.stringify({ variant: null }),
            createdAt: new Date("2025-06-06T11:00:00Z")
        },
        {
            type: "ADD_WISHLIST",
            description: "28",
            metadata: JSON.stringify({ variant: null }),
            createdAt: new Date("2025-06-06T11:00:00Z")
        },
        {
            type: "ADD_WISHLIST",
            description: "Paper Boat Swing+ Slurpy Mango Juicier Drink, 250 ml Pet Bottle",
            metadata: JSON.stringify({ variant: null }),
            createdAt: new Date("2025-06-06T11:00:00Z")
        },
        {
            type: "ADD_WISHLIST",
            description: "40",
            metadata: JSON.stringify({ variant: null }),
            createdAt: new Date("2025-06-06T11:00:00Z")
        },
        {
            type: "ADD_WISHLIST",
            description: "Fresh Eggs, Packs",
            metadata: JSON.stringify({ variant: null }),
            createdAt: new Date("2025-06-06T11:00:00Z")
        },
        {
            type: "ADD_TO_CART",
            description: "Makka Popcorn, Jumbo Mushroom Corn Kernels, Healthy, Reusable Bottle.",
            metadata: JSON.stringify({ variant: null }),
            createdAt: new Date("2025-06-06T16:30:00Z")
        },
        {
            type: "ADD_TO_CART",
            description: "Fresh Mango, Alphonso Ratnagiri",
            metadata: JSON.stringify({ variant: "5KG" }),
            createdAt: new Date("2025-06-06T16:41:00Z")
        }
    ]

    for (const activity of activities) {
        await prisma.customerActivity.create({
            data: {
                ...activity,
                customerId
            }
        })
    }
}

async function run() {
    const customer = await prisma.customer.findFirst()
    if (!customer) {
        console.log("No customer found to seed activities.")
        return
    }

    console.log(`Seeding activities for customer: ${customer.firstName} ${customer.lastName}`)
    await seedActivities(customer.id)
    console.log("Seeding complete.")
}

run()
