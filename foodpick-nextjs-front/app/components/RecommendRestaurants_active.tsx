import { useEffect, useState, useRef } from 'react';
import { useLocation } from '../contexts/LocationContext';
import styles from '../../styles/home.module.css';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

interface Weather {
  temperature: string;
  precipitation: string;
  precipitationType: string;
  humidity: string;
  sky: string | null;
  windSpeed: string;
  windDirection: string;
  eastWestWind: string;
  northSouthWind: string;
}

interface Menu {
  name: string;
  image_url: string;
  matched_rules: string[];
  descriptions: string[];
  matched_tags: Array<Record<string, string[]>>;
  applied_rules_details: Array<{
    name: string;
    description: string;
    weather_condition: Record<string, any>;
    meal_time_condition: string[];
    menu_tags_condition: Record<string, string[]>;
  }>;
}

interface Restaurant {
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image_url: string;
  menus: Menu[];
}

interface RecommendationData {
  weather: Weather;
  mealTime: string;
  recommendations: Restaurant[];
}

interface RestaurantWithMenus {
  restaurant_id: number;
  restaurant_name: string;
  restaurant_image_url: string;
  menus: Menu[];
}

interface PopupState {
  isOpen: boolean;
  restaurantId: number | null;
}

const getTimeBasedMessage = (mealTime: string) => {
  const hour = new Date().getHours();
  
  if (mealTime === '야식') {
    if (hour >= 22) return '늦은 밤, 출출함을 달래줄';
    if (hour >= 20) return '밤이 깊어가는 이 시간, 따뜻한';
    return '하루의 마무리를 위한';
  }
  
  if (mealTime === '아침') {
    if (hour < 7) return '새로운 하루를 시작하는';
    if (hour < 9) return '상쾌한 아침을 위한';
    return '아침의 여유를 즐기는';
  }

  if (mealTime === '아점') {
    return '아침과 점심 사이, 든든한';
  }
  
  if (mealTime === '점심') {
    if (hour < 12) return '오늘 점심의';
    if (hour < 14) return '바쁜 하루의 중간, 맛있는';
    return '점심 시간의 여유를 즐기는';
  }

  if (mealTime === '점저') {
    return '점심과 저녁 사이, 든든한';
  }
  
  if (mealTime === '저녁') {
    if (hour < 18) return '하루의 마무리를 위한';
    if (hour < 20) return '저녁의 여유를 즐기는';
    return '따뜻한 저녁을 위한';
  }
  
  return '맛있는';
};

const getWeatherMessage = (weather: Weather) => {
  const temp = parseFloat(weather.temperature);
  const humidity = parseInt(weather.humidity);
  const windSpeed = parseFloat(weather.windSpeed);
  
  let messages = [];
  
  // 온도 관련 메시지
  if (temp >= 30) messages.push('더운 날씨에 시원한');
  else if (temp >= 25) messages.push('따뜻한 날씨에 어울리는');
  else if (temp >= 20) messages.push('포근한 날씨에 좋은');
  else if (temp >= 15) messages.push('선선한 날씨에 어울리는');
  else if (temp >= 10) messages.push('쌀쌀한 날씨에 든든한');
  else messages.push('추운 날씨에 따뜻한');
  
  // 습도 관련 메시지
  if (humidity >= 80) messages.push('습한 날씨에 시원한');
  else if (humidity <= 30) messages.push('건조한 날씨에 촉촉한');
  
  // 바람 관련 메시지
  if (windSpeed >= 5) messages.push('바람 부는 날씨에 든든한');
  
  return messages[0]; // 첫 번째 메시지만 사용
};

