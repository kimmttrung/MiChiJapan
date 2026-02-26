// app/events/components/EventCard.tsx

import { useLocale } from "next-intl"
import Link from "next/link"

export default function EventCard({ event }: any) {
    const locale = useLocale()
    return (
        <Link href={`/${locale}/events/${event.id}`}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group cursor-pointer">

                <div className="relative">
                    <img
                        src={event.image}
                        className="w-full h-60 object-cover group-hover:scale-105 transition"
                    />
                </div>

                <div className="p-5">
                    <h3 className="text-xl font-semibold group-hover:text-red-600">
                        {event.title}
                    </h3>
                    <p className="text-sm text-gray-500">{event.date}</p>
                    <p className="text-gray-600 text-sm line-clamp-2 mt-2">
                        {event.description}
                    </p>
                </div>

            </div>
        </Link>
    )
}