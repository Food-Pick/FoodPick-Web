'use client';
import React, { useState } from 'react';
import styles from '../../styles/MenuSection.module.css';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

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
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const toggleLike = (index: number) => {
    setLikedItems((prev) => {
      const updated = new Set(prev);
      updated.has(index) ? updated.delete(index) : updated.add(index);
      return updated;
    });
  };

  return (
    <section className={styles.menuSection}>
      <h2 className={styles.heading}>메뉴</h2>
      
      
      {visibleItems.map((item, idx) => (
        <div className={styles.menuCard} key={idx}>
          <div className={styles.menuInfo}>
            <p className={styles.menuName}>{item.name}</p>
             <div className={styles.priceLikeWrapper}>
              <p className={styles.menuPrice}>{item.price.toLocaleString()}원</p>
              <button
                className={styles.heartButton}
                onClick={() => toggleLike(idx)}
                aria-label="찜하기"
              >
                {likedItems.has(idx) ? (
                  <AiFillHeart className={`${styles.heartIcon} ${styles.liked}`} />
                ) : (
                  <AiOutlineHeart className={styles.heartIcon} />
                )}
              </button>
            </div>
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