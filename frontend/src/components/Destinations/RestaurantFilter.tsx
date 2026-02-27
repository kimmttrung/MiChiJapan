"use client";

import { useState } from "react";

export default function RestaurantFilter({ restaurants, onFilter }: any) {
    const [rating, setRating] = useState(0);
    const [tag, setTag] = useState("");

    function applyFilter() {
        let result = restaurants;

        if (rating > 0) {
            result = result.filter((r: any) => r.rating >= rating);
        }

        if (tag) {
            result = result.filter((r: any) =>
                r.tags?.includes(tag)
            );
        }

        onFilter(result);
    }

    return (
        <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-xl">
            <select
                className="border px-3 py-2 rounded-lg"
                onChange={(e) => setRating(Number(e.target.value))}
            >
                <option value={0}>Tất cả rating</option>
                <option value={4}>4⭐ trở lên</option>
                <option value={4.5}>4.5⭐ trở lên</option>
            </select>

            <select
                className="border px-3 py-2 rounded-lg"
                onChange={(e) => setTag(e.target.value)}
            >
                <option value="">Tất cả dịch vụ</option>
                <option value="Kid-friendly">Kid-friendly</option>
                <option value="Delivery">Delivery</option>
                <option value="Alcohol served">Alcohol</option>
            </select>

            <button
                onClick={applyFilter}
                className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
                Lọc
            </button>
        </div>
    );
}