// app/events/[id]/page.tsx

import Navbar from "@/src/components/Navbar"
import ReviewSection from "../../interests/[id]/ReviewSection"
import RelatedEvents from "./RelatedEvents"

interface Props {
    params: Promise<{
        locale: string
        id: string
    }>
}
export default async function EventDetail({ params }: Props) {
    const EVENTS = [
        {
            id: 1,
            title: "Lễ hội Pháo hoa Quốc tế Đà Nẵng 2026",
            category: "Festival",
            city: "Đà Nẵng",
            date: "2026-07-05",
            image: "https://images.unsplash.com/photo-1506157786151-b8491531f063",
            description: "Sự kiện pháo hoa lớn nhất Việt Nam với nhiều đội quốc tế tham gia.",

        },
        {
            id: 2,
            title: "Lễ hội Áo dài TP.HCM",
            category: "Culture",
            city: "TP.HCM",
            date: "2026-03-10",
            image: "https://images.unsplash.com/photo-1551024601-bec78aea704b",
            description: "Tôn vinh vẻ đẹp áo dài truyền thống Việt Nam."
        },
        {
            id: 3,
            title: "Festival Huế 2026",
            category: "Festival",
            city: "Huế",
            date: "2026-04-12",
            image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da",
            description: "Chuỗi hoạt động văn hóa nghệ thuật đặc sắc tại cố đô Huế."
        },
        {
            id: 4,
            title: "TechFest Vietnam 2026",
            category: "Technology",
            city: "Hà Nội",
            date: "2026-02-28",
            image: "https://images.unsplash.com/photo-1556761175-4b46a572b786",
            description: "Ngày hội khởi nghiệp đổi mới sáng tạo lớn nhất Việt Nam."
        },
        {
            id: 5,
            title: "Lễ hội Cà phê Buôn Ma Thuột",
            category: "Culture",
            city: "Đắk Lắk",
            date: "2026-03-18",
            image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
            description: "Tôn vinh cà phê Việt Nam và quảng bá thương hiệu toàn cầu."
        },
        {
            id: 6,
            title: "Giải Marathon Quốc tế Hà Nội",
            category: "Sports",
            city: "Hà Nội",
            date: "2026-03-22",
            image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8",
            description: "Giải chạy marathon thu hút hàng nghìn vận động viên."
        },
        {
            id: 7,
            title: "Countdown Hồ Gươm 2026",
            category: "Festival",
            city: "Hà Nội",
            date: "2026-12-31",
            image: "https://images.unsplash.com/photo-1482517967863-00e15c9b44be",
            description: "Sự kiện đếm ngược chào năm mới tại Hồ Gươm."
        },
        {
            id: 8,
            title: "Lễ hội Bánh dân gian Nam Bộ",
            category: "Culture",
            city: "Cần Thơ",
            date: "2026-04-05",
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
            description: "Trưng bày và giới thiệu các loại bánh truyền thống Nam Bộ."
        }
    ]
    const { id } = await params
    const event = EVENTS.find(e => e.id === Number(id))

    if (!event) return <div>Không tìm thấy sự kiện</div>

    return (
        <div className="bg-neutral-50 min-h-screen text-black">

            <Navbar />

            {/* HERO */}
            <section className="relative h-[450px]">
                <img src={event.image}
                    className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 flex items-center justify-center h-full text-white text-center">
                    <div>
                        <h1 className="text-4xl font-bold">{event.title}</h1>
                        <p className="mt-2">{event.city} • {event.date}</p>
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto py-16 px-4">

                {/* Info */}
                <div className="bg-white p-8 rounded-2xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-4">Thông tin sự kiện</h2>
                    <p className="text-gray-700 leading-relaxed">
                        {event.description}
                    </p>

                    <div className="mt-6 space-y-2 text-gray-600">
                        <div>📍 Địa điểm: {event.city}</div>
                        <div>📅 Ngày: {event.date}</div>
                        <div>🏷 Loại: {event.category}</div>
                    </div>
                </div>

                {/* Calendar mini */}
                <div className="mt-12 bg-white p-8 rounded-2xl shadow-sm">
                    <h2 className="text-2xl font-bold mb-4">Lịch sự kiện</h2>
                    <div className="border rounded-xl p-6 text-center">
                        📆 {event.date}
                    </div>
                </div>

                <ReviewSection />

                <RelatedEvents events={EVENTS.filter(e => e.id !== event.id)} />

            </section>
        </div>
    )
}