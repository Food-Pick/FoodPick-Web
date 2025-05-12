'use client';
import React, { useState } from 'react';
import styles from '../../styles/MenuSection.module.css';

type MenuItem = {
  name: string;
  price: number;
  image: string | null;
};

type Props = {
  items: MenuItem[];
}

export default function MenuSection({ items }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, 3);

  return (
    <section className={styles.menuSection}>
      <h2 className={styles.heading}>메뉴</h2>
      
      
      {visibleItems.map((item, idx) => (
        <div className={styles.menuCard} key={idx}>
          <div className={styles.menuInfo}>
            <p className={styles.menuName}>{item.name}</p>
            <p className={styles.menuPrice}>{item.price.toLocaleString()}원</p>
          </div>
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className={styles.menuImage}
            />
          )}
        </div>
      ))}

      {items.length > 5 && (
        <button
          className={styles.toggleButton}
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? '접기' : '메뉴 더보기'}
        </button>
      )}
    </section>
  )
}