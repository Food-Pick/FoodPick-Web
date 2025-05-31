// app/components/SearchResultMap.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { divIcon, LatLng } from 'leaflet';
import styles from './SearchResultMap.module.css';

interface MarkerData {
    lat: number;
    lng: number;
    name: string;
    imageUrl: string;
}

interface SearchResultMapProps {
    markers: MarkerData[];
    highlightedMarker?: MarkerData;
    onMarkerHover: (marker: MarkerData | null) => void;
    onSearchAtLocation?: (lat: number, lng: number) => void;
    isReloading?: boolean;
}

const createCircleIcon = (isHighlighted: boolean) => {
    const size = isHighlighted ? 24 : 18;
    return divIcon({
        className: 'custom-marker',
        html: `<div style="
            width: ${size}px;
            height: ${size}px;
            background-color: ${isHighlighted ? '#ff0000' : '#ff6b00'};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size/2, size/2],
    });
};

// 지도 이동을 위한 컴포넌트
function MapController({ highlightedMarker, onSearchAtLocation }: { highlightedMarker?: MarkerData; onSearchAtLocation?: (lat: number, lng: number) => void }) {
    const map = useMap();
    const [showSearchButton, setShowSearchButton] = useState(false);

    useEffect(() => {
        if (highlightedMarker) {
            const markerLatLng = new LatLng(highlightedMarker.lat, highlightedMarker.lng);
            const bounds = map.getBounds();
            const currentZoom = map.getZoom();
            
            // 마커가 현재 지도 영역 밖에 있는지 확인
            if (!bounds.contains(markerLatLng)) {
                // 먼저 지도를 축소
                map.setZoom(currentZoom - 2, {
                    animate: true,
                    duration: 0.5
                });

                // 축소 애니메이션이 끝난 후 마커 위치로 이동
                setTimeout(() => {
                    map.setView(markerLatLng, currentZoom - 2, {
                        animate: true,
                        duration: 0.5
                    });

                    // 이동이 끝난 후 원래 축척으로 복귀
                    setTimeout(() => {
                        map.setZoom(currentZoom, {
                            animate: true,
                            duration: 0.5
                        });
                    }, 500);
                }, 500);
            } else {
                // 마커가 보이는 영역 안에 있더라도 정중앙으로 이동
                map.setView(markerLatLng, currentZoom, {
                    animate: true,
                    duration: 0.5
                });
            }
        }
    }, [highlightedMarker, map]);

    // 지도 이동이 끝난 후 검색 버튼 표시
    useEffect(() => {
        const handleMoveEnd = () => {
            setShowSearchButton(true);
        };

        map.on('moveend', handleMoveEnd);
        return () => {
            map.off('moveend', handleMoveEnd);
        };
    }, [map]);

    const handleSearchClick = () => {
        const center = map.getCenter();
        console.log('지도 중앙 좌표:', {
            위도: center.lat,
            경도: center.lng,
            줌레벨: map.getZoom()
        });
        onSearchAtLocation?.(center.lat, center.lng);
        setShowSearchButton(false);
    };

    return (
        <>
            {showSearchButton && onSearchAtLocation && (
                <div className={styles.searchButtonContainer}>
                    <button 
                        className={styles.searchButton}
                        onClick={handleSearchClick}
                    >
                        이 위치에서 다시 검색하기
                    </button>
                </div>
            )}
        </>
    );
}

export default function SearchResultMap({ markers, highlightedMarker, onMarkerHover, onSearchAtLocation, isReloading = false }: SearchResultMapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const markerRefs = useRef<{ [key: string]: any }>({});

    // 한반도 주변의 경계 설정
    const maxBounds: [number, number][] = [
        [32.0, 122.0],  // 남서쪽 경계 (제주도 남쪽, 동해 서쪽)
        [43.0, 132.0]   // 북동쪽 경계 (백두산 북쪽, 동해 동쪽)
    ] as [number, number][];

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (highlightedMarker) {
            const markerKey = `${highlightedMarker.lat}-${highlightedMarker.lng}`;
            const markerRef = markerRefs.current[markerKey];
            if (markerRef) {
                markerRef.openPopup();
            }
        }
    }, [highlightedMarker]);

    if (!isMounted || isReloading) {
        return <div style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0' }} />;
    }

    const center: [number, number] = markers[0] ? [markers[0].lat, markers[0].lng] : [36.35, 127.38];

    return (
        <MapContainer 
            center={center} 
            zoom={16} 
            minZoom={6}
            maxZoom={18}
            maxBounds={maxBounds}  // 이동 범위 제한
            maxBoundsViscosity={1.0}  // 경계를 벗어나지 않도록 강제
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController 
                highlightedMarker={highlightedMarker} 
                onSearchAtLocation={onSearchAtLocation}
            />
            {markers.map((marker, index) => {
                const markerKey = `${marker.lat}-${marker.lng}`;
                return (
                    <Marker
                        key={index}
                        position={[marker.lat, marker.lng]}
                        icon={createCircleIcon(!!highlightedMarker && marker.lat === highlightedMarker.lat && marker.lng === highlightedMarker.lng)}
                        eventHandlers={{
                            mouseover: () => onMarkerHover(marker),
                            mouseout: () => onMarkerHover(null)
                        }}
                        ref={(ref) => {
                            if (ref) {
                                markerRefs.current[markerKey] = ref;
                            }
                        }}
                    >
                        <Popup>
                            <div style={{ 
                                width: '200px',
                                padding: '0',
                                margin: '0',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <div style={{ 
                                    width: '100%',
                                    height: '120px',
                                    overflow: 'hidden'
                                }}>
                                    <img 
                                        src={marker.imageUrl} 
                                        alt={marker.name} 
                                        style={{ 
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }} 
                                    />
                                </div>
                                <div style={{ 
                                    padding: '12px',
                                    background: '#fff'
                                }}>
                                    <h3 style={{ 
                                        margin: '0 0 8px 0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#333'
                                    }}>
                                        {marker.name}
                                    </h3>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}