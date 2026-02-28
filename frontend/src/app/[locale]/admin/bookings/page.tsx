"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle, XCircle, User, MapPin,
    Calendar, CreditCard, ExternalLink, Search
} from "lucide-react";
import Navbar from "@/src/components/Navbar";

export default function AdminBookingManager() {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [selectedBooking, setSelectedBooking] = useState<any>(null); // Lưu booking đang xem chi tiết
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAllBookings = async () => {
        const token = localStorage.getItem("michi_token");
        try {
            const res = await fetch("http://localhost:8000/api/bookings/all", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error("Lỗi fetch admin bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllBookings();
    }, []);

    // Cập nhật hàm xử lý tại Admin Page
    const handleAction = async (bookingId: number, action: 'approve' | 'cancel') => {
        const confirmMsg = action === 'approve'
            ? "Bạn có chắc chắn muốn PHÊ DUYỆT đơn hàng này?"
            : "Bạn có chắc chắn muốn HỦY đơn hàng này?";

        if (!confirm(confirmMsg)) return;

        const token = localStorage.getItem("michi_token");
        // Lựa chọn endpoint dựa trên hành động
        const endpoint = `http://localhost:8000/api/bookings/${bookingId}/${action}`;

        try {
            const res = await fetch(endpoint, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (res.ok) {
                alert(action === 'approve' ? "Đã phê duyệt thành công!" : "Đã hủy đơn hàng!");
                fetchAllBookings(); // Tải lại danh sách để cập nhật UI
            } else {
                const error = await res.json();
                alert(`Lỗi: ${error.detail || "Không thể thực hiện thao tác"}`);
            }
        } catch (err) {
            alert("Lỗi kết nối máy chủ.");
        }
    };

    const filteredBookings = bookings.filter(b => filter === "all" ? true : b.status === filter);

    return (
        <div className="min-h-screen bg-white text-black">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter">Quản lý Đơn hàng</h1>
                        <p className="text-gray-500 mt-1">Dành cho Quản trị viên hệ thống Michi Japan.</p>
                    </div>

                    {/* Tab Filter */}
                    <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
                        {["all", "pending", "confirmed", "cancelled"].map((s) => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${filter === s ? "bg-white text-blue-600 shadow-sm" : "text-gray-400 hover:text-black"
                                    }`}
                            >
                                {s === "all" ? "Tất cả" : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* BẢNG DỮ LIỆU */}
                <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Khách hàng</th>
                                <th className="px-6 py-5">Khách sạn</th>
                                <th className="px-6 py-5">Lịch trình</th>
                                <th className="px-6 py-5">Thanh toán</th>
                                <th className="px-6 py-5">Trạng thái</th>
                                <th className="px-8 py-5 text-right">Duyệt đơn</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-20 text-gray-400">Đang tải dữ liệu...</td></tr>
                            ) : filteredBookings.map((book) => (
                                <tr key={book.id} className="hover:bg-gray-50/50 transition-colors group">
                                    {/* Cột Khách hàng */}
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={book.user?.avatar_url || "https://ui-avatars.com/api/?name=" + book.user?.full_name}
                                                className="w-10 h-10 rounded-full object-cover border"
                                                alt="avatar"
                                            />
                                            <div>
                                                <p className="font-bold text-sm leading-none">{book.user?.full_name}</p>
                                                <p className="text-[11px] text-gray-400 mt-1">{book.user?.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Cột Khách sạn */}
                                    <td className="px-6 py-6">
                                        <p className="font-bold text-sm text-blue-600">{book.hotel?.name}</p>
                                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                                            <MapPin size={10} /> {book.hotel?.id}
                                        </p>
                                    </td>

                                    {/* Cột Lịch trình */}
                                    <td className="px-6 py-6">
                                        <div className="text-[11px] font-bold text-gray-600 space-y-1">
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} className="text-gray-400" /> {book.check_in}
                                            </div>
                                            <p className="text-gray-400 font-normal">{book.total_nights} đêm · {book.guests} khách</p>
                                        </div>
                                    </td>

                                    {/* Cột Thanh toán */}
                                    <td className="px-6 py-6">
                                        <p className="font-black text-sm">{book.total_amount?.toLocaleString()}đ</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Trả bằng Thẻ</p>
                                    </td>

                                    {/* Cột Trạng thái */}
                                    <td className="px-6 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${book.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                            book.status === 'pending' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-red-50 text-red-600 border-red-100'
                                            }`}>
                                            {book.status}
                                        </span>
                                    </td>

                                    {/* Cột Hành động */}
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Chỉ hiện nút thao tác nếu đơn hàng đang ở trạng thái chờ (pending) */}
                                            {book.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(book.id, 'approve')}
                                                        className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                                        title="Phê duyệt đơn"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(book.id, 'cancel')}
                                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                        title="Hủy đơn hàng"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}

                                            {/* Nút xem chi tiết (luôn hiển thị) */}
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(book);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all"
                                            >
                                                <ExternalLink size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header Modal */}
                        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">Chi tiết dịch vụ</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Mã vận đơn: #{selectedBooking.id}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                                <XCircle size={24} className="text-gray-400 hover:text-red-500" />
                            </button>
                        </div>

                        {/* Nội dung Modal */}
                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            {/* Thông tin khách hàng & Người đặt */}
                            <section>
                                <h3 className="text-xs font-black text-blue-500 uppercase tracking-tighter mb-4">Thông tin khách hàng</h3>
                                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Họ và tên</p>
                                        <p className="font-bold text-gray-800">{selectedBooking.guest_full_name || selectedBooking.user?.full_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Số điện thoại</p>
                                        <p className="font-bold text-gray-800">{selectedBooking.guest_phone || selectedBooking.user?.phone}</p>
                                    </div>
                                    <div className="col-span-2 space-y-1 border-t pt-3">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Email liên lạc</p>
                                        <p className="font-bold text-gray-800">{selectedBooking.guest_email || selectedBooking.user?.email}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Yêu cầu đặc biệt */}
                            <section>
                                <h3 className="text-xs font-black text-blue-500 uppercase tracking-tighter mb-2">Yêu cầu từ khách hàng</h3>
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl italic text-gray-600 text-sm leading-relaxed">
                                    "{selectedBooking.special_request || "Không có yêu cầu đặc biệt nào."}"
                                </div>
                            </section>

                            {/* Thông tin thanh toán & Dịch vụ */}
                            <section>
                                <h3 className="text-xs font-black text-blue-500 uppercase tracking-tighter mb-4">Chi tiết thanh toán</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-gray-400">Giá mỗi đêm:</span>
                                        <span>{selectedBooking.hotel?.price_per_night?.toLocaleString()} VNĐ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-gray-400">Số đêm lưu trú:</span>
                                        <span>{selectedBooking.total_nights} đêm</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-black pt-4 border-t border-dashed border-gray-200">
                                        <span>Tổng cộng:</span>
                                        <span className="text-blue-600">{selectedBooking.total_amount?.toLocaleString()} VNĐ</span>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Footer Modal */}
                        <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-8 py-3 bg-black text-white rounded-2xl font-bold text-sm hover:opacity-80 transition shadow-lg"
                            >
                                Đóng cửa sổ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
}