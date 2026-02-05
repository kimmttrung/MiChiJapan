"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
    Plus, Pencil, Trash2, X, Check, Image as ImageIcon, Star, Search,
    ChevronLeft, ChevronRight, Utensils,
    // Icons for Tags
    Wifi, SquareParking, Snowflake, Baby, Waves, Briefcase, Bell, Bus, Wine
} from "lucide-react";
import { API_ROUTES } from "@/src/lib/api-routes";

/* ================= CONSTANTS ================= */

const ITEMS_PER_PAGE = 5; // Tăng lên xíu cho đẹp

const PREDEFINED_TAGS = [
    { name: "Free Wi-Fi", icon: <Wifi size={16} /> },
    { name: "Parking", icon: <SquareParking size={16} /> },
    { name: "Air-conditioned", icon: <Snowflake size={16} /> },
    { name: "Kid-friendly", icon: <Baby size={16} /> },
    { name: "Outdoor seating", icon: <Waves size={16} /> },
    { name: "Credit cards", icon: <Briefcase size={16} /> },
    { name: "Reservation", icon: <Bell size={16} /> },
    { name: "Delivery", icon: <Bus size={16} /> },
    { name: "Takeout", icon: <Utensils size={16} /> },
    { name: "Alcohol served", icon: <Wine size={16} /> },
];

/* ================= TYPES ================= */

type Region = { id: number; name: string };
type CuisineType = { id: number; name: string };

type RestaurantCuisine = {
    id?: number;
    cuisine_id: number;
    cuisine_name?: string;
    description?: string;
    average_price?: number;
    price_range?: string;
    is_available?: boolean;
    image_url?: string; // <--- NEW: Ảnh món ăn
};

type Restaurant = {
    id?: number;
    region_id?: number;
    region_name?: string;
    name: string;
    description?: string;
    address?: string;
    rating?: number;
    map_url?: string;
    image_urls: string[]; // Ảnh không gian quán
    tags: string[];
    is_active: boolean;
    cuisines_data: RestaurantCuisine[];
};

/* ================= PAGE ================= */

