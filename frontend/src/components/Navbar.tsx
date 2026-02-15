// src/components/Navbar.tsx
"use client";
import Link from "next/link";
import { Search, Mountain, Flower, User, ChevronDown, UserIcon, Settings, LogOut } from "lucide-react"; // Icon đại diện
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl';
import { ROUTES } from "../lib/routes";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth(); // Lấy thông tin user
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const t = useTranslations('Navbar');
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const [, startTransition] = useTransition()

    const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nextLocale = e.target.value

        startTransition(() => {
            const segments = pathname.split('/')
            segments[1] = nextLocale
            router.replace(segments.join('/'))
        })
    }
    const handleLogout = () => {
        // Tạo đường dẫn: /vi/login hoặc /en/login
        const loginPath = `/${locale}${ROUTES.LOGIN}`;

        // Gọi hàm logout và truyền đường dẫn vào
        logout(loginPath);
    };
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* 1. LOGO & BRAND */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="relative w-10 h-10 flex items-center justify-center bg-brand-dark rounded-full text-white overflow-hidden group-hover:bg-brand-accent transition-colors">
                        {/* Biểu tượng giao thoa: Núi & Hoa */}
                        <Mountain size={18} className="absolute bottom-2" />
                        <Flower size={14} className="absolute top-2 right-2 opacity-80" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-brand-dark">
                        Michi<span className="font-light">Japan</span>
                    </span>
                </Link>

                {/* 2. MENU CHÍNH (5 Mục) */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                    <Link href="#" className="hover:text-brand-dark transition-colors">{t('destinations')}</Link>
                    <Link href="#" className="hover:text-brand-dark transition-colors">{t('interests')}</Link>
                    <Link href="#" className="hover:text-brand-dark transition-colors">{t('events')}</Link>
                    <Link href="#" className="hover:text-brand-dark transition-colors">{t('planning')}</Link>

                    {/* CTA AI Chuyến đi - Nổi bật */}
                    <Link
                        href={`/${locale}/ai-trip`}
                        className="flex items-center gap-2 text-brand-accent font-bold hover:opacity-80 transition-opacity">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        {t('ai_trip')}
                    </Link>
                </div>

                {/* 3. RIGHT SECTION: SEARCH & AUTH */}
                <div className="flex items-center gap-4">
                    {/* Thanh tìm kiếm bo góc */}
                    <select
                        defaultValue={locale}
                        onChange={onSelectChange}
                        className="
    px-3 py-1.5
    rounded-full
    bg-black text-white
    text-xs font-semibold
    tracking-wide
    cursor-pointer
    focus:outline-none
    hover:bg-gray-800
    transition
  "
                    >
                        <option value="vi">VI</option>
                        <option value="en">EN</option>
                        <option value="ja">JP</option>
                    </select>
                    <div className="hidden lg:flex items-center bg-gray-100 px-4 py-2 rounded-full border border-transparent focus-within:border-brand-dark transition-all">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="bg-transparent border-none outline-none text-sm ml-2 w-32 placeholder:text-gray-400 text-gray-800"
                        />
                    </div>

                    {user ? (
                        /* GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP */
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="flex items-center gap-2 p-1 pr-3 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition-all"
                            >
                                {/* Avatar tròn */}
                                <div className="w-9 h-9 bg-brand-dark rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden shadow-inner">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        user.full_name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-gray-700 hidden lg:block">
                                    {user.full_name} {/* Chỉ hiện tên cuối */}
                                </span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu Nhật Bản Minimalist */}
                            {isMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in duration-200">
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tài khoản</p>
                                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                                    </div>
                                    <Link
                                        href={`/${locale}/user/profile`}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                                        <UserIcon size={16} /> Trang cá nhân
                                    </Link>
                                    <Link href="#" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                                        <Settings size={16} /> Cài đặt
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition border-t border-gray-50 mt-1"
                                    >
                                        <LogOut size={16} /> Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* GIAO DIỆN KHI CHƯA ĐĂNG NHẬP */
                        <Link
                            href={`/${locale}${ROUTES.LOGIN}`}
                            className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                        >
                            <UserIcon size={16} />
                            {t('login')}
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}