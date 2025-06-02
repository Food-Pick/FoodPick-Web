'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface LocationInfo {
  address: string;
  latitude: number;
  longitude: number;
  type: 'current' | 'manual';
  timestamp?: number;
}

// Geolocation 에러 타입 정의
interface GeolocationPositionError {
  code: number;
  message: string;
  PERMISSION_DENIED: number;
  POSITION_UNAVAILABLE: number;
  TIMEOUT: number;
}

interface LocationContextType {
  locationInfo: LocationInfo;
  setLocationInfo: (info: LocationInfo) => void;
  isFirstVisit: boolean;
  lastSearchQuery: string;
  setLastSearchQuery: (query: string) => void;
  isLocationLoading: boolean;
  isLocationConfirmed: boolean;
  setIsLocationConfirmed: (confirmed: boolean) => void;
}

const defaultLocation: LocationInfo = {
  address: '서울특별시 중구 태평로1가',
  latitude: 37.5665,
  longitude: 126.9780,
  type: 'manual',
  timestamp: Date.now()
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// 주소 파싱 함수
const parseAddress = (data: any): string => {
  try {
    const address = data.address;
    const state = address.state || '';
    const county = address.county || address.city || '';
    const dong = address.suburb || address.town || address.village || address.neighbourhood || '';
    return [state, county, dong].filter(Boolean).join(' ');
  } catch (error) {
    return '주소를 파싱할 수 없습니다.';
  }
};

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locationInfo, setLocationInfo] = useState<LocationInfo>(defaultLocation);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);

  // 초기 위치 정보 가져오기
  const getInitialLocation = async () => {
    setIsLocationLoading(true);
    try {
      // 1. 저장된 위치 정보가 있는지 확인
      const savedLocation = localStorage.getItem('locationInfo');
      if (savedLocation) {
        const parsedLocation = JSON.parse(savedLocation);
        const now = Date.now();
        const timeLimit = 1 * 60 * 1000; // 1분을 밀리초로 변환

        // 저장된 위치 정보가 1시간 이내인 경우에만 사용
        if (parsedLocation.timestamp && (now - parsedLocation.timestamp) < timeLimit) {
          setLocationInfo(parsedLocation);
          setIsLocationConfirmed(true);
          setIsFirstVisit(false);
          return;
        }
        // 1시간이 지났다면 현재 위치를 새로 가져옴
      }

      // 2. 현재 위치 가져오기 시도
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      console.log('latitude', latitude);
      console.log('longitude', longitude);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.address) {
        const newLocationInfo = {
          address: parseAddress(data),
          latitude,
          longitude,
          type: 'current' as const,
          timestamp: Date.now()
        };
        setLocationInfo(newLocationInfo);
        setIsLocationConfirmed(true);
        localStorage.setItem('locationInfo', JSON.stringify(newLocationInfo));
        setIsFirstVisit(false);
      }
    } catch (error) {
      const geolocationError = error as GeolocationPositionError;
      if (geolocationError.code !== undefined) {
        switch (geolocationError.code) {
          case 1: // PERMISSION_DENIED
            console.log('위치 정보 접근이 거부되었습니다. 기본 위치로 설정됩니다.');
            break;
          case 2: // POSITION_UNAVAILABLE
            console.log('위치 정보를 사용할 수 없습니다. 기본 위치로 설정됩니다.');
            break;
          case 3: // TIMEOUT
            console.log('위치 정보 요청 시간이 초과되었습니다. 기본 위치로 설정됩니다.');
            break;
          default:
            console.log('위치 정보를 가져오는데 실패했습니다. 기본 위치로 설정됩니다.');
        }
      } else {
        console.log('위치 정보를 가져오는데 실패했습니다. 기본 위치로 설정됩니다.');
      }
      setLocationInfo(defaultLocation);
      setIsLocationConfirmed(true);
      setIsFirstVisit(false);
    } finally {
      setIsLocationLoading(false);
      setIsLocationConfirmed(true);
    }
  };

  // 컴포넌트 마운트 시 실행
  useEffect(() => {
    getInitialLocation();
  }, []);

  // 위치 정보가 변경될 때마다 localStorage에 저장
  const handleSetLocationInfo = (info: LocationInfo) => {
    const locationWithTimestamp = {
      ...info,
      timestamp: Date.now()
    };
    setLocationInfo(locationWithTimestamp);
    localStorage.setItem('locationInfo', JSON.stringify(locationWithTimestamp));
  };

  // 검색어가 변경될 때마다 localStorage에 저장
  const handleSetLastSearchQuery = (query: string) => {
    setLastSearchQuery(query);
    localStorage.setItem('lastSearchQuery', query);
  };

  return (
    <LocationContext.Provider value={{ 
      locationInfo, 
      setLocationInfo: handleSetLocationInfo,
      isFirstVisit,
      lastSearchQuery,
      setLastSearchQuery: handleSetLastSearchQuery,
      isLocationLoading,
      isLocationConfirmed,
      setIsLocationConfirmed
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
} 