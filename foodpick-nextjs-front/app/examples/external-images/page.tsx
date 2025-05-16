'use client';

import { useState } from 'react';
import ProxiedImage from '../../components/ProxiedImage';

export default function ExternalImagesExample() {
  const [imageUrl, setImageUrl] = useState('');
  const [testImages, setTestImages] = useState<string[]>([]);

  const addImage = () => {
    if (imageUrl && !testImages.includes(imageUrl)) {
      setTestImages([...testImages, imageUrl]);
      setImageUrl('');
    }
  };

  // 테스트용 네이버 이미지 몇 개 (실제로는 네이버 이미지 정책에 따라 사용해야 함)
  const exampleImages = [
    'https://blogfiles.naver.net/MjAyNTAyMTBfMTk4/MDAxNzA3NTAzMTc2MzMz.1c8rJejNR1tGBsY3FTGTbdgxWDuCpVZyADYg.WafiB1DRVHQabrPwWmAMTlWu47Mhyja13OoKx0ct-sRgg.JPEG/KakaoTalk_20250210_144844986_07.jpg',
    'https://blogfiles.pstatic.net/MjAyMzEyMDFfMjcw/MDAxNzAxNDIxNTUyMzMw.RGngvQkl7dPLJUcE3XhD_JhOMCWyDJzgLX5KlzkwqDog.nJsb1XVOI9x-2K3FXbF5a3Kgqn1k5zBCvOGz_XWNAxYg.JPEG/IMG_8057.jpg'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">외부 이미지 프록시 예제</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">이미지 추가</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="이미지 URL 입력"
            className="flex-1 p-2 border border-gray-300 rounded"
          />
          <button
            onClick={addImage}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            추가
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 mb-6">
          {exampleImages.map((url, index) => (
            <div key={`example-${index}`} className="border border-gray-200 p-2 rounded">
              <p className="text-sm mb-2 break-words">{url}</p>
              <button
                onClick={() => setTestImages([...testImages, url])}
                className="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                이 이미지 추가
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">테스트 이미지</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testImages.map((url, index) => (
            <div key={index} className="border rounded overflow-hidden">
              <div className="h-64 relative">
                <ProxiedImage
                  src={url}
                  alt={`테스트 이미지 ${index + 1}`}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="p-2 bg-gray-50">
                <p className="text-sm break-words">{url}</p>
              </div>
            </div>
          ))}
          
          {testImages.length === 0 && (
            <p className="col-span-2 text-gray-500 text-center py-8">
              추가된 이미지가 없습니다. 위에서 이미지 URL을 입력하여 추가해 주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 