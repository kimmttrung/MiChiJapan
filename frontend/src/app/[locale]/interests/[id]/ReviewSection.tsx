"use client";

import { useState, useEffect } from "react";

export default function ReviewSection() {
    const initialReviews = [
        {
            id: 1,
            name: "Nguyễn Minh Anh",
            rating: 5,
            comment: "Sự kiện cực kỳ hoành tráng và đáng nhớ!",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            date: "2 ngày trước",
            likes: 12,
        },
        {
            id: 2,
            name: "Trần Quốc Bảo",
            rating: 4,
            comment: "Tổ chức rất chuyên nghiệp.",
            avatar: "https://randomuser.me/api/portraits/men/32.jpg",
            date: "1 tuần trước",
            likes: 8,
        },
    ];

    const [reviews, setReviews] = useState(initialReviews);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [newComment, setNewComment] = useState("");

    const average =
        reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    const ratingCount = (star: number) =>
        reviews.filter((r) => r.rating === star).length;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) =>
                prev === reviews.length - 1 ? 0 : prev + 1
            );
        }, 4000);
        return () => clearInterval(interval);
    }, [reviews.length]);

    const handleLike = (id: number) => {
        setReviews((prev) =>
            prev.map((r) =>
                r.id === id ? { ...r, likes: r.likes + 1 } : r
            )
        );
    };

    const handleSubmit = () => {
        if (!newComment) return;

        const newReview = {
            id: Date.now(),
            name: "Bạn",
            rating: 5,
            comment: newComment,
            avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
            date: "Vừa xong",
            likes: 0,
        };

        setReviews([newReview, ...reviews]);
        setNewComment("");
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-black">Reviews</h2>

            {/* ⭐ Average */}
            <div className="flex items-center gap-6 mb-8 text-black">
                <div className="text-5xl font-bold ">{average.toFixed(1)}</div>
                <div>
                    <div className="text-yellow-400 text-xl text-black">
                        {"★".repeat(Math.round(average))}
                    </div>
                    <p className="text-gray-500 !text-black">{reviews.length} đánh giá</p>
                </div>
            </div>

            {/* 📊 Progress */}
            <div className="mb-12 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-3">
                        <span className="w-6">{star}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{
                                    width: `${(ratingCount(star) / reviews.length) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* 🔄 Slider */}
            <div className="relative h-64 mb-20 overflow-hidden">
                {reviews.map((review, index) => (
                    <div
                        key={review.id}
                        className={`absolute w-full transition-all duration-700 ${index === currentSlide
                            ? "opacity-100"
                            : "opacity-0"
                            }`}
                    >
                        <div className="backdrop-blur-xl bg-white/40 p-8 rounded-3xl shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <img src={review.avatar} className="w-14 h-14 rounded-full" />
                                <div>
                                    <p className="font-semibold text-black">{review.name}</p>
                                    <p className="text-gray-500 text-sm">{review.date}</p>
                                </div>
                            </div>

                            <div className="text-yellow-400 mb-3 text-black">
                                {"★".repeat(review.rating)}
                            </div>

                            <p className="text-black">{review.comment}</p>

                            <button
                                onClick={() => handleLike(review.id)}
                                className="mt-4 text-sm text-black"
                            >
                                👍 {review.likes} Likes
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 💬 Comment */}
            <div className="bg-gray-50 p-8 rounded-3xl shadow-md text-black">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    className="w-full p-4 rounded-xl border"
                />
                <button
                    onClick={handleSubmit}
                    className="mt-4 bg-black text-white px-6 py-3 rounded-full"
                >
                    Gửi đánh giá
                </button>
            </div>
        </div>
    );
}