export default function RestaurantsManagement() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [cuisineTypes, setCuisineTypes] = useState<CuisineType[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);

    // Modals
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
    const [viewingImages, setViewingImages] = useState<{ title: string, urls: string[] } | null>(null); // <--- NEW: State xem ảnh

    const [search, setSearch] = useState("");
    const [filterRegion, setFilterRegion] = useState<number | "all">("all");

    /* ================= FETCH ================= */
    const fetchData = async () => {
        setLoading(true);
        try {
            const resRest = await fetch(API_ROUTES.ADMIN.RESTAURANTS);
            const resReg = await fetch(API_ROUTES.ADMIN.REGIONS);
            const resCuis = await fetch(API_ROUTES.ADMIN.CUISINES);

            const data = await resRest.json();
            setRestaurants(Array.isArray(data) ? data.map((r: any) => ({
                ...r,
                image_urls: r.image_urls || [],
                tags: r.tags || [],
                cuisines_data: r.cuisines_data || []
            })) : []);

            setRegions(await resReg.json());
            setCuisineTypes(await resCuis.json());
        } catch (error) {
            console.error("Error fetching data", error);
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    /* ================= SAVE ================= */
    const saveRestaurant = async () => {
        if (!editingRestaurant) return;

        const payload = {
            ...editingRestaurant,
            cuisines: editingRestaurant.cuisines_data.map(c => ({
                cuisine_id: c.cuisine_id,
                description: c.description,
                average_price: c.average_price,
                price_range: c.price_range,
                is_available: c.is_available,
                image_url: c.image_url // <--- NEW: Gửi ảnh món ăn lên server
            }))
        };

        const method = editingRestaurant.id ? "PUT" : "POST";
        const url = editingRestaurant.id
            ? `${API_ROUTES.ADMIN.RESTAURANTS}/${editingRestaurant.id}`
            : API_ROUTES.ADMIN.RESTAURANTS;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error("Save failed");
            setEditingRestaurant(null);
            fetchData();
        } catch (e) {
            alert("Lỗi khi lưu dữ liệu");
        }
    };

    const deleteRestaurant = async (id?: number) => {
        if (!id || !confirm("Xóa nhà hàng này?")) return;
        try {
            await fetch(`${API_ROUTES.ADMIN.RESTAURANTS}/${id}`, { method: "DELETE" });
            fetchData();
        } catch (e) {
            alert("Lỗi khi xóa");
        }
    };

    /* ================= TABLE LOGIC ================= */
    const filteredData = useMemo(() => {
        return restaurants.filter((r) => {
            const matchSearch = search === "" || r.name.toLowerCase().includes(search.toLowerCase());
            const matchRegion = filterRegion === "all" || r.region_id === filterRegion;
            return matchSearch && matchRegion;
        });
    }, [restaurants, search, filterRegion]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            {/* HEADER & FILTERS (Giữ nguyên) */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">🍽️ Quản lý Nhà hàng</h1>
                    <p className="text-gray-500 text-sm">Quản lý thực đơn, ẩm thực và địa điểm</p>
                </div>
                <button
                    onClick={() => setEditingRestaurant({
                        name: "", region_id: regions[0]?.id, description: "", address: "",
                        rating: 0, image_urls: [], tags: [], map_url: "", is_active: true,
                        cuisines_data: []
                    })}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition shadow-md"
                >
                    <Plus size={16} /> Thêm mới
                </button>
            </div>

            <div className="flex gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input type="text" placeholder="Tìm theo tên..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5" />
                </div>
                <select value={filterRegion} onChange={e => setFilterRegion(e.target.value === "all" ? "all" : Number(e.target.value))} className="px-4 py-2 border rounded-lg bg-white">
                    <option value="all">Tất cả vùng</option>
                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border overflow-hidden shadow-sm overflow-x-auto flex flex-col">
                <table className="w-full text-sm min-w-[1200px]">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-4 py-4 text-left font-semibold text-gray-600 w-[200px]">Tên / Vùng</th>
                            <th className="px-4 py-4 text-left font-semibold text-gray-600 w-[250px]">Ẩm thực & Giá</th> {/* Updated Title */}
                            <th className="px-4 py-4 text-left font-semibold text-gray-600 w-[300px]">
                                Mô tả
                            </th>
                            <th className="px-4 py-4 text-left font-semibold text-gray-600 w-[250px]">Địa chỉ</th>
                            <th className="px-4 py-4 font-semibold text-gray-600 w-[80px]">Rating</th>
                            <th className="px-4 py-4 text-center font-semibold text-gray-600 w-[100px]">Media</th>
                            <th className="px-4 py-4 text-center font-semibold text-gray-600 w-[80px]">Status</th>
                            <th className="px-4 py-4 text-right font-semibold text-gray-600 w-[100px]">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paginatedData.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 transition group">
                                <td className="px-4 py-4 align-top">
                                    <div className="font-bold text-gray-900 text-base">{r.name}</div>
                                    <div className="inline-block bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-0.5 rounded mt-1 uppercase">{r.region_name}</div>
                                </td>

                                {/* CỘT ẨM THỰC: Hiện tên món + Giá */}
                                <td className="px-4 py-4 align-top">
                                    {r.cuisines_data.length > 0 ? (
                                        <div className="space-y-1">
                                            {r.cuisines_data.slice(0, 3).map((c, i) => (
                                                <div key={i} className="flex items-center justify-between text-xs border-b border-dashed pb-1 last:border-0 last:pb-0">
                                                    <div className="flex items-center gap-1.5">
                                                        {c.is_available ? (
                                                            <Check size={12} className="text-green-600" />
                                                        ) : (
                                                            <X size={12} className="text-red-500" />
                                                        )}

                                                        <span className={`font-medium text-xs ${c.is_available ? "text-gray-700" : "text-gray-400 line-through"}`}>
                                                            {c.cuisine_name}
                                                        </span>
                                                    </div>
                                                    {/* NEW: Hiện Price Range */}
                                                    <span className="text-gray-500 font-mono text-[10px]">
                                                        {c.price_range || "N/A"}
                                                    </span>
                                                </div>
                                            ))}
                                            {r.cuisines_data.length > 3 && <div className="text-[10px] text-gray-400 italic">+ {r.cuisines_data.length - 3} món khác...</div>}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">Chưa có menu</span>
                                    )}
                                </td>
                                <td className="px-4 py-4 text-xs text-gray-600 line-clamp-3">
                                    {r.description || <span className="italic text-gray-400">Chưa có mô tả</span>}
                                </td>


                                <td className="px-4 py-4 align-top text-gray-600 text-xs">{r.address}</td>
                                <td className="px-4 py-4 align-top text-center text-yellow-600 font-semibold text-xs">
                                    <span className="flex items-center justify-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                        <Star size={12} fill="currentColor" /> {r.rating ? r.rating.toFixed(1) : 0}
                                    </span>
                                </td>

                                {/* CỘT MEDIA: Bấm vào để xem Gallery */}
                                <td className="px-4 py-4 align-top text-center">
                                    {r.image_urls.length > 0 ? (
                                        <button
                                            onClick={() => setViewingImages({ title: r.name, urls: r.image_urls })}
                                            className="relative inline-flex group/btn"
                                        >
                                            <div className="w-12 h-12 rounded-lg border overflow-hidden shadow-sm">
                                                <img src={r.image_urls[0]} alt="thumb" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                                +{r.image_urls.length}
                                            </span>
                                        </button>
                                    ) : (
                                        <span className="text-gray-300 text-xs">No img</span>
                                    )}
                                </td>

                                <td className="px-4 py-4 align-top text-center">
                                    {r.is_active ? <Check size={16} className="text-green-500 mx-auto" /> : <X size={16} className="text-gray-400 mx-auto" />}
                                </td>

                                <td className="px-4 py-4 align-top text-right">
                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingRestaurant(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Sửa">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => deleteRestaurant(r.id)} className="p-2 text-red-500 hover:bg-red-50 rounded">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls (Giữ nguyên) */}
                {totalPages > 1 && (
                    <div className="px-4 py-4 border-t bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-gray-200 disabled:opacity-30"><ChevronRight size={16} /></button>
                        </div>
                    </div>
                )}
            </div>

            {/* FORM MODAL */}
            {editingRestaurant && (
                <RestaurantForm
                    restaurant={editingRestaurant}
                    regions={regions}
                    cuisineTypes={cuisineTypes}
                    onChange={setEditingRestaurant}
                    onClose={() => setEditingRestaurant(null)}
                    onSave={saveRestaurant}
                />
            )}

            {/* NEW: IMAGE GALLERY MODAL */}
            {viewingImages && (
                <ImageGalleryModal
                    title={viewingImages.title}
                    images={viewingImages.urls}
                    onClose={() => setViewingImages(null)}
                />
            )}
        </div>
    );
}

/* ================= COMPONENT: IMAGE GALLERY MODAL (NEW) ================= */

function ImageGalleryModal({ images, title, onClose }: { images: string[], title: string, onClose: () => void }) {
    const [idx, setIdx] = useState(0);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"><X size={32} /></button>

            <div className="max-w-5xl w-full flex flex-col items-center gap-4">
                <h3 className="text-white text-lg font-semibold">{title} ({idx + 1}/{images.length})</h3>

                <div className="relative w-full aspect-video md:h-[70vh] flex items-center justify-center">
                    <img src={images[idx]} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-gray-700" alt="Preview" />

                    {images.length > 1 && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i === 0 ? images.length - 1 : i - 1)) }} className="absolute left-4 bg-white/10 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md">
                                <ChevronLeft size={24} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setIdx(i => (i === images.length - 1 ? 0 : i + 1)) }} className="absolute right-4 bg-white/10 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-md">
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-2 overflow-x-auto max-w-full pb-2">
                    {images.map((img, i) => (
                        <button key={i} onClick={() => setIdx(i)} className={`w-16 h-16 shrink-0 rounded border-2 overflow-hidden ${i === idx ? "border-blue-500 opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}>
                            <img src={img} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ================= COMPONENT: RESTAURANT FORM (UPDATED) ================= */

interface RestaurantFormProps {
    restaurant: Restaurant;
    regions: Region[];
    cuisineTypes: CuisineType[];
    onChange: (r: Restaurant) => void;
    onClose: () => void;
    onSave: () => void;
}

function RestaurantForm({ restaurant, regions, cuisineTypes, onChange, onClose, onSave }: RestaurantFormProps) {
    const updateField = (field: keyof Restaurant, value: any) => {
        onChange({ ...restaurant, [field]: value });
    };

    const toggleTag = (tagName: string) => {
        const current = restaurant.tags || [];
        updateField("tags", current.includes(tagName) ? current.filter(t => t !== tagName) : [...current, tagName]);
    };

    const addCuisine = () => {
        if (cuisineTypes.length === 0) return;
        const newCuisine: RestaurantCuisine = {
            cuisine_id: cuisineTypes[0].id,
            cuisine_name: cuisineTypes[0].name,
            description: "",
            average_price: 0,
            price_range: "1000-2000",
            is_available: true,
            image_url: "" // <--- Default empty image
        };
        updateField("cuisines_data", [...restaurant.cuisines_data, newCuisine]);
    };

    const removeCuisine = (index: number) => {
        const newList = [...restaurant.cuisines_data];
        newList.splice(index, 1);
        updateField("cuisines_data", newList);
    };

    const updateCuisineRow = (index: number, field: keyof RestaurantCuisine, value: any) => {
        const newList = [...restaurant.cuisines_data];
        newList[index] = { ...newList[index], [field]: value };
        if (field === "cuisine_id") {
            const type = cuisineTypes.find(t => t.id === Number(value));
            if (type) newList[index].cuisine_name = type.name;
        }
        updateField("cuisines_data", newList);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* HEADER FORM */}
                <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {restaurant.id ? "✏️ Chi tiết & Sửa Nhà hàng" : "✨ Thêm Nhà hàng mới"}
                    </h2>
                    <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-black" /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-8">
                    {/* 1. THÔNG TIN CHUNG (Giữ nguyên) */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">1. Thông tin chung</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold mb-1">Tên nhà hàng</label>
                                <input className="w-full border rounded-xl px-4 py-2" value={restaurant.name} onChange={e => updateField("name", e.target.value)} placeholder="VD: Sushi Hokkaido..." />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Khu vực</label>
                                <select className="w-full border rounded-xl px-4 py-2" value={restaurant.region_id} onChange={e => updateField("region_id", Number(e.target.value))}>
                                    {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Rating</label>
                                <input type="number" step="0.1" className="w-full border rounded-xl px-4 py-2" value={restaurant.rating} onChange={e => updateField("rating", e.target.value)} />
                            </div>
                            <div className="flex items-center gap-3 pt-6">
                                <input
                                    type="checkbox"
                                    checked={restaurant.is_active}
                                    onChange={e => updateField("is_active", e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm font-medium">
                                    Nhà hàng đang hoạt động
                                </span>

                                {restaurant.is_active ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                        Active
                                    </span>
                                ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold mb-1">Địa chỉ</label>
                                <textarea className="w-full border rounded-xl px-4 py-2" rows={2} value={restaurant.address || ""} onChange={e => updateField("address", e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold mb-1">
                                    Mô tả nhà hàng
                                </label>
                                <textarea
                                    className="w-full border rounded-xl px-4 py-2 text-sm"
                                    rows={3}
                                    value={restaurant.description || ""}
                                    onChange={e => updateField("description", e.target.value)}
                                    placeholder="Giới thiệu ngắn về phong cách, món nổi bật, đối tượng khách hàng..."
                                />
                            </div>
                        </div>
                    </section>

                    <hr />

                    {/* 2. MENU / ẨM THỰC (Đã cập nhật thêm Image URL) */}
                    <section className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">2. Danh sách Ẩm thực (Menu)</h3>
                            <button onClick={addCuisine} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 flex items-center gap-1">
                                <Plus size={14} /> Thêm món
                            </button>
                        </div>

                        {restaurant.cuisines_data.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed text-gray-400 text-sm">Chưa có thông tin ẩm thực nào. Hãy thêm mới!</div>
                        ) : (
                            <div className="space-y-3">
                                {restaurant.cuisines_data.map((item, idx) => (
                                    <div key={idx} className="border p-4 rounded-xl bg-gray-50 relative group shadow-sm">
                                        <button onClick={() => removeCuisine(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"><X size={16} /></button>

                                        <div className="flex gap-4 items-start">
                                            {/* NEW: Phần ảnh món ăn */}
                                            <div className="w-20 shrink-0 space-y-2">
                                                <div className="w-20 h-20 rounded-lg bg-white border flex items-center justify-center overflow-hidden">
                                                    {item.image_url ? (
                                                        <img src={item.image_url} className="w-full h-full object-cover" alt="food" />
                                                    ) : (
                                                        <ImageIcon className="text-gray-300" size={24} />
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full border rounded px-1 py-1 text-[10px]"
                                                    placeholder="URL ảnh"
                                                    value={item.image_url || ""}
                                                    onChange={e => updateCuisineRow(idx, "image_url", e.target.value)}
                                                />
                                            </div>

                                            {/* Phần thông tin text */}
                                            <div className="flex-1 grid grid-cols-12 gap-3">
                                                <div className="col-span-4">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Loại món</label>
                                                    <select
                                                        className="w-full border rounded-lg px-2 py-1.5 text-sm bg-white"
                                                        value={item.cuisine_id}
                                                        onChange={(e) => updateCuisineRow(idx, "cuisine_id", Number(e.target.value))}
                                                    >
                                                        {cuisineTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                                                    </select>
                                                </div>

                                                <div className="col-span-4">
                                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Khoảng giá</label>
                                                    <input type="text" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={item.price_range || ""} onChange={e => updateCuisineRow(idx, "price_range", e.target.value)} placeholder="1k-2k" />
                                                </div>

                                                <div className="col-span-4 flex items-center pt-5 gap-2">
                                                    <input type="checkbox" checked={item.is_available} onChange={e => updateCuisineRow(idx, "is_available", e.target.checked)} />
                                                    <span className="text-xs">Đang phục vụ</span>
                                                </div>

                                                <div className="col-span-12">
                                                    <input type="text" className="w-full border-b bg-transparent px-1 py-1 text-sm focus:outline-none focus:border-black placeholder-gray-400"
                                                        value={item.description || ""}
                                                        onChange={e => updateCuisineRow(idx, "description", e.target.value)}
                                                        placeholder="Mô tả chi tiết món ăn này..."
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <hr />

                    {/* 3. TAGS & MEDIA (Không gian quán) */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">3. Tiện ích & Không gian quán</h3>

                        {/* Tags */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {PREDEFINED_TAGS.map(tag => {
                                const active = restaurant.tags.includes(tag.name);
                                return (
                                    <button key={tag.name} onClick={() => toggleTag(tag.name)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs border ${active ? "bg-black text-white border-black" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
                                        {tag.icon} {tag.name}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Media Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Ảnh không gian (Nhà hàng)</label>
                            <div className="flex gap-2">
                                <input id="imgInput" className="flex-1 border rounded-xl px-4 py-2 text-sm" placeholder="Paste image URL here..." />
                                <button onClick={() => {
                                    const el = document.getElementById("imgInput") as HTMLInputElement;
                                    if (el.value) { updateField("image_urls", [...restaurant.image_urls, el.value]); el.value = ""; }
                                }} className="bg-gray-200 px-4 rounded-xl font-bold hover:bg-gray-300">+</button>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {restaurant.image_urls.map((url, i) => (
                                    <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border bg-gray-100 group">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button onClick={() => updateField("image_urls", restaurant.image_urls.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500/80 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <input className="w-full border rounded-xl px-4 py-2 text-sm mt-2" value={restaurant.map_url || ""} onChange={e => updateField("map_url", e.target.value)} placeholder="Google Map URL" />
                    </section>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 border bg-white rounded-xl font-medium hover:bg-gray-50">Hủy bỏ</button>
                    <button onClick={onSave} className="px-6 py-2.5 bg-black text-white rounded-xl font-medium shadow-lg hover:bg-gray-800">Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
}