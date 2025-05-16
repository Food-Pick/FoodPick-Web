// app/components/SearchResultMap.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import styles from '../../styles/SearchResultMap.module.css';

interface MarkerData {
    lat: number;
    lng: number;
    name: string;
}

interface SearchResultMapProps {
    markers: MarkerData[];
    highlightedMarker?: MarkerData;
}

const customIcon = new Icon({
    iconUrl: '/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: '/images/marker-shadow.png',
    shadowSize: [41, 41]
});

const highlightedIcon = new Icon({
    iconUrl: '/images/marker-icon-highlighted.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: '/images/marker-shadow.png',
    shadowSize: [41, 41]
});

export default function SearchResultMap({ markers, highlightedMarker }: SearchResultMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div style={{ height: '100%', width: '100%', backgroundColor: '#f0f0f0' }} />;
    }

    const center: [number, number] = markers[0] ? [markers[0].lat, markers[0].lng] : [36.35, 127.38];

    return (
        <MapContainer center={center} zoom={16} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker, index) => (
                <Marker
                    key={index}
                    position={[marker.lat, marker.lng]}
                    icon={highlightedMarker && marker.lat === highlightedMarker.lat && marker.lng === highlightedMarker.lng ? highlightedIcon : customIcon}
                >
                    <Popup>
                        {marker.name}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}