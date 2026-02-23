"use client";

import { useState } from "react";
import { Sparkles, Send, MapPin, Loader2, Utensils, Hotel, Download, RefreshCcw, ChevronRight, Map, Pencil, Trash2 } from "lucide-react";

// --- BƯỚC 1: ĐỊNH NGHĨA INTERFACE CHUẨN ---
interface TripItem {
    time: string;
    activity: string;
    location: string;
    type: "visit" | "dining" | "hotel" | "relaxation" | "shopping" | "departure";
    price: number;
    image_url?: string;
    details?: string;
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
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<"input" | "generating" | "result">("input");
    const [result, setResult] = useState<TripData | null>(null);

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
            const res = await fetch("http://localhost:8000/api/v1/my-trips");
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
    const getActivityIcon = (activity: string, type: string) => {
        const text = activity.toLowerCase();
        if (text.includes("biển") || text.includes("beach") || text.includes("đảo")) return "🏖️";
        if (text.includes("núi") || text.includes("mountain") || text.includes("leo")) return "⛰️";
        if (text.includes("ăn") || type === "dining") return "🍱";
        if (text.includes("ngủ") || type === "hotel") return "🏨";
        if (text.includes("bay") || text.includes("sân bay")) return "✈️";
        if (text.includes("mua") || text.includes("shopping")) return "🛍️";
        if (text.includes("đền") || text.includes("chùa") || text.includes("shrine")) return "⛩️";
        return "📍";
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

        return (
            <div className="w-full animate-in zoom-in-95 duration-500">
                <button
                    onClick={() => setView("list")}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-black font-bold"
                >
                    ← Quay lại danh sách
                </button>

                <div className="flex flex-col items-center gap-4 mb-10">

                    {/* TITLE */}
                    {isEditing ? (
                        <input
                            value={editedTrip.title}
                            onChange={(e) =>
                                setEditedTrip({ ...editedTrip, title: e.target.value })
                            }
                            className="text-3xl font-black border-b text-center outline-none !text-black"
                        />
                    ) : (
                        <h2 className="text-3xl font-black !text-black">
                            {tripData.title}
                        </h2>
                    )}

                    {/* BUTTONS */}
                    <div className="flex gap-4">

                        <button
                            className="p-2 rounded-xl hover:bg-blue-50 text-blue-500"
                            onClick={() => {
                                setEditedTrip(JSON.parse(JSON.stringify(selectedTrip)));
                                setIsEditing(true);
                            }}
                        >
                            <Pencil size={18} />
                        </button>

                        <button
                            className="p-2 rounded-xl hover:bg-red-50 text-red-500"
                            onClick={async () => {
                                if (!confirm("Bạn chắc chắn muốn xóa?")) return;

                                await fetch(
                                    `http://localhost:8000/api/v1/trips/${selectedTrip.id}`,
                                    { method: "DELETE" }
                                );

                                setView("list");
                                fetchMyTrips();
                            }}
                        >
                            <Trash2 size={18} />
                        </button>

                    </div>

                    {/* SAVE BUTTON */}
                    {isEditing && (
                        <div className="flex gap-4">
                            <button
                                className="px-4 py-2 bg-green-500 text-white rounded-xl"
                                onClick={async () => {

                                    const res = await fetch(
                                        `http://localhost:8000/api/v1/trips/${selectedTrip.id}`,
                                        {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                title: editedTrip.title,
                                                region_id: editedTrip.region_id ?? null,
                                                total_days: editedTrip.ai_result.itinerary.length,
                                                total_budget: editedTrip.total_budget ?? 0,
                                                members: editedTrip.members ?? 1,
                                                budget_per_person: editedTrip.budget_per_person ?? 0,
                                                itinerary: editedTrip.ai_result.itinerary
                                            })
                                        }
                                    );

                                    if (!res.ok) {
                                        const err = await res.json();
                                        console.log(err);
                                        alert("Lỗi: " + JSON.stringify(err));
                                        return;
                                    }

                                    setSelectedTrip(editedTrip);
                                    setIsEditing(false);
                                }}
                            >
                                Lưu
                            </button>

                            <button
                                className="px-4 py-2 bg-gray-300 rounded-xl"
                                onClick={() => setIsEditing(false)}
                            >
                                Huỷ
                            </button>
                        </div>
                    )}
                </div>

