"use client";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

export default function TripMap({ items }: { items: any[] }) {
    // 1. Hàm tạo tọa độ ngẫu nhiên quanh một tâm (nếu AI bịa hoặc thiếu dữ liệu)
    // Giả sử tọa độ mặc định là Đà Nẵng nếu không có gì cả
    const defaultLat = 16.047079;
    const defaultLng = 108.206230;

    const processedItems = items.map((item, idx) => {
        if (item.lat && item.lng) return item;

        // Nếu thiếu tọa độ, ta tạo tọa độ giả quanh vị trí mặc định 
        // hoặc tọa độ của item đầu tiên có dữ liệu để các điểm gần nhau
        return {
            ...item,
            lat: defaultLat + (Math.random() - 0.5) * 0.02,
            lng: defaultLng + (Math.random() - 0.5) * 0.02
        };
    });

    // 2. Lọc lại các điểm chắc chắn có tọa độ (bây giờ tất cả đã có)
    const validItems = processedItems;

    if (validItems.length === 0) return null;

    const center: [number, number] = [validItems[0].lat, validItems[0].lng];
    const positions: [number, number][] = validItems.map(item => [item.lat, item.lng]);

    return (
        <div className="h-[350px] w-full rounded-[24px] overflow-hidden border shadow-inner relative z-0">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                <Polyline positions={positions} color="#8B5CF6" weight={3} opacity={0.6} dashArray="10, 10" />

                {validItems.map((item, idx) => (
                    <Marker key={idx} position={[item.lat, item.lng]} icon={customIcon}>
                        <Popup>
                            <div className="font-sans text-black">
                                <p className="font-bold text-purple-600">{item.time}</p>
                                <p className="text-sm font-black">{item.activity}</p>
                                <p className="text-[10px] text-gray-500">{item.location}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}