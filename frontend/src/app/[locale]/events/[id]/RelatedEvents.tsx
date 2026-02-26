import { useLocale } from "next-intl"
import Link from "next/link"

export default function RelatedEvents({ events }: any) {
    const locale = useLocale();
    return (
        <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Sự kiện liên quan</h2>

            <div className="grid md:grid-cols-3 gap-6">
                {events.slice(0, 3).map((e: any) => (
                    <Link key={e.id} href={`/${locale}/events/${e.id}`}>
                        <div className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                            <img src={e.image} className="h-40 w-full object-cover" />
                            <div className="p-3">
                                <div className="font-semibold">{e.title}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}