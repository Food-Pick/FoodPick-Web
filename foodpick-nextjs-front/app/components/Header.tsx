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
        <Image src="/images/logo.png" alt="logo" width={150} height={60} />
      </div>

      {showSearch && (
        <div className={styles.searchWrapper}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="지역, 가게명을 검색해보세요"
              className={styles.searchInput}
            />
            <FiSearch className={styles.searchIcon} />
          </div>
        </div>
      )}

      <button className={styles.loginBtn} onClick={onLoginClick}>
        <FiUser /> 로그인
      </button>
    </header>
  );
}