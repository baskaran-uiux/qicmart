"use client"

import { useState, use, useEffect } from "react"
import { 
    User, 
    MapPin, 
    Star, 
    Globe, 
    Bell, 
    Shield, 
    Info, 
    LogOut, 
    ChevronRight, 
    Store, 
    ArrowLeft,
    FileText,
    X,
    Package,
    ShoppingBag,
    CreditCard,
    Loader2,
    History
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { useLanguage } from "@/context/LanguageContext"

export default function ShopperProfilePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // State for active section (default null for mobile menu)
    const [activeTab, setActiveTab] = useState<string | null>(null)
    const { data: session, status } = useSession()
    
    // Auto-select profile on desktop mount
    useEffect(() => {
        if (window.innerWidth >= 768) {
            setActiveTab("profile")
        }
    }, [])
    
    // User preferences state
    const { language, setLanguage, t } = useLanguage()
    const [notifications, setNotifications] = useState(true)
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])
    const [viewedStores, setViewedStores] = useState<any[]>([])
    
    // Notification preferences state
    const [emailNotif, setEmailNotif] = useState(true)
    const [smsNotif, setSmsNotif] = useState(false)
    const [orderUpdates, setOrderUpdates] = useState(true)

    // Profile form state
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [storeId, setStoreId] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [gender, setGender] = useState("Male")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    
    // Address state
    const [address, setAddress] = useState("")
    const [area, setArea] = useState("")
    const [landmark, setLandmark] = useState("")
    const [city, setCity] = useState("")
    const [state, setState] = useState("")
    const [pincode, setPincode] = useState("")

    // Reviews, Orders and Stores state
    const [reviews, setReviews] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<any>(null)

    // Fetch Store and User data
    useEffect(() => {
        // Pre-populate from session if available
        if (status === "authenticated" && session?.user) {
            const nameParts = session.user.name?.split(" ") || ["", ""]
            setFirstName(nameParts[0] || "")
            setLastName(nameParts.slice(1).join(" "))
            setEmail(session.user.email || "")
        }

        async function loadData() {
            try {
                // 1. Get Store ID from slug
                const storeRes = await fetch(`/api/customer/stores?slug=${slug}`)
                const storeData = await storeRes.json()
                const sId = storeData?.id
                setStoreId(sId)

                // 2. Get User Profile
                const profileRes = await fetch(`/api/customer/profile?storeId=${sId}`)
                const profile = await profileRes.json()

                if (profile && !profile.error) {
                    setFirstName(profile.firstName || "")
                    setLastName(profile.lastName || "")
                    setEmail(profile.email || "")
                    setMobile(profile.phone || "")
                    setAddress(profile.address || "")
                    setArea(profile.area || "")
                    setLandmark(profile.landmark || "")
                    setCity(profile.city || "")
                    setState(profile.state || "")
                    setPincode(profile.pincode || "")
                }
                // No need for fallback here anymore as we do it at the start of useEffect

                // 3. Get Reviews
                const reviewsRes = await fetch(`/api/customer/reviews`)
                const reviewsData = await reviewsRes.json()
                if (Array.isArray(reviewsData)) {
                    setReviews(reviewsData)
                }

                // 4. Get Orders
                if (sId) {
                    const ordersRes = await fetch(`/api/customer/orders?storeId=${sId}`)
                    const ordersData = await ordersRes.json()
                    if (Array.isArray(ordersData)) {
                        setOrders(ordersData)
                    }
                }

            } catch (err) {
                console.error("Load failed:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()

        const viewed = localStorage.getItem("recentlyViewedProducts")
        if (viewed) {
            setRecentlyViewed(JSON.parse(viewed))
        }

        const stores = localStorage.getItem("recentlyViewedStores")
        if (stores) {
            setViewedStores(JSON.parse(stores))
        }
    }, [slug])

    const handleSave = async () => {
        setIsSaving(true)
        setSaveSuccess(false)
        try {
            const res = await fetch("/api/customer/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    gender, // Added gender
                    phone: mobile,
                    address,
                    area,
                    landmark,
                    city,
                    state,
                    pincode,
                    storeId
                })
            })
            if (res.ok) {
                setIsEditing(false)
                setSaveSuccess(true)
                setTimeout(() => setSaveSuccess(false), 3000)
            }
        } catch (err) {
            console.error("Save failed:", err)
        } finally {
            setIsSaving(false)
        }
    }

    const TrackingModal = ({ order, isOpen, onClose }: { order: any, isOpen: boolean, onClose: () => void }) => {
        if (!order) return null;

        const steps = [
            { status: 'PENDING', label: 'Order Confirmed', desc: 'Your Order has been placed.', date: order.createdAt },
            { status: 'PROCESSING', label: 'Processing', desc: 'Seller has processed your order.', date: null },
            { status: 'SHIPPED', label: 'Shipped', desc: order.carrier ? `${order.carrier} - ${order.trackingNumber || ''}` : 'Your item has been shipped.', date: null },
            { status: 'OUT_FOR_DELIVERY', label: 'Out For Delivery', desc: 'Your item is out for delivery', date: null },
            { status: 'DELIVERED', label: 'Delivered', desc: 'Your item has been delivered', date: null },
        ];

        const activityMap = new Map();
        order.activities?.forEach((a: any) => {
            activityMap.set(a.status, a);
        });

        const currentStatusToIndex = {
            'PENDING': 0, 'PROCESSING': 1, 'SHIPPED': 2, 'OUT_FOR_DELIVERY': 3, 'DELIVERED': 4, 'COMPLETED': 4, 'CANCELLED': -1
        };

        const currentIndex = currentStatusToIndex[order.status as keyof typeof currentStatusToIndex] ?? 0;

        // Price breakdown calculations
        const subtotal = order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
        const shipping = order.shippingCost || 0;
        const tax = order.taxRun || 0;
        const discount = order.discountTotal || 0;
        const total = order.total;

        return (
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end md:p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-xl h-full bg-white md:rounded-[32px] shadow-2xl overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md p-6 border-b border-zinc-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-400 md:hidden"><ArrowLeft size={20} /></button>
                                    <div>
                                        <h3 className="text-lg font-black text-zinc-900 uppercase italic">{t("orderDetails")}</h3>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">ID: #{order.id.slice(-6).toUpperCase()}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-all text-zinc-400 hidden md:block"><X size={20} /></button>
                            </div>

                            <div className="p-6 md:p-8 space-y-10 pb-20">
                                {/* Tracking Timeline SECTION */}
                                <section>
                                    <div className="flex items-center gap-2 mb-8">
                                        <Package size={16} className="text-zinc-400" />
                                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Tracking Status</h4>
                                    </div>
                                    <div className="relative space-y-10 ml-1">
                                        <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-zinc-100" />
                                        {steps.map((step, idx) => {
                                            const isCompleted = idx <= currentIndex;
                                            const activity = activityMap.get(step.status);
                                            const date = activity?.createdAt || (idx === 0 ? order.createdAt : null);
                                            return (
                                                <div key={idx} className="relative pl-8">
                                                    <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${isCompleted ? 'bg-emerald-500' : 'bg-zinc-200'}`}>
                                                        {isCompleted && <div className="w-1 h-1 bg-white rounded-full" />}
                                                    </div>
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-3">
                                                            <h5 className={`text-[13px] font-bold tracking-tight ${isCompleted ? 'text-zinc-900' : 'text-zinc-300'}`}>{step.label}</h5>
                                                            {date && <span className="text-[9px] font-medium text-zinc-400">{new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>}
                                                        </div>
                                                        <p className={`text-[11px] font-medium leading-relaxed ${isCompleted ? 'text-zinc-500' : 'text-zinc-300'}`}>{activity?.comment || step.desc}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Delivery Details SECTION */}
                                <section className="pt-8 border-t border-zinc-100">
                                    <div className="flex items-center gap-2 mb-6">
                                        <MapPin size={16} className="text-zinc-400" />
                                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Delivery Address</h4>
                                    </div>
                                    <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                                        {(() => {
                                            try {
                                                const addr = JSON.parse(order.shippingAddress || '{}');
                                                if (!addr.address && !addr.city) return <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest italic">{order.shippingAddress || 'No address provided'}</p>;
                                                return (
                                                    <div className="space-y-1">
                                                        <p className="text-[14px] font-black text-zinc-900">{addr.firstName} {addr.lastName}</p>
                                                        <p className="text-[12px] font-medium text-zinc-500 leading-relaxed">
                                                            {addr.address}<br />
                                                            {addr.city}, {addr.state} {addr.zip}<br />
                                                            {addr.email}
                                                        </p>
                                                    </div>
                                                );
                                            } catch (e) {
                                                return <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest italic">{order.shippingAddress || 'No address provided'}</p>;
                                            }
                                        })()}
                                    </div>
                                </section>

                                {/* Items SECTION */}
                                <section className="pt-8 border-t border-zinc-100">
                                    <div className="flex items-center gap-2 mb-6">
                                        <ShoppingBag size={16} className="text-zinc-400" />
                                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{t("itemsOverview")}</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {order.items.map((item: any) => (
                                            <div key={item.id} className="flex gap-4 items-center p-3 hover:bg-zinc-50 rounded-2xl transition-all group">
                                                <div className="w-14 h-14 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0 border border-zinc-200">
                                                    <img src={JSON.parse(item.product.images || "[]")[0] || "https://placehold.co/100"} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="text-[13px] font-bold text-zinc-900 truncate mt-0.5">{item.product.name}</h5>
                                                    <p className="text-[11px] font-medium text-zinc-400">{t("qty")}: {item.quantity} × ₹{item.price}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-zinc-900 italic">₹{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Price Details SECTION */}
                                <section className="pt-8 border-t border-zinc-100">
                                    <div className="flex items-center gap-2 mb-6">
                                        <CreditCard size={16} className="text-zinc-400" />
                                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">{t("paymentBreakdown")}</h4>
                                    </div>
                                    <div className="space-y-3 px-1">
                                        <div className="flex justify-between items-center text-xs font-bold text-zinc-500 tracking-tight">
                                            <span>{t("subtotal")}</span>
                                            <span>₹{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-bold text-zinc-500 tracking-tight">
                                            <span>{t("shipping")}</span>
                                            <span className="text-emerald-600 font-black">{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                                        </div>
                                        {tax > 0 && (
                                            <div className="flex justify-between items-center text-xs font-bold text-zinc-500 tracking-tight">
                                                <span>{t("estimatedTax")}</span>
                                                <span>₹{tax.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {discount > 0 && (
                                            <div className="flex justify-between items-center text-xs font-bold text-rose-500 tracking-tight">
                                                <span>{t("discount")}</span>
                                                <span>-₹{discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="pt-4 border-t border-dashed border-zinc-200 flex justify-between items-center">
                                            <span className="text-sm font-black text-zinc-900 italic">{t("grandTotal")}</span>
                                            <span className="text-lg font-black text-[var(--primary-color)] italic">₹{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </section>

                                {/* Download Invoice Button */}
                                <div className="pt-8">
                                    <button 
                                        onClick={() => window.print()}
                                        className="w-full py-5 bg-white border-2 border-zinc-100 text-zinc-900 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-50 hover:border-zinc-200 transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <FileText size={18} className="text-zinc-300 group-hover:text-zinc-600 transition-colors" />
                                        {t("downloadInvoice")}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        );
    };

    const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="border-b border-zinc-100 last:border-0 pb-4 mb-4">
            <h3 className="pl-[58px] text-[11px] font-black text-[var(--primary-color)] uppercase tracking-[0.2em] mb-3 opacity-90">{title}</h3>
            <div className="space-y-1">{children}</div>
        </div>
    )

    const NavLink = ({ id, label, icon: Icon, color = "text-[var(--primary-color)]", active }: { id: string, label: string, icon: any, color?: string, active?: boolean }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center justify-between px-6 py-4 transition-all group text-left ${active ? "bg-[var(--primary-color)]/5 text-[var(--primary-color)]" : "hover:bg-zinc-50 text-zinc-600"}`}
        >
            <div className="flex items-center gap-4 flex-1 min-w-0 mr-4">
                <Icon size={18} className={`flex-shrink-0 ${active ? "text-[var(--primary-color)]" : "text-zinc-400 group-hover:text-[var(--primary-color)]"}`} />
                <span className={`text-[13px] font-bold uppercase tracking-tight text-left leading-tight block truncate md:whitespace-normal ${active ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`}>{label}</span>
            </div>
            <ChevronRight size={14} className={`flex-shrink-0 ${active ? "text-[var(--primary-color)]/50" : "text-zinc-300 group-hover:text-[var(--primary-color)]/50"}`} />
        </button>
    )

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-color)]" />
            </div>
        )
    }

    if (status === "unauthenticated") {
        return (
            <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-10 text-center border border-white"
                >
                    <div className="w-20 h-20 bg-[var(--primary-color)]/5 rounded-full flex items-center justify-center mx-auto mb-8">
                        <User size={32} className="text-[var(--primary-color)]" />
                    </div>
                    
                    <h1 className="text-2xl font-black text-zinc-900 uppercase italic tracking-tight mb-3">Shopper Login</h1>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-loose mb-10">Sign in to track orders, save addresses, and manage your account.</p>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => signIn("google", { callbackUrl: window.location.href })}
                            className="w-full flex items-center justify-center gap-4 py-4 bg-white border-2 border-zinc-100 rounded-2xl hover:border-zinc-200 transition-all group"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" />
                            <span className="text-[13px] font-black uppercase tracking-widest text-zinc-600">Continue with Google</span>
                        </button>
                        
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-100"></div></div>
                            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black text-zinc-300"><span className="bg-white px-4">Or</span></div>
                        </div>

                        <Link 
                            href={`/s/${slug}`}
                            className="w-full block py-4 bg-zinc-50 text-zinc-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all"
                        >
                            Return to Store
                        </Link>
                    </div>

                    <p className="mt-12 text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                        By signing in, you agree to our <span className="text-zinc-400 underline cursor-pointer">Terms</span> & <span className="text-zinc-400 underline cursor-pointer">Privacy</span>
                    </p>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#f1f3f6] pb-20">
            {/* Desktop Header / Breadcrumbs */}
            <div className="bg-white px-6 py-4 shadow-sm mb-6 hidden md:block">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <Link href={`/s/${slug}`} className="hover:text-[var(--primary-color)]">{t("home")}</Link>
                    <span>/</span>
                    <span className="text-zinc-900">{t("myAccount")}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 md:gap-8 items-start">
                
                {/* Sidebar */}
                <aside className={`space-y-4 ${activeTab ? "hidden md:block" : "block"}`}>
                    {/* User Greeting */}
                    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName || "Guest"}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{t("hello")}</p>
                            <h2 className="text-sm font-black text-zinc-900 uppercase italic">{firstName} {lastName}</h2>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden py-1">
                        <NavLink id="profile" label={t("profile")} icon={User} active={activeTab === "profile"} />
                        <NavLink id="orders" label={t("myOrders")} icon={ShoppingBag} active={activeTab === "orders"} />
                        <NavLink id="address" label={t("manageAddresses")} icon={MapPin} active={activeTab === "address"} />
                        <NavLink id="reviews" label={t("myReviews")} icon={Star} active={activeTab === "reviews"} />
                        <NavLink id="viewed_products" label={t("recentlyViewed")} icon={History} active={activeTab === "viewed_products"} />
                        <NavLink id="notifications" label={t("notifications")} icon={Bell} active={activeTab === "notifications"} />
                        <NavLink id="language" label={t("selectLanguage")} icon={Globe} active={activeTab === "language"} />
                        
                        <button 
                            onClick={() => signOut({ callbackUrl: `/s/${slug}` })}
                            className="w-full flex items-center justify-between px-6 py-4 text-rose-600 hover:bg-rose-50 transition-all group font-bold text-left"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <LogOut size={18} className="text-rose-600 flex-shrink-0" />
                                <span className="text-[13px] uppercase tracking-tight truncate">{t("logout")}</span>
                            </div>
                        </button>
                    </div>
                </aside>

                {/* Content Area */}
                <main className={`bg-white rounded-xl shadow-sm min-h-[600px] overflow-hidden ${activeTab ? "block" : "hidden md:block"}`}>
                    {/* Mobile Back Header */}
                    {activeTab && (
                        <div className="md:hidden flex items-center gap-4 px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                            <button onClick={() => setActiveTab(null)} className="p-2 -ml-2 hover:bg-zinc-100 rounded-full transition-all">
                                <ArrowLeft size={20} className="text-zinc-600" />
                            </button>
                            <h2 className="text-sm font-black text-zinc-900 uppercase italic">
                                {activeTab === "profile" && t("profile")}
                                {activeTab === "orders" && t("myOrders")}
                                {activeTab === "address" && t("manageAddresses")}
                                {activeTab === "reviews" && t("myReviews")}
                                {activeTab === "viewed_products" && t("recentlyViewed")}
                                {activeTab === "notifications" && t("notifications")}
                                {activeTab === "language" && t("selectLanguage")}
                            </h2>
                        </div>
                    )}
                    {activeTab === "profile" && (
                        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Section Header */}
                            <div className="flex items-center gap-4 mb-10">
                                <h2 className="text-xl font-black text-zinc-900 uppercase italic">{t("profile")}</h2>
                            </div>

                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">{t("firstName")}</label>
                                    <input 
                                        type="text" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        placeholder="Enter first name"
                                        className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">{t("lastName")}</label>
                                    <input 
                                        type="text" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        placeholder="Enter last name"
                                        className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            {/* Gender selection */}
                            <div className="space-y-4 mb-14">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">{t("gender")}</label>
                                <div className="flex gap-8">
                                    {["Male", "Female"].map(g => (
                                        <button 
                                            key={g}
                                            onClick={() => setGender(g)}
                                            className="flex items-center gap-3 group"
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${gender === g ? "border-[var(--primary-color)] bg-[var(--primary-color)] shadow-lg shadow-[var(--primary-color)]/20" : "border-zinc-300 group-hover:border-zinc-400"}`}>
                                                {gender === g && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <span className={`text-sm font-bold ${gender === g ? "text-zinc-900" : "text-zinc-500"}`}>{g === "Male" ? t("male") : t("female")}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Email Address */}
                            <div className="mb-14">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-sm font-black text-zinc-900 uppercase italic">{t("emailAddress")}</h3>
                                </div>
                                <input 
                                    type="email" 
                                    disabled
                                    value={email}
                                    className="max-w-md w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold opacity-60"
                                />
                            </div>

                            {/* Mobile Number */}
                            <div className="mb-14">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-sm font-black text-zinc-900 uppercase italic">{t("mobileNumber")}</h3>
                                </div>
                                <input 
                                    type="text" 
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="Enter mobile number"
                                    className="max-w-md w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 focus:bg-white transition-all"
                                />
                            </div>

                            {/* Save Button */}
                            <div className="mt-10 pt-10 border-t border-zinc-100">
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full md:w-auto px-12 py-4 bg-[var(--primary-color)] text-white rounded-xl text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-[var(--primary-color)]/20 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {isSaving ? "Saving..." : t("saveChanges")}
                                </button>
                                
                                {saveSuccess && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"
                                    >
                                        ✨ Profile updated successfully!
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "orders" && (
                        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-black text-zinc-900 uppercase italic mb-10">{t("myOrders")}</h2>
                            
                            {orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <button 
                                            key={order.id} 
                                            onClick={() => setSelectedOrderForTracking(order)}
                                            className="w-full text-left bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-[var(--primary-color)]/20 transition-all p-4 md:p-6 group flex items-center gap-6"
                                        >
                                            {/* Minimal Outer Info: Photo, Name, Status */}
                                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 flex-shrink-0">
                                                <img 
                                                    src={JSON.parse(order.items[0]?.product.images || "[]")[0] || "https://placehold.co/150"} 
                                                    alt={order.items[0]?.product.name || "Order"} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-medium text-zinc-400">Order #{order.id.slice(-6).toUpperCase()}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                                        order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' :
                                                        order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600' :
                                                        'bg-amber-50 text-amber-600'
                                                    }`}>
                                                        {order.status.charAt(0) + order.status.slice(1).toLowerCase().replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <h4 className="text-[14px] font-bold text-zinc-900 truncate">
                                                    {order.items[0]?.product.name || "Product"} {order.items.length > 1 && `+ ${order.items.length - 1} more`}
                                                </h4>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-emerald-600">
                                                        <Package size={14} />
                                                        <span className="text-[11px] font-medium">{order.status === 'DELIVERED' ? 'Arrived' : 'In Transit'}</span>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-zinc-400 group-hover:text-[var(--primary-color)] transition-colors">View details →</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center border-2 border-dashed border-zinc-100 rounded-[40px] bg-zinc-50/50">
                                    <ShoppingBag size={48} className="mx-auto text-zinc-200 mb-6" />
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest italic mb-2">{t("noOrdersFound")}</p>
                                    <p className="text-[11px] text-zinc-400 font-bold max-w-xs mx-auto">Start shopping to see your orders appear here!</p>
                                </div>
                            )}
                        </div>
                    )}


                    {activeTab === "address" && (
                        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-xl font-black text-zinc-900 uppercase italic">{t("manageAddresses")}</h2>
                                {!isEditing && (
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2 border-2 border-[var(--primary-color)] text-[var(--primary-color)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--primary-color)]/10 transition-all"
                                    >
                                        {t("editAddress")}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Street Address</label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Flat, House no., Building, Company, Apartment"
                                        className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Area / Landmark</label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={area}
                                        onChange={(e) => setArea(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">City</label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">State</label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all disabled:opacity-60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block ml-1">Pincode</label>
                                    <input 
                                        type="text" 
                                        disabled={!isEditing}
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/10 transition-all disabled:opacity-60"
                                    />
                                </div>
                            </div>

                            {isEditing ? (
                                <div className="flex gap-4">
                                    <button 
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-10 py-4 bg-[var(--primary-color)] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-[var(--primary-color)]/20"
                                    >
                                        {isSaving ? "Saving..." : t("saveAddress")}
                                    </button>
                                    <button 
                                        onClick={() => setIsEditing(false)}
                                        className="px-10 py-4 border-2 border-zinc-200 text-zinc-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                saveSuccess && (
                                    <motion.p 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-6 text-[10px] font-black text-emerald-600 uppercase tracking-widest"
                                    >
                                        ✅ Address saved successfully!
                                    </motion.p>
                                )
                            )}
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-black text-zinc-900 uppercase italic mb-10">{t("myReviews")}</h2>
                            
                            {reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 flex gap-6">
                                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-white border border-zinc-100 flex-shrink-0">
                                                <img 
                                                    src={JSON.parse(review.product.images)[0] || "https://placehold.co/100x100?text=No+Image"} 
                                                    alt={review.product.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{review.product.name}</h3>
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${review.isApproved ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                                                        {review.isApproved ? "Approved" : "Pending"}
                                                    </span>
                                                </div>
                                                <div className="flex gap-0.5 mb-3">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star 
                                                            key={star} 
                                                            size={14} 
                                                            className={star <= review.rating ? "fill-amber-400 text-amber-400" : "text-zinc-200"} 
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-zinc-600 font-bold leading-relaxed italic">"{review.comment}"</p>
                                                <p className="text-[10px] text-zinc-400 mt-4 font-bold">Reviewed on {new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center border-2 border-dashed border-zinc-100 rounded-[40px] bg-zinc-50/50">
                                    <Star size={48} className="mx-auto text-zinc-200 mb-6" />
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest italic mb-2">{t("noReviewsFound")}</p>
                                    <p className="text-[11px] text-zinc-400 font-bold max-w-xs mx-auto">Help other shoppers by sharing your feedback on products you've bought!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "viewed_products" && (
                        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-black text-zinc-900 uppercase italic mb-10">{t("recentlyViewed")}</h2>
                            {recentlyViewed.length > 0 ? (
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {recentlyViewed.map((product) => (
                                        <Link 
                                            key={product.id} 
                                            href={`/s/${product.storeSlug || slug}/products/${product.slug}`}
                                            className="group block"
                                        >
                                            <div className="aspect-square bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 mb-4 group-hover:shadow-xl transition-all relative">
                                                <img 
                                                    src={product.image || "https://placehold.co/300x300?text=No+Image"} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                                />
                                                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                                            </div>
                                            <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-tight group-hover:text-[var(--primary-color)] transition-colors line-clamp-1 italic">{product.name}</h3>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-sm font-black text-zinc-900">₹{product.price}</p>
                                                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">View →</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-20 text-center border-2 border-dashed border-zinc-100 rounded-[40px] bg-zinc-50/50">
                                    <History size={48} className="mx-auto text-zinc-200 mb-6" />
                                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest italic mb-2">{t("noHistoryFound")}</p>
                                    <p className="text-[11px] text-zinc-400 font-bold max-w-xs mx-auto">Click on products to see them appear here!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-black text-zinc-900 uppercase italic mb-10">{t("notifications")}</h2>
                            <div className="space-y-6 max-w-xl">
                                {[
                                    { id: 'email', label: 'Email Notifications', desc: 'Get order updates and promo deals via email', state: emailNotif, setter: setEmailNotif },
                                    { id: 'sms', label: 'SMS Notifications', desc: 'Get critical alerts via text message', state: smsNotif, setter: setSmsNotif },
                                    { id: 'orders', label: 'Order Updates', desc: 'Real-time updates on your active orders', state: orderUpdates, setter: setOrderUpdates },
                                ].map((item) => (
                                    <div key={item.id} className="flex items-start justify-between p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{item.label}</h3>
                                            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-loose">{item.desc}</p>
                                        </div>
                                        <button 
                                            onClick={() => item.setter(!item.state)}
                                            className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${item.state ? 'bg-[var(--primary-color)]' : 'bg-zinc-300'}`}
                                        >
                                            <motion.div 
                                                animate={{ x: item.state ? 24 : 0 }}
                                                className="w-4 h-4 bg-white rounded-full shadow-md"
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "language" && (
                        <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-black text-zinc-900 uppercase italic mb-10">{t("selectLanguage")}</h2>
                            <div className="space-y-4">
                                {(["English", "Tamil", "Hindi"] as const).map((lang) => (
                                    <button 
                                        key={lang}
                                        onClick={() => setLanguage(lang)}
                                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${language === lang ? "bg-[var(--primary-color)]/10 border-[var(--primary-color)]/30" : "bg-white border-zinc-100 hover:border-zinc-200"}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${language === lang ? "border-[var(--primary-color)]" : "border-zinc-300"}`}>
                                                {language === lang && <div className="w-2.5 h-2.5 bg-[var(--primary-color)] rounded-full" />}
                                            </div>
                                            <span className={`font-bold ${language === lang ? "text-[var(--primary-color)]/90" : "text-zinc-600"}`}>{lang}</span>
                                        </div>
                                        {language === lang && <div className="text-[10px] font-black text-[var(--primary-color)] uppercase tracking-widest">{t("active")}</div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <TrackingModal 
                order={selectedOrderForTracking} 
                isOpen={!!selectedOrderForTracking} 
                onClose={() => setSelectedOrderForTracking(null)} 
            />
        </div>
    )
}
