# S3 Presigned URL 이미지 깨짐 (엑스박스) 트러블슈팅

## 🚨 이슈 현상

백엔드의 S3 객체 접근 방식이 **Presigned URL 방식**으로 전환(Commit #99)된 이후, 마이페이지 헤더와 사이드바 등 특정 컴포넌트에서 유저 프로필 이미지가 엑스박스로 깨져서 노출되는 현상이 발생했습니다. (반면 프로젝트 카드의 유저 프로필은 정상적으로 노출됨)

## 🔍 원인 분석

문제의 원인은 프론트엔드에서 이미지 URL의 특수문자나 한글을 안전하게 변환하기 위해 사용하던 `safeEncodeUrl` 유틸리티 함수에 있었습니다.

1. **AWS S3 Presigned URL의 구조**
   - 백엔드가 반환하는 Presigned URL에는 `X-Amz-Signature`를 비롯한 AWS 인증 정보(암호화된 긴 문자열 및 쿼리 파라미터)가 완벽하게 URL 인코딩된 상태로 포함되어 있습니다.

2. **`safeEncodeUrl` 함수의 오작동**
   - `safeEncodeUrl`은 입력받은 URL을 `decodeURI`로 한 번 푼 다음 `encodeURI`로 다시 감싸는 로직이었습니다.
   - 이 과정에서 AWS가 정교하게 암호화하여 발급한 Signature 안의 특정 기호(예: `+`, `=` 등)가 디코딩/인코딩을 거치면서 AWS가 원래 기대하던 문자열 값과 미세하게 달라지는 현상이 발생했습니다.
   - 결과적으로 AWS S3 서버는 서명(Signature) 불일치로 간주하여 접근 권한 거부(`403 Forbidden`) 에러를 뱉고 이미지를 차단했습니다.

3. **프로젝트 카드에서만 정상 노출된 이유**
   - `ProjectCard.tsx` 컴포넌트에서는 `member.avatar` 값을 렌더링할 때 `ImageWithFallback`이나 `safeEncodeUrl`을 거치지 않고 순정 상태의 URL을 `<img src...>`에 직접 꽂아 넣었기 때문에 에러를 피할 수 있었습니다.

## 🛠️ 해결 방법 (Fix)

`safeEncodeUrl` 함수 내부에 **예외 처리(Bypass)** 로직을 추가했습니다.

**[변경 전]**

```typescript
const safeEncodeUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('/') || url.startsWith('data:')) return url;
  // ... 생략
```

**[변경 후]**

```typescript
const safeEncodeUrl = (url?: string): string => {
  if (!url) return '';
  // URL에 AWS 서명이 포함되어 있다면 인코딩을 건너뛰고 그대로 반환!
  if (url.startsWith('/') || url.startsWith('data:') || url.includes('X-Amz-Signature')) return url;
  // ... 생략
```

### ✅ 결과

이 패치를 통해 백엔드에서 생성해 준 Presigned URL이 프론트엔드에서 절대 훼손되지 않음이 보장되며, 모든 컴포넌트에서 이미지가 정상적으로 출력됩니다.
