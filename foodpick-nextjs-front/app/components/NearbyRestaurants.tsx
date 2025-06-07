import { useEffect, useState } from 'react';
import { FiMapPin } from 'react-icons/fi';
import styles from '../../styles/home.module.css';
import Link from 'next/link';

interface Restaurant {
  restaurant_id: number;
  restaurant_사업장명: string;
  restaurant_업태구분명: string;
  restaurant_도로명전체주소: string;
  restaurant_네이버_상호명: string;
  restaurant_네이버_주소: string;
  restaurant_네이버_전화번호: string;
  restaurant_네이버_url: string;
  restaurant_menu: string | null;
  restaurant_photo: string | null;
  dist: number;
}

interface NearbyRestaurantsProps {
  latitude: number;
  longitude: number;
  isLocationConfirmed: boolean;
}

export default function NearbyRestaurants({ latitude, longitude, isLocationConfirmed }: NearbyRestaurantsProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!isLocationConfirmed) {
      console.log('주변 음식점 호출 아직 위치 확정 안됨')
      return;
    }
    console.log('주변 음식점 호출 위치 확정 됨')
    const fetchNearbyRestaurants = async () => {
      if (!latitude || !longitude) {
        if (isMounted) {
          setError('위치 정보가 없습니다.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `/api/nearby/restaurant?lat=${latitude}&lng=${longitude}`
        );
        
        if (!response.ok) {
          throw new Error(`API 응답 에러: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (isMounted) {
          setRestaurants(data.raw || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('주변 음식점 정보를 가져오는데 실패했습니다:', error);
        if (isMounted) {
          setError('주변 음식점 정보를 가져오는데 실패했습니다.');
          setIsLoading(false);
        }
      }
    };

    setIsLoading(true);
    setError(null);
    fetchNearbyRestaurants();

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, isLocationConfirmed]);

  function getFirstImage(restaurant: Restaurant) {
    // 1. restaurant_photo가 있으면 가장 먼저 시도
    if (restaurant.restaurant_photo) {
      try {
        const photoArr = JSON.parse(restaurant.restaurant_photo);
        if (Array.isArray(photoArr) && photoArr[0]) {
      return photoArr[0];
    }
  } catch (e) {
    console.error('getFirstImage 파싱 오류', e);
  }
}

  // 2. restaurant_menu의 images[0] 시도
  if (restaurant.restaurant_menu) {
    try {
      const menuArr = JSON.parse(restaurant.restaurant_menu);
      if (Array.isArray(menuArr) && menuArr[0]?.images?.[0]) {
        return menuArr[0].images[0];
      }
    } catch (e) {
      console.error('getFirstMenuImage 파싱 오류', e);
    }
  }

  // 3. 기본 이미지
  return "/images/background.png";
  }

  return (
    <section className={styles.recommendSection}>
      <h2 className={styles.sectionTitle}>주변 음식점</h2>
      <div className={styles.scrollWrapper}>
        <div className={styles.cardList}>
          {isLoading ? (
            // 스켈레톤 UI
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className={`${styles.foodCard} ${styles.skeleton}`}>
                <div className={styles.skeletonImage} />
                <div className={styles.cardContent}>
                  <div className={styles.skeletonTitle} />
                  <div className={styles.cardMeta}>
                    <div className={styles.skeletonText} />
                    <div className={styles.skeletonText} />
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : restaurants && restaurants.length > 0 ? (
            restaurants.map((restaurant) => (
              <Link 
                href={`/restaurant/detail/${restaurant.restaurant_id}`} 
                key={restaurant.restaurant_id} 
                className={styles.foodCard}
              >
                <img
                  src={getFirstImage(restaurant)}
                  alt={restaurant.restaurant_네이버_상호명 || restaurant.restaurant_사업장명}
                />
                <div className={styles.cardContent}>
                  <p className={styles.cardTitle}>
                    {restaurant.restaurant_네이버_상호명 || restaurant.restaurant_사업장명}
                  </p>
                  <div className={styles.cardMeta}>
                    <span>{restaurant.restaurant_업태구분명}</span>
                    <span style={{ marginLeft: '0.25rem', marginRight: '0.25rem' }}>
                      <FiMapPin size={14} />
                    </span>
                    <span>{Math.round(restaurant.dist)}m</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={styles.emptyMessage}>주변에 음식점이 없습니다.</div>
          )}
        </div>
      </div>
    </section>
  );
} 