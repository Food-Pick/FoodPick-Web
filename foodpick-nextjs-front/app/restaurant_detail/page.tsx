'use client';

import styles from '../../styles/restaurant_detail.module.css'
import { FiMapPin, FiPhone, FiClock, FiCheckCircle } from 'react-icons/fi';
import { AiFillStar } from 'react-icons/ai';
import Header from '../components/Header';

export default function RestaurantDetailPage() {

  return (
    <div className={styles.container}>

      {/* 상단 이미지 및 정보 */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <img className={styles.heroImage} src="/images/mongshim.jpg" alt="몽심 한남대점" />
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.title}>몽심 한남대점</h1>
          <p className={styles.tags}>베이커리, 마들렌</p>

         <div className={styles.rating}>
            <AiFillStar color="#facc15" />
            <span>5.0 (23)</span>
          </div>

          <div className={styles.infoRow}>
            <FiMapPin />
            <div className={styles.infoTextGroup}>
              <p>대전광역시 대덕구 한남로38번길 28 1층</p>
              <p className={styles.subtext}>
                현재 위치에서 <strong className={styles.distance}>18m</strong>
              </p>
            </div>
            <button className={styles.mapButton}>지도 보기</button>
          </div>

          <div className={styles.infoRow}>
            <FiPhone />
            <p>010-4459-1014</p>
          </div>

          <div className={styles.infoRow}>
            <FiClock />
            <p>운영시간: 오전 11:00 - 오후 18:00</p>
          </div>

          <div className={styles.infoRow}>
            <FiCheckCircle />
            <p>테이크 아웃, 배달, 예약</p>
          </div>
        </div>
      </section>
    </div>
  );
}