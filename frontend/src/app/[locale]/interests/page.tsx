"use client";

import { useState } from "react";
import Navbar from "@/src/components/Navbar";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import { Heart, Star } from "lucide-react";

import { useLocale } from "next-intl";
import Link from "next/link";

const EVENTS = [
    // FESTIVAL
    {
        id: 1,
        title: "Lễ hội pháo hoa Đà Nẵng 2026",
        location: "Đà Nẵng",
        category: "Festival",
        image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200",
        description: "Sự kiện pháo hoa quốc tế lớn nhất Việt Nam.",
    },
    {
        id: 2,
        title: "Festival Huế 2026",
        location: "Huế",
        category: "Festival",
        image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1200",
        description: "Lễ hội văn hóa nghệ thuật đặc sắc tại cố đô Huế.",
    },

    // FOOD
    {
        id: 3,
        title: "Hội chợ ẩm thực Hà Nội",
        location: "Hà Nội",
        category: "Food",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200",
        description: "Tinh hoa ẩm thực miền Bắc.",
    },
    {
        id: 4,
        title: "Lễ hội bánh mì Sài Gòn",
        location: "TP.HCM",
        category: "Food",
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1200",
        description: "Sự kiện tôn vinh bánh mì Việt Nam.",
    },

    // MUSIC
    {
        id: 5,
        title: "Monsoon Music Festival",
        location: "Hà Nội",
        category: "Music",
        image: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?q=80&w=1200",
        description: "Lễ hội âm nhạc quốc tế hoành tráng.",
    },
    {
        id: 6,
        title: "HOZO Music Festival",
        location: "TP.HCM",
        category: "Music",
        image: "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=1200",
        description: "Đại nhạc hội ngoài trời sôi động.",
    },

    // CULTURAL
    {
        id: 7,
        title: "Lễ hội đền Hùng",
        location: "Phú Thọ",
        category: "Cultural",
        image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200",
        description: "Sự kiện tưởng nhớ các vua Hùng.",
    },
    {
        id: 8,
        title: "Lễ hội chùa Hương",
        location: "Hà Nội",
        category: "Cultural",
        image: "https://images.unsplash.com/photo-1523905330026-b8bd1f5f320e?q=80&w=1200",
        description: "Hành hương đầu năm nổi tiếng.",
    },
];

export default function EventsPage() {
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [favorites, setFavorites] = useState<number[]>([]);
    const [interested, setInterested] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const EVENTS_PER_PAGE = 3;
    const locale = useLocale()

    const toggleFavorite = (id: number) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const toggleInterested = (id: number) => {
        setInterested((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const filtered = EVENTS.filter((e) => {
        const matchSearch = e.title
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchCategory =
            activeCategory === "All" || e.category === activeCategory;

        return matchSearch && matchCategory;
    });

    const totalPages = Math.ceil(filtered.length / EVENTS_PER_PAGE);

    const paginatedEvents = filtered.slice(
        (currentPage - 1) * EVENTS_PER_PAGE,
        currentPage * EVENTS_PER_PAGE
    );
    // console.log(params)

    return (
        <div className="bg-white min-h-screen">
            <Navbar />

            {/* HERO */}
            <div className="relative h-[55vh] mt-16">
                <img
                    src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600"
                    className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 flex items-center">
                    <div className="max-w-6xl mx-auto px-6 text-white">
                        <h1 className="text-5xl font-bold mb-6">
                            Khám phá sự kiện Việt Nam
                        </h1>

                        <Input
                            placeholder="Tìm kiếm sự kiện..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full md:w-96 bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap gap-3">
                {["All", "Festival", "Food", "Music", "Cultural"].map((cat) => (
                    <Button
                        key={cat}
                        variant={activeCategory === cat ? "primary" : "outline"}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* CONTENT */}
            <div className="max-w-6xl mx-auto px-6 pb-16 grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* LEFT - LIST */}
                <div className="lg:col-span-3 space-y-10">
                    {paginatedEvents.map((event) => (
                        <div
                            key={event.id}
                            className="flex bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden border"
                        >
                            {/* IMAGE */}
                            <div className="w-72 h-56 flex-shrink-0 relative group">
                                <img
                                    src={event.image}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />

                                {/* Favorite Icon */}
                                <button
                                    onClick={() => toggleFavorite(event.id)}
                                    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow"
                                >
                                    <Heart
                                        size={18}
                                        className={
                                            favorites.includes(event.id)
                                                ? "text-red-500 fill-red-500"
                                                : "text-gray-400"
                                        }
                                    />
                                </button>
                            </div>

                            {/* CONTENT */}
                            <div className="p-6 flex flex-col justify-between flex-1">
                                <div>
                                    <p className="text-xs uppercase text-gray-400 font-bold tracking-wider">
                                        {event.category}
                                    </p>

                                    <Link href={`/${locale}/interests/${event.id}`}>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 hover:text-red-600 transition cursor-pointer">
                                            {event.title}
                                        </h3>
                                    </Link>

                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        {event.description}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center mt-6">
                                    <span className="text-sm text-gray-400">
                                        📍 {event.location}
                                    </span>

                                    <div className="flex gap-3 items-center">
                                        <button
                                            onClick={() => toggleInterested(event.id)}
                                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-yellow-500"
                                        >
                                            <Star
                                                size={16}
                                                className={
                                                    interested.includes(event.id)
                                                        ? "text-yellow-500 fill-yellow-500"
                                                        : ""
                                                }
                                            />
                                            Quan tâm
                                        </button>

                                        <Button>Xem chi tiết</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-center gap-3 mt-8">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-4 py-2 rounded-lg border ${currentPage === i + 1
                                    ? "bg-red-600 text-white"
                                    : "bg-white"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT - SIDEBAR */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl border">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">
                            Bộ lọc nâng cao
                        </h3>

                        <div className="space-y-4">
                            <Input placeholder="Tìm theo địa điểm..." />

                            <select className="w-full border rounded-lg p-2 text-sm text-gray-700">
                                <option>Tất cả tỉnh thành</option>
                                <option>Đà Nẵng</option>
                                <option>Hà Nội</option>
                            </select>

                            <Button className="w-full">Áp dụng</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}