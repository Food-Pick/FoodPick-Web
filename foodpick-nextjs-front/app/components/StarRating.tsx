'use client';

import React, { useState } from 'react';
import styles from '../../styles/StarRating.module.css' 

type Props = {
  rating: number;
  setRating: (value: number) => void;
};

export default function StarRating({ rating, setRating }: Props) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= (hoverRating || rating) ? styles.filledStar : styles.emptyStar}
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
        >
          ★
        </span>
      ))}
    </div>
  )
}