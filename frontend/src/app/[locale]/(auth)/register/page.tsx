"use client";
import Link from "next/link";
import { Mountain, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useLocale } from "next-intl";
import { useState } from "react";

export default function RegisterPage() {
    const locale = useLocale();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="min-h-screen bg-[#F6F6F4] flex items-center justify-center px-4 pt-20">
            <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-md border border-gray-200">

                {/* Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-6 bg-black rounded-2xl flex items-center justify-center mb-4">
                        <Link href="/">
                            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-4 cursor-pointer hover:opacity-90 transition">
                                <Mountain size={24} className="text-white" />
                            </div>
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-black">
                        Tạo tài khoản
                    </h1>
                    <p className="text-gray-600 text-sm mt-2">
                        Bắt đầu hành trình cùng MichiJapan
                    </p>
                </div>

                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    {/* Full name */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase ml-1">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            placeholder="Mai Tấn Trung"
                            className="w-full px-5 py-3.5 bg-gray-100 border border-gray-300 rounded-2xl
                                       focus:bg-white focus:border-black outline-none text-sm text-black"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-xs font-semibold text-gray-700 uppercase ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="w-full px-5 py-3.5 bg-gray-100 border border-gray-300 rounded-2xl
                                       focus:bg-white focus:border-black outline-none text-sm text-black"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-700 uppercase ml-1">
                            Mật khẩu
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full px-5 py-3.5 bg-gray-100 border border-gray-300 rounded-2xl
                                       focus:bg-white focus:border-black outline-none text-sm text-black pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-10 text-gray-500"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Confirm password */}
                    <div className="relative">
                        <label className="text-xs font-semibold text-gray-700 uppercase ml-1">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full px-5 py-3.5 bg-gray-100 border border-gray-300 rounded-2xl
                                       focus:bg-white focus:border-black outline-none text-sm text-black pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-4 top-10 text-gray-500"
                        >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button className="w-full py-4 bg-black text-white rounded-2xl font-semibold text-sm
                                       hover:bg-gray-800 transition flex items-center justify-center gap-2">
                        Đăng ký
                        <ArrowRight size={16} />
                    </button>
                </form>

                <p className="text-center mt-8 text-sm text-gray-600">
                    Đã có tài khoản?{" "}
                    <Link href={`/${locale}/login`} className="font-semibold text-black hover:underline">
                        Đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
}
