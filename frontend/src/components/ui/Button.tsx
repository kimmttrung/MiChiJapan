// src/components/ui/Button.tsx
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "outline";
}

export default function Button({
    children,
    variant = "primary",
    className = "",
    ...props
}: ButtonProps) {
    const base =
        "px-5 py-2 rounded-lg font-semibold transition-all duration-200";

    const styles =
        variant === "primary"
            ? "bg-red-600 text-white hover:bg-red-700"
            : "border border-gray-300 text-gray-700 hover:bg-gray-100";

    return (
        <button className={`${base} ${styles} ${className}`} {...props}>
            {children}
        </button>
    );
}