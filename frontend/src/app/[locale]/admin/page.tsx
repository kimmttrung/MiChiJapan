"use client";
import React, { useEffect, useState } from 'react';
import { DollarSign, Users, Plane, Hotel, Utensils, Loader2 } from "lucide-react";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('michi_token');
            const res = await fetch('http://localhost:8000/api/v1/admin/stats/overview', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            setData(result);
            setLoading(false);
        };
        fetchStats();
    }, []);
    console.log("check doanh thu", data);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const statCards = [
        { label: "Doanh thu", value: `${data.summary.revenue.toLocaleString()}đ`, icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
        { label: "Khách hàng", value: data.summary.users, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Chuyến đi", value: data.summary.trips, icon: Plane, color: "text-purple-600", bg: "bg-purple-50" },
        { label: "Dịch vụ (Hotel/Res)", value: data.summary.hotels + data.summary.restaurants, icon: Hotel, color: "text-orange-600", bg: "bg-orange-50" },
    ];

    return (
        <div className="space-y-8 p-8 bg-gray-50 min-h-screen">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Hệ thống MichiJapan</h1>
                <p className="text-gray-500">Báo cáo tình hình kinh doanh thời gian thực</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
                        <div>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Line Chart: Tăng trưởng doanh thu */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Biến động doanh thu 30 ngày qua</h2>
                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-semibold">
                            Đơn vị: VNĐ
                        </span>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.revenue_growth}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    minTickGap={10} // Giúp các nhãn ngày không bị đè lên nhau
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any) => [new Intl.NumberFormat('vi-VN').format(value) + "đ", "Doanh thu"]}
                                />
                                {/* Area bên dưới đường kẻ giúp biểu đồ trông "đầy đặn" hơn */}
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    dot={false}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart: Phân bố vùng miền */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border">
                    <h2 className="text-lg font-bold mb-6">Tỉ lệ chuyến đi theo vùng</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.region_distribution}
                                    innerRadius={60} outerRadius={80}
                                    paddingAngle={5} dataKey="value"
                                >
                                    {data.region_distribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}