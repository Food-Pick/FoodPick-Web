// app/components/SearchResultMap.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from '@/styles/SearchResultMap.module.css';

interface MarkerProps {
    lat: number;
    lng: number;
    name: string;
    isHighlighted?: boolean;
}

// 커스텀 마커 아이콘 생성
const createCustomIcon = (isHighlighted: boolean = false) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${isHighlighted ? '#FF0000' : '#FF4B4B'};
            width: ${isHighlighted ? '32px' : '24px'};
            height: ${isHighlighted ? '32px' : '24px'};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${isHighlighted ? '14px' : '12px'};
            transition: all 0.3s ease;
        "></div>`,
        iconSize: [isHighlighted ? 32 : 24, isHighlighted ? 32 : 24],
        iconAnchor: [isHighlighted ? 16 : 12, isHighlighted ? 16 : 12],
        popupAnchor: [0, isHighlighted ? -16 : -12]
    });
};

export default function SearchResultMap({ 
    markers, 
    highlightedMarker 
}: { 
    markers: MarkerProps[], 
    highlightedMarker?: MarkerProps 
}) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
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
        );
    }

    const center = markers[0] ? [markers[0].lat, markers[0].lng] : [36.35, 127.38];
    return (
        <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((m, i) => {
                const isHighlighted = highlightedMarker && 
                    m.lat === highlightedMarker.lat && 
                    m.lng === highlightedMarker.lng;
                
                return (
                    <Marker 
                        key={i} 
                        position={[m.lat, m.lng]}
                        icon={createCustomIcon(isHighlighted)}
                    >
                        <Tooltip 
                            permanent={isHighlighted}
                            direction="top"
                            offset={[0, isHighlighted ? -16 : -10]}
                            opacity={0.9}
                            className={styles['custom-tooltip']}
                        >
                            {m.name}
                        </Tooltip>
                        <Popup>{m.name}</Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}