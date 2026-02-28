"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Info, Trash2, Clock } from "lucide-react";
import Navbar from "@/src/components/Navbar";
import { useLocale } from "next-intl";
import { data } from "framer-motion/client";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const locale = useLocale();

    const fetchMyBookings = async () => {
        const token = localStorage.getItem("michi_token");
        try {
            const res = await fetch("http://localhost:8000/api/bookings/my-bookings", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            console.log("check my booking", res);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
            console.log("check my booking", data);
        } catch (err) {
            console.error("Lỗi:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBookings();
    }, []);

    const filteredBookings = bookings.filter(b =>
        filter === "all" ? true : b.status === filter
    );


    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />

            <div className="max-w-6xl mx-auto p-8 pt-24">
                <div className="mb-10">
                    <h1 className="text-4xl font-black mb-2 text-gray-900">Dịch vụ đã đặt</h1>
                    <p className="text-gray-500">Quản lý các phòng khách sạn, bàn nhà hàng và vé vui chơi của bạn.</p>
                </div>

                {/* FILTER TABS */}
                <div className="flex space-x-6 mb-8 border-b border-gray-100">
                    {[
                        { id: "all", label: "Tất cả dịch vụ" },
                        { id: "pending", label: "Chờ xác nhận" },
                        { id: "confirmed", label: "Đã xác nhận" },
                        { id: "cancel", label: "Đã hủy" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id)}
                            className={`pb-4 px-2 font-bold text-sm transition-all relative ${filter === tab.id
                                ? "text-blue-600"
                                : "text-gray-400 hover:text-black"
                                }`}
                        >
                            {tab.label}
                            {filter === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                            )}
                        </button>
                    ))}
                </div>

                {/* LISTING */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {filteredBookings.length > 0 ? filteredBookings.map((book) => (
                            <div key={book.id} className="group flex flex-col md:flex-row bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 p-2">
                                {/* Image Area */}
                                <div className="md:w-80 h-56 relative overflow-hidden rounded-[1.8rem]">
                                    <img
                                        src={book.hotel?.image_urls?.[0]}
                                        alt="service"
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                    />
                                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${book.status === 'confirmed' ? 'bg-green-500 text-white' : 'bg-orange-400 text-white'
                                        }`}>
                                        {book.status}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">
                                                    {book.hotel_id ? "Khách sạn & Nghỉ dưỡng" : "Dịch vụ du lịch"}
                                                </span>
                                                <h2 className="text-2xl font-black text-gray-900 leading-tight">{book.hotel?.name}</h2>
                                                <p className="text-gray-400 text-sm flex items-center gap-1">
                                                    <MapPin size={14} /> {book.hotel?.address}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">Tổng cộng</span>
                                                <p className="text-xl font-black text-blue-600">
                                                    {book.total_amount?.toLocaleString()} <span className="text-xs">VNĐ</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Các nhãn thông tin chi tiết */}
                                        <div className="flex flex-col gap-3">
                                            {/* Hàng 1: Ngày nhận và Ngày trả */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                {/* Ngày nhận phòng */}
                                                <div className="flex items-center gap-1.5 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-full text-gray-600">
                                                    <Calendar size={14} className="text-blue-500" /> Nhận: {book.check_in}
                                                </div>

                                                {/* Ngày trả phòng */}
                                                <div className="flex items-center gap-1.5 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-full text-gray-600">
                                                    <Calendar size={14} className="text-red-400" /> Trả: {book.check_out}
                                                </div>
                                            </div>

                                            {/* Hàng 2: Các thông tin còn lại */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                {/* Tổng số ngày ở */}
                                                <div className="flex items-center gap-1.5 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full text-blue-700">
                                                    <Clock size={14} /> {book.total_nights} đêm
                                                </div>

                                                {/* Số lượng khách */}
                                                <div className="flex items-center gap-1.5 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-full text-gray-600">
                                                    <Users size={14} className="text-blue-500" /> {book.guests} khách
                                                </div>

                                                {/* Ngày thực hiện đặt đơn */}
                                                <div className="flex items-center gap-1.5 text-xs font-bold bg-gray-50 px-3 py-1.5 rounded-full text-gray-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
                                                    Đặt ngày: {new Date(book.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phần nút bấm thao tác */}
                                    <div className="mt-6 flex items-center justify-end gap-3 border-t pt-4 border-gray-50">
                                        <button className="flex items-center gap-2 bg-gray-900 hover:bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-gray-200">
                                            <Info size={16} /> Chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] py-32 text-center">
                                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Info className="text-gray-300" />
                                </div>
                                <p className="text-gray-400 font-bold">Bạn chưa đặt dịch vụ nào.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}