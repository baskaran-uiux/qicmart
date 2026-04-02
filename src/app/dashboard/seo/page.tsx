"use client";

import { useState, useEffect } from "react";
import { 
    Search, 
    Globe, 
    BarChart3, 
    FileText, 
    Zap, 
    CheckCircle2, 
    AlertCircle, 
    ExternalLink, 
    Upload, 
    Save, 
    RefreshCcw,
    MousePointer2,
    Eye,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { SEOSkeleton } from "@/components/dashboard/DashboardSkeletons";

export default function SEOManagerPage() {
    const [activeTab, setActiveTab] = useState("global");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [score, setScore] = useState(0);
    const [settings, setSettings] = useState({
        seoTitle: "",
        seoDescription: "",
        ogImage: "",
        favicon: ""
    });
    const [analytics, setAnalytics] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const ownerId = params.get("ownerId");
                const url = ownerId ? `/api/dashboard/seo?ownerId=${ownerId}` : "/api/dashboard/seo";
                const res = await fetch(url);
                const data = await res.json();
                if (!data.error) {
                    setSettings({
                        seoTitle: data.seoTitle || "",
                        seoDescription: data.seoDescription || "",
                        ogImage: data.ogImage || "",
                        favicon: data.favicon || ""
                    });
                    setAnalytics(data.analytics);
                    setScore(data.score);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const params = new URLSearchParams(window.location.search);
            const ownerId = params.get("ownerId");
            const url = ownerId ? `/api/dashboard/seo?ownerId=${ownerId}` : "/api/dashboard/seo";
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                toast.success("SEO Settings Updated!");
            } else {
                toast.error("Failed to save settings");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred");
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: "global", label: "Global SEO", icon: Globe },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "sitemap", label: "Sitemap", icon: FileText },
        { id: "audit", label: "SEO Audit", icon: Zap },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                    <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-black dark:text-white capitalize">SEO Manager</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-[12px] sm:text-[14px] font-medium tracking-normal">Optimize your store for search engines and social media.</p>
                </div>
                <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Store SEO Score</p>
                        <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{score}/100</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
                        <TrendingUp className="text-indigo-600 dark:text-indigo-400" size={24} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-zinc-100/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-[24px] w-fit overflow-x-auto border border-zinc-200 dark:border-zinc-700">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-[18px] text-[14px] font-bold transition-all duration-300 whitespace-nowrap ${
                            activeTab === tab.id
                                ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-white shadow-md scale-[1.02]"
                                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {loading ? (
                    <SEOSkeleton />
                ) : (
                    <>
                        {activeTab === "global" && (
                            <GlobalSEOSettings 
                                settings={settings} 
                                setSettings={setSettings} 
                                handleSave={handleSave} 
                                saving={saving} 
                            />
                        )}
                        {activeTab === "analytics" && <SearchAnalytics data={analytics} />}
                        {activeTab === "sitemap" && <SitemapSettings data={analytics} />}
                        {activeTab === "audit" && <SEOAuditReport score={score} />}
                    </>
                )}
            </div>
        </div>
    );
}

