# Node.js 20 사용
FROM node:20

# 작업 디렉토리 설정
WORKDIR /app

# 엔트리포인트 복사
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Next.js 개발 포트
EXPOSE 3000

# 실행
ENTRYPOINT ["/entrypoint.sh"]
