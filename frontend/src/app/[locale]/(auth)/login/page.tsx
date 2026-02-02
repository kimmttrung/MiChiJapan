"use client";
import Link from "next/link";
import { Mountain, Chrome, Facebook } from "lucide-react";
import { useLocale } from "next-intl";
import LoginForm from "@/src/components/Auth/LoginForm"; // Import component vừa tạo

export default function LoginPage() {
    const locale = useLocale();

    return (
        <div className="min-h-screen bg-[#F6F6F4] flex flex-col items-center justify-center px-4 pt-20 pb-10">
            <div className="w-full max-w-md bg-white p-10 rounded-[2rem] shadow-md border border-gray-200">

                {/* Logo & Header */}
                <div className="flex flex-col items-center mb-8">
                    <Link href={`/${locale}`}>
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-4 cursor-pointer hover:scale-105 transition-transform">
                            <Mountain size={24} className="text-white" />
                        </div>
                    </Link>
                    <h1 className="text-2xl font-bold text-black">
                        Michi<span className="font-light text-gray-500">Japan</span>
                    </h1>
                    <p className="text-gray-600 text-sm mt-2 font-medium">
                        Chào mừng bạn quay trở lại
                    </p>
                </div>

                {/* --- PHẦN FORM CHÍNH --- */}
                <LoginForm />

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-3 text-gray-400 font-medium">
                            Hoặc tiếp tục với
                        </span>
                    </div>
                </div>

                {/* Social Login */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-medium">
                        <Chrome size={18} className="text-red-500" /> Google
                    </button>
                    <button className="flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-medium">
                        <Facebook size={18} className="text-blue-600" /> Facebook
                    </button>
                </div>

                <p className="text-center mt-10 text-sm text-gray-600">
                    Chưa có tài khoản?{" "}
                    <Link href={`/${locale}/register`} className="font-bold text-black hover:underline">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
}