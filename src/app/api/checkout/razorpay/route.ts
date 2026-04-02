import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import Razorpay from "razorpay"

export async function POST(req: NextRequest) {
    try {
        const { amount, currency, storeId } = await req.json()

        if (!amount || !currency || !storeId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // 1. Fetch Store Razorpay Settings
        const store = await prisma.store.findUnique({
            where: { id: storeId }
        })

        if (!store || !store.razorpayKeyId || !store.razorpayKeySecret) {
            return NextResponse.json({ error: "Razorpay not configured for this store" }, { status: 400 })
        }

        // 2. Initialize Razorpay
        const razorpay = new Razorpay({
            key_id: store.razorpayKeyId,
            key_secret: store.razorpayKeySecret,
        })

        // 3. Create Razorpay Order
        const options = {
            amount: Math.round(amount * 100), // Razorpay expects amount in paise
            currency: currency || "INR",
            receipt: `rcpt_${Math.random().toString(36).substring(7)}`,
        }

        const order = await razorpay.orders.create(options)

        return NextResponse.json({ 
            id: order.id, 
            amount: order.amount, 
            currency: order.currency,
            key: store.razorpayKeyId // Send public key to frontend
        })
    } catch (error: any) {
        console.error("[RAZORPAY_ORDER_ERROR]", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
