"use client";

import React, { useEffect, useMemo, useState, ReactNode, SVGProps, KeyboardEvent } from "react";
import {
    Plus, Pencil, Trash2, X, MapPin, Check, Image as ImageIcon, Star, Search,
    ChevronLeft, ChevronRight, // <--- Thêm icon mũi tên
    Wifi, Coffee, SquareParking, Accessibility, Waves, Snowflake,
    Shirt, Briefcase, PawPrint, Umbrella, Bell, Baby, Utensils,
    Bus, Bath, Flower, Dumbbell, Wine, CigaretteOff
} from "lucide-react";
import { API_ROUTES } from "@/src/lib/api-routes";

/* ================= CONSTANTS ================= */

const ITEMS_PER_PAGE = 4; // <--- Cấu hình số lượng hiển thị 1 trang

const PREDEFINED_TAGS = [
    { name: "Free Wi-Fi", icon: <Wifi size={16} /> },
    { name: "Free breakfast", icon: <Coffee size={16} /> },
    { name: "Free parking", icon: <SquareParking size={16} /> },
    { name: "Accessible", icon: <Accessibility size={16} /> },
    { name: "Outdoor pool", icon: <Waves size={16} /> },
    { name: "Air-conditioned", icon: <Snowflake size={16} /> },
    { name: "Laundry service", icon: <Shirt size={16} /> },
    { name: "Business center", icon: <Briefcase size={16} /> },
    { name: "Pet-friendly", icon: <PawPrint size={16} /> },
    { name: "Beach access", icon: <Umbrella size={16} /> },
    { name: "Room service", icon: <Bell size={16} /> },
    { name: "Kid-friendly", icon: <Baby size={16} /> },
    { name: "Restaurant", icon: <Utensils size={16} /> },
    { name: "Airport shuttle", icon: <Bus size={16} /> },
    { name: "Hot tub", icon: <Bath size={16} /> },
    { name: "Spa", icon: <Flower size={16} /> },
    { name: "Fitness center", icon: <Dumbbell size={16} /> },
    { name: "Bar", icon: <Wine size={16} /> },
    { name: "Smoke-free", icon: <CigaretteOff size={16} /> },
];

/* ================= TYPES & INTERFACES ================= */

type Region = {
    id: number;
    name: string;
};

type Hotel = {
    id?: number;
    region_id?: number;
    region_name?: string;

    name: string;
    description?: string;
    address?: string;

    price_per_night?: number;
    rating?: number;

    map_url?: string;
    image_urls: string[];
    tags: string[];

    is_active: boolean;
};

/* ================= PAGE ================= */

