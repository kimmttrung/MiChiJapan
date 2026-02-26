"use client"

import EventCard from "@/src/components/EventCard"
import FilterBar from "@/src/components/FilterBar"
import Navbar from "@/src/components/Navbar"
import Pagination from "@/src/components/Pagination"
import { useState } from "react"


export default function EventsPage() {

    const [search, setSearch] = useState("")
    const [city, setCity] = useState("")
    const [category, setCategory] = useState("")
    const [timeFilter, setTimeFilter] = useState("")
    const [page, setPage] = useState(1)

    // data/events.ts

    const EVENTS = [
        {
            id: 1,
            title: "Lễ hội Pháo hoa Quốc tế Đà Nẵng 2026",
            category: "Festival",
            city: "Đà Nẵng",
            date: "2026-07-05",
            image: "https://images.unsplash.com/photo-1506157786151-b8491531f063",
            description: "Sự kiện pháo hoa lớn nhất Việt Nam với nhiều đội quốc tế tham gia."
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

    const now = new Date()

    const filtered = EVENTS.filter(event => {
        const eventDate = new Date(event.date)

        let timeMatch = true

        if (timeFilter === "thisWeek") {
            const endWeek = new Date()
            endWeek.setDate(now.getDate() + 7)
            timeMatch = eventDate >= now && eventDate <= endWeek
        }

        if (timeFilter === "nextWeek") {
            const start = new Date()
            start.setDate(now.getDate() + 7)
            const end = new Date()
            end.setDate(now.getDate() + 14)
            timeMatch = eventDate >= start && eventDate <= end
        }

        if (timeFilter === "thisMonth") {
            timeMatch =
                eventDate.getMonth() === now.getMonth() &&
                eventDate.getFullYear() === now.getFullYear()
        }

        if (timeFilter === "nextMonth") {
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1)
            timeMatch =
                eventDate.getMonth() === nextMonth.getMonth() &&
                eventDate.getFullYear() === nextMonth.getFullYear()
        }

        return (
            event.title.toLowerCase().includes(search.toLowerCase()) &&
            (city ? event.city === city : true) &&
            (category ? event.category === category : true) &&
            timeMatch
        )
    })

    const itemsPerPage = 6
    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage)

    return (
        <div className="bg-neutral-50 min-h-screen text-black">

            <Navbar />

            {/* HERO */}
            <section className="relative h-[380px]">
                <img
                    src="https://images.unsplash.com/photo-1506157786151-b8491531f063"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 flex items-center justify-center h-full text-white">
                    <h1 className="text-4xl font-bold">Khám phá sự kiện tại Việt Nam</h1>
                </div>
            </section>

            <section className="max-w-7xl mx-auto py-16 px-4">

                <FilterBar
                    search={search} setSearch={setSearch}
                    city={city} setCity={setCity}
                    category={category} setCategory={setCategory}
                    timeFilter={timeFilter} setTimeFilter={setTimeFilter}
                />

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {paginated.map(event => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>

                <Pagination page={page} totalPages={totalPages} setPage={setPage} />

            </section>
        </div>
    )
}