/**
 * 외부 이미지 URL을 프록시 서버를 통해 접근할 수 있는 URL로 변환합니다.
 * 
 * @param originalUrl 원본 이미지 URL
 * @returns 프록시를 통한 이미지 URL
 */
export function getProxiedImageUrl(originalUrl: string): string {
  // 이미 로컬 경로인 경우 (상대 경로) 그대로 반환
  if (originalUrl?.startsWith('/')) {
    return originalUrl;
  }
  
  // 이미 프록시를 통과한 URL인 경우 그대로 반환
  if (originalUrl?.includes('/api/proxy/image')) {
    return originalUrl;
  }

  // URL이 undefined나 null인 경우 기본 이미지 반환
  if (!originalUrl) {
    return '/images/background.png';
  }
  
  // URL 인코딩
  const encodedUrl = encodeURIComponent(originalUrl);
  
  // 프록시 API를 통해 이미지 URL 생성
  return `/api/proxy/image?url=${encodedUrl}`;
} 