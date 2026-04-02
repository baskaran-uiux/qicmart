import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

import { getStoreForDashboard } from "@/lib/dashboard"

// Removed local getStore function and replaced with import

export async function GET(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const ownerId = searchParams.get("ownerId")?.trim()
    
    const dashboardType = searchParams.get("dashboardType") || "1"
    
    let targetUserId = (session.user as any).id
    
    // Allow SUPER_ADMIN to view other stores
    if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
        targetUserId = ownerId
    }

    let store = await getStoreForDashboard(targetUserId, dashboardType)
    
    if (!store) {
        // Fetch user name as fallback
        const user = await prisma.user.findUnique({ where: { id: targetUserId } })
        return NextResponse.json({ 
            hasStore: false,
            name: user?.name || "Admin",
            slug: null,
            message: "No store found for this user"
        })
    }

    // Parse themeConfig for extra settings
    let themeConfig: Record<string, any> = {}
    try { if (store.themeConfig) themeConfig = JSON.parse(store.themeConfig) } catch { }

    return NextResponse.json({
        userImage: (store as any).owner?.image || (session.user as any).image || null,
        hasStore: true,
        id: store.id,
        name: store.name,
        slug: store.slug,
        description: store.description,
        logo: store.logo,
        banner: store.banner,
        currency: store.currency,
        favicon: themeConfig.favicon || null,
        brandCarousel: themeConfig.brandCarousel || [],
        banners: themeConfig.banners || [],
        fontFamily: themeConfig.fontFamily || "Inter",
        fontStyle: themeConfig.fontStyle || "modern",
        menuAlignment: themeConfig.menuAlignment || "left",
        primaryColor: themeConfig.primaryColor || "purple",
        headerStyle: themeConfig.headerStyle || "flat",
        layoutStyle: themeConfig.layoutStyle || "default",
        menuType: themeConfig.menuType || "top",
        menuItems: themeConfig.menuItems || [],
        storeTheme: themeConfig.storeTheme || "modern",
        isAdminPanelDisabled: store.isAdminPanelDisabled,
        // Razorpay settings from themeConfig as fallback if schema fields are not synced
        razorpayKeyId: themeConfig.razorpayKeyId ?? (store as any).razorpayKeyId,
        razorpayKeySecret: (themeConfig.razorpayKeySecret || (store as any).razorpayKeySecret) ? "••••••••••••" : null,
        razorpayWebhookSecret: (themeConfig.razorpayWebhookSecret || (store as any).razorpayWebhookSecret) ? "••••••••••••" : null,
        isRazorpayEnabled: themeConfig.isRazorpayEnabled ?? (store as any).isRazorpayEnabled ?? false,
        upiId: (store as any).upiId || themeConfig.upiId || "",
        upiName: (store as any).upiName || themeConfig.upiName || "",
        isUpiEnabled: (store as any).isUpiEnabled ?? themeConfig.isUpiEnabled ?? false,
        whatsappNumber: themeConfig.whatsappNumber || "",
        whatsappMessage: themeConfig.whatsappMessage || "",
        isWhatsappEnabled: themeConfig.isWhatsappEnabled ?? false,
        showAnnouncement: themeConfig.showAnnouncement ?? false,
        announcementText: themeConfig.announcementText || "",
        announcementBg: themeConfig.announcementBg || "#000000",
        announcementColor: themeConfig.announcementColor || "#ffffff",
        instagramUrl: themeConfig.instagramUrl || "",
        facebookUrl: themeConfig.facebookUrl || "",
        twitterUrl: themeConfig.twitterUrl || "",
        linkedinUrl: themeConfig.linkedinUrl || "",
        youtubeUrl: themeConfig.youtubeUrl || "",
        footerText: themeConfig.footerText || "",
        timezone: themeConfig.timezone || "Asia/Kolkata",
        language: themeConfig.language || "English",
        isCodEnabled: themeConfig.isCodEnabled ?? false,
        isEmailNotificationEnabled: themeConfig.isEmailNotificationEnabled ?? true,
        isAdminAlertEnabled: themeConfig.isAdminAlertEnabled ?? true,
        isOrderNotificationEnabled: themeConfig.isOrderNotificationEnabled ?? true,
        city: (store as any).city || "Chennai",
        state: (store as any).state || "Tamil Nadu",
        pincode: (store as any).pincode || "600001",
        country: (store as any).country || "India",
        // Plugin Settings
        googleAnalyticsId: themeConfig.googleAnalyticsId || "",
        isGoogleAnalyticsEnabled: themeConfig.isGoogleAnalyticsEnabled ?? false,
        facebookPixelId: themeConfig.facebookPixelId || "",
        isFacebookPixelEnabled: themeConfig.isFacebookPixelEnabled ?? false,
        googlePlaceId: themeConfig.googlePlaceId || "",
        manualReviews: themeConfig.manualReviews || [],
        isGoogleReviewsEnabled: themeConfig.isGoogleReviewsEnabled ?? false,
        isSeoEnabled: themeConfig.isSeoEnabled ?? false,
        subscription: (store as any).subscription ? {
            plan: (store as any).subscription.plan.name,
            maxProducts: (store as any).subscription.plan.maxProducts
        } : { plan: "Normal", maxProducts: 100 }, // Default fallback
    })
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const { searchParams } = new URL(req.url)
        const ownerId = searchParams.get("ownerId")?.trim()
        const dashboardType = searchParams.get("dashboardType") || "1"
        let targetUserId = (session.user as any).id

        if (ownerId && (session.user as any).role === 'SUPER_ADMIN') {
            targetUserId = ownerId
        }

        const store = await getStoreForDashboard(targetUserId, dashboardType)
        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 })

        const body = await req.json()
        console.log("Settings PUT Body:", { ...body, razorpayKeySecret: body.razorpayKeySecret ? "HIDDEN" : null })
        
        // Preserve existing themeConfig and merge new values
        let themeConfig: Record<string, any> = {}
        try { if (store.themeConfig) themeConfig = JSON.parse(store.themeConfig) } catch { }

        if (body.favicon !== undefined) themeConfig.favicon = body.favicon
        if (body.brandCarousel !== undefined) themeConfig.brandCarousel = body.brandCarousel
        if (body.banners !== undefined) themeConfig.banners = body.banners
        if (body.fontFamily !== undefined) themeConfig.fontFamily = body.fontFamily
        if (body.fontStyle !== undefined) themeConfig.fontStyle = body.fontStyle
        if (body.menuAlignment !== undefined) themeConfig.menuAlignment = body.menuAlignment
        if (body.primaryColor !== undefined) themeConfig.primaryColor = body.primaryColor
        if (body.headerStyle !== undefined) themeConfig.headerStyle = body.headerStyle
        if (body.layoutStyle !== undefined) themeConfig.layoutStyle = body.layoutStyle
        if (body.menuType !== undefined) themeConfig.menuType = body.menuType
        if (body.menuItems !== undefined) themeConfig.menuItems = body.menuItems
        if (body.storeTheme !== undefined) themeConfig.storeTheme = body.storeTheme
        
        // WhatsApp settings
        if (body.whatsappNumber !== undefined) themeConfig.whatsappNumber = body.whatsappNumber
        if (body.whatsappMessage !== undefined) themeConfig.whatsappMessage = body.whatsappMessage
        if (body.isWhatsappEnabled !== undefined) themeConfig.isWhatsappEnabled = body.isWhatsappEnabled

        // Announcement settings
        if (body.showAnnouncement !== undefined) themeConfig.showAnnouncement = body.showAnnouncement
        if (body.announcementText !== undefined) themeConfig.announcementText = body.announcementText
        if (body.announcementBg !== undefined) themeConfig.announcementBg = body.announcementBg
        if (body.announcementColor !== undefined) themeConfig.announcementColor = body.announcementColor

        // Save Razorpay settings in themeConfig to avoid prisma sync issues
        if (body.razorpayKeyId !== undefined) themeConfig.razorpayKeyId = body.razorpayKeyId
        if (body.razorpayKeySecret !== undefined && body.razorpayKeySecret !== "••••••••••••") themeConfig.razorpayKeySecret = body.razorpayKeySecret
        if (body.razorpayWebhookSecret !== undefined && body.razorpayWebhookSecret !== "••••••••••••") themeConfig.razorpayWebhookSecret = body.razorpayWebhookSecret
        if (body.isRazorpayEnabled !== undefined) themeConfig.isRazorpayEnabled = body.isRazorpayEnabled
        
        // UPI settings (save both to model and config for maximum compatibility)
        if (body.upiId !== undefined) themeConfig.upiId = body.upiId
        if (body.upiName !== undefined) themeConfig.upiName = body.upiName
        if (body.isUpiEnabled !== undefined) themeConfig.isUpiEnabled = body.isUpiEnabled

        // COD settings
        if (body.isCodEnabled !== undefined) themeConfig.isCodEnabled = body.isCodEnabled

        // Social links
        if (body.instagramUrl !== undefined) themeConfig.instagramUrl = body.instagramUrl
        if (body.facebookUrl !== undefined) themeConfig.facebookUrl = body.facebookUrl
        if (body.twitterUrl !== undefined) themeConfig.twitterUrl = body.twitterUrl
        if (body.linkedinUrl !== undefined) themeConfig.linkedinUrl = body.linkedinUrl
        if (body.youtubeUrl !== undefined) themeConfig.youtubeUrl = body.youtubeUrl
        if (body.footerText !== undefined) themeConfig.footerText = body.footerText
        if (body.timezone !== undefined) themeConfig.timezone = body.timezone
        if (body.language !== undefined) themeConfig.language = body.language

        // Notification settings
        if (body.isEmailNotificationEnabled !== undefined) themeConfig.isEmailNotificationEnabled = body.isEmailNotificationEnabled
        if (body.isAdminAlertEnabled !== undefined) themeConfig.isAdminAlertEnabled = body.isAdminAlertEnabled
        if (body.isOrderNotificationEnabled !== undefined) themeConfig.isOrderNotificationEnabled = body.isOrderNotificationEnabled
        
        // Plugin settings
        if (body.googleAnalyticsId !== undefined) themeConfig.googleAnalyticsId = body.googleAnalyticsId
        if (body.isGoogleAnalyticsEnabled !== undefined) themeConfig.isGoogleAnalyticsEnabled = body.isGoogleAnalyticsEnabled
        if (body.facebookPixelId !== undefined) themeConfig.facebookPixelId = body.facebookPixelId
        if (body.isFacebookPixelEnabled !== undefined) themeConfig.isFacebookPixelEnabled = body.isFacebookPixelEnabled
        if (body.googlePlaceId !== undefined) themeConfig.googlePlaceId = body.googlePlaceId
        if (body.manualReviews !== undefined) themeConfig.manualReviews = body.manualReviews
        if (body.isGoogleReviewsEnabled !== undefined) themeConfig.isGoogleReviewsEnabled = body.isGoogleReviewsEnabled
        if (body.isSeoEnabled !== undefined) themeConfig.isSeoEnabled = body.isSeoEnabled
        if (body.seoTitle !== undefined) themeConfig.seoTitle = body.seoTitle // Template override
        if (body.seoDescription !== undefined) themeConfig.seoDescription = body.seoDescription // Template override

        const updated = await prisma.store.update({
            where: { id: store.id },
            data: {
                name: body.name ?? store.name,
                description: body.description ?? store.description,
                logo: body.logo ?? store.logo,
                banner: body.banner ?? store.banner,
                currency: body.currency ?? store.currency,
                upiId: body.upiId ?? (store as any).upiId,
                upiName: body.upiName ?? (store as any).upiName,
                isUpiEnabled: body.isUpiEnabled ?? (store as any).isUpiEnabled,
                city: body.city ?? (store as any).city,
                state: body.state ?? (store as any).state,
                pincode: body.pincode ?? (store as any).pincode,
                country: body.country ?? (store as any).country,
                themeConfig: JSON.stringify(themeConfig),
            },
        })

        // Revalidate the store page and layout to show updates immediately
        if (store.slug) {
            revalidatePath(`/s/${store.slug}`)
            revalidatePath(`/s/${store.slug}`, "layout")
        }

        console.log("Settings Update Success for Store:", store.slug)
        return NextResponse.json({ ok: true, store: updated })
    } catch (e: any) {
        console.error("Settings Update Error Detailed:", e)
        return NextResponse.json({ error: e.message || "Failed to update settings" }, { status: 500 })
    }
}
