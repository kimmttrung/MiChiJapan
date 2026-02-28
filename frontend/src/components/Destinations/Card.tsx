"use client";

import { Star, MapPin } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";

export default function Card({ data, type, priceLabel, regionId }: any) {
    const locale = useLocale();
    return (
        <div className="group bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition cursor-pointer text-black">
            <Link href={`/${locale}/destinations/${regionId}/hotels/${data.id}`}>
                {/* Image */}
                <div className="relative h-60 overflow-hidden">
                    <img
                        src={data.image_urls?.[0]}
                        alt={data.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />

                    {/* Rating */}
                    <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        {data.rating}
                    </div>

                    {/* isActive badge */}
                    {!data.is_active && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs px-3 py-1 rounded-full">
                            Tạm ngưng
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <p className="text-xs text-gray-400 uppercase mb-1">
                        {type === "hotel" ? "Hotel" : "Item"}
                    </p>

                    <h3 className="font-bold text-lg line-clamp-1">
                        {data.name}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                        {data.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {data.tags?.slice(0, 3).map((tag: string, index: number) => (
                            <span
                                key={index}
                                className="text-[10px] bg-gray-100 px-2 py-1 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-400 flex items-center gap-1 truncate max-w-[60%]">
                            <MapPin size={12} />
                            {data.address}
                        </p>

                        {data.price_per_night && (
                            <div className="text-right">
                                <span className="font-bold text-lg">
                                    ¥{data.price_per_night.toLocaleString()}
                                </span>
                                <span className="text-xs text-gray-400">
                                    / {priceLabel}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>

    );
}