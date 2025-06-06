'use client'; 

import { useEffect, useState, Suspense, useRef, useCallback } from 'react'; // useCallback 추가
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Header from '../../components/Header';
import styles from './CategorySearch.module.css'; // CategorySearch.module.css를 사용합니다.
import { useLocation } from '../../contexts/LocationContext';

const SearchResultMap = dynamic(
  () => import('../../components/SearchResultMap'),
  { ssr: false }
);

interface Restaurant {
    restaurant_id: number;
    restaurant_사업장명: string;
    restaurant_도로명전체주소: string; // SearchResultPage의 도로명전체주소와 통일
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
    const [isReloading, setIsReloading] = useState(false);
    const [hoveredRestaurant, setHoveredRestaurant] = useState<Restaurant | null>(null);
    const [isFromMap, setIsFromMap] = useState(false);
    const [currentAddress, setCurrentAddress] = useState('');
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const resultListRef = useRef<HTMLUListElement>(null); // ul에 연결할 ref 추가
    const searchParams = useSearchParams();
    const { locationInfo } = useLocation();
    const [headerHeight, setHeaderHeight] = useState(82);
    const [minTranslate, setMinTranslate] = useState(0); // 드로어 최상단 위치 (translateY=0)
    const [midTranslate, setMidTranslate] = useState(0); // 드로어 중간 위치
    const [maxTranslate, setMaxTranslate] = useState(0); // 드로어 최하단 위치
    const [snapPoints, setSnapPoints] = useState<number[]>([]);
    const [isMobileDrawer, setIsMobileDrawer] = useState(false);
    const [startY, setStartY] = useState(0); // 드래그 시작 Y 좌표 (공통 사용)
    const [currentY, setCurrentY] = useState(0); // 드로어의 translateY 값 (공통 사용)
    const [isDragging, setIsDragging] = useState(false); // 드래그 중 여부 (공통 사용)
    const [dragBaseY, setDragBaseY] = useState(0); // 드래그 시작 시 currentY 값
    const [panelTransition, setPanelTransition] = useState(''); // CSS transition 제어
    const [isHandleActive, setIsHandleActive] = useState(false); // 핸들 드래그 중 여부
    const lastTouchY = useRef(0); // 터치 이벤트에서 마지막 Y좌표 기억

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

