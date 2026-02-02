"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
    id?: number; // Thêm id nếu cần
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    isLoading: boolean; // Thêm trạng thái loading để UI biết đường xử lý
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Khởi tạo user là null để khớp với Server Side Rendering (tránh lỗi hydration)
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Logic này chỉ chạy 1 lần duy nhất ở phía Client sau khi render xong
        const initializeAuth = () => {
            try {
                const savedUser = localStorage.getItem("michi_user");
                const token = localStorage.getItem("michi_token");

                if (savedUser && token) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (e) {
                console.error("Lỗi parse user data:", e);
                localStorage.removeItem("michi_user");
                localStorage.removeItem("michi_token");
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
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
        window.location.href = "/login"; // Dùng href để force reload trang hoàn toàn
    };

    // QUAN TRỌNG: Luôn return Provider, không được return null.
    // Dù chưa load xong (isLoading = true), Context vẫn phải tồn tại.
    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};