"use client"

export default function FilterBar({
    search, setSearch,
    city, setCity,
    category, setCategory,
    timeFilter, setTimeFilter
}: any) {

    return (
        <div className="flex flex-wrap gap-4 mb-10 text-black">

            <input
                placeholder="Tìm sự kiện..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-full px-4 py-2 w-64 shadow-sm"
            />

            <select value={city} onChange={(e) => setCity(e.target.value)}
                className="border rounded-full px-4 py-2 text-black">
                <option value="">Tất cả thành phố</option>
                <option>Hà Nội</option>
                <option>TP.HCM</option>
                <option>Đà Nẵng</option>
                <option>Huế</option>
            </select>

            <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="border rounded-full px-4 py-2">
                <option value="">Tất cả loại</option>
                <option>Festival</option>
                <option>Culture</option>
                <option>Sports</option>
                <option>Technology</option>
            </select>

            <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}
                className="border rounded-full px-4 py-2">
                <option value="">Tất cả thời gian</option>
                <option value="thisWeek">Tuần này</option>
                <option value="nextWeek">Tuần sau</option>
                <option value="thisMonth">Tháng này</option>
                <option value="nextMonth">Tháng sau</option>
            </select>

        </div>
    )
}