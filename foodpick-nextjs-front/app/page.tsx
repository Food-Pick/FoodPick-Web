'use client';
import { FiSearch, FiCrosshair } from 'react-icons/fi';
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
              disabled={isLocationLoading}
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
            <button 
              className={styles.locationBtn} 
              onClick={() => setShowLocationModal(true)}
              disabled={isLocationLoading}
            >
              위치 변경하기
            </button>
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
          { icon: '/icons/vegan.png', label: '비건'},
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
        <h2 className={styles.sectionTitle}>트렌드 해시태그</h2>
        <div className={styles.hashtagList}>
          {trendingHashtags.map((tag, idx) => (
            <button key={idx} className={styles.hashtagTag}>#{tag}</button>
          ))}
        </div>
      </section>

      {/* SNS 인기 맛집 영상 */}
      <SnsVideoSection videoList={videoList}/>

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
