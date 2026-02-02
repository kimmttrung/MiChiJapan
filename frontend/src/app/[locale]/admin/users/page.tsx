"use client";
import { useState, useEffect } from "react";
import { Search, Plus, MoreVertical, Edit, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// Định nghĩa kiểu dữ liệu User giống database
interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    is_verified: boolean;
    created_at: string;
    avatar_url: string;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Giả lập fetch data (Thay bằng fetch API thực tế)
    useEffect(() => {
        // const res = await fetch('http://localhost:8000/api/users', ...)
        // Đây là mock data giống DB của bạn
        const mockUsers: User[] = [
            { id: 1, email: "admin@michi.com", full_name: "Admin Michi", role: "admin", is_verified: true, created_at: "2024-01-01", avatar_url: "https://github.com/shadcn.png" },
            { id: 2, email: "khach1@gmail.com", full_name: "Nguyễn Văn A", role: "user", is_verified: true, created_at: "2024-02-15", avatar_url: "" },
            { id: 3, email: "hotelowner@business.com", full_name: "Chủ KS Tokyo", role: "partner", is_verified: false, created_at: "2024-03-10", avatar_url: "" },
        ];
        setUsers(mockUsers);
        setIsLoading(false);
    }, []);

    return (
        <div className="space-y-6">
            {/* Header Page */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="text-sm text-gray-500">Danh sách tất cả tài khoản trong hệ thống</p>
                </div>
                <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200">
                    <Plus size={18} />
                    <span>Thêm người dùng</span>
                </button>
            </div>

            {/* Filter & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-black outline-none transition text-sm"
                    />
                </div>
                <select className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-black outline-none cursor-pointer">
                    <option value="">Tất cả vai trò</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="partner">Partner</option>
                </select>
            </div>

            {/* Data Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Người dùng</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Vai trò</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Ngày tạo</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-500">{user.full_name?.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.full_name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border
                        ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                user.role === 'partner' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_verified ? (
                                            <div className="flex items-center gap-1.5 text-green-600 font-medium text-xs">
                                                <ShieldCheck size={14} /> Verified
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">Chưa xác thực</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {user.created_at}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Tĩnh) */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Hiển thị 1-10 trong số 128 kết quả</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs border rounded-lg disabled:opacity-50" disabled>Trước</button>
                        <button className="px-3 py-1 text-xs border rounded-lg hover:bg-gray-50">Sau</button>
                    </div>
                </div>
            </div>
        </div>
    );
}