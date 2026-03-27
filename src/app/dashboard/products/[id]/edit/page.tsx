"use client"

import ProductEditor from "@/components/dashboard/ProductEditor"
import { useParams } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function EditProductPage() {
    const params = useParams()
    const id = params.id as string

    return (
        <div className="p-4 sm:p-8">
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <Loader2 size={40} className="animate-spin text-indigo-600" />
                    <p className="text-zinc-500 font-bold text-sm">Loading Editor...</p>
                </div>
            }>
                <ProductEditor productId={id} />
            </Suspense>
        </div>
    )
}
