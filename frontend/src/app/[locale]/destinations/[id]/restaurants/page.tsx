"use client";

import RestaurantCard from "@/src/components/Destinations/RestaurantCard";
import RestaurantFilter from "@/src/components/Destinations/RestaurantFilter";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function RestaurantsPage() {
    const { id } = useParams();
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);

    useEffect(() => {
        fetch(`http://localhost:8000/api/destinations/${id}`)
            .then(res => res.json())
            .then(data => {
                setRestaurants(data.restaurants);
                setFiltered(data.restaurants);
            });
    }, [id]);

    console.log("check restaurant", restaurants);

    return (
        <div className="text-black">
            <h1 className="text-3xl font-bold mb-6 text-black">Nhà hàng</h1>

            <RestaurantFilter
                restaurants={restaurants}
                onFilter={setFiltered}
            />

            <div className="grid md:grid-cols-3 gap-8 mt-6">
                {filtered.map(rs => (
                    <RestaurantCard key={rs.id} data={rs} />
                ))}
            </div>
        </div>
    );
}