"use client";

import { X } from "lucide-react";

type Region = {
    id: number;
    name: string;
};

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
    "restaurant",
    "cafe",
    "attraction",
    "checkin",
    "shopping",
    "entertainment",
];

interface Props {
    place: Place;
    regions: Region[];
    onChange: (p: Place) => void;
    onClose: () => void;
    onSave: () => void;
}

export default function PlaceForm({
    place,
    regions,
    onChange,
    onClose,
    onSave,
}: Props) {

    const update = (key: keyof Place, value: any) => {
        onChange({ ...place, [key]: value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6 relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black"
                >
                    <X />
                </button>

                <h2 className="text-xl font-bold mb-4">
                    {place.id ? "Sửa địa điểm" : "Thêm địa điểm"}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    {/* NAME */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold">Tên địa điểm</label>
                        <input
                            value={place.name}
                            onChange={e => update("name", e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>

                    {/* REGION */}
                    <div>
                        <label className="text-sm font-semibold">Khu vực</label>
                        <select
                            value={place.region_id}
                            onChange={e => update("region_id", Number(e.target.value))}
                            className="w-full border rounded-lg px-4 py-2"
                        >
                            {regions.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* TYPE */}
                    <div>
                        <label className="text-sm font-semibold">Loại</label>
                        <select
                            value={place.place_type}
                            onChange={e => update("place_type", e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                        >
                            {PLACE_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    {/* PRICE */}
                    <div>
                        <label className="text-sm font-semibold">Giá TB</label>
                        <input
                            type="number"
                            value={place.average_price || ""}
                            onChange={e => update("average_price", Number(e.target.value))}
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold">Khoảng giá</label>
                        <input
                            value={place.price_range || ""}
                            onChange={e => update("price_range", e.target.value)}
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>

                    {/* RATING */}
                    <div>
                        <label className="text-sm font-semibold">Rating</label>
                        <input
                            type="number"
                            step="0.1"
                            value={place.rating || ""}
                            onChange={e => update("rating", Number(e.target.value))}
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>

                    {/* STATUS */}
                    <div className="flex items-center gap-2 mt-6">
                        <input
                            type="checkbox"
                            checked={place.is_active}
                            onChange={e => update("is_active", e.target.checked)}
                        />
                        <span className="text-sm">Đang hoạt động</span>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold">Mô tả</label>
                        <textarea
                            value={place.description || ""}
                            onChange={e => update("description", e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 min-h-[80px]"
                        />
                    </div>

                    {/* IMAGE URLS */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold">
                            Ảnh (mỗi dòng 1 link)
                        </label>
                        <textarea
                            value={place.image_urls.join("\n")}
                            onChange={e => update("image_urls", e.target.value.split("\n"))}
                            className="w-full border rounded-lg px-4 py-2 min-h-[80px]"
                        />
                    </div>

                    {/* TAGS */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold">
                            Tags (cách nhau bởi dấu phẩy)
                        </label>
                        <input
                            value={place.tags.join(", ")}
                            onChange={e => update("tags", e.target.value.split(",").map(t => t.trim()))}
                            className="w-full border rounded-lg px-4 py-2"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
                    >
                        Lưu
                    </button>
                </div>
            </div>
        </div>
    );
}
