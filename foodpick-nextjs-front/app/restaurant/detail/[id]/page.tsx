import { notFound } from 'next/navigation';
import RestaurantDetail from './RestaurantDetail';
import { Review } from '../../../components/ReviewSection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api:3000';

async function getRestaurantDetail(id: string) {
  try {
    console.log('api url', API_URL);
    const response = await fetch(`${API_URL}/restaurant/search?id=${id}`);
    if (!response.ok) throw new Error('Failed to fetch restaurant detail');
    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error('Error fetching restaurant detail:', error);
    return null;
  }
}

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NearbyRestaurantDetailPage({ params, searchParams }: Props) {
  const [{ id }, search] = await Promise.all([params, searchParams]);
  const restaurant = await getRestaurantDetail(id);
  if (!restaurant) return notFound();

  // 메뉴 파싱
  let menu: any[] = [];
  try {
    menu = restaurant.menu ? JSON.parse(restaurant.menu) : [];
  } catch {
    menu = [];
  }

  let photo: any[] = [];
  try {
    photo = restaurant.photo ? JSON.parse(restaurant.photo) : [];
  } catch {
    photo = [];
  }

  // 대표 이미지
  const mainImage = photo?.[0] || '/images/background.png';

  // 모든 사진 모으기
  const allPhotos = photo;

  // 가상 리뷰 데이터 생성
  const dummyReviews: Review[] = [
    {
      id: '1',
      author: '홍길동',
      content: '음식이 정말 맛있었어요! 다음에 또 방문할 예정입니다.',
      rating: 5,
      images: allPhotos.length > 0 ? [allPhotos[0]] : [],
      createdAt: '2023-04-15T09:30:00Z',
    },
    {
      id: '2',
      author: '김철수',
      content: '맛은 좋았지만 서비스가 조금 아쉬웠어요.',
      rating: 4,
      images: [],
      createdAt: '2023-04-10T15:45:00Z',
    },
    {
      id: '3',
      author: '이영희',
      content: '분위기도 좋고 음식도 맛있어요.',
      rating: 4,
      images: allPhotos.length > 1 ? [allPhotos[1]] : [],
      createdAt: '2023-04-05T12:20:00Z',
    },
  ];

  // 네이버 place info 파싱
  let placeInfo: any = {};
  try {
    placeInfo = restaurant.네이버_place_info ? JSON.parse(restaurant.네이버_place_info) : {};
  } catch {
    placeInfo = {};
  }

  return (
    <RestaurantDetail
      restaurant={restaurant}
      menu={menu}
      mainImage={mainImage}
      allPhotos={allPhotos}
      dummyReviews={dummyReviews}
      placeInfo={placeInfo}
    />
  );
} 