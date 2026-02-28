"use client";

import { useState } from "react";
import { Sparkles, Send, MapPin, Loader2, Utensils, Hotel, Download, RefreshCcw, ChevronRight, Map, Pencil, Trash2, Clock, ExternalLink, Navigation, CreditCard } from "lucide-react";
import dynamic from 'next/dynamic';
import { toast } from "sonner";
import Link from "next/link";
import { useLocale } from "next-intl";

// --- BƯỚC 1: ĐỊNH NGHĨA INTERFACE CHUẨN ---
interface TripItem {
    time: string;
    activity: string;
    location: string;
    type: "visit" | "dining" | "hotel" | "relaxation" | "shopping" | "departure";
    price: number;
    image_url?: string;
    details?: string;
    map_url?: string;
}

interface DayPlan {
    day: number;
    title: string;
    items: TripItem[];
}

interface TripData {
    title: string;
    region_id: number | null; // Cực kỳ quan trọng để lưu vào DB
    budget_summary: {
        total_per_person: number;
        note: string;
    };
    itinerary: DayPlan[];
}

interface SavedTrip {
    id: number;
    title: string;
    total_days: number;
    budget_per_person: number;
    ai_result: TripData;
}

export default function AITripPlanner() {
    const locale = useLocale();
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"input" | "generating" | "result">("input");
    const [result, setResult] = useState<TripData | null>(null);

    const TripMap = dynamic(() => import('./TripMap'), {
        ssr: false,
        loading: () => <div className="h-[350px] w-full bg-gray-100 animate-pulse rounded-[24px]" />
    });

    const suggestions = [
        "🌸 3 ngày ở Đà Lạt ngân sách 2 triệu",
        "🍜 Food tour Phú Quốc 2 ngày 1 đêm",
        "🏖️ Nghỉ dưỡng Nha Trang cho 4 người",
        "⛩️ Khám phá Hà Nội cổ kính 1 ngày",
    ];

    const [view, setView] = useState<"planner" | "list" | "detail">("planner");
    const [myTrips, setMyTrips] = useState<SavedTrip[]>([]);
    const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editedTrip, setEditedTrip] = useState<any>(null);
    const tripData = isEditing ? editedTrip : selectedTrip;

    // Hàm lấy danh sách từ Backend
    const fetchMyTrips = async () => {
        try {
            const token = localStorage.getItem("michi_token");
            const res = await fetch("http://localhost:8000/api/v1/my-trips", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();
            console.log("check data", data);
            setMyTrips(data);
            setView("list");
            console.log("view", view);
        } catch (error) {
            alert("Không thể tải danh sách!");
        }
    };

    // Hàm trả về icon bắt mắt dựa trên từ khóa hoạt động
    const getActivityIcon = (type: string) => {
        switch (type) {
            case "hotel": return "🏨";
            case "dining": return "🍱";
            case "visit": return "📸";
            case "transport": return "🚗";
            default: return "📍";
        }
    };

    const getActionButtons = (item: any, regionId: number) => {
        const isSystemItem = item.item_id && regionId;
        const googleMapUrl = item.map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`;

        if (isSystemItem) {
            // TRƯỜNG HỢP CÓ ID: Link nội bộ + Google Maps
            const category = item.type === "hotel" ? "hrestaurantss" : "hotels";
            return (
                <div className="flex gap-2 mt-4">
                    <Link
                        href={`/${locale}/destinations/${regionId}/${category}/${item.item_id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-[11px] font-black uppercase rounded-xl hover:bg-black transition-all shadow-lg shadow-blue-200"
                    >
                        <CreditCard size={14} /> Xem chi tiết
                    </Link>
                    <a
                        href={googleMapUrl} target="_blank"
                        className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
                    >
                        <Navigation size={16} />
                    </a>
                </div>
            );
        } else {
            // TRƯỜNG HỢP AI SINH (Biển, núi, check-in): Hiện "Khám phá" + "Maps"
            return (
                <div className="flex gap-2 mt-4">
                    <a
                        href={googleMapUrl} target="_blank"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-[11px] font-black uppercase rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-100"
                    >
                        <MapPin size={14} /> Khám phá địa danh
                    </a>
                    <button className="p-2.5 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100 transition-all">
                        <Sparkles size={16} />
                    </button>
                </div>
            );
        }
    };

    if (view === "list") {
        return (
            <div className="w-full space-y-6 animate-in fade-in slide-in-from-right-10 duration-500">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-black text-gray-800">Chuyến đi của tôi</h2>
                    <button onClick={() => setView("planner")} className="text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-xl">
                        + Tạo mới
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myTrips.map(trip => (
                        <div
                            key={trip.id}
                            onClick={() => { setSelectedTrip(trip); setView("detail"); }}
                            className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                                    🗺️
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">{trip.title}</h3>
                                    <p className="text-xs text-gray-400">{trip.total_days} ngày • {trip.budget_per_person.toLocaleString()}đ / người</p>
                                </div>
                                <div className="ml-auto flex items-center gap-3">
                                    {/* Edit */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTrip(trip);
                                            setView("detail");
                                        }}
                                        className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    {/* Delete */}
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!confirm("Bạn chắc chắn muốn xóa chuyến đi này?")) return;

                                            try {
                                                await fetch(`http://localhost:8000/api/v1/trips/${trip.id}`, {
                                                    method: "DELETE",
                                                });
                                                fetchMyTrips();
                                            } catch (err) {
                                                alert("Xóa thất bại!");
                                            }
                                        }}
                                        className="p-2 rounded-xl hover:bg-red-50 text-red-500 hover:text-red-600 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <ChevronRight className="text-gray-300 group-hover:text-purple-500" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- RENDER CHI TIẾT DẠNG ROADMAP (BẢN ĐỒ ICON) ---
    if (view === "detail" && selectedTrip) {
        const tripData = isEditing ? editedTrip : selectedTrip;
        const regionId = tripData.region_id;

        console.log("check tripDaya", tripData)

        return (
            <div className="w-full animate-in fade-in zoom-in-95 duration-700 pb-20">
                {/* 1. BACK BUTTON */}
                <button onClick={() => setView("list")} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-black font-bold transition-all">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">←</div> Quay lại
                </button>

                {/* 2. GLASSMORPHISM BANNER */}
                <div className="relative mb-20 p-8 md:p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-[50px] text-white shadow-2xl overflow-hidden border border-white/20">
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-center md:text-left space-y-4">
                            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Lịch trình hành trình</div>
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic uppercase">
                                {tripData.title}
                            </h2>
                        </div>
                        {/* BUDGET CARD */}
                        <div className="bg-white p-6 rounded-[35px] text-black shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500 min-w-[240px]">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dự toán cá nhân</p>
                            <p className="text-4xl font-black text-blue-600 tracking-tighter">
                                {tripData.budget_per_person?.toLocaleString()}đ
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-gray-400 border-t pt-3">
                                <Clock size={12} /> {tripData.total_days} Ngày khám phá
                            </div>
                        </div>
                    </div>
                    {/* Trang trí nền tròn */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/30 rounded-full blur-3xl animate-pulse"></div>
                </div>

                {/* 3. SNAKE PATH ROADMAP */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Đường line trung tâm */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-100 via-pink-100 to-transparent -translate-x-1/2 hidden md:block"></div>

                    <div className="space-y-32">
                        {tripData.ai_result.itinerary.map((day: any, dIdx: number) => (
                            <div key={dIdx} className="relative">
                                {/* Tag Ngày ở giữa đường đi */}
                                <div className="flex justify-center mb-20 relative z-20">
                                    <div className="bg-white border-[6px] border-gray-50 px-8 py-3 rounded-3xl shadow-xl">
                                        <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                            DAY {day.day}
                                        </span>
                                    </div>
                                </div>

                                {/* Danh sách địa điểm so le */}
                                <div className="space-y-16">
                                    {day.items.map((item: any, iIdx: number) => {
                                        const isLeft = iIdx % 2 === 0;
                                        return (
                                            <div key={iIdx} className={`flex items-center w-full ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col gap-8`}>

                                                {/* Card nội dung */}
                                                <div className="w-full md:w-[42%]">
                                                    <div className={`group bg-white p-6 rounded-[40px] border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 relative ${isLeft ? 'md:text-right' : 'md:text-left'}`}>

                                                        {/* HEADER CARD: TIME, TYPE & PRICE */}
                                                        <div className={`flex items-center justify-between mb-4 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
                                                            <div className={`flex items-center gap-3 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
                                                                <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-lg shadow-md italic">
                                                                    {item.time}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                                                    {item.type}
                                                                </span>
                                                            </div>

                                                            {/* HIỂN THỊ GIÁ TIỀN */}
                                                            <div className={`flex items-center gap-1 font-black text-sm ${item.price > 0 ? 'text-blue-600' : 'text-emerald-500'}`}>
                                                                {item.price > 0 ? (
                                                                    <>
                                                                        <span className="text-[10px] text-gray-400 font-medium">dự chi</span>
                                                                        {item.price.toLocaleString()}đ
                                                                    </>
                                                                ) : (
                                                                    "Miễn phí"
                                                                )}
                                                            </div>
                                                        </div>

                                                        <h4 className="text-2xl font-black text-gray-800 mb-2 leading-tight group-hover:text-purple-600 transition-colors">
                                                            {item.activity}
                                                        </h4>

                                                        <p className={`text-xs text-gray-400 flex items-center gap-1 mb-4 opacity-70 ${isLeft ? 'justify-end' : 'justify-start'}`}>
                                                            <MapPin size={12} /> {item.location}
                                                        </p>

                                                        {/* NÚT THÔNG MINH */}
                                                        {getActionButtons(item, regionId)}

                                                        {/* Chỉ báo mũi tên nhỏ nối vào đường line */}
                                                        <div className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45 hidden md:block 
                            ${isLeft ? '-right-2 border-r border-b border-t-0 border-l-0' : '-left-2'}`}>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Icon trung tâm (Knot) */}
                                                <div className="hidden md:flex w-[16%] justify-center relative z-20">
                                                    <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-2xl border-2 border-purple-50 transition-transform group-hover:scale-125 group-hover:rotate-12 duration-500">
                                                        {getActivityIcon(item.activity)}
                                                    </div>
                                                </div>

                                                {/* Khoảng trống đối xứng để tạo hiệu ứng Snake */}
                                                <div className="hidden md:block w-[42%]"></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- BƯỚC 2: LOGIC GỌI AI ---
    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setStep("generating");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/v1/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // Đảm bảo prompt được stringify đúng cách
                body: JSON.stringify({ prompt: prompt.trim() }),
            });

            console.log("check res1", response);

            if (!response.ok) throw new Error("AI không phản hồi");

            const data = await response.json();
            setResult(data);
            setStep("result");
        } catch (error) {
            console.error("Error:", error);
            alert("Có lỗi xảy ra khi tạo lịch trình!");
            setStep("input");
        } finally {
            setLoading(false);
        }
    };

    // --- BƯỚC 3: LOGIC LƯU VÀO DATABASE ---
    const handleSaveTrip = async () => {
        if (!result) return;

        // 1. Lấy Token và Thông tin User từ localStorage
        const token = localStorage.getItem("michi_token");
        const userData = JSON.parse(localStorage.getItem("michi_user") || "{}");

        if (!token) {
            alert("Vui lòng đăng nhập để lưu lịch trình!");
            return;
        }

        try {
            // 2. Trích xuất số người từ prompt (ví dụ: "4 người")
            const matchedMembers = prompt.match(/(\d+)\s*người/);
            const membersCount = matchedMembers ? parseInt(matchedMembers[1]) : 1;

            // 3. Chuẩn bị Body theo Schema mới (có guest_name, phone, email, transport...)
            const tripPayload = {
                region_id: result.region_id || null,
                title: result.title,
                total_days: result.itinerary.length,
                members: membersCount,
                budget_per_person: result.budget_summary.total_per_person,
                total_budget: result.budget_summary.total_per_person * membersCount,

                // Thông tin lấy từ localStorage
                guest_name: userData.full_name || "Khách ẩn danh",
                guest_phone: userData.phone || "Chưa cung cấp",
                guest_email: userData.email || "user@example.com",

                // Các trường bổ sung
                transport: "Tự túc", // Bạn có thể thêm một Select cho người dùng chọn
                special_request: prompt, // Lưu lại prompt gốc như yêu cầu đặc biệt

                ai_result: result, // Toàn bộ object JSON
            };

            // 4. Gọi API với Authorization Header
            const response = await fetch("http://localhost:8000/api/v1/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` // THÊM DÒNG NÀY ĐỂ HẾT LỖI 401
                },
                body: JSON.stringify(tripPayload),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(`🚀 Tuyệt vời! Chuyến đi "${result.title}" đã được lưu.`);
                // Sau khi lưu thành công, có thể chuyển về trang danh sách
                fetchMyTrips();
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.detail || "Không thể lưu vào hệ thống"}`);
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Lỗi kết nối Server khi đang lưu!");
        }
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto z-10">


            {/* Nút nằm ngoài Box chính để không bị che bởi Content */}
            <button
                onClick={fetchMyTrips}
                className="absolute -top-14 right-0 z-50 flex items-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all text-sm font-black text-gray-700 cursor-pointer"
            >
                <Map size={18} className="text-purple-600" />
                Lịch trình của tôi
            </button>

            {/* Trang trí phía sau - Giảm Z-index xuống cực thấp */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob z-0"></div>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 z-0"></div>

            <div className="relative z-20 bg-white border border-gray-100 shadow-2xl rounded-[40px] overflow-hidden p-6 md:p-10">
                {/* HEADER */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <Sparkles className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">AI Trip Planner</h1>
                    <p className="text-gray-500">Lên kế hoạch du lịch thông minh trong 30 giây</p>
                </div>


                {/* INPUT AREA */}
                {step === "input" && (
                    <div className="space-y-6 animate-in fade-in duration-500 !text-black">
                        <div className="relative">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Nhập yêu cầu của bạn (Vị trí, số ngày, số người, ngân sách...)"
                                className="w-full h-40 p-6 text-lg bg-gray-50 border border-gray-100 rounded-[32px] focus:ring-4 focus:ring-purple-500/10 outline-none transition-all resize-none shadow-inner"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim()}
                                className="absolute bottom-4 right-4 p-4 bg-black text-white rounded-2xl hover:bg-gray-800 disabled:opacity-30 transition-all shadow-xl flex items-center gap-2"
                            >
                                <span className="font-bold">Bắt đầu</span>
                                <Send size={18} />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s, i) => (
                                <button key={i} onClick={() => setPrompt(s)} className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-medium hover:bg-white hover:border-purple-400 transition shadow-sm">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}


                {/* LOADING STATE */}
                {step === "generating" && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-20 animate-pulse"></div>
                            <Loader2 className="w-16 h-16 text-purple-600 animate-spin relative z-10" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-black text-gray-800">Đang may đo lịch trình...</h3>
                            <p className="text-gray-500 mt-2">Chúng tôi đang tính toán ngân sách và chọn lọc địa điểm tốt nhất.</p>
                        </div>
                    </div>
                )}

                {/* RESULT STATE */}
                {step === "result" && result && (
                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        {/* CARD NGÂN SÁCH TỔNG */}
                        <div className="mb-8 p-8 bg-gradient-to-br from-gray-900 to-indigo-950 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black mb-4 tracking-tight">{result.title}</h2>
                                <div className="flex flex-wrap items-center gap-6">
                                    <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20">
                                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-1">Dự tính / Người</p>
                                        <p className="text-3xl font-black text-yellow-400">
                                            {result.budget_summary.total_per_person.toLocaleString()} <span className="text-sm font-bold text-white">VND</span>
                                        </p>
                                    </div>
                                    <div className="flex-1 min-w-[200px]">
                                        <p className="text-sm leading-relaxed text-gray-300 italic">
                                            " {result.budget_summary.note} "
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
                        </div>

                        {/* DANH SÁCH LỊCH TRÌNH */}
                        <div className="space-y-10 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pb-10">
                            {result.itinerary.map((day, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute left-4 top-10 bottom-0 w-px bg-dashed border-l border-gray-200"></div>

                                    <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white py-2 z-20">
                                        <div className="w-10 h-10 bg-black text-white rounded-2xl flex items-center justify-center font-black shadow-lg">
                                            {day.day}
                                        </div>
                                        <h3 className="font-black text-2xl text-gray-800">Ngày {day.day}</h3>
                                    </div>

                                    <div className="grid gap-5 ml-12">
                                        {day.items.map((item, iIdx) => (
                                            <div key={iIdx} className="group bg-gray-50/50 rounded-[28px] border border-gray-100 p-1 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                                <div className="flex flex-col md:flex-row gap-5">
                                                    {item.image_url && (
                                                        <div className="md:w-32 md:h-32 w-full h-40 shrink-0 overflow-hidden rounded-[24px]">
                                                            <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                    )}
                                                    <div className="p-4 flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex gap-2">
                                                                <span className="text-xs font-bold px-2 py-1 bg-white border border-gray-200 rounded-lg text-gray-500 uppercase">{item.time}</span>
                                                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${item.type === 'dining' ? 'bg-orange-100 text-orange-600' :
                                                                    item.type === 'hotel' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                                                                    }`}>{item.type}</span>
                                                            </div>
                                                            <p className="font-black text-gray-900">{item.price.toLocaleString()}đ</p>
                                                        </div>
                                                        <h4 className="font-bold text-gray-800 text-lg mb-1">{item.activity}</h4>
                                                        <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
                                                            <MapPin size={12} /> {item.location}
                                                        </div>
                                                        {item.details && (
                                                            <p className="text-sm text-gray-500 bg-white/50 p-3 rounded-xl border border-gray-100">{item.details}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* NÚT ĐIỀU KHIỂN */}
                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={handleSaveTrip}
                                className="flex-[2] py-5 bg-black text-white rounded-3xl font-black shadow-2xl hover:bg-gray-800 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Download size={20} /> Lưu lịch trình
                            </button>
                            <button
                                onClick={() => setStep("input")}
                                className="flex-1 py-5 bg-gray-100 text-gray-600 rounded-3xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={20} /> Làm lại
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}