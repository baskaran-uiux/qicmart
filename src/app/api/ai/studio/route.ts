import { NextRequest, NextResponse } from "next/server";
import { getAIVisionResponse } from "@/lib/ai";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// Initialize Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const { image, storeId, theme = "luxury studio" } = await req.json();

        if (!image || !storeId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Get Store Credits
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { aiCredits: true }
        });

        if (!store || store.aiCredits < 10) {
            return NextResponse.json({ error: "Insufficient credits (10 required for Pro Studio)" }, { status: 402 });
        }

        // 2. Gemini Analysis & Prompt Generation
        const prompt = `
            Analyze this product and generate a background replacement prompt for an AI mockup generator.
            The theme is "${theme}".
            Return a JSON object with:
            {
                "productName": "name",
                "category": "category",
                "bgPrompt": "A highly detailed, professional prompt for background replacement (e.g., 'Placed on a premium white marble countertop with soft morning sunlight and bokeh garden background')",
                "suggestedScale": 0.6
            }
            ONLY return JSON, no markdown.
        `;

        let base64Data = image;
        let mimeType = "image/jpeg";
        if (image.startsWith("data:")) {
            const matches = image.match(/^data:(.+?);base64,(.+)$/);
            if (matches && matches.length === 3) {
                mimeType = matches[1];
                base64Data = matches[2];
            }
        } else if (image.startsWith("http://") || image.startsWith("https://")) {
            const imgRes = await fetch(image);
            if (!imgRes.ok) throw new Error("Failed to fetch image URL");
            const arrayBuffer = await imgRes.arrayBuffer();
            base64Data = Buffer.from(arrayBuffer).toString('base64');
            mimeType = imgRes.headers.get('content-type') || "image/jpeg";
        }
        const analysis = await getAIVisionResponse(prompt, base64Data, mimeType);
        const cleanAnalysis = analysis.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const data = JSON.parse(cleanAnalysis);

        // 3. Cloudinary Generative Background Replace
        // We upload to Cloudinary, then apply the transformation
        // Important: Cloudinary backend requires spaces to be underscores and no special characters in prompts
        const sanitizedPrompt = (data.bgPrompt || "premium luxury studio")
            .replace(/[^a-zA-Z0-9 ]/g, "")
            .trim()
            .replace(/\s+/g, "_");

        const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: "qicmart_studio",
            transformation: [
                { effect: `gen_background_replace:prompt_${sanitizedPrompt}` }
            ]
        });

        // 4. Deduct Credits (Pro Studio is 10 credits)
        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data: { aiCredits: { decrement: 10 } }
        });

        return NextResponse.json({
            success: true,
            analysis: data,
            creditsRemaining: updatedStore.aiCredits,
            resultUrl: uploadResponse.secure_url
        });

    } catch (error: any) {
        console.error("AI Studio Pro Error:", error);
        return NextResponse.json({ error: error.message || "Studio processing failed" }, { status: 500 });
    }
}
