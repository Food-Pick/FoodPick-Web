import { AiFillStar } from 'react-icons/ai';
import { FiMapPin, FiPhone, FiClock, FiCheckCircle } from 'react-icons/fi';
import styles from '../../../../styles/restaurant_Detail.module.css';
import Header from '../../../components/Header';
import { notFound } from 'next/navigation';
import MenuSection from '@/app/components/MenuSection';
import MergedPhotoGallery from '@/app/components/MergedPhotoGallery';

type Props = {
  params: {
    id: string;
  };
};

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

export default async function NearbyRestaurantDetailPage({ params }: Props) {
  const restaurant = await getRestaurantDetail(params.id);
  if (!restaurant) return notFound();

  // 메뉴 파싱
  let menu: any[] = [];
  try {
    menu = restaurant.menu ? JSON.parse(restaurant.menu) : [];
  } catch {
    menu = [];
  }

  // 대표 이미지
  const mainImage =
    menu[0]?.images?.[0] ||
    '/images/background.png';

  // 모든 사진 모으기
  const allPhotos = menu.flatMap((m) => m.images || []);

  // 네이버 place info 파싱
  let placeInfo: any = {};
  try {
    placeInfo = restaurant.네이버_place_info ? JSON.parse(restaurant.네이버_place_info) : {};
  } catch {
    placeInfo = {};
  }

  return (
    <div>
      <Header />

      <div className={styles.container} style={{ marginTop: '-1rem' }}>
        <section className={styles.hero}>
          <div className={styles.heroImageWrapper}>
            <img
              className={styles.heroImage}
              src={mainImage}
              alt={restaurant.네이버_상호명 || restaurant.사업장명}
            />
          </div>

          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              {restaurant.네이버_상호명 || restaurant.사업장명}
            </h1>
            <p className={styles.tags}>{restaurant.업태구분명}</p>

            <div className={styles.infoRow}>
              <FiMapPin />
              <div className={styles.infoTextGroup}>
                <p>{restaurant.네이버_주소 || restaurant.도로명전체주소}</p>
                {placeInfo.영업시간 && (
                  <p className={styles.subtext}>
                    영업시간: {placeInfo.영업시간}
                  </p>
                )}
              </div>
              {restaurant.네이버_url && (
                <a
                  href={restaurant.네이버_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mapButton}
                >
                  네이버로 보기
                </a>
              )}
            </div>

            {restaurant.네이버_전화번호 && (
              <div className={styles.infoRow}>
                <FiPhone />
                <p>{restaurant.네이버_전화번호}</p>
              </div>
            )}

            {placeInfo.편의 && (
              <div className={styles.infoRow}>
                <FiCheckCircle />
                <p>{placeInfo.편의}</p>
              </div>
            )}
          </div>
        </section>

        {menu.length > 0 && (
          <MenuSection
            items={menu.map((m) => ({
              name: m.name,
              price: m.price,
              image: m.images?.[0] || null,
              description: m.description,
            }))}
          />
        )}

        {allPhotos.length > 0 && (
          <MergedPhotoGallery photos={allPhotos} />
        )}
      </div>
    </div>
  );
} 