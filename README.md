# OMS Front (메시지 조회 웹 페이지)

OMS API 서버와 연동하는 메시지 이력 조회 웹 애플리케이션입니다.
React + TypeScript 기반 SPA로, JWT 인증 및 메시지 검색 기능을 제공합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| HTTP Client | Axios |
| Routing | React Router DOM v6 |
| Date Picker | react-datepicker + date-fns |

---

## 사전 조건

- Node.js 18 이상
- OMS API 서버 실행 중 (포트 8080)

---

## 실행 방법

```bash
# 1. 의존성 설치 (최초 1회)
npm install

# 2. 개발 서버 실행
npm run dev
```

브라우저에서 **http://localhost:5173** 접속

> OMS API 서버(포트 8080)가 먼저 실행되어 있어야 합니다.

### 두 서버 동시 실행 구조

```
터미널 1 (백엔드)
  cd oms
  ./gradlew bootRun          →  http://localhost:8080

터미널 2 (프론트엔드)
  cd oms_front
  npm run dev                →  http://localhost:5173
```

---

## 프로젝트 구조

```
oms_front/
├── src/
│   ├── api/
│   │   ├── client.ts        # axios 인스턴스 (JWT 인터셉터 설정)
│   │   ├── auth.ts          # 로그인/로그아웃 API 호출
│   │   └── messages.ts      # 메시지 조회 API 호출
│   ├── components/
│   │   ├── DateInput.tsx    # 텍스트 + 캘린더 날짜 입력 컴포넌트
│   │   ├── DateInput.css    # DateInput 스타일
│   │   └── PrivateRoute.tsx # 인증 가드 (비로그인 시 /login 리다이렉트)
│   ├── pages/
│   │   ├── LoginPage.tsx    # 로그인 페이지
│   │   └── MessagePage.tsx  # 메시지 조회 페이지
│   ├── types/
│   │   └── index.ts         # TypeScript 공통 타입 정의
│   ├── App.tsx              # 라우팅 설정
│   └── main.tsx
├── package.json
└── README.md
```

---

## 페이지 구성

### 로그인 페이지 `/login`

- userId, 비밀번호 입력 후 로그인
- 로그인 성공 시 JWT 토큰을 `localStorage`에 저장
- 이미 토그인 상태이면 `/messages`로 자동 이동

### 메시지 조회 페이지 `/messages`

- 비로그인 상태에서 접근 시 `/login`으로 자동 리다이렉트
- **검색 조건**: 시작일, 종료일 (필수), 메시지 유형, 상태, 수신번호 (선택)
- **결과 테이블**: ID, 제목, 내용(팝업), 유형, 상태, 수신번호, 발송시간, 결과
- **메시지 내용 팝업**: 💬 아이콘 클릭 시 제목·유형·본문 레이어 팝업 표시
- 상단 우측 로그아웃 버튼

---

## 날짜 입력 컴포넌트

텍스트 직접 입력과 캘린더 선택을 동시 지원합니다.

```
[ 20250101 ] [📅]
     ↑            ↑
  직접 입력    클릭 시 캘린더 팝업
```

- YYYYMMDD 형식으로 8자리 입력 완료 시 캘린더에 즉시 반영
- 캘린더에서 날짜 선택 시 텍스트 필드에 YYYYMMDD 형식으로 반영
- API 호출 시 내부적으로 YYYYMMDD 형식으로 전달

---

## 인증 흐름

```
1. POST /api/auth/login
   → 응답: { accessToken, userId, userType }
   → localStorage에 accessToken, userId 저장

2. 이후 모든 API 요청
   → axios 인터셉터가 자동으로 헤더 추가
   → Authorization: Bearer {accessToken}

3. 401 응답 수신 시
   → localStorage 토큰 자동 삭제
   → /login 페이지로 자동 리다이렉트

4. POST /api/auth/logout
   → 서버에 로그아웃 요청
   → localStorage 토큰 삭제
   → /login 페이지로 이동
```

---

## 테스트 계정

OMS API 서버 초기 데이터에 포함된 계정입니다.

| ID | 비밀번호 |
|----|---------|
| WEB_USER_01 | password1 |
| WEB_USER_02 | password2 |

> API 전용 계정(DEMO_USER, user_type=1)은 웹 로그인 불가

---

## API 연동 정보

- 백엔드 주소: `http://localhost:8080` (`src/api/client.ts`에서 변경 가능)
- CORS: 백엔드에서 전체 허용 설정됨

## 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```
