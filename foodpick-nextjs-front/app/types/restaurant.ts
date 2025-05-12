
export interface MenuItem {
  name: string;
  price: number;
  image: string | null;
}

export interface Review {
  id: string;
  author: string;
  content: string;
  images: string[];
  createdAt: string;
  rating: number;
}

// 음식점 데이터 타입 정의
export interface Restaurant {
  id: string;
  name: string;
  restaurant_address: string;
  tags: string[];
  phone: string;
  rating: number;
  reviewCount: number;
  distance: number;
  hours: string;
  services: string[];
  image: string;
  menu: MenuItem[];
  photos: string[];
  reviews: Review[];
}
