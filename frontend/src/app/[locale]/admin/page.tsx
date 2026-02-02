import { DollarSign, Users, Plane, Star } from "lucide-react";

export default function AdminDashboard() {
    const stats = [
        { label: "Tổng doanh thu", value: "128,430,000đ", icon: DollarSign, color: "bg-green-50 text-green-600" },
        { label: "Người dùng mới", value: "1,240", icon: Users, color: "bg-blue-50 text-blue-600" },
        { label: "Chuyến đi AI tạo", value: "3,842", icon: Plane, color: "bg-purple-50 text-purple-600" },
        { label: "Đánh giá 5 sao", value: "892", icon: Star, color: "bg-yellow-50 text-yellow-600" },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Xin chào, đây là tình hình hoạt động của MichiJapan.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Trips Table Placeholder */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Giao dịch gần đây</h2>
                    <button className="text-sm font-semibold text-blue-600 hover:underline">Xem tất cả</button>
                </div>
                <div className="p-6 text-center text-gray-500 py-20">
                    Biểu đồ doanh thu sẽ hiển thị ở đây
                </div>
            </div>
        </div>
    );
}