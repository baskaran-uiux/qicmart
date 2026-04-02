import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { 
            slug, userId, formData, items, paymentMethod, total, 
            upiUTR, upiProofImage, shippingCost, carrier 
        } = body

        console.log(`[Checkout] Processing order for store: ${slug}, Total: ${total}`)

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "No items in cart" }, { status: 400 })
        }

        if (!total || isNaN(parseFloat(total))) {
            return NextResponse.json({ error: "Invalid total amount" }, { status: 400 })
        }

        // 1. Find the store
        const store = await prisma.store.findUnique({
            where: { slug: slug }
        })
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        // 2. Create or Update Customer & User Profile
        let customer = await prisma.customer.findFirst({
            where: { 
                storeId: store.id,
                email: {
                    equals: formData.email,
                    mode: 'insensitive'
                }
            }
        })

        const customerData = {
            storeId: store.id,
            userId: userId || undefined,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || undefined,
            address: formData.address,
            area: formData.apartment || undefined,
            city: formData.city,
            state: formData.state,
            pincode: formData.zip,
        }

        if (!customer) {
            customer = await prisma.customer.create({
                data: customerData
            })
        } else {
            // Update existing customer with latest details
            customer = await prisma.customer.update({
                where: { id: customer.id },
                data: {
                    ...customerData,
                    userId: userId || customer.userId // Preserve existing link or update
                }
            })
        }

        // 2.1 Update Global User Profile (if logged in)
        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    name: `${formData.firstName} ${formData.lastName}`.trim(),
                    phone: formData.phone || undefined,
                    address: formData.address,
                    area: formData.apartment || undefined,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.zip,
                }
            }).catch(err => console.error("[Checkout] Failed to update user profile:", err))
        }

        const tempOrderNumber = Math.random().toString(36).substring(7).toUpperCase()

        // 2.5 Validate all products exist
        for (const item of items) {
            const product = await prisma.product.findUnique({
                where: { id: item.productId }
            })
            if (!product) {
                console.error(`[Checkout] Product not found: ${item.productId}`)
                return NextResponse.json({ error: `Product not found: ${item.productId}. It may have been removed.` }, { status: 400 })
            }
        }

        console.log("[Checkout] Start Order Creation Process", {
            storeId: store.id,
            customerId: customer.id,
            total,
            itemsCount: items?.length,
            items: items?.map((i: any) => ({ pid: i.productId, qty: i.quantity, price: i.price }))
        })

        // 3. Create Order
        const order = await prisma.order.create({
            data: {
                storeId: store.id,
                customerId: customer.id,
                total: parseFloat(total),
                status: "PENDING",
                shippingCost: parseFloat(shippingCost || 0),
                carrier: carrier || null,
                shippingAddress: JSON.stringify(formData),
                items: {
                    create: items.map((item: any) => ({
                        productId: item.productId,
                        quantity: parseInt(item.quantity),
                        price: parseFloat(item.price),
                        options: item.options ? JSON.stringify(item.options) : null
                    }))
                }
            }
        })

        console.log("[Checkout] Order created successfully:", order.id)

        // 3.5. Reduce Stock for each product
        for (const item of items) {
            try {
                await prisma.product.update({
                    where: { id: item.productId },
                    data: {
                        stock: {
                            decrement: parseInt(item.quantity)
                        }
                    }
                })
            } catch (stockError) {
                console.error(`[Checkout] Failed to reduce stock for product ${item.productId}:`, stockError)
                // Continue with checkout even if stock update fails for one item (optional design choice)
            }
        }

        // 4. Create Payment Record
        await prisma.payment.create({
            data: {
                storeId: store.id,
                orderId: order.id,
                amount: parseFloat(total),
                currency: store.currency,
                status: paymentMethod === "COD" || paymentMethod === "UPI" ? "PENDING" : "COMPLETED",
                provider: paymentMethod === "COD" ? "OFFLINE" : paymentMethod === "UPI" ? "UPI" : "STRIPE",
                transactionId: paymentMethod === "COD" ? `COD-${order.id.substring(0, 8)}` : paymentMethod === "UPI" ? `UPI-${order.id.substring(0, 8)}` : `SIM-${order.id.substring(0, 8)}`,
                upiUTR: paymentMethod === "UPI" ? upiUTR : null,
                upiProofImage: paymentMethod === "UPI" ? upiProofImage : null
            }
        })

        // 5. Update Analytics
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        await prisma.analytics.upsert({
            where: {
                storeId_date: {
                    storeId: store.id,
                    date: today
                }
            },
            update: {
                revenue: { increment: parseFloat(total) },
                orders: { increment: 1 }
            },
            create: {
                storeId: store.id,
                date: today,
                revenue: parseFloat(total),
                orders: 1,
                pageViews: 0,
                visitors: 0
            }
        })

        // 6. Automated Notifications
        try {
            let themeConfig: Record<string, any> = {}
            try { if (store.themeConfig) themeConfig = JSON.parse(store.themeConfig) } catch { }

            const { sendOrderConfirmationEmail, sendAdminOrderAlert } = await import("@/lib/email")
            
            // Notification flags (default to true)
            const isEmailEnabled = themeConfig.isEmailNotificationEnabled !== false
            const isAdminEnabled = themeConfig.isAdminAlertEnabled !== false

            // Send to Customer
            if (isEmailEnabled) {
                await sendOrderConfirmationEmail(order.id)
            }
            
            // Send to Admin
            if (isAdminEnabled) {
                await sendAdminOrderAlert(order.id)
            }
        } catch (emailError) {
            console.error("[CHECKOUT_EMAIL_ERROR] Failed to send automated notifications", emailError)
        }

        return NextResponse.json({ ok: true, orderNumber: order.id.substring(0, 8), id: order.id })
    } catch (error: any) {
        console.error("Checkout Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
