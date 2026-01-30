"use client";
import { useState } from "react";
import axios from "axios";

type Activity = {
    time: string
    place: string
}

type DaySchedule = {
    day: number
    activities: Activity[]
}

type TripResult = {
    trip_name: string
    total_estimated_cost: number
    schedule: DaySchedule[]
}

export default function AIPlanner() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TripResult | null>(null)

    const handlePlan = async () => {
        setLoading(true);
        try {
            // Gọi API Backend
            const res = await axios.post("http://localhost:8000/plan-trip", {
                region: "Da Nang", // Hardcode test trước
                days: 3,
                budget: "luxury"
            });
            setResult(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl mt-[-50px] relative z-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Michi AI Planner</h2>

            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Bạn muốn đi đâu? (VD: Đà Nẵng)"
                    className="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handlePlan}
                    className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                    {loading ? "Đang suy nghĩ..." : "Lên Lịch Trình"}
                </button>
            </div>

            {/* Hiển thị Kết quả */}
            {result && (
                <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-xl font-bold text-blue-800">{result.trip_name}</h3>
                    <p className="text-gray-600">Chi phí dự kiến: {result.total_estimated_cost.toLocaleString()} VNĐ</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {result.schedule.map((day: DaySchedule) => (
                            <div key={day.day} className="border p-4 rounded-lg bg-gray-50">
                                <h4 className="font-bold mb-2">Ngày {day.day}</h4>
                                <ul className="text-sm space-y-2">
                                    {day.activities.map((act: Activity, idx: number) => (
                                        <li key={idx}>⏰ {act.time}: {act.place}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}