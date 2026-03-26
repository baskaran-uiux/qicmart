export const dynamic = "force-dynamic";
import { Settings, Globe, Shield, Bell, Zap, Palette } from "lucide-react"

export default function AdminSettingsPage() {
    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase italic leading-none">Global Settings</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-4 font-medium">Configure platform-wide parameters and governance rules.</p>
                </div>
                <div className="p-5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-[32px] border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                    <Settings className="w-10 h-10" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="p-10 bg-white dark:bg-zinc-900 rounded-[48px] border border-zinc-200 dark:border-zinc-800 shadow-xl hover:border-indigo-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl group-hover:scale-110 transition-transform">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Platform General</h3>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Platform Name</label>
                            <input 
                                type="text" 
                                defaultValue="Nammart SaaS" 
                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-zinc-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-4">Support Email</label>
                            <input 
                                type="email" 
                                defaultValue="support@nammart.in" 
                                className="w-full px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-zinc-900 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="p-10 bg-white dark:bg-zinc-900 rounded-[48px] border border-zinc-200 dark:border-zinc-800 shadow-xl hover:border-purple-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl group-hover:scale-110 transition-transform">
                            <Palette className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Design System</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <div>
                                <div className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Main Brand Color</div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">#6366f1 (Indigo)</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/30"></div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                            <div>
                                <div className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight">Secondary Color</div>
                                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">#a855f7 (Purple)</div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-purple-500 shadow-lg shadow-purple-500/30"></div>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="p-10 bg-white dark:bg-zinc-900 rounded-[48px] border border-zinc-200 dark:border-zinc-800 shadow-xl hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-2xl group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Platform Governance</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">New User Registration</span>
                            <div className="w-12 h-6 bg-emerald-500 rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest">Store Creation Self-Service</span>
                            <div className="w-12 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center px-1">
                                <div className="w-4 h-4 bg-zinc-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Operations */}
                <div className="p-10 bg-zinc-950 rounded-[48px] border border-zinc-900 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-zinc-900 text-white rounded-2xl">
                                <Zap className="w-6 h-6 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Core Engine</h3>
                        </div>
                        <p className="text-zinc-500 text-xs font-medium mb-10">Manage database migrations, cache purging, and platform-wide maintenance mode.</p>
                        <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all">
                            Open Console
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
