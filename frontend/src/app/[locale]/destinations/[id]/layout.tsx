"use client";

import { useParams } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";

export default function DestinationLayout({ children }: any) {
    const { id } = useParams();
    const locale = useLocale();
    const [region, setRegion] = useState<any>(null);

    // Fetch thông tin chi tiết của Region để lấy ảnh và tên
    useEffect(() => {
        async function fetchRegionDetail() {
            try {
                const res = await fetch(`http://localhost:8000/api/regions/${id}`);
                console.log("check region", res);
                if (res.ok) {
                    const data = await res.json();
                    setRegion(data);
                }
            } catch (error) {
                console.error("Lỗi lấy thông tin vùng:", error);
            }
        }
        if (id) fetchRegionDetail();
    }, [id]);



    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />

            {/* HERO BANNER SECTION */}
            <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
                {/* Ảnh nền từ Region */}
                {region?.cover_image ? (
                    <img
                        src={region.cover_image}
                        alt={region.name}
                        className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 animate-pulse" />
                )}

                {/* Overlay làm tối ảnh để nổi chữ */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Chữ to đại diện cho điểm đến */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter drop-shadow-2xl animate-in slide-in-from-bottom-10 duration-700">
                        {region?.name || "Loading..."}
                    </h1>
                    <p className="mt-4 flex items-center gap-2 text-lg font-medium bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">
                        <MapPin size={20} />
                        Khám phá vẻ đẹp bất tận
                    </p>
                </div>
            </div>

            {/* TAB NAVIGATION */}
            <div className="border-b sticky top-0 bg-white z-50">
                <div className="max-w-7xl mx-auto flex gap-10 px-6">
                    {[
                        { href: "hotels", label: "🏨 Hotels" },
                        { href: "restaurants", label: "🍽 Restaurants" },
                        { href: "entertainment", label: "🎡 Vui chơi" }
                    ].map((tab) => (
                        <Link
                            key={tab.href}
                            href={`/${locale}/destinations/${id}/${tab.href}`}
                            className="py-6 font-bold text-sm uppercase tracking-widest hover:text-blue-600 transition-colors border-b-2 border-transparent hover:border-blue-600"
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {children}
            </div>
        </main>
    );
}