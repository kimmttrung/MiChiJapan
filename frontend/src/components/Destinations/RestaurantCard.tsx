"use client";

import { Star, MapPin } from "lucide-react";

export default function RestaurantCard({ data }: any) {
    return (
        <div className="group bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition cursor-pointer">

            <div className="relative h-56 overflow-hidden">
                <img
                    src={data.image_urls?.[0]}
                    alt={data.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition"
                />

                <div className="absolute bottom-3 right-3 bg-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {data.rating}
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-lg">{data.name}</h3>

                <p className="text-sm text-gray-500 line-clamp-2 mt-2">
                    {data.description}
                </p>

                <p className="text-xs text-gray-400 mt-3 flex items-center gap-1 truncate">
                    <MapPin size={12} />
                    {data.address}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {data.tags?.slice(0, 3).map((tag: string) => (
                        <span
                            key={tag}
                            className="text-[10px] bg-gray-100 px-2 py-1 rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}