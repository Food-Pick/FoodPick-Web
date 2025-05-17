'use client'

import { useState } from 'react';
import styles from '../../styles/RecommendationSection.module.css'
import { restaurants } from '../data/mockRestaurantData';
import RestaurantCard from './RestaurantCard';

type Props = {
  title: string;
  restaurants: typeof restaurants;
};

export default function RecommedationSection({ title, restaurants }: Props) {
  const [visibleCount, setVisibleCount] = useState(6);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const visibleRestaurants = restaurants.slice(0, visibleCount);

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>
        <span className={styles.highlight}>{title.split('과')[0]}</span>과 {title.split('과')[1]}
      </h2>
      <div className={styles.cardGrid}>
        {visibleRestaurants.map((r) => (
          <RestaurantCard key={r.id} {...r} />
        ))}
      </div>

      {visibleCount < restaurants.length && (
        <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
          가게 더보기
        </button>
      )}
    </section>
  );
}