const SkeletonCard = () => (
  <div className="menu-card skeleton">
    <div className="menu-content">
      <div className="restaurant-header">
        <div className="skeleton-image restaurant-image" />
        <div className="skeleton-text skeleton-bar restaurant-name" />
      </div>
      <div className="menus-container">
        <div className="menu-item">
          <div className="menu-header">
            <div className="skeleton-image menu-image" />
            <div className="skeleton-text skeleton-bar menu-name" />
          </div>
          <div className="recommendation-reason">
            <div className="skeleton-text skeleton-bar" style={{ width: '40%' }} />
            <div className="skeleton-text skeleton-bar" style={{ width: '90%' }} />
            <div className="skeleton-text skeleton-bar" style={{ width: '70%' }} />
          </div>
          <div className="tags-section">
            <div className="tag-group">
              <div className="skeleton-tag skeleton-bar" />
              <div className="skeleton-tag skeleton-bar" />
              <div className="skeleton-tag skeleton-bar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

interface RecommendRestaurantProps {
  latitude: number;
  longitude: number;
  isLoggedIn?: boolean;
  userAgeGroup?: number;
  userPricePreference?: string;
  userFoodCategoryPreference?: string[];
  isLocationConfirmed?: boolean;
}

export default function RecommendRestaurant({
  latitude,
  longitude,
  userAgeGroup,
  userPricePreference,
  userFoodCategoryPreference,
  isLocationConfirmed
}: RecommendRestaurantProps) {
  const { data: session } = useSession();
  const [data, setData] = useState<RecommendationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [popupState, setPopupState] = useState<PopupState>({ isOpen: false, restaurantId: null });
  const [error, setError] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const goToDetailPage = (restaurantId: number) => {
    router.push(`/restaurant/detail/${restaurantId}`);
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -400,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 400,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!isLocationConfirmed) {
      console.log('추천 음식 호출 아직 위치 확정 안됨')
      return;
    }
    console.log('추천 음식 호출 위치 확정 됨')
    // 세션에서 age(0~5)를 '10대' 등으로 변환하는 함수
    const getAgeGroup = (age: number) => {
      switch (age) {
        case 0: return '10대';
        case 1: return '20대';
        case 2: return '30대';
        case 3: return '40대';
        case 4: return '50대';
        default: return '';
      }
    };

    const fetchRecommendations = async () => {
      if (!latitude || !longitude) {
        if (isMounted) {
          setError('위치 정보가 없습니다.');
          setIsLoading(false);
        }
        return;
      }
        
      try {
        console.log('fetchRecommendations 호출', latitude, longitude);
        let url = `/api/recommend?lat=${latitude}&lon=${longitude}`;
                
        // 세션이 존재하면 로그인 상태로 간주
        if (session) {
          console.log('session', session);
          url += `&recommendationType=gemini`;
          // 세션에서 age, favorite_food, price 추출
          const ageGroup = getAgeGroup(session.user.age);
          if (ageGroup) {
            url += `&userAgeGroup=${encodeURIComponent(ageGroup)}`;
          }
          if (session.user.favorite_food && Array.isArray(session.user.favorite_food)) {
            session.user.favorite_food.forEach((category: string) => {
              url += `&userFoodCategoryPreference=${encodeURIComponent(category)}`;
            });
          }
          if (session.user.price) {
            url += `&userPricePreference=${session.user.price}`;
          }
          // 가격대 등은 기존 props 우선

        } else {
          // 비로그인 시 기존 props 사용
          if (userAgeGroup !== undefined) {
            url += `&userAgeGroup=${userAgeGroup}`;
          }
          if (userPricePreference) {
            url += `&userPricePreference=${userPricePreference}`;
          }
          if (userFoodCategoryPreference && userFoodCategoryPreference.length > 0) {
            userFoodCategoryPreference.forEach(category => {
              url += `&userFoodCategoryPreference=${encodeURIComponent(category)}`;
            });
          }
        }
          
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`API 응답 에러: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setData(data);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('추천 음식점 정보를 가져오는데 실패했습니다.:', error);
        if (isMounted) {
          setError('추천 음식점 정보를 가져오는데 실패했습니다.');
          setIsLoading(false);
        }
      }
    };
      
    setIsLoading(true);
    setError(null);
    fetchRecommendations(); 

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, isLocationConfirmed]);

  const timeMessage = getTimeBasedMessage(data?.mealTime || '');
  const weatherMessage = getWeatherMessage(data?.weather || {
    temperature: '20',
    precipitation: '0',
    precipitationType: 'none',
    humidity: '50',
    sky: '맑음',
    windSpeed: '2',
    windDirection: '북동',
    eastWestWind: '0',
    northSouthWind: '0'
  });

  // 음식점별로 메뉴 그룹화
  const restaurantsWithMenus: RestaurantWithMenus[] = data?.recommendations || [];

  const openPopup = (restaurantId: number) => {
    setPopupState({ isOpen: true, restaurantId });
  };

  const closePopup = () => {
    setPopupState({ isOpen: false, restaurantId: null });
  };

  const selectedRestaurant =
    Array.isArray(data?.recommendations)
      ? data.recommendations.find(r => r.restaurant_id === popupState.restaurantId)
      : null;

  return (
    <section className={styles.recommendSection}>
      <div className="recommend-container">
        {isLoading ? (
          <div className="weather-info">
            <div className="weather-message">
              <div className="skeleton-text skeleton-bar" style={{ width: '60%', height: '2rem', margin: '0 auto' }} />
              <div className="skeleton-text skeleton-bar" style={{ width: '40%', height: '1.5rem', margin: '1rem auto 0' }} />
            </div>
          </div>
        ) : (
          <div className="weather-info">
            <div className="weather-message">
              <h2 className="recommend-title">
                {weatherMessage} {timeMessage} 추천 음식
              </h2>
              <p className="subtitle">지금은 {data?.mealTime || '야식'} 시간이에요</p>
            </div>
          </div>
        )}

        <div className="scroll-container">
          {isLoading ? (
            <>
              <div className="scroll-button-skeleton spinner" />
            </>
          ) : (
            <button className="scroll-button left" onClick={scrollLeft}>
              <span>←</span>
            </button>
          )}

          <div className="restaurant-grid" ref={scrollContainerRef}>
            {isLoading ? (
              Array(3).fill(null).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            ) : (
              restaurantsWithMenus.map(restaurant => (
                <div key={restaurant.restaurant_id} className="menu-card">
                  <div className="menu-content">
                    <div className="restaurant-header">
                      <img
                        src={restaurant.restaurant_image_url || '/images/background.png'}
                        alt={restaurant.restaurant_name}
                        className="restaurant-image"
                      />
                      <h3 className="restaurant-name">{restaurant.restaurant_name}</h3>
                    </div>

                    <div className="menus-container">
                      <div className="menu-item">
                        <div className="menu-header">
                          <img
                            src={restaurant.menus[0].image_url || '/images/background.png'}
                            alt={restaurant.menus[0].name}
                            className="menu-image"
                          />
                          <h4 className="menu-name">{restaurant.menus[0].name}</h4>
                        </div>
                                          
                        <div className="recommendation-reason">
                          <h4>추천 이유</h4>
                          <p className="description">{restaurant.menus[0].descriptions[0]}</p>
                        </div>

                        <div className="tags-section">
                          {restaurant.menus[0].matched_tags.map((tagObj, i) =>
                            Object.entries(tagObj).map(([tagType, tags]) => (
                              <div key={tagType + i} className="tag-group">
                                <span className="tag-type">{tagType}</span>
                                <div className="tag-list">
                                  {tags.map((tag, index) => (
                                    <span key={index} className="tag">{tag}</span>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {restaurant.menus.length > 1 && (
                      <button
                        className="more-button"
                        onClick={() => openPopup(restaurant.restaurant_id)}
                      >
                        더보기 ({restaurant.menus.length - 1}개 더)
                      </button>
                    )}
                    <button
                      className="detail-button"
                      onClick={() => goToDetailPage(restaurant.restaurant_id)}
                    >
                      상세 페이지 보기
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {isLoading ? (
            <>
              <div className="scroll-button-skeleton spinner" />
            </>
          ) : (
            <button className="scroll-button right" onClick={scrollRight}>
              <span>→</span>
            </button>
          )}
        </div>

        {popupState.isOpen && selectedRestaurant && (
          <div className="popup-overlay" onClick={closePopup}>
            <div className="popup-content" onClick={e => e.stopPropagation()}>
              <button className="close-button" onClick={closePopup}>×</button>
              <div className="popup-header">
                <img
                  src={selectedRestaurant.restaurant_image_url || '/images/background.png'}
                  alt={selectedRestaurant.restaurant_name}
                  className="popup-restaurant-image"
                />
                <h2 className="popup-restaurant-name">{selectedRestaurant.restaurant_name}</h2>
              </div>
                
              <div className="popup-menus">
                {selectedRestaurant.menus.map((menu, index) => (
                  <div key={index} className="popup-menu-item">
                    <div className="popup-menu-header">
                      <img
                        src={menu.image_url || '/images/background.png'}
                        alt={menu.name}
                        className="popup-menu-image"
                      />
                      <h3 className="popup-menu-name">{menu.name}</h3>
                    </div>
                      
                    <div className="popup-recommendation-reason">
                      <h4>추천 이유</h4>
                      <p className="description">{menu.descriptions[0]}</p>
                    </div>

                    <div className="popup-tags-section">
                      {menu.matched_tags.map((tagObj, i) =>
                        Object.entries(tagObj).map(([tagType, tags]) => (
                          <div key={tagType + i} className="tag-group">
                            <span className="tag-type">{tagType}</span>
                            <div className="tag-list">
                              {tags.map((tag, index) => (
                                <span key={index} className="tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .recommend-container {
          padding: 1.5rem;
          max-width: 100%;
          margin: 0 auto;
          overflow: hidden;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .skeleton {
          position: relative;
          overflow: hidden;
        }

        .skeleton::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0.5) 60%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shimmer 2s infinite;
          background-size: 1000px 100%;
        }

        .skeleton-image {
          background: #e0e0e0;
          border-radius: 8px;
        }

        .skeleton-text {
          background: #e0e0e0;
          height: 1rem;
          border-radius: 4px;
          margin: 0.5rem 0;
        }

        .skeleton-tag {
          background: #e0e0e0;
          height: 1.5rem;
          width: 4rem;
          border-radius: 4px;
          margin: 0.2rem;
        }

        .weather-info {
          margin-bottom: 1.5rem;
          text-align: center !important;
          min-height: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .weather-message {
          margin-bottom: 1rem;
          text-align: center !important;
          width: 100%;
        }

        .recommend-title {
          font-size: 1.5rem;
          color: #333;
          margin-bottom: 0.3rem;
          line-height: 1.4;
        }

        .subtitle {
          color: #666;
          font-size: 1rem;
          margin: 0;
        }

        .scroll-container {
          position: relative;
          width: 100%;
          padding: 0 2.5rem;
        }

        .scroll-button {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          border: 1px solid #e0e0e0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.2s ease;
        }

        .scroll-button:hover {
          background: #f8f9fa;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .scroll-button.left {
          left: 0;
        }

        .scroll-button.right {
          right: 0;
        }

        .restaurant-grid {
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 0.5rem 0;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .restaurant-grid::-webkit-scrollbar {
          display: none;
        }

        .menu-card {
          flex: 0 0 280px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
        }

        .menu-card.loading {
          opacity: 0.7;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 0.7;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 0.7;
          }
        }

        .menu-content {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .restaurant-header {
          position: relative;
          margin-bottom: 0.3rem;
        }

        .restaurant-image {
          width: 100%;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
        }

        .restaurant-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.6rem;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: white;
          margin: 0;
          font-size: 1rem;
        }

        .menus-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .menu-item {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .menu-header {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .menu-image {
          width: 100%;
          height: 140px;
          object-fit: cover;
          border-radius: 8px;
        }

        .menu-name {
          margin: 0;
          font-size: 1.1rem;
          color: #333;
          font-weight: 600;
        }

        .recommendation-reason {
          background: #f8f9fa;
          padding: 0.6rem;
          border-radius: 8px;
        }

        .recommendation-reason h4 {
          margin: 0 0 0.3rem 0;
          color: #666;
          font-size: 0.8rem;
        }

        .description {
          margin: 0;
          color: #444;
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .tags-section {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .tag-group {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .tag-type {
          background: #e9ecef;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-size: 0.7rem;
          color: #495057;
        }

        .tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.2rem;
        }

        .tag {
          background: #e3f2fd;
          color: #1976d2;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-size: 0.7rem;
        }

        .more-button {
          margin-top: 0.3rem;
          padding: 0.6rem;
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          color: #666;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .more-button:hover {
          background: #e9ecef;
          color: #333;
        }
        
        .detail-button {
          margin-top: 0.3rem;
          padding: 0.6rem;
          background: #ff7043; /* 주황색 배경 */
          border: 1px solid #f4511e; /* 경계도 주황 계열 */
          border-radius: 8px;
          color: white; /* 텍스트는 흰색 */
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .detail-button:hover {
          background: #f4511e; /* 더 진한 주황 */
          color: #fff;
        }
        
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 2rem;
        }

        .popup-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          font-size: 1.5rem;
          color: #333;
          cursor: pointer;
          padding: 0.5rem;
          line-height: 1;
          transition: all 0.2s;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .close-button:hover {
          background: white;
          color: #000;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .popup-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .popup-restaurant-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .popup-restaurant-name {
          font-size: 1.5rem;
          color: #333;
          margin: 0;
        }

        .popup-menus {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .popup-menu-item {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.2rem;
          transition: transform 0.2s;
        }

        .popup-menu-item:hover {
          transform: translateY(-5px);
        }

        .popup-menu-header {
          margin-bottom: 1rem;
        }

        .popup-menu-image {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 0.8rem;
        }

        .popup-menu-name {
          font-size: 1.2rem;
          color: #333;
          margin: 0;
        }

        .popup-recommendation-reason {
          margin-bottom: 1rem;
        }

        .popup-recommendation-reason h4 {
          color: #666;
          margin: 0 0 0.5rem 0;
        }

        .popup-tags-section {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        @media (max-width: 768px) {
          .popup-content {
            width: 95%;
            padding: 1.5rem;
          }

          .popup-menus {
            grid-template-columns: 1fr;
          }

          .scroll-button {
            display: none;
          }

          .scroll-container {
            padding: 0;
          }
        }

        .scroll-button-skeleton {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e0e0e0;
          margin: 0 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          pointer-events: none;
        }
        .scroll-button-skeleton.spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #bdbdbd;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
          background: #e0e0e0;
        }
        @keyframes spin {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }
        .scroll-button-skeleton:first-of-type {
          left: 0;
        }
        .scroll-button-skeleton:last-of-type {
          right: 0;
        }
      `}</style>
    </section>
  );
}