    // 모바일 여부 및 헤더 높이 체크 (SearchResultPage와 동일)
    useEffect(() => {
        const checkWidth = () => {
            setIsMobileDrawer(window.innerWidth <= 630);
            setHeaderHeight(window.innerWidth <= 630 ? 136 : 82);
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    // 스냅 포인트 계산 (SearchResultPage와 동일)
    useEffect(() => {
        if (isMobileDrawer) {
            const h = window.innerHeight; 
            const contentHeight = h - headerHeight; // 헤더를 제외한 실제 사용 가능한 높이 (최대 드로어 높이)

            const minT = 0; // 드로어 상단이 뷰포트 상단에 맞춰지는 위치 (translateY=0)
            const midT = contentHeight * 0.4; // 드로어 상단이 뷰포트 높이의 40% 지점 (드로어 60% 노출)
            const maxT = contentHeight * 0.75; // 드로어 상단이 뷰포트 높이의 75% 지점 (드로어 25% 노출)

            const points = [minT, midT, maxT].sort((a, b) => a - b);
            setMinTranslate(points[0]);
            setMidTranslate(points[1]);
            setMaxTranslate(points[2]);
            setSnapPoints(points);

            // 모바일 드로어 초기 위치를 최하단으로 설정
            setCurrentY(points[2]); 
        } else {
            // 데스크톱 모드일 때는 드로어 관련 값 초기화
            setMinTranslate(0);
            setMidTranslate(0);
            setMaxTranslate(0);
            setSnapPoints([]);
            setCurrentY(0); 
        }
    }, [headerHeight, isMobileDrawer]);

    // 위도/경도로 주소 가져오기 (useCallback으로 래핑)
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

    const handleSearchAtLocation = async (newLat: number, newLng: number) => {
        console.log('카테고리 검색 페이지 - 새로운 검색 좌표:', {
            위도: newLat,
            경도: newLng,
            카테고리: searchParams.get('category') || ''
        });
        
        // 현재 선택된 음식점 하이라이트 해제
        setHoveredRestaurant(null);
        setIsFromMap(false);
        
        // 새로운 위치의 주소 가져오기
        await getAddressFromCoordinates(newLat, newLng);
        
        try {
            const res = await fetch(`/api/restaurant/search_category?category=${category}&lat=${newLat}&lng=${newLng}`);
            const data = await res.json();
            setResults(Array.isArray(data.raw) ? data.raw : []);
        } catch (error) {
            console.error('Error fetching data:', error);
            setResults([]);
        } finally {
            setIsReloading(false); // 검색 완료 시 Reloading 상태 해제
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/restaurant/search_category?category=${category}&lat=${lat}&lng=${lng}`);
                const data = await res.json();
                setResults(Array.isArray(data.raw) ? data.raw : []);
            } catch (error) {
                console.error('Error fetching data:', error);
                setResults([]);
            } finally {
                setLoading(false);
                setIsReloading(false);
            }
        };

        if (category && lat && lng) { // category, lat, lng가 있을 때만 fetch
            fetchData();
        } else {
            setLoading(false); // 필수 파라미터 없으면 로딩 종료
        }
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

    // hoveredRestaurant가 변경될 때마다 스크롤 처리 (SearchResultPage와 동일)
    useEffect(() => {
        if (hoveredRestaurant && isFromMap && leftPanelRef.current) {
            const element = document.getElementById(`restaurant-${hoveredRestaurant.restaurant_id}`);
            if (element) {
                const scrollContainer = leftPanelRef.current.querySelector(`.${styles.resultList}`);
                if (scrollContainer) {
                    const containerRect = scrollContainer.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();
                    
                    // 요소가 스크롤 컨테이너의 뷰포트 내에 없으면 스크롤
                    if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
                        // 중앙으로 스크롤하도록 조정
                        scrollContainer.scrollTop += elementRect.top - containerRect.top - (containerRect.height / 2) + (elementRect.height / 2);
                    }
                }
            }
        }
    }, [hoveredRestaurant, isFromMap]);

    // 드래그 핸들러 (SearchResultPage와 동일)
    const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (!isMobileDrawer) return;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setStartY(clientY);
        setDragBaseY(currentY); 
        setIsDragging(true);
        setPanelTransition('none'); // 드래그 중에는 트랜지션 없애기
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

    // 드로어 핸들 드래그 핸들러 (SearchResultPage와 동일)
    const handleHandleStart = (e: React.TouchEvent | React.MouseEvent) => {
        setIsHandleActive(true); // 핸들 드래그 중임을 표시
        setHoveredRestaurant(null); // 핸들 드래그 중에는 호버 상태 초기화
        handleStart(e);
    };
    const handleHandleMove = (e: React.TouchEvent | React.MouseEvent) => {
        handleMove(e);
    };
    const handleHandleEnd = (e: React.TouchEvent | React.MouseEvent) => {
        setIsHandleActive(false); // 핸들 드래그 종료
        handleEnd();
    };

    // 전역 스크롤 방지 로직 (SearchResultPage와 동일)
    const preventGlobalScroll = useCallback((e: TouchEvent) => {
        if (!isMobileDrawer) return; 

        // 드로어 자체가 드래그 중이면 기본 스크롤 동작 방지
        if (isDragging) {
            e.preventDefault();
            return;
        }

        // resultList 내부 스크롤 처리
        const listElement = resultListRef.current;
        if (listElement && listElement.contains(e.target as Node)) {
            const currentTouchY = e.touches[0].clientY;
            const deltaY = currentTouchY - lastTouchY.current; 

            // 리스트가 최상단이고 위로 스크롤하려는 경우 (드로어를 내리려는 경우)
            if (listElement.scrollTop === 0 && deltaY > 0) {
                e.preventDefault();
                return;
            }
            return; // 리스트 내부 스크롤은 허용
        }

        // 드로어가 최상단 스냅 포인트에 있고, 아래로 스크롤하려는 경우 (드로어를 내리려는 경우)
        if (Math.abs(currentY - minTranslate) < 5 && e.touches[0].clientY > lastTouchY.current) {
             e.preventDefault();
             return;
        }

    }, [isMobileDrawer, isDragging, minTranslate, currentY]);

    useEffect(() => {
        if (isMobileDrawer) {
            // touchmove 이벤트를 capture 단계에서 처리하여 전역 스크롤 방지
            window.addEventListener('touchmove', preventGlobalScroll, { passive: false });
        }
        return () => {
            if (isMobileDrawer) { 
                window.removeEventListener('touchmove', preventGlobalScroll);
            }
        };
    }, [isMobileDrawer, preventGlobalScroll]); 

    // 마지막 터치 Y 좌표 업데이트 (passive: true로 성능 최적화)
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

    // 드로어 위치에 따른 클래스 부여 (SearchResultPage와 동일)
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

    // 드로어의 높이를 고정 (헤더 제외한 뷰포트 전체 높이) (SearchResultPage와 동일)
    const drawerFullHeight = `calc(100dvh - ${headerHeight}px)`;

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
                        // 드래그 중이거나 핸들 활성화 중에는 하위 요소에 대한 포인터 이벤트를 비활성화하여 오작동 방지
                        // pointerEvents: (isDragging || isHandleActive) ? 'none' : 'auto', 
                        height: drawerFullHeight // 높이를 고정하여 스크롤 가능한 영역 확보
                    } : {}
                }
            >
                {isMobileDrawer && ( // 모바일 모드일 때만 핸들 렌더링
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
                        {categoryNames[category || '']} 카테고리
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
                        ref={resultListRef} // resultListRef 연결
                        className={styles.resultList}
                    >
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
                                    style={isHandleActive ? { pointerEvents: 'none' } : {}} // 핸들 드래그 중에는 아이템 클릭 방지
                                    onMouseEnter={() => { // 데스크톱에서만 호버 활성화
                                        if (!isMobileDrawer) {
                                            setHoveredRestaurant(item);
                                            setIsFromMap(false);
                                        }
                                    }}
                                    onMouseLeave={() => { // 데스크톱에서만 호버 비활성화
                                        if (!isMobileDrawer) {
                                            setHoveredRestaurant(null);
                                            setIsFromMap(false);
                                        }
                                    }}
                                    onTouchStart={() => { // 모바일에서 터치 시작 시 호버 (간접적으로)
                                        setHoveredRestaurant(item);
                                        setIsFromMap(false);
                                    }}
                                    onTouchEnd={() => { // 모바일에서 터치 종료 시 호버 해제 (딜레이)
                                        setTimeout(() => {
                                            setHoveredRestaurant(null);
                                            setIsFromMap(false);
                                        }, 300); // 짧은 딜레이 후 해제하여 탭 인식 용이하게
                                    }}
                                >
                                    <Link 
                                        href={`/restaurant/detail/${item.restaurant_id}`}
                                        className={styles.resultLink}
                                    >
                                        <img src={image} alt={item.restaurant_사업장명} className={styles.resultImg} loading='lazy'/>
                                        <div className={styles.resultInfo}>
                                            <div className={styles.resultName}>{item.restaurant_사업장명}</div>
                                            {/* CategorySearch에서는 도로명주소가 아닌 업태구분명 사용 */}
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
            <div className={styles.rightPanel}
                style={{
                    // 드로어가 드래그 중이거나 최상단에 있을 때 지도를 비활성화
                    pointerEvents: (isMobileDrawer && (isDragging || Math.abs(currentY - minTranslate) < 5)) ? 'none' : 'auto',
                    // 드로어가 최상단에 있을 때 지도를 숨김
                    display: (isMobileDrawer && Math.abs(currentY - minTranslate) < 5) ? 'none' : 'block',
                    // 드로어가 최상단에 있을 때 지도를 absolute로 변경하여 공간 차지 안 함
                    position: (isMobileDrawer && Math.abs(currentY - minTranslate) < 5) ? 'absolute' : 'relative'  
                }}
            >
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
                    onSearchAtLocation={handleSearchAtLocation}
                    isReloading={isReloading}
                />
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