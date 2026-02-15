"use client";

import { useState } from "react";
import { useParams } from "next/navigation"; // ✅ Dùng cái này để fix lỗi params Promise
import { MapPin, Star, BedDouble, Utensils, Camera, Heart, Share2, Info } from "lucide-react";
import Navbar from "@/src/components/Navbar";

// ==========================================
// 1. MOCK DATA (GIẢ LẬP DATABASE)
// ==========================================
const MOCK_DB = {
    region: {
        id: 1,
        name: "Tokyo",
        description: "Tokyo là sự pha trộn đầy mê hoặc giữa tương lai và truyền thống. Từ những tòa nhà chọc trời neon ở Shinjuku đến những ngôi đền cổ kính ở Asakusa, thành phố này mang đến trải nghiệm vô tận. Đây là trung tâm văn hóa, ẩm thực và mua sắm của Nhật Bản.",
        cover_image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1920",
        latitude: 35.6762,
        longitude: 139.6503
    },
    hotels: [
        {
            id: 101,
            name: "Aman Tokyo",
            address: "The Otemachi Tower, Chiyoda City",
            description: "Khách sạn sang trọng bậc nhất với tầm nhìn toàn cảnh Tokyo và Núi Phú Sĩ.",
            price_per_night: 150000,
            rating: 4.9,
            image_urls: ["https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600", "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600"],
            tags: ["Luxury", "Spa", "City View"],
            type: "Hotel"
        },
        {
            id: 102,
            name: "Hoshinoya Tokyo",
            address: "Otemachi, Chiyoda City",
            description: "Ryokan hiện đại giữa lòng thành phố, trải nghiệm tắm onsen tầng thượng.",
            price_per_night: 120000,
            rating: 4.8,
            image_urls: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600"],
            tags: ["Ryokan", "Onsen", "Cultural"],
            type: "Resort"
        },
        {
            id: 103,
            name: "Shinjuku Granbell Hotel",
            address: "Kabukicho, Shinjuku",
            description: "Khách sạn thiết kế nghệ thuật ngay trung tâm giải trí đêm.",
            price_per_night: 15000,
            rating: 4.2,
            image_urls: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600"],
            tags: ["Modern", "Nightlife", "Budget"],
            type: "Hotel"
        }
    ],
    restaurants: [
        {
            id: 201,
            name: "Sukiyabashi Jiro",
            address: "Ginza, Chuo City",
            description: "Nhà hàng sushi huyền thoại của Jiro Ono.",
            rating: 5.0,
            average_price: 30000,
            image_urls: ["https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=600"],
            tags: ["Sushi", "Michelin Star", "Fine Dining"],
            price_range: "¥30,000 - ¥50,000"
        },
        {
            id: 202,
            name: "Ichiran Ramen",
            address: "Shibuya, Tokyo",
            description: "Chuỗi mì ramen Tonkotsu nổi tiếng nhất thế giới.",
            rating: 4.7,
            average_price: 1200,
            image_urls: ["https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=600"],
            tags: ["Ramen", "Quick Meal", "Popular"],
            price_range: "¥1,000 - ¥2,000"
        },
        {
            id: 203,
            name: "Koffee Mameya",
            address: "Omotesando, Shibuya",
            description: "Quán cà phê tối giản chuyên về hạt cà phê chất lượng cao.",
            rating: 4.8,
            average_price: 800,
            image_urls: ["https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=600"],
            tags: ["Cafe", "Coffee", "Minimalist"],
            price_range: "¥500 - ¥1,500"
        }
    ],
    spots: [
        {
            id: 301,
            name: "Shibuya Crossing",
            address: "Shibuya City",
            description: "Giao lộ đi bộ đông đúc nhất thế giới, biểu tượng của Tokyo.",
            rating: 4.6,
            image_urls: ["https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=600"],
            tags: ["Landmark", "Shopping", "Photo"],
            type: "Check-in"
        },
        {
            id: 302,
            name: "Senso-ji Temple",
            address: "Asakusa, Taito City",
            description: "Ngôi đền cổ nhất Tokyo với lồng đèn đỏ khổng lồ.",
            rating: 4.8,
            image_urls: ["https://images.unsplash.com/photo-1528360983277-13d9b152c6d1?q=80&w=600"],
            tags: ["Culture", "Temple", "History"],
            type: "Attraction"
        }
    ]
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function DestinationDetail() {
    const params = useParams(); // ✅ Fix lỗi: Lấy ID từ hook thay vì props
    const [activeTab, setActiveTab] = useState<"overview" | "hotels" | "food" | "spots">("overview");

    // Giả lập load dữ liệu (Thực tế bạn sẽ fetch API ở đây dựa vào params.id)
    const { region, hotels, restaurants, spots } = MOCK_DB;

    return (
        <main className="min-h-screen bg-white pb-20 font-sans text-gray-800">
            <Navbar />

            {/* HERO SECTION */}
            <div className="relative h-[65vh] w-full mt-20 group">
                <img
                    src={region.cover_image}
                    alt={region.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end">
                    <div className="max-w-7xl mx-auto w-full px-6 pb-16 text-white">
                        <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">Destination</span>
                            <span className="flex items-center gap-1 text-sm font-medium"><MapPin size={14} /> Japan</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            {region.name}
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-200 max-w-3xl font-light leading-relaxed mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {region.description}
                        </p>

                        <div className="flex gap-4">
                            <button className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                                <Share2 size={18} /> Chia sẻ
                            </button>
                            <button className="border border-white/50 text-white px-6 py-3 rounded-full font-bold hover:bg-white/10 transition-colors flex items-center gap-2">
                                <Heart size={18} /> Lưu yêu thích
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* STICKY TABS */}
            <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 flex gap-8 overflow-x-auto no-scrollbar">
                    {[
                        { id: "overview", label: "Tổng quan", icon: <Info size={18} /> },
                        { id: "hotels", label: "Khách sạn & Resort", icon: <BedDouble size={18} /> },
                        { id: "food", label: "Ẩm thực & Cafe", icon: <Utensils size={18} /> },
                        { id: "spots", label: "Điểm tham quan", icon: <Camera size={18} /> },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`group relative flex items-center gap-2 py-5 text-sm font-bold transition-colors whitespace-nowrap
                                ${activeTab === tab.id
                                    ? "text-red-600"
                                    : "text-gray-500 hover:text-black"
                                }`}
                        >
                            {tab.icon} {tab.label}
                            {/* Active Underline Animation */}
                            <span className={`absolute bottom-0 left-0 h-1 bg-red-600 transition-all duration-300 ${activeTab === tab.id ? "w-full" : "w-0 group-hover:w-full bg-gray-200"}`}></span>
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">

                {/* SECTION: HOTELS */}
                {(activeTab === "overview" || activeTab === "hotels") && (
                    <SectionContainer title="Nơi lưu trú đẳng cấp" subtitle="Từ Ryokan truyền thống đến khách sạn 5 sao" link="Xem tất cả khách sạn">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {hotels.map(item => (
                                <Card
                                    key={item.id}
                                    data={item}
                                    type="hotel"
                                    priceLabel="đêm"
                                />
                            ))}
                        </div>
                    </SectionContainer>
                )}

                {/* SECTION: RESTAURANTS */}
                {(activeTab === "overview" || activeTab === "food") && (
                    <SectionContainer title="Tinh hoa ẩm thực" subtitle="Hương vị không thể chối từ" link="Xem danh sách nhà hàng">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {restaurants.map(item => (
                                <Card
                                    key={item.id}
                                    data={item}
                                    type="food"
                                    priceLabel="người"
                                />
                            ))}
                        </div>
                    </SectionContainer>
                )}

                {/* SECTION: SPOTS */}
                {(activeTab === "overview" || activeTab === "spots") && (
                    <SectionContainer title="Điểm đến không thể bỏ lỡ" subtitle="Check-in những biểu tượng của Tokyo" link="Xem thêm địa điểm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {spots.map(item => (
                                <div key={item.id} className="group cursor-pointer relative rounded-2xl overflow-hidden h-80">
                                    <img src={item.image_urls[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8 text-white">
                                        <div className="flex gap-2 mb-2">
                                            {item.tags.map(tag => (
                                                <span key={tag} className="bg-white/20 backdrop-blur-md px-2 py-1 rounded text-xs font-bold">{tag}</span>
                                            ))}
                                        </div>
                                        <h3 className="text-2xl font-bold mb-1">{item.name}</h3>
                                        <p className="text-gray-300 text-sm line-clamp-1">{item.address}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionContainer>
                )}
            </div>
        </main>
    );
}

// ==========================================
// 3. UI HELPER COMPONENTS
// ==========================================

function SectionContainer({ title, subtitle, link, children }: any) {
    return (
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex justify-between items-end mb-8 border-l-4 border-red-600 pl-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                    <p className="text-gray-500 mt-1">{subtitle}</p>
                </div>
                <button className="hidden md:block text-sm font-bold text-red-600 hover:text-red-700 hover:underline">
                    {link} &rarr;
                </button>
            </div>
            {children}
            <button className="md:hidden w-full mt-6 py-3 border border-gray-200 rounded-lg text-sm font-bold text-gray-600">
                {link} &rarr;
            </button>
        </section>
    );
}

function Card({ data, type, priceLabel }: any) {
    return (
        <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer">
            {/* Image */}
            <div className="relative h-60 overflow-hidden">
                <img
                    src={data.image_urls[0]}
                    alt={data.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                    {data.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="absolute bottom-4 right-4 bg-white px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold shadow-lg">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {data.rating}
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">{data.type || (type === 'food' ? 'Restaurant' : 'Hotel')}</p>
                        <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-red-600 transition-colors">
                            {data.name}
                        </h3>
                    </div>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                    {data.description}
                </p>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[50%]">
                        <MapPin size={12} /> {data.address}
                    </p>
                    <div className="text-right">
                        {data.price_per_night || data.average_price ? (
                            <>
                                <span className="text-lg font-bold text-gray-900">¥{(data.price_per_night || data.average_price).toLocaleString()}</span>
                                <span className="text-xs text-gray-400"> / {priceLabel}</span>
                            </>
                        ) : (
                            <span className="text-xs font-medium text-green-600">Liên hệ</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}