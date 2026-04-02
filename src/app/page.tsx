export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
    Zap, Shield, Globe, Star, BarChart3, Rocket, MessageCircle, ArrowRight, CheckCircle2
} from "lucide-react"
import * as Motion from "framer-motion/client"
import LoginButton from "@/components/auth/LoginButton"
import AetheraHero from "@/components/AetheraHero"

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
        <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white overflow-x-hidden font-inter">
            {/* Cinematic Hero Section (Includes Navbar) */}
            <AetheraHero />

            {/* Stats Section */}
            <section className="relative z-10 py-16 border-b border-zinc-100 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Active Stores', value: '12K+' },
                            { label: 'Transactions', value: '$45M+' },
                            { label: 'Uptime', value: '99.9%' },
                            { label: 'Support', value: '24/7' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center group">
                                <p className="text-3xl md:text-5xl font-normal font-instrument mb-1 text-black group-hover:scale-105 transition-transform duration-300 italic">{stat.value}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F]">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 bg-[#F9F9F9]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-normal font-instrument tracking-tight mb-20 text-black">
                        Everything you need <br /> to <span className="text-[#6F6F6F] italic">Dominate</span> sales.
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Zap, title: 'Lightning Fast', desc: 'Your store loads in under 1 second. High performance translates to high conversion.', color: 'text-indigo-600' },
                            { icon: Shield, title: 'Enterprise Security', desc: 'Bank-level encryption and secure payment integrations built-in as standard.', color: 'text-emerald-600' },
                            { icon: Globe, title: 'Global Reach', desc: 'Multi-language support and international currencies to sell anywhere on earth.', color: 'text-blue-600' },
                            { icon: BarChart3, title: 'Deep Analytics', desc: 'Detailed insights into your customers and sales to make smarter data-driven decisions.', color: 'text-purple-600' },
                            { icon: MessageCircle, title: 'Marketing Tools', desc: 'Built-in SEO management, blogs, and coupons to grow your brand organically.', color: 'text-indigo-600' },
                            { icon: Rocket, title: 'One-Click Deploy', desc: 'From onboarding to live sales in minutes. No coding required, ever.', color: 'text-rose-600' }
                        ].map((item, i) => (
                            <Motion.div
                                key={item.title}
                                whileHover={{ y: -8, backgroundColor: 'white' }}
                                className="p-10 rounded-[40px] border border-zinc-200 bg-white/50 backdrop-blur-sm text-left transition-all duration-300 group shadow-sm hover:shadow-xl"
                            >
                                <div className={`w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${item.color}`}>
                                    <item.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-4 tracking-tight uppercase text-black font-inter">{item.title}</h3>
                                <p className="text-[#6F6F6F] font-medium leading-relaxed">{item.desc}</p>
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section (NEW) */}
            <section id="pricing" className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-normal font-instrument tracking-tighter mb-4 text-black">
                            Premium <span className="text-[#6F6F6F] italic">Boutique</span> Plans
                        </h2>
                        <p className="text-[#6F6F6F] text-lg max-w-2xl mx-auto">
                            Start building your empire today with our most popular high-performance plan.
                        </p>
                    </div>

                    <div className="max-w-md mx-auto">
                        <Motion.div 
                            whileHover={{ y: -10 }}
                            className="bg-white border-2 border-black rounded-[48px] p-10 relative shadow-2xl overflow-hidden"
                        >
                            <div className="absolute top-6 right-10 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                Most Popular
                            </div>
                            
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold uppercase tracking-tight text-black mb-2">Boutique Pro</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-normal font-instrument italic text-black">₹399</span>
                                    <span className="text-[#6F6F6F] uppercase text-xs font-bold tracking-widest">/ Month</span>
                                </div>
                            </div>

                            <div className="space-y-5 mb-10">
                                {[
                                    'Unlimited Products',
                                    'AI-Powered Growth Analytics',
                                    'Premium Storefront Themes',
                                    '24/7 Priority Support',
                                    'Custom Domain Integration',
                                    'Zero Transaction Fees'
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-black" />
                                        <span className="text-[#6F6F6F] font-medium text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full rounded-full py-5 bg-black text-white font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform duration-300 shadow-xl">
                                Get Started Now
                            </button>
                        </Motion.div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-40 px-6 text-center relative overflow-hidden bg-[#F9F9F9]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-zinc-100 blur-[150px] rounded-full" />
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-7xl font-normal font-instrument tracking-tighter mb-10 text-black">
                        Ready to start your <br /> <span className="text-[#6F6F6F] italic">Success story?</span>
                    </h2>
                    <p className="text-[#6F6F6F] text-lg mb-12 font-medium">Join thousands of entrepreneurs who chose Qicmart for their online journey.</p>
                    <div className="flex justify-center">
                        <button className="rounded-full px-14 py-5 text-base bg-black text-white hover:scale-[1.03] transition-transform duration-300 shadow-lg">
                            Get Started Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-zinc-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-black rounded-xl overflow-hidden flex items-center justify-center shadow-md">
                            <img src="/logo.png" alt="QICMART Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-lg font-normal tracking-tight text-black font-instrument italic">QIC<span className="text-[#6F6F6F]">MART</span></span>
                    </div>
                    
                    <div className="text-[#6F6F6F] text-[10px] font-bold uppercase tracking-[0.2em]">
                        &copy; {new Date().getFullYear()} Qicmart Global. All Rights Reserved.
                    </div>

                    <div className="flex items-center gap-8">
                        {['Privacy', 'Terms', 'Connect'].map((item) => (
                            <Link key={item} href="#" className="text-[10px] font-bold uppercase tracking-widest text-[#6F6F6F] hover:text-black transition-colors">
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </footer>
        </div>
    )
}
