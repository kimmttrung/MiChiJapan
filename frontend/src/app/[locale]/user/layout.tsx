// app/[locale]/user/layout.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Map, Heart, Sparkles, Home, ChevronLeft } from "lucide-react";
import { useLocale } from "next-intl";

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const locale = useLocale();

    const menuItems = [
        { name: "Hồ sơ cá nhân", href: `/${locale}/user/profile`, icon: User },
        { name: "Chuyến đi AI", href: `/${locale}/ai-trip`, icon: Sparkles },
        { name: "Địa điểm đã lưu", href: `/${locale}/user/saved`, icon: Heart },
    ];

    return (
        // pt-24 để tránh bị Navbar (fixed) che mất nội dung
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="max-w-6xl mx-auto px-6">

                {/* Breadcrumb / Back Button */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Quay về trang chủ
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* SIDEBAR NAVIGATION (3 cột) */}
                    <div className="md:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-28">
                            <div className="mb-6 px-4 pt-2">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Menu</span>
                            </div>
                            <div className="space-y-1">
                                {menuItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                                ? "bg-black text-white shadow-lg shadow-gray-200"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                                }`}
                                        >
                                            <item.icon size={18} />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA (9 cột) */}
                    <div className="md:col-span-9">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}