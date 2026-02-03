"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Mở rộng interface User để bao gồm đầy đủ các trường bạn dùng
interface User {
    id: number;
    email: string;
    full_name: string;
    role: string;
    avatar_url?: string;
    phone?: string;
    address?: string;
    bio?: string;
    created_at?: string;
    // ... các trường khác nếu có
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: (redirectPath?: string) => void;
    updateUser: (data: Partial<User>) => void; // Hàm mới để cập nhật user
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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

    const logout = (redirectPath?: string) => {
        localStorage.removeItem("michi_token");
        localStorage.removeItem("michi_user");
        setUser(null);
        window.location.href = redirectPath || "/login";
    };

    // --- HÀM UPDATE USER MỚI ---
    // Nhận vào 'data' là một phần của User (Partial<User>)
    // Nghĩa là bạn có thể chỉ truyền { full_name: "A" } mà không cần truyền hết
    const updateUser = (data: Partial<User>) => {
        if (!user) return; // Nếu chưa đăng nhập thì không làm gì

        // Gộp dữ liệu cũ với dữ liệu mới
        const updatedUser = { ...user, ...data };

        // Cập nhật State
        setUser(updatedUser);

        // Cập nhật LocalStorage để khi F5 không bị mất
        localStorage.setItem("michi_user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
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