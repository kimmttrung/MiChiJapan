"use client";

import { useState } from "react";
import { Sparkles, Send, Calendar, Users, Wallet, MapPin, Plane, Loader2, Utensils, Map, Hotel, ChevronRight, Download, RefreshCcw } from "lucide-react";

// --- Định nghĩa Interface cho dữ liệu từ API ---
interface TripItem {
    time: string;
    activity: string;
    location: string;
    type: "visit" | "dining" | "hotel" | "relaxation" | "shopping" | "departure";
    price: number;        // Thêm trường này
    image_url: string;    // Thêm trường này
    details: string;      // Thêm trường này (Menu/Mô tả)
}

interface DayPlan {
    day: number;
    title: string;
    items: TripItem[];
}

interface TripData {
    title: string;
    summary: string;
    itinerary: DayPlan[];
}

export default function AITripPlanner() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"input" | "generating" | "result">("input");
    const [result, setResult] = useState<TripData | null>(null);

    const suggestions = [
        "🌸 5 ngày ngắm hoa anh đào ở Tokyo",
        "🍜 Food tour Osaka giá rẻ",
        "⛩️ Khám phá văn hóa Kyoto cổ kính",
        "❄️ Trượt tuyết ở Hokkaido cho gia đình",
    ];

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setStep("generating");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/v1/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: prompt }),
            });

            const data = await response.json();
            setResult(data);
            setStep("result");
        } catch (error) {
            console.error("Error generating trip:", error);
            alert("Có lỗi xảy ra, vui lòng thử lại!");
            setStep("input");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTrip = async () => {
        if (!result) return;
        try {
            // API lưu vào bảng `trips` trong database của bạn
            const response = await fetch("http://localhost:8000/api/v1/trips/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ai_result: result,
                    total_days: result.itinerary.length,
                    // Các thông tin khác bạn có thể trích xuất từ prompt hoặc state
                }),
            });
            if (response.ok) alert("Đã lưu lịch trình thành công!");
        } catch (error) {
            alert("Lỗi khi lưu lịch trình!");
        }
    };

    // Hàm trả về Icon tương ứng với loại hoạt động
    const getIcon = (type: string) => {
        switch (type) {
            case "dining": return <Utensils size={14} className="text-orange-500" />;
            case "hotel": return <Hotel size={14} className="text-blue-500" />;
            default: return <MapPin size={14} className="text-purple-500" />;
        }
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto z-10">
            {/* BACKGROUND DECORATION */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            {/* MAIN CARD */}
            <div className="relative z-20 bg-white border border-white/50 shadow-2xl rounded-3xl overflow-hidden p-8 md:p-12 transition-all duration-500">

                {/* HEADER */}
                <div className="relative z-30 text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <Sparkles className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">AI Trip Planner</h1>
                    <p className="text-gray-500 text-lg">Hành trình chi tiết từ dữ liệu thực tế.</p>
                </div>

                {/* INPUT AREA */}
                {step === "input" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative group">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Bạn muốn đi đâu? Ví dụ: Lên kế hoạch đi Phú Quốc 3 ngày..."
                                className="w-full h-40 p-6 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none shadow-inner"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim()}
                                className="absolute bottom-4 right-4 p-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        {/* Suggestions Chips */}
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s, i) => (
                                <button key={i} onClick={() => setPrompt(s)} className="px-4 py-2 bg-white border border-gray-100 rounded-full text-sm hover:border-purple-300 transition shadow-sm">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* LOADING STATE */}
                {step === "generating" && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-in fade-in duration-500">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse"></div>
                            <Loader2 className="w-16 h-16 text-purple-600 animate-spin relative z-10" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Đang thiết kế lịch trình...</h3>
                        <p className="text-gray-500 max-w-md text-center">
                            AI đang tìm kiếm các địa điểm tốt nhất, kiểm tra giá vé và tối ưu hóa đường đi cho bạn.
                        </p>
                    </div>
                )}

                {/* RESULT STATE - HIỂN THỊ DATA THẬT */}
                {step === "result" && result && (
                    <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto">
                        {/* HEADER: Tên chuyến đi & Tổng ngân sách */}
                        <div className="mb-8 p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black mb-2 tracking-tight">{result.title}</h2>
                                <div className="flex flex-wrap items-center gap-4 mt-4">
                                    <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/30">
                                        <p className="text-[10px] uppercase font-bold tracking-wider opacity-80">Tổng chi phí / người</p>
                                        <p className="text-2xl font-black">
                                            {result.budget_summary?.total_per_person.toLocaleString()} <span className="text-sm font-normal">VND</span>
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium opacity-90 max-w-[200px] leading-relaxed">
                                        ✨ {result.budget_summary?.note || "Lịch trình đã được tối ưu theo ngân sách của bạn"}
                                    </p>
                                </div>
                            </div>
                            {/* Trang trí decor nhẹ */}
                            <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                        </div>

                        {/* ITINERARY LIST */}
                        <div className="space-y-12 h-[600px] overflow-y-auto pr-4 custom-scrollbar pb-10">
                            {result.itinerary.map((day, idx) => (
                                <div key={idx} className="relative">
                                    {/* Đường line timeline dọc */}
                                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gradient-to-b from-purple-200 to-transparent"></div>

                                    {/* Tiêu đề ngày */}
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-purple-200 z-10">
                                            {day.day}
                                        </div>
                                        <h3 className="font-black text-2xl text-gray-800 tracking-tight">
                                            Ngày {day.day}
                                        </h3>
                                    </div>

                                    <div className="grid gap-6 ml-10">
                                        {day.items.map((item: any, iIdx: number) => (
                                            <div key={iIdx} className="group bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                                <div className="flex flex-col md:flex-row">
                                                    {/* Khối ảnh (nếu có) */}
                                                    {item.image_url && (
                                                        <div className="md:w-40 w-full h-32 md:h-auto overflow-hidden">
                                                            <img
                                                                src={item.image_url}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                alt={item.location}
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="p-5 flex-1">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                                                    {item.time}
                                                                </span>
                                                                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${item.type === 'dining' ? 'bg-orange-50 text-orange-600' :
                                                                    item.type === 'hotel' ? 'bg-blue-50 text-blue-600' :
                                                                        'bg-green-50 text-green-600'
                                                                    }`}>
                                                                    {item.type}
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Dự tính</p>
                                                                <p className="font-black text-gray-900 leading-none">
                                                                    {item.price?.toLocaleString()} <span className="text-[10px]">đ</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <h4 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                                                            {item.activity}
                                                        </h4>

                                                        <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-3">
                                                            <MapPin size={14} className="text-purple-400" />
                                                            <span className="font-medium">{item.location}</span>
                                                        </div>

                                                        {item.details && (
                                                            <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-600 leading-relaxed border border-gray-100">
                                                                {item.details}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-8 flex items-center gap-4 bg-white p-4 rounded-[28px] shadow-lg border border-gray-100">
                            <button
                                onClick={handleSaveTrip}
                                className="flex-[2] py-4 bg-black text-white rounded-2xl font-bold shadow-lg hover:shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={20} /> Lưu lịch trình ngay
                            </button>
                            <button
                                onClick={() => setStep("input")}
                                className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw size={20} /> Tạo lại
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}