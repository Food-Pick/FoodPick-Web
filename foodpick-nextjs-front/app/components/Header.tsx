'use client';

import Image from 'next/image';
import { FiUser, FiSearch } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import styles from '../../styles/home.module.css';

interface HeaderProps {
  onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const pathname = usePathname();

  const showSearch = 
    pathname.startsWith('/restaurant_detail');

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => window.location.href = '/'}>
        <div className={styles.logoContainer}>
          <Image 
            src="/images/logo.png" 
            alt="logo" 
            width={130} 
            height={50} 
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {showSearch && (
        <div className={styles.searchWrapper}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="지역, 가게명을 검색해보세요"
              className={styles.searchInput}
            />
            <FiSearch size={20} color="#888" />
          </div>
        </div>
      )}

      <button className={styles.loginBtn} onClick={onLoginClick}>
        <FiUser /> 로그인
      </button>
    </header>
  );
}