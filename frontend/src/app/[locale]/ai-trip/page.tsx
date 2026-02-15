// src/app/[locale]/ai-trip/page.tsx
import AITripPlanner from "@/src/components/AITripPlanner";
import Navbar from "@/src/components/Navbar";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
    const t = await getTranslations({ locale, namespace: 'Metadata' });
    return {
        title: `AI Trip Planner - MichiJapan`,
        description: 'Tạo lịch trình du lịch tự động với AI',
    };
}

export default function AITripPage() {
    return (
        <main className="min-h-screen bg-[#F8F9FA] font-sans text-brand-dark relative overflow-hidden">
            <Navbar />

            {/* Background Image mờ ảo phía sau */}
            <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            ></div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12 pt-28">
                <AITripPlanner />
            </div>

            {/* Footer nhỏ gọn */}
            <footer className="relative z-10 py-6 text-center text-gray-400 text-xs">
                <p>© 2025 MichiJapan AI. Powered by OpenAI & Google Maps.</p>
            </footer>
        </main>
    );
}