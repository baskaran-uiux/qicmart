export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
    Zap, Shield, Smartphone, Globe, ArrowRight, CheckCircle2, 
    Star, Users, ChevronRight, BarChart3, Rocket, MessageCircle
} from "lucide-react"
import * as Motion from "framer-motion/client"
import LoginButton from "@/components/auth/LoginButton"

export default async function RootPage() {
    const session = await getServerSession(authOptions)

    if (session?.user) {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            include: { ownedStores: true }
        })

        if (user?.role === 'SUPER_ADMIN') {
            redirect('/admin')
        }

        if (user?.ownedStores && user.ownedStores.length > 0) {
            redirect('/dashboard')
        } else {
            redirect('/onboarding')
        }
    }

    return (
        <div className="min-h-screen bg-[#03060b] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
            {/* Background Spotlights */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[120px] delay-700" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#03060b]/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-11 h-11 bg-indigo-600 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                            <img src="/logo.png" alt="QICMART Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-black tracking-tight italic uppercase">Qic<span className="text-indigo-500">Mart</span></span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-10">
                        {['Features', 'Solutions', 'Pricing', 'Resources'].map((item) => (
                            <Link key={item} href="#" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors tracking-wide uppercase text-[11px]">
                                {item}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <LoginButton />
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-44 pb-32 px-6">
                <div className="max-w-7xl mx-auto text-center">
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-8 animate-bounce-subtle">
                            <Star size={12} className="fill-indigo-400" /> Trusted by 5,000+ Store Owners
                        </span>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.05] italic uppercase">
                            Build Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500">Digital Empire</span> <br />
                            In Record Time.
                        </h1>
                        <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                            Stop struggling with complex e-commerce setups. Qicmart gives you the tools to launch, manage, and scale your online store with professional speed.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <LoginButton />
                            <button className="flex items-center gap-2 group text-sm font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors">
                                View Demo <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </Motion.div>

                    {/* Stats */}
                    <Motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-16"
                    >
                        {[
                            { label: 'Active Stores', value: '12K+' },
                            { label: 'Transactions', value: '$45M+' },
                            { label: 'Uptime', value: '99.9%' },
                            { label: 'Support', value: '24/7' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl md:text-4xl font-black mb-1 italic">{stat.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{stat.label}</p>
                            </div>
                        ))}
                    </Motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 bg-white/[0.02] border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-20 italic uppercase">Everything you need <br /> to <span className="text-indigo-500">Dominate</span> sales.</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { 
                                icon: Zap, 
                                title: 'Lightning Fast', 
                                desc: 'Your store loads in under 1 second. High performance translates to high conversion.',
                                color: 'text-yellow-400'
                            },
                            { 
                                icon: Shield, 
                                title: 'Enterprise Security', 
                                desc: 'Bank-level encryption and secure payment integrations built-in as standard.',
                                color: 'text-emerald-400'
                            },
                            { 
                                icon: Globe, 
                                title: 'Global Reach', 
                                desc: 'Multi-language support and international currencies to sell anywhere on earth.',
                                color: 'text-blue-400'
                            },
                            { 
                                icon: BarChart3, 
                                title: 'Deep Analytics', 
                                desc: 'Detailed insights into your customers and sales to make smarter data-driven decisions.',
                                color: 'text-purple-400'
                            },
                            { 
                                icon: MessageCircle, 
                                title: 'Marketing Tools', 
                                desc: 'Built-in SEO management, blogs, and coupons to grow your brand organically.',
                                color: 'text-indigo-400'
                            },
                            { 
                                icon: Rocket, 
                                title: 'One-Click Deploy', 
                                desc: 'From onboarding to live sales in minutes. No coding required, ever.',
                                color: 'text-rose-400'
                            }
                        ].map((item, i) => (
                            <Motion.div
                                key={item.title}
                                whileHover={{ y: -10, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                className="p-10 rounded-[40px] border border-white/5 text-left transition-all duration-300 group"
                            >
                                <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${item.color}`}>
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-4 tracking-tight uppercase italic">{item.title}</h3>
                                <p className="text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 px-6 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full" />
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter mb-10 italic uppercase">Ready to start your <br /> Success story?</h2>
                    <p className="text-zinc-400 text-lg mb-12 font-medium">Join thousands of entrepreneurs who chose Qicmart for their online journey.</p>
                    <div className="flex justify-center">
                        <LoginButton />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-indigo-600 rounded-xl overflow-hidden flex items-center justify-center">
                            <img src="/logo.png" alt="QICMART Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-lg font-black tracking-tight italic uppercase">Qic<span className="text-indigo-500">Mart</span></span>
                    </div>
                    
                    <div className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} Qicmart Global. All Rights Reserved.
                    </div>

                    <div className="flex items-center gap-8">
                        {['Privacy', 'Terms', 'Connect'].map((item) => (
                            <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}
