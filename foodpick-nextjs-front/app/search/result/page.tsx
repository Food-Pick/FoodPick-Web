'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '../../components/Header';
import styles from './SearchResult.module.css';

const SearchResultMap = dynamic(
  () => import('../../components/SearchResultMap'),
  { ssr: false }
);

interface Restaurant {
    id: string;
    사업장명: string;
    도로명전체주소: string;
    latitude: string;
    longitude: string;
    menu: string;
}

function SearchResultContent() {
    const [results, setResults] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);
    const [isFromMap, setIsFromMap] = useState(false);  // 지도에서 hover된 것인지 구분
    const searchParams = useSearchParams();
    const router = useRouter();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const food = searchParams.get('food') || '';
                const lat = searchParams.get('lat') || '';
                const lng = searchParams.get('lng') || '';
                const res = await fetch(`/api/restaurant/search_food?food=${food}&lat=${lat}&lng=${lng}`);
                const data = await res.json();
                
                // 유사도 계산 및 정렬
                const sortedResults = data.map((item: Restaurant) => {
                    let menu = [];
                    try { menu = JSON.parse(item.menu); } catch {}
                    const menuNames = menu.map((m: any) => m.name).join(' ');
                    const similarity = calculateSimilarity(food, menuNames);
                    return { ...item, similarity };
                }).sort((a: any, b: any) => b.similarity - a.similarity);

                setResults(sortedResults);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams]);

    // 유사도 계산 함수
    const calculateSimilarity = (searchTerm: string, menuText: string) => {
        const searchWords = searchTerm.toLowerCase().split(' ');
        const menuWords = menuText.toLowerCase().split(' ');
        
        let matchCount = 0;
        for (const searchWord of searchWords) {
            if (menuWords.some(menuWord => menuWord.includes(searchWord))) {
                matchCount++;
            }
        }
        
        return matchCount / searchWords.length;
    };

    // 마커용 데이터
    const markers = results.map((item) => {
        let menu = [];
        try { menu = JSON.parse(item.menu); } catch {}
        const image = menu[0]?.images?.[0] || '/images/background.png';
        return {
            lat: parseFloat(item.latitude),
            lng: parseFloat(item.longitude),
            name: item.사업장명,
            imageUrl: image
        };
    });

    // 현재 호버된 음식점의 마커 데이터
    const highlightedMarker = hoveredRestaurant ? {
        lat: parseFloat(hoveredRestaurant.latitude),
        lng: parseFloat(hoveredRestaurant.longitude),
        name: hoveredRestaurant.사업장명,
        imageUrl: (() => {
            let menu = [];
            try { menu = JSON.parse(hoveredRestaurant.menu); } catch {}
            return menu[0]?.images?.[0] || '/images/background.png';
        })()
    } : undefined;

    // hoveredRestaurant가 변경될 때마다 스크롤 처리 (지도에서 hover된 경우에만)
    useEffect(() => {
        if (hoveredRestaurant && isFromMap) {
            const element = document.getElementById(`restaurant-${hoveredRestaurant.id}`);
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
                <h2 className={styles.title}>'{searchParams.get('food')}'에 대한 검색 결과</h2>
                {results.length === 0 ? (
                    <div style={{ color: '#888', fontSize: '1.1rem', padding: '2rem 0', textAlign: 'center' }}>
                        검색 결과가 없습니다.
                    </div>
                ) : (
                    <ul className={styles.resultList}>
                        {results.map((item) => {
                            let menu = [];
                            try { menu = JSON.parse(item.menu); } catch {}
                            const image = menu[0]?.images?.[0] || '/images/background.png';
                            const isHovered = hoveredRestaurant?.id === item.id;

                            // 검색어와 관련된 메뉴 찾기
                            const searchTerm = searchParams.get('food')?.toLowerCase() || '';
                            const relevantMenus = menu
                                .filter((m: any) => m.name.toLowerCase().includes(searchTerm))
                                .slice(0, 2);
                            
                            const remainingMenus = menu
                                .filter((m: any) => !m.name.toLowerCase().includes(searchTerm))
                                .slice(0, 2 - relevantMenus.length);
                            
                            const displayMenus = [...relevantMenus, ...remainingMenus];

                            return (
                                <li 
                                    key={item.id}
                                    id={`restaurant-${item.id}`}
                                    className={`${styles.resultItem} ${isHovered ? styles.resultItemHovered : ''}`}
                                    onMouseEnter={() => {
                                        setHoveredRestaurant(item);
                                        setIsFromMap(false);  // 리스트에서 hover된 경우
                                    }}
                                    onMouseLeave={() => {
                                        setHoveredRestaurant(null);
                                        setIsFromMap(false);
                                    }}
                                >
                                    <Link 
                                        href={`/restaurant/detail/${item.id}`}
                                        className={styles.resultLink}
                                    >
                                        <img src={image} alt={item.사업장명} className={styles.resultImg} />
                                        <div className={styles.resultInfo}>
                                            <div className={styles.resultName}>{item.사업장명}</div>
                                            <div className={styles.resultMeta}>{item.도로명전체주소}</div>
                                            <div className={styles.resultDesc}>
                                                {displayMenus.map((m: any) => m.name).join(', ')}
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
                                    parseFloat(r.latitude) === marker.lat && 
                                    parseFloat(r.longitude) === marker.lng
                                );
                                setHoveredRestaurant(restaurant || null);
                                setIsFromMap(true);  // 지도에서 hover된 경우
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

export default function SearchResultPage() {
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
                <SearchResultContent />
            </Suspense>
        </div>
    );
}