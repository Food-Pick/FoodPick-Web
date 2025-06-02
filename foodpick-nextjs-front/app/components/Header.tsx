'use client';

import Image from 'next/image';
import { FiUser, FiSearch, FiSettings, FiLogOut, FiX } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import styles from '../../styles/home.module.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocation } from '../contexts/LocationContext';
import { useSession, signOut } from 'next-auth/react';
import { Session } from 'next-auth';

interface HeaderProps {
  session: Session | null;
}

export default function Header() {
  const router = useRouter();
  const { locationInfo, lastSearchQuery, setLastSearchQuery, isLocationLoading } = useLocation();
  const [searchQuery, setSearchQuery] = useState(lastSearchQuery);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const showSearch = 
    pathname.startsWith('/restaurant_detail') || 
    pathname.startsWith('/restaurant/detail') || 
    pathname.startsWith('/search/result') ||
    pathname.startsWith('/search/category');
  const { data: session } = useSession();

  // 메뉴 상태 추적 Ref
  const showDropdownRef = useRef(showDropdown);
  const showMobileMenuRef = useRef(showMobileMenu);
  useEffect(() => { showDropdownRef.current = showDropdown; }, [showDropdown]);
  useEffect(() => { showMobileMenuRef.current = showMobileMenu; }, [showMobileMenu]);

  // 뷰포트 전환 감지
  const prevIsMobile = useRef<boolean | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined" && prevIsMobile.current === null) {
      prevIsMobile.current = window.innerWidth < 768;
    }
    function handleResize() {
      if (typeof window !== "undefined") {
        const isMobile = window.innerWidth < 768;
        if (prevIsMobile.current !== null && prevIsMobile.current !== isMobile) {
          // PC→모바일: 드롭다운 열려있으면 모바일 메뉴 열기
          if (isMobile) {
            setShowMobileMenu(showDropdownRef.current);
            setShowDropdown(false);
          } else {
          // 모바일→PC: 모바일 메뉴 열려있으면 드롭다운 열기
            setShowDropdown(showMobileMenuRef.current);
            setShowMobileMenu(false);
          }
          prevIsMobile.current = isMobile;
        }
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    console.log(session);
  }, [session]);
  
  const handleProfileClick = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setShowMobileMenu(true);
      setShowDropdown(false);
    } else {
      setShowDropdown(!showDropdown);
      setShowMobileMenu(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    alert('로그아웃 되었습니다.');
    router.push('/');
    setShowMobileMenu(false);
    setShowDropdown(false);
  };

  const handleSettings = () => {
    router.push('/user-settings');
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

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
        {session ? (
          <div className={styles.profileContainer} ref={dropdownRef}>
            <button
              className={styles.profileBtn_mobile}
              onClick={handleProfileClick}
            >
              {session.user?.name ? session.user.name.charAt(0) : <FiUser size={20} />}
            </button>
          </div>
        ) : (
          <button className={styles.loginBtn_mobile} onClick={() => router.push('/login')}>
            <FiUser /> 로그인
          </button>
        )}
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

      {session ? (
        <div className={styles.profileContainer} ref={dropdownRef}>
          <button
            className={styles.profileBtn}
            onClick={handleProfileClick}
          >
            {session.user?.name ? session.user.name.charAt(0) : <FiUser size={20} />}
          </button>
          {/* PC 버전 드롭다운 */}
          {showDropdown && (
            <div className={styles.dropdownMenu}>
              <button onClick={handleSettings} className={styles.dropdownItem}>
                <FiSettings size={16} /> 계정 설정
              </button>
              <button onClick={handleLogout} className={styles.dropdownItem}>
                <FiLogOut size={16} /> 로그아웃
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className={styles.loginBtn} onClick={() => router.push('/login')}>
          <FiUser /> 로그인
        </button>
      )}

      {/* 모바일 버전 메뉴 */}
      <div className={`${styles.mobileMenu} ${showMobileMenu ? styles.show : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <span className={styles.mobileMenuTitle}>메뉴</span>
          <button 
            className={styles.mobileMenuClose}
            onClick={() => setShowMobileMenu(false)}
          >
            <FiX size={24} />
          </button>
        </div>
        <button onClick={handleSettings} className={styles.mobileMenuItem}>
          <div className={styles.mobileMenuItemIcon}>
            <FiSettings size={20} />
          </div>
          계정 설정
        </button>
        <button onClick={handleLogout} className={styles.mobileMenuItem}>
          <div className={styles.mobileMenuItemIcon}>
            <FiLogOut size={20} />
          </div>
          로그아웃
        </button>
      </div>
    </header>
  );
}
