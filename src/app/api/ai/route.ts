import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAIResponse } from "@/lib/ai";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(req.url);
        const storeId = searchParams.get("storeId");
        const type = searchParams.get("type") || "chat"; // chat, product, seo, marketing

        if (!storeId) {
            return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
        }

        const body = await req.json();
        const { prompt, context } = body;

        // 1. Fetch Store and check credits
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { id: true, aiCredits: true, ownerId: true }
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        if (store.aiCredits <= 0) {
            return NextResponse.json({ error: "Insufficient AI credits. Please contact Super Admin." }, { status: 403 });
        }

        // 2. Prepare System Prompt based on type
        let systemPrompt = "";
        let creditCost = 1;

        switch (type) {
            case "product":
                systemPrompt = "You are an expert e-commerce copywriter. Generate ONLY a detailed, compelling product description. Do not include any titles, meta tags, or conversational filler. Return only the description text.";
                creditCost = 1;
                break;
            case "seoTitle":
                systemPrompt = "You are an SEO expert. Generate ONLY a high-converting, character-limited SEO title (max 60 chars) for the product. No extra text.";
                creditCost = 1;
                break;
            case "seoDescription":
                systemPrompt = "You are an SEO expert. Generate ONLY a compelling meta description (max 160 chars) that encourages clicks. No extra text.";
                creditCost = 1;
                break;
            case "keywords":
                systemPrompt = "You are an SEO expert. Generate ONLY a list of 5-10 comma-separated focus keywords for this product. No extra text.";
                creditCost = 1;
                break;
            case "marketing":
                systemPrompt = `You are a world-class e-commerce marketing strategist. Your task is to generate a high-converting email newsletter campaign.
                1. Provide a catchy, click-worthy Subject Line.
                2. Provide a persuasive Email Body that encourages customers to take action.
                3. Use a tone that is professional yet very friendly and exciting.
                4. Use Emojis to make it visually engaging.
                5. If the user context is in Tamil, generate the email in simple, conversational Tamil.
                Return format:
                Subject: [Your Subject Here]
                
                [Your Email Body Here]`;
                creditCost = 2;
                break;
            case "growth":
                systemPrompt = `You are a friendly and highly accurate E-commerce Mentor. Your goal is to help store owners grow their business with simple, high-impact, and quality advice. 
                1. Provide the exact number of points needed for a high-quality answer. If 5 points are needed, give 5. If 10 points are truly important, give 10. Avoid unnecessary filler. 
                2. Use VERY SIMPLE language. Avoid corporate jargon. 
                3. ALWAYS respond in the SAME language as the user. If they use Tamil, use simple Tamil. 
                Context: Store Name is ${context?.storeName || 'Unknown'}. Focus on ACCURACY and ACTIONABLE steps.`;
                creditCost = 2;
                break;
            default:
                systemPrompt = "You are a helpful assistant. Be concise and direct. Do not use conversational filler.";
                creditCost = 1;
        }

        // 3. Call AI
        const fullPrompt = `${systemPrompt}\n\nContext: ${JSON.stringify(context || {})}\n\nUser Question/Task: ${prompt}`;
        const aiResponse = await getAIResponse(fullPrompt);

        // 4. Deduct Credits
        await prisma.store.update({
            where: { id: storeId },
            data: { aiCredits: { decrement: creditCost } }
        });

        return NextResponse.json({ 
            response: aiResponse, 
            creditsRemaining: store.aiCredits - creditCost 
        });

    } catch (error: any) {
        console.error("[AI_API_ERROR]", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
