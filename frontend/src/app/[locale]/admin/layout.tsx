"use client";
import React, { useState, useEffect, useTransition } from "react";
// ✅ Import Link từ file cấu hình i18n để tự động thêm locale vào các link trong Sidebar
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Users, Hotel, MapPin,
    Utensils, Calendar, Settings, LogOut,
    Menu, X, Loader2, Globe, // Thêm icon quả địa cầu cho đẹp
    UtensilsCrossed
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";
import { useTranslations, useLocale } from "next-intl"; // 🟢 Import useLocale
import Link from "next/link";
import { toast } from "sonner";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const t = useTranslations("AdminSidebar");
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // --- 1. SETUP LOGIC NGÔN NGỮ ---
    const locale = useLocale(); // Lấy ngôn ngữ hiện tại (vi, en, ja)
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    // Hàm xử lý khi chọn ngôn ngữ mới
    const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value;
        startTransition(() => {
            // Thay thế /vi/ thành /en/ trong URL hiện tại
            // pathname ví dụ: /vi/admin/users
            const segments = pathname.split('/');
            segments[1] = nextLocale; // đổi phần tử thứ 2 (index 1) thành locale mới
            router.replace(segments.join('/'));
        });
    };
    // --------------------------------

    const { user, logout: contextLogout, isLoading } = useAuth();

    // Hàm xử lý Logout tùy chỉnh cho Admin
    const handleLogout = () => {
        // 1. Hiện thông báo
        toast.info(locale === 'ja' ? "ログアウトしました" : locale === 'en' ? "Logging out..." : "Đang đăng xuất...");

        // 2. Xóa data
        localStorage.removeItem("michi_token");
        localStorage.removeItem("michi_user");

        // 3. Chuyển hướng giữ nguyên ngôn ngữ (QUAN TRỌNG)
        // Thay vì dùng contextLogout() (nó reload về /login mặc định), ta tự redirect
        window.location.href = `/${locale}/login`;
    };

    // Logic bảo vệ Admin
    useEffect(() => {
        if (!isLoading) {
            if (!user || user.role !== 'admin') {
                router.push("/login");
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) return (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin" size={40} />
        </div>
    );

    if (!user || user.role !== 'admin') return null;

    const menuItems = [
        { key: "dashboard", href: "/admin", icon: LayoutDashboard },
        { key: "users", href: "/admin/users", icon: Users },
        { key: "regions", href: "/admin/regions", icon: MapPin },
        { key: "hotels", href: "/admin/hotels", icon: Hotel },
        { key: "restaurants", href: "/admin/restaurants", icon: Utensils },
        { key: "cuisines", href: "/admin/cuisines", icon: UtensilsCrossed },
        { key: "places", href: "/admin/places", icon: UtensilsCrossed },
        { key: "trips", href: "/admin/trips", icon: Calendar },
        { key: "settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 w-64 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:block`}>
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <span className="text-xl font-bold">Michi<span className="text-red-600">Admin</span></span>
                </div>

                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const fullPath = `/${locale}${item.href}`;
                        const isActive = pathname === fullPath || (item.href !== '/admin' && pathname.startsWith(fullPath));
                        return (
                            <Link
                                key={item.href}
                                href={fullPath} // 2. QUAN TRỌNG: Tự cộng chuỗi locale vào đây
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                ${isActive ? "bg-black text-white" : "text-gray-600 hover:bg-gray-100"}`}
                            >
                                <item.icon size={18} />
                                {t(item.key)}
                            </Link>
                        );
                    })}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 mt-8 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition">
                        <LogOut size={18} />
                        {t("logout")}
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-gray-600">
                        {isSidebarOpen ? <X /> : <Menu />}
                    </button>

                    <div className="flex-1"></div>

                    <div className="flex items-center gap-6">

                        {/* --- 2. GIAO DIỆN CHỌN NGÔN NGỮ --- */}
                        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg border border-transparent hover:border-gray-300 transition-all">
                            <Globe size={16} className="text-gray-500" />
                            <select
                                defaultValue={locale}
                                onChange={onSelectChange}
                                disabled={isPending}
                                className="bg-transparent text-sm font-semibold text-gray-700 outline-none cursor-pointer disabled:opacity-50"
                            >
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">English</option>
                                <option value="ja">日本語</option>
                            </select>
                        </div>
                        {/* ---------------------------------- */}

                        <div className="h-6 w-px bg-gray-200"></div>

                        {/* User Info */}
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-800">{user.full_name}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold text-right">Admin</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-100">
                                <img src={user.avatar_url || "https://github.com/shadcn.png"} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}