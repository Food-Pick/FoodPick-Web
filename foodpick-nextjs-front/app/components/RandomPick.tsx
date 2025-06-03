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
  isLocationConfirmed: boolean;
}

export default function RandomPick({ latitude, longitude, isLocationConfirmed }: RandomPickProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [tempRestaurants, setTempRestaurants] = useState<Restaurant[]>([]);
  const [slotPosition, setSlotPosition] = useState(0);
  const [isRetrySpinning, setIsRetrySpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
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
    if (!isLocationConfirmed) {
      console.log('랜덤 음식 호출 아직 위치 확정 안됨')
      return;
    }
    console.log('랜덤 음식 호출 위치 확정 됨')

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
          `/api/nearby/randompick?lat=${latitude}&lng=${longitude}`
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

  const spinSlot = (restaurants: Restaurant[]) => {
    // console.log('restaurnts length', restaurants.length);
    let count = 0;
    const maxCount = Math.min(20, restaurants.length * 2);
    const interval = 100;
    const itemHeight = 60;
    const totalHeight = itemHeight * 10;

    const spinInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * restaurants.length);
      const slots = Array(10).fill(restaurants[randomIndex]);
      setTempRestaurants(slots);
      
      const newPosition = -count * itemHeight;
      setSlotPosition(newPosition % totalHeight);
      
      count++;

      if (count >= maxCount) {
        clearInterval(spinInterval);
        const finalIndex = Math.floor(Math.random() * restaurants.length);
        const finalRestaurant = restaurants[finalIndex];
        setSelected(finalRestaurant);
        setTempRestaurants(Array(10).fill(finalRestaurant));
        setIsSpinning(false);
        setIsRetrySpinning(false);
        setSlotPosition(0);
        
        setTimeout(() => {
          setShowResult(true);
          setIsAnimating(true);
        }, 1000);
      }
    }, interval);
  };

  const handlePick = () => {
    if (restaurants.length === 0) return;
    setIsAnimating(false);
    setIsSpinning(true);
    setShowResult(false);
    setIsOpen(true);

    const restaurantsWithMenu = restaurants.filter(r => r.restaurant_menu);
    const targetRestaurants = restaurantsWithMenu.length > 0 ? restaurantsWithMenu : restaurants;
    
    spinSlot(targetRestaurants);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsAnimating(false);
    setShowResult(false);
    setTempRestaurants([]);
  };

  const handleNavigate = () => {
    if (selected) {
      router.push(`/restaurant/detail/${selected.restaurant_id}`);
    }
  };

  const handleRetry = () => {
    setIsAnimating(false);
    setIsSpinning(true);
    setShowResult(false);
    setIsRetrySpinning(true);
    setSelected(null);

    const restaurantsWithMenu = restaurants.filter(r => r.restaurant_menu);
    const targetRestaurants = restaurantsWithMenu.length > 0 ? restaurantsWithMenu : restaurants;
    
    spinSlot(targetRestaurants);
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
          disabled={isLoading || restaurants.length === 0 || isSpinning || restaurants.length < 20}
        >
          {isLoading ? (
            <span className={styles.spinnerWrapper}>
              <span className={styles.spinner} /> 로딩 중...
            </span>
          ) : isSpinning ? (
            <span className={styles.spinnerWrapper}>
              <span className={styles.spinner} /> 뽑는 중...
            </span>
          ) : restaurants.length < 20 ? (
            '주변 음식점이 부족합니다'
          ) : (
            '랜덤 음식 뽑기!'
          )}
        </button>
      </div>

      {isOpen && (selected || tempRestaurants.length > 0) && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleClose}>✖</button>

            {(selected || tempRestaurants[0]) && (
              <div className={styles.menuInfo}>
                <div className={styles.menuHeader}>
                  {isSpinning || !showResult ? (
                    <>
                      <div className={styles.slotMachine}>
                        <div
                          className={styles.slotMachineContent}
                          style={{
                            transform: `translateY(${slotPosition}px)`,
                            transition: isSpinning ? 'transform 0.05s linear' : 'transform 0.3s ease-out'
                          }}
                        >
                          {tempRestaurants.map((r, index) => (
                            <div key={index} className={`${styles.slotMachineItem} ${styles.menu}`}>
                              {JSON.parse(r.restaurant_menu || '[]')[0]?.name || '메뉴 정보 없음'}
                            </div>
                          ))}
                        </div>
                        <div className={styles.slotMachineOverlay} />
                        <div className={styles.slotMachineHighlight} />
                      </div>

                      <div className={styles.slotMachine}>
                        <div
                          className={styles.slotMachineContent}
                          style={{
                            transform: `translateY(${slotPosition}px)`,
                            transition: isSpinning ? 'transform 0.05s linear' : 'transform 0.3s ease-out'
                          }}
                        >
                          {tempRestaurants.map((r, index) => (
                            <div key={index} className={`${styles.slotMachineItem} ${styles.price}`}>
                              {JSON.parse(r.restaurant_menu || '[]')[0]?.price ?
                                `${JSON.parse(r.restaurant_menu || '[]')[0].price.toLocaleString()}원` :
                                '가격 정보 없음'}
                            </div>
                          ))}
                        </div>
                        <div className={styles.slotMachineOverlay} />
                        <div className={styles.slotMachineHighlight} />
                      </div>
                    </>
                  ) : (
                    <div className={styles.selectedMenu}>
                      <h3 className={styles.selectedMenuName}>
                        {JSON.parse((selected || tempRestaurants[0]).restaurant_menu || '[]')[0]?.name || '메뉴 정보 없음'}
                      </h3>
                      <p className={styles.selectedMenuPrice}>
                        {JSON.parse((selected || tempRestaurants[0]).restaurant_menu || '[]')[0]?.price ?
                          `${JSON.parse((selected || tempRestaurants[0]).restaurant_menu || '[]')[0].price.toLocaleString()}원` :
                          '가격 정보 없음'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <img
              src={getFirstImage((selected || tempRestaurants[0]).restaurant_menu)}
              alt={(selected || tempRestaurants[0]).restaurant_네이버_상호명 || (selected || tempRestaurants[0]).restaurant_사업장명}
              className={`${styles.image} ${isAnimating ? styles.imageAnimate : ''} ${isSpinning ? styles.spinning : ''}`}
            />
            <h3 className={`${styles.name} ${isSpinning ? styles.spinning : ''}`}>
              {(selected || tempRestaurants[0]).restaurant_네이버_상호명 || (selected || tempRestaurants[0]).restaurant_사업장명}
            </h3>
            <p className={`${styles.address} ${isSpinning ? styles.spinning : ''}`}>
              {(selected || tempRestaurants[0]).restaurant_도로명전체주소}
            </p>
            <p className={`${styles.services} ${isSpinning ? styles.spinning : ''}`}>
              거리: 약 {Math.round((selected || tempRestaurants[0]).dist)}m
            </p>

            {!isSpinning && (
              <>
                <button onClick={handleNavigate} className={styles.detailButton}>
                  상세 페이지로 이동 →
                </button>

                <div className={styles.retryBottomWrapper}>
                  <button
                    onClick={handleRetry}
                    className={styles.retryIconButton}
                    title="다시 뽑기"
                    disabled={isRetrySpinning}
                  >
                    <FiRefreshCw size={20} className={isRetrySpinning ? styles.spinning : ''} />
                  </button>
                </div>
              </>
            )}
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