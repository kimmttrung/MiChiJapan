// src/types/db.ts
export interface Region {
    id: number;
    name: string;
    description: string;
    cover_image: string;
}

export interface Hotel {
    id: number;
    name: string;
    description: string;
    address: string;
    price_per_night: number;
    rating: number;
    image_urls: string[];
    tags: string[];
}

export interface Restaurant {
    id: number;
    name: string;
    rating: number;
    image_urls: string[];
    tags: string[];
    // Có thể thêm cuisine nếu cần
}