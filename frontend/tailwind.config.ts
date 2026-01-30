import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    bg: "#F9F9F7", // Màu trắng ngà (giấy washi)
                    dark: "#1A1A1A", // Màu đen mực
                    accent: "#E63946", // Màu đỏ mặt trời (cho CTA)
                    soft: "#F1F1F1", // Màu xám nhẹ
                }
            },
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            backgroundImage: {
                'hero-pattern': "url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop')",
            }
        },
    },
    plugins: [],
};
export default config;