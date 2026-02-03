"use client";
import { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, ShieldCheck, X, Phone, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { API_ROUTES } from "@/src/lib/api-routes"; // Import đường dẫn API của bạn

// Định nghĩa kiểu dữ liệu User
interface User {
    id: number;
    email: string;
    full_name: string;
    phone: string; // Thêm trường phone
    role: string;
    is_verified: boolean;
    created_at: string;
    avatar_url?: string;
}

export default function UsersManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- State cho Modal Edit/Add ---
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false); // True: Add, False: Edit
    const [currentUser, setCurrentUser] = useState<Partial<User>>({});
    // State mật khẩu riêng cho lúc tạo mới
    const [newPassword, setNewPassword] = useState("");

    // --- State cho Modal Delete ---
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    // 1. Fetch Users
    const fetchUsers = async () => {
        try {
            const res = await fetch(API_ROUTES.ADMIN.USERS);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            toast.error("Không thể tải danh sách người dùng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // 2. Handle Add/Edit
    const handleOpenAdd = () => {
        setIsAddMode(true);
        setCurrentUser({ role: "user", is_verified: false }); // Default values
        setNewPassword("");
        setIsEditOpen(true);
    };

    const handleOpenEdit = (user: User) => {
        setIsAddMode(false);
        setCurrentUser(user);
        setIsEditOpen(true);
    };

    const handleSaveUser = async () => {
        try {
            let url = API_ROUTES.ADMIN.USERS;
            let method = "POST";

            // Khai báo biến payload (body) với kiểu dữ liệu linh hoạt nhưng an toàn hơn 'any'
            let payload: Record<string, unknown> = {};

            if (isAddMode) {
                // --- LOGIC THÊM MỚI ---
                // Validate
                if (!currentUser.email || !newPassword) {
                    return toast.error("Vui lòng nhập email và mật khẩu");
                }

                // Tạo payload cho Add: Lấy hết thông tin hiện tại + password
                payload = {
                    ...currentUser,
                    password: newPassword
                };
            } else {
                // --- LOGIC CẬP NHẬT ---
                url = `${API_ROUTES.ADMIN.USERS}/${currentUser.id}`;
                method = "PUT";

                // Tạo payload cho Edit: CHỈ LẤY những trường API cho phép sửa
                // Cách này an toàn hơn dùng 'delete'
                payload = {
                    full_name: currentUser.full_name,
                    phone: currentUser.phone,
                    role: currentUser.role,
                    is_verified: currentUser.is_verified
                };
            }

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                // Ép kiểu err nếu cần, hoặc lấy detail an toàn
                throw new Error(err.detail || "Lỗi khi lưu");
            }

            toast.success(isAddMode ? "Thêm mới thành công" : "Cập nhật thành công");
            setIsEditOpen(false);
            fetchUsers();

        } catch (error: unknown) {
            // SỬA: Dùng 'unknown' thay vì 'any'
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Đã có lỗi không xác định xảy ra");
            }
        }
    };

    // 3. Handle Delete
    const handleDeleteClick = (id: number) => {
        setUserToDelete(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
            const res = await fetch(`${API_ROUTES.ADMIN.USERS}/${userToDelete}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Lỗi khi xóa");

            toast.success("Đã xóa người dùng");
            setUsers(users.filter(u => u.id !== userToDelete));
            setIsDeleteOpen(false);
        } catch (error) {
            toast.error("Không thể xóa người dùng này");
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header Page */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
                    <p className="text-sm text-gray-500">Danh sách tất cả tài khoản trong hệ thống</p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200"
                >
                    <Plus size={18} />
                    <span>Thêm người dùng</span>
                </button>
            </div>

            {/* Filter & Search (Giữ nguyên UI của bạn) */}
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
                                <th className="px-6 py-4 font-semibold text-gray-700">Số điện thoại</th> {/* Thêm cột */}
                                <th className="px-6 py-4 font-semibold text-gray-700">Vai trò</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Trạng thái</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Ngày tạo</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center py-10">Đang tải...</td></tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-500">{user.full_name?.charAt(0) || user.email.charAt(0)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{user.full_name || "Chưa đặt tên"}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Cột Số điện thoại mới */}
                                    <td className="px-6 py-4 text-gray-600">
                                        {user.phone ? (
                                            <div className="flex items-center gap-1">
                                                <Phone size={14} className="text-gray-400" /> {user.phone}
                                            </div>
                                        ) : <span className="text-gray-400 italic">--</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border
                                            ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                user.role === 'partner' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                            {user.role?.toUpperCase()}
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
                                            <button
                                                onClick={() => handleOpenEdit(user)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(user.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- MODAL EDIT / ADD --- */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">
                                {isAddMode ? "Thêm người dùng mới" : "Chỉnh sửa thông tin"}
                            </h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Form Fields */}
                            {isAddMode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border rounded-xl focus:border-black outline-none"
                                        value={currentUser.email || ""}
                                        onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                                    />
                                </div>
                            )}

                            {isAddMode && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                    <input
                                        type="password"
                                        className="w-full px-3 py-2 border rounded-xl focus:border-black outline-none"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-xl focus:border-black outline-none"
                                    value={currentUser.full_name || ""}
                                    onChange={(e) => setCurrentUser({ ...currentUser, full_name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border rounded-xl focus:border-black outline-none"
                                    value={currentUser.phone || ""}
                                    onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-xl focus:border-black outline-none bg-white"
                                        value={currentUser.role}
                                        onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="partner">Partner</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <select
                                        className="w-full px-3 py-2 border rounded-xl focus:border-black outline-none bg-white"
                                        value={currentUser.is_verified ? "true" : "false"}
                                        onChange={(e) => setCurrentUser({ ...currentUser, is_verified: e.target.value === "true" })}
                                    >
                                        <option value="true">Đã xác thực</option>
                                        <option value="false">Chưa xác thực</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setIsEditOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleSaveUser}
                                className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-lg transition flex items-center gap-2"
                            >
                                <Save size={16} /> Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL CONFIRM DELETE --- */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
                            <p className="text-sm text-gray-500">
                                Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa người dùng này khỏi hệ thống không?
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-center gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition"
                            >
                                Bỏ qua
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-lg shadow-red-200"
                            >
                                Đồng ý xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}