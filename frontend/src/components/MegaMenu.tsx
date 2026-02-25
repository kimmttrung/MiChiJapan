"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type MenuItem = {
    title: string;
    href: string;
    description?: string;
    image?: string;
};

type MegaMenuProps = {
    label: string;
    featured: MenuItem[];
    list: MenuItem[];
};

export default function MegaMenu({ label, featured, list }: MegaMenuProps) {
    return (
        <div className="group h-full flex items-center">
            {/* TRIGGER LINK */}
            <button className="relative h-full px-1 text-sm font-bold text-gray-600 group-hover:text-red-600 transition-colors flex items-center gap-1">
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 transition-all group-hover:w-full"></span>
            </button>

            {/* DROPDOWN CONTAINER */}
            <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 z-50">
                <div className="max-w-7xl mx-auto flex">

                    {/* LEFT COLUMN: FEATURED IMAGES */}
                    <div className="w-3/4 p-8 bg-gray-50 grid grid-cols-4 gap-6">
                        <div className="col-span-4 mb-2 flex justify-between items-end border-b border-gray-200 pb-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Điểm đến nổi bật</h3>
                            <Link href="#" className="text-xs font-bold text-red-600 hover:underline">Xem bản đồ &rarr;</Link>
                        </div>
                        {featured.map((item, idx) => (
                            <Link key={idx} href={item.href} className="group/card block">
                                <div className="aspect-[4/3] rounded-lg overflow-hidden mb-3 shadow-sm group-hover/card:shadow-md transition-all">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <h4 className="font-bold text-gray-800 group-hover/card:text-red-600 transition-colors">{item.title}</h4>
                                <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT COLUMN: LIST LINKS */}
                    <div className="w-1/4 p-8 bg-white">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Khám phá thêm</h3>
                        <ul className="space-y-3">
                            {list.map((item, idx) => (
                                <li key={idx}>
                                    <Link href={item.href} className="text-sm font-medium text-gray-600 hover:text-red-600 flex items-center justify-between group/link">
                                        {item.title}
                                        <ChevronRight size={14} className="opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-red-600" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}