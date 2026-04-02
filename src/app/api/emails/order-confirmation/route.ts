import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

export async function POST(req: NextRequest) {
    try {
        const { orderId } = await req.json()

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
        }

        // 1. Fetch Order with Items and Customer
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: true,
                store: true,
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!order || !order.customer) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // 2. Configure Transporter (Reuse Gmail SMTP)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        })

        const currencySymbol = order.store.currency === "INR" ? "₹" : order.store.currency === "USD" ? "$" : order.store.currency
        const subtotal = order.total - order.shippingCost
        
        // 3. Build HTML Template
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
                    <p style="margin: 0; font-size: 14px; font-weight: 700; color: #18181b;">${item.product.name}</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #71717a;">Qty: ${item.quantity} × ${currencySymbol}${item.price.toFixed(2)}</p>
                </td>
                <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 700; color: #18181b;">
                    ${currencySymbol}${(item.quantity * item.price).toFixed(2)}
                </td>
            </tr>
        `).join('')

        const emailHtml = `
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="font-size: 24px; font-weight: 900; color: #18181b; text-transform: uppercase; letter-spacing: -0.025em; margin: 0; font-style: italic;">${order.store.name}</h1>
                    <p style="font-size: 12px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Order Receipt</p>
                </div>

                <div style="margin-bottom: 32px;">
                    <p style="font-size: 14px; color: #52525b; margin: 0;">Hello <strong>${order.customer.firstName}</strong>,</p>
                    <p style="font-size: 14px; color: #52525b; line-height: 1.6; margin: 12px 0 0 0;">
                        Thank you for your order! We've received your request and are getting it ready for shipment. Here are your order details:
                    </p>
                </div>

                <div style="background-color: #f8fafc; border-radius: 24px; padding: 32px; border: 1px solid #f1f5f9; margin-bottom: 32px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px;">
                        <div>
                            <p style="font-[10px] font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Order Number</p>
                            <p style="font-size: 16px; font-weight: 900; color: #1e293b; margin: 0;">#ORD-${order.id.substring(0, 8).toUpperCase()}</p>
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse;">
                        ${itemsHtml}
                    </table>

                    <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 14px; color: #64748b;">Subtotal</span>
                            <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${currencySymbol}${subtotal.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                            <span style="font-size: 14px; color: #64748b;">Shipping</span>
                            <span style="font-size: 14px; font-weight: 600; color: #1e293b;">${currencySymbol}${order.shippingCost.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                            <span style="font-size: 18px; font-weight: 900; color: #1e293b; text-transform: uppercase;">Total</span>
                            <span style="font-size: 24px; font-weight: 900; color: #3b82f6;">${currencySymbol}${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; border-top: 1px solid #f0f0f0; padding-top: 32px;">
                    <p style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">If you have any questions, reply to this email or visit our store.</p>
                    <p style="font-size: 14px; font-weight: 800; color: #1e293b;">Thanks for shopping with us!</p>
                </div>
            </div>
        `

        // 4. Send Email
        await transporter.sendMail({
            from: `"${order.store.name}" <${process.env.GMAIL_USER}>`,
            to: order.customer.email,
            subject: `Order Confirmation #ORD-${order.id.substring(0, 8).toUpperCase()}`,
            html: emailHtml
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("[EMAIL_ORDER_CONFIRMATION_ERROR]", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
