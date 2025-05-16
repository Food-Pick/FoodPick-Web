#!/bin/sh

echo "🚀 컨테이너 시작"

ls -alF
cd /app

# Next.js 프로젝트가 없으면 자동 생성
if [ ! -f package.json ]; then
  echo "📦 Next.js 15.3 프로젝트 생성 중..."
  npx create-next-app@15.3.0 . --use-npm --yes
else
  echo "✅ 기존 Next.js 프로젝트가 감지되었습니다."
  # 의존성 설치
  echo "📦 의존성 설치 중..."
  npm install --yes
fi

echo "🔍 Verifying POLLING environment variables:"
echo "WATCHPACK_POLLING=${WATCHPACK_POLLING}"
echo "CHOKIDAR_USEPOLLING=${CHOKIDAR_USEPOLLING}"

if [ "$NODE_ENV" = "production" ]; then
    echo "Production mode: Building and starting Next.js..."
    npm run build
    npm run start
else
    echo "Development mode: Starting Next.js..."
    npm run dev
fi 