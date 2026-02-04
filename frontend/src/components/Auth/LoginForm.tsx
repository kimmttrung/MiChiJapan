"use client";
import { useState } from "react";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from 'next-intl'
import { ROUTES } from "@/src/lib/routes";
import { API_ROUTES } from "@/src/lib/api-routes";

export default function LoginForm() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: "", password: "" });
    const locale = useLocale()

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(API_ROUTES.AUTH.LOGIN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Đăng nhập thành công!");
                localStorage.setItem("michi_token", data.access_token);
                login(data.access_token, data.user);
                // --- LOGIC ĐIỀU HƯỚNG QUAN TRỌNG ---
                if (data.user.role === 'admin') {
                    router.push(`/${locale}${ROUTES.ADMIN}`); // Chuyển sang trang Admin
                } else {
                    router.push("/"); // User thường về trang chủ
                }
                router.refresh();
            } else {
                toast.error(data.detail || "Đăng nhập thất bại");
            }
        } catch (error) {
            toast.error("Không thể kết nối đến máy chủ Backend");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 uppercase ml-1">
                    Email
                </label>
                <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="w-full px-5 py-3.5 bg-gray-100 border border-gray-300 rounded-2xl
                               focus:bg-white focus:border-black outline-none text-sm text-black placeholder-gray-500"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-semibold text-gray-700 uppercase">
                        Mật khẩu
                    </label>
                </div>

                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        className="w-full px-5 py-3.5 bg-gray-100 border border-gray-300 rounded-2xl
                                   focus:bg-white focus:border-black outline-none text-sm text-black placeholder-gray-500 pr-12"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                <button type="button" className="text-xs text-gray-600 hover:underline">
                    Quên mật khẩu?
                </button>
            </div>

            <button
                disabled={isLoading}
                className="w-full py-4 bg-black text-white rounded-2xl font-semibold text-sm
                           hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Đang xử lý...
                    </>
                ) : (
                    <>
                        Đăng nhập
                        <ArrowRight size={16} />
                    </>
                )}
            </button>
        </form>
    );
}