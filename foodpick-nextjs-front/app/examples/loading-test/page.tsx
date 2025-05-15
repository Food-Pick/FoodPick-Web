'use client';

import { useState } from 'react';
import MergedPhotoGallery from '@/app/components/MergedPhotoGallery';

export default function LoadingTestPage() {
  const [galleryKey, setGalleryKey] = useState(0);
  
  // 여러 테스트 이미지 URL 모음
  const testImages = [
    'https://blogfiles.naver.net/MjAyNTAyMTBfMTk4/MDAxNzA3NTAzMTc2MzMz.1c8rJejNR1tGBsY3FTGTbdgxWDuCpVZyADYg.WafiB1DRVHQabrPwWmAMTlWu47Mhyja13OoKx0ct-sRgg.JPEG/KakaoTalk_20250210_144844986_07.jpg',
    'https://blogfiles.pstatic.net/MjAyMzEyMDFfMjcw/MDAxNzAxNDIxNTUyMzMw.RGngvQkl7dPLJUcE3XhD_JhOMCWyDJzgLX5KlzkwqDog.nJsb1XVOI9x-2K3FXbF5a3Kgqn1k5zBCvOGz_XWNAxYg.JPEG/IMG_8057.jpg',
    '/images/mongshim1.jpg',
    '/images/mongshim2.jpg',
    '/images/mongshim3.jpg',
    'https://i.pinimg.com/originals/51/82/ac/5182ac536727d576c78a9320ac62b401.jpg',
    'https://images.unsplash.com/photo-1682686580950-960d1d513532',
    'https://plus.unsplash.com/premium_photo-1701455857476-7af480abd0e3',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    'https://images.unsplash.com/photo-1705610847478-d53a863c4424',
    'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0',
    // 존재하지 않는 URL도 추가하여 에러 처리 테스트
    'https://example.com/non-existent-image.jpg',
    'https://invalid-url-for-testing.com/image.png'
  ];

  const handleReset = () => {
    setGalleryKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">이미지 로딩 테스트</h1>
      <p className="mb-4">
        이 페이지는 MergedPhotoGallery 컴포넌트에서의 이미지 로딩 상태를 테스트합니다.
        외부 이미지, 로컬 이미지, 그리고 존재하지 않는 이미지를 함께 표시합니다.
      </p>
      
      <button 
        onClick={handleReset}
        className="mb-8 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        갤러리 리셋 (로딩 상태 테스트)
      </button>
      
      <div className="mt-4">
        <MergedPhotoGallery key={`gallery-${galleryKey}`} photos={testImages} />
      </div>
    </div>
  );
} 