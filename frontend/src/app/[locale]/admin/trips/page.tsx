"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Eye, Trash2, Download, TrendingUp,
    Users, MapPin, Calendar, DollarSign, X, Loader2
} from 'lucide-react';
import Navbar from '@/src/components/Navbar';


export default function AdminTripsPage() {
    const [trips, setTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // --- 1. Gọi API lấy dữ liệu ---
    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setLoading(true);

                // 1. Lấy token từ localStorage
                const token = localStorage.getItem('michi_token');

                // Kiểm tra nếu không có token thì báo lỗi ngay
                if (!token) {
                    throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                }

                // 2. Gọi API với token động
                const response = await fetch('http://localhost:8000/api/v1/admin/trips/all', {
                    method: 'GET',
                    headers: {
                        'accept': 'application/json',
                        'Authorization': `Bearer ${token}` // Sử dụng Template String để chèn token
                    }
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error('Bạn không có quyền truy cập vào dữ liệu này.');
                    }
                    throw new Error('Không thể tải dữ liệu từ máy chủ');
                }

                const data = await response.json();
                setTrips(data);
            } catch (err: any) {
                setError(err.message);
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrips();
    }, []);
    // --- 2. Logic tìm kiếm & Thống kê ---
    const filteredTrips = useMemo(() => {
        return trips.filter(t =>
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.user_info.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [trips, searchTerm]);

    const stats = useMemo(() => {
        const totalBudget = trips.reduce((sum, t) => sum + (t.budget_per_person * t.total_days), 0);
        return [
            { label: "Tổng chuyến đi", value: trips.length, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Doanh thu ước tính", value: `${(totalBudget / 1000000).toFixed(1)}M`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
            { label: "Khách hàng", value: new Set(trips.map(t => t.user_info.email)).size, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Tăng trưởng", value: "+12%", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
        ];
    }, [trips]);

    // --- 3. Export CSV ---
    const exportToCSV = () => {
        const headers = "ID,Tieu De,Khach Hang,Email,Ngan Sach,So Ngay\n";
        const rows = filteredTrips.map(t =>
            `${t.id},${t.title},${t.user_info.name},${t.user_info.email},${t.budget_per_person},${t.total_days}`
        ).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bao-cao-chuyen-di.csv';
        a.click();
    };

    // --- Hàm xử lý xóa chuyến đi ---
    const handleDeleteTrip = async (tripId: number) => {
        // Hiển thị xác nhận trước khi xóa
        if (!window.confirm("Bạn có chắc chắn muốn xóa chuyến đi này? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            const token = localStorage.getItem('michi_token');
            const response = await fetch(`http://localhost:8000/api/v1/admin/trips/${tripId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': 'application/json'
                }
            });

            if (response.ok) {
                // Xóa thành công -> Cập nhật lại UI cục bộ để không phải load lại trang
                setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
                alert("Đã xóa chuyến đi thành công!");
            } else {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Lỗi khi xóa");
            }
        } catch (err: any) {
            alert("Không thể xóa: " + err.message);
        }
    };

    if (loading) return (
        <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-gray-50">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="text-gray-500 font-medium">Đang tải dữ liệu chuyến đi...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <Navbar />

            <main className="p-8 max-w-7xl mx-auto">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                                <stat.icon size={22} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc tiêu đề..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 font-semibold text-gray-600 shadow-sm transition-all active:scale-95"
                    >
                        <Download size={18} /> Xuất CSV
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Chuyến đi</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider">Ngân sách</th>
                                <th className="px-6 py-4 text-[13px] font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTrips.map((trip) => (
                                <tr key={trip.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={trip.user_info.avatar || `https://ui-avatars.com/api/?name=${trip.user_info.name}`}
                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-50"
                                            />
                                            <div>
                                                <p className="font-bold text-gray-800">{trip.user_info.name}</p>
                                                <p className="text-xs text-gray-500">{trip.user_info.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-blue-600">{trip.title}</p>
                                            <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase">
                                                {trip.total_days} ngày
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-700">
                                        {trip.budget_per_person.toLocaleString()}đ
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setSelectedTrip(trip)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg shadow-sm"
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTrip(trip.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa chuyến đi"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* --- Preview Modal --- */}
            {selectedTrip && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{selectedTrip.title}</h2>
                                <div className="flex gap-4 mt-1 text-sm text-gray-500 font-medium">
                                    <span>👤 {selectedTrip.user_info.name}</span>
                                    <span>📅 {selectedTrip.total_days} Ngày</span>
                                </div>
                            </div>
                            <button onClick={() => setSelectedTrip(null)} className="p-3 hover:bg-white rounded-full shadow-sm border transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto max-h-[55vh] bg-white">
                            {selectedTrip.itinerary.map((day: any) => (
                                <div key={day.day} className="mb-10 last:mb-0">
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="h-8 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold shadow-lg shadow-blue-200">
                                            {day.day}
                                        </span>
                                        <h3 className="font-black text-gray-800 text-lg">Ngày hành trình {day.day}</h3>
                                    </div>

                                    <div className="grid gap-4 ml-4 border-l-2 border-blue-50 pl-8">
                                        {day.items.map((item: any, idx: number) => (
                                            <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
                                                <div className="absolute -left-[41px] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-4 border-blue-500 rounded-full" />
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{item.time}</span>
                                                        <h4 className="font-bold text-gray-800 text-base">{item.activity}</h4>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                                            <MapPin size={14} className="text-red-400" /> {item.location}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-400 font-medium">{item.type}</p>
                                                        <p className="font-black text-blue-600 mt-1">
                                                            {item.price > 0 ? `${item.price.toLocaleString()}đ` : "Free"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Ước tính ngân sách</p>
                                <p className="text-2xl font-black text-white">{(selectedTrip.budget_per_person * 4).toLocaleString()}đ</p>
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                                Gửi hỗ trợ khách hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}