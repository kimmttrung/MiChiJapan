"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { Camera, Save, Loader2, Mail, Phone, MapPin, User as UserIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { API_ROUTES } from "@/src/lib/api-routes";

export default function ProfilePage() {
    const { user, updateUser } = useAuth();  // login/updateUser function from context
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    console.log("check user", user);
    // Lấy config từ biến môi trường
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    // State lưu dữ liệu form
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        address: "",
        bio: "",
        avatar_url: ""
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Load dữ liệu khi user có sẵn
    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || "",
                phone: user.phone || "",
                address: user.address || "",
                bio: user.bio || "",
                avatar_url: user.avatar_url || ""
            });
        }
    }, [user]);

    // 1. Xử lý chọn ảnh (Preview Client)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                return toast.error("Ảnh quá lớn, vui lòng chọn ảnh dưới 5MB");
            }
            setSelectedFile(file);
            // Tạo URL ảo để xem trước ngay lập tức
            const previewUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatar_url: previewUrl }));
        }
    };

    // 2. Hàm upload lên Cloudinary
    const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            toast.error("Thiếu cấu hình Cloudinary trong .env");
            return null;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Lỗi upload ảnh");

            const data = await res.json();
            return data.secure_url; // Trả về link ảnh thật
        } catch (error) {
            console.error("Upload error:", error);
            return null;
        }
    };

    // 3. Xử lý Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let finalAvatarUrl = formData.avatar_url;

            // Nếu người dùng có chọn ảnh mới -> Upload lên Cloud trước
            if (selectedFile) {
                setIsUploading(true);
                const uploadedUrl = await uploadImageToCloudinary(selectedFile);
                setIsUploading(false);

                if (uploadedUrl) {
                    finalAvatarUrl = uploadedUrl;
                } else {
                    toast.error("Không thể tải ảnh lên, sẽ giữ ảnh cũ.");
                    // Nếu upload lỗi, có thể return hoặc tiếp tục update thông tin text
                    // Ở đây mình chọn tiếp tục update text
                }
            }

            // Gọi API Backend của bạn để lưu thông tin vào DB
            const res = await fetch(`${API_ROUTES.ADMIN.USERS}/${user?.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    bio: formData.bio,
                    avatar_url: finalAvatarUrl
                }),
            });

            if (res.ok) {
                toast.success("Cập nhật thành công!");

                // Cập nhật Context ngay lập tức
                updateUser({
                    full_name: formData.full_name,
                    phone: formData.phone,
                    address: formData.address,
                    bio: formData.bio,
                    avatar_url: finalAvatarUrl // URL mới từ Cloudinary
                });
            } else {
                toast.error("Cập nhật thông tin thất bại");
            }

            // TODO: Cập nhật lại Context Auth để Navbar hiển thị ngay avatar mới
            // Ví dụ: login({ ...user, ...formData, avatar_url: finalAvatarUrl });

        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-white overflow-hidden animate-in fade-in duration-500">

            {/* --- Banner Gradient --- */}
            <div className="h-44 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500 w-full relative">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>
                {/* Decoration Circles */}
                <div className="absolute top-4 right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-4 left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="px-8 pb-10">
                {/* --- Avatar Floating Section --- */}
                <div className="relative -mt-20 mb-8 flex flex-col sm:flex-row justify-between items-end gap-6">
                    <div className="relative group mx-auto sm:mx-0">
                        {/* Khung ảnh tròn */}
                        <div className="w-36 h-36 rounded-full border-[6px] border-white bg-white overflow-hidden shadow-2xl relative z-10">
                            {isUploading ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                    <Loader2 className="animate-spin text-indigo-500" size={32} />
                                </div>
                            ) : formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                    <UserIcon size={64} />
                                </div>
                            )}

                            {/* Overlay Click to Upload */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white gap-1"
                            >
                                <UploadCloud size={24} />
                                <span className="text-[10px] font-medium uppercase">Đổi ảnh</span>
                            </div>
                        </div>

                        {/* Nút Camera nhỏ */}
                        <button
                            onClick={(e) => { e.preventDefault(); fileInputRef.current?.click(); }}
                            className="absolute bottom-2 right-1 z-20 bg-white text-gray-800 p-2.5 rounded-full hover:bg-gray-50 transition shadow-lg border border-gray-100 group-hover:scale-110"
                        >
                            <Camera size={18} className="text-indigo-600" />
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Welcome Text */}
                    <div className="mb-2 text-center sm:text-right flex-1 w-full">
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {formData.full_name || "Chưa đặt tên"}
                        </h1>
                        <div className="flex items-center justify-center sm:justify-end gap-2 text-gray-500 mt-1">
                            <Mail size={16} />
                            <span className="text-sm">{user?.email}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 mx-1"></span>
                            <span className="text-xs font-medium px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
                                {user?.role?.toUpperCase() || "MEMBER"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- Form Inputs --- */}
                <form onSubmit={handleSubmit} className="space-y-8 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                        {/* Họ và tên */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Họ và tên</label>
                            <div className="relative group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    // ĐÃ SỬA: Thêm 'text-gray-900' vào đầu
                                    className="text-gray-900 w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Nhập tên hiển thị..."
                                />
                            </div>
                        </div>

                        {/* Số điện thoại */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Số điện thoại</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    // ĐÃ SỬA: Thêm 'text-gray-900'
                                    className="text-gray-900 w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="09xx xxx xxx"
                                />
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Địa chỉ</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    // ĐÃ SỬA: Thêm 'text-gray-900'
                                    className="text-gray-900 w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Ví dụ: Cầu Giấy, Hà Nội..."
                                />
                            </div>
                        </div>

                        {/* Bio */}
                        {/* Bio */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Giới thiệu bản thân</label>
                            <div className="relative">
                                <textarea
                                    rows={4}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    // ĐÃ SỬA: Thêm 'text-gray-900'
                                    className="text-gray-900 w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none placeholder:text-gray-400 text-base"
                                    placeholder="Hãy chia sẻ một chút về sở thích du lịch của bạn..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- Footer Buttons --- */}
                    <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => window.location.reload()} // Reset form đơn giản
                            className="px-6 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || isUploading}
                            className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                        >
                            {(isLoading || isUploading) ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span className="font-semibold">Lưu thay đổi</span>
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}