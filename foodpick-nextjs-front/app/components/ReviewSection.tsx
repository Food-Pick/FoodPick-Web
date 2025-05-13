'use client';

import React, { useState } from 'react';
import styles from '../../styles/ReviewSection.module.css';

type Review = {
  id: string;
  author: string;
  content: string;
  images: string[];
  createdAt: string;
  rating: number;
};

{/* isLoggedIn: 추후 개발할 로그인을 위해 만든 간이 로그인 bool값*/}
type Props = {
  reviews: Review[];
  isLoggedIn: boolean;
}

export default function ReviewSection({ reviews, isLoggedIn }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [sortBy, setSortBy] = useState<'recommend' | 'latest' | 'ratingHigh' | 'ratingLow'>('recommend');

  {/* 추천 순 알고리즘 */}
  const WEIGHTS = {
  rating: 10,
  image: 3,
  timePenaltyPerDay: 0.5,
  };

  const getReviewScore = (review: Review) => {
    const daysAgo = (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return (
      review.rating * WEIGHTS.rating +
      review.images.length * WEIGHTS.image -
      daysAgo * WEIGHTS.timePenaltyPerDay
    );
  };
  
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'recommend':
        return getReviewScore(b) - getReviewScore(a);
      case 'latest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'ratingHigh':
        return b.rating - a.rating; 
      case 'ratingLow':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const visibleReviews = sortedReviews.slice(0, visibleCount);

  return (
    <section className={styles.reviewSection}>
      <div className={styles.reviewHeader}>
        <h2 className={styles.heading}>방문자 리뷰</h2>
        <button
          className={styles.writeBtn}
          onClick={() => {
            if (isLoggedIn) {
              alert('리뷰 작성하기');
            } else {
              alert('리뷰를 작성하려면 로그인이 필요합니다.');
            }
          }}
        >
          리뷰 작성하기
        </button>
      </div>

      <div className={styles.sortBar}>
        <button
          className={`${styles.sortBtn} ${sortBy === 'recommend' ? styles.activeSort : ''}`}
          onClick={() => setSortBy('recommend')}
        >
          추천순
        </button>
        <button
          className={`${styles.sortBtn} ${sortBy === 'latest' ? styles.activeSort : ''}`}
          onClick={() => setSortBy('latest')}
        >
          최신순
        </button>
        <button
          className={`${styles.sortBtn} ${sortBy === 'ratingHigh' ? styles.activeSort : ''}`}
          onClick={() => setSortBy('ratingHigh')}
        >
          평점 높은 순
        </button>
        <button
          className={`${styles.sortBtn} ${sortBy === 'ratingLow' ? styles.activeSort : ''}`}
          onClick={() => setSortBy('ratingLow')}
        >
          평점 낮은 순
        </button>
      </div>

      {visibleReviews.map((review) => (
        <div key={review.id} className={styles.reviewCard}>
          <p className={styles.author}>{review.author}</p>

          <div className={styles.rating}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < review.rating ? styles.starFilled : styles.starEmpty}>
                ★
              </span>
            ))}
          </div>

          <p className={styles.content}>{review.content}</p>

          <div className={styles.imageList}>
            {review.images.map((src, idx) => (
              <img key={idx} src={src} alt="리뷰 이미지" className={styles.image} />
            ))}
          </div>

          <p className={styles.date}>{review.createdAt.slice(0, 10)}</p>
        </div>
      ))}

      {visibleCount < sortedReviews.length && (
        <button 
          className={styles.loadMoreBtn}
          onClick={() => setVisibleCount(prev => prev + 5)}
        >
          리뷰 더보기
        </button>
      )}
    </section>
  );
}
