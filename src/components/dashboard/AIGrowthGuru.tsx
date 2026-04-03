"use client"

import { useState, useRef, useEffect } from "react"
import { useDashboardStore } from "@/components/DashboardStoreProvider"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Send, X, MessageSquare, Zap, TrendingUp, HelpCircle, BrainCircuit } from "lucide-react"
import { toast } from "sonner"

export default function AIGrowthGuru({ storeId }: { storeId: string }) {
    const { name, aiCredits, t } = useDashboardStore()
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
        { role: 'assistant', content: `Hello! I'm your Growth Guru. I can help you analyze your store, optimize products, and suggest marketing strategies. How can I help you today?` }
    ])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async () => {
        if (!input.trim() || isTyping) return
        if (aiCredits <= 0) {
            toast.error("Insufficient AI credits. Please contact Super Admin.")
            return
        }

        const userMsg = input.trim()
        setInput("")
        setMessages(prev => [...prev, { role: 'user', content: userMsg }])
        setIsTyping(true)

        try {
            const res = await fetch(`/api/ai?storeId=${storeId}&type=growth`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    prompt: userMsg,
                    context: { storeName: name }
                })
            })

            const data = await res.json()
            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
        } catch (err: any) {
            toast.error(err.message || "Failed to get AI response")
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble processing that. Please try again." }])
        } finally {
            setIsTyping(false)
        }
    }

    const suggestions = [
        "How can I increase my sales?",
        "Write a description for my new product",
        "Give me a marketing idea for this week",
        "Analyze my store performance"
    ]

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-3xl shadow-2xl shadow-indigo-500/40 hover:scale-110 active:scale-95 transition-all group"
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl animate-ping group-hover:block hidden" />
                <BrainCircuit className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 right-8 z-50 w-[380px] h-[550px] bg-white dark:bg-zinc-950 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Sparkles size={20} fill="currentColor" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Growth Guru</h3>
                                    <p className="text-[10px] text-white/70 font-medium tracking-wide flex items-center gap-1">
                                        <Zap size={10} fill="currentColor" /> {aiCredits} Credits Available
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-zinc-50/50 dark:bg-zinc-900/20">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed font-medium shadow-sm border whitespace-pre-wrap ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white border-indigo-500' 
                                            : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-100 dark:border-zinc-700'
                                    }`}>
                                        {msg.content.split('\n').map((line, i) => (
                                            <div key={i} className={line.trim() ? "mb-2" : "h-1"}>
                                                {line.split('**').map((part, j) => 
                                                    j % 2 === 1 ? <strong key={j} className="font-black text-indigo-600 dark:text-indigo-300">{part}</strong> : part
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions */}
                        {messages.length < 3 && !isTyping && (
                            <div className="px-6 py-2 flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
                                {suggestions.map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => { setInput(s); handleSend(); }}
                                        className="px-3 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-[11px] font-bold text-zinc-500 hover:text-indigo-600 dark:hover:text-white hover:border-indigo-500 transition-all text-nowrap"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-2 focus-within:ring-2 ring-indigo-500/20 transition-all">
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium"
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="p-2 text-indigo-600 dark:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                                >
                                    <Send size={18} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
