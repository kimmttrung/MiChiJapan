"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/src/components/Destinations/Card";

export default function SpotsPage() {
    const { id } = useParams();

    const [spots, setSpots] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [onlyActive, setOnlyActive] = useState(false);

    useEffect(() => {
        if (!id) return;

        fetch(`http://localhost:8000/api/destinations/${id}`)
            .then(res => res.json())
            .then(data => {
                setSpots(data.spots || []);
                setFiltered(data.spots || []);
            });
    }, [id]);

    useEffect(() => {
        let result = [...spots];

        // 🔎 Search theo tên
        if (search) {
            result = result.filter(s =>
                s.name.toLowerCase().includes(search.toLowerCase())
            );
        }

        // 🏷 Lọc theo loại
        if (typeFilter !== "all") {
            result = result.filter(
                s => s.place_type?.toUpperCase() === typeFilter
            );
        }

        // 🟢 Lọc active
        if (onlyActive) {
            result = result.filter(s => s.is_active === true);
        }

        setFiltered(result);

    }, [search, typeFilter, onlyActive, spots]);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-black">
                Địa điểm
            </h1>

            {/* FILTER BAR */}
            <div className="bg-gray-50 p-6 rounded-2xl mb-8 grid md:grid-cols-4 gap-4 text-black">

                {/* Search */}
                <input
                    type="text"
                    placeholder="Tìm theo tên..."
                    className="border px-4 py-2 rounded-lg"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Dropdown loại */}
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="border px-4 py-2 rounded-lg"
                >
                    <option value="all">Tất cả loại hình</option>
                    <option value="CAFE">CAFE</option>
                    <option value="ATTRACTION">ATTRACTION</option>
                    <option value="CHECKIN">CHECKIN</option>
                    <option value="SHOPPING">SHOPPING</option>
                    <option value="ENTERTAINMENT">ENTERTAINMENT</option>
                </select>

                {/* Active */}
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
                {filtered.map(spot => (
                    <Card
                        key={spot.id}
                        data={spot}
                        type="spot"
                    />
                ))}
            </div>
        </div>
    );
}