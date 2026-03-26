export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma"
import ProfileForm from "./ProfileForm"

export default async function AdminProfilePage() {
    // Platform administrator has role 'SUPER_ADMIN'
    const admin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
    })

    if (!admin) {
        return (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                <h2 className="text-xl font-black text-rose-500 uppercase tracking-tight italic">Admin Not Found</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Please ensure a Super Admin user exists in the database.</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">Account Profile</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Manage your administrative credentials and preferences.</p>
            </div>

            <ProfileForm admin={{
                id: admin.id,
                name: admin.name,
                email: admin.email,
                image: admin.image
            }} />
        </div>
    )
}
