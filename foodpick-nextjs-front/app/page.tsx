'use client';
import Image from 'next/image';
import { FiUser, FiSearch, FiCrosshair } from 'react-icons/fi';
import styles from '../styles/home.module.css';
import { useState, useEffect } from 'react';
import Header from './components/Header';

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
  const [currentLocation, setCurrentLocation] = useState<string>('위치 정보를 가져오는 중...');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 현재 위치 가져오기
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              console.log(latitude, longitude);
              // 위도, 경도를 주소로 변환
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
              );
              const data = await response.json();
              if (data.address) {
                setCurrentLocation(parseAddress(data));
              } else {
                setCurrentLocation('위치 정보를 가져올 수 없습니다.');
              }
            } catch (error) {
              setCurrentLocation('위치 정보를 가져오는데 실패했습니다.');
            } finally {
              setIsLoading(false);
            }
          },
          (error) => {
            setCurrentLocation('위치 정보 접근이 거부되었습니다.');
            setIsLoading(false);
          }
        );
      } else {
        setCurrentLocation('이 브라우저에서는 위치 정보를 지원하지 않습니다.');
        setIsLoading(false);
      }
    };

    getCurrentLocation();
  }, []);

  return (
    <div className={styles.container}>
      <Header /> 

      {/* 히어로 섹션 */}
      <section className={styles.hero}>
        <h1><strong>무엇을 먹을지 고민될 땐, FoodPick</strong></h1>

        <div className={styles.serachArea}>
          <div className={styles.searchBox}>
            <input type='text' placeholder='지금 먹고 싶은 음식은?'/>
            <button><FiSearch/></button>
          </div>

          <div className={styles.locationRow}>
            <p className={styles.location}>
              <FiCrosshair size={16}/>
              현재 위치: {isLoading ? '위치 정보를 가져오는 중...' : currentLocation}
            </p>
            <button className={styles.locationBtn} onClick={() => {
              setIsLoading(true);
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  try {
                    const { latitude, longitude } = position.coords;
                    const response = await fetch(
                      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
                    );
                    const data = await response.json();
                    if (data.address) {
                      setCurrentLocation(parseAddress(data));
                    } else {
                      setCurrentLocation('위치 정보를 가져올 수 없습니다.');
                    }
                  } catch (error) {
                    setCurrentLocation('위치 정보를 가져오는데 실패했습니다.');
                  } finally {
                    setIsLoading(false);
                  }
                },
                (error) => {
                  setCurrentLocation('위치 정보 접근이 거부되었습니다.');
                  setIsLoading(false);
                }
              );
            }}>위치 변경하기</button>
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
    </div>
  );
}
