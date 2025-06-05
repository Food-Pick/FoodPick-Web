// components/LikeButton.tsx
'use client';

import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { useState } from 'react';
import styles from '../../styles/LikeButton.module.css';

type LikeButtonProps = {
  restaurantId: string;
  initialLiked?: boolean;
};

export default function LikeButton({ restaurantId, initialLiked = false }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);

  const toggleLike = () => {
    setIsLiked((prev) => !prev);
    // TODO: 로그인 여부 확인 및 서버에 찜 상태 저장 로직 추가
  };

  return (
    <span className={styles.heartIcon} onClick={toggleLike}>
      {isLiked ? (
        <AiFillHeart color="red" size={24} />
      ) : (
        <AiOutlineHeart color="gray" size={24} />
      )}
    </span>
  );
}
