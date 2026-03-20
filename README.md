# 🎁 랜덤 선물 뽑기 (Random Gift Draw)

코인을 사용해 랜덤으로 선물을 뽑고, 원하는 선물을 조르거나 관리자가 이를 제어할 수 있는 귀엽고 인터랙티브한 웹 애플리케이션입니다.

## ✨ 주요 기능

- **🎁 랜덤 뽑기 (Home)**: 모은 코인을 1개 소모하여 등록된 상품 중 하나를 랜덤으로 뽑습니다. 당첨 시 화려한 폭죽 애니메이션을 볼 수 있습니다.
- **✨ 새 쿠폰 조르기 (Suggest)**: 유저가 원하는 상품(예: 가방 사주기, 맛있는 거 사주기 등)을 직접 입력해 관리자에게 추가해 달라고 요청할 수 있습니다.
- **👑 전용 관리자 (Admin)**: 
  - 비밀번호(기본: `1234`)를 통해 접근할 수 있습니다.
  - 유저의 **코인 보유량**을 관리(지급 및 차감)할 수 있습니다.
  - 조르기 목록을 확인하고 **수락(등록)** 또는 **기각**할 수 있습니다.
  - 이제까지 누가 언제 무엇을 뽑았는지 **당첨 기록**을 조회할 수 있습니다.
- **💅 프리미엄 UI/UX**: 애니메이션 그라디언트 배경, 글래스모피즘(Glassmorphism) 효과, 호버 애니메이션 등이 적용된 화사하고 세련된 인터페이스를 제공합니다.

---

## 🛠 기술 스택

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router 기반)
- **Frontend**: React, Vercel Geist Font, `canvas-confetti` (폭죽 효과)
- **Styling**: 전용 순수 CSS (CSS Variables, Animations, Backdrop Filter)
- **Database**: SQLite (파일 기반 로컬 DB)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Deployment**: 멀티스테이지 Docker 빌드 (Standalone)

---

## 🚀 로컬 환경에서 실행하기

### 1️⃣ 필수 조건
- Node.js (v18 이상 권장)
- npm 혹은 pnpm, yarn

### 2️⃣ 설치 및 실행
```bash
# 의존성 설치
npm install

# Prisma 데이터베이스 스키마 푸시 (dev.db 자동 생성)
npx prisma db push

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속하여 사용할 수 있습니다.

---

## 🐳 Docker로 배포하기

이 프로젝트는 Docker 컨테이너 한 개로 손쉽게 배포할 수 있도록 `Dockerfile`이 구성되어 있습니다. Next.js의 `standalone` 출력 모드를 사용하여 빌드 용량이 최적화됩니다.

### 1️⃣ 이미지 빌드하기
```bash
docker build -t random-gift-app .
```

### 2️⃣ 컨테이너 실행하기
```bash
docker run -p 3000:3000 random-gift-app
```
> **데이터 영구 보존(Volume Mount)**: <br/> 
> 컨테이너가 삭제되어도 DB(코인 기록, 상품 목록 등)를 유지하려면 아래와 같이 볼륨을 마운트하여 실행하세요.
> ```bash
> docker run -p 3000:3000 -v gift-data:/app/prisma random-gift-app
> ```

---

## 📁 프로젝트 주요 구조

```text
├── app/
│   ├── admin/          # 관리자 페이지 (/admin)
│   ├── api/            # 코인, 아이템 조회/생성/조작 및 뽑기 처리를 위한 API Routes
│   ├── suggest/        # 상품 조르기 페이지 (/suggest)
│   ├── globals.css     # UI 기본 및 디자인 시스템 CSS 파일
│   ├── layout.js       # 앱 전체 레이아웃 (배경 파티클 효과 포함)
│   └── page.js         # 메인 뽑기 화면 (Home)
├── prisma/
│   ├── schema.prisma   # 데이터베이스 스키마 정의 (User, Item, History)
│   └── dev.db          # SQLite 로컬 DB 파일 (로컬 실행 시 생성됨)
├── lib/
│   └── prisma.js       # Prisma Client 전역 객체
├── Dockerfile          # 멀티스테이지 도커 환경 구축 매뉴얼
├── next.config.mjs     # Next.js 설정 (Standalone 빌드 적용 등)
└── package.json        # 프로젝트 의존성 관리
```
