import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: NextRequest) {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderId 
        } = await req.json()

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // 1. Fetch Order and Store Settings
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { store: true }
        })

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        const { razorpayKeySecret } = order.store

        if (!razorpayKeySecret) {
            return NextResponse.json({ error: "Razorpay not configured for this store" }, { status: 400 })
        }

        // 2. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id
        const expectedSignature = crypto
            .createHmac("sha256", razorpayKeySecret)
            .update(body.toString())
            .digest("hex")

        const isAuthentic = expectedSignature === razorpay_signature

        if (!isAuthentic) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
        }

        // 3. Update Order and Create Payment Record
        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { 
                    status: "CONFIRMED",
                    updatedAt: new Date()
                }
            }),
            prisma.orderActivity.create({
                data: {
                    orderId: orderId,
                    status: "CONFIRMED",
                    comment: `Payment successful via Razorpay. Ref: ${razorpay_payment_id}`
                }
            }),
            prisma.payment.create({
                data: {
                    orderId: orderId,
                    storeId: order.storeId,
                    amount: order.total,
                    currency: order.store.currency,
                    status: "COMPLETED",
                    provider: "RAZORPAY",
                    transactionId: razorpay_payment_id
                }
            })
        ])

        // 4. Automated Notifications
        try {
            const { sendOrderConfirmationEmail, sendAdminOrderAlert } = await import("@/lib/email")
            // Send to Customer
            await sendOrderConfirmationEmail(orderId)
            // Send to Admin
            await sendAdminOrderAlert(orderId)
        } catch (emailError) {
            console.error("[RAZORPAY_EMAIL_ERROR] Failed to send automated notifications", emailError)
        }

        return NextResponse.json({ success: true, message: "Payment verified successfully" })
    } catch (error: any) {
        console.error("[RAZORPAY_VERIFY_ERROR]", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
