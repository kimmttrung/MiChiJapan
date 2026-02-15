// src/components/AI/AITripPlanner.tsx
"use client";

import { useState } from "react";
import { Sparkles, Send, Calendar, Users, Wallet, MapPin, Plane, Loader2 } from "lucide-react";

export default function AITripPlanner() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"input" | "generating" | "result">("input");

    // Dữ liệu giả lập cho các thẻ gợi ý (Quick Chips)
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

        // Giả lập gọi API (sau này bạn thay bằng fetch thật)
        setTimeout(() => {
            setLoading(false);
            setStep("result");
        }, 3000);
    };

    return (
        <div className="relative w-full max-w-4xl mx-auto z-10">
            {/* BACKGROUND DECORATION */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            {/* MAIN CARD */}
            <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden p-8 md:p-12 transition-all duration-500">

                {/* HEADER */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                        <Sparkles className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                        AI Trip Planner
                    </h1>
                    <p className="text-gray-500 text-lg">
                        Lên kế hoạch chuyến đi trong mơ chỉ trong vài giây.
                    </p>
                </div>

                {/* INPUT AREA */}
                {step === "input" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Prompt Input */}
                        <div className="relative group">
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ví dụ: Tôi muốn đi du lịch Nhật Bản 7 ngày, thích anime và đồ ăn đường phố, ngân sách khoảng 20 triệu..."
                                className="w-full h-40 p-6 pr-14 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all resize-none shadow-inner text-gray-700 placeholder:text-gray-400"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={!prompt.trim()}
                                className="absolute bottom-4 right-4 p-3 bg-black text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-purple-500/30"
                            >
                                <Send size={20} />
                            </button>
                        </div>

                        {/* Quick Options / Filters (Optional enhancements) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-purple-200 transition cursor-pointer">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={18} /></div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Thời gian</span>
                                    <span className="text-sm font-semibold text-gray-700">Chọn ngày</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-purple-200 transition cursor-pointer">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Wallet size={18} /></div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Ngân sách</span>
                                    <span className="text-sm font-semibold text-gray-700">Tùy chọn</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-purple-200 transition cursor-pointer">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Users size={18} /></div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Đồng hành</span>
                                    <span className="text-sm font-semibold text-gray-700">Một mình</span>
                                </div>
                            </div>
                        </div>

                        {/* Suggestions Chips */}
                        <div className="pt-4">
                            <p className="text-sm text-gray-400 font-medium mb-3">Gợi ý cho bạn:</p>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPrompt(s)}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition shadow-sm"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
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

                {/* RESULT STATE (Placeholder) */}
                {step === "result" && (
                    <div className="animate-in zoom-in-95 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Lịch trình đề xuất</h3>
                            <button
                                onClick={() => setStep("input")}
                                className="text-sm text-purple-600 hover:underline"
                            >
                                Tạo lại
                            </button>
                        </div>

                        {/* Demo Result Card */}
                        <div className="space-y-4 h-96 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=300")' }}></div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Ngày 1: Đến Tokyo</h4>
                                    <p className="text-sm text-gray-500 line-clamp-2">Check-in khách sạn tại Shinjuku, tham quan đền Meiji Jingu và dạo phố đêm Kabukicho.</p>
                                    <div className="flex gap-2 mt-2">
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">🏰 Tham quan</span>
                                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">🍜 Ăn uống</span>
                                    </div>
                                </div>
                            </div>
                            {/* ... Thêm các item khác ... */}
                            <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed">
                                Đây là giao diện demo kết quả. Bạn sẽ tích hợp API render lịch trình vào đây.
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button className="flex-1 py-3 bg-black text-white rounded-xl font-medium shadow-lg hover:bg-gray-800 transition">
                                Lưu lịch trình
                            </button>
                            <button className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition">
                                <Plane size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}