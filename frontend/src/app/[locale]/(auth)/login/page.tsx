"use client";
import Link from "next/link";
import { Mountain, Chrome, Facebook, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

export default function LoginPage() {
    const t = useTranslations("Auth");
    const locale = useLocale();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="min-h-screen bg-[#F6F6F4] flex flex-col items-center justify-center px-4 pt-20">
            <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-md border border-gray-200">

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-6 bg-black rounded-2xl flex items-center justify-center mb-4">
                        <Link href="/">
                            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-4 cursor-pointer hover:opacity-90 transition">
                                <Mountain size={24} className="text-white" />
                            </div>
                        </Link>
                    </div>
                    <h1 className="text-2xl font-bold text-black">
                        Michi<span className="font-light text-gray-500">Japan</span>
                    </h1>
                    <p className="text-gray-600 text-sm mt-2">
                        Chào mừng bạn quay trở lại
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                    {/* Email */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 uppercase ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="w-full px-5 py-3.5 bg-gray-100 border border-gray-300 rounded-2xl
                                       focus:bg-white focus:border-black outline-none text-sm text-black placeholder-gray-500"
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
                                placeholder="••••••••"
                                className="w-full px-5 py-3.5 bg-gray-100 border border-gray-300 rounded-2xl
                                           focus:bg-white focus:border-black outline-none text-sm text-black placeholder-gray-500 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <Link href="#" className="text-xs text-gray-600 hover:underline">
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <button className="w-full py-4 bg-black text-white rounded-2xl font-semibold text-sm
                                       hover:bg-gray-800 transition flex items-center justify-center gap-2">
                        Đăng nhập
                        <ArrowRight size={16} />
                    </button>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-500">
                            Hoặc tiếp tục với
                        </span>
                    </div>
                </div>

                {/* Social */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 text-sm">
                        <Chrome size={18} /> Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 text-sm">
                        <Facebook size={18} /> Facebook
                    </button>
                </div>

                <p className="text-center mt-10 text-sm text-gray-600">
                    Chưa có tài khoản?{" "}
                    <Link href={`/${locale}/register`} className="font-semibold text-black hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}
