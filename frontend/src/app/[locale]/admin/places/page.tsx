"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Plus, Pencil, Trash2, X, Search, MapPin, Check
} from "lucide-react";
import { API_ROUTES } from "@/src/lib/api-routes";
import PlaceForm from "./PlaceForm";

// Define Types lại cho chắc chắn
type Region = { id: number; name: string };
type Place = {
    id?: number;
    region_id: number;
    name: string;
    place_type: string;
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

const PLACE_TYPES = [
    "restaurant", "cafe", "attraction", "checkin", "shopping", "entertainment",
];

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
            // Fetch Regions trước để có data map
            const rRes = await fetch(API_ROUTES.ADMIN.REGIONS);
            const rData = await rRes.json();
            setRegions(Array.isArray(rData) ? rData : []);

            const pRes = await fetch(API_ROUTES.ADMIN.PLACES);
            const pData = await pRes.json();
            setPlaces(Array.isArray(pData) ? pData : []);
        } catch (e) {
            console.error("Fetch error:", e);
        }
        setLoading(false);
    };

    /* ================= SAVE (FIXED) ================= */
    const savePlace = async () => {
        if (!editing) return;

        // 1. Chuẩn bị Payload sạch sẽ cho Backend (đúng schema Pydantic)
        const payload = {
            region_id: Number(editing.region_id),
            name: editing.name,
            place_type: editing.place_type,
            description: editing.description || null,
            address: editing.address || null,
            map_url: editing.map_url || null,
            average_price: editing.average_price ? Number(editing.average_price) : null,
            price_range: editing.price_range || null,
            rating: editing.rating ? Number(editing.rating) : null,
            image_urls: editing.image_urls.filter(url => url.trim() !== ""), // Lọc link rỗng
            tags: editing.tags,
            is_active: editing.is_active
        };

        const method = editing.id ? "PUT" : "POST";
        const url = editing.id
            ? `${API_ROUTES.ADMIN.PLACES}/${editing.id}`
            : API_ROUTES.ADMIN.PLACES;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                alert(`Lỗi: ${err.detail || "Không lưu được"}`);
                return;
            }

            setEditing(null);
            fetchData(); // Reload lại list
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối server");
        }
    };

    const deletePlace = async (id?: number) => {
        if (!id || !confirm("Xóa địa điểm này?")) return;
        try {
            const res = await fetch(`${API_ROUTES.ADMIN.PLACES}/${id}`, { method: "DELETE" });
            if (res.ok) fetchData();
            else alert("Lỗi khi xóa");
        } catch (e) {
            console.error(e);
        }
    };

    /* ================= FILTER ================= */
    const filtered = useMemo(() => {
        if (!Array.isArray(places)) return [];
        return places.filter(p => {
            const matchesName = p.name.toLowerCase().includes(search.toLowerCase());
            const matchesType = filterType === "all" || p.place_type === filterType;
            return matchesName && matchesType;
        });
    }, [places, search, filterType]);

    // Helper lấy tên vùng
    const getRegionName = (id: number) => {
        const region = regions.find(r => r.id === id);
        return region ? region.name : `ID: ${id}`;
    };

    useEffect(() => { fetchData(); }, []);

    // Hàm mở form tạo mới (đảm bảo region_id có giá trị mặc định)
    const handleAddNew = () => {
        setEditing({
            name: "",
            region_id: regions.length > 0 ? regions[0].id : 0, // Set default region
            place_type: "restaurant", // Set default type
            image_urls: [],
            tags: [],
            is_active: true,
            average_price: 0,
            rating: 5.0
        });
    }

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen font-sans">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📍 Quản lý Địa điểm</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Dữ liệu dùng cho AI sinh lịch trình
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-black/20"
                >
                    <Plus size={18} /> Thêm địa điểm
                </button>
            </div>

            {/* FILTER BAR */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                        placeholder="Tìm kiếm địa điểm..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black/5 min-w-[200px]"
                >
                    <option value="all">Tất cả loại hình</option>
                    {PLACE_TYPES.map(t => (
                        <option key={t} value={t}>{t.toUpperCase()}</option>
                    ))}
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Tên địa điểm</th>
                                    <th className="px-6 py-4">Loại hình</th>
                                    <th className="px-6 py-4">Khu vực</th>
                                    <th className="px-6 py-4 text-center">Đánh giá</th>
                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                    <th className="px-6 py-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                                            Không tìm thấy địa điểm nào
                                        </td>
                                    </tr>
                                )}
                                {filtered.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-xs font-medium uppercase tracking-wide text-gray-600">
                                                {p.place_type}
                                            </span>
                                        </td>
                                        {/* FIX: Lấy tên region từ list regions thay vì p.region_name */}
                                        <td className="px-6 py-4 text-gray-600">{getRegionName(p.region_id)}</td>
                                        <td className="px-6 py-4 text-center font-medium text-amber-500">
                                            {p.rating ? `⭐ ${p.rating}` : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {p.is_active
                                                ? <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600"><Check size={14} /></span>
                                                : <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-500"><X size={14} /></span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setEditing(p)}
                                                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deletePlace(p.id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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