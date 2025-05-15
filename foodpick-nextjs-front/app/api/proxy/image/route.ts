import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // URL 파라미터에서 이미지 URL 가져오기
    const imageUrl = request.nextUrl.searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: '이미지 URL이 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 이미지 가져오기
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `이미지를 가져오는데 실패했습니다: ${imageResponse.status}` },
        { status: imageResponse.status }
      );
    }

    // 원본 이미지의 응답 헤더와 본문 가져오기
    const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream';
    const imageBuffer = await imageResponse.arrayBuffer();

    // 새 응답 객체 생성
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });

    return response;
  } catch (error) {
    console.error('이미지 프록시 오류:', error);
    return NextResponse.json(
      { error: '이미지 프록시 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// GET 이외의 모든 HTTP 메서드에 대한 처리
export async function POST() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 