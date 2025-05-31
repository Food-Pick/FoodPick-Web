'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '../../components/Header';
import styles from './SearchResult.module.css';
import { useLocation } from '../../contexts/LocationContext';

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
    const [isReloading, setIsReloading] = useState(false);
    const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);
    const [isFromMap, setIsFromMap] = useState(false);
    const [currentAddress, setCurrentAddress] = useState('');
    const searchParams = useSearchParams();
    const router = useRouter();
    const { locationInfo } = useLocation();

    const food = searchParams.get('food');
    const category = searchParams.get('category');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    const searchQuery = food || category || '';
    const searchType = food ? 'food' : 'category';

    // 위도/경도로 주소 가져오기
    const getAddressFromCoordinates = async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
                {
                    headers: {
                        'User-Agent': 'FoodPick-Web/1.0'
                    }
                }
            );
            const data = await response.json();
            if (data.display_name) {
                const addressParts = data.display_name.split(', ');
                const koreanAddress = addressParts.slice(0, 3).join(' ');
                setCurrentAddress(koreanAddress);
            }
        } catch (error) {
            console.error('Error fetching address:', error);
            setCurrentAddress(locationInfo.address);
        }
    };

    useEffect(() => {
        if (lat && lng) {
            getAddressFromCoordinates(parseFloat(lat), parseFloat(lng));
        } else {
            setCurrentAddress(locationInfo.address);
        }
    }, [lat, lng, locationInfo.address]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/restaurant/search_food?food=${searchQuery}&lat=${lat}&lng=${lng}`);
                const data = await res.json();
                
                // 유사도 계산 및 정렬
                const sortedResults = data.map((item: Restaurant) => {
                    let menu = [];
                    try { menu = JSON.parse(item.menu); } catch {}
                    const menuNames = menu.map((m: any) => m.name).join(' ');
                    const similarity = calculateSimilarity(searchQuery, menuNames);
                    return { ...item, similarity };
                }).sort((a: any, b: any) => b.similarity - a.similarity);

                setResults(sortedResults);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
                setIsReloading(false);
            }
        };

        fetchData();
    }, [searchQuery, lat, lng]);

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

    const handleSearchAtLocation = async (lat: number, lng: number) => {
        const food = searchParams.get('food');
        const category = searchParams.get('category');
        const searchQuery = food || category || '';
        console.log('검색 결과 페이지 - 새로운 검색 좌표:', {
            위도: lat,
            경도: lng,
            검색어: searchQuery
        });
        
        // 현재 선택된 음식점 하이라이트 해제
        setHoveredRestaurant(null);
        setIsFromMap(false);
        
        // 새로운 위치의 주소 가져오기
        await getAddressFromCoordinates(lat, lng);
        
        try {
            const res = await fetch(`/api/restaurant/search_food?food=${searchQuery}&lat=${lat}&lng=${lng}`);
            const data = await res.json();
            
            // 유사도 계산 및 정렬
            const sortedResults = data.map((item: Restaurant) => {
                let menu = [];
                try { menu = JSON.parse(item.menu); } catch {}
                const menuNames = menu.map((m: any) => m.name).join(' ');
                const similarity = calculateSimilarity(searchQuery, menuNames);
                return { ...item, similarity };
            }).sort((a: any, b: any) => b.similarity - a.similarity);

            setResults(sortedResults);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

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
                        {searchType === 'food' ? `"${searchQuery}" 검색 결과` : `${searchQuery} 카테고리 검색 결과`}
                    </h2>
                    <p className={styles.searchSubtitle}>
                        {currentAddress} 주변 검색 결과입니다.
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
                            try { menu = JSON.parse(item.menu); } catch {}
                            const image = menu[0]?.images?.[0] || '/images/background.png';
                            const isHovered = hoveredRestaurant?.id === item.id;

                            // 검색어와 관련된 메뉴 찾기
                            const searchTerm = searchQuery.toLowerCase();
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
                            setIsFromMap(true);
                        } else {
                            setHoveredRestaurant(null);
                            setIsFromMap(false);
                        }
                    }}
                    onSearchAtLocation={handleSearchAtLocation}
                    isReloading={isReloading}
                />
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