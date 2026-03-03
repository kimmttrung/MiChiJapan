"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Info, Clock, Utensils, Hotel, Ticket, XCircle } from "lucide-react";
import Navbar from "@/src/components/Navbar";
import { useLocale } from "next-intl";

export default function MyBookingsPage() {
    const [hotelBookings, setHotelBookings] = useState<any[]>([]);
    const [restaurantBookings, setRestaurantBookings] = useState<any[]>([]);
    const [activeService, setActiveService] = useState("hotel");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const locale = useLocale();
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);

    // --- LOGIC LẤY CHI TIẾT (Xử lý linh hoạt cả 2 API) ---
    const handleShowDetail = async (id: number) => {
        const token = localStorage.getItem("michi_token");
        // Chọn endpoint dựa trên service đang được xem
        const endpoint = activeService === "hotel"
            ? `http://localhost:8000/api/bookings/${id}`
            : `http://localhost:8000/api/restaurant-bookings/${id}`;

        try {
            const res = await fetch(endpoint, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSelectedBooking(data);
                setShowModal(true);
            }
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết:", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        const token = localStorage.getItem("michi_token");
        const headers = { "Authorization": `Bearer ${token}` };

        try {
            const [hotelRes, restRes] = await Promise.all([
                fetch("http://localhost:8000/api/bookings/my-bookings", { headers }),
                fetch("http://localhost:8000/api/restaurant-bookings/my-bookings", { headers })
            ]);

            if (hotelRes.ok) setHotelBookings(await hotelRes.json());
            if (restRes.ok) setRestaurantBookings(await restRes.json());
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getCurrentList = () => {
        const baseList = activeService === "hotel" ? hotelBookings : restaurantBookings;
        return baseList.filter(b => filter === "all" ? true : b.status === filter);
    };

    const currentBookings = getCurrentList();


    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />

            <div className="max-w-6xl mx-auto p-8 pt-24">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black mb-2 text-gray-900">Quản lý đặt chỗ</h1>
                    <p className="text-gray-500 text-sm">Xem và quản lý hành trình của bạn.</p>
                </div>

                {/* SERVICE SELECTOR */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[
                        { id: "hotel", label: "Khách sạn", icon: <Hotel size={20} /> },
                        { id: "restaurant", label: "Nhà hàng", icon: <Utensils size={20} /> },
                        { id: "other", label: "Dịch vụ khác", icon: <Ticket size={20} /> },
                    ].map((service) => (
                        <button
                            key={service.id}
                            onClick={() => { setActiveService(service.id); setFilter("all"); }}
                            className={`flex items-center justify-center gap-2 py-4 rounded-3xl font-bold transition-all shadow-sm border ${activeService === service.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"}`}
                        >
                            {service.icon}
                            <span className="hidden md:inline">{service.label}</span>
                        </button>
                    ))}
                </div>

                {/* FILTER TABS */}
                <div className="flex space-x-6 mb-8 border-b border-gray-100">
                    {["all", "pending", "confirmed", "cancelled"].map((f) => (
                        <button key={f} onClick={() => setFilter(f)} className={`pb-4 px-2 font-bold text-sm transition-all relative ${filter === f ? "text-blue-600" : "text-gray-400 hover:text-black"}`}>
                            {f === "all" ? "Tất cả" : f === "pending" ? "Chờ duyệt" : f === "confirmed" ? "Đã duyệt" : "Đã hủy"}
                            {filter === f && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
                        </button>
                    ))}
                </div>

                {/* LISTING */}
                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
                ) : (
                    <div className="grid gap-8">
                        {currentBookings.length > 0 ? currentBookings.map((book) => (
                            <div key={book.id} className="group flex flex-col md:flex-row bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 p-2">
                                <div className="md:w-80 h-56 relative overflow-hidden rounded-[2.2rem] shrink-0">
                                    <img src={activeService === "hotel" ? book.hotel?.image_urls?.[0] : book.restaurant?.image_urls?.[0]} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${book.status === 'confirmed' ? 'bg-green-500 text-white' : book.status === 'cancelled' ? 'bg-red-500 text-white' : 'bg-orange-400 text-white'}`}>{book.status}</div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <h2 className="text-2xl font-black">{activeService === "hotel" ? book.hotel?.name : book.restaurant?.name}</h2>
                                        <div className="flex flex-wrap gap-3">
                                            <span className="flex items-center gap-1 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-full"><Calendar size={14} /> {activeService === "hotel" ? `Nhận: ${book.check_in}` : `Ngày: ${book.booking_date}`}</span>
                                            <span className="flex items-center gap-1 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-full"><Users size={14} /> {book.guests} khách</span>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t pt-4 border-gray-50">
                                        <span className="text-[10px] font-bold text-gray-400">Mã: #{book.id}</span>
                                        <button onClick={() => handleShowDetail(book.id)} className="bg-gray-100 hover:bg-gray-900 hover:text-white px-6 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2">
                                            <Info size={14} /> Chi tiết đơn
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center text-gray-400 font-bold">Trống.</div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL CHI TIẾT (Dùng cho cả Hotel và Restaurant) */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden">
                        {/* Nút đóng */}
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
                            <XCircle size={32} className="text-gray-400" />
                        </button>

                        {/* Header: Hiển thị khác nhau dựa trên loại dịch vụ */}
                        <div className="mb-8">
                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full ${activeService === "hotel" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                }`}>
                                {activeService === "hotel" ? "Chi tiết đặt phòng" : "Chi tiết đặt bàn"}
                            </span>
                            <h2 className="text-4xl font-black mt-4 text-gray-900">Mã đơn #{selectedBooking.id}</h2>
                        </div>

                        <div className="space-y-8">
                            {/* 1. Thông tin khách hàng (Giao diện chung nhưng màu sắc thay đổi) */}
                            <section>
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 flex items-center gap-2">
                                    <Users size={14} /> Thông tin khách hàng
                                </h3>
                                <div className={`grid grid-cols-2 gap-4 p-6 rounded-[2rem] border ${activeService === "hotel" ? "bg-blue-50/30 border-blue-100" : "bg-orange-50/30 border-orange-100"
                                    }`}>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Họ tên</p>
                                        <p className="font-bold text-lg">{selectedBooking.guest_full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Số điện thoại</p>
                                        <p className="font-bold text-lg">{selectedBooking.guest_phone}</p>
                                    </div>
                                    <div className="col-span-2 pt-2 border-t border-dashed border-gray-200">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Lời nhắn / Yêu cầu đặc biệt</p>
                                        <p className="text-sm italic text-gray-600 mt-1">
                                            "{selectedBooking.special_request || "Không có yêu cầu đặc biệt"}"
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* 2. GIAO DIỆN RIÊNG CHO HOTEL */}
                            {activeService === "hotel" && (
                                <section className="animate-in slide-in-from-bottom-4 space-y-3"> {/* Giảm space-y xuống 3 */}
                                    <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
                                        <Hotel size={14} /> Thông tin khách sạn
                                    </h3>

                                    {/* Nội dung chính thu nhỏ */}
                                    <div className="flex gap-4 p-3 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm">
                                        <img
                                            src={selectedBooking.hotel?.image_urls?.[0]}
                                            className="w-20 h-20 rounded-[1rem] object-cover shadow-sm" /* Giảm từ 24/32 xuống 20 */
                                        />
                                        <div className="flex-1 py-0.5">
                                            <h4 className="font-black text-lg text-blue-900 leading-tight line-clamp-1">{selectedBooking.hotel?.name}</h4>
                                            <p className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                                                <MapPin size={10} /> {selectedBooking.hotel?.address}
                                            </p>
                                            <div className="mt-2 flex gap-2">
                                                <div className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-center">
                                                    <p className="text-[6px] font-bold uppercase opacity-80">Check-in</p>
                                                    <p className="text-[9px] font-black">{selectedBooking.check_in}</p>
                                                </div>
                                                <div className="px-2.5 py-1 bg-gray-900 text-white rounded-lg text-center">
                                                    <p className="text-[6px] font-bold uppercase opacity-60">Check-out</p>
                                                    <p className="text-[9px] font-black">{selectedBooking.check_out}</p>
                                                </div>
                                                <div className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-center border border-gray-200">
                                                    <p className="text-[6px] font-bold uppercase opacity-60">Số đêm</p>
                                                    <p className="text-[9px] font-black">{selectedBooking.total_nights}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Banner Tổng cộng làm mỏng lại (Compact version) */}
                                    <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-[1.5rem] text-white flex justify-between items-center relative overflow-hidden">
                                        <div className="relative z-10">
                                            <p className="text-[8px] font-bold uppercase opacity-80 tracking-widest">Tổng thanh toán</p>
                                            <p className="text-2xl font-black">{selectedBooking.total_amount?.toLocaleString()} <span className="text-xs">VNĐ</span></p>
                                        </div>
                                        <Hotel size={40} className="absolute -right-2 -bottom-2 opacity-10 rotate-12" />
                                    </div>
                                </section>
                            )}

                            {/* 3. GIAO DIỆN RIÊNG CHO RESTAURANT */}
                            {activeService === "restaurant" && (
                                <section className="animate-in slide-in-from-bottom-4 space-y-6">
                                    <h3 className="text-[10px] font-black uppercase text-orange-500 tracking-widest mb-3 flex items-center gap-2">
                                        <Utensils size={14} /> Thông tin nhà hàng
                                    </h3>

                                    {/* Banner Nhà hàng */}
                                    <div className="flex gap-4 p-4 bg-orange-50/50 rounded-[2rem] border border-orange-100">
                                        <img src={selectedBooking.restaurant?.image_urls?.[0]} className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
                                        <div className="flex-1">
                                            <h4 className="font-bold text-xl">{selectedBooking.restaurant?.name}</h4>
                                            <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin size={12} /> {selectedBooking.restaurant?.address}</p>
                                            <div className="flex gap-4 mt-3">
                                                <span className="text-xs font-bold bg-white px-3 py-1.5 rounded-full shadow-sm">
                                                    <Calendar size={12} className="inline mr-1 text-orange-500" /> {selectedBooking.booking_date}
                                                </span>
                                                <span className="text-xs font-bold bg-white px-3 py-1.5 rounded-full shadow-sm">
                                                    <Clock size={12} className="inline mr-1 text-orange-500" /> {selectedBooking.booking_time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thực đơn nhà hàng */}
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-4">Thực đơn đặc sắc</h3>
                                        <div className="grid gap-3">
                                            {selectedBooking.restaurant?.cuisines_data?.map((menu: any) => (
                                                <div key={menu.id} className="flex items-center gap-4 p-4 border border-gray-50 rounded-2xl hover:bg-gray-50 transition-all hover:scale-[1.01]">
                                                    <img src={menu.image_url} className="w-16 h-16 rounded-xl object-cover" />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <p className="font-bold text-gray-800">{menu.cuisine_name}</p>
                                                            <p className="font-black text-orange-600">{parseInt(menu.price_range).toLocaleString()}đ</p>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">{menu.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Loader2 = ({ className }: { className?: string }) => (
    <Clock className={className} />
);