                {/* ITINERARY */}
                <div className="flex flex-col gap-16 relative">

                    {tripData.ai_result.itinerary.map((day, dIdx) => (
                        <div key={dIdx}>

                            <div className="bg-black text-white px-6 py-2 rounded-full w-max mx-auto mb-10 font-black">
                                NGÀY {day.day}
                            </div>

                            <div className="flex flex-wrap justify-center gap-8">

                                {day.items.map((item, iIdx) => (

                                    <div key={iIdx} className="flex flex-col items-center w-40 text-center">

                                        {/* ICON + TIME */}
                                        <div className="relative w-20 h-20 bg-white rounded-full shadow flex items-center justify-center text-4xl mb-3">

                                            {getActivityIcon(item.activity, item.type)}

                                            {isEditing ? (
                                                <input
                                                    value={editedTrip.ai_result.itinerary[dIdx].items[iIdx].time}
                                                    onChange={(e) => {
                                                        const clone = JSON.parse(JSON.stringify(editedTrip));
                                                        clone.ai_result.itinerary[dIdx].items[iIdx].time = e.target.value;
                                                        setEditedTrip(clone);
                                                    }}
                                                    className="absolute -bottom-3 text-[10px] border rounded text-center w-16 !text-black"
                                                />
                                            ) : (
                                                <span className="absolute -bottom-3 text-[10px] bg-black text-white px-2 rounded ">
                                                    {item.time}
                                                </span>
                                            )}
                                        </div>

                                        {/* ACTIVITY */}
                                        {isEditing ? (
                                            <input
                                                value={editedTrip.ai_result.itinerary[dIdx].items[iIdx].activity}
                                                onChange={(e) => {
                                                    const clone = JSON.parse(JSON.stringify(editedTrip));
                                                    clone.ai_result.itinerary[dIdx].items[iIdx].activity = e.target.value;
                                                    setEditedTrip(clone);
                                                }}
                                                className="font-bold text-sm border-b text-center outline-none !text-black"
                                            />
                                        ) : (
                                            <p className="font-bold text-sm !text-black">
                                                {item.activity}
                                            </p>
                                        )}

                                        {/* LOCATION */}
                                        {isEditing ? (
                                            <input
                                                value={editedTrip.ai_result.itinerary[dIdx].items[iIdx].location}
                                                onChange={(e) => {
                                                    const clone = JSON.parse(JSON.stringify(editedTrip));
                                                    clone.ai_result.itinerary[dIdx].items[iIdx].location = e.target.value;
                                                    setEditedTrip(clone);
                                                }}
                                                className="text-[10px] text-gray-400 text-center border-b outline-none"
                                            />
                                        ) : (
                                            <p className="text-[10px] text-gray-400">
                                                {item.location}
                                            </p>
                                        )}

                                    </div>
                                ))}

                            </div>
                        </div>
                    ))}
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
                body: JSON.stringify({ prompt: prompt }),
            });

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

        try {
            // Logic lấy số người: tìm số trong prompt, nếu không thấy mặc định là 1
            const matchedMembers = prompt.match(/(\d+)\s*người/);
            const membersCount = matchedMembers ? parseInt(matchedMembers[1]) : 1;

            const tripData = {
                region_id: result.region_id,
                title: result.title,
                total_days: result.itinerary.length,
                members: membersCount,
                budget_per_person: result.budget_summary.total_per_person,
                total_budget: result.budget_summary.total_per_person * membersCount,
                ai_result: result,
            };

            const response = await fetch("http://localhost:8000/api/v1/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tripData),
            });

            if (response.ok) {
                alert(`🚀 Đã lưu thành công chuyến đi: ${result.title}`);
            } else {
                alert("Lỗi khi lưu vào Database");
            }
        } catch (error) {
            alert("Lỗi kết nối Server!");
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