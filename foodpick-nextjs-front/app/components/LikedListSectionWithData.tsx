'use client';

import styles from '../../styles/userSettingsPage.module.css';
import { useRouter } from 'next/navigation';

type LikedItem = {
  restaurantId: number | string;
  restaurantName: string;
  imageUrl: string | null;
  foods: string[];
};

type Props = {
  likedList: LikedItem[];
};

export default function LikedListSectionWithData({ likedList }: Props) {
  const router = useRouter();

  return (
    <div className={styles.box}>
      <h3 className={styles.boxTitle}>내 찜 목록</h3>
      {likedList.length === 0 && <div>찜한 항목이 없습니다.</div>}
      {likedList.map((r) => (
        <div key={r.restaurantId} className={styles.likedCard} onClick={() => router.push(`/restaurant/detail/${r.restaurantId}`)}>
          <img src={r.imageUrl ?? '/images/default.jpg'} alt={r.restaurantName} className={styles.thumbnail} />
          <div className={styles.info}>
            <strong className={styles.name}>{r.restaurantName}</strong>
            <p className={styles.foods}>{r.foods.join(', ')}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 