"use client";

import { MapPin, X } from "lucide-react";
// Import các icon cho tags
import {
    Wifi, SquareParking, Snowflake, Baby, Waves,
    Briefcase, Bell, Bus, Utensils, Wine
} from "lucide-react";

type Region = {
    id: number;
    name: string;
};

// Định nghĩa đúng kiểu dữ liệu khớp với Backend
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

// Danh sách tags có sẵn
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

    // Logic chọn/bỏ chọn tag
    const toggleTag = (tagName: string) => {
        const currentTags = place.tags || [];
        if (currentTags.includes(tagName)) {
            update("tags", currentTags.filter(t => t !== tagName));
        } else {
            update("tags", [...currentTags, tagName]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-3xl rounded-2xl p-6 relative shadow-xl my-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-black"
                >
                    <X />
                </button>

                <h2 className="text-xl font-bold mb-4">
                    {place.id ? "Sửa địa điểm" : "Thêm địa điểm mới"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* NAME */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700">Tên địa điểm <span className="text-red-500">*</span></label>
                        <input
                            value={place.name}
                            onChange={e => update("name", e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-black outline-none"
                            placeholder="Nhập tên địa điểm..."
                        />
                    </div>

                    {/* REGION */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Khu vực <span className="text-red-500">*</span></label>
                        <select
                            value={place.region_id}
                            onChange={e => update("region_id", Number(e.target.value))}
                            className="w-full border rounded-lg px-4 py-2 mt-1 bg-white"
                        >
                            {regions.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* TYPE */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Loại hình</label>
                        <select
                            value={place.place_type}
                            onChange={e => update("place_type", e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mt-1 bg-white"
                        >
                            {PLACE_TYPES.map(t => (
                                <option key={t} value={t}>{t.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* PRICE & RATING */}
                    <div>
                        <label className="text-sm font-semibold text-gray-700">Giá trung bình (VND)</label>
                        <input
                            type="number"
                            value={place.average_price || 0}
                            onChange={e => update("average_price", Number(e.target.value))}
                            className="w-full border rounded-lg px-4 py-2 mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700">Rating (0-5)</label>
                        <input
                            type="number"
                            step="0.1"
                            max="5"
                            value={place.rating || 0}
                            onChange={e => update("rating", Number(e.target.value))}
                            className="w-full border rounded-lg px-4 py-2 mt-1"
                        />
                    </div>

                    {/* ADDRESS */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700">Địa chỉ</label>
                        <input
                            value={place.address || ""}
                            onChange={e => update("address", e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mt-1"
                        />
                    </div>

                    {/* GOOGLE MAP URL (NEW) */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700 flex justify-between">
                            <span>Link Google Maps (URL)</span>
                            {place.map_url && (
                                <a
                                    href={place.map_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <MapPin size={12} /> Xem thử link
                                </a>
                            )}
                        </label>
                        <input
                            value={place.map_url || ""}
                            onChange={e => update("map_url", e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mt-1 focus:ring-2 focus:ring-black outline-none font-mono text-xs"
                            placeholder="https://www.google.com/maps/place/..."
                        />
                        <p className="text-[10px] text-gray-400 mt-1 italic">
                            * Ưu tiên sử dụng link nhúng (iframe src) hoặc link trực tiếp từ Google Maps.
                        </p>
                    </div>

                    {/* TAGS SELECTION (NEW) */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Tiện ích / Tags</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {PREDEFINED_TAGS.map((tag) => {
                                const isSelected = place.tags.includes(tag.name);
                                return (
                                    <button
                                        key={tag.name}
                                        onClick={() => toggleTag(tag.name)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all
                                            ${isSelected
                                                ? "bg-black text-white border-black"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                            }`}
                                    >
                                        {tag.icon}
                                        {tag.name}
                                    </button>
                                );
                            })}
                        </div>
                        {/* Custom Tag Input nếu muốn nhập thêm */}
                        <input
                            placeholder="Nhập thêm tags khác (cách nhau dấu phẩy)..."
                            className="w-full text-xs mt-2 border-b p-1 outline-none focus:border-black"
                            onBlur={(e) => {
                                if (!e.target.value) return;
                                const newTags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                                // Merge unique
                                update("tags", Array.from(new Set([...place.tags, ...newTags])));
                                e.target.value = ""; // clear input
                            }}
                        />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700">Mô tả</label>
                        <textarea
                            value={place.description || ""}
                            onChange={e => update("description", e.target.value)}
                            className="w-full border rounded-lg px-4 py-2 mt-1 min-h-[80px]"
                        />
                    </div>

                    {/* IMAGE URLS */}
                    <div className="col-span-2">
                        <label className="text-sm font-semibold text-gray-700">Link ảnh (Mỗi dòng 1 link)</label>
                        <textarea
                            value={place.image_urls.join("\n")}
                            onChange={e => update("image_urls", e.target.value.split("\n"))}
                            className="w-full border rounded-lg px-4 py-2 mt-1 min-h-[80px] font-mono text-xs"
                            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                        />
                    </div>

                    {/* STATUS */}
                    <div className="col-span-2 pt-2 border-t">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4"
                                checked={place.is_active}
                                onChange={e => update("is_active", e.target.checked)}
                            />
                            <span className="text-sm font-medium">Kích hoạt địa điểm này</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onSave}
                        className="px-5 py-2 rounded-xl bg-black text-white font-medium hover:bg-gray-800 shadow-lg shadow-black/20"
                    >
                        {place.id ? "Lưu thay đổi" : "Tạo mới"}
                    </button>
                </div>
            </div>
        </div>
    );
}