'use client';

import styles from '../../styles/userSettingsPage.module.css';
import { useRouter } from 'next/navigation';

interface Restaurant {
  id: number;
  name: string;
  image_url: string;
  foods: string[];
}

const dummyLikedRestaurants: Restaurant[] = [
  {
    id: 1,
    name: '몽심 한남대점',
    image_url: '/images/mongshim1.jpg',
    foods: ['밀키 연유 마들렌', '달콤 초코 마들렌'],
  },
  {
    id: 2,
    name: '오문창 순대국밥',
    image_url: '/images/omunchang1.jpg',
    foods: ['순대국밥 보', '순대국밥 특'],
  },
  {
    id: 6,
    name: '쯔보',
    image_url: '/images/tzubo1.jpg',
    foods: ['[전국 1등] 오렌지 치킨', '[시그니처] 소고기 볶음면'],
  },
];

export default function LikedListSection() {
  const router = useRouter();

  return (
    <div className={styles.box}>
      <h3 className={styles.boxTitle}>내 찜 목록</h3>

      {dummyLikedRestaurants.map((r) => (
        <div key={r.id} className={styles.likedCard} onClick={() => router.push(`/restaurant_detail/${r.id}`)}>
          <img src={r.image_url} alt={r.name} className={styles.thumbnail} />
          <div className={styles.info}>
            <strong className={styles.name}>{r.name}</strong>
            <p className={styles.foods}>{r.foods.join(', ')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
