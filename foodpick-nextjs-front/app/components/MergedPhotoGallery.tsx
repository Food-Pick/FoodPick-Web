'use client';

import { use, useState } from 'react';
import styles from '../../styles/MergedPhotoGallery.module.css';

type Props = {
  photos: string[];
};

export default function MergedPhotoGallery({ photos }: Props) {
  const [visibleCount, setVisibleCount] = useState(6);
  const visiblePhotos = photos.slice(0, visibleCount);

  return (
    <section className={styles.gallerySection}>
      <h2 className={styles.heading}>사진</h2>

      <div className={styles.photoGrid}>
        {visiblePhotos.map((src, i) => (
          <img key={i} src={src} alt={`Photo ${i + 1}`} className={styles.photo} />
        ))}
      </div>

      {photos.length > visibleCount && (
        <button className={styles.moreButton} onClick={() => setVisibleCount(prev => prev + 6)}>
          사진 더보기
        </button>
      )}
    </section>
  )
}