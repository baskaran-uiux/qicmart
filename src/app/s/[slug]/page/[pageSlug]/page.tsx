import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function CustomPage({
    params
}: {
    params: Promise<{ slug: string; pageSlug: string }>
}) {
    const { slug, pageSlug } = await params
    const store = await prisma.store.findUnique({
        where: { slug },
        include: {
             pages: {
                 where: { slug: pageSlug, isPublished: true }
             }
        }
    })

    if (!store || !store.pages[0]) {
        notFound()
    }

    const page = store.pages[0]

    return (
        <main className="min-h-screen bg-white dark:bg-zinc-950">
            <div className="max-w-4xl mx-auto px-6 py-20 lg:py-32">
                <article className="prose prose-zinc dark:prose-invert max-w-none">
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-12 italic">
                        {page.title}
                    </h1>
                    <div 
                        className="text-lg leading-relaxed font-medium text-zinc-600 dark:text-zinc-300"
                        dangerouslySetInnerHTML={{ __html: page.content }} 
                    />
                </article>
            </div>
        </main>
    )
}
