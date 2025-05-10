# Node.js 20 사용
FROM node:20

# 한글 언어 패키지 설치 및 설정
RUN apt-get update && apt-get install -y locales && \
    localedef -i ko_KR -c -f UTF-8 -A /usr/share/locale/locale.alias ko_KR.UTF-8
ENV LANG=ko_KR.UTF-8
ENV LANGUAGE=ko_KR:ko
ENV LC_ALL=ko_KR.UTF-8

# 작업 디렉토리 설정
WORKDIR /app

# 엔트리포인트 복사
COPY scaffold/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Next.js 개발 포트
EXPOSE 3000

# 실행
ENTRYPOINT ["/entrypoint.sh"]
