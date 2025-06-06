  'use client';

  import Link from 'next/link';
  import styles from '../../styles/likedPage.module.css'; // ❗ 새로운 CSS 파일 경로로 변경
  import Header from '../components/Header';

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

  export default function LikedRestaurants() {
    return (
      <>
        <Header />
          <section className={styles.likedSection}>
            <h2 className={styles.sectionTitle}>내 찜 목록</h2>

            {dummyLikedRestaurants.map((r) => (
              <div key={r.id} className={styles.card}>
                <Link href={`/restaurant_detail/${r.id}`} className={styles.linkWrapper}>
                  <img src={r.image_url} alt={r.name} className={styles.thumbnail} />
                  <div className={styles.info}>
                    <h3 className={styles.name}>{r.name}</h3>
                    <p className={styles.foods}>{r.foods.join(', ')}</p>
                  </div>
                </Link>
              </div>
            ))}
          </section>
      </>
    );
  }