export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { 
    Zap, Shield, Globe, ArrowRight, Star, 
    BarChart3, Rocket, MessageCircle, Layout, Code2, 
    Cpu, Network, Check, 
    Twitter, Github, Linkedin, Mail, Headphones, Book, Globe2,
    Terminal, Database, Layers, Bot, Sparkles, ShieldCheck, Activity,
    Plus, Minus, ChevronDown
} from "lucide-react"
import * as Motion from "framer-motion/client"
import LoginButton from "@/components/auth/LoginButton"

import Navbar from "@/components/landing/Navbar"
import SmoothScroll from "@/components/landing/SmoothScroll"
import PricingSection from "@/components/landing/PricingSection"
import FAQSection from "@/components/landing/FAQSection"
import ContactSection from "@/components/landing/ContactSection"

// Staggered Text Component for Kzero Effect
const StaggeredText = ({ text, className }: { text: string, className?: string }) => {
    const words = text.split(" ");
    return (
        <span className={className}>
            {words.map((word, i) => (
                <Motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        ease: [0.2, 0.65, 0.3, 0.9],
                    }}
                    className="inline-block mr-[0.25em]"
                >
                    {word}
                </Motion.span>
            ))}
        </span>
    );
};

// Reusable Glow Orb for Atmosphere
const GlowOrb = ({ className, delay = 0, duration = 20, size = "w-96 h-96" }: { className?: string, delay?: number, duration?: number, size?: string }) => (
    <Motion.div
        animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.9, 1],
            opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
            duration: duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay
        }}
        className={`absolute rounded-full blur-[120px] mix-blend-screen pointer-events-none ${size} ${className}`}
    />
);

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
        <SmoothScroll>
            <div className="min-h-screen bg-[#000000] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden font-sans relative">
            {/* Kzero-style Background Overlay */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15)_0%,transparent_50%)]" />
                <div className="absolute inset-0 scanlines opacity-[0.03]" />
                
                {/* Abstract 3D Wireframe Grid (Animated) */}
                <svg className="absolute w-full h-full opacity-[0.2]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            {/* Dynamic Navbar */}
            <Navbar />

            {/* Hero Section */}
            <section id="home" className="relative pt-20 pb-16 md:pt-32 md:pb-24 px-4 flex flex-col items-center justify-center min-h-[60vh] md:min-h-[85vh] text-center overflow-hidden">
                {/* Convergence Hands Backdrop */}
                <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
                    {/* Cyber Grid Background */}
                    <div className="cyber-grid absolute inset-0 opacity-40" />
                    
                    {/* Centered Atmosphere Glow */}
                    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full" />
                    
                    {/* Animated Glow Orbs - Hidden on mobile for performance */}
                    <GlowOrb className="hidden lg:block top-[10%] left-[10%] bg-indigo-500/20" delay={0} duration={25} />
                    <GlowOrb className="hidden lg:block top-[40%] right-[15%] bg-purple-600/15" delay={5} duration={30} size="w-[500px] h-[500px]" />
                    <GlowOrb className="hidden lg:block bottom-[10%] left-[20%] bg-indigo-400/10" delay={2} duration={22} size="w-80 h-80" />
                    <GlowOrb className="hidden lg:block top-[20%] left-1/2 bg-purple-500/10" delay={8} duration={28} size="w-[600px] h-[600px]" />

                    {/* Left: Human Hand */}
                    <Motion.div 
                        initial={{ x: -200, opacity: 0, rotate: -15 }}
                        animate={{ 
                            x: 0, 
                            opacity: 1, 
                            rotate: -10,
                            y: [0, -15, 0] 
                        }}
                        transition={{ 
                            x: { duration: 1.5, ease: "easeOut", delay: 1.2 },
                            opacity: { duration: 1.5, delay: 1.2 },
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }
                        }}
                        className="absolute left-[-5%] top-[25%] w-[45%] h-auto max-w-[600px] hidden lg:block transition-all duration-700"
                    >
                        <img 
                            src="/images/landing/human-hand.png" 
                            alt="Human Evolution" 
                            className="w-full h-auto object-contain"
                        />
                    </Motion.div>

                    {/* Right: Robot Hand */}
                    <Motion.div 
                        initial={{ x: 200, opacity: 0, rotate: 15 }}
                        animate={{ 
                            x: 0, 
                            opacity: 1, 
                            rotate: 10,
                            y: [0, -15, 0] 
                        }}
                        transition={{ 
                            x: { duration: 1.5, ease: "easeOut", delay: 2.2 },
                            opacity: { duration: 1.5, delay: 2.2 },
                            y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }
                        }}
                        className="absolute right-[-5%] top-[25%] w-[45%] h-auto max-w-[600px] hidden lg:block transition-all duration-700"
                    >
                        <img 
                            src="/images/landing/robot-hand.png" 
                            alt="AI Integration" 
                            className="w-full h-auto object-contain"
                        />
                    </Motion.div>

                    {/* Convergence Glow at center */}
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
                </div>

                <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative z-10 mt-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        <span className="mono-label !text-indigo-400">/ THE ALL_IN_ONE PLATFORM</span>
                        <span className="h-px w-12 bg-indigo-500/30" />
                        <span className="mono-label">READY TO LAUNCH</span>
                    </div>

                    <h1 className="text-[2.8rem] sm:text-6xl md:text-8xl font-black tracking-[calc(-0.04em)] mb-6 leading-[0.9] uppercase italic">
                        <StaggeredText text="LAUNCH YOUR" className="block text-white" />
                        <StaggeredText 
                            text="ONLINE STORE" 
                            className="block text-transparent bg-clip-text bg-[linear-gradient(to_right,#6366f1,#a855f7,#fff,#6366f1)] bg-[length:200%_auto] animate-gradient-slow" 
                        />
                    </h1>

                    <p className="text-zinc-400 text-base md:text-2xl max-w-2xl mx-auto mb-10 font-medium leading-relaxed drop-shadow-md px-4">
                        <span className="hidden sm:inline">No coding required. Qicmart is the ultimate platform to build your website, manage inventory, process payments, and scale your business globally in minutes.</span>
                        <span className="sm:hidden">Build, manage, and scale your online store in minutes. No coding required.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <Motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <a href="#pricing" className="relative group/btn bg-white text-black px-10 py-4 rounded-full font-medium text-base tracking-tight shadow-[0_20px_50px_rgba(255,255,255,0.15)] hover:shadow-[0_20px_60px_rgba(255,255,255,0.3)] transition-all flex items-center gap-3">
                                <Rocket className="w-5 h-5 shrink-0" />
                                Get Started
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </a>
                        </Motion.div>
                        <button className="flex items-center gap-3 mono-label !text-zinc-300 hover:!text-white transition-colors group">
                            <Code2 size={16} /> SEE HOW IT WORKS <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </Motion.div>

                {/* Stats Grid */}
                <div className="relative z-10 mt-16 md:mt-32 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {[
                        { label: 'Secure Uptime', value: '99.99%', icon: ShieldCheck },
                        { label: 'Stores Created', value: '5,000+', icon: BarChart3 },
                        { label: 'Monthly Sales', value: '₹450Cr+', icon: Cpu },
                        { label: 'Setup Time', value: '< 2 Min', icon: Zap },
                    ].map((stat, i) => (
                        <Motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -10 }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                            className="relative p-6 sm:p-10 md:p-16 bg-[#0a0a0c] border border-white/5 beveled-sm text-center group hover:border-indigo-500/50 hover:bg-[#0f0f12] transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 w-1 h-12 bg-indigo-500/0 group-hover:bg-indigo-500/50 transition-all" />
                            
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-10 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                                    <stat.icon size={24} className="text-indigo-500 md:hidden opacity-60 group-hover:opacity-100" />
                                    <stat.icon size={28} className="text-indigo-500 hidden md:block opacity-60 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="text-xl md:text-4xl font-black mb-1 md:mb-3 italic tracking-tighter group-hover:text-white transition-colors">
                                    {stat.value}
                                </div>
                                <div className="mono-label text-zinc-500 text-[8px] md:text-xs tracking-[0.2em] group-hover:text-indigo-400/60 transition-colors uppercase">
                                    {stat.label}
                                </div>
                            </div>
 
                            {/* Background Glow Effect */}
                            <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 blur-[50px] transition-all -z-10 rounded-full" />
                        </Motion.div>
                    ))}
                </div>
            </section>

            {/* Tactical Features */}
            <section id="features" className="py-16 md:py-32 relative border-b border-white/5">
                <GlowOrb className="top-[20%] left-[-10%] bg-indigo-500/5" delay={2} duration={40} size="w-[600px] h-[600px]" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                        <Motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="text-left"
                        >
                            <div className="mono-label mb-4">/ TACTICAL_ADVANTAGE</div>
                            <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-none">Everything you need <br /> to <span className="text-indigo-500">Dominate</span>.</h2>
                        </Motion.div>
                        <div className="mono-label text-right opacity-30 hidden md:block">
                            [SCROLL TO EXPLORE_MODULES]
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { icon: Shield, title: 'Secure Payments', desc: 'Accept credit cards, UPI, and global wallets instantly. Bank-grade encryption protects every transaction.' },
                            { icon: Layout, title: 'Beautiful Themes', desc: 'Choose from premium, high-converting templates that look stunning on phones, tablets, and desktops.' },
                            { icon: Database, title: 'Easy Inventory', desc: 'Track your products, manage stock levels, and organize variants like sizes and colors effortlessly.' },
                            { icon: Rocket, title: 'Unlimited Growth', desc: 'Whether you sell one product or 10,000, our system scales automatically with zero slowdowns.' },
                            { icon: Cpu, title: 'AI Store Builder', desc: 'Let our AI automatically write product descriptions and pick the perfect layout for your brand.' },
                            { icon: Activity, title: '24/7 Support', desc: 'Real human experts available around the clock to help your business launch and succeed.' }
                        ].map((item, i) => (
                            <Motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.8 }}
                                whileHover={{ scale: 1.02 }}
                                className="relative p-7 sm:p-10 bg-zinc-900/40 border border-white/5 beveled group overflow-hidden transition-all duration-300"
                            >
                                {/* Corner Brackets (Tactical Edge) */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-indigo-500/0 group-hover:border-indigo-500/40 transition-all duration-500" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-indigo-500/0 group-hover:border-indigo-500/40 transition-all duration-500" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-indigo-500/0 group-hover:border-indigo-500/40 transition-all duration-500" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-indigo-500/0 group-hover:border-indigo-500/40 transition-all duration-500" />

                                <div className="w-16 h-16 bg-indigo-600/5 rounded-2xl flex items-center justify-center mb-8 border border-indigo-500/10 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-400 group-hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-500 relative">
                                    {/* Constant Ambient Glow */}
                                    <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-xl animate-pulse" />
                                    <item.icon size={32} className="relative z-10 group-hover:animate-pulse" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tighter group-hover:text-indigo-50 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-zinc-500 font-medium leading-relaxed mb-8 group-hover:text-zinc-300 transition-colors">
                                    {item.desc}
                                </p>
                                
                                <div className="h-px w-full bg-white/5 group-hover:bg-indigo-500/40 transition-colors" />
                                
                                {/* Background Aura (More vibrant now) */}
                                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/5 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700" />
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 md:py-32 relative overflow-hidden bg-[#050507]">
                {/* Background Glows */}
                <GlowOrb className="top-1/2 left-[-10%] bg-indigo-500/10" delay={0} duration={30} size="w-[600px] h-[600px]" />
                <GlowOrb className="bottom-[10%] right-[-10%] bg-purple-600/10" delay={15} duration={35} size="w-[500px] h-[500px]" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <Motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24"
                    >
                        <div className="mono-label mb-4">/ THREE_EASY_STEPS</div>
                        <h2 className="text-4xl md:text-7xl font-black uppercase italic leading-none">The <span className="text-indigo-500 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Blueprint</span> for Success.</h2>
                    </Motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
                        {/* Connecting Line (Desktop) - Repositioned Below Icons */}
                        <div className="absolute top-[144px] left-0 w-full h-[2px] bg-white/5 hidden md:block overflow-hidden">
                            <Motion.div 
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-1/2 h-full bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent"
                            />
                        </div>
                        
                        {[
                            { step: '01', title: 'ADD PRODUCTS', desc: 'Securely upload your product images, set your prices, and add descriptions through our simple interface.', icon: Plus },
                            { step: '02', title: 'LAUNCH STORE', desc: 'Select a premium design theme, connect your custom domain, and go live to the world in a single click.', icon: Rocket },
                            { step: '03', title: 'START SELLING', desc: 'Accept global payments securely, pack orders, and track your daily revenue from one powerful dashboard.', icon: Activity }
                        ].map((item, i) => (
                            <Motion.div
                                key={item.step}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2, duration: 0.8 }}
                                className="relative p-8 sm:p-12 text-center group"
                            >
                                <div className="w-20 h-20 bg-indigo-600/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-indigo-500/20 relative z-10 group-hover:bg-indigo-600 transition-all duration-500">
                                    <span className="absolute -top-4 -right-4 bg-zinc-950 border border-indigo-500/30 text-[10px] font-black w-10 h-10 rounded-full flex items-center justify-center text-indigo-400">
                                        {item.step}
                                    </span>
                                    <item.icon size={32} className="text-indigo-500 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase italic tracking-tighter group-hover:text-indigo-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-zinc-500 font-medium leading-relaxed max-w-xs mx-auto">
                                    {item.desc}
                                </p>
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visual Showcase: Master Control Center */}
            <section className="py-12 md:py-20 relative overflow-hidden">
                {/* Background Atmosphere */}
                <GlowOrb className="top-[20%] right-[5%] bg-indigo-600/10" delay={5} duration={40} size="w-[700px] h-[700px]" />
                <GlowOrb className="bottom-0 left-[10%] bg-purple-500/5" delay={10} duration={30} size="w-[500px] h-[500px]" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <Motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="mono-label mb-6">/ ALL_IN_ONE_DASHBOARD</div>
                            <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-[0.9] mb-10">
                                Manage Everything <br /> <span className="text-indigo-500">In One Place</span>.
                            </h2>
                            <p className="text-zinc-400 text-xl font-medium leading-relaxed mb-12">
                                Say goodbye to confusing software. Our intuitive dashboard acts as the command center for your entire business—tracking live sales, managing stock, and forecasting growth automatically.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    'Live Sales & Revenue Tracking',
                                    'Automated Inventory Management',
                                    'Built-in Customer CRM Tools',
                                    'AI-Powered Growth Suggestions'
                                ].map(feat => (
                                    <li key={feat} className="flex items-center gap-4 text-sm font-black uppercase tracking-tight italic group">
                                        <div className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Check size={14} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </Motion.div>

                        <Motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative group lg:mt-0 mt-12"
                        >
                            <div className="absolute -inset-4 bg-indigo-600/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="relative border border-white/5 rounded-[40px] overflow-hidden shadow-2xl shadow-indigo-500/20 transition-all duration-700 hover:scale-[1.02]">
                                <img 
                                    src="/images/landing/qicmart_dashboard_ui.png" 
                                    alt="Qicmart Tactical Dashboard" 
                                    className="w-full h-auto"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-40" />
                            </div>
                        </Motion.div>
                    </div>
                </div>
            </section>

            {/* Performance Showcase: Global Edge Network */}
            <section className="py-12 relative overflow-hidden bg-zinc-950/50 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="relative rounded-[60px] overflow-hidden border border-white/5 group bg-zinc-950 flex flex-col">
                        {/* Centered Heading Overlaying Glow */}
                        <div className="relative md:absolute md:inset-0 flex flex-col items-center justify-start md:justify-center text-center p-6 md:p-12 pointer-events-none z-20 mt-20 md:mt-0">
                            <Motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mb-4 relative"
                            >
                                <div className="mono-label mb-6 !text-indigo-400">/ QICMART_OPERATIONS</div>
                                <h2 className="text-3xl md:text-7xl font-black uppercase italic leading-none max-w-4xl mx-auto drop-shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                                    Commerce powered by the <br />
                                    <span className="text-white text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-400 to-indigo-600">Global Edge</span>.
                                </h2>
                            </Motion.div>
                        </div>
 
                        {/* Interactive Markers */}
                        <div className="relative md:absolute md:bottom-0 md:left-0 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 p-6 md:p-12 items-end mt-12 md:mt-0 z-30">
                            {[
                                { label: 'Retail Clusters', value: '1,200+' },
                                { label: 'Edge Latency', value: '<1.2ms' },
                                { label: 'Daily Requests', value: '250M+' },
                                { label: 'Security Shield', value: 'Shield v3' }
                            ].map((stat, i) => (
                                <Motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 + 0.5 }}
                                    className="bg-black/40 backdrop-blur-3xl border border-white/10 p-6 md:p-8 beveled-sm"
                                >
                                    <div className="text-2xl md:text-4xl font-black italic text-white mb-2">{stat.value}</div>
                                    <div className="mono-label !text-indigo-400 text-[10px] md:text-xs">{stat.label}</div>
                                </Motion.div>
                            ))}
                        </div>

                        {/* Visualization - Moved to bottom for mobile flow */}
                        <Motion.div
                            initial={{ opacity: 0, scale: 1.1 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5 }}
                            className="relative md:absolute md:inset-0 z-10 order-last"
                        >
                            <img 
                                src="/global_edge_network_1775213867607.png" 
                                alt="Global Edge Network visualization" 
                                className="w-full h-auto grayscale-0 md:grayscale-[50%] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                            />
                            <div className="hidden md:block absolute inset-0 bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950/80" />
                        </Motion.div>
                    </div>
                </div>
            </section>

            {/* Mobile Showcase: Retail Sovereignty */}
            <section className="py-16 md:py-48 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2 }}
                            className="order-2 lg:order-1"
                        >
                            <div className="relative group max-w-md mx-auto">
                                <div className="absolute -inset-4 bg-indigo-600/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                                <div className="relative border border-white/5 rounded-[60px] overflow-hidden shadow-2xl shadow-indigo-500/20 transform -rotate-6 group-hover:rotate-0 transition-all duration-700">
                                    <img 
                                        src="/images/landing/qicmart_mobile_store_ui.png" 
                                        alt="Mobile storefront sovereignty" 
                                        className="w-full h-auto"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent opacity-40" />
                                </div>
                            </div>
                        </Motion.div>

                        <Motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="mono-label mb-6">/ MOBILE_FIRST_DESIGN</div>
                            <h2 className="text-4xl md:text-6xl font-black uppercase italic leading-[0.9] mb-10">
                                Perfect on Every <br /> <span className="text-indigo-500">Mobile Screen</span>.
                            </h2>
                            <p className="text-zinc-400 text-xl font-medium leading-relaxed mb-12">
                                Over 70% of shopping happens on phones. We ensure your store loads instantly and looks incredibly premium on all devices, leading to massive conversion rates.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    'Lightning Fast Mobile Loading',
                                    'One-Tap Secure Checkouts',
                                    'Responsive Premium Layouts',
                                    'App-Like Shopping Experience'
                                ].map(feat => (
                                    <li key={feat} className="flex items-center gap-4 text-sm font-black uppercase tracking-tight italic group">
                                        <div className="w-6 h-6 rounded-lg bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                            <Check size={14} />
                                        </div>
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </Motion.div>
                    </div>
                </div>
            </section>

            <PricingSection />

            <FAQSection />

            {/* Final CTA */}
            <section className="py-20 md:py-48 px-6 text-center relative overflow-hidden bg-gradient-to-b from-black via-[#050507] to-[#020205]">
                {/* Background Decor - Linear Gradient instead of Pulse */}
                <div className="absolute top-0 left-0 w-full h-[300px] md:h-[600px] bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />
                <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600/5" delay={0} duration={10} size="w-[800px] h-[800px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-50 mix-blend-overlay pointer-events-none" />
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <Motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                    >
                        <div className="mono-label mb-6 md:mb-10 flex items-center justify-center gap-4">
                            <span className="h-px w-8 bg-indigo-500/30" />
                            / INITIALIZE_SUCCESS_STORY
                            <span className="h-px w-8 bg-indigo-500/30" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 md:mb-12 italic uppercase leading-[0.9] text-white">
                            Own your <br /> 
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-600 to-purple-500 drop-shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                                RETAIL EMPIRE
                            </span> today.
                        </h2>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-10">
                            <Motion.div 
                                whileHover={{ scale: 1.05 }} 
                                whileTap={{ scale: 0.95 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <a href="#pricing" className="relative group/btn bg-white text-black px-12 py-5 rounded-full font-black text-lg uppercase tracking-tighter shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:shadow-[0_20px_70px_rgba(255,255,255,0.4)] transition-all flex items-center gap-3">
                                    <Rocket className="w-6 h-6" />
                                    Get Started
                                    <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                </a>
                            </Motion.div>
                            
                            <div className="space-y-4 text-center">
                                <p className="mono-label !text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                                    Join 5,000+ infrastructure commanders worldwide.
                                </p>
                            </div>
                        </div>
                    </Motion.div>
                </div>
            </section>

            <ContactSection />

            {/* Operational Hub (Footer) */}
            <footer className="py-16 md:py-32 px-6 border-t border-white/5 bg-zinc-950 relative z-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 mb-24">
                        {/* Branding & Status */}
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20 overflow-hidden">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-3xl font-black tracking-[-0.07em] uppercase italic leading-[0.9]">
                                    Qic<span className="text-indigo-500">Mart</span>
                                </span>
                            </div>
                            <p className="text-zinc-500 max-w-sm mb-10 font-medium leading-relaxed">
                                Deploying high-performance commerce infrastructure across the global planetary grid. 
                                Join the retail sovereignty movement today.
                            </p>
                            <div className="flex items-center gap-4">
                                {[Twitter, Github, Linkedin, Mail].map((Icon, i) => (
                                    <Link key={i} href="#" className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:bg-indigo-600 hover:text-white hover:border-indigo-400 transition-all">
                                        <Icon size={20} />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Link Clusters */}
                        <div>
                            <div className="mono-label !text-zinc-400 mb-8 tracking-[0.3em]">/ PRODUCT</div>
                            <ul className="space-y-4">
                                {['Storefronts', 'Dashboard', 'AI Guru', 'Global Edge', 'Infrastructure'].map(item => (
                                    <li key={item}>
                                        <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-indigo-500 transition-colors tracking-tight">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div className="mono-label !text-zinc-400 mb-8 tracking-[0.3em]">/ SUPPORT</div>
                            <ul className="space-y-4">
                                {['Documentation', 'API Status', 'Change Log', 'Security Cluster', 'Help Desk'].map(item => (
                                    <li key={item}>
                                        <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-indigo-500 transition-colors tracking-tight">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div className="mono-label !text-zinc-400 mb-8 tracking-[0.3em]">/ COMPANY</div>
                            <ul className="space-y-4">
                                {['About Project', 'Tactical HQ', 'Press Node', 'Legal Assets', 'Privacy.sh'].map(item => (
                                    <li key={item}>
                                        <Link href="#" className="text-sm font-medium text-zinc-500 hover:text-indigo-500 transition-colors tracking-tight">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="mono-label !text-zinc-600 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 animate-pulse rounded-full" />
                            ALL_SYSTEMS_OPERATIONAL / MKXXVI
                        </div>
                        
                        <div className="mono-label !text-zinc-600">
                            &copy; QICMART_GLOBAL / SECURE_PLANETARY_COMMERCE
                        </div>

                        <div className="flex items-center gap-8">
                            <Link href="#" className="mono-label hover:text-indigo-500 transition-colors">PRIVACY_POLICY</Link>
                            <Link href="#" className="mono-label hover:text-indigo-500 transition-colors">LEGAL_RESOURCES</Link>
                        </div>
                    </div>
                </div>

                {/* Massive Background Watermark */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full overflow-hidden pointer-events-none select-none z-0 opacity-5 flex justify-center">
                    <span className="text-[20vw] font-black tracking-[-0.07em] uppercase italic leading-none whitespace-nowrap text-white">
                        QICMART
                    </span>
                </div>
            </footer>
        </div>
        </SmoothScroll>
    )
}
