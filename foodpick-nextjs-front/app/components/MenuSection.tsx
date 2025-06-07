'use client';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/MenuSection.module.css';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useSession } from 'next-auth/react';

type MenuItem = {
  restaurantId: number;
  restaurantName: string;
  restaurantImage: string | null;
  name: string;
  price: number;
  image: string | null;
  description: string | null;
};

type Props = {
  items: MenuItem[];
  onMenuLikeChange?: () => void;
}

export default function MenuSection({ items, onMenuLikeChange }: Props) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, 3);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const session = useSession()

  useEffect(() => {
    const fetchUserLikes = async () => {
      if (session.data?.user?.id) {
        try {
          const response = await fetch(`/api/likes/${session.data.user.id}/${session.data.user.email}`);
          if (response.ok) {
            const userLikes = await response.json();
            // 서버에서 받아온 좋아요 목록을 기반으로 likedItems 초기화
            const likedIndices = items.reduce((acc: number[], item, index) => {
              if (userLikes.some((like: any) => 
                like.restaurantId === item.restaurantId && 
                like.menuName === item.name
              )) {
                acc.push(index);
              }
              return acc;
            }, []);
            setLikedItems(new Set(likedIndices));
          }
        } catch (error) {
          console.error('좋아요 목록을 가져오는 중 오류 발생:', error);
        }
      }
    };

    fetchUserLikes();
  }, [session.data?.user?.id, items]);

  const toggleLike = async (index: number, item: MenuItem) => {
    if (session.data != null) {
      try {
        console.log(item, session.data.user.id)
        const response = await fetch('/api/likes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            restaurantId: item.restaurantId,
            restaurantName: item.restaurantName,
            restaurantImage: item.restaurantImage,
            menuName: item.name,
            menuDescription: item.description,
            menuPrice: item.price,
            userId: session.data.user.id,
            userEmail: session.data.user.email,
          }),
        });

        if (response.ok) {
          setLikedItems((prev) => {
            const updated = new Set(prev);
            updated.has(index) ? updated.delete(index) : updated.add(index);
            return updated;
          });
          onMenuLikeChange?.();
        } else {
          alert('찜하기 처리 중 오류가 발생했습니다.');
        }
      } catch (error) {
        console.error('찜하기 처리 중 오류:', error);
        alert('찜하기 처리 중 오류가 발생했습니다.');
      }
    } else {
      alert("로그인이 필요한 서비스입니다.")
    }
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
                onClick={() => toggleLike(idx, item)}
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