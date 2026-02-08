"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Plus, Pencil, Trash2, X, Search, MapPin, Check
} from "lucide-react";
import { API_ROUTES } from "@/src/lib/api-routes";
import PlaceForm from "./PlaceForm";

const PLACE_TYPES = [
    "restaurant",
    "cafe",
    "attraction",
    "checkin",
    "shopping",
    "entertainment",
]


type Region = { id: number; name: string };

type Place = {
    id?: number;
    region_id: number;
    region_name?: string;

    name: string;
    place_type: string; // restaurant | cafe | attraction | checkin | shopping | entertainment

    description?: string;
    address?: string;
    map_url?: string;

    average_price?: number;
    price_range?: string;

    rating?: number;
    image_urls: string[];
    tags: string[];

    is_active: boolean;
};


export default function PlacesManagement() {
    const [places, setPlaces] = useState<Place[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState<Place | null>(null);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("all");

    /* ================= FETCH ================= */
    const fetchData = async () => {
        setLoading(true);
        try {
            const pRes = await fetch(API_ROUTES.ADMIN.PLACES);
            const pData = await pRes.json();
            setPlaces(Array.isArray(pData) ? pData : []);

            const rRes = await fetch(API_ROUTES.ADMIN.REGIONS);
            setRegions(await rRes.json());
        } catch (e) {
            console.error("Fetch error:", e);
        }
        setLoading(false);
    };



    /* ================= SAVE ================= */
    const savePlace = async () => {
        if (!editing) return;

        const method = editing.id ? "PUT" : "POST";
        const url = editing.id
            ? `${API_ROUTES.ADMIN.PLACES}/${editing.id}`
            : API_ROUTES.ADMIN.PLACES;

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editing),
        });

        setEditing(null);
        fetchData();
    };

    const deletePlace = async (id?: number) => {
        if (!id || !confirm("Xóa địa điểm này?")) return;
        await fetch(`${API_ROUTES.ADMIN.PLACES}/${id}`, { method: "DELETE" });
        fetchData();
    };

    /* ================= FILTER ================= */
    const filtered = useMemo(() => {
        if (!Array.isArray(places)) return [];
        return places.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [places, search]);

    useEffect(() => { fetchData(); }, []);
    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">📍 Quản lý Địa điểm (Places)</h1>
                    <p className="text-sm text-gray-500">
                        Dùng cho AI sinh lịch trình
                    </p>
                </div>
                <button
                    onClick={() => setEditing({
                        name: "",
                        region_id: regions[0]?.id,
                        place_type: "attraction",
                        image_urls: [],
                        tags: [],
                        is_active: true,
                    })}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl"
                >
                    <Plus size={16} /> Thêm địa điểm
                </button>
            </div>

            {/* FILTER */}
            <div className="flex gap-4 bg-white p-4 rounded-xl border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input
                        className="w-full pl-10 py-2 border rounded-lg"
                        placeholder="Tìm theo tên..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="border rounded-lg px-4"
                >
                    <option value="all">Tất cả loại</option>
                    {PLACE_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-xl border overflow-hidden">
                {loading ? (
                    <div className="p-6 text-center text-gray-500">Loading...</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 text-left">Tên</th>
                                <th className="px-4 py-3">Loại</th>
                                <th className="px-4 py-3">Vùng</th>
                                <th className="px-4 py-3">Rating</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filtered.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{p.name}</td>
                                    <td className="px-4 py-3 text-xs uppercase">{p.place_type}</td>
                                    <td className="px-4 py-3 text-xs">{p.region_name}</td>
                                    <td className="px-4 py-3 text-center">{p.rating || "-"}</td>
                                    <td className="px-4 py-3 text-center">
                                        {p.is_active ? <Check className="text-green-500 mx-auto" /> : <X className="mx-auto" />}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setEditing(p)} className="p-1 text-blue-600"><Pencil size={14} /></button>
                                        <button onClick={() => deletePlace(p.id)} className="p-1 text-red-500"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* MODAL */}
            {editing && (
                <PlaceForm
                    place={editing}
                    regions={regions}
                    onChange={setEditing}
                    onClose={() => setEditing(null)}
                    onSave={savePlace}
                />
            )}
        </div>
    );
}
