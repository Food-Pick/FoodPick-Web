'use client';

import { use, useState } from 'react';
import styles from '../../styles/MergedPhotoGallery.module.css';

type Props = {
  photos: string[];
};

export default function MergedPhotoGallery({ photos }: Props) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const visiblePhotos = photos.slice(0, visibleCount);

  return (
    <section className={styles.gallerySection}>
      <h2 className={styles.heading}>사진</h2>

      <div className={styles.photoGrid}>
        {visiblePhotos.map((src, i) => (
          <img key={i} 
          src={src} 
          alt={`Photo ${i + 1}`} 
          className={styles.photo}
          onClick={() => setSelectedIndex(i)} />
        ))}
      </div>

      {photos.length > visibleCount && (
        <button className={styles.moreButton} onClick={() => setVisibleCount(prev => prev + 6)}>
          사진 더보기
        </button>
      )}

      {/* 확대 뷰 */}
      {selectedIndex !== null && (
        <div className={styles.overlay} onClick={() => setSelectedIndex(null)}>
          <button 
            className={styles.closeBtn} 
            onClick={(e) => {
              e.stopPropagation
            }}>X</button>

          <img 
            src={photos[selectedIndex]}
            alt='Selected'
            className={styles.largeImage}
            onClick={(e) => e.stopPropagation()}
          />

          {selectedIndex > 0 && (
            <button
              className={`${styles.navBtn} ${styles.left}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex((prev) => (prev !== null ? prev - 1 : null));
              }}
            >
              ‹
            </button>
          )}

          {selectedIndex < photos.length - 1 && (
            <button
              className={`${styles.navBtn} ${styles.right}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(selectedIndex + 1);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </section>
  )
}