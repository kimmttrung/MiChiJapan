"use client";

import { useParams } from "next/navigation";
import Navbar from "@/src/components/Navbar";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function DestinationLayout({ children }: any) {
    const { id } = useParams();
    const locale = useLocale();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* TAB NAVIGATION */}
            <div className="mt-24 border-b">
                <div className="max-w-7xl mx-auto flex gap-8 px-6 text-black">
                    <Link href={`/${locale}/destinations/${id}/hotels`} className="py-4 font-semibold hover:text-red-600">
                        🏨 Hotels
                    </Link>

                    <Link href={`/${locale}/destinations/${id}/restaurants`} className="py-4 font-semibold hover:text-red-600">
                        🍽 Restaurants
                    </Link>

                    <Link href={`/${locale}/destinations/${id}/entertainment`} className="py-4 font-semibold hover:text-red-600">
                        🎡 Vui chơi
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10">
                {children}
            </div>
        </main>
    );
}