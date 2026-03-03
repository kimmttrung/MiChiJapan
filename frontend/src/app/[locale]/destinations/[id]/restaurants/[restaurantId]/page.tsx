"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Star, MapPin, Calendar, Clock, Users,
    MessageSquare, CheckCircle2,
    ArrowLeft, ArrowRight, Utensils, Info, Loader2
} from 'lucide-react';
import { useLocale } from 'next-intl';

export default function RestaurantDetailPage() {
    const locale = useLocale();
    const params = useParams();
    const restaurantId = params.restaurantId;

    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // 1. CẬP NHẬT FORM DATA (Thêm thông tin khách hàng)
    const [formData, setFormData] = useState({
        restaurant_id: 0,
        bookingDate: "",
        bookingTime: "",
        guests: 2,
        specialRequest: "",
        guest_full_name: "", // Sẽ lấy từ Profile hoặc User nhập
        guest_email: "",
        guest_phone: ""
    });

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const response = await fetch(`http://localhost:8000/api/restaurants/${restaurantId}`);
                if (!response.ok) throw new Error("Không thể tải dữ liệu nhà hàng");
                const data = await response.json();
                setRestaurant(data);
                // 2. MẶC ĐỊNH CHỌN ẢNH ĐẦU TIÊN KHI DATA LOAD XONG
                if (data.image_urls && data.image_urls.length > 0) {
                    setSelectedImage(data.image_urls[0]);
                }

                updateForm("restaurant_id", data.id);
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

    // 2. HÀM XỬ LÝ ĐẶT BÀN (CALL API)
    const handleBooking = async () => {
        const token = localStorage.getItem("michi_token");
        if (!token) {
            alert("Vui lòng đăng nhập để đặt bàn!");
            return;
        }

        // Map dữ liệu từ State sang định dạng Schema Backend
        const bookingPayload = {
            restaurant_id: formData.restaurant_id,
            guest_full_name: formData.guest_full_name || "Khách hàng", // Nên có bước nhập tên
            guest_email: formData.guest_email || "email@example.com",
            guest_phone: formData.guest_phone || "0123456789",
            booking_date: formData.bookingDate,
            booking_time: formData.bookingTime,
            guests: formData.guests,
            special_request: formData.specialRequest
        };

        try {
            const response = await fetch("http://localhost:8000/api/restaurant-bookings/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bookingPayload)
            });

            if (response.ok) {
                alert("🎉 Đặt bàn thành công! Vui lòng chờ xác nhận.");
                window.location.href = `/${locale}/bookings` // Chuyển hướng về trang lịch sử
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.detail}`);
            }
        } catch (error) {
            console.error("Booking Error:", error);
            alert("Không thể kết nối đến máy chủ.");
        }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center text-orange-500 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-medium">Đang tải hương vị đặc sắc...</p>
        </div>
    );

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
                                {/* 3. HIỂN THỊ ẢNH ĐANG CHỌN */}
                                <img
                                    src={selectedImage || "/placeholder-restaurant.jpg"}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover transition duration-700 animate-in fade-in"
                                />
                                <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-md ${restaurant.is_active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                    <div className="w-2 h-2 rounded-full animate-pulse bg-white"></div>
                                    {restaurant.is_active ? "Đang mở cửa" : "Tạm nghỉ"}
                                </div>
                            </div>

                            {/* 4. LIST ẢNH CON: CLICK ĐỂ THAY ĐỔI ẢNH CHÍNH */}
                            <div className="grid grid-cols-4 gap-4">
                                {restaurant.image_urls?.map((url: string, index: number) => (
                                    <div
                                        key={index}
                                        onClick={() => setSelectedImage(url)} // Cập nhật state khi click
                                        className={`h-24 rounded-2xl overflow-hidden border-2 transition shadow-sm cursor-pointer ${selectedImage === url ? 'border-orange-500' : 'border-transparent hover:border-orange-200'
                                            }`}
                                    >
                                        <img
                                            src={url}
                                            alt={`Gallery ${index}`}
                                            className={`w-full h-full object-cover transition duration-300 ${selectedImage === url ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                        />
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
            {/* GIAI ĐOẠN ĐẶT BÀN */}
            {step > 0 && (
                <div className="max-w-3xl mx-auto py-10">
                    {/* Progress Bar */}
                    <div className="flex justify-between mb-12 relative">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="z-10 flex flex-col items-center gap-2">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 shadow-md ${step >= s ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {step > s ? <CheckCircle2 size={24} /> : s}
                                </div>
                            </div>
                        ))}
                        <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 -z-0">
                            <div className="h-full bg-orange-600 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
                        </div>
                    </div>

                    <div className="min-h-[400px]">
                        {/* Step 1: Date & Time & Guests */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in slide-in-from-right-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <input type="date" className="p-4 border-2 rounded-2xl" value={formData.bookingDate} onChange={(e) => updateForm("bookingDate", e.target.value)} />
                                    <input type="time" className="p-4 border-2 rounded-2xl" value={formData.bookingTime} onChange={(e) => updateForm("bookingTime", e.target.value)} />
                                </div>
                                <div className="grid grid-cols-5 gap-3">
                                    {[2, 4, 6, 8, 10].map(num => (
                                        <button key={num} onClick={() => updateForm("guests", num)} className={`py-4 border-2 rounded-2xl ${formData.guests === num ? 'border-orange-600 bg-orange-50' : ''}`}>{num} Khách</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Thông tin liên hệ & Ghi chú */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in slide-in-from-right-10">
                                <h2 className="text-xl font-bold">Thông tin liên hệ</h2>
                                <input type="text" placeholder="Họ tên người đặt" className="w-full p-4 border-2 rounded-xl" value={formData.guest_full_name} onChange={(e) => updateForm("guest_full_name", e.target.value)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="email" placeholder="Email" className="p-4 border-2 rounded-xl" value={formData.guest_email} onChange={(e) => updateForm("guest_email", e.target.value)} />
                                    <input type="tel" placeholder="Số điện thoại" className="p-4 border-2 rounded-xl" value={formData.guest_phone} onChange={(e) => updateForm("guest_phone", e.target.value)} />
                                </div>
                                <textarea placeholder="Yêu cầu đặc biệt..." className="w-full p-4 border-2 rounded-xl h-32" value={formData.specialRequest} onChange={(e) => updateForm("specialRequest", e.target.value)}></textarea>
                            </div>
                        )}

                        {/* Step 3: Xác nhận */}
                        {step === 3 && (
                            <div className="p-8 bg-gray-50 rounded-3xl border-2 border-dashed space-y-4">
                                <p><strong>Nhà hàng:</strong> {restaurant.name}</p>
                                <p><strong>Thời gian:</strong> {formData.bookingDate} | {formData.bookingTime}</p>
                                <p><strong>Số khách:</strong> {formData.guests}</p>
                                <p><strong>Người đặt:</strong> {formData.guest_full_name}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between mt-12">
                        <button onClick={() => setStep(step - 1)} className="px-8 py-4 font-bold text-gray-400">Quay lại</button>
                        <button
                            onClick={() => step === 3 ? handleBooking() : setStep(step + 1)}
                            className="bg-orange-600 text-white px-12 py-4 rounded-2xl font-bold shadow-lg"
                        >
                            {step === 3 ? "Xác nhận đặt bàn" : "Tiếp theo"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}