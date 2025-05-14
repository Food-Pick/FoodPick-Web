// 🔹 1. components/ReviewSection/ReviewSection.tsx

'use client';
import React, { useState } from 'react';
import styles from '../../styles/ReviewSection.module.css';
import ReviewModal from './ReviewModal';
import LoginRequiredModal from './LoginRequiredModal';

export type Review = {
  id: string;
  author: string;
  content: string;
  images: string[];
  createdAt: string;
  rating: number;
};

type Props = {
  reviews: Review[];
  isLoggedIn: boolean;
  restaurantName: string;
};

export default function ReviewSection({ reviews, isLoggedIn, restaurantName }: Props) {
  const [reviewList, setReviewList] = useState<Review[]>(reviews);
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [sortBy, setSortBy] = useState<'recommend' | 'latest' | 'ratingHigh' | 'ratingLow'>('recommend');
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const currentUserName = '익명 사용자';

  const WEIGHTS = {
    rating: 10,
    image: 3,
    timePenaltyPerDay: 0.5,
  };

  const getReviewScore = (review: Review) => {
    const daysAgo = (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return review.rating * WEIGHTS.rating + review.images.length * WEIGHTS.image - daysAgo * WEIGHTS.timePenaltyPerDay;
  };

  const sortedReviews = [...reviewList].sort((a, b) => {
    switch (sortBy) {
      case 'recommend': return getReviewScore(b) - getReviewScore(a);
      case 'latest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'ratingHigh': return b.rating - a.rating;
      case 'ratingLow': return a.rating - b.rating;
      default: return 0;
    }
  });

  const handleDeleteReview = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setReviewList(prev => prev.filter(r => r.id !== id));
    }
  };

  const visibleReviews = sortedReviews.slice(0, visibleCount);

  return (
    <section className={styles.reviewSection}>
      <div className={styles.reviewHeader}>
        <h2 className={styles.heading}>방문자 리뷰</h2>
        <button
          className={styles.writeBtn}
          onClick={() => {
            if (isLoggedIn) setShowModal(true);
            else setShowLoginModal(true);
          }}
        >
          리뷰 작성하기
        </button>
      </div>

      <div className={styles.sortBar}>
        {['recommend', 'latest', 'ratingHigh', 'ratingLow'].map((key) => (
          <button
            key={key}
            className={`${styles.sortBtn} ${sortBy === key ? styles.activeSort : ''}`}
            onClick={() => setSortBy(key as any)}
          >
            {key === 'recommend' ? '추천순' :
             key === 'latest' ? '최신순' :
             key === 'ratingHigh' ? '평점 높은 순' : '평점 낮은 순'}
          </button>
        ))}
      </div>

      {visibleReviews.map((review) => (
        <div key={review.id} className={styles.reviewCard}>
          <p className={styles.author}>{review.author}</p>
          <div className={styles.rating}>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={i < review.rating ? styles.starFilled : styles.starEmpty}>★</span>
            ))}
          </div>
          <p className={styles.content}>{review.content}</p>
          <div className={styles.imageList}>
            {review.images.map((src, idx) => (
              <img key={idx} src={src} alt="리뷰 이미지" className={styles.image} />
            ))}
          </div>
          <p className={styles.date}>{review.createdAt.slice(0, 10)}</p>

          {/* 👇 작성자 본인만 수정/삭제 가능 */}
          {isLoggedIn && review.author === currentUserName && (
            <div className={styles.reviewActions}>
              <button onClick={() => alert('수정')}>수정</button>
              <button onClick={() => handleDeleteReview(review.id)}>삭제</button>
            </div>
          )}
        </div>
      ))}

      {visibleCount < sortedReviews.length && (
        <button className={styles.loadMoreBtn} onClick={() => setVisibleCount(prev => prev + 5)}>
          리뷰 더보기
        </button>
      )}

      {/* 모달 코드 및 css */}
      {/* {showModal && (
        <ReviewModal
          restaurantName={restaurantName}
          onClose={() => setShowModal(false)}
          onSubmit={(rating, content, images) => {
            // TODO: 등록 처리 로직
            console.log('제출됨', { rating, content, images});
          }}
        />
      )} */}

      {/* 모달 코드 및 css - 작성 시 리뷰 등록 됌. 다만 임시로 작성된 코드라 새로고침 시 삭제됨*/}
      {/* 필요하면 loaclStorage에 저장하는 로직 추가 */}
      {showModal && (
        <ReviewModal
          restaurantName={restaurantName}
          onClose={() => setShowModal(false)}
          onSubmit={(rating, content, images) => {
            const newReview: Review = {
              id: Date.now().toString(),
              author: '익명 사용자',
              content,
              rating,
              createdAt: new Date().toISOString(),
              images: images.map(file => URL.createObjectURL(file)),
            };
            setReviewList(prev => [newReview, ...prev]);
            setShowModal(false);
          }}
        />
      )}

      {/* 로그안 요청 모달*/}
      {showLoginModal && <LoginRequiredModal onClose={() => setShowLoginModal(false)} />}
    </section>
  );
}
