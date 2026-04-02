import nodemailer from "nodemailer"
import { prisma } from "./prisma"

/**
 * Shared Email utility to handle store notifications
 */
export async function sendOrderConfirmationEmail(orderId: string) {
    try {
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

        if (!order || !order.customer || !order.store) {
            console.error(`[EMAIL_ERROR] Order ${orderId} or related data not found.`)
            return false
        }

        // Configure Transporter (Reuse Gmail SMTP)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        })

        const currencySymbol = order.store.currency === "INR" ? "₹" : order.store.currency === "USD" ? "$" : order.store.currency
        const subtotal = order.total - order.shippingCost
        
        // Build HTML Template
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
            <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border: 1px solid #f0f0f0; border-radius: 24px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <h1 style="font-size: 24px; font-weight: 900; color: #18181b; text-transform: uppercase; letter-spacing: -0.025em; margin: 0; font-style: italic;">${order.store.name}</h1>
                    <p style="font-size: 11px; font-weight: 800; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 8px;">Order Received</p>
                </div>

                <div style="margin-bottom: 32px;">
                    <p style="font-size: 14px; color: #52525b; margin: 0;">Hello <strong>${order.customer.firstName}</strong>,</p>
                    <p style="font-size: 14px; color: #52525b; line-height: 1.6; margin: 12px 0 0 0;">
                        Thank you for your order! We've received your request and are getting it ready for shipment. Your order number is <strong>#ORD-${order.id.substring(0, 8).toUpperCase()}</strong>.
                    </p>
                </div>

                <div style="background-color: #f8fafc; border-radius: 20px; padding: 24px; border: 1px solid #f1f5f9; margin-bottom: 32px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        ${itemsHtml}
                    </table>

                    <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 13px; color: #64748b;">Subtotal</span>
                            <span style="font-size: 13px; font-weight: 600; color: #1e293b;">${currencySymbol}${subtotal.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                            <span style="font-size: 13px; color: #64748b;">Shipping</span>
                            <span style="font-size: 13px; font-weight: 600; color: #1e293b;">${currencySymbol}${order.shippingCost.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                            <span style="font-size: 16px; font-weight: 900; color: #1e293b;">TOTAL</span>
                            <span style="font-size: 20px; font-weight: 900; color: #3b82f6;">${currencySymbol}${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div style="text-align: center; border-top: 1px solid #f0f0f0; padding-top: 32px;">
                    <p style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">If you have any questions, reply to this email or visit our store.</p>
                    <p style="font-size: 14px; font-weight: 800; color: #1e293b;">Thanks for shopping with us!</p>
                </div>
            </div>
        `

        // Send Email
        await transporter.sendMail({
            from: `"${order.store.name}" <${process.env.GMAIL_USER}>`,
            to: order.customer.email,
            subject: `Order Confirmation #ORD-${order.id.substring(0, 8).toUpperCase()}`,
            html: emailHtml
        })

        return true
    } catch (error: any) {
        console.error("[EMAIL_CONFIRMATION_FAILED]", error)
        return false
    }
}

/**
 * Alert Admin about new orders
 */
export async function sendAdminOrderAlert(orderId: string) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                customer: true,
                store: {
                    include: {
                        owner: true
                    }
                }
            }
        })

        if (!order || !order.store?.owner) {
            console.error(`[ADMIN_ALERT_ERROR] Order ${orderId} or owner data not found.`)
            return false
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        })

        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #1a1a1a;">New Order Received! 🎉</h2>
                <p>Hello <strong>${order.store.owner.name || 'Owner'}</strong>,</p>
                <p>You have received a new order on <strong>${order.store.name}</strong>.</p>
                
                <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Order ID:</strong> #ORD-${order.id.substring(0, 8).toUpperCase()}</p>
                    <p style="margin: 5px 0;"><strong>Customer:</strong> ${order.customer?.firstName} ${order.customer?.lastName}</p>
                    <p style="margin: 5px 0;"><strong>Amount:</strong> ${order.store.currency} ${order.total.toFixed(2)}</p>
                </div>

                <a href="${process.env.NEXTAUTH_URL}/dashboard/orders" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">View Order Details</a>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated notification from Qicmart.</p>
            </div>
        `

        await transporter.sendMail({
            from: `"Qicmart Alerts" <${process.env.GMAIL_USER}>`,
            to: order.store.owner.email,
            subject: `New Order Alert: #ORD-${order.id.substring(0, 8).toUpperCase()}`,
            html: emailHtml
        })

        return true
    } catch (error: any) {
        console.error("[ADMIN_ALERT_FAILED]", error)
        return false
    }
}
