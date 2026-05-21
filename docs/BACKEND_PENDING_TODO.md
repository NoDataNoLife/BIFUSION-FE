# 백엔드 API 미비로 지연된 프론트엔드 연동 TODO 리스트

마이페이지 고도화 및 요금제 변경 연동 과정에서 백엔드 API 스펙 미지원으로 인해 보류 처리된 작업 목록입니다. 백엔드 팀의 API 수정 완료가 공유되면 이 문서를 토대로 남은 작업을 연동해 주세요.

---

## 1. 📷 프로필 이미지 복구 및 동기화 연동

### 🔍 발생한 백엔드 이슈

* 프로필 사진 수정 API(`PUT /api/v1/profile/image`)를 통해 이미지를 업로드하면 실제 S3 업로드 후 수정된 URL(`profileImageUrl`)을 정상 반환합니다.
* 하지만 **로그인 유저 정보 조회 API(`GET /api/v1/users/me`)** 및 **마이페이지 기본 정보 조회 API(`GET /api/v1/users/{userId}`)**의 응답 DTO(`UserResponse`, `MyPageBasicResponse`)에 `profileImageUrl` 필드가 누락되어 있습니다.
* 결과적으로 이미지 변경 후 페이지를 새로고침하거나 다른 페이지로 이동했다가 재진입하면 화면이 다시 기본 이미지(`/defaultUserProfile.png`)로 리셋되는 현상이 발생합니다.

### 📝 백엔드 요청 사항

* `GET /api/v1/users/me` 응답 `UserResponse` DTO에 `profileImageUrl` 필드 추가 요청.

* `GET /api/v1/users/{userId}` 응답 `MyPageBasicResponse` DTO에 `profileImageUrl` 필드 추가 요청.

### 🛠️ 프론트엔드 후속 작업

* **수정 대상 파일**: `src/store/useAuthStore.ts`
* **작업 상세**:
  * `fetchUser` 및 `fetchUserProfile` API 응답 매핑 로직에서 넘겨받은 `profileImageUrl`을 가져와 Zustand 스토어의 `user.profileImage` 상태를 복구하도록 수정합니다.
  * 관련 코드 위치:
    * [useAuthStore.ts:fetchUser](file:///home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAuthStore.ts#L225)
    * [useAuthStore.ts:fetchUserProfile](file:///home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAuthStore.ts#L248)

---

## 2. 👑 요금제(Plan) 정보 로그인 상태 연동

### 🔍 발생한 백엔드 이슈

* 요금제 변경 API(`PUT /api/v1/users/me/plan`)를 성공적으로 호출하면 사용자 요금제 등급(`BASIC`/`PRO`)이 변경됩니다.
* 그러나 **로그인 유저 정보 조회 API(`GET /api/v1/users/me`)**의 응답 데이터 `UserResponse` DTO에 유저의 현재 요금제 정보(`planType` 또는 `tier`)가 포함되어 있지 않습니다.
* 따라서 마이페이지에서 요금제를 성공적으로 변경하여 화면에 적용해 두더라도, **새로고침을 하거나 재로그인을 하면 상태가 다시 기본값(`BASIC`)으로 초기화**됩니다.

### 📝 백엔드 요청 사항

* `GET /api/v1/users/me` 응답 `UserResponse` DTO에 `planType` (또는 `tier`) 필드 추가 요청.

### 🛠️ 프론트엔드 후속 작업

* **수정 대상 파일**: `src/store/useAuthStore.ts`
* **작업 상세**:
  * `fetchUser` API 호출 성공 시 반환받은 `planType` 정보를 Zustand 스토어의 유저 상태에 바인딩합니다.

  ```typescript
  // src/store/useAuthStore.ts 내 fetchUser 예시
  set({
    user: {
      ...currentUser,
      ...userData,
      planType: userData.planType || 'BASIC' // 이 부분을 추가 연동
    }
  });
  ```

  * 관련 코드 위치:
    * [useAuthStore.ts:fetchUser](file:///home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAuthStore.ts#L225)

---

## 3. 🛡️ 전문가 인증 신청 상태(expertStatus) 로그인 상태 연동

### 🔍 발생한 백엔드 이슈

* 전문가 인증 신청 API(`POST /api/v1/users/me/expert`)를 호출하면 DB 내 `expert_application` 테이블에 신청이 생성되고 상태는 `PENDING`이 됩니다.
* 그러나 **로그인 유저 정보 조회 API(`GET /api/v1/users/me`)**의 응답 DTO `UserResponse`에 유저의 전문가 신청 상태(`expertStatus`)가 포함되어 있지 않고, 이를 개별 조회하는 API 역시 존재하지 않습니다.
* 따라서 전문가 인증 신청에 성공하여 로컬 상태가 `PENDING`이 되더라도, **새로고침을 하거나 재로그인을 하면 상태 정보가 소실되어 다시 신청 가능 화면**이 보여지게 됩니다.

### 📝 백엔드 요청 사항

* `GET /api/v1/users/me` 응답 `UserResponse` DTO에 `expertStatus` (NONE, PENDING, APPROVED, REJECTED) 필드 추가 요청.

### 🛠️ 프론트엔드 후속 작업

* **수정 대상 파일**: `src/store/useAuthStore.ts`
* **작업 상세**:
  * `fetchUser` API 호출 결과 반환되는 `expertStatus` 필드를 Zustand 스토어 유저 객체에 맵핑합니다.

  ```typescript
  // src/store/useAuthStore.ts 내 fetchUser 예시
  set({
    user: {
      ...currentUser,
      ...userData,
      expertStatus: userData.expertStatus || 'NONE' // 이 부분을 추가 연동
    }
  });
  ```

  * 관련 코드 위치:
    * [useAuthStore.ts:fetchUser](file:///home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAuthStore.ts#L225)
