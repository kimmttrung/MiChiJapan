// ... imports
export default function HotelsManagement() {
    // Mock data based on provided SQL
    const hotels = [
        { id: 1, name: "Tokyo Grand Hotel", address: "Shinjuku, Tokyo", price: 3500000, rating: 4.8, active: true },
        { id: 2, name: "Kyoto Ryokan", address: "Gion, Kyoto", price: 5200000, rating: 4.9, active: true },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý Khách sạn & Resort</h1>
                <button className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium">Thêm mới</button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4">Tên địa điểm</th>
                            <th className="px-6 py-4">Địa chỉ</th>
                            <th className="px-6 py-4">Giá/Đêm (VND)</th>
                            <th className="px-6 py-4">Rating</th>
                            <th className="px-6 py-4">Trạng thái</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {hotels.map(hotel => (
                            <tr key={hotel.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold">{hotel.name}</td>
                                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{hotel.address}</td>
                                <td className="px-6 py-4 font-mono">{hotel.price.toLocaleString()}</td>
                                <td className="px-6 py-4">⭐ {hotel.rating}</td>
                                <td className="px-6 py-4">
                                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded-md text-xs font-bold">Active</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-blue-600 hover:underline">Sửa</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}