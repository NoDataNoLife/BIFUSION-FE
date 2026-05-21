# BIFUSION Frontend Implementation Roadmap

이 문서는 BIFUSION 프로젝트의 프론트엔드 개발 현황 및 향후 이식/구현 과제를 관리합니다.

## 1. 초기 환경 설정 (Base Setup) ✅

- [x] shadcn/ui 및 Tailwind CSS v4 환경 구축
- [x] Zustand 기반 인증 상태 관리 (`useAuthStore`)
- [x] React Router 기반 URL 중심 라우팅 구조 확립
- [x] ProtectedRoute를 통한 대시보드 보안 적용

## 2. 대시보드 인프라 및 레이아웃 ✅

- [x] 사이드바 및 네비게이션 역할 분리
- [x] 알림 센터(`NotificationCenter`) 구현 및 통합
- [x] 테마 전환 (Dark/Light Mode) 기초 구현

## 3. 핵심 페이지 이식 현황 및 보완 과제 (Progress: 90%) 🛠️

### 3.1 프로젝트 관리 (`ProjectsPage`, `ProjectDetail`)

- [x] 프로젝트 목록 및 상세 작업 리스트 UI 이식
- [ ] **[미비]** '새 프로젝트 생성' 모달 및 로직 구현 (현재 미작동)
- [ ] **[미비]** 프로젝트 검색 및 필터링(즐겨찾기, 담당자 등) 실제 필터 로직 연결
- [ ] **[미비]** 프로젝트 설정(이름 수정, 삭제 등) 모달 이식

### 3.2 AI 워크플로우 (`Augment`, `Train`, `Inference`)

- [x] 3단계 워크플로우(Setup, Progress, Result) UI 및 라우팅 이식 완료
- [ ] **[미비]** 파일 업로드 시 실제 미리보기 및 드래그 앤 드롭 정교화
- [ ] **[미비]** 결과 페이지의 시각화 도구(차트, 임베딩 맵) 실제 라이브러리(Recharts 등) 검토

### 3.3 커뮤니티 및 자산 (`CommunityPage`, `AssetsPage`)

- [x] 레시피/데이터셋 상세 페이지 이식
- [ ] **[미비]** 커뮤니티 통합 검색 및 카테고리 필터링 로직 완성
- [ ] **[미비]** 무한 스크롤 로딩 최적화 (데이터 중복 방지 로직)

### 3.4 프로필 및 설정 (`ProfilePage`)

- [x] 프로필 정보 편집 및 통계 레이아웃 이식 (프로토타입 구조 준수)
- [ ] **[미비]** 전문가 인증 신청 프로세스 고도화 (서류 업로드 상태 저장)
- [ ] **[미비]** '고정 프로젝트 관리' 모달 및 공개 여부 토글 로직 실제 연결

## 4. 랜딩 페이지 고도화 (Progress: 60%) 🎨

- [x] 메인 Hero 섹션 및 기본 Navbar 정제
- [ ] **[미비]** `PricingSection` (요금제) 정교한 이식
- [ ] **[미비]** `FeaturesGrid` 및 `HowItWorks` 섹션 분리 및 이식
- [ ] **[미비]** `TeamSection` 및 `AboutUs` 페이지 완성

## 5. 시스템 통합 및 최적화 (Future) 🚀

- [ ] **API 연동**: Mock 데이터를 실제 Axios/React Query 연동으로 교체
- [ ] **에러 핸들링**: 전역 에러 바운더리 및 API 에러 인터셉터 강화
- [ ] **성능 최적화**: 이미지 Lazy Loading 및 컴포넌트 코드 스플리팅
- [ ] **모바일 최적화**: 반응형 레이아웃 최종 점검

---
*마지막 업데이트: 2026-04-03*
