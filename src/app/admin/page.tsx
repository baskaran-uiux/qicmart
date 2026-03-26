import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"
import { Users, Store as StoreIcon, DollarSign, Activity } from "lucide-react"
import { StoreTable } from "@/components/admin/StoreTable"
import { MotionDiv, fadeInUp, staggerContainer } from "@/components/ui/Motion"

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "SUPER_ADMIN") {
        redirect("/");
    }

    const [totalStores, totalUsers, totalRevenue] = await Promise.all([
        prisma.store.count(),
        prisma.user.count(),
        prisma.payment.aggregate({ _sum: { amount: true } }),
    ])

    // Mock data for charts or recent activity
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
            <div>
                <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic">Dashboard Overview</h2>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Welcome back to the platform control center.</p>
            </div>

            {/* KPI Cards */}
            <MotionDiv 
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {[
                    { label: "Total Stores", value: totalStores, icon: StoreIcon, color: "purple" },
                    { label: "Total Users", value: totalUsers, icon: Users, color: "indigo" },
                    { label: "Total Revenue", value: `₹${totalRevenue._sum.amount?.toFixed(2) || "0.00"}`, icon: DollarSign, color: "emerald" },
                    { label: "Active Sessions", value: "124", icon: Activity, color: "rose" },
                ].map((kpi, i) => (
                    <MotionDiv 
                        key={i} 
                        variants={fadeInUp}
                        className="p-8 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-xl group"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">{kpi.label}</p>
                            <div className={`p-3 bg-${kpi.color}-500/10 text-${kpi.color}-600 dark:text-${kpi.color}-400 rounded-2xl group-hover:scale-110 transition-transform`}>
                                <kpi.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">{kpi.value}</p>
                    </MotionDiv>
                ))}
            </MotionDiv>

            {/* Stores Table Section */}
            <div className="space-y-6">
                <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Recent Activity</h3>
                <StoreTable initialStores={allStores} />
            </div>
        </div>
    )
}
