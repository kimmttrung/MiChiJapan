"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // 1. Chỉ chạy code này sau khi component đã thực sự hiển thị trên trình duyệt
        setIsMounted(true);

        const savedUser = localStorage.getItem("michi_user");
        const token = localStorage.getItem("michi_token");

        if (savedUser && token) {
            try {
                const parsedUser = JSON.parse(savedUser);
                // 2. Cập nhật state một cách an toàn
                setUser(parsedUser);
            } catch (e) {
                localStorage.removeItem("michi_user");
            }
        }
    }, []);



    const login = (token: string, userData: User) => {
        localStorage.setItem("michi_token", token);
        localStorage.setItem("michi_user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("michi_token");
        localStorage.removeItem("michi_user");
        setUser(null);
        window.location.reload(); // Reload để xóa sạch trạng thái
    };

    // Nếu chưa mounted (đang ở Server), trả về null hoặc loading để tránh lỗi render
    if (!isMounted) {
        return null;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};