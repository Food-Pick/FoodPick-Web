'use client';

import { useState, useEffect } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { FiMapPin, FiPhone, FiClock, FiCheckCircle } from 'react-icons/fi';
import styles from '../../../../styles/restaurant_detail.module.css';
import Header from '../../../components/Header';
import MenuSection from '../../../components/MenuSection';
import MergedPhotoGallery from '../../../components/MergedPhotoGallery';
import ReviewSection from '../../../components/ReviewSection';
import { Review } from '../../../components/ReviewSection';
import LikeButton from '../../../components/LikeButton';
import { useSession } from 'next-auth/react';

type RestaurantDetailProps = {
  restaurant: any;
  menu: any[];
  mainImage: string;
  allPhotos: string[];
  dummyReviews: Review[];
  placeInfo: any;
};

export default function RestaurantDetail({
    restaurant,
    menu,
    mainImage,
    allPhotos,
    dummyReviews,
    placeInfo,
}: RestaurantDetailProps) {
    const [isRestaurantLiked, setIsRestaurantLiked] = useState(false);
    const session = useSession();

    // 사용자의 음식점 좋아요 상태를 가져오는 함수
    const fetchRestaurantLikeStatus = async () => {
        if (session.data?.user?.id) {
            try {
                const response = await fetch(`/api/likes/${session.data.user.id}/${session.data.user.email}`);
                if (response.ok) {
                    const userLikes = await response.json();
                    // 음식점 자체 또는 메뉴 좋아요가 하나라도 있으면 활성화
                    const isLiked = userLikes.some((like: any) => String(like.restaurantId) === String(restaurant.id));
                    setIsRestaurantLiked(isLiked);
                }
            } catch (error) {
                console.error('음식점 좋아요 상태를 가져오는 중 오류 발생:', error);
            }
        }
    };

    useEffect(() => {
        fetchRestaurantLikeStatus();
    }, [session.data?.user?.id]);

    // 네이버 URL에서 ID 추출 함수
    const extractNaverId = (url: string): string | null => {
        try {
            const match = url.match(/\d+/);
            if (match && match[0]) {
                return match[0];
            }
            return null;
        } catch (error) {
            console.error('URL 파싱 중 오류:', error);
            return null;
        }
    };

    // 네이버 지도 URL 생성 함수
    const getNaverMapUrl = (url: string): string => {
        const id = extractNaverId(url);
        if (id) {
            return `https://map.naver.com/p/entry/place/${id}`;
        }
        return url;
    };

    return (
        <div>
            <Header />
            <div className={styles.container} style={{ marginTop: '-1rem' }}>
                <section className={styles.hero}>
                    <div className={styles.heroImageWrapper}>
                        <img
                            className={styles.heroImage}
                            src={mainImage}
                            alt={restaurant.네이버_상호명 || restaurant.사업장명}
                        />
                        <div>
                            <LikeButton
                                restaurantId={restaurant.id}
                                initialLiked={isRestaurantLiked}
                                onLikeChange={setIsRestaurantLiked}
                            />
                        </div>
                    </div>

                    <div className={styles.heroContent}>
                        <h1 className={styles.titleWrapper}>
                            <span className={styles.titleText}>
                                {restaurant.네이버_상호명 || restaurant.사업장명}
                            </span>
                        </h1>

                        <p className={styles.tags}>{
                            (() => {
                                try {
                                    const category = JSON.parse(restaurant.네이버_음식점_카테고리);
                                    return Array.isArray(category) ? category.join(', ') : category;
                                } catch {
                                    return restaurant.네이버_음식점_카테고리;
                                }
                            })()
                        }</p>
                        <div className={styles.infoRow}>
                            <FiMapPin />
                            <div className={styles.infoTextGroup}>
                                <p>{restaurant.네이버_주소 || restaurant.도로명전체주소}</p>
                                {placeInfo.영업시간 && (
                                    <p className={styles.subtext}>
                                        영업시간: {placeInfo.영업시간}
                                    </p>
                                )}
                            </div>
                            {restaurant.네이버_place_id_url && (
                                <a
                                    href={getNaverMapUrl(restaurant.네이버_place_id_url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.mapButton}
                                >
                                    네이버로 보기
                                </a>
                            )}
                        </div>

                        {restaurant.네이버_전화번호 && (
                            <div className={styles.infoRow}>
                                <FiPhone />
                                <p>{restaurant.네이버_전화번호}</p>
                            </div>
                        )}

                        {placeInfo.편의 && (
                            <div className={styles.infoRow}>
                                <FiCheckCircle />
                                <p>{placeInfo.편의}</p>
                            </div>
                        )}
                    </div>
                </section>

                {menu.length > 0 && (
                    <MenuSection
                        items={menu.map((m) => ({
                            restaurantId: restaurant.id,
                            restaurantName: restaurant.네이버_상호명 || restaurant.사업장명,
                            restaurantImage: mainImage,
                            name: m.name,
                            price: m.price,
                            image: m.images?.[0] || null,
                            description: m.description,
                        }))}
                        onMenuLikeChange={fetchRestaurantLikeStatus}
                    />
                )}

                {allPhotos.length > 0 && (
                    <MergedPhotoGallery photos={allPhotos} />
                )}

                <ReviewSection
                    reviews={dummyReviews}
                    isLoggedIn={true}
                    restaurantName={restaurant.네이버_상호명 || restaurant.사업장명}
                />
            </div>
        </div>
    );
}