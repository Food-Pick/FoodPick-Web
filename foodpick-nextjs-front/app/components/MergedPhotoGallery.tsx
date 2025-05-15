'use client';

import { use, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from '../../styles/MergedPhotoGallery.module.css';
import { getProxiedImageUrl } from '../utils/imageProxy';
import ProxiedImage from './ProxiedImage';

type Props = {
  photos: string[];
};

export default function MergedPhotoGallery({ photos }: Props) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const prevVisibleCount = useRef(visibleCount);
  const photosRef = useRef(photos);

  // 현재 표시할 이미지
  const visiblePhotos = useMemo(() => {
    return photos.slice(0, visibleCount);
  }, [photos, visibleCount]);

  // 이미지 로딩 상태 업데이트 함수
  const markImageAsLoaded = useCallback((src: string) => {
    setLoadedImages(prev => {
      if (prev[src]) return prev; // 이미 로드됨으로 표시된 경우 상태 업데이트 건너뛰기
      return {
        ...prev,
        [src]: true
      };
    });
  }, []);

  // 이미지 미리 로드 - 다음 배치
  useEffect(() => {
    // 사진이 변경되었을 때만 로딩 상태 초기화
    if (photosRef.current !== photos) {
      photosRef.current = photos;
    }

    if (prevVisibleCount.current !== visibleCount) {
      prevVisibleCount.current = visibleCount;
      
      // 다음 배치 미리 로드
      if (photos.length > visibleCount) {
        const nextBatch = photos.slice(visibleCount, visibleCount + 6);
        nextBatch.forEach(src => {
          if (!loadedImages[src]) {
            const img = new Image();
            img.src = getProxiedImageUrl(src);
            img.onload = () => markImageAsLoaded(src);
          }
        });
      }
    }
  }, [visibleCount, photos, loadedImages, markImageAsLoaded]);

  // 화면에 보이는 이미지 초기 로드
  useEffect(() => {
    visiblePhotos.forEach(src => {
      if (!loadedImages[src]) {
        const img = new Image();
        img.src = getProxiedImageUrl(src);
        img.onload = () => markImageAsLoaded(src);
      }
    });
  }, [visiblePhotos, loadedImages, markImageAsLoaded]);

  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => prev + 6);
  }, []);

  return (
    <section className={styles.gallerySection}>
      <h2 className={styles.heading}>사진</h2>

      <div className={styles.photoGrid}>
        {visiblePhotos.map((src, i) => (
          <div 
            key={`photo-${i}-${src.substring(0, 20)}`} 
            className={styles.photoContainer} 
            onClick={() => setSelectedIndex(i)}
          >
            <ProxiedImage
              src={src}
              alt={`Photo ${i + 1}`}
              fill
              style={{ objectFit: 'cover' }}
              className={styles.photo}
              initialLoaded={!!loadedImages[src]}
              onImageLoad={() => markImageAsLoaded(src)}
            />
          </div>
        ))}
      </div>

      {photos.length > visibleCount && (
        <button className={styles.moreButton} onClick={handleShowMore}>
          사진 더보기
        </button>
      )}

      {/* 확대 뷰 */}
      {selectedIndex !== null && (
        <div className={styles.overlay} onClick={() => setSelectedIndex(null)}>
          <button 
            className={styles.closeBtn} 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}>X</button>

          <div className={styles.largeImageContainer}>
            <ProxiedImage
              src={photos[selectedIndex]}
              alt='Selected'
              fill
              style={{ objectFit: 'contain' }}
              className={styles.largeImage}
              initialLoaded={!!loadedImages[photos[selectedIndex]]}
              onImageLoad={() => markImageAsLoaded(photos[selectedIndex])}
            />
          </div>

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