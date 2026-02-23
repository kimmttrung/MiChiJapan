// src/components/ui/Input.tsx
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export default function Input({ className = "", ...props }: InputProps) {
    return (
        <input
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black ${className}`}
            {...props}
        />
    );
}