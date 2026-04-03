"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, X, MessageSquare, Sparkles, Loader2, User, Bot, ShoppingBag } from "lucide-react"

interface Message {
    role: 'user' | 'bot'
    content: string
    timestamp: Date
}

interface AIChatbotProps {
    storeId: string
    storeName: string
    currency: string
}

export default function AIChatbot({ storeId, storeName, currency }: AIChatbotProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'bot',
            content: `Hello! I'm your AI assistant for ${storeName}. How can I help you today?`,
            timestamp: new Date()
        }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        if (isOpen) scrollToBottom()
    }, [messages, isOpen])

    const handleSend = async () => {
        if (!input.trim() || isLoading) return

        const userMsg: Message = {
            role: 'user',
            content: input,
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsLoading(true)

        try {
            const res = await fetch(`/api/ai?storeId=${storeId}&type=chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    prompt: input,
                    context: {
                        history: messages.slice(-5).map(m => ({ role: m.role, content: m.content })),
                        storeName,
                        currency
                    }
                })
            })

            const data = await res.json()
            if (data.error) {
                if (data.error.includes("credits")) {
                     setMessages(prev => [...prev, {
                        role: 'bot',
                        content: "I'm currently resting. Please check back later or contact support directly!",
                        timestamp: new Date()
                    }])
                } else {
                    throw new Error(data.error)
                }
            } else {
                setMessages(prev => [...prev, {
                    role: 'bot',
                    content: data.response,
                    timestamp: new Date()
                }])
            }
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, filter: "blur(10px)" }}
                        className="w-[350px] sm:w-[400px] h-[500px] sm:h-[600px] mb-6 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-br from-indigo-600/90 to-indigo-500/90 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-black tracking-tight">{storeName} AI</h4>
                                    <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest">Active Support</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {messages.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600'}`}>
                                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                        </div>
                                        <div className={`p-4 rounded-[24px] text-sm font-medium leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 flex items-center justify-center">
                                            <Loader2 size={16} className="animate-spin" />
                                        </div>
                                        <div className="p-4 rounded-[24px] rounded-tl-none bg-zinc-100 dark:bg-zinc-900 text-zinc-400 text-sm italic font-bold">
                                            AI is thinking...
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="relative">
                                <input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your question..."
                                    className="w-full pl-6 pr-14 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-semibold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm"
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 top-2 p-3 bg-indigo-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white rounded-full flex items-center justify-center shadow-[0_15px_35px_rgba(79,70,229,0.4)] pointer-events-auto relative group overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-16 group-hover:translate-y-0 transition-transform duration-500" />
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
                
                {!isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 }}
                        className="absolute right-20 bg-white dark:bg-zinc-950 px-4 py-2 rounded-xl text-[11px] font-black text-indigo-600 shadow-xl border border-zinc-100 dark:border-zinc-800 whitespace-nowrap"
                    >
                        How can I help you?
                        <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-white dark:bg-zinc-950 border-r border-t border-zinc-100 dark:border-zinc-800 rotate-45" />
                    </motion.div>
                )}
            </motion.button>
        </div>
    )
}
