'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '../../components/Header';
import styles from './CategorySearch.module.css';
import { useLocation } from '../../contexts/LocationContext';

const SearchResultMap = dynamic(
  () => import('../../components/SearchResultMap'),
  { ssr: false }
);

interface Restaurant {
    restaurant_id: number;
    restaurant_사업장명: string;
    restaurant_업태구분명: string;
    restaurant_menu: string;
    restaurant_photo: string;
    restaurant_latitude: string;
    restaurant_longitude: string;
    restaurant_menu_tags: {
        menu_tags: {
            [key: string]: {
                맵기: string[];
                맛특징: string[];
                온도감: string[];
                가격정보: {
                    가격대: string[];
                    원본가격: string;
                };
                조리방식: string[];
                주요재료: string[];
                음식카테고리: string[];
                식사유형_상황: string[];
            };
        };
        restaurant_id: string;
        restaurant_name: string;
    };
    dist: number;
}

function CategorySearchContent() {
    const [results, setResults] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);
    const [isFromMap, setIsFromMap] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const { locationInfo } = useLocation();

    const category = searchParams.get('category');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // 카테고리 한글 이름 매핑
    const categoryNames: { [key: string]: string } = {
        'korean': '한식',
        'chinese': '중식',
        'japanese': '일식',
        'western': '양식',
        'cafe': '카페 & 디저트',
        'pub': '호프',
        'etc': '기타'
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/restaurant/search_category?category=${category}&lat=${lat}&lng=${lng}`);
                const data = await res.json();
                // API 응답의 raw 배열을 처리
                setResults(Array.isArray(data.raw) ? data.raw : []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [category, lat, lng]);

    // 마커용 데이터
    const markers = results.map((item) => {
        let menu = [];
        try { menu = JSON.parse(item.restaurant_menu); } catch {}
        const image = menu[0]?.images?.[0] || '/images/background.png';
        return {
            lat: parseFloat(item.restaurant_latitude),
            lng: parseFloat(item.restaurant_longitude),
            name: item.restaurant_사업장명,
            imageUrl: image
        };
    });

    // 현재 호버된 음식점의 마커 데이터
    const highlightedMarker = hoveredRestaurant ? {
        lat: parseFloat(hoveredRestaurant.restaurant_latitude),
        lng: parseFloat(hoveredRestaurant.restaurant_longitude),
        name: hoveredRestaurant.restaurant_사업장명,
        imageUrl: (() => {
            let menu = [];
            try { menu = JSON.parse(hoveredRestaurant.restaurant_menu); } catch {}
            return menu[0]?.images?.[0] || '/images/background.png';
        })()
    } : undefined;

    // hoveredRestaurant가 변경될 때마다 스크롤 처리
    useEffect(() => {
        if (hoveredRestaurant && isFromMap) {
            const element = document.getElementById(`restaurant-${hoveredRestaurant.restaurant_id}`);
            if (element) {
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [hoveredRestaurant, isFromMap]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.leftPanel}>
                    <div style={{ color: '#888', fontSize: '1.1rem', padding: '2rem 0', textAlign: 'center' }}>
                        로딩 중...
                    </div>
                </div>
                <div className={styles.rightPanel}>
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#bbb',
                        fontSize: '1.2rem'
                    }}>
                        지도를 불러오는 중...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <div className={styles.searchHeader}>
                    <h2 className={styles.searchTitle}>
                        {categoryNames[category || '']} 카테고리
                    </h2>
                    <p className={styles.searchSubtitle}>
                        {locationInfo.address} 주변 검색 결과입니다.
                    </p>
                </div>
                {results.length === 0 ? (
                    <div style={{ color: '#888', fontSize: '1.1rem', padding: '2rem 0', textAlign: 'center' }}>
                        검색 결과가 없습니다.
                    </div>
                ) : (
                    <ul className={styles.resultList}>
                        {results.map((item) => {
                            let menu = [];
                            try { menu = JSON.parse(item.restaurant_menu); } catch {}
                            const image = menu[0]?.images?.[0] || '/images/background.png';
                            const isHovered = hoveredRestaurant?.restaurant_id === item.restaurant_id;

                            return (
                                <li 
                                    key={item.restaurant_id}
                                    id={`restaurant-${item.restaurant_id}`}
                                    className={`${styles.resultItem} ${isHovered ? styles.resultItemHovered : ''}`}
                                    onMouseEnter={() => {
                                        setHoveredRestaurant(item);
                                        setIsFromMap(false);
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredRestaurant(null);
                                        setIsFromMap(false);
                                    }}
                                >
                                    <Link 
                                        href={`/restaurant/detail/${item.restaurant_id}`}
                                        className={styles.resultLink}
                                    >
                                        <img src={image} alt={item.restaurant_사업장명} className={styles.resultImg} />
                                        <div className={styles.resultInfo}>
                                            <div className={styles.resultName}>{item.restaurant_사업장명}</div>
                                            <div className={styles.resultMeta}>{item.restaurant_업태구분명}</div>
                                            <div className={styles.resultDesc}>
                                                {menu.slice(0, 2).map((m: any) => m.name).join(', ')}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
            <div className={styles.rightPanel}>
                {results.length === 0 ? (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#bbb',
                        fontSize: '1.2rem'
                    }}>
                        지도에 표시할 결과가 없습니다.
                    </div>
                ) : (
                    <SearchResultMap 
                        markers={markers} 
                        highlightedMarker={highlightedMarker}
                        onMarkerHover={(marker) => {
                            if (marker) {
                                const restaurant = results.find(r => 
                                    parseFloat(r.restaurant_latitude) === marker.lat && 
                                    parseFloat(r.restaurant_longitude) === marker.lng
                                );
                                setHoveredRestaurant(restaurant || null);
                                setIsFromMap(true);
                            } else {
                                setHoveredRestaurant(null);
                                setIsFromMap(false);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default function CategorySearchPage() {
    return (
        <div>
            <Header />
            <Suspense fallback={
                <div className={styles.container}>
                    <div className={styles.leftPanel}>
                        <div style={{ color: '#888', fontSize: '1.1rem', padding: '2rem 0', textAlign: 'center' }}>
                            로딩 중...
                        </div>
                    </div>
                    <div className={styles.rightPanel}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#bbb',
                            fontSize: '1.2rem'
                        }}>
                            지도를 불러오는 중...
                        </div>
                    </div>
                </div>
            }>
                <CategorySearchContent />
            </Suspense>
        </div>
    );
} 