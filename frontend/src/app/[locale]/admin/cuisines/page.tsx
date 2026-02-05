"use client";

import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Utensils } from "lucide-react";
import { API_ROUTES } from "@/src/lib/api-routes";

/* ================= TYPES ================= */
type Cuisine = {
    id: number;
    name: string;
};

/* ================= PAGE ================= */
export default function CuisinesManagement() {
    const [cuisines, setCuisines] = useState<Cuisine[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Modal State
    const [editingCuisine, setEditingCuisine] = useState<Partial<Cuisine> | null>(null);

    /* --- FETCH --- */
    const fetchCuisines = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ROUTES.ADMIN.CUISINES);
            if (res.ok) {
                setCuisines(await res.json());
            }
        } catch (error) {
            console.error("Failed to fetch", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCuisines();
    }, []);

    /* --- SAVE --- */
    const saveCuisine = async () => {
        if (!editingCuisine?.name) return alert("Vui lòng nhập tên");

        const method = editingCuisine.id ? "PUT" : "POST";
        const url = editingCuisine.id
            ? `${API_ROUTES.ADMIN.CUISINES}/${editingCuisine.id}`
            : API_ROUTES.ADMIN.CUISINES;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editingCuisine.name }),
            });

            if (!res.ok) throw new Error("Lỗi khi lưu");
            setEditingCuisine(null);
            fetchCuisines();
        } catch (error) {
            alert("Có lỗi xảy ra (Có thể tên bị trùng)");
        }
    };

    /* --- DELETE --- */
    const deleteCuisine = async (id: number) => {
        if (!confirm("Bạn có chắc muốn xóa?")) return;
        try {
            await fetch(`${API_ROUTES.ADMIN.CUISINES}/${id}`, { method: "DELETE" });
            fetchCuisines();
        } catch (error) {
            alert("Không thể xóa");
        }
    };

    /* --- FILTER --- */
    const filteredCuisines = cuisines.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">🥗 Loại Ẩm thực</h1>
                    <p className="text-gray-500 text-sm">Quản lý danh mục món ăn (Nhật, Hàn, Việt...)</p>
                </div>
                <button
                    onClick={() => setEditingCuisine({ name: "" })}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition shadow-md"
                >
                    <Plus size={16} /> Thêm mới
                </button>
            </div>

            {/* SEARCH */}
            <div className="bg-white p-4 rounded-xl border shadow-sm relative">
                <Search className="absolute left-6 top-6 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Tìm kiếm loại ẩm thực..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* LIST */}
            <div className="bg-white rounded-2xl border shadow-sm p-6">
                {loading ? (
                    <div className="text-center text-gray-500">Đang tải...</div>
                ) : filteredCuisines.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">Chưa có dữ liệu.</div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredCuisines.map((c) => (
                            <div key={c.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border hover:border-black/20 transition group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <Utensils size={14} />
                                    </div>
                                    <span className="font-semibold text-gray-700">{c.name}</span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => setEditingCuisine(c)} className="p-1.5 hover:bg-white rounded-md text-blue-600"><Pencil size={14} /></button>
                                    <button onClick={() => deleteCuisine(c.id)} className="p-1.5 hover:bg-white rounded-md text-red-500"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL */}
            {editingCuisine && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scale-up">
                        <button onClick={() => setEditingCuisine(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20} /></button>

                        <h2 className="text-xl font-bold mb-4">
                            {editingCuisine.id ? "Sửa Loại Ẩm Thực" : "Thêm Loại Mới"}
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Tên loại ẩm thực</label>
                                <input
                                    autoFocus
                                    className="w-full border rounded-xl px-4 py-2"
                                    placeholder="VD: Hải sản, Đồ nướng..."
                                    value={editingCuisine.name || ""}
                                    onChange={e => setEditingCuisine({ ...editingCuisine, name: e.target.value })}
                                    onKeyDown={e => e.key === "Enter" && saveCuisine()}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setEditingCuisine(null)} className="px-4 py-2 rounded-lg bg-gray-100 font-medium hover:bg-gray-200">Hủy</button>
                                <button onClick={saveCuisine} className="px-4 py-2 rounded-lg bg-black text-white font-medium hover:bg-gray-800">Lưu lại</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}