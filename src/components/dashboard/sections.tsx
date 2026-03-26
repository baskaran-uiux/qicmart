import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowRight, ShoppingCart, Package, Star } from "lucide-react"

export async function RecentOrdersSection({ storeId, impersonateId, currencySymbol }: { storeId: string, impersonateId: string | null, currencySymbol: string }) {
    const recentOrders = await prisma.order.findMany({
        where: { storeId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            total: true,
            status: true,
            customer: {
                select: {
                    firstName: true,
                    lastName: true
                }
            }
        }
    })

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-500 group">
            <div className="p-7 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight capitalize italic text-black dark:text-white">Recent Orders</h3>
                <Link 
                    href={`/dashboard/orders${impersonateId ? `?ownerId=${impersonateId}` : ''}`}
                    className="p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                    <ArrowRight size={14} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </Link>
            </div>
            <div className="flex-1 overflow-x-auto custom-scrollbar">
                {recentOrders.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <ShoppingCart className="w-10 h-10 text-zinc-100 dark:text-zinc-800 mb-3" />
                        <p className="text-zinc-400 font-semibold italic text-xs capitalize tracking-wide">No orders yet</p>
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[380px]">
                        <thead className="text-[12px] sm:text-[14px] text-zinc-400 dark:text-zinc-500 capitalize bg-zinc-50/50 dark:bg-zinc-950/50 font-semibold tracking-wide border-b border-zinc-50 dark:border-zinc-800">
                            <tr>
                                <th className="px-5 py-3">Customer</th>
                                <th className="px-5 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="group/row hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all">
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-zinc-900 dark:text-white text-xs group-hover/row:text-indigo-600 transition-colors">
                                                {order.customer?.firstName} {order.customer?.lastName?.[0]}.
                                            </span>
                                            <span className="text-[11px] text-zinc-400 font-semibold capitalize tracking-normal">#{order.id.slice(-6)}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <p className="font-semibold text-zinc-900 dark:text-white text-xs mb-0.5">{currencySymbol}{order.total.toLocaleString()}</p>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold capitalize tracking-wide ${
                                            order.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 
                                            order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                                            'bg-zinc-500/10 text-zinc-500'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export async function TopProductsSection({ storeId, impersonateId, currencySymbol }: { storeId: string, impersonateId: string | null, currencySymbol: string }) {
    const topProductsData = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { storeId } },
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
    })

    const productIds = topProductsData.map(item => item.productId)
    const productsInfo = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true }
    })

    const topProducts = topProductsData.map(item => {
        const product = productsInfo.find(p => p.id === item.productId)
        return {
            name: product?.name || 'Unknown Product',
            units: item._sum.quantity || 0,
            rev: (item._sum.quantity || 0) * (product?.price || 0)
        }
    })

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-500 group">
            <div className="p-7 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight capitalize italic text-black dark:text-white">Top Products</h3>
                <Link 
                    href={`/dashboard/analytics${impersonateId ? `?ownerId=${impersonateId}` : ''}`}
                    className="p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                    <ArrowRight size={14} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </Link>
            </div>
            <div className="flex-1 overflow-x-auto custom-scrollbar">
                {topProducts.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <Package className="w-10 h-10 text-zinc-100 dark:text-zinc-800 mb-3" />
                        <p className="text-zinc-400 font-semibold italic text-xs capitalize tracking-wide">No data available</p>
                    </div>
                ) : (
                    <table className="w-full text-left min-w-[380px]">
                        <thead className="text-[12px] sm:text-[14px] text-zinc-400 dark:text-zinc-500 capitalize bg-zinc-50/50 dark:bg-zinc-950/50 font-semibold tracking-wide border-b border-zinc-50 dark:border-zinc-800">
                            <tr>
                                <th className="px-5 py-3">Product</th>
                                <th className="px-5 py-3 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {topProducts.map((p, i) => (
                                <tr key={i} className="group/row hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all">
                                    <td className="px-5 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-zinc-900 dark:text-white text-xs truncate max-w-[150px] group-hover/row:text-indigo-600 transition-colors">{p.name}</span>
                                            <span className="text-[11px] text-zinc-400 font-semibold capitalize tracking-normal italic whitespace-nowrap">{p.units} Sold</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <p className="font-semibold text-zinc-900 dark:text-white text-xs mb-0.5">{currencySymbol}{p.rev.toLocaleString()}</p>
                                        <span className="text-[8px] font-semibold capitalize tracking-wide text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full italic">Best Seller</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export async function ReviewsSection({ storeId, impersonateId }: { storeId: string, impersonateId: string | null }) {
    const recentReviews = await prisma.review.findMany({
        where: { storeId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            product: { select: { name: true } },
            user: { select: { name: true } }
        }
    })

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm flex flex-col hover:shadow-xl transition-all duration-500 group">
            <div className="p-7 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight capitalize italic text-black dark:text-white">Reviews</h3>
                <Link 
                    href={`/dashboard/reviews${impersonateId ? `?ownerId=${impersonateId}` : ''}`}
                    className="p-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                    <ArrowRight size={14} className="text-zinc-400 group-hover:text-indigo-500 transition-colors" />
                </Link>
            </div>
            <div className="flex-1">
                {recentReviews.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                        <Star className="w-10 h-10 text-zinc-100 dark:text-zinc-800 mb-3" />
                        <p className="text-zinc-400 font-semibold italic text-xs capitalize tracking-wide">No reviews yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {recentReviews.map((review) => (
                            <div key={review.id} className="p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all group/rev">
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                            key={i} 
                                            size={10} 
                                            className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200 dark:text-zinc-800"} 
                                        />
                                    ))}
                                    <span className="text-[11px] font-semibold text-zinc-400 capitalize tracking-wide ml-auto italic">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs font-medium text-zinc-900 dark:text-white line-clamp-2 leading-relaxed mb-2 italic">"{review.comment}"</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-indigo-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                        {(review.user?.name?.[0]) || 'G'}
                                    </div>
                                    <p className="text-[12px] font-medium text-zinc-500">
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-300 truncate max-w-[80px]">{(review.user?.name) || 'Guest'}</span> <span className="text-[10px] italic opacity-50">on {review.product?.name}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
