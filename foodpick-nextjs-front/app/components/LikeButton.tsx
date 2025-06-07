// components/LikeButton.tsx
'use client';

import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import styles from '../../styles/LikeButton.module.css';
import { useSession } from 'next-auth/react';

type LikeButtonProps = {
  restaurantId: string;
  initialLiked?: boolean;
  onLikeChange?: (isLiked: boolean) => void;
};

export default function LikeButton({ restaurantId, initialLiked = false, onLikeChange }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const session = useSession();

  useEffect(() => {
    setIsLiked(initialLiked);
  }, [initialLiked]);

  useEffect(() => {
    if (onLikeChange) {
      onLikeChange(isLiked);
    }
    console.log("isLiked", isLiked);
  }, [isLiked, onLikeChange]);

  const toggleLike = () => {
    if (session.data != null) {
      // TODO: 로그인 여부 확인 및 서버에 찜 상태 저장 로직 추가
      setIsLiked((prev) => !prev);
    } else {
      alert("로그인이 필요한 서비스 입니다.")
    }
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
