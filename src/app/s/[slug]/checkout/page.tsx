"use client"

import { useState, useEffect, use, ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CheckCircle, ShieldCheck, CreditCard, Banknote, Loader2, MapPin, Mail, Phone, User, AlertCircle, QrCode, Upload } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { formatPrice } from "../utils"
import { useCart } from "@/context/CartContext"

export default function CheckoutPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const resolvedParams = use(params)
    const slug = resolvedParams.slug
    const router = useRouter()
    const { data: session, status } = useSession()
    const [paymentMethod, setPaymentMethod] = useState<"CARD" | "COD" | "UPI">("CARD")
    const [upiUTR, setUpiUTR] = useState("")
    const [upiProofImage, setUpiProofImage] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [orderComplete, setOrderComplete] = useState(false)
    const [orderNumber, setOrderNumber] = useState("")
    const [storeSettings, setStoreSettings] = useState<any>(null)
    const [error, setError] = useState<ReactNode | string | null>(null)
    
    const [initialLoading, setInitialLoading] = useState(true) // Renamed original 'loading' to 'initialLoading'
    const { items: cartItems, totalPrice, clearCart } = useCart()
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        apartment: "",
        city: "",
        state: "",
        zip: "",
    })

    useEffect(() => {
        // If cart is empty, redirect back to shop
        if (!initialLoading && cartItems.length === 0 && !orderComplete) { // Use initialLoading here
            const timer = setTimeout(() => {
                if (cartItems.length === 0) {
                    router.push(`/s/${slug}/products`) 
                }
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [cartItems, initialLoading, orderComplete, slug, router]) // Update dependency

    useEffect(() => {
        // In a real app, we'd fetch store settings here via the domain
        const fetchStoreData = async () => {
            try {
                const res = await fetch(`/api/store-info?slug=${slug}`)
                const data = await res.json()
                console.log("Fetched Store Data:", data)
                if (data.themeConfig) {
                    const config = JSON.parse(data.themeConfig)
                    setStoreSettings({ ...data, enableCOD: config.enableCOD })
                } else {
                    setStoreSettings(data)
                }
            } catch (error) {
                console.error("Error fetching store data:", error)
            } finally {
                setInitialLoading(false) // Use setInitialLoading here
            }
        }
        fetchStoreData()
    }, [slug])

    const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/checkout/upload", {
                method: "POST",
                body: formData
            })
            const data = await res.json()
            if (data.url) {
                setUpiProofImage(data.url)
            }
        } catch (error) {
            console.error("Upload error:", error)
            alert("Failed to upload payment proof. Please try again.")
        } finally {
            setIsUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => { // Renamed handleCheckout to handleSubmit
        e.preventDefault()
        setIsSubmitting(true) // Changed setSubmitting to setIsSubmitting

        try {
            setError(null)
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    slug,
                    userId: (session?.user as any)?.id || null, // Pass the logged-in user ID
                    formData,
                    items: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        options: item.options
                    })),
                    paymentMethod,
                    total: totalPrice + (totalPrice > 0 ? 50 : 0) // Subtotal + Shipping
                })
            })

            const data = await res.json()
            if (data.ok) {
                setOrderNumber(data.orderNumber)
                setOrderComplete(true)
                clearCart()
            } else {
                if (data.error?.includes("Product not found")) {
                    setError(
                        <div className="space-y-4">
                            <p>{data.error}</p>
                            <p className="text-xs text-zinc-500">Your cart may contain items that were recently removed or modified. Please clear your cart and try adding the products again.</p>
                            <button 
                                onClick={() => {
                                    clearCart()
                                    window.location.reload()
                                }}
                                className="w-full py-3 bg-[var(--primary-color)] text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all"
                            >
                                Clear Cart & Refresh Page
                            </button>
                        </div>
                    )
                } else {
                    setError(data.error || "Checkout failed. Please try again.")
                }
            }
        } catch (error: any) {
            console.error("Checkout failed:", error)
            setError("Something went wrong. Please check your connection and try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (initialLoading) {
        return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-400" /></div>
    }

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-lg">
                    <div className="bg-white py-8 px-6 sm:py-12 sm:px-10 shadow-2xl rounded-[2rem] sm:rounded-3xl border border-zinc-200 text-center relative overflow-hidden animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-2">
                            <DotLottieReact
                                src="https://lottie.host/52fc8dd0-9e50-40bd-8118-14497cf5350b/WLOtsLuvsy.lottie"
                                loop
                                autoplay
                            />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 mb-2">Order Confirmed!</h2>
                        <p className="text-sm sm:text-base text-zinc-500 mb-8 max-w-xs mx-auto">
                            Thank you for your purchase. We've received your order and will email you the receipt soon.
                        </p>
                        
                        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 mb-8 w-full max-w-xs mx-auto">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Order Number</p>
                            <p className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">#ORD-{orderNumber}</p>
                        </div>

                        <div className="pt-2">
                            <Link
                                href={`/s/${slug}`}
                                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-xl text-xs font-black uppercase tracking-widest text-white bg-[var(--primary-color)] hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Return to Store
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-zinc-50 min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Checkout Form */}
                    <div className="lg:col-span-7 xl:col-span-8">
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-8">Checkout</h1>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} />
                                <p className="text-sm font-bold">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Contact Information */}
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2"><User className="text-zinc-400" size={20} /> Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">First Name</label>
                                        <input type="text" required value={formData.firstName} onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all placeholder:text-zinc-500" placeholder="Arun" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Last Name</label>
                                        <input type="text" required value={formData.lastName} onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all placeholder:text-zinc-500" placeholder="Kumar" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Email Address</label>
                                        <input type="email" required value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all placeholder:text-zinc-500" placeholder="arun@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Phone Number</label>
                                        <input type="tel" required value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all placeholder:text-zinc-500" placeholder="+91 98765 43210" />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2"><MapPin className="text-zinc-400" size={20} /> Shipping Address</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Address line</label>
                                        <input type="text" required value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all placeholder:text-zinc-500" placeholder="No. 12, Anna Nagar Main Road" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Apartment, suite, etc.</label>
                                        <input type="text" value={formData.apartment} onChange={e => setFormData(f => ({ ...f, apartment: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all placeholder:text-zinc-500" placeholder="Apt 4B" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">City</label>
                                        <input type="text" required value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all placeholder:text-zinc-500" placeholder="Chennai" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">State / Province</label>
                                        <input type="text" required value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all placeholder:text-zinc-500" placeholder="Tamil Nadu" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Postal code</label>
                                        <input type="text" required value={formData.zip} onChange={e => setFormData(f => ({ ...f, zip: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)] outline-none transition-all placeholder:text-zinc-500" placeholder="600040" />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-zinc-900">Payment Method</h2>
                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("CARD")}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === "CARD" ? "border-[var(--primary-color)] bg-[var(--primary-color)]/5" : "border-zinc-100 hover:border-zinc-200"}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === "CARD" ? "bg-[var(--primary-color)] text-white" : "bg-zinc-100 text-zinc-400"}`}>
                                            <CreditCard size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-zinc-900">Credit Card</p>
                                            <p className="text-xs text-zinc-500">Secure Payment</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("COD")}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === "COD" ? "border-emerald-600 bg-emerald-50/50" : "border-zinc-100 hover:border-zinc-200"}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === "COD" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                                            <Banknote size={20} />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-zinc-900">Cash on Delivery</p>
                                            <p className="text-xs text-zinc-500">Pay at doorstep</p>
                                        </div>
                                    </button>

                                    {storeSettings?.isUpiEnabled && (
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("UPI")}
                                            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === "UPI" ? "border-indigo-600 bg-indigo-50/50" : "border-zinc-100 hover:border-zinc-200"}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === "UPI" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                                                <QrCode size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-bold text-zinc-900">UPI QR Payment</p>
                                                <p className="text-xs text-zinc-500">Scan & Pay Now</p>
                                            </div>
                                        </button>
                                    )}
                                </div>

                                {paymentMethod === "CARD" ? (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center">
                                            <span className="text-xs font-medium text-zinc-500 w-full text-center">
                                                [Credit card processing is simulated for this demo]
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60 pointer-events-none">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-zinc-700 mb-2">Card Number</label>
                                                <input type="text" readOnly value="**** **** **** 4242" className="w-full px-4 py-3 bg-zinc-100 border border-zinc-300 rounded-xl cursor-not-allowed text-zinc-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 mb-2">Expiration Date (MM/YY)</label>
                                                <input type="text" readOnly value="12/26" className="w-full px-4 py-3 bg-zinc-100 border border-zinc-300 rounded-xl cursor-not-allowed text-zinc-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-zinc-700 mb-2">CVC</label>
                                                <input type="text" readOnly value="***" className="w-full px-4 py-3 bg-zinc-100 border border-zinc-300 rounded-xl cursor-not-allowed text-zinc-500" />
                                            </div>
                                        </div>
                                    </div>
                                ) : paymentMethod === "COD" ? (
                                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Banknote size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-900 mb-1">COD Selected</p>
                                            <p className="text-xs text-emerald-700 leading-relaxed">
                                                You will pay for your order in cash at the time of delivery. Please ensure you have the correct change ready for the delivery partner.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] space-y-8 flex flex-col items-center">
                                        <div className="text-center space-y-2">
                                            <h3 className="font-black text-indigo-900 uppercase tracking-tight italic">Scan to Pay</h3>
                                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Pay {formatPrice(totalPrice + 50, storeSettings?.currency)} directly via any UPI App</p>
                                        </div>

                                        <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-indigo-500/20 border border-zinc-100">
                                            {storeSettings?.upiId ? (
                                                <QRCodeCanvas 
                                                    value={`upi://pay?pa=${storeSettings.upiId}&pn=${encodeURIComponent(storeSettings.upiName || storeSettings.name)}&am=${(totalPrice + 50).toFixed(2)}&cu=INR&tn=Order+at+${storeSettings.name}`}
                                                    size={220}
                                                    level="H"
                                                />
                                            ) : (
                                                <div className="w-[220px] h-[220px] flex items-center justify-center text-zinc-400 italic font-medium text-xs text-center px-8">
                                                    UPI is currently being configured. Please try again later.
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                                            <a 
                                                href={`upi://pay?pa=${storeSettings?.upiId}&pn=${encodeURIComponent(storeSettings?.upiName || storeSettings?.name || "")}&am=${(totalPrice + 50).toFixed(2)}&cu=INR&tn=Order+at+${storeSettings?.name}`}
                                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                                            >
                                                <QrCode size={16} /> Open in UPI App
                                            </a>
                                            
                                            <div className="w-full space-y-4 pt-4 border-t border-indigo-200/50">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase text-indigo-900 tracking-widest mb-2">UTR / Transaction ID</label>
                                                    <input 
                                                        type="text" 
                                                        value={upiUTR}
                                                        onChange={(e) => setUpiUTR(e.target.value)}
                                                        placeholder="Enter 12-digit UTR"
                                                        className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                                                    />
                                                </div>

                                                <div className="relative">
                                                    <label className="block text-[10px] font-black uppercase text-indigo-900 tracking-widest mb-2">Upload Proof (Screenshot)</label>
                                                    <div 
                                                        onClick={() => document.getElementById('proof-upload')?.click()}
                                                        className={`w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${upiProofImage ? 'border-emerald-500 bg-emerald-50' : 'border-indigo-200 hover:border-indigo-400 bg-white'}`}
                                                    >
                                                        {isUploading ? (
                                                            <Loader2 size={24} className="animate-spin text-indigo-500" />
                                                        ) : upiProofImage ? (
                                                            <>
                                                                <CheckCircle size={24} className="text-emerald-500" />
                                                                <span className="text-[10px] font-bold text-emerald-700 uppercase">Proof Uploaded!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload size={24} className="text-indigo-400" />
                                                                <span className="text-[10px] font-bold text-indigo-500 uppercase">Click to Upload</span>
                                                            </>
                                                        )}
                                                        <input 
                                                            id="proof-upload"
                                                            type="file" 
                                                            accept="image/*"
                                                            onChange={handleProofUpload}
                                                            className="hidden"
                                                        />
                                                    </div>
                                                    {upiProofImage && (
                                                        <p className="text-[10px] text-emerald-600 mt-2 font-medium flex items-center gap-1.5">
                                                            <CheckCircle size={10} /> Image successfully attached to order
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-[10px] font-medium text-indigo-500 text-center leading-relaxed">
                                                After payment and uploading proof, click the confirm button below.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex items-center justify-center px-8 py-5 bg-zinc-900 hover:bg-zinc-800 text-white text-lg font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-70 disabled:translate-y-0"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
                                    {paymentMethod === "COD" ? "Confirm COD Order" : paymentMethod === "UPI" ? "Confirm & Place Order" : `Confirm Order & Pay ${formatPrice(totalPrice + 50, storeSettings?.currency)}`}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-zinc-900 mb-6">Order Summary</h2>

                            <ul className="divide-y divide-zinc-200 mb-6">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="py-4 flex">
                                        <div className="flex-shrink-0 w-16 h-16 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="ml-4 flex-1 flex flex-col justify-center">
                                            <div className="flex justify-between text-sm font-medium text-zinc-900">
                                                <h3 className="line-clamp-1">{item.name}</h3>
                                                <p>{formatPrice(item.price * item.quantity, storeSettings?.currency)}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {item.options && Object.entries(item.options).map(([name, value]) => (
                                                    <span key={name} className="px-1.5 py-0.5 bg-zinc-50 border border-zinc-100 rounded text-[10px] text-zinc-500 font-bold uppercase">{name}: {value}</span>
                                                ))}
                                            </div>
                                            <p className="mt-1 text-sm text-zinc-500 font-medium italic">Qty {item.quantity}</p>
                                        </div>
                                    </li>
                                ))}
                                {cartItems.length === 0 && (
                                    <div className="py-8 text-center text-zinc-400 text-sm italic">
                                        Your cart is empty.
                                    </div>
                                )}
                            </ul>

                            <div className="space-y-4 border-t border-zinc-200 pt-6 mb-6">
                                <div className="flex justify-between text-sm text-zinc-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-zinc-900">{formatPrice(totalPrice, storeSettings?.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-zinc-600">
                                    <span>Shipping</span>
                                    <span className="font-medium text-zinc-900">{formatPrice(totalPrice > 0 ? 50 : 0, storeSettings?.currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-zinc-600">
                                    <span>Taxes</span>
                                    <span className="font-medium text-zinc-900">{formatPrice(0.00, storeSettings?.currency)}</span>
                                </div>
                            </div>

                            <div className="border-t border-zinc-200 pt-6 flex justify-between items-center bg-zinc-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                                <span className="text-lg font-bold text-zinc-900">Total</span>
                                <span className="text-2xl font-extrabold text-zinc-900">{formatPrice(totalPrice + (totalPrice > 0 ? 50 : 0), storeSettings?.currency)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
