
"use client";
import { Sparkles, MapPin, Navigation } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function HeroSection() {
    const t = useTranslations('Hero');
    const suggestionChips = [
        { label: "🏖️ Du lịch biển", color: "bg-blue-50 text-blue-600 border-blue-100" },
        { label: "🍜 Ẩm thực địa phương", color: "bg-orange-50 text-orange-600 border-orange-100" },
        { label: "💎 Nghỉ dưỡng cao cấp", color: "bg-purple-50 text-purple-600 border-purple-100" },
        { label: "💰 Du lịch tiết kiệm", color: "bg-green-50 text-green-600 border-green-100" },
    ];

    return (
        <section className="relative h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden">

            {/* Background Video/Image lớp dưới */}
            <div
                className="absolute inset-0 z-0 bg-[url('https://images.unsplash.com/photo-1504239857321-72a392023446?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center"
            >
                {/* Overlay gradient kiểu Nhật: Mờ ảo bên dưới */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/20 to-brand-bg"></div>
            </div>

            <div className="relative z-10 w-full max-w-4xl px-4 text-center mt-10">

                {/* Headline */}
                <div className="mb-8 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/80 backdrop-blur border border-gray-200 text-xs font-semibold tracking-wider text-gray-500 mb-4 uppercase">
                        {t('badge')}
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-brand-dark tracking-tight mb-4 drop-shadow-sm">
                        {t('title')}
                    </h1>
                    <p className="text-lg text-white font-light max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {/* AI Prompt Box (Trung tâm) */}
                <div className="bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-2 w-full max-w-3xl mx-auto transform transition hover:scale-[1.01] duration-300">
                    <div className="pl-4 text-brand-accent">
                        <Sparkles size={24} />
                    </div>
                    <input
                        type="text"
                        className="flex-1 h-14 text-lg outline-none text-gray-800 placeholder:text-gray-400 placeholder:font-light"
                        placeholder="Bạn muốn đi đâu tại Việt Nam? Hãy để AI thiết lập lộ trình..."
                    />
                    <button className="bg-brand-dark text-white h-12 px-8 rounded-xl font-medium hover:bg-brand-accent transition-colors flex items-center gap-2">
                        <Navigation size={18} />
                        {t('btn_plan')}
                    </button>
                </div>

                {/* Quick Suggestion Chips */}
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    {suggestionChips.map((chip, idx) => (
                        <button
                            key={idx}
                            className={`px-4 py-2 rounded-full border text-sm font-medium transition-all hover:-translate-y-1 hover:shadow-md bg-white/90 backdrop-blur-sm ${chip.color.replace('bg-', 'text-')}`}
                        >
                            {chip.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}