import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '1000';

    if (!lat || !lng) {
      return NextResponse.json(
        { error: '위도와 경도가 필요합니다.' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/restaurant/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );

    if (!response.ok) {
      throw new Error('API 요청 실패');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching nearby restaurants:', error);
    return NextResponse.json(
      { error: '주변 음식점을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 