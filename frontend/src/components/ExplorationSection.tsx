// src/components/ExplorationSection.tsx
"use client";
import Image from "next/image";
import { ArrowRight, Hotel, Utensils, Star } from "lucide-react";

const destinations = [
    {
        name: "Đà Nẵng",
        img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2000&auto=format&fit=crop",
        desc: "Thành phố của những cây cầu và bãi biển quyến rũ nhất hành tinh.",
        stats: { resorts: 142, restaurants: 320, rating: 4.8 }
    },
    {
        name: "Hội An",
        img: "https://images.unsplash.com/photo-1552353617-3bfd679b3bdd?q=80&w=2000&auto=format&fit=crop",
        desc: "Phố cổ nhuốm màu thời gian với đèn lồng và kiến trúc Nhật - Việt.",
        stats: { resorts: 85, restaurants: 210, rating: 4.9 }
    },
    {
        name: "Hà Nội",
        img: "https://images.unsplash.com/photo-1616486701797-0f33f61038ec?q=80&w=2000&auto=format&fit=crop",
        desc: "Thủ đô ngàn năm văn hiến, nơi giao thoa giữa cổ kính và hiện đại.",
        stats: { resorts: 210, restaurants: 540, rating: 4.7 }
    },
    {
        name: "Vịnh Hạ Long",
        img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop",
        desc: "Kỳ quan thiên nhiên thế giới với hàng nghìn đảo đá vôi hùng vĩ.",
        stats: { resorts: 95, restaurants: 120, rating: 4.8 }
    },
];

export default function ExplorationSection() {
    return (
        <section className="py-24 px-6 max-w-7xl mx-auto bg-brand-bg">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold text-brand-dark mb-2">Điểm đến nổi bật</h2>
                    <p className="text-gray-500 font-light">Những địa danh được cộng đồng MichiJapan yêu thích nhất.</p>
                </div>
                <button className="hidden md:flex items-center gap-2 text-brand-dark font-medium hover:text-brand-accent transition-colors">
                    Xem tất cả <ArrowRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {destinations.map((dest, idx) => (
                    <div key={idx} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100">
                        {/* Image Container */}
                        <div className="relative h-64 w-full overflow-hidden">
                            <Image
                                src={dest.img}
                                alt={dest.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-orange-500 shadow-sm">
                                <Star size={12} fill="currentColor" /> {dest.stats.rating}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{dest.name}</h3>
                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 font-light leading-relaxed">
                                {dest.desc}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center gap-4 text-xs text-gray-400 pt-4 border-t border-gray-100">
                                <span className="flex items-center gap-1">
                                    <Hotel size={14} /> {dest.stats.resorts} Hotel
                                </span>
                                <span className="flex items-center gap-1">
                                    <Utensils size={14} /> {dest.stats.restaurants} F&B
                                </span>
                            </div>
                        </div>

                        {/* Hover Action */}
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </div>
                ))}
            </div>
        </section>
    );
}