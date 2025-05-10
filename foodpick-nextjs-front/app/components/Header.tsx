import Image from 'next/image';
import { FiUser } from 'react-icons/fi';
import styles from '../../styles/home.module.css';

interface HeaderProps {
  onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Image src="/images/logo.png" alt="logo" width={150} height={60} />
      </div>
      <button className={styles.loginBtn} onClick={onLoginClick}>
        <FiUser />로그인
      </button>
    </header>
  );
} 