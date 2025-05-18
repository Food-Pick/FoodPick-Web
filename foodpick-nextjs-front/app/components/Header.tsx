'use client';

import Image from 'next/image';
import { FiUser, FiSearch } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import styles from '../../styles/home.module.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocation } from '../contexts/LocationContext';

interface HeaderProps {
  onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const router = useRouter();
  const { locationInfo, lastSearchQuery, setLastSearchQuery, isLocationLoading } = useLocation();
  const [searchQuery, setSearchQuery] = useState(lastSearchQuery);
  const pathname = usePathname();
  const showSearch = 
    pathname.startsWith('/restaurant_detail') || pathname.startsWith('/restaurant/detail') || pathname.startsWith('/search/result');
  
  // 검색어가 변경될 때마다 Context에 저장
  useEffect(() => {
    setLastSearchQuery(searchQuery);
  }, [searchQuery, setLastSearchQuery]);

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
    //window.location.href = `/search/result?food=${encodeURIComponent(searchQuery)}&lat=${locationInfo.latitude}&lng=${locationInfo.longitude}`;
    router.push(`/search/result?food=${encodeURIComponent(searchQuery)}&lat=${locationInfo.latitude}&lng=${locationInfo.longitude}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    console.log(searchQuery);
  }, [searchQuery]); 

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoContainer} onClick={() => window.location.href = '/'}>
          <Image 
            src="/images/logo.png" 
            alt="logo" 
            width={130} 
            height={50} 
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>
      <button className={styles.loginBtn_mobile} onClick={() => router.push('/login')}>
        <FiUser /> 로그인
      </button>
      </div>

      {showSearch && (
        <div className={styles.searchWrapper}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder={isLocationLoading ? "위치 정보를 가져오는 중..." : "지역, 가게명을 검색해보세요"}
              className={`${styles.searchInput} ${isLocationLoading ? styles.searchInputDisabled : ''}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLocationLoading}
            />
            <FiSearch 
              className={`${styles.searchIcon} ${isLocationLoading ? styles.searchIconDisabled : ''}`} 
              size={20} 
              color={isLocationLoading ? "#ccc" : "#888"} 
              onClick={handleSearch} 
            />
          </div>
        </div>
      )}

      <button className={styles.loginBtn} onClick={() => router.push('/login')}>
        <FiUser /> 로그인
      </button>
    </header>
  );
}