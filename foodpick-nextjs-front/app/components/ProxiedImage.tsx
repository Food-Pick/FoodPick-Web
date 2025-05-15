'use client';

import Image from 'next/image';
import { getProxiedImageUrl } from '../utils/imageProxy';
import { useState, useEffect, useRef } from 'react';

interface ProxiedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  initialLoaded?: boolean;
  onImageLoad?: () => void;
}

export default function ProxiedImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
  fill,
  style,
  fallbackSrc = '/images/background.png',
  initialLoaded = false,
  onImageLoad,
}: ProxiedImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!initialLoaded);
  const imgSrcRef = useRef(src);
  const proxiedSrc = error ? fallbackSrc : getProxiedImageUrl(src);

  // 이미지 소스가 변경되면 로딩 상태 초기화
  useEffect(() => {
    // 이미지 URL이 변경된 경우에만 로딩 상태 업데이트
    if (imgSrcRef.current !== src) {
      imgSrcRef.current = src;
      
      if (!initialLoaded) {
        setLoading(true);
        setError(false);
      } else {
        setLoading(false);
      }
    } else if (initialLoaded && loading) {
      // 같은 이미지인데 이미 로드됨으로 표시된 경우 로딩 끝내기
      setLoading(false);
    }
  }, [src, initialLoaded, loading]);

  const handleImageLoad = () => {
    setLoading(false);
    if (onImageLoad) {
      onImageLoad();
    }
  };

  return (
    <div className="relative" style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : '100%' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-full max-w-[60%]">
            <div className="h-2 bg-gray-300 rounded-full mb-2 animate-pulse"></div>
            <div className="h-2 bg-gray-300 rounded-full mb-2 w-3/4 animate-pulse"></div>
            <div className="h-2 bg-gray-300 rounded-full w-1/2 animate-pulse"></div>
          </div>
        </div>
      )}
      <Image
        src={proxiedSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className || ''} ${loading ? 'opacity-0' : 'opacity-100 transition-opacity duration-200'}`}
        priority={priority}
        fill={fill}
        style={style}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoad={handleImageLoad}
        unoptimized={!src.startsWith('/')} // 외부 이미지는 Next.js의 이미지 최적화를 사용하지 않음
      />
    </div>
  );
}