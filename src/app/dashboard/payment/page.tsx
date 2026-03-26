"use client"

import { useState, useEffect } from "react"
import {
    Check, Loader2, RefreshCw, Info, Shield,
    ExternalLink, Save, QrCode, CreditCard
} from "lucide-react"
import { useSession } from "next-auth/react"
import { QRCodeCanvas } from "qrcode.react"
import { toast } from "sonner"

interface PaymentSettings {
    name: string
    currency: string
    // Razorpay settings
    razorpayKeyId?: string | null
    razorpayKeySecret?: string | null
    razorpayWebhookSecret?: string | null
    isRazorpayEnabled?: boolean
    upiId?: string | null
    upiName?: string | null
    isUpiEnabled?: boolean
}

export default function PaymentPage() {
    const [settings, setSettings] = useState<PaymentSettings>({
        name: "",
        currency: "INR",
        upiId: "",
        upiName: "",
        isUpiEnabled: false,
        razorpayKeyId: "",
        razorpayKeySecret: "",
        razorpayWebhookSecret: "",
        isRazorpayEnabled: false,
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const { data: session } = useSession()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"

        fetch(url)
            .then(r => r.json())
            .then(data => {
                setSettings({
                    name: data.name || "",
                    currency: data.currency || "INR",
                    razorpayKeyId: data.razorpayKeyId || "",
                    razorpayKeySecret: data.razorpayKeySecret || "",
                    razorpayWebhookSecret: data.razorpayWebhookSecret || "",
                    isRazorpayEnabled: data.isRazorpayEnabled || false,
                    upiId: data.upiId || "",
                    upiName: data.upiName || "",
                    isUpiEnabled: data.isUpiEnabled || false,
                })
                setLoading(false)
            })
            .catch(err => {
                console.error("Failed to fetch settings", err)
                setLoading(false)
            })
    }, [])

    const handleSave = async () => {
        const params = new URLSearchParams(window.location.search)
        const ownerId = params.get("ownerId")
        const url = ownerId ? `/api/dashboard/settings?ownerId=${ownerId}` : "/api/dashboard/settings"

        setSaving(true)
        try {
            const res = await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            })
            const data = await res.json()
            setSaving(false)
            if (res.ok) {
                setSaved(true)
                toast.success("Payment settings saved successfully")
                setTimeout(() => setSaved(false), 3000)
            } else {
                toast.error(data.error || "Failed to save settings")
            }
        } catch (e: any) {
            setSaving(false)
            toast.error("A network error occurred. Please try again.")
        }
    }

    const update = (key: keyof PaymentSettings, val: any) => setSettings(s => ({ ...s, [key]: val }))

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4 text-zinc-500">
            <Loader2 className="animate-spin text-indigo-500" size={32} /> 
            <p className="font-medium tracking-tight">Loading payment settings...</p>
        </div>
    )

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in">
            {/* Action Bar (Top) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-black dark:text-white capitalize truncate">Payment Methods</h2>
                        <span className="hidden sm:inline-flex px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold capitalize border border-emerald-500/20 whitespace-nowrap">
                            Secure Integration
                        </span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-xs sm:text-sm font-medium tracking-normal">Configure how you receive payments from customers.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`group flex items-center justify-center gap-3 px-8 sm:px-12 py-3.5 rounded-2xl text-[10px] font-bold capitalize transition-all shadow-xl active:scale-95 ${
                            saved ? "bg-emerald-500 text-white" : "bg-indigo-600 dark:bg-white text-white dark:text-black hover:opacity-90 transition-all shadow-indigo-500/10"
                        } disabled:opacity-60`}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save className="group-hover:scale-110 transition-transform" size={16} />}
                        {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
                    </button>
                </div>
            </div>

            <div className="space-y-12">
                {/* UPI Payment Configuration */}
                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5 mt-4">
                    <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <QrCode size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl text-black dark:text-white capitalize">UPI Payment Integration</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium capitalize">Accept direct payments via UPI QR</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize border transition-all ${settings.isUpiEnabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                                {settings.isUpiEnabled ? "Active" : "Disabled"}
                            </span>
                            <button 
                                onClick={() => update("isUpiEnabled", !settings.isUpiEnabled)}
                                className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 ${settings.isUpiEnabled ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.isUpiEnabled ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-semibold text-zinc-400 capitalize">UPI ID (VPA)</label>
                                    <input 
                                        value={settings.upiId || ""} 
                                        onChange={e => update("upiId", e.target.value)}
                                        placeholder="yourname@upi"
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-semibold text-zinc-400 capitalize">Payee / Merchant Name</label>
                                    <input 
                                        value={settings.upiName || ""} 
                                        onChange={e => update("upiName", e.target.value)}
                                        placeholder="e.g. My Awesome Shop"
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="p-6 bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl flex gap-4 items-start border border-indigo-100 dark:border-indigo-500/10">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                                        <Info size={18} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-400 capitalize">Direct Settlement</p>
                                        <p className="text-[10px] font-medium text-indigo-600/80 leading-relaxed italic">
                                            UPI payments go directly to your bank account. You'll need to manually confirm these orders in the dashboard after verifying the payment in your UPI app.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800/20 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-800/50 flex flex-col items-center justify-center space-y-6">
                                <div className="text-center space-y-2 mb-4">
                                    <h4 className="font-bold text-base text-black dark:text-white capitalize italic">Live Preview</h4>
                                    <p className="text-xs text-zinc-400 font-medium tracking-normal">This QR will be shown to customers at checkout</p>
                                </div>
                                
                                <div className="bg-white p-6 rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-zinc-100 relative group overflow-hidden">
                                    {settings.upiId ? (
                                        <QRCodeCanvas 
                                            value={`upi://pay?pa=${settings.upiId}&pn=${encodeURIComponent(settings.upiName || settings.name)}&am=1.00&cu=INR`}
                                            size={180}
                                            level="H"
                                            includeMargin={false}
                                        />
                                    ) : (
                                        <div className="w-[180px] h-[180px] flex flex-col items-center justify-center text-zinc-300 gap-3 italic">
                                            <QrCode size={48} className="opacity-20" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-center px-4">Enter UPI ID to preview QR</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>                                 
                                <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold capitalize border border-emerald-500/20">
                                     <Shield size={10} /> Dynamic QR Generation Active
                                 </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Razorpay Configuration */}
                <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-xl hover:shadow-indigo-500/5">
                    <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                                <RefreshCw size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl text-black dark:text-white capitalize">Razorpay Integration</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-medium capitalize">Connect your business to the world</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize border transition-all ${settings.isRazorpayEnabled ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-100 text-zinc-400 border-zinc-200"}`}>
                                {settings.isRazorpayEnabled ? "Active" : "Disabled"}
                            </span>
                            <button 
                                onClick={() => update("isRazorpayEnabled", !settings.isRazorpayEnabled)}
                                className={`w-14 h-8 rounded-full transition-all relative flex items-center p-1 ${settings.isRazorpayEnabled ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-800"}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-all ${settings.isRazorpayEnabled ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[11px] font-semibold text-zinc-400 capitalize">Razorpay Key ID</label>
                                        <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold text-indigo-500 capitalize flex items-center gap-1 hover:underline">Get Keys <ExternalLink size={10} /></a>
                                    </div>
                                    <input 
                                        value={settings.razorpayKeyId || ""} 
                                        onChange={e => update("razorpayKeyId", e.target.value)}
                                        placeholder="rzp_live_..."
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-semibold text-zinc-400 capitalize">Razorpay Key Secret</label>
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            value={settings.razorpayKeySecret || ""} 
                                            onChange={e => update("razorpayKeySecret", e.target.value)}
                                            placeholder="••••••••••••"
                                            className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-semibold text-zinc-400 capitalize">Webhook Secret (Optional)</label>
                                    <input 
                                        type="password"
                                        value={settings.razorpayWebhookSecret || ""} 
                                        onChange={e => update("razorpayWebhookSecret", e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold text-black dark:text-white focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                                    />
                                    <p className="text-[10px] text-zinc-400 font-medium">Use this for secure order verification callbacks.</p>
                                </div>
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-800/20 rounded-[32px] p-8 border border-zinc-100 dark:border-zinc-800/50 flex flex-col justify-center space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-base text-black dark:text-white capitalize italic">Setup Instructions</h4>
                                    <ul className="space-y-4">
                                        {[
                                            "Log in to your Razorpay Dashboard.",
                                            "Go to Settings > API Keys and generate live keys.",
                                            "Paste the Key ID and Key Secret here.",
                                            "Enable the toggle and save changes."
                                        ].map((step, i) => (
                                            <li key={i} className="flex gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                <span className="flex-shrink-0 w-5 h-5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">{i + 1}</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                                            <CreditCard size={14} />
                                        </div>
                                         <p className="text-[10px] font-medium text-amber-600/80 leading-relaxed">
                                             <span className="font-bold capitalize block mb-1">Security Note</span>
                                            Credentials are encrypted at rest and never shared with customers or third parties.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Action Bar (Bottom) */}
            <div className="flex items-center justify-end pt-8 mt-12 border-t border-zinc-100 dark:border-zinc-800">
                <button
                     onClick={handleSave}
                     disabled={saving}
                     className={`w-full sm:w-auto group flex items-center justify-center gap-3 px-8 sm:px-12 py-4 rounded-2xl text-sm font-bold capitalize transition-all shadow-xl active:scale-95 ${
                         saved ? "bg-emerald-500 text-white" : "bg-indigo-600 dark:bg-white text-white dark:text-black hover:opacity-90 transition-all shadow-indigo-500/10"
                     } disabled:opacity-60`}
                 >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <><Check size={18} /> Saved</> : <>Save Changes <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /></>}
                </button>
            </div>
        </div>
    )
}
