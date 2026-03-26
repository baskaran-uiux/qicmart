import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const ownerId = searchParams.get("ownerId");

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { ownedStores: true }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const store = ownerId 
            ? user.ownedStores.find(s => s.ownerId === ownerId)
            : user.ownedStores[0];

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        // Mock Search Console data for now
        const analytics = {
            totalClicks: 1248,
            impressions: 24500,
            avgPosition: 4.2,
            keywords: [
                { keyword: "premium saas software", clicks: 452, ctr: "12.4%", position: 1.2 },
                { keyword: "digital marketing tools", clicks: 312, ctr: "8.2%", position: 2.5 },
                { keyword: "buy saas products", clicks: 189, ctr: "5.1%", position: 3.8 },
                { keyword: "best marketplace for code", clicks: 95, ctr: "3.2%", position: 4.1 },
            ],
            sitemapUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://qicmart.com'}/sitemap.xml`,
            indexingStatus: "Active"
        };

        return NextResponse.json({
            seoTitle: store.seoTitle || "",
            seoDescription: store.seoDescription || "",
            ogImage: store.ogImage || "",
            favicon: store.favicon || "",
            analytics,
            score: 78 // Mock score
        });

    } catch (error) {
        console.error("[SEO_GET]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const ownerId = searchParams.get("ownerId");
        const body = await req.json();

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { ownedStores: true }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const store = ownerId 
            ? user.ownedStores.find(s => s.ownerId === ownerId)
            : user.ownedStores[0];

        if (!store) return NextResponse.json({ error: "Store not found" }, { status: 404 });

        const updatedStore = await prisma.store.update({
            where: { id: store.id },
            data: {
                seoTitle: body.seoTitle,
                seoDescription: body.seoDescription,
                ogImage: body.ogImage,
                favicon: body.favicon,
            }
        });

        return NextResponse.json(updatedStore);
    } catch (error) {
        console.error("[SEO_POST]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
