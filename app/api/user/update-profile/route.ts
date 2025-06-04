import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: '인증되지 않은 사용자입니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { nickname, gender, age, price, favorite_food } = body;

    // 백엔드 API 호출
    const response = await fetch(`${process.env.INTERNAL_BACKEND_URL}/user/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.id}`,
      },
      body: JSON.stringify({
        nickname,
        gender,
        age,
        price,
        favorite_food,
      }),
    });

    if (!response.ok) {
      throw new Error('프로필 업데이트 실패');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('프로필 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      { error: '프로필 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 