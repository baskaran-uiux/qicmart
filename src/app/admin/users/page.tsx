export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"
import { Users as UsersIcon, Mail, Shield, Calendar, Plus } from "lucide-react"
import { AddUserModal } from "@/components/admin/AddUserModal"
import { UserCard } from "@/components/admin/UserCard"

export default async function AdminUsersPage() {
    const allUsers = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        include: { ownedStores: true }
    })

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic leading-none">User Directory</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-4 font-medium max-w-md">Governance and management of all platform participants and business owners.</p>
                    <div className="mt-8">
                        <AddUserModal />
                    </div>
                </div>
                <div className="p-5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-[32px] border border-indigo-500/20 shadow-xl shadow-indigo-500/5 transition-transform hover:scale-110">
                    <UsersIcon className="w-10 h-10" />
                </div>
            </div>

            {allUsers.length === 0 ? (
                <div className="p-20 bg-white dark:bg-zinc-900 rounded-[48px] border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-300 mb-6">
                        <UsersIcon size={40} />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase italic">No Users Found</h3>
                    <p className="text-zinc-500 text-sm mt-2 max-w-xs">Start by provisioning your first store owner using the button above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {allUsers.map((user) => (
                        <UserCard key={user.id} user={user} />
                    ))}
                </div>
            )}
        </div>
    )
}
