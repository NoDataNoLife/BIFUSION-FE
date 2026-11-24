# BIFUSION Frontend

소량 생의학(Biomedical) 이미지의 데이터 증강(Augmentation), Few-shot 분류 모델 학습(Training), 추론(Inference) 및 레시피·커뮤니티 공유를 지원하는 웹 플랫폼 **BIFUSION**의 프론트엔드 저장소입니다.

---

## 1. 주요 기능

- **프로젝트 및 데이터셋 관리**: 작업 단위 프로젝트 생성, 데이터셋 업로드 및 자산(Asset) 상태 조회
- **AI 작업 워크플로 실행**: 이미지 증강·학습·추론 파라미터 설정, 작업 요청 및 실시간 상태 폴링(`useJobPolling`)
- **작업 결과 확인 및 예외 분리**: 완료 산출물 다운로드·미리보기 제공, 네트워크/조회 오류와 실제 ML 작업 실패 상태 분리 표시
- **레시피 및 전문가 검수 커뮤니티**: 실험 설정 레시피 공유·복제(Fork) 및 검수 피드백 조회

---

## 2. 기술 스택

- **Core**: React 19, TypeScript 5.9, Vite 7
- **Routing**: React Router v7
- **State & Data Fetching**: Zustand v5, TanStack Query v5, Axios
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Deployment**: Vercel (`vercel.json` 리라이트 구성)

---

## 3. 디렉토리 구조

```text
BIFUSION-FE/
├── src/
│   ├── components/       # 공통 UI 및 작업 설정·결과 표시 컴포넌트
│   ├── hooks/            # 작업 상태 폴링(useJobPolling) 등 커스텀 훅
│   ├── lib/              # Axios 클라이언트 및 API 호출 모듈
│   ├── pages/            # 대시보드, 프로젝트, 데이터셋, 커뮤니티 등 라우트 화면
│   ├── store/            # 인증 및 AI 작업 상태(useJobStore) 관리 스토어
│   ├── types/            # API 입출력 및 도메인 타입 정의
│   ├── App.tsx           # 라우터 및 전역 프로바이더 설정
│   └── main.tsx          # 애플리케이션 진입점
├── tests/                # Node 내장 테스트 러너 기반 AI 워크플로 검증 테스트
├── package.json
└── vite.config.ts
```

---

## 4. 실행 및 테스트 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 워크플로 단위 테스트 실행
npm test
```
