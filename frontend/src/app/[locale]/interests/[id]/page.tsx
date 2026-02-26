import { notFound } from "next/navigation";
import Image from "next/image";
import Navbar from "@/src/components/Navbar";
import ReviewSection from "./ReviewSection";

const EVENTS = [
    {
        id: 1,
        title: "Lễ hội pháo hoa Đà Nẵng 2026",
        location: "Đà Nẵng",
        category: "Festival",
        image:
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1472653816316-3ad6f10a6592?q=80&w=1200",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200",
        ],
        description: "Sự kiện pháo hoa quốc tế lớn nhất Việt Nam.",
    },
    {
        id: 2,
        title: "Festival Huế 2026",
        location: "Huế",
        category: "Festival",
        image: "https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200",
            "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1200",
        ],
        description: "Lễ hội văn hóa nghệ thuật đặc sắc tại cố đô Huế.",
    },
    {
        id: 3,
        title: "Hội chợ ẩm thực Hà Nội",
        location: "Hà Nội",
        category: "Food",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200",
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1200",
        ],
        description: "Tinh hoa ẩm thực miền Bắc quy tụ hàng trăm gian hàng.",
    },
    {
        id: 4,
        title: "Monsoon Music Festival",
        location: "Hà Nội",
        category: "Music",
        image: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1200",
            "https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=1200",
        ],
        description: "Lễ hội âm nhạc quốc tế với dàn nghệ sĩ hàng đầu.",
    },
    {
        id: 5,
        title: "Lễ hội đèn lồng Hội An",
        location: "Hội An",
        category: "Cultural",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?q=80&w=1200",
            "https://images.unsplash.com/photo-1480796927426-f609979314bd?q=80&w=1200",
        ],
        description: "Không gian phố cổ lung linh ánh đèn mỗi đêm rằm.",
    },
    {
        id: 6,
        title: "Vietnam Tech Expo 2026",
        location: "TP.HCM",
        category: "Technology",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1492724441997-5dc865305da7?q=80&w=1200",
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200",
        ],
        description: "Triển lãm công nghệ và startup lớn nhất năm.",
    },
    {
        id: 7,
        title: "Da Nang International Marathon",
        location: "Đà Nẵng",
        category: "Sport",
        image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1200",
            "https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1200",
        ],
        description: "Giải chạy quốc tế ven biển thu hút hàng nghìn vận động viên.",
    },
    {
        id: 8,
        title: "Nha Trang Beach Festival",
        location: "Nha Trang",
        category: "Festival",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600",
        gallery: [
            "https://images.unsplash.com/photo-1493558103817-58b2924bce98?q=80&w=1200",
            "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200",
        ],
        description: "Lễ hội biển sôi động với âm nhạc và thể thao nước.",
    },
];

export default async function EventDetail({
    params,
}: {
    params: Promise<{ locale: string; id: string }>;
}) {
    // 🔥 QUAN TRỌNG
    const { id } = await params;

    const event = EVENTS.find((e) => e.id === Number(id));
    if (!event) return notFound();

    return <div className="bg-white min-h-screen">
        <Navbar />

        {/* HERO */}
        <div className="relative w-full h-[500px] text-black">
            <Image src={event.image} alt={event.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h1 className="text-4xl md:text-6xl text-white font-bold">
                    {event.title}
                </h1>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-20">

            {/* INFO */}
            <div className="bg-white rounded-3xl shadow-xl p-10 -mt-24 relative z-10 mb-20">
                <div className="flex justify-between mb-6">
                    <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-semibold text-black">
                        {event.category}
                    </span>
                    <span className="text-gray-500">📍 {event.location}</span>
                </div>

                <p className="text-lg text-gray-700 mb-8">
                    {event.description}
                </p>
            </div>

            {/* GALLERY */}
            <div className="grid md:grid-cols-2 gap-8 mb-24">
                {event.gallery.map((img, index) => (
                    <div key={index} className="relative h-[350px] rounded-2xl overflow-hidden shadow-lg">
                        <Image
                            src={img}
                            alt="Gallery"
                            fill
                            className="object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* CLIENT REVIEWS */}
            <ReviewSection />

        </div>
    </div>
}