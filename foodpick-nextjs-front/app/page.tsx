'use client';
import { FiSearch, FiCrosshair, FiRefreshCw } from 'react-icons/fi';
import styles from '../styles/home.module.css';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import RecommendRestaurants from './components/RecommendRestaurants';
import NearbyRestaurants from './components/NearbyRestaurants';
import { trendingHashtags } from './data/hashtags';
import { videoList } from './data/videoList';
import SnsVideoSection from './components/SnsVideoSection';
import LocationModal from './components/LocationModal';
import { useRouter } from 'next/navigation';
import { useLocation } from './contexts/LocationContext';
import RecommendRestaurant from './components/RecommendRestaurants_active';
import RandomPick from './components/RandomPick';

// 위치 정보 타입 정의
interface LocationInfo {
  address: string;
  latitude: number;
  longitude: number;
  type: 'current' | 'manual';
}

// 주소 파싱 함수
const parseAddress = (data: any): string => {
  try {
    const address = data.address;
    // state: 시/도, county: 구/군, suburb: 동(읍/면/동)
    const state = address.state || '';
    const county = address.county || address.city || '';
    const dong = address.suburb || address.town || address.village || address.neighbourhood || '';
    return [state, county, dong].filter(Boolean).join(' ');
  } catch (error) {
    return '주소를 파싱할 수 없습니다.';
  }
};

