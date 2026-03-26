import { unstable_cache } from "next/cache"
import { prisma } from "./prisma"

export const getCachedDashboardStats = (storeId: string) => {
    return unstable_cache(
        async () => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            
            const [totalProducts, totalOrders, ordersToday, newCustomers, totalSales] = await Promise.all([
                prisma.product.count({ where: { storeId } }),
                prisma.order.count({ where: { storeId } }),
                prisma.order.count({ 
                    where: { 
                        storeId,
                        createdAt: { gte: today }
                    } 
                }),
                prisma.customer.count({ 
                    where: { 
                        storeId,
                        createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } // Last 30 days
                    } 
                }),
                prisma.order.aggregate({
                    where: { storeId, status: { not: "CANCELLED" } },
                    _sum: { total: true }
                })
            ])

            return {
                totalProducts,
                totalOrders,
                ordersToday,
                newCustomers,
                totalSales
            }
        },
        [`dashboard-stats-${storeId}`],
        {
            revalidate: 60, // Cache for 1 minute
            tags: [`dashboard-stats-${storeId}`]
        }
    )()
}
