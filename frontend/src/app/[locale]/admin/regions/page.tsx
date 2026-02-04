"use client";

import { API_ROUTES } from "@/src/lib/api-routes";
import { useEffect, useState } from "react";

type Region = {
    id: number;
    name: string;
    description?: string;
    cover_image?: string;
};

export default function RegionsManagement() {
    const [regions, setRegions] = useState<Region[]>([]);
    const [editing, setEditing] = useState<Region | null>(null);

    const fetchRegions = async () => {
        const res = await fetch(API_ROUTES.ADMIN.REGIONS);
        setRegions(await res.json());
    };

    useEffect(() => {
        fetchRegions();
    }, []);

    const saveRegion = async () => {
        if (!editing) return;

        const method = editing.id ? "PUT" : "POST";
        const url = editing.id
            ? `${API_ROUTES.ADMIN.REGIONS}/${editing.id}`
            : API_ROUTES.ADMIN.REGIONS;

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editing),
        });

        setEditing(null);
        fetchRegions();
    };

    const deleteRegion = async (id: number) => {
        if (!confirm("Xóa vùng này?")) return;
        await fetch(`${API_ROUTES.ADMIN.REGIONS}/${id}`, { method: "DELETE" });
        fetchRegions();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold">🗾 Quản lý Vùng du lịch</h1>
                <button
                    onClick={() => setEditing({ id: 0, name: "" })}
                    className="bg-black text-white px-4 py-2 rounded-xl"
                >
                    + Thêm vùng
                </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {regions.map(r => (
                    <div
                        key={r.id}
                        className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                    >
                        {r.cover_image && (
                            <img
                                src={r.cover_image}
                                className="h-40 w-full object-cover"
                            />
                        )}
                        <div className="p-4 space-y-2">
                            <h3 className="font-bold text-lg">{r.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                                {r.description}
                            </p>

                            <div className="flex justify-end gap-3 text-sm">
                                <button
                                    onClick={() => setEditing(r)}
                                    className="text-blue-600"
                                >
                                    Sửa
                                </button>
                                <button
                                    onClick={() => deleteRegion(r.id)}
                                    className="text-red-500"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white w-[420px] p-6 rounded-2xl space-y-4">
                        <input
                            placeholder="Tên vùng"
                            className="w-full border px-4 py-2 rounded-xl"
                            value={editing.name}
                            onChange={e =>
                                setEditing({ ...editing, name: e.target.value })
                            }
                        />
                        <textarea
                            placeholder="Mô tả"
                            className="w-full border px-4 py-2 rounded-xl"
                            value={editing.description ?? ""}
                            onChange={e =>
                                setEditing({ ...editing, description: e.target.value })
                            }
                        />
                        <input
                            placeholder="Cover image URL"
                            className="w-full border px-4 py-2 rounded-xl"
                            value={editing.cover_image ?? ""}
                            onChange={e =>
                                setEditing({ ...editing, cover_image: e.target.value })
                            }
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditing(null)}
                                className="border px-4 py-2 rounded-xl"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={saveRegion}
                                className="bg-black text-white px-4 py-2 rounded-xl"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
