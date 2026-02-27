"use client";

import Card from "@/src/components/Destinations/Card";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function HotelsPage() {
    const { id } = useParams();

    const [hotels, setHotels] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);

    const [search, setSearch] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [sort, setSort] = useState("default");
    const [onlyActive, setOnlyActive] = useState(false);

    useEffect(() => {
        fetch(`http://localhost:8000/api/destinations/${id}`)
            .then(res => res.json())
            .then(data => {
                setHotels(data.hotels);
                setFiltered(data.hotels);
            });
    }, [id]);

    useEffect(() => {
        let result = [...hotels];

        // 🔎 Search theo tên
        if (search) {
            result = result.filter(h =>
                h.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // 💰 Lọc giá
        if (minPrice) {
            result = result.filter(h => h.price_per_night >= Number(minPrice));
        }

        if (maxPrice) {
            result = result.filter(h => h.price_per_night <= Number(maxPrice));
        }

        // 🟢 Lọc isActive
        if (onlyActive) {
            result = result.filter(h => h.is_active === true);
        }

        // 🔃 Sort
        if (sort === "price_asc") {
            result.sort((a, b) => a.price_per_night - b.price_per_night);
        }

        if (sort === "price_desc") {
            result.sort((a, b) => b.price_per_night - a.price_per_night);
        }

        setFiltered(result);

    }, [search, minPrice, maxPrice, sort, onlyActive, hotels]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-black">Khách sạn</h1>

            {/* FILTER BAR */}
            <div className="bg-gray-50 p-6 rounded-2xl mb-8 grid md:grid-cols-5 gap-4 text-black">

                <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    className="border px-4 py-2 rounded-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Giá tối thiểu"
                    className="border px-4 py-2 rounded-lg"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="Giá tối đa"
                    className="border px-4 py-2 rounded-lg"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                />

                <select
                    className="border px-4 py-2 rounded-lg"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                >
                    <option value="default">Sắp xếp</option>
                    <option value="price_asc">Giá tăng dần</option>
                    <option value="price_desc">Giá giảm dần</option>
                </select>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={onlyActive}
                        onChange={() => setOnlyActive(!onlyActive)}
                    />
                    Chỉ hiển thị hoạt động
                </label>
            </div>

            {/* LIST */}
            <div className="grid md:grid-cols-3 gap-8 text-black">
                {filtered.map(hotel => (
                    <Card
                        key={hotel.id}
                        data={hotel}
                        type="hotel"
                        priceLabel="đêm"
                    />
                ))}
            </div>
        </div>
    );
}