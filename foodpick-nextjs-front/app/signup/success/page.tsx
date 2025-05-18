'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FiCheck } from 'react-icons/fi';
import styles from '../../styles/SignupSuccess.module.css';

export default function SignupSuccessPage() {
  return (
    <div className={styles.container}>
      <div className={styles.logoWrapper}>
        <Image
          src="/images/logo.png"
          alt="FoodPick 로고"
          fill
          className={styles.logoImage}
        />
      </div>
      <div className={styles.box}>
        <div className={styles.iconCircle}>
          <Image
            src="/images/check_circle.png"  // 경로는 public/images 폴더 기준
            alt="완료 아이콘"
            width={220}
            height={100}
          />
        </div>
        <p className={styles.message}>아이디 생성을 완료하였습니다.</p>
        <Link href="/">
          <button className={styles.homeButton}>돌아가기</button>
        </Link>
      </div>
    </div>
  );
}
