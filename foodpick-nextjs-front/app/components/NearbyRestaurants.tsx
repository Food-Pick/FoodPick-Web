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
  dist: number;
}

interface NearbyRestaurantsProps {
  latitude: number;
  longitude: number;
}

export default function NearbyRestaurants({ latitude, longitude }: NearbyRestaurantsProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchNearbyRestaurants = async () => {
      try {
        const response = await fetch(
          `/api/nearby/restaurant?lat=${latitude}&lng=${longitude}`
        );
        const data = await response.json();
        if (isMounted) {
          setRestaurants(data.raw);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('주변 음식점 정보를 가져오는데 실패했습니다:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (latitude && longitude) {
      fetchNearbyRestaurants();
    }

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  return (
    <section className={styles.recommendSection}>
      <h2 className={styles.sectionTitle}>주변 맛집</h2>
      <div className={styles.scrollWrapper}>
        <div className={styles.cardList}>
          {isLoading ? (
            // 스켈레톤 UI
            Array.from({ length: 5 }).map((_, index) => (
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
          ) : (
            restaurants.map((restaurant) => (
              <Link 
                href={`/restaurant_detail`} 
                key={restaurant.restaurant_id} 
                className={styles.foodCard}
              >
                <img 
                  src={restaurant.restaurant_menu ? 
                    JSON.parse(restaurant.restaurant_menu)[0]?.images?.[0] || "/images/background.png" 
                    : "/images/background.png"} 
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
          )}
        </div>
      </div>
    </section>
  );
} 