"use client"

import { useState, useEffect, use, ReactNode } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CheckCircle, ShieldCheck, CreditCard, Banknote, Loader2, MapPin, Mail, Phone, User, AlertCircle, QrCode, Upload, Truck, Package } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { formatPrice } from "../utils"
import { useCart } from "@/context/CartContext"

declare global {
    interface Window {
        Razorpay: any
    }
}

export default function CheckoutPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const resolvedParams = use(params)
    const slug = resolvedParams.slug
    const router = useRouter()
    const { data: session } = useSession()
    const [paymentMethod, setPaymentMethod] = useState<"CARD" | "COD" | "UPI">("CARD")
    const [upiUTR, setUpiUTR] = useState("")
    const [upiProofImage, setUpiProofImage] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [orderComplete, setOrderComplete] = useState(false)
    const [orderNumber, setOrderNumber] = useState("")
    const [storeSettings, setStoreSettings] = useState<any>(null)
    const [allShippingMethods, setAllShippingMethods] = useState<any[]>([])
    const [shippingMethods, setShippingMethods] = useState<any[]>([])
    const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
    const [error, setError] = useState<ReactNode | string | null>(null)
    
    const [initialLoading, setInitialLoading] = useState(true)
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
        if (!initialLoading && cartItems.length === 0 && !orderComplete) {
            const timer = setTimeout(() => {
                if (cartItems.length === 0) {
                    router.push(`/s/${slug}/products`) 
                }
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [cartItems, initialLoading, orderComplete, slug, router])

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const res = await fetch(`/api/store-info?slug=${slug}`)
                const data = await res.json()
                if (data.themeConfig) {
                    const config = JSON.parse(data.themeConfig)
                    setStoreSettings({ ...data, enableCOD: config.enableCOD })
                } else {
                    setStoreSettings(data)
                }

                // Fetch shipping methods
                const shipRes = await fetch(`/api/s/${slug}/shipping`)
                if (shipRes.ok) {
                    const { methods, store: storeInfo } = await shipRes.json()
                    setAllShippingMethods(methods)
                    setStoreSettings((prev: any) => ({ ...prev, ...storeInfo }))
                    
                    // Initial filtering if state is already present
                    setShippingMethods(methods) 
                    if (methods.length > 0) {
                        setSelectedMethodId(methods[0].id)
                    }
                }
            } catch (error) {
                console.error("Error fetching store data:", error)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchStoreData()
    }, [slug])
    
    // 1. Fetch initial store and shipping data
    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const res = await fetch(`/api/store-info?slug=${slug}`)
                const data = await res.json()
                if (data.themeConfig) {
                    const config = JSON.parse(data.themeConfig)
                    setStoreSettings({ ...data, enableCOD: config.enableCOD })
                } else {
                    setStoreSettings(data)
                }

                const shipRes = await fetch(`/api/s/${slug}/shipping`)
                if (shipRes.ok) {
                    const { methods, store: storeInfo } = await shipRes.json()
                    setAllShippingMethods(methods)
                    setStoreSettings((prev: any) => ({ ...prev, ...storeInfo }))
                    // Set initial methods
                    setShippingMethods(methods)
                }
            } catch (error) {
                console.error("Error fetching store data:", error)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchStoreData()
    }, [slug])

    // 2. Filter shipping methods based on user address (State/City)
    useEffect(() => {
        if (allShippingMethods.length === 0) return

        const currentState = formData.state.toLowerCase().trim()
        const currentCity = formData.city.toLowerCase().trim()

        const filtered = allShippingMethods.filter(method => {
            // Min Order check
            if (method.minOrderValue && totalPrice < method.minOrderValue) return false

            // Region Check (District level or State level)
            if (Array.isArray(method.regions) && method.regions.length > 0) {
                return method.regions.some((r: string) => {
                    const region = r.toLowerCase().trim()
                    if (region === currentState) return true
                    if (region === `${currentState}: ${currentCity}`) return true
                    return false
                })
            }
            
            // Methods without specific regions are global
            return true
        })

        setShippingMethods(filtered)

        // Select default if none or invalid
        if (filtered.length > 0) {
            const stillValid = filtered.find(m => m.id === selectedMethodId)
            if (!stillValid) setSelectedMethodId(filtered[0].id)
        } else {
            setSelectedMethodId(null)
        }
    }, [formData.state, formData.city, totalPrice, allShippingMethods])

    const selectedShipping = shippingMethods.find(m => m.id === selectedMethodId)
    const shippingCost = selectedShipping?.rate || 0
    const finalTotal = totalPrice + shippingCost

    const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        const uploadData = new FormData()
        uploadData.append("file", file)

        try {
            const res = await fetch("/api/checkout/upload", {
                method: "POST",
                body: uploadData
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

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = "https://checkout.razorpay.com/v1/checkout.js"
            script.onload = () => resolve(true)
            script.onerror = () => resolve(false)
            document.body.appendChild(script)
        })
    }

    const handleRazorpayPayment = async (orderData: any) => {
        const res = await loadRazorpayScript()
        if (!res) {
            setError("Razorpay SDK failed to load. Are you online?")
            return
        }

        const orderResponse = await fetch("/api/checkout/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                amount: finalTotal,
                currency: storeSettings?.currency || "INR",
                storeId: storeSettings?.id
            })
        })

        const razorpayOrder = await orderResponse.json()
        if (!orderResponse.ok) {
            setError(razorpayOrder.error || "Failed to initiate payment")
            return
        }

        const options = {
            key: razorpayOrder.key,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: storeSettings?.name || "Qicmart Store",
            description: `Order at ${storeSettings?.name}`,
            image: storeSettings?.logo || "",
            order_id: razorpayOrder.id,
            handler: async (response: any) => {
                setIsSubmitting(true)
                try {
                    const checkoutRes = await fetch("/api/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            ...orderData,
                            paymentMethod: "RAZORPAY",
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        })
                    })

                    const checkoutData = await checkoutRes.json()
                    
                    if (checkoutRes.ok) {
                        const verifyRes = await fetch("/api/checkout/razorpay/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                orderId: checkoutData.id
                            })
                        })

                        if (verifyRes.ok) {
                            clearCart()
                            setOrderNumber(checkoutData.orderNumber)
                            setOrderComplete(true)
                        } else {
                            setError("Payment verification failed. Please contact support.")
                        }
                    } else {
                        setError(checkoutData.error || "Failed to save order details")
                    }
                } catch (err) {
                    setError("An error occurred during payment verification")
                } finally {
                    setIsSubmitting(false)
                }
            },
            prefill: {
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                contact: formData.phone,
            },
            theme: {
                color: "var(--primary-color)",
            },
        }

        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsSubmitting(true)

        const orderData = {
            slug,
            userId: (session?.user as any)?.id || null,
            formData,
            items: cartItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                options: item.options
            })),
            paymentMethod,
            total: finalTotal,
            shippingCost,
            carrier: selectedShipping?.name,
            shippingMethodId: selectedMethodId,
            upiUTR,
            upiProofImage
        }

        try {
            if (paymentMethod === "CARD") {
                await handleRazorpayPayment(orderData)
                setIsSubmitting(false) // Reset but actual success handled in handler
                return
            }

            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            })

            const data = await res.json()
            if (data.ok) {
                setOrderNumber(data.orderNumber)
                setOrderComplete(true)
                clearCart()
            } else {
                setError(data.error || "Checkout failed. Please try again.")
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
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-2">Order Confirmed!</h2>
                        <p className="text-sm sm:text-base text-zinc-500 mb-8 max-w-xs mx-auto font-medium">
                            Thank you for your purchase. We've received your order and will email you the receipt soon.
                        </p>
                        
                        <div className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 mb-8 w-full max-w-xs mx-auto">
                            <p className="text-[10px] font-bold text-zinc-400 mb-1">Order Number</p>
                            <p className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">#ORD-{orderNumber}</p>
                        </div>

                        <div className="pt-2 space-y-3">
                            <Link
                                href={`/s/${slug}/profile?tab=orders`}
                                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                View My Orders
                            </Link>
                            <Link
                                href={`/s/${slug}`}
                                className="w-full flex justify-center py-4 px-6 border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-600 bg-white hover:bg-zinc-50 transition-all"
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
                    <div className="lg:col-span-7 xl:col-span-8">
                        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-8">Checkout</h1>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={20} />
                                <div className="text-sm font-bold">{error}</div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Contact Information */}
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                                    <User className="text-zinc-400" size={20} /> Contact Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">First Name</label>
                                        <input type="text" required value={formData.firstName} onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none" placeholder="Arun" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Last Name</label>
                                        <input type="text" required value={formData.lastName} onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none" placeholder="Kumar" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Email Address</label>
                                        <input type="email" required value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none" placeholder="arun@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Phone Number</label>
                                        <input type="tel" required value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none" placeholder="+91 98765 43210" />
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                                    <MapPin className="text-zinc-400" size={20} /> Shipping Address
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Address line</label>
                                        <input type="text" required value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none" placeholder="No. 12, Anna Nagar Main Road" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Apartment, suite, etc.</label>
                                        <input type="text" value={formData.apartment} onChange={e => setFormData(f => ({ ...f, apartment: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none" placeholder="Apt 4B" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">City</label>
                                        <input type="text" required value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none" placeholder="Chennai" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">State</label>
                                        <input type="text" required value={formData.state} onChange={e => setFormData(f => ({ ...f, state: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none" placeholder="Tamil Nadu" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 mb-2">Postal code</label>
                                        <input type="text" required value={formData.zip} onChange={e => setFormData(f => ({ ...f, zip: e.target.value }))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-[var(--primary-color)] outline-none" placeholder="600040" />
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Shipping Selection - TN Style UX */}
                            {shippingMethods.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
                                    <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                                        <Truck className="text-zinc-400" size={20} /> Shipping Method
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {shippingMethods.map((method) => (
                                            <div 
                                                key={method.id}
                                                onClick={() => setSelectedMethodId(method.id)}
                                                className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                                    selectedMethodId === method.id 
                                                        ? 'border-indigo-600 bg-indigo-50/50' 
                                                        : 'border-zinc-100 hover:border-zinc-200 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                            selectedMethodId === method.id ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-400'
                                                        }`}>
                                                            {method.zoneType === 'PICKUP' ? <MapPin size={16} /> : <Truck size={16} />}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-zinc-900">{method.name}</span>
                                                            {method.zoneType === 'PICKUP' && (
                                                                <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                                                                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" /> Local Pickup Available
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="font-black text-indigo-600">{formatPrice(method.rate, storeSettings?.currency)}</span>
                                                </div>
                                                <p className="text-xs text-zinc-500 font-medium ml-11">
                                                    {method.zone || 'Worldwide'} delivery
                                                </p>
                                                {selectedMethodId === method.id && (
                                                    <div className="absolute top-3 right-3">
                                                        <CheckCircle size={16} className="text-indigo-600" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment Method */}
                            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
                                <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center justify-between">
                                    Payment Method
                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                    {storeSettings?.isRazorpayEnabled && (
                                        <button type="button" onClick={() => setPaymentMethod("CARD")} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === "CARD" ? "border-indigo-600 bg-indigo-50" : "border-zinc-100 hover:border-zinc-200"}`}>
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === "CARD" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                                                <CreditCard size={20} />
                                            </div>
                                            <div className="text-left font-bold text-zinc-900">Online Payment</div>
                                        </button>
                                    )}

                                    <button type="button" onClick={() => setPaymentMethod("COD")} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === "COD" ? "border-emerald-600 bg-emerald-50" : "border-zinc-100 hover:border-zinc-200"}`}>
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === "COD" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                                            <Banknote size={20} />
                                        </div>
                                        <div className="text-left font-bold text-zinc-900">COD</div>
                                    </button>

                                    {storeSettings?.isUpiEnabled && (
                                        <button type="button" onClick={() => setPaymentMethod("UPI")} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === "UPI" ? "border-indigo-600 bg-indigo-50" : "border-zinc-100 hover:border-zinc-200"}`}>
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === "UPI" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-400"}`}>
                                                <QrCode size={20} />
                                            </div>
                                            <div className="text-left font-bold text-zinc-900">UPI QR</div>
                                        </button>
                                    )}
                                </div>

                                {paymentMethod === "CARD" ? (
                                    <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] flex flex-col items-center text-center">
                                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                                            <CreditCard size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-indigo-900 tracking-tight mb-2">Secure Online Payment</h3>
                                        <p className="text-xs text-indigo-600 font-bold max-w-xs leading-relaxed">
                                            You will be redirected to Razorpay's secure checkout.
                                        </p>
                                    </div>
                                ) : paymentMethod === "COD" ? (
                                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-4">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                            <Banknote size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-emerald-900 mb-1">COD Selected</p>
                                            <p className="text-xs text-emerald-700">Pay cash on delivery.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[32px] space-y-8 flex flex-col items-center">
                                        <div className="text-center space-y-2">
                                            <h3 className="font-bold text-indigo-900">Scan to Pay</h3>
                                            <p className="text-[10px] text-indigo-600 font-bold">Pay {formatPrice(finalTotal, storeSettings?.currency)} via UPI</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-indigo-500/20 border border-zinc-100">
                                            {storeSettings?.upiId ? (
                                                <QRCodeCanvas value={`upi://pay?pa=${storeSettings.upiId}&pn=${encodeURIComponent(storeSettings.upiName || storeSettings.name)}&am=${(finalTotal).toFixed(2)}&cu=INR`} size={220} level="H" />
                                            ) : <div className="text-zinc-400 italic text-xs">UPI not configured.</div>}
                                        </div>
                                        <div className="flex flex-col gap-4 w-full max-w-sm">
                                            <input type="text" value={upiUTR} onChange={(e) => setUpiUTR(e.target.value)} placeholder="Enter UTR" className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-xl text-xs outline-none" />
                                            <div onClick={() => document.getElementById('proof-upload')?.click()} className="w-full py-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-white">
                                                {isUploading ? <Loader2 size={24} className="animate-spin text-indigo-500" /> : upiProofImage ? <CheckCircle size={24} className="text-emerald-500" /> : <Upload size={24} className="text-indigo-400" />}
                                                <span className="text-[10px] font-bold text-indigo-500">{upiProofImage ? "Uploaded" : "Click to Upload"}</span>
                                                <input id="proof-upload" type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center px-8 py-5 bg-zinc-900 hover:bg-zinc-800 text-white text-lg font-bold rounded-xl transition-all shadow-xl disabled:opacity-70">
                                {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                                {paymentMethod === "COD" ? "Confirm COD" : paymentMethod === "UPI" ? "Confirm UPI" : `Pay ${formatPrice(finalTotal, storeSettings?.currency)}`}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-5 xl:col-span-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-zinc-900 mb-6">Order Summary</h2>
                            <ul className="divide-y divide-zinc-200 mb-6">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="py-4 flex">
                                        <div className="flex-shrink-0 w-16 h-16 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex justify-between text-sm font-medium text-zinc-900">
                                                <h3 className="line-clamp-1">{item.name}</h3>
                                                <p>{formatPrice(item.price * item.quantity, storeSettings?.currency)}</p>
                                            </div>
                                            <p className="mt-1 text-xs text-zinc-500">Qty {item.quantity}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="space-y-4 border-t border-zinc-200 pt-6">
                                <div className="flex justify-between text-sm text-zinc-600"><span>Subtotal</span><span>{formatPrice(totalPrice, storeSettings?.currency)}</span></div>
                                <div className="flex justify-between text-sm text-zinc-600"><span>Shipping</span><span>{formatPrice(shippingCost, storeSettings?.currency)}</span></div>
                                <div className="flex justify-between text-lg font-bold text-zinc-900 pt-4 border-t border-zinc-200"><span>Total</span><span>{formatPrice(finalTotal, storeSettings?.currency)}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
