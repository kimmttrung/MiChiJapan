"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Star, MapPin, Calendar, Users, MessageSquare, Wallet, Car, Plane, Train,
    CheckCircle2, CreditCard, Landmark, ArrowRight, ArrowLeft, XCircle
} from "lucide-react";
import { useLocale } from "next-intl";
import { Toaster, toast } from "sonner";

export default function HotelDetailPage() {
    const { hotelId } = useParams();
    const router = useRouter();
    const [hotel, setHotel] = useState<any>(null);
    const [step, setStep] = useState(0);

    // 1. Quản lý dữ liệu Form
    const [formData, setFormData] = useState({
        checkIn: "",
        checkOut: "",
        guests: 1,
        purpose: "Nghỉ dưỡng gia đình",
        specialRequest: "",
        transport: "",
        paymentMethod: "",
    });
    // Hàm lấy thông tin user từ localStorage
    const getLocalUser = () => {
        const userStr = localStorage.getItem("michi_user");
        return userStr ? JSON.parse(userStr) : null;
    };

    const updateForm = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // 2. Fetch data hotel
    useEffect(() => {
        fetch(`http://localhost:8000/api/hotels/${hotelId}`)
            .then(res => res.json())
            .then(data => setHotel(data));
    }, [hotelId]);
    console.log("check hotel", hotel);

    // 3. Logic tính toán số đêm và tổng tiền
    const calculateNights = () => {
        if (!formData.checkIn || !formData.checkOut) return 0;
        const start = new Date(formData.checkIn);
        const end = new Date(formData.checkOut);
        const diff = end.getTime() - start.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const totalNights = calculateNights();
    const totalAmount = totalNights * (hotel?.price_per_night || 0);

    // 4. Kiểm tra điều kiện trước khi qua bước tiếp theo
    const handleNext = () => {
        if (step === 1) {
            if (!formData.checkIn || !formData.checkOut) return toast.error("Vui lòng chọn ngày đi và về!");
            if (totalNights <= 0) return toast.error("Ngày trả phòng phải sau ngày nhận phòng!");
            if (formData.guests <= 0) return toast.error("Số lượng khách phải ít nhất là 1!");
        }
        if (step === 2) {
            if (!formData.transport) return toast.error("Vui lòng chọn phương tiện di chuyển!");
        }
        setStep(step + 1);
    };
    const locale = useLocale();

    // 5. Hàm Submit Booking (POST API)
    const handleBooking = async () => {
        const token = localStorage.getItem("michi_token"); // Lấy token từ local storage
        const user = getLocalUser();
        if (!token || !user) {
            toast.error("Vui lòng đăng nhập để đặt phòng!");
            return router.push(`/${locale}/login`);
        }

        const bookingData = {
            hotel_id: Number(hotelId),
            check_in: formData.checkIn,
            check_out: formData.checkOut,
            guests: formData.guests,
            guest_full_name: user.full_name,
            guest_email: user.email,
            guest_phone: user.phone || "Chưa cung cấp",
            special_request: formData.specialRequest || "Không có yêu cầu đặc biệt",
            total_nights: totalNights,
            total_amount: totalAmount,
            status: "pending"
        };

        try {
            const response = await fetch("http://localhost:8000/api/bookings/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                toast.success("Đặt phòng thành công!");
                router.push(`/${locale}/planning`); // Chuyển hướng về trang quản lý đơn hàng
            } else {
                const error = await response.json();
                toast.error(`Lỗi: ${error.detail || "Không thể đặt phòng"}`);
            }
        } catch (err) {
            toast.error("Lỗi kết nối máy chủ!");
        }
    };

    if (!hotel) return <div className="p-10 text-center">Đang tải...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 text-black">
            {/* ... (Phần Step 0: Giữ nguyên giao diện Detail bạn đã có) ... */}
            {step === 0 && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* PHẦN HÌNH ẢNH - GALLERY */}
                        <div className="space-y-4">
                            <div className="relative group overflow-hidden rounded-3xl shadow-lg h-[400px]">
                                <img
                                    src={hotel.image_urls[0]}
                                    alt={hotel.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                />
                                {/* Badge Trạng thái (isActive) */}
                                <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-md ${hotel.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    <div className={`w-2 h-2 rounded-full animate-pulse bg-white`}></div>
                                    {hotel.is_active ? "Đang hoạt động" : "Tạm ngưng"}
                                </div>
                            </div>

                            {/* Hiển thị tất cả ảnh trong Array */}
                            <div className="grid grid-cols-4 gap-4">
                                {hotel.image_urls.map((url: string, index: number) => (
                                    <div key={index} className="h-20 rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 cursor-pointer transition">
                                        <img src={url} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* PHẦN NỘI DUNG CHI TIẾT */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{hotel.name}</h1>

                                {/* Tags đầy đủ */}
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {hotel.tags?.map((tag: string, index: number) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-semibold rounded-lg border border-blue-100"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 border-y py-4">
                                <div className="flex items-center gap-2 text-yellow-500 font-bold text-lg">
                                    <Star size={20} fill="currentColor" />
                                    <span>{hotel.rating} / 5</span>
                                </div>
                                {/* Hiển thị Địa chỉ (Address) */}
                                <div className="flex items-start gap-2 text-gray-600">
                                    <MapPin size={20} className="text-blue-500 shrink-0 mt-0.5" />
                                    <span className="text-sm italic">{hotel.address}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-bold text-gray-800">Mô tả</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">
                                    {hotel.description}
                                </p>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Giá mỗi đêm</p>
                                    <div className="text-3xl font-black text-blue-600">
                                        {hotel.price_per_night?.toLocaleString()} <span className="text-lg">VNĐ</span>
                                    </div>
                                </div>

                                {/* Link bản đồ từ map_url */}
                                <a
                                    href={hotel.map_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center text-blue-500 hover:text-blue-700 transition"
                                >
                                    <MapPin size={24} />
                                    <span className="text-[10px] font-bold">Xem bản đồ</span>
                                </a>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                disabled={!hotel.is_active}
                                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 
                        ${hotel.is_active
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-70'}`}
                            >
                                {hotel.is_active ? (
                                    <>Bắt đầu đặt phòng ngay <ArrowRight size={22} /></>
                                ) : (
                                    "Hiện đang đóng cửa"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* FORM STEPPER */}
            {step > 0 && (
                <div className="max-w-2xl mx-auto">
                    {/* Progress Bar (Như cũ) */}
                    <div className="flex justify-between mb-12 relative">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {step > s ? <CheckCircle2 size={20} /> : s}
                            </div>
                        ))}
                        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-0">
                            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>
                        </div>
                    </div>

                    {/* Step 1: Chọn ngày */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                            <h2 className="text-2xl font-bold flex items-center gap-2"><Calendar className="text-blue-600" /> Thời gian</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Ngày nhận</label>
                                    <input type="date" className="border p-3 rounded-xl shadow-sm" value={formData.checkIn} onChange={(e) => updateForm("checkIn", e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Ngày trả</label>
                                    <input type="date" className="border p-3 rounded-xl shadow-sm" value={formData.checkOut} onChange={(e) => updateForm("checkOut", e.target.value)} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold">Số lượng khách</label>
                                <input type="number" min="1" className="border p-3 rounded-xl" value={formData.guests} onChange={(e) => updateForm("guests", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Phương tiện (Đã sửa để chọn được) */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <MessageSquare className="text-blue-600" /> Yêu cầu đặc biệt
                            </h2>
                            {/* Thêm value và onChange vào đây */}
                            <textarea
                                placeholder="Ví dụ: Phòng tầng cao, nôi cho em bé, trang trí kỷ niệm..."
                                className="w-full border p-4 rounded-xl h-32 focus:ring-2 ring-blue-500 outline-none"
                                value={formData.specialRequest}
                                onChange={(e) => updateForm("specialRequest", e.target.value)}
                            ></textarea>

                            <h2 className="text-xl font-bold flex items-center gap-2"><Car className="text-blue-600" /> Phương tiện di chuyển</h2>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: "plane", icon: <Plane />, label: "Máy bay" },
                                    { id: "train", icon: <Train />, label: "Tàu hỏa" },
                                    { id: "car", icon: <Car />, label: "Ô tô" },
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => updateForm("transport", t.id)}
                                        className={`flex flex-col items-center p-4 border-2 rounded-2xl transition ${formData.transport === t.id ? "border-blue-600 bg-blue-50 text-blue-600" : "border-gray-100"}`}
                                    >
                                        {t.icon}
                                        <span className="text-sm mt-2">{t.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Thanh toán */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
                            <h2 className="text-2xl font-bold flex items-center gap-2"><Wallet className="text-blue-600" /> Thanh toán</h2>
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                                <div className="flex justify-between mb-2"><span>Số đêm:</span><span className="font-bold">{totalNights} đêm</span></div>
                                <div className="flex justify-between text-xl font-bold border-t pt-2"><span>Tổng cộng:</span><span className="text-blue-600">{totalAmount.toLocaleString()}đ</span></div>
                            </div>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-4 p-4 border-2 rounded-2xl cursor-pointer ${formData.paymentMethod === 'card' ? 'border-blue-600 bg-blue-50' : ''}`}>
                                    <input type="radio" name="pay" onChange={() => updateForm("paymentMethod", "card")} />
                                    <CreditCard /> <span>Thẻ ngân hàng</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Buttons Navigation */}
                    <div className="flex justify-between mt-10">
                        <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-6 py-3 font-bold text-gray-400">
                            <ArrowLeft size={20} /> Quay lại
                        </button>
                        <button
                            onClick={step === 3 ? handleBooking : handleNext}
                            className="bg-black text-white px-10 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition"
                        >
                            {step === 3 ? "Xác nhận & Thanh toán" : "Tiếp theo"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}