export default function HotelsManagement() {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [regions, setRegions] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // Modal States
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [previewImagesHotel, setPreviewImagesHotel] = useState<Hotel | null>(null);
    const [previewMapHotel, setPreviewMapHotel] = useState<Hotel | null>(null);

    // Filters
    const [search, setSearch] = useState("");
    const [filterRegion, setFilterRegion] = useState<number | "all">("all");

    /* ================= FETCH ================= */

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_ROUTES.ADMIN.HOTELS);
            const data = await res.json();

            const sanitizedData = Array.isArray(data)
                ? data.map((h: Hotel) => ({
                    ...h,
                    image_urls: h.image_urls || [],
                    tags: h.tags || [],
                }))
                : [];
            setHotels(sanitizedData);
        } catch (error) {
            console.error("Failed to fetch hotels", error);
        }
        setLoading(false);
    };

    const fetchRegions = async () => {
        try {
            const res = await fetch(API_ROUTES.ADMIN.REGIONS);
            setRegions(await res.json());
        } catch (error) {
            console.error("Failed to fetch regions", error);
        }
    };

    useEffect(() => {
        fetchHotels();
        fetchRegions();
    }, []);

    /* ================= PAGINATION LOGIC ================= */

    // 1. Lọc dữ liệu trước
    const filteredHotels = useMemo(() => {
        return hotels.filter((h) => {
            const matchesSearch =
                search === "" || h.name.toLowerCase().includes(search.toLowerCase());
            const matchesRegion =
                filterRegion === "all" || h.region_id === filterRegion;

            return matchesSearch && matchesRegion;
        });
    }, [hotels, search, filterRegion]);

    // 2. Reset về trang 1 khi search/filter thay đổi
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterRegion]);

    // 3. Cắt dữ liệu cho trang hiện tại
    const totalPages = Math.ceil(filteredHotels.length / ITEMS_PER_PAGE);
    const paginatedHotels = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredHotels.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredHotels, currentPage]);

    // 4. Hàm tạo danh sách số trang (xử lý dấu ...)
    const getPageNumbers = () => {
        const delta = 1; // Số trang hiện bên cạnh trang hiện tại
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        for (const i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    /* ================= SAVE & DELETE ================= */

    const saveHotel = async () => {
        if (!editingHotel) return;
        const method = editingHotel.id ? "PUT" : "POST";
        const url = editingHotel.id ? `${API_ROUTES.ADMIN.HOTELS}/${editingHotel.id}` : API_ROUTES.ADMIN.HOTELS;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingHotel),
            });
            if (!res.ok) throw new Error("Lỗi khi lưu");
            setEditingHotel(null);
            fetchHotels();
        } catch (error) {
            alert("Có lỗi xảy ra khi lưu dữ liệu!");
        }
    };

    const deleteHotel = async (id?: number) => {
        if (!id || !confirm("Bạn có chắc muốn xóa khách sạn này?")) return;
        try {
            await fetch(`${API_ROUTES.ADMIN.HOTELS}/${id}`, { method: "DELETE" });
            fetchHotels();
        } catch (error) {
            alert("Không thể xóa khách sạn");
        }
    };

    /* ================= UI ================= */

    return (
        <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">🏨 Quản lý Khách sạn</h1>
                    <p className="text-gray-500 text-sm">Quản lý danh sách, địa chỉ và thông tin chi tiết</p>
                </div>
                <button
                    onClick={() =>
                        setEditingHotel({
                            name: "",
                            region_id: regions[0]?.id,
                            description: "",
                            address: "",
                            price_per_night: 0,
                            rating: 5,
                            image_urls: [],
                            tags: [],
                            map_url: "",
                            is_active: true,
                        })
                    }
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition shadow-md"
                >
                    <Plus size={16} /> Thêm mới
                </button>
            </div>

            {/* FILTERS */}
            <div className="flex gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                </div>
                <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value === "all" ? "all" : Number(e.target.value))}
                    className="px-4 py-2 border rounded-lg bg-white"
                >
                    <option value="all">Tất cả vùng</option>
                    {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl border overflow-hidden shadow-sm overflow-x-auto flex flex-col">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-sm min-w-[1200px]">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-4 text-left font-semibold text-gray-600 w-[200px]">Tên / Vùng</th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-600 w-[250px]">Địa chỉ</th>
                                <th className="px-4 py-4 text-left font-semibold text-gray-600 w-[250px]">Mô tả</th>
                                <th className="px-4 py-4 font-semibold text-gray-600 w-[120px]">Giá & Sao</th>
                                <th className="px-4 py-4 text-center font-semibold text-gray-600 w-[100px]">Media</th>
                                <th className="px-4 py-4 text-center font-semibold text-gray-600 w-[100px]">Trạng thái</th>
                                <th className="px-4 py-4 text-right font-semibold text-gray-600 w-[100px]"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y">
                            {paginatedHotels.map((h) => (
                                <tr key={h.id} className="hover:bg-gray-50 transition group">
                                    <td className="px-4 py-4 align-top">
                                        <div className="font-bold text-gray-900 text-base">{h.name}</div>
                                        <div className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded mt-1">
                                            {h.region_name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="text-gray-600 text-xs line-clamp-3" title={h.address}>
                                            {h.address || <span className="italic text-gray-400">Chưa có địa chỉ</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="text-gray-500 text-xs line-clamp-3" title={h.description}>
                                            {h.description || <span className="italic text-gray-400">Không có mô tả</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="font-semibold text-gray-900">
                                            {h.price_per_night?.toLocaleString()} đ
                                        </div>
                                        <div className="flex items-center text-yellow-500 text-xs mt-1 gap-1">
                                            <Star size={12} fill="currentColor" /> {h.rating ? Number(h.rating).toFixed(1) : 0}/5
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top text-center">
                                        <div className="flex justify-center gap-1">
                                            {h.image_urls?.length > 0 && (
                                                <button onClick={() => setPreviewImagesHotel(h)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 relative">
                                                    <ImageIcon size={16} />
                                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                                                        {h.image_urls.length}
                                                    </span>
                                                </button>
                                            )}
                                            {h.map_url && (
                                                <button onClick={() => setPreviewMapHotel(h)} className="p-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100">
                                                    <MapPin size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top text-center">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${h.is_active ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                                            {h.is_active ? <Check size={14} /> : <X size={14} />}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 align-top text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <IconBtn onClick={() => setEditingHotel(h)}><Pencil size={16} /></IconBtn>
                                            <IconBtn danger onClick={() => deleteHotel(h.id)}><Trash2 size={16} /></IconBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {paginatedHotels.length === 0 && !loading && (
                                <tr><td colSpan={7} className="text-center py-10 text-gray-400">Không tìm thấy dữ liệu nào.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                    <div className="px-4 py-4 border-t bg-gray-50 flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                            Hiển thị {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredHotels.length)} trong tổng số {filteredHotels.length}
                        </span>

                        <div className="flex items-center gap-1">
                            {/* Prev Button */}
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {/* Page Numbers */}
                            {getPageNumbers().map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof item === 'number' && setCurrentPage(item)}
                                    disabled={item === '...'}
                                    className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${item === currentPage
                                        ? "bg-black text-white shadow-md"
                                        : item === '...'
                                            ? "cursor-default text-gray-400"
                                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {item}
                                </button>
                            ))}

                            {/* Next Button */}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {editingHotel && (
                <HotelForm
                    hotel={editingHotel}
                    regions={regions}
                    onChange={setEditingHotel}
                    onClose={() => setEditingHotel(null)}
                    onSave={saveHotel}
                />
            )}

            {previewImagesHotel && (
                <PreviewImages
                    hotel={previewImagesHotel}
                    onClose={() => setPreviewImagesHotel(null)}
                />
            )}

            {previewMapHotel && (
                <PreviewMap
                    hotel={previewMapHotel}
                    onClose={() => setPreviewMapHotel(null)}
                />
            )}
        </div>
    );
}

/* ================= COMPONENTS: HELPERS ================= */

interface IconBtnProps {
    children: ReactNode;
    onClick: () => void;
    danger?: boolean;
}

function IconBtn({ children, onClick, danger }: IconBtnProps) {
    return (
        <button
            onClick={onClick}
            className={`p-2 rounded-lg transition-colors ${danger
                ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
        >
            {children}
        </button>
    );
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
    return <Search {...props} />;
}

/* ================= COMPONENTS: MODALS ================= */

interface ModalProps {
    children: ReactNode;
    onClose: () => void;
    maxWidth?: string;
}

function Modal({ children, onClose, maxWidth = "max-w-[600px]" }: ModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className={`bg-white rounded-3xl w-full ${maxWidth} max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl animate-scale-up`}>
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-200 transition"
                >
                    <X size={20} />
                </button>
                {children}
            </div>
        </div>
    );
}

/* ===== LARGE IMAGE VIEWER (LIGHTBOX) ===== */

interface PreviewProps {
    hotel: Hotel;
    onClose: () => void;
}

function PreviewImages({ hotel, onClose }: PreviewProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <Modal onClose={onClose} maxWidth="max-w-4xl">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold">{hotel.name} - Thư viện ảnh</h2>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
                {hotel.image_urls.length === 0 ? (
                    <p className="text-center text-gray-500 italic">Chưa có hình ảnh nào.</p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {hotel.image_urls
                            .filter((i) => i)
                            .map((image, i) => (
                                <div
                                    key={i}
                                    className="group relative cursor-zoom-in rounded-xl overflow-hidden aspect-video border shadow-sm"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={image}
                                        alt="Hotel preview"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-6 right-6 text-white/70 hover:text-white">
                        <X size={40} />
                    </button>
                    <img
                        src={selectedImage}
                        className="max-w-full max-h-full rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                        alt="Preview Full"
                    />
                </div>
            )}
        </Modal>
    );
}

function PreviewMap({ hotel, onClose }: PreviewProps) {
    const embedUrl = hotel.map_url?.includes("embed")
        ? hotel.map_url
        : hotel.map_url?.includes("/place/")
            ? hotel.map_url.replace("/place/", "/embed?pb=")
            : hotel.map_url;

    return (
        <Modal onClose={onClose} maxWidth="max-w-3xl">
            <div className="p-6 border-b">
                <h2 className="text-xl font-bold">Bản đồ: {hotel.name}</h2>
            </div>
            <div className="w-full h-[500px] bg-gray-100">
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        loading="lazy"
                        allowFullScreen
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        Link bản đồ không hợp lệ
                    </div>
                )}
            </div>
        </Modal>
    );
}

/* ===== EDIT FORM ===== */

interface HotelFormProps {
    hotel: Hotel;
    regions: Region[];
    onChange: (hotel: Hotel) => void;
    onClose: () => void;
    onSave: () => void;
}

function HotelForm({ hotel, regions, onChange, onClose, onSave }: HotelFormProps) {
    const updateField = (field: keyof Hotel, value: any) => {
        onChange({ ...hotel, [field]: value });
    };

    const toggleTag = (tagName: string) => {
        const currentTags = hotel.tags || [];
        if (currentTags.includes(tagName)) {
            updateField("tags", currentTags.filter((t) => t !== tagName));
        } else {
            updateField("tags", [...currentTags, tagName]);
        }
    };

    return (
        <Modal onClose={onClose} maxWidth="max-w-3xl">
            <div className="p-6 border-b bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">
                    {hotel.id ? "✏️ Chỉnh sửa khách sạn" : "✨ Thêm khách sạn mới"}
                </h2>
            </div>

            <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">

                {/* 1. INFO */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <Input
                            label="Tên khách sạn"
                            value={hotel.name}
                            onChange={(v) => updateField("name", v)}
                            placeholder="VD: Khách sạn Mường Thanh..."
                        />
                    </div>

                    <Select
                        label="Khu vực (Vùng)"
                        value={hotel.region_id}
                        options={regions}
                        onChange={(v) => updateField("region_id", Number(v))}
                    />

                    <div className="flex items-center gap-3 pt-6">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={hotel.is_active}
                                onChange={(e) => updateField("is_active", e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                            />
                            <span className="font-semibold text-sm">Đang hoạt động (Active)</span>
                        </label>
                    </div>
                </div>

                {/* 2. DETAILS */}
                <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-gray-500 text-sm uppercase">Chi tiết</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Giá mỗi đêm (VND)"
                            type="number"
                            value={hotel.price_per_night}
                            onChange={(v) => updateField("price_per_night", Number(v))}
                        />
                        <Input
                            label="Đánh giá (Sao)"
                            type="number"
                            step="0.1"
                            value={hotel.rating}
                            onChange={(v) => updateField("rating", v)}
                        />
                    </div>

                    <TextArea
                        label="Địa chỉ chi tiết"
                        value={hotel.address || ""}
                        onChange={(v) => updateField("address", v)}
                    />

                    <TextArea
                        label="Mô tả"
                        value={hotel.description || ""}
                        rows={3}
                        onChange={(v) => updateField("description", v)}
                    />
                </div>

                {/* 3. MEDIA & TAGS */}
                <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold text-gray-500 text-sm uppercase">Tiện ích & Hình ảnh</h3>

                    <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-3">Tiện nghi phổ biến</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {PREDEFINED_TAGS.map((tag) => {
                                const isSelected = hotel.tags?.includes(tag.name);
                                return (
                                    <button
                                        key={tag.name}
                                        onClick={() => toggleTag(tag.name)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm transition-all duration-200 ${isSelected
                                            ? "bg-black text-white border-black shadow-md scale-[1.02]"
                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                            }`}
                                    >
                                        <span className={isSelected ? "text-white" : "text-gray-500"}>
                                            {tag.icon}
                                        </span>
                                        <span>{tag.name}</span>
                                        {isSelected && <Check size={14} className="ml-auto" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-2">
                        <ArrayInput
                            label="Thêm tiện ích khác (nếu không có trong danh sách trên)"
                            items={hotel.tags.filter(t => !PREDEFINED_TAGS.find(p => p.name === t))}
                            placeholder="Nhập tag khác..."
                            onChange={(customTags) => {
                                const standardTags = hotel.tags.filter(t => PREDEFINED_TAGS.find(p => p.name === t));
                                updateField("tags", [...standardTags, ...customTags]);
                            }}
                        />
                    </div>

                    <Input
                        label="Link Google Map"
                        value={hotel.map_url || ""}
                        onChange={(v) => updateField("map_url", v)}
                    />

                    <ArrayInput
                        label="Danh sách Link Ảnh (URL)"
                        items={hotel.image_urls}
                        placeholder="https://example.com/image.jpg"
                        onChange={(newItems) => updateField("image_urls", newItems)}
                    />
                </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                <button onClick={onClose} className="px-5 py-2.5 border border-gray-300 bg-white rounded-xl hover:bg-gray-100 font-medium transition">
                    Hủy bỏ
                </button>
                <button
                    onClick={onSave}
                    className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 font-medium shadow-lg shadow-gray-200 transition"
                >
                    Lưu thay đổi
                </button>
            </div>
        </Modal>
    );
}

/* ===== INPUT COMPONENTS ===== */

interface InputProps {
    label: string;
    value: string | number | undefined;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    step?: string;
}

function Input({ label, value, onChange, type = "text", placeholder, step }: InputProps) {
    return (
        <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">{label}</label>
            <input
                type={type}
                value={value ?? ""}
                step={step}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
            />
        </div>
    );
}

interface TextAreaProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    rows?: number;
}

function TextArea({ label, value, onChange, rows = 2 }: TextAreaProps) {
    return (
        <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">{label}</label>
            <textarea
                value={value}
                rows={rows}
                onChange={(e) => onChange(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition resize-none"
            />
        </div>
    );
}

interface SelectProps {
    label: string;
    value: string | number | undefined;
    options: { id: number; name: string }[];
    onChange: (value: string) => void;
}

function Select({ label, value, options, onChange }: SelectProps) {
    return (
        <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition"
                >
                    {options.map((o) => (
                        <option key={o.id} value={o.id}>
                            {o.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500">▼</div>
            </div>
        </div>
    );
}

interface ArrayInputProps {
    label: string;
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
}

function ArrayInput({ label, items, onChange, placeholder }: ArrayInputProps) {
    const [tempValue, setTempValue] = useState("");

    const handleAdd = () => {
        if (!tempValue.trim()) return;
        onChange([...items, tempValue.trim()]);
        setTempValue("");
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        }
    }

    const handleRemove = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    }

    return (
        <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">{label}</label>
            <div className="flex gap-2 mb-2">
                <input
                    type="text"
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                />
                <button
                    onClick={handleAdd}
                    type="button"
                    className="bg-black text-white px-4 rounded-xl hover:bg-gray-800"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg text-sm group">
                        <span className="flex-1 break-all">{item}</span>
                        <button
                            onClick={() => handleRemove(idx)}
                            className="text-gray-400 hover:text-red-500"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}