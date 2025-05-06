#!/bin/sh

echo "🚀 컨테이너 시작"

# Next.js 프로젝트가 없으면 자동 생성
if [ ! -f package.json ]; then
  echo "📦 Next.js 15.3 프로젝트 생성 중..."
  npx create-next-app@15.3.0 . --use-npm --yes
else
  echo "✅ 기존 Next.js 프로젝트가 감지되었습니다."
fi

# 개발 서버 실행
npm run dev
