"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import {
    LayoutDashboard,
    Store,
    Users,
    CreditCard,
    Settings,
    LogOut,
    BarChart3,
    Sun,
    Moon,
    User,
} from "lucide-react";

import { usePathname } from "next/navigation";

function SidebarNav() {
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();

    const navItems = [
        { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/stores", icon: Store, label: "Stores" },
        { href: "/admin/users", icon: Users, label: "Users" },
        {
            href: "/admin/subscriptions",
            icon: CreditCard,
            label: "Subscriptions",
        },
        { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
        { href: "/admin/profile", icon: User, label: "Profile" },
    ];

    return (
        <aside className="w-64 flex-shrink-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-r border-zinc-200/50 dark:border-zinc-800/50 flex flex-col h-[100dvh]">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent italic">
                    PLATFORM
                </span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navItems.map((item: any) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            className={`flex items-center px-4 py-3 rounded-2xl transition-all ${isActive
                                ? "bg-purple-600 text-white shadow-lg"
                                : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-indigo-600 dark:hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            <span className="text-sm font-bold uppercase">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-4 space-y-2 border-t border-zinc-200 dark:border-zinc-800">
                {/* Theme */}
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center px-4 py-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    {theme === "dark" ? (
                        <>
                            <Sun className="w-5 h-5 mr-3 text-yellow-500" />
                            <span className="text-sm font-bold">Light Mode</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-5 h-5 mr-3 text-indigo-600" />
                            <span className="text-sm font-bold">Dark Mode</span>
                        </>
                    )}
                </button>

                {/* Settings */}
                <Link
                    href="/admin/settings"
                    className="flex items-center px-4 py-3 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                    <Settings className="w-5 h-5 mr-3" />
                    <span className="text-sm font-bold">Settings</span>
                </Link>

                {/* Logout */}
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-100 rounded-2xl"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    <span className="text-sm font-bold">Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default function AdminLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ThemeProvider>
            <div className="flex h-[100dvh] bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                <SidebarNav />

                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>
        </ThemeProvider>
    );
}