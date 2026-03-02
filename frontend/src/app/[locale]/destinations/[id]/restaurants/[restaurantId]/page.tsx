"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Star, MapPin, Calendar, Clock, Users,
    MessageSquare, CheckCircle2,
    ArrowLeft, ArrowRight, Utensils, Info, Loader2
} from 'lucide-react';

export default function RestaurantDetailPage() {
    const params = useParams();
    const restaurantId = params.restaurantId; // Lấy ID từ URL folder [restaurantId]

    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);

    const [formData, setFormData] = useState({
        bookingDate: "",
        bookingTime: "",
        guests: 2,
        specialRequest: "",
    });

    // --- GỌI API LẤY DATA THẬT ---
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error("Không thể tải dữ liệu nhà hàng");
                const data = await response.json();
                setRestaurant(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (restaurantId) fetchRestaurant();
    }, [restaurantId]);

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Trạng thái Loading
    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center text-orange-500 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-medium">Đang tải hương vị đặc sắc...</p>
        </div>
    );

    // Trạng thái lỗi hoặc không tìm thấy
    if (!restaurant) return <div className="text-center py-20 font-bold">Không tìm thấy nhà hàng.</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 text-black">
            {/* STEP 0: CHI TIẾT NHÀ HÀNG & THỰC ĐƠN */}
            {step === 0 && (
                <div className="space-y-12 animate-in fade-in duration-500">
                    <div className="grid md:grid-cols-2 gap-10">
                        {/* CỘT TRÁI: HÌNH ẢNH */}
                        <div className="space-y-4">
                            <div className="relative group overflow-hidden rounded-3xl shadow-2xl h-[450px] bg-gray-100">
                                <img
                                    src={restaurant.image_urls?.[0] || "/placeholder-restaurant.jpg"}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                />
                                <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-md ${restaurant.is_active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                    <div className="w-2 h-2 rounded-full animate-pulse bg-white"></div>
                                    {restaurant.is_active ? "Đang mở cửa" : "Tạm nghỉ"}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {restaurant.image_urls?.map((url: string, index: number) => (
                                    <div key={index} className="h-24 rounded-2xl overflow-hidden border-2 border-transparent hover:border-orange-500 cursor-pointer transition shadow-sm">
                                        <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CỘT PHẢI: THÔNG TIN */}
                        <div className="space-y-6">
                            <div>
                                <span className="text-orange-600 font-bold text-sm uppercase tracking-widest">{restaurant.region_name}</span>
                                <h1 className="text-4xl font-black text-gray-900 mt-2">{restaurant.name}</h1>

                                <div className="flex flex-wrap gap-2 mt-4">
                                    {restaurant.tags?.map((tag: string, index: number) => (
                                        <span key={index} className="px-3 py-1 bg-orange-50 text-orange-600 text-[11px] font-bold rounded-full border border-orange-100">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 border-y py-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 text-yellow-500 font-bold text-xl">
                                        <Star size={24} fill="currentColor" />
                                        <span>{restaurant.rating}</span>
                                    </div>
                                    <div className="text-gray-400">|</div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Utensils size={20} className="text-orange-500" />
                                        <span className="font-medium">{restaurant.cuisines_data?.length || 0} Loại món ăn</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2 text-gray-600">
                                    <MapPin size={20} className="text-orange-500 shrink-0 mt-1" />
                                    <span className="text-sm leading-relaxed">{restaurant.address}</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <Info size={20} className="text-orange-500" /> Giới thiệu
                                </h3>
                                <p className="text-gray-600 leading-relaxed italic italic">
                                    "{restaurant.description}"
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    disabled={!restaurant.is_active}
                                    className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 
                    ${restaurant.is_active
                                            ? 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95 shadow-orange-200'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                                >
                                    {restaurant.is_active ? (<>Đặt bàn ngay <ArrowRight size={22} /></>) : "Hẹn gặp lại sau"}
                                </button>
                                <a href={restaurant.map_url} target="_blank" className="p-4 bg-gray-100 rounded-2xl hover:bg-gray-200 transition">
                                    <MapPin size={24} className="text-gray-600" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* THỰC ĐƠN CHI TIẾT (CUISINES_DATA) */}
                    <div className="space-y-8 pb-10">
                        <div className="flex items-end justify-between border-b pb-4">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Thực đơn đặc sắc</h2>
                            <span className="text-orange-600 font-bold">Menu chi tiết</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {restaurant.cuisines_data?.map((item: any) => (
                                <div key={item.id} className="flex gap-4 p-4 rounded-3xl border border-gray-100 hover:border-orange-200 hover:shadow-xl transition bg-white group">
                                    <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-50">
                                        <img src={item.image_url} alt={item.cuisine_name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                    </div>
                                    <div className="flex flex-col justify-between py-1 flex-1">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-lg text-gray-900">{item.cuisine_name}</h4>
                                                <span className="text-orange-600 font-black">
                                                    {parseInt(item.price_range || "0").toLocaleString()}đ
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 rounded text-gray-500">
                                                {item.price_range ? "Giá từ" : "Liên hệ giá"}
                                            </span>
                                            {item.is_available ? (
                                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                                    <CheckCircle2 size={14} /> Sẵn sàng
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-red-400">Hết món</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* GIAI ĐOẠN ĐẶT BÀN (STEP 1, 2, 3) */}
            {step > 0 && (
                <div className="max-w-3xl mx-auto py-10">
                    {/* PROGRESS BAR (GIỐNG HOTEL) */}
                    <div className="flex justify-between mb-12 relative">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="z-10 flex flex-col items-center gap-2">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 shadow-md ${step >= s ? 'bg-orange-600 text-white scale-110' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > s ? <CheckCircle2 size={24} /> : s}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-tighter ${step >= s ? 'text-orange-600' : 'text-gray-400'}`}>
                                    {s === 1 ? "Thời gian" : s === 2 ? "Ghi chú" : "Xác nhận"}
                                </span>
                            </div>
                        ))}
                        {/* Đường nối giữa các bước */}
                        <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 -z-0">
                            <div
                                className="h-full bg-orange-600 transition-all duration-500"
                                style={{ width: `${(step - 1) * 50}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* NỘI DUNG CÁC BƯỚC */}
                    <div className="min-h-[400px]">
                        {/* Step 1: Chọn ngày & giờ */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-10">
                                <div className="text-center">
                                    <h2 className="text-3xl font-black italic text-gray-900">Thời gian dùng bữa</h2>
                                    <p className="text-gray-500 mt-2">Hãy chọn thời điểm tuyệt vời nhất để thưởng thức ẩm thực</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2 text-gray-700"><Calendar size={16} /> Ngày đến</label>
                                        <input type="date" className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-orange-500 outline-none transition shadow-sm" value={formData.bookingDate} onChange={(e) => updateForm("bookingDate", e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold flex items-center gap-2 text-gray-700"><Clock size={16} /> Giờ đến</label>
                                        <input type="time" className="w-full border-2 border-gray-100 p-4 rounded-2xl focus:border-orange-500 outline-none transition shadow-sm" value={formData.bookingTime} onChange={(e) => updateForm("bookingTime", e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-bold flex items-center gap-2 text-gray-700"><Users size={16} /> Số lượng khách đi cùng</label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {[2, 4, 6, 8, 10].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => updateForm("guests", num)}
                                                className={`py-4 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center gap-1 ${formData.guests === num ? 'border-orange-600 bg-orange-50 text-orange-600 shadow-inner' : 'border-gray-100 hover:bg-gray-50 text-gray-400'}`}
                                            >
                                                <span className="text-lg">{num === 10 ? "10+" : num}</span>
                                                <span className="text-[9px] uppercase">Khách</span>
                                                {formData.guests === num && <CheckCircle2 size={12} className="absolute top-2 right-2" />}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-center text-gray-400 italic mt-2">Vui lòng liên hệ nhà hàng nếu đoàn đi trên 20 người</p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Ghi chú & Yêu cầu */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-10">
                                <h2 className="text-2xl font-black flex items-center gap-2 text-gray-900">
                                    <MessageSquare className="text-orange-600" /> Yêu cầu cho nhà hàng
                                </h2>
                                <textarea
                                    placeholder="Ví dụ: Bàn gần cửa sổ, tổ chức sinh nhật, dị ứng hải sản..."
                                    className="w-full border-2 border-gray-100 p-6 rounded-3xl h-40 focus:border-orange-500 outline-none transition text-lg shadow-sm"
                                    value={formData.specialRequest}
                                    onChange={(e) => updateForm("specialRequest", e.target.value)}
                                ></textarea>
                                <div className="p-4 bg-orange-50 rounded-2xl flex gap-3 text-orange-800 text-sm border border-orange-100">
                                    <Info className="shrink-0 mt-0.5" />
                                    <span>Ghi chú của bạn sẽ giúp nhà hàng chuẩn bị không gian chu đáo hơn. Bạn có thể chọn món trực tiếp khi đến quán.</span>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Xác nhận */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-10">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900">Xác nhận thông tin</h2>
                                </div>

                                <div className="bg-white p-8 rounded-3xl border-2 border-orange-100 shadow-xl shadow-orange-900/5 space-y-4">
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <span className="text-gray-500 font-medium">Nhà hàng:</span>
                                        <span className="font-bold text-lg text-gray-900">{restaurant.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <span className="text-gray-500 font-medium">Thời gian:</span>
                                        <span className="font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                                            {formData.bookingDate} | {formData.bookingTime}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-b pb-4">
                                        <span className="text-gray-500 font-medium">Số lượng khách:</span>
                                        <div className="flex items-center gap-2 font-bold text-gray-900">
                                            <Users size={18} className="text-orange-500" />
                                            <span>{formData.guests} người lớn</span>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-gray-500 font-medium block mb-2">Lời nhắn đặc biệt:</span>
                                        <p className="italic text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            {formData.specialRequest || "Không có yêu cầu đặc biệt"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Buttons Navigation */}
                        <div className="flex justify-between mt-12">
                            <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-8 py-4 font-bold text-gray-400 hover:text-gray-600 transition">
                                <ArrowLeft size={20} /> Quay lại
                            </button>
                            <button
                                onClick={() => step === 3 ? alert("Đặt bàn thành công!") : setStep(step + 1)}
                                className="bg-gray-900 text-white px-12 py-4 rounded-2xl font-bold shadow-xl active:scale-95 transition hover:bg-black"
                            >
                                {step === 3 ? "Hoàn tất đặt bàn" : "Tiếp theo"}
                            </button>
                        </div>
                    </div>
                </div>
            )};
        </div>
    )
}