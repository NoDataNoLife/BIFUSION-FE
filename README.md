# BIFUSION-FE 초기 환경 세팅 및 트러블슈팅 로그

이 문서는 프로젝트의 초기 스타일 시스템(Tailwind CSS v4 + shadcn/ui 기반) 구축 과정과 발생했던 주요 이슈 및 해결 방법을 기록합니다.

## 1. 프로젝트 개요
- **목적**: Biffusion 브랜드 가이드를 기반으로 한 프론트엔드 환경 구축
- **핵심 기술 스택**: React, Vite, TypeScript, Tailwind CSS v4, shadcn/ui

## 2. 디자인 가이드 반영 (Brand Assets)
가이드에서 추출한 핵심 자산을 시스템에 등록했습니다.

### 브랜드 컬러
- **Primary (Orange)**: `#E68A00` (Biffusion 로고 메인 컬러)
- **Secondary (Dark Gray)**: `#434D5A` (텍스트 및 서브 컬러)
- **Accent (Brown)**: `#8D5A00` (강조 컬러)

### 폰트 시스템
- **Main Sans**: `Inter` (가독성 위주)
- **Point/Retro**: `HBIOS-SYS` (도트 그래픽 느낌의 시스템 폰트)

---

## 3. 세팅 과정 및 트러블슈팅

### 이슈 1: Tailwind CSS v4 도입 및 PostCSS 충돌
**상황**: `npx tailwindcss init -p` 실행 시 에러 발생 및 `tailwindcss`를 직접 PostCSS 플러그인으로 사용할 수 없다는 경고 노출.
**원인**: 최신 Tailwind CSS v4는 기존 v3와 달리 전용 PostCSS 패키지(`@tailwindcss/postcss`)를 요구함.

**해결**:
1. 패키지 설치: `npm install -D @tailwindcss/postcss`
2. `postcss.config.js` 수정:
   ```javascript
   export default {
     plugins: {
       "@tailwindcss/postcss": {}, // v4 전용 플러그인 적용
       autoprefixer: {},
     },
   }
   ```

### 이슈 2: Unknown Utility Class `border-border` 에러
**상황**: `src/index.css`에서 `@apply border-border` 사용 시 "Cannot apply unknown utility class" 에러 발생.
**원인**: Tailwind v4는 CSS-First 방식으로 변경되어, `@theme` 블록 내에 정의되지 않은 변수를 `@apply`로 즉시 사용하는 방식에 제약이 있음.

**해결**:
`src/index.css`를 Tailwind v4의 `@theme` 문법으로 전면 개편하여 모든 변수를 통합 관리함.

---

## 4. 최종 설정 현황

### `src/index.css` (Tailwind v4 Theme)
모든 브랜드 컬러와 UI 변수를 CSS 내에서 직접 정의합니다.
```css
@import "tailwindcss";

@theme {
  --color-primary: #E68A00;
  --color-secondary: #434D5A;
  --color-accent: #8D5A00;
  
  --font-sans: "Inter", sans-serif;
  --font-hbios: "HBIOS-SYS", monospace;
  /* ... 기타 UI 변수 */
}
```

### UI 유틸리티 (`src/lib/utils.ts`)
shadcn/ui 및 동적 클래스 병합을 위한 `cn` 함수를 구성했습니다.
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## 5. 사용 방법
설정된 클래스를 통해 디자인 가이드를 즉시 적용할 수 있습니다.
- 배경색: `bg-primary`, `bg-secondary`
- 글자색: `text-primary`, `text-accent`
- 폰트: `font-sans`, `font-hbios`

---
*최종 업데이트: 2026-03-19*
