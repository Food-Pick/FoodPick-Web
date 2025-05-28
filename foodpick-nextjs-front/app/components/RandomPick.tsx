'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { restaurants } from '../data/mockRestaurantData';
import { Restaurant } from '../types/restaurant';
import styles from '../../styles/home.module.css';
import { FiRefreshCw } from 'react-icons/fi';

export default function RandomPick() {
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const handlePick = () => {
  setIsAnimating(false);

  let newIndex = Math.floor(Math.random() * restaurants.length);

  // 현재 선택된 음식점과 다른 게 나올 때까지 반복 (단, 1개일 땐 무한 루프 방지)
  if (restaurants.length > 1 && selected) {
    while (restaurants[newIndex].id === selected.id) {
      newIndex = Math.floor(Math.random() * restaurants.length);
    }
  }

  setSelected(restaurants[newIndex]);
  setIsOpen(true);
  setTimeout(() => setIsAnimating(true), 50);
};

  const handleClose = () => {
    setIsOpen(false);
    setIsAnimating(false);
  };

  const handleNavigate = () => {
    if (selected) {
      router.push(`/restaurant_detail/${selected.id}`);
    }
  };

  return (
    <section className={styles.recommendSection}>
      <h2 className={styles.sectionTitle}>❓ 오늘 뭐 먹지? 랜덤 뽑기!</h2>
      <p className={styles.randomSub}>
        뭘 먹을지 모르겠다면, 지금 바로 뽑아보세요!
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button className={styles.randomPickButton} onClick={handlePick}>
          랜덤 음식점 뽑기!
        </button>
      </div>

      {isOpen && selected && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={handleClose}>✖</button>

            <img
              src={selected.image}
              alt={selected.name}
              className={`${styles.image} ${isAnimating ? styles.imageAnimate : ''}`}
            />
            <h3 className={styles.name}>{selected.name}</h3>
            <p className={styles.address} title={selected.restaurant_address}>
              {selected.restaurant_address}
            </p>
            <p className={styles.rating}>
              ⭐ {selected.rating} / 리뷰 {selected.reviewCount}개
            </p>
            <p className={styles.services}>
              {selected.services.join(', ')}
            </p>

            <button onClick={handleNavigate} className={styles.detailButton}>
              상세 페이지로 이동 →
            </button>

            <div className={styles.retryBottomWrapper}>
              <button onClick={handlePick} className={styles.retryIconButton} title="다시 뽑기">
                <FiRefreshCw size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
