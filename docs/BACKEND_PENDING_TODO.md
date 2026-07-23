# 백엔드 API 미비로 지연된 프론트엔드 연동 TODO 리스트

마이페이지 고도화 및 요금제 변경 연동 과정에서 백엔드 API 스펙 미지원으로 인해 보류 처리된 작업 목록입니다. 백엔드 팀의 API 수정 완료가 공유되면 이 문서를 토대로 남은 작업을 연동해 주세요.

---

## 1. 📷 [✅ 해결 완료] 프로필 이미지 복구 및 동기화 연동

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

---

## 2. 👑 [✅ 해결 완료] 요금제(Plan) 정보 로그인 상태 연동

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

---

## 3. 🛡️ [✅ 해결 완료] 전문가 인증 신청 상태(expertStatus) 로그인 상태 연동

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

---

## 4. ✉️ 나에게 온 프로젝트 초대 목록 조회 (GET) 연동

### 🔍 발생한 백엔드 이슈

* 프로젝트 초대 메일(`MailServiceImpl.sendInvitationMail`)이 발송될 때 본문은 단순 텍스트로 구성되며 `invitationId` 정보나 수락 URL을 포함하지 않습니다. (단순히 "로그인하여 확인하라"고 안내)
* 따라서 사용자가 웹에 로그인하면 **알림 센터**나 **내 프로젝트 목록** 화면 등에서 나에게 온(Pending 상태인) **초대 목록을 조회해오는 GET API**가 필요합니다.
* 하지만 현재 백엔드에는 알림 관련 엔드포인트(`NotificationController`)나, 내가 받은 초대를 조회하는 API(`GET /api/v1/users/me/invitations` 등)가 아예 없습니다.
* 그 결과, 초대 수락/거절 API(`PATCH /api/v1/projects/{projectId}/invitations/{invitationId}`)가 만들어져 있음에도 프론트엔드에서 `projectId`와 `invitationId`를 알 방법이 없어 버튼을 구현할 수 없습니다.

### 📝 백엔드 요청 사항

* 현재 로그인한 사용자가 받은 **대기 중(PENDING)인 프로젝트 초대 목록을 응답하는 GET API** 신규 개발 요청. (예: `GET /api/v1/users/me/invitations` 또는 `GET /api/v1/notifications`)
* 해당 API의 응답 스펙에는 반드시 `projectId`, `projectName`, `invitationId`, `inviterName`, `createdAt` 등의 정보가 포함되어야 합니다.

---

## 5. 🗑️ 프로젝트 삭제 (DELETE) API 부재

### 🔍 발생한 백엔드 이슈

* 현재 백엔드의 `ProjectController`를 확인한 결과, **프로젝트 자체를 삭제하는 API (`DELETE /api/v1/projects/{projectId}`) 자체가 존재하지 않습니다.** (팀원 추방 API만 존재함)
* 따라서 테스트 목적으로 생성된 프로젝트들을 지우기 위해 DB(PostgreSQL)에서 직접 `delete` 쿼리를 실행할 경우, `project_member` 등 연관 테이블의 참조 무결성(Foreign Key constraint)으로 인해 에러가 발생하고 있습니다.

### 📝 백엔드 요청 사항

* 프로젝트 삭제 기능 도입 여부 논의 및 **프로젝트 삭제 API (`DELETE /api/v1/projects/{projectId}`) 개발 요청**.
* DB 스키마 수정 시 `project_member`, `project_invitation` 등의 연관 테이블에 `ON DELETE CASCADE` 옵션을 설정하여 프로젝트 삭제 시 관련된 멤버/초대 정보도 함께 삭제되도록 조치 요망.\
