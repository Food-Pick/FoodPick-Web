'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/home.module.css';
import { FiRefreshCw } from 'react-icons/fi'; 

interface Restaurant {
  restaurant_id: number;
  restaurant_사업장명: string;
  restaurant_네이버_상호명: string;
  restaurant_도로명전체주소: string;
  restaurant_네이버_url: string;
  restaurant_menu: string | null;
  restaraunt_photo: string | null;
  dist: number;
}

interface RandomPickProps {
  latitude: number;
  longitude: number;
}

export default function RandomPick({ latitude, longitude }: RandomPickProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // useEffect(() => {
  //   const fetchNearbyRestaurants = async() => {
  //     try {
  //       const response = await fetch(`/api/nearby/restaurant?lat=${latitude}&lng=${longitude}`);
  //       if (!response.ok) throw new Error('데이터를 불러오지 못했습니다.');
  //       const data = await response.json();
  //       setRestaurants(data.raw || []);
  //       setIsLoading(false);
  //     } catch (err) {
  //       setError('주변 음식점 정보를 가져오지 못했습니다.');
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchNearbyRestaurants();
  // }, [latitude, longitude]);

  useEffect(() => {
  let isMounted = true;

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
}, [latitude, longitude]);

  const handlePick = () => {
    if (restaurants.length === 0) return;
    setIsAnimating(false);

    let newIndex = Math.floor(Math.random() * restaurants.length);

    if (restaurants.length > 1 && selected) {
      while (restaurants[newIndex].restaurant_id === selected.restaurant_id) {
        newIndex = Math.floor(Math.random() * restaurants.length);
      }
    }

    setSelected(restaurants[newIndex]);
    setIsOpen(true);
    setTimeout(() => setIsAnimating(true), 50);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsAnimating(false);
  };

  const handleNavigate = () => {
    if (selected) {
      router.push(`/restaurant/detail/${selected.restaurant_id}`);
    }
  };

  const getFirstImage = (menuStr: string | null): string => {
    try {
      const parsed = JSON.parse(menuStr || '[]');
      return parsed[0]?.images?.[0] || '/images/background.png';
    } catch {
      return '/images/background.png';
    }
  };
  
  return (
    <section className={styles.recommendSection}>
      <h2 className={styles.sectionTitle}>❓ 오늘 뭐 먹지? 랜덤 뽑기!</h2>
      <p className={styles.randomSub}>
        뭘 먹을지 모르겠다면, 지금 바로 뽑아보세요!
      </p>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          className={styles.randomPickButton}
          onClick={handlePick}
          disabled={isLoading || restaurants.length === 0}
        >
          {isLoading ? '로딩 중...' : '랜덤 음식점 뽑기!'}
        </button>
      </div>

      {isOpen && selected && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleClose}>✖</button>

            <img
              src={getFirstImage(selected.restaurant_menu)}
              alt={selected.restaurant_네이버_상호명 || selected.restaurant_사업장명}
              className={`${styles.image} ${isAnimating ? styles.imageAnimate : ''}`}
            />
            <h3 className={styles.name}>
              {selected.restaurant_네이버_상호명 || selected.restaurant_사업장명}
            </h3>
            <p className={styles.address}>{selected.restaurant_도로명전체주소}</p>
            <p className={styles.services}>
              거리: 약 {Math.round(selected.dist)}m
            </p>

            <button onClick={handleNavigate} className={styles.detailButton}>
              상세 페이지로 이동 →
            </button>

            <div className={styles.retryBottomWrapper}>
              <button onClick={handlePick} className={styles.retryIconButton} title="다시 뽑기">
                <FiRefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!isLoading && restaurants.length === 0 && (
        <p className={styles.emptyMessage}>주변 음식점이 없습니다.</p>
      )}
      {error && <p className={styles.errorMessage}>{error}</p>}
    </section>
  )
}