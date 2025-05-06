# foodpick-web

**FoodPick** 캡스톤디자인 프로젝트의 웹 프론트엔드 저장소입니다.

협업시 환경셋업의 편리성을 위하여 Next.js 기반의 프로네젝트를 
Docker 환경에서 자동 생성/실행되도록 구성했습니다.

---

## 🧱 기술 스택

- **Next.js 15.3**
- **React 18**
- **Node.js 20**
- **Docker / Docker Compose**

---

## ⚙️ 프로젝트 구조

```text
foodpick-web/
├── docker-compose.yml
├── foodpick-nextjs-front/
└── scaffold/
    ├── Dockerfile
    └── entrypoint.sh
```
 - docker-compose.yml: 전체 개발 환경 컨트롤
 - foodpick-nextjs-front/: 실제 Next.js 프로젝트가 생성되는 위치
 - scaffold/: Dockerfile 및 entrypoint 스크립트 보관

---

## ✅ 특징

foodpick-nextjs-front/ 디렉토리가 비어 있어도, 프로젝트 최상위 위치에서

```bash
docker compose up 
```

한 번으로 Next.js 15.3 프로젝트가 자동 생성됩니다.

로컬에 Node.js나 npm이 설치되어 있지 않아도 실행 가능

package.json이 존재하면 자동 생성은 생략하고 바로 실행합니다.

---

## 📌 주의

scaffold/는 Docker 실행을 위한 파일만 포함하며, 실제 앱 코드는 foodpick-nextjs-front/에 생성됩니다.

첫 커밋 이후에는 .next, node_modules 등은 .gitignore로 제외해주세요.
