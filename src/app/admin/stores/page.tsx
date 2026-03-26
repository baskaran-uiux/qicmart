import { prisma } from "@/lib/prisma"
import { StoreTable } from "@/components/admin/StoreTable"
import { Store as StoreIcon } from "lucide-react"

export default async function AdminStoresPage() {
    const allStores = await prisma.store.findMany({
        orderBy: { createdAt: "desc" },
        include: { 
            owner: true,
            subscription: {
                include: { plan: true }
            }
        }
    })

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">Store Management</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Manage all registered stores on the platform.</p>
                </div>
                <div className="p-4 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-3xl border border-purple-500/20 shadow-lg shadow-purple-500/10 transition-transform hover:rotate-3">
                    <StoreIcon className="w-8 h-8" />
                </div>
            </div>

            <StoreTable initialStores={allStores} />
        </div>
    )
}
