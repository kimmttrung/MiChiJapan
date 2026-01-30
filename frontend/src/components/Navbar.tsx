// src/components/Navbar.tsx
"use client";
import Link from "next/link";
import { Search, Mountain, Flower, User } from "lucide-react"; // Icon đại diện
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useTransition } from 'react'
import { useTranslations } from 'next-intl';

export default function Navbar() {
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
                    <Link href="#" className="flex items-center gap-2 text-brand-accent font-bold hover:opacity-80 transition-opacity">
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

                    <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-dark text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                        <User size={16} />
                        {t('login')}
                    </button>
                </div>
            </div>
        </nav>
    );
}