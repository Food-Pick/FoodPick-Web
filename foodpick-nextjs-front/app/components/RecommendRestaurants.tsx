import { AiFillStar } from 'react-icons/ai';
import { FiMapPin } from 'react-icons/fi';
import { restaurants } from '../data/mockRestaurantData';
import styles from '../../styles/home.module.css';

export default function RecommendRestaurants() {
  return (
    <section className={styles.recommendSection}>
      <h2 className={styles.sectionTitle}>추천 맛집</h2>
      <div className={styles.scrollWrapper}>
        <div className={styles.cardList}>
          {restaurants.map((r) => ( // restaurants 배열에는 Restaurant 타입의 객체들이 들어있음
            // map을 사용하여 각 음식점 정보를 카드 형태로 렌더링
            <button key={r.id} className={styles.foodCard}>
              <img src={r.image} alt={r.name} />
                <div className={styles.cardContent}>
                  <p className={styles.cardTitle}>{r.name}</p>
                  <div className={styles.cardMeta}>
                    <AiFillStar size={14} color="#facc15" />
                    <span>{r.rating.toFixed(1)}</span>
                    <FiMapPin size={14} style={{ marginLeft: '0.75rem' }} />
                    <span>{r.distance}m</span>
                  </div>
                </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}