function GlobalSEOSettings({ settings, setSettings, handleSave, saving }: { settings: any, setSettings: any, handleSave: any, saving: boolean }) {
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ogImage' | 'favicon') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({ ...settings, [type]: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-[18px] font-bold text-zinc-900 dark:text-white mb-2">Basic Setup</h3>
                            <p className="text-[12px] text-zinc-500">Define how your store appears in search engine results.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Store Search Title</label>
                                <input 
                                    value={settings.seoTitle}
                                    onChange={e => setSettings({ ...settings, seoTitle: e.target.value })}
                                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[14px] font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all"
                                    placeholder="e.g. Qicmart - The Premium SaaS Marketplace"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest ml-1">Meta Description</label>
                                <textarea 
                                    value={settings.seoDescription}
                                    onChange={e => setSettings({ ...settings, seoDescription: e.target.value })}
                                    rows={4}
                                    className="w-full px-5 py-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-[14px] font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500/50 transition-all resize-none"
                                    placeholder="Briefly describe your store for search engine results..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-[18px] font-bold text-zinc-900 dark:text-white mb-2">Social Preview (OG Tags)</h3>
                            <p className="text-[12px] text-zinc-500">Configure how your store looks when shared on WhatsApp, FB, etc.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-8 items-start">
                            <div 
                                onClick={() => document.getElementById('ogUpload')?.click()}
                                className="w-full sm:w-64 aspect-video bg-zinc-100 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-400 gap-2 hover:border-indigo-500/50 transition-all cursor-pointer relative overflow-hidden"
                            >
                                {settings.ogImage ? (
                                    <img src={settings.ogImage} className="absolute inset-0 w-full h-full object-cover" alt="OG Preview" />
                                ) : (
                                    <>
                                        <Upload size={24} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Upload OG Image</span>
                                    </>
                                )}
                                <input id="ogUpload" type="file" className="hidden" onChange={e => handleImageUpload(e, 'ogImage')} />
                            </div>
                            <div className="flex-1 space-y-4 pt-2">
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                    <p className="text-indigo-600 text-[12px] font-bold truncate">qicmart.com</p>
                                    <p className="text-zinc-900 dark:text-white text-[14px] font-bold mt-1">{settings.seoTitle || "Qicmart Premium Store"}</p>
                                    <p className="text-zinc-500 text-[12px] mt-1 line-clamp-2">{settings.seoDescription || "The best place to buy premium SaaS products online..."}</p>
                                </div>
                                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                                    *Recommended size: 1200x630px for optimal social sharing visibility.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[16px] font-bold text-zinc-900 dark:text-white">Favicon</h3>
                            <ShieldCheck className="text-emerald-500" size={18} />
                        </div>
                        <div className="flex items-center gap-6">
                            <div onClick={() => document.getElementById('faviconUpload')?.click()} className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center p-3 shadow-inner cursor-pointer overflow-hidden">
                                {settings.favicon ? <img src={settings.favicon} className="w-full h-full object-contain" alt="Favicon" /> : <div className="w-8 h-8 rounded bg-indigo-600" />}
                                <input id="faviconUpload" type="file" className="hidden" onChange={e => handleImageUpload(e, 'favicon')} />
                            </div>
                            <button onClick={() => document.getElementById('faviconUpload')?.click()} className="flex-1 px-4 py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[12px] font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                                Replace
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-400">Visible in browser tabs.</p>
                    </div>

                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white rounded-[24px] text-[14px] font-bold shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />} 
                        {saving ? "Saving Changes..." : "Save Global Settings"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SearchAnalytics({ data }: { data: any }) {
    const stats = [
        { label: "Total Clicks", value: data?.totalClicks || "0", sub: "+12.5%", icon: MousePointer2, color: "bg-blue-500" },
        { label: "Impressions", value: data?.impressions ? `${(data.impressions / 1000).toFixed(1)}K` : "0", sub: "+8.2%", icon: Eye, color: "bg-purple-500" },
        { label: "Avg. Position", value: data?.avgPosition || "0", sub: "-0.4", icon: TrendingUp, color: "bg-amber-500" },
    ];

    const keywords = data?.keywords || [];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white dark:bg-zinc-900 p-7 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm group">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest">{s.label}</span>
                            <div className={`w-10 h-10 ${s.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                <s.icon size={20} />
                            </div>
                        </div>
                        <div className="flex items-end gap-3">
                            <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">{s.value}</p>
                            <span className="mb-1 text-[12px] font-black text-emerald-500">{s.sub}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h3 className="text-[18px] font-bold text-zinc-900 dark:text-white">Top Search Keywords</h3>
                        <p className="text-[12px] text-zinc-500 mt-1">Queries that drive traffic to your store.</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-[12px] font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all">
                        Last 30 Days <ExternalLink size={14} />
                    </button>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-400 uppercase text-[10px] font-bold tracking-widest border-b border-zinc-100 dark:border-zinc-800">
                            <tr>
                                <th className="px-8 py-5">Keyword</th>
                                <th className="px-8 py-5 text-right">Clicks</th>
                                <th className="px-8 py-5 text-right">CTR</th>
                                <th className="px-8 py-5 text-right">Avg. Pos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {keywords.map((row: any) => (
                                <tr key={row.keyword} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-default">
                                    <td className="px-8 py-5 text-[14px] font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">{row.keyword}</td>
                                    <td className="px-8 py-5 text-[14px] font-bold text-zinc-500 text-right">{row.clicks}</td>
                                    <td className="px-8 py-5 text-[14px] font-bold text-zinc-500 text-right">{row.ctr}</td>
                                    <td className="px-8 py-5 text-[14px] font-bold text-zinc-500 text-right">{row.position}</td>
                                </tr>
                            ))}
                            {keywords.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-10 text-center text-zinc-400 font-bold">No keywords data available yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function SitemapSettings({ data }: { data: any }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                <div>
                    <h3 className="text-[18px] font-bold text-zinc-900 dark:text-white mb-2">Sitemap Status</h3>
                    <p className="text-[12px] text-zinc-500">Search engines use sitemaps to find your pages.</p>
                </div>
                
                <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-[24px] border border-zinc-100 dark:border-zinc-800 space-y-6">
                    <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-zinc-400 capitalize">Public XML Sitemap</span>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">{data?.indexingStatus || "Active"}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[12px] font-bold text-indigo-600 truncate">
                        <a href={data?.sitemapUrl || "#"} target="_blank" className="hover:underline flex items-center gap-2">
                            {data?.sitemapUrl || "https://yourstore.com/sitemap.xml"} <ExternalLink size={14} />
                        </a>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <p className="text-[14px] font-bold text-zinc-900 dark:text-white">Re-index Store</p>
                        <p className="text-[12px] text-zinc-500 mt-1">Ping Google about new products.</p>
                    </div>
                    <button className="px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl text-[12px] font-bold shadow-lg active:scale-95 transition-all flex items-center gap-2">
                        <RefreshCcw size={16} /> Update Now
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-8">
                <div>
                    <h3 className="text-[18px] font-bold text-zinc-900 dark:text-white mb-2">Robots.txt Control</h3>
                    <p className="text-[12px] text-zinc-500">Instructions for search engine crawlers.</p>
                </div>
                <div className="p-6 bg-zinc-900 rounded-[24px] font-mono text-[12px] text-emerald-400/80 leading-relaxed shadow-inner">
                    <p>User-agent: *</p>
                    <p>Allow: /</p>
                    <p>Disallow: /admin/</p>
                    <p>Disallow: /api/</p>
                    <p className="mt-4 text-emerald-500">Sitemap: {data?.sitemapUrl || "https://yourstore.com/sitemap.xml"}</p>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
                    *Automatically updated based on your store's configuration and security settings.
                </p>
            </div>
        </div>
    );
}

function SEOAuditReport({ score }: { score: number }) {
    const issues = [
        { title: "Missing Alt Tags", desc: "4 product images are missing descriptions.", type: "error", icon: AlertCircle },
        { title: "Duplicate Meta Titles", desc: "2 pages have identical search titles.", type: "warning", icon: AlertCircle },
        { title: "Sitemap Generated", desc: "Sitemap successfully updated today.", type: "success", icon: CheckCircle2 },
        { title: "Fast Page Load", desc: "Mobile performance is above 90/100.", type: "success", icon: CheckCircle2 },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-indigo-600 p-10 rounded-[40px] shadow-2xl shadow-indigo-600/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-32 -mt-32 rounded-full group-hover:scale-150 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-32 h-32 rounded-[40px] bg-white text-indigo-600 flex items-center justify-center text-5xl font-black shadow-2xl relative">
                        {score}
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-10 h-10 rounded-2xl border-4 border-indigo-600 flex items-center justify-center">
                            <CheckCircle2 className="text-white" size={20} />
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left text-white">
                        <h3 className="text-2xl font-black tracking-tight">Your Store SEO Performance</h3>
                        <p className="text-blue-100/70 mt-2 font-medium leading-relaxed">System has identified 2 critical issues that are preventing you from ranking higher on Google.</p>
                        <button className="mt-6 px-8 py-4 bg-white text-indigo-600 rounded-2xl text-[14px] font-black shadow-xl hover:scale-105 transition-all active:scale-95">
                            Fix All Issues Now
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {issues.map((i, idx) => (
                    <div key={idx} className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start gap-6 group hover:shadow-xl transition-all duration-500">
                        <div className={`p-4 rounded-2xl ${
                            i.type === "error" ? "bg-rose-50 dark:bg-rose-500/10 text-rose-500" :
                            i.type === "warning" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-500" :
                            "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500"
                        } group-hover:scale-110 transition-transform`}>
                            <i.icon size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[16px] font-bold text-zinc-900 dark:text-white">{i.title}</h4>
                            <p className="text-[12px] text-zinc-500 mt-1 font-medium leading-relaxed">{i.desc}</p>
                            {i.type !== "success" && (
                                <button className="mt-4 text-[12px] font-black text-indigo-600 dark:text-indigo-400 hover:underline">
                                    Show Details
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
