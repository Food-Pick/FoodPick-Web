'use client';

import { useEffect, useState, Suspense, useRef, useCallback } from 'react';
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
    photo: string;
}

function SearchResultContent() {
    const [results, setResults] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [isReloading, setIsReloading] = useState(false);
    const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);
    const [isFromMap, setIsFromMap] = useState(false);
    const [currentAddress, setCurrentAddress] = useState('');
    const [startY, setStartY] = useState(0); 
    const [currentY, setCurrentY] = useState(0); // 드로어의 translateY 값
    const [isDragging, setIsDragging] = useState(false); 
    const leftPanelRef = useRef<HTMLDivElement>(null); 
    const resultListRef = useRef<HTMLUListElement>(null); 
    const searchParams = useSearchParams();
    const router = useRouter();
    const { locationInfo } = useLocation();
    const [headerHeight, setHeaderHeight] = useState(82);
    const [minTranslate, setMinTranslate] = useState(0); // 드로어 최상단 위치 (translateY=0)
    const [midTranslate, setMidTranslate] = useState(0); // 드로어 중간 위치
    const [maxTranslate, setMaxTranslate] = useState(0); // 드로어 최하단 위치
    const [snapPoints, setSnapPoints] = useState<number[]>([]);
    const [isMobileDrawer, setIsMobileDrawer] = useState(false);
    const [dragBaseY, setDragBaseY] = useState(0); 
    const [panelTransition, setPanelTransition] = useState(''); 
    const [isHandleActive, setIsHandleActive] = useState(false); 
    const lastTouchY = useRef(0); 

    const food = searchParams.get('food');
    const category = searchParams.get('category');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    const searchQuery = food || category || '';
    const searchType = food ? 'food' : 'category';

    useEffect(() => {
        const checkWidth = () => {
            setIsMobileDrawer(window.innerWidth <= 630);
            setHeaderHeight(window.innerWidth <= 630 ? 136 : 82);
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    useEffect(() => {
        if (isMobileDrawer) {
            const h = window.innerHeight; 
            const contentHeight = h - headerHeight; // 헤더를 제외한 실제 사용 가능한 높이 (최대 드로어 높이)

            // minT: 드로어 상단이 뷰포트 상단에 맞춰지는 위치 (translateY=0)
            const minT = 0; 
            // midT: 드로어 상단이 뷰포트 높이의 40% 지점 (드로어 60% 노출)
            const midT = contentHeight * 0.4; 
            // maxT: 드로어 상단이 뷰포트 높이의 75% 지점 (드로어 25% 노출)
            const maxT = contentHeight * 0.75; 

            const points = [minT, midT, maxT].sort((a, b) => a - b);
            setMinTranslate(points[0]);
            setMidTranslate(points[1]);
            setMaxTranslate(points[2]);
            setSnapPoints(points);

            // 모바일 드로어 초기 위치를 최하단으로 설정
            setCurrentY(points[2]); 
        } else {
            setMinTranslate(0);
            setMidTranslate(0);
            setMaxTranslate(0);
            setSnapPoints([]);
            setCurrentY(0); 
        }
    }, [headerHeight, isMobileDrawer]);

    const getAddressFromCoordinates = useCallback(async (lat: number, lng: number) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`,
                {
                    headers: { 'User-Agent': 'FoodPick-Web/1.0' }
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
    }, [locationInfo.address]);

    useEffect(() => {
        if (lat && lng) {
            getAddressFromCoordinates(parseFloat(lat), parseFloat(lng));
        } else {
            setCurrentAddress(locationInfo.address);
        }
    }, [lat, lng, locationInfo.address, getAddressFromCoordinates]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/restaurant/search_food?food=${searchQuery}&lat=${lat}&lng=${lng}`);
                const data = await res.json();
                
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

        if (searchQuery && lat && lng) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [searchQuery, lat, lng]);

    const calculateSimilarity = (searchTerm: string, menuText: string) => {
        const searchWords = searchTerm.toLowerCase().split(' ').filter(Boolean);
        const menuWords = menuText.toLowerCase().split(' ').filter(Boolean);
        
        if (searchWords.length === 0) return 0;

        let matchCount = 0;
        for (const searchWord of searchWords) {
            if (menuWords.some(menuWord => menuWord.includes(searchWord))) {
                matchCount++;
            }
        }
        return matchCount / searchWords.length;
    };

    const markers = results.map((item) => {
        const image = getFirstImage(item);
        return {
            lat: parseFloat(item.latitude),
            lng: parseFloat(item.longitude),
            name: item.사업장명,
            imageUrl: image
        };
    });

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

    useEffect(() => {
        if (hoveredRestaurant && isFromMap && leftPanelRef.current) {
            const element = document.getElementById(`restaurant-${hoveredRestaurant.id}`);
            if (element) {
                const scrollContainer = leftPanelRef.current.querySelector(`.${styles.resultList}`);
                if (scrollContainer) {
                    const containerRect = scrollContainer.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    
                    if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
                        scrollContainer.scrollTop += elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
                    }
                }
            }
        }
    }, [hoveredRestaurant, isFromMap]);

    const handleSearchAtLocation = async (newLat: number, newLng: number) => {
        console.log('검색 결과 페이지 - 새로운 검색 좌표:', {
            위도: newLat,
            경도: newLng,
            검색어: searchQuery
        });
        
        setLoading(true);
        setHoveredRestaurant(null);
        setIsFromMap(false);
        
        await getAddressFromCoordinates(newLat, newLng);
        
        try {
            const res = await fetch(`/api/restaurant/search_food?food=${searchQuery}&lat=${newLat}&lng=${newLng}`);
            const data = await res.json();
            
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

    const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isMobileDrawer) return;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setStartY(clientY);
        setDragBaseY(currentY); 
        setIsDragging(true);
        setPanelTransition('none'); 
    };

    const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isMobileDrawer || !isDragging) return;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const deltaY = clientY - startY;
        
        // 마우스 드래그 감도 조정 (터치보다 더 민감하게)
        const dragMultiplier = 'touches' in e ? 1 : 2.0;
        let newTranslate = dragBaseY + (deltaY * dragMultiplier);
        
        // 스냅 포인트 범위 내로 제한
        newTranslate = Math.max(minTranslate, Math.min(maxTranslate, newTranslate));
        setCurrentY(newTranslate);
    };

    const handleEnd = () => {
        if (!isMobileDrawer || !isDragging) return;
        setIsDragging(false);
        
        // 현재 위치에서 가장 가까운 스냅 포인트 찾기
        let closestPoint = snapPoints[0];
        let minDiff = Math.abs(currentY - closestPoint);

        for (let i = 1; i < snapPoints.length; i++) {
            const diff = Math.abs(currentY - snapPoints[i]);
            if (diff < minDiff) {
                minDiff = diff;
                closestPoint = snapPoints[i];
            }
        }
        
        // 스냅 포인트로 이동할 때 부드러운 애니메이션 적용
        setPanelTransition('transform 0.3s cubic-bezier(0.4,0,0.2,1)');
        setCurrentY(closestPoint);
    };

    const handleHandleStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsHandleActive(true); 
        setHoveredRestaurant(null); 
        handleStart(e);
    };
    const handleHandleMove = (e: React.TouchEvent | React.MouseEvent) => {
        handleMove(e);
    };
    const handleHandleEnd = (e: React.TouchEvent | React.MouseEvent) => {
        setIsHandleActive(false); 
        handleEnd();
    };

    const preventGlobalScroll = useCallback((e: TouchEvent) => {
        if (!isMobileDrawer) return; 

        if (isDragging) {
            e.preventDefault();
            return;
        }

        const listElement = resultListRef.current;
        if (listElement && listElement.contains(e.target as Node)) {
            const currentTouchY = e.touches[0].clientY;
            const deltaY = currentTouchY - lastTouchY.current; 

            if (listElement.scrollTop === 0 && deltaY > 0) {
                e.preventDefault();
                return;
            }
            return;
        }

        if (Math.abs(currentY - minTranslate) < 5 && e.touches[0].clientY > lastTouchY.current) {
            e.preventDefault();
            return;
        }

    }, [isMobileDrawer, isDragging, minTranslate, currentY]);

    useEffect(() => {
        if (isMobileDrawer) {
            window.addEventListener('touchmove', preventGlobalScroll, { passive: false });
        }
        return () => {
            if (isMobileDrawer) { 
                window.removeEventListener('touchmove', preventGlobalScroll);
            }
        };
    }, [isMobileDrawer, preventGlobalScroll]); 

    useEffect(() => {
        const handleTouchMoveForLastY = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                lastTouchY.current = e.touches[0].clientY;
            }
        };
        window.addEventListener('touchmove', handleTouchMoveForLastY, { passive: true });
        return () => {
            window.removeEventListener('touchmove', handleTouchMoveForLastY);
        };
    }, []);

    function getFirstImage(restaurant: Restaurant) {
    // 1. restaurant_photo가 있으면 가장 먼저 시도
    if (restaurant.photo) {
        try {
            const photoArr = JSON.parse(restaurant.photo);
            if (Array.isArray(photoArr) && photoArr[0]) {
        return photoArr[0];
        }
    } catch (e) {
        console.error('getFirstImage 파싱 오류', e);
        }
    }
     // 2. restaurant_menu의 images[0] 시도
    if (restaurant.menu) {
        try {
            const menuArr = JSON.parse(restaurant.menu);
            if (Array.isArray(menuArr) && menuArr[0]?.images?.[0]) {
                return menuArr[0].images[0];
            }
        } catch (e) {
        console.error('getFirstMenuImage 파싱 오류', e);
        }
    }

    // 3. 기본 이미지
    return "/images/background.png";
    }

    let panelPositionClass = '';
    if (isMobileDrawer) {
        const diffToMin = Math.abs(currentY - minTranslate);
        const diffToMid = Math.abs(currentY - midTranslate);
        const diffToMax = Math.abs(currentY - maxTranslate);
        
        const minDiff = Math.min(diffToMin, diffToMid, diffToMax);

        if (minDiff === diffToMin) panelPositionClass = styles.top;
        else if (minDiff === diffToMid) panelPositionClass = styles.middle;
        else panelPositionClass = styles.bottom;
    }

    // 드로어의 높이를 고정 (헤더 제외한 뷰포트 전체 높이)
    // 그리고 transform으로 위치를 제어합니다.
    const drawerFullHeight = `calc(100dvh - ${headerHeight}px)`;

    // 검색어(음식/카테고리)별 동적 타이틀 설정
    useEffect(() => {
        if (food) {
            document.title = `FoodPick - ${food} 검색 결과`;
        } else if (category) {
            document.title = `FoodPick - ${category} 카테고리 검색 결과`;
        } else {
            document.title = 'FoodPick - 검색 결과';
        }
    }, [food, category]);

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
            <div 
                ref={leftPanelRef}
                className={
                    isMobileDrawer
                        ? `${styles.leftPanel} ${panelPositionClass}`
                        : styles.leftPanel
                }
                style={
                    isMobileDrawer ? {
                        transform: `translateY(${currentY}px)`,
                        transition: panelTransition,
                        // pointerEvents: (isDragging || isHandleActive) ? 'none' : 'auto',
                        height: drawerFullHeight // ✨ 변경된 부분: 높이를 고정
                    } : {}
                }
            >
                {isMobileDrawer && ( 
                    <div
                        className={styles.drawerHandleZone}
                        title="드래그해서 펼치기/접기"
                        onTouchStart={handleHandleStart}
                        onTouchMove={handleHandleMove}
                        onTouchEnd={handleHandleEnd}
                        onMouseDown={handleHandleStart}
                        onMouseMove={handleMove}
                        onMouseUp={handleHandleEnd}
                        onMouseLeave={handleHandleEnd}
                        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    />
                )}
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
                    <ul 
                        ref={resultListRef} 
                        className={styles.resultList}
                    >
                        {results.map((item) => {
                            let menu = [];
                            try { menu = JSON.parse(item.menu); } catch {}
                            const image = getFirstImage(item);
                            const isHovered = hoveredRestaurant?.id === item.id;

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
                                    style={isHandleActive ? { pointerEvents: 'none' } : {}}
                                    onMouseEnter={() => {
                                        if (!isMobileDrawer) {
                                            setHoveredRestaurant(item);
                                            setIsFromMap(false);
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (!isMobileDrawer) {
                                            setHoveredRestaurant(null);
                                            setIsFromMap(false);
                                        }
                                    }}
                                    onTouchStart={() => {
                                        setHoveredRestaurant(item);
                                        setIsFromMap(false);
                                    }}
                                    onTouchEnd={() => {
                                        setTimeout(() => {
                                            setHoveredRestaurant(null);
                                            setIsFromMap(false);
                                        }, 300);
                                    }}
                                >
                                    <Link 
                                        href={`/restaurant/detail/${item.id}`}
                                        className={styles.resultLink}
                                    >
                                        <img src={image} alt={item.사업장명} className={styles.resultImg} loading='lazy'/>
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
            <div className={styles.rightPanel}
                style={{
                    pointerEvents: (isMobileDrawer && (isDragging || Math.abs(currentY - minTranslate) < 5)) ? 'none' : 'auto',
                    display: (isMobileDrawer && Math.abs(currentY - minTranslate) < 5) ? 'none' : 'block',
                    position: (isMobileDrawer && Math.abs(currentY - minTranslate) < 5) ? 'absolute' : 'relative'  
                }}
            >
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