export default function Home() {
  const { locationInfo, setLocationInfo, isFirstVisit, lastSearchQuery, setLastSearchQuery, isLocationLoading } = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(lastSearchQuery);
  const router = useRouter();

  // 위치 갱신 함수
  const handleRefreshLocation = async () => {
    setIsLoading(true);
    try {
      // 1. 현재 위치 가져오기
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                reject(new Error('위치 정보 접근이 거부되었습니다. 브라우저 설정을 확인해주세요.'));
                break;
              case error.POSITION_UNAVAILABLE:
                reject(new Error('위치 정보를 사용할 수 없습니다.'));
                break;
              case error.TIMEOUT:
                reject(new Error('위치 정보 요청 시간이 초과되었습니다.'));
                break;
              default:
                reject(new Error('위치 정보를 가져오는데 실패했습니다.'));
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // 2. 위도/경도로 주소 정보 가져오기
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FoodPick-Web/1.0' // OpenStreetMap API 정책 준수
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('위치 정보를 가져오는데 실패했습니다.');
      }
      
      const data = await response.json();
      
      // 3. 주소 정보가 있으면 상태 업데이트
      if (data.address) {
        const newLocationInfo = {
          address: parseAddress(data),
          latitude,
          longitude,
          type: 'current' as const,
          timestamp: Date.now()
        };
        setLocationInfo(newLocationInfo);
      } else {
        throw new Error('주소 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('위치 정보 갱신 중 오류:', error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      alert(error instanceof Error ? error.message : '위치 정보를 갱신하는데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어가 변경될 때마다 Context에 저장
  useEffect(() => {
    setLastSearchQuery(searchQuery);
  }, [searchQuery, setLastSearchQuery]);

  useEffect(() => {
    console.log('searchQuery', searchQuery);
  }, [searchQuery]);

  const handleSearch = () => {
    if (isLocationLoading) {
      alert('위치 정보를 가져오는 중입니다. 잠시만 기다려주세요.');
      return;
    }
    if (searchQuery.trim() === '') {
      alert('검색어를 입력해주세요.');
      return;
    }
    setLastSearchQuery(searchQuery);
    router.push(`/search/result?food=${encodeURIComponent(searchQuery)}&lat=${locationInfo.latitude}&lng=${locationInfo.longitude}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleHashtagClick = (tag: string) => {
    if (isLocationLoading) {
      alert('위치 정보를 가져오는 중입니다. 잠시만 기다려주세요.');
      return;
    }
    router.push(`/search/result?food=${encodeURIComponent(tag)}&lat=${locationInfo.latitude}&lng=${locationInfo.longitude}`);
  };

  return (
    <div className={styles.container}>
      <Header/> 
      {/* 히어로 섹션 */}
      <section className={styles.hero}>
        <h1><strong>무엇을 먹을지 고민될 땐, FoodPick</strong></h1>

        <div className={styles.serachArea}>
          <div className={styles.searchBox}>
            <input 
              type='text' 
              placeholder={isLocationLoading ? "위치 정보를 가져오는 중..." : "지금 먹고 싶은 음식은?"} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className={isLocationLoading ? styles.searchInputDisabled : ''}
            />
            <button 
              onClick={handleSearch}
              className={isLocationLoading ? styles.searchButtonDisabled : ''}
              disabled={isLocationLoading}
            >
              <FiSearch size={20} color={isLocationLoading ? "#ccc" : "#888"} />
            </button>
          </div>

          <div className={styles.locationRow}>
            <p className={styles.location}>
              <FiCrosshair size={16}/>
              {locationInfo.type === 'current' ? '현재 위치: ' : '지정 위치: '}
              {isLoading ? '위치 정보를 가져오는 중...' : locationInfo.address}
            </p>
            <div className={styles.locationButtons}>
              <button 
                className={styles.refreshLocationBtn} 
                onClick={handleRefreshLocation}
                disabled={isLocationLoading}
                title="위치 갱신"
              >
                <FiRefreshCw size={16} color="white" className={isLoading ? styles.rotating : ''} />
              </button>
              <button 
                className={styles.locationBtn} 
                onClick={() => setShowLocationModal(true)}
                disabled={isLocationLoading}
              >
                위치 변경하기
              </button>
            </div>
          </div>
        </div>  
      </section>

      {/* 카테고리 */}
      <section className={styles.categories}>
        {[
          { icon: '/icons/korean.png', label: '한식'},
          { icon: '/icons/chinese.png', label: '중식'},
          { icon: '/icons/japanese.png', label: '일식'},
          { icon: '/icons/western.png', label: '양식'},
          { icon: '/icons/cafe.png', label: '카페 & 디저트'},
          { icon: '/icons/pub.png', label: '호프'},
          { icon: '/icons/etc.png', label: '기타'},
        ].map((item, idx) => (
          <button key={idx} className={styles.categoryBtn}>
            <img src={item.icon} alt={item.label} className={styles.categoryIcon} />
            <span className={styles.categoriesLabel}>{item.label}</span>
          </button>
        ))}
      </section>
    
      {/* 추천 맛집 */}
      {/* <RecommendRestaurants /> */}

      <RecommendRestaurant
        latitude={locationInfo.latitude} 
        longitude={locationInfo.longitude} 
      />

      {/* 주변 맛집 */}
      <NearbyRestaurants 
        latitude={locationInfo.latitude} 
        longitude={locationInfo.longitude} 
      />

      {/* 트렌드 해시태그 */}
      <section className={styles.recommendSection}>
        <h2 className={styles.sectionTitle}>🏷️ 트렌드 해시태그</h2>
        <div className={styles.hashtagList}>
          {trendingHashtags.map((tag, idx) => (
            <button 
              key={idx} 
              className={styles.hashtagTag}
              onClick={() => handleHashtagClick(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>
      </section>

      {/* SNS 인기 맛집 영상 */}
      <SnsVideoSection videoList={videoList}/>

      {/* 랜덤 음식점 추천 */}
      <RandomPick 
        latitude={locationInfo.latitude} 
        longitude={locationInfo.longitude} 
      />
      
      {showLocationModal && (
        <LocationModal
          onClose={() => setShowLocationModal(false)}
          onSelect={(address: string, latitude: number, longitude: number) => {
            const newLocationInfo: LocationInfo = {
              address,
              latitude: latitude,
              longitude: longitude,
              type: 'manual' as const
            };
            console.log('수동 선택 위치 정보:', newLocationInfo);
            setLocationInfo(newLocationInfo);
            setIsLoading(false);
          }}
        />
      )}

    </div>
  );
}
