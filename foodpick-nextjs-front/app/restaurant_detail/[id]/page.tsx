export const dynamic = 'auto';

import { AiFillStar } from 'react-icons/ai';
import { FiMapPin, FiPhone, FiClock, FiCheckCircle } from 'react-icons/fi';
import { restaurants } from '../../data/mockRestaurantData';
import styles from '../../../styles/restaurant_Detail.module.css';
import Header from '../../components/Header';
import { notFound } from 'next/navigation';
import MenuSection from '../../components/MenuSection';
import MergedPhotoGallery from '../../components/MergedPhotoGallery';
import ReviewSection from '../../components/ReviewSection';
import RecommedationSection from '../../components/RecommendationSection';

export async function generateStaticParams() {
  return restaurants.map((r) => ({
    id: r.id,
  }));
}

type Props = {
  params: {
    id: string;
  };
};

export default async function RestaurantDetailPage(props: any) {
  const params = await props.params;
  const restaurant = restaurants.find(r => r.id === params.id);
  const otherRestaurants = restaurants.filter(r => r.id !== params.id);

  if (!restaurant) return notFound(); 

  const allPhotos = [
    ...restaurant.photos,
    ...restaurant.reviews.flatMap(r => r.images ?? [])
  ];

  // 태그 검색
  const similarRestaurants = otherRestaurants.filter(r => 
    r.tags.some(tag => restaurant.tags.includes(tag)) 
  );

  // 거리 검색 -> 현재 보고 있는 가게에서 다음 가게까지에 거리 계산 알고리즘 필요요
  const nearbyRestaurants = otherRestaurants.filter(r =>
    r.distance < 2000
  );

  return (
    <div>
      <Header />

      <div className={styles.container} style={{ marginTop: '-1rem' }}>

        <section className={styles.hero}>
          <div className={styles.heroImageWrapper}>
            <img className={styles.heroImage} src={restaurant.image} alt={restaurant.name} />
          </div>

          <div className={styles.heroContent}>
            <h1 className={styles.title}>{restaurant.name}</h1>
            <p className={styles.tags}>{restaurant.tags.join(', ')}</p>

            <div className={styles.rating}>
              <AiFillStar color="#facc15" />
              <span>{restaurant.rating.toFixed(1)} ({restaurant.reviewCount})</span>
            </div>

            <div className={styles.infoRow}>
              <FiMapPin />
              <div className={styles.infoTextGroup}>
                <p>{restaurant.restaurant_address}</p>
                <p className={styles.subtext}>
                  현재 위치에서 <strong className={styles.distance}>{restaurant.distance}m</strong>
                </p>
              </div>
              <button className={styles.mapButton}>지도 보기</button>
            </div>

            <div className={styles.infoRow}>
              <FiPhone />
              <p>{restaurant.phone}</p>
            </div>

            
            <div className={styles.infoRow}>
              <FiClock />
              <p>운영시간: {restaurant.hours}</p>
            </div>

            <div className={styles.infoRow}>
              <FiCheckCircle />
              <p>{restaurant.services.join(', ')}</p>
            </div>
          </div>
        </section>

        <MenuSection items={restaurant.menu.map(item => ({
          ...item,
          restaurantId: Number(restaurant.id),
          restaurantName: restaurant.name,
          restaurantImage: restaurant.image,
          description: ''
        }))} />

        <MergedPhotoGallery photos={[...restaurant.photos, ...restaurant.reviews.flatMap(r => r.images)]} />

        {/* isLoggedIn boolean 값에 따라 모달 달라짐*/}
        <ReviewSection reviews={restaurant.reviews} isLoggedIn={true} restaurantName={restaurant.name}/>

        <RecommedationSection
          title={`${restaurant.name}과 비슷한 맛집`}
          restaurants={similarRestaurants}
        />

        <RecommedationSection
          title={`${restaurant.name}과 가까운 맛집`}
          restaurants={nearbyRestaurants}
        />  
      </div>

    </div>
  );
}