'use client'

import React from 'react';
import styles from '../../styles/RestaurantCard.module.css';
import { useRouter } from 'next/navigation';
import { AiFillStar } from 'react-icons/ai';
import { FiMapPin } from 'react-icons/fi'

type Props = {
  id: string;
  name: string;
  image: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  hours: string;
  distance: number;
};

function isOpen(hours: string): boolean {
  if (!hours) return false;
  if (hours === '24시간 영업') return true;

  try {
    const [openStr, closeStr] = hours.split(' - ').map(str => str.trim());
    if (!openStr || !closeStr || !openStr.includes(':') || !closeStr.includes(':')) return false;

    const [openHour, openMinute] = openStr.split(':').map(Number);
    const [closeHour, closeMinute] = closeStr.split(':').map(Number);

    if ([openHour, openMinute, closeHour, closeMinute].some(isNaN)) return false;

    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;

    // ✅ KST 기준 현재 시간 계산
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const kst = new Date(utc + 9 * 60 * 60000); // UTC + 9시간
    const nowMinutes = kst.getHours() * 60 + kst.getMinutes();

    return nowMinutes >= openMinutes && nowMinutes <= closeMinutes;
  } catch {
    return false;
  }
}

export default function RestaurantCard({
  id,
  name,
  image,
  rating,
  reviewCount,
  tags,
  hours,
  distance,
}: Props) {
  const router = useRouter();

  return (
    <div
      className={styles.card}
      onClick={() => router.push(`/restaurant_detail/${id}`)}
    >
      <img src={image} alt={name} className={styles.image} />
      <div className={styles.content}>
        <h3 className={styles.title}>{name}</h3>
        <div className={styles.rating}>
          <AiFillStar color='#facc15' size={14} />
          <span>{rating.toFixed(1)} ({reviewCount})</span>
        </div>

        <p className={styles.tags}>{tags.join(', ')}</p>
        <p className={styles.hours}>
          <span className={isOpen(hours) ? styles.open : styles.closed}>
            {isOpen(hours) ? '영업중' : '영업 준비 중'}
          </span>{' '}
          {hours}
        </p>

        <div className={styles.distanceRow}>
          <FiMapPin size={13} />
          <span className={styles.grayText}>
            현재 위치에서{' '}
            <span className={styles.orangeText}>{distance}m</span>
          </span> 
        </div>
      </div>
    </div>
  )
}
