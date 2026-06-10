# 📊 프론트엔드 - 백엔드 API 연동 현황 리포트

지금까지 프론트엔드와 백엔드를 연동하면서 작업한 내역, 스킵된(보류된) 내역, 그리고 그 이유를 명세에 기반하여 총정리했습니다. 불안해하실 필요 없습니다! 명세대로 연동된 부분과 백엔드 이슈로 보류된 부분이 명확히 나뉘어 있습니다.

---

## 1. 👤 마이페이지 & 유저 설정 (User API)

마이페이지와 계정 설정에 관련된 API들은 **"활동 탭"을 제외하고 모두 완벽하게 연동**되었습니다. 단, 3가지 기능은 연동에 성공했으나 백엔드의 조회(GET) 응답 데이터 누락으로 인해 새로고침 시 상태 유지가 안 되는 Blocker가 존재합니다.

### ✅ 연동 완료 (정상 작동)
* `GET /api/v1/users/me`: 내 정보 조회 (로그인 유지용)
* `GET /api/v1/users/{userId}`: 마이페이지 기본 정보 조회
* `PUT /api/v1/profile/nickname`: 닉네임 수정
* `PUT /api/v1/profile/introduction`: 소개글(Bio) 수정
* `PUT /api/v1/profile/location`: 위치 수정
* `PUT /api/v1/profile/website`: 웹사이트 수정
* `PUT /api/v1/profile/image`: 프로필 이미지 업로드 및 수정 (S3 연동 완료)
* `PATCH /api/v1/users/me/activities/visibility`: 활동 내역 공개/비공개 토글
* `PUT /api/v1/users/me/plan`: 요금제(BASIC/PRO) 변경
* `POST /api/v1/users/me/expert`: 전문가 인증 신청

### ⚠️ 연동은 완료되었으나 백엔드 이슈로 새로고침 시 리셋되는 항목
*(상세 내용은 `BACKEND_PENDING_TODO.md`에 기록 완료)*
* **프로필 이미지**: 정보 조회 API(`GET`) 응답에 `profileImageUrl` 필드가 없어 기본 이미지로 리셋됨.
* **요금제 상태**: 정보 조회 API(`GET`) 응답에 `planType` 필드가 없어 BASIC으로 리셋됨.
* **전문가 인증 상태**: 정보 조회 API(`GET`) 응답에 `expertStatus` 필드가 없어 PENDING 상태 유지가 안 됨.

### ❌ 보류 (백엔드 미구현)
* **내 활동(Activities) 조회**: 마이페이지의 '활동' 탭에 띄울 데이터를 조회하는 API가 백엔드에 존재하지 않아 Mock 데이터로 보류 중.

---

## 2. 🗂️ 프로젝트 관리 (Project API)

대시보드의 내 프로젝트 목록부터 프로젝트 생성, 멤버 관리, 초대 발송까지 핵심 기능 연동을 마쳤습니다.

### ✅ 연동 완료 (정상 작동)
* `GET /api/v1/projects`: 내 프로젝트(관리/참여) 목록 조회
* `POST /api/v1/projects`: 새 프로젝트 생성 (초기 CORS/Multipart 에러 해결 완료)
* `GET /api/v1/projects/{projectId}`: 프로젝트 상세 정보 조회
* `PATCH /api/v1/projects/{projectId}/visibility`: 프로젝트 공개 여부 변경
* `DELETE /api/v1/projects/{projectId}/members/{memberId}`: 팀원 추방
* `PATCH /api/v1/projects/{projectId}/members/{memberId}/role`: 팀원 권한 변경 (본인 권한 수정 방지 로직 적용 완료)
* `POST /api/v1/projects/{projectId}/invitations`: 이메일 초대장 발송

### ❌ 보류 (백엔드 API 및 구조적 누락)
* **프로젝트 삭제 (`DELETE /api/v1/projects/{projectId}`)**: 프로젝트 자체를 삭제하는 API가 백엔드에 **아예 존재하지 않습니다.** (팀원 추방 API만 있음). 따라서 DB에서 직접 삭제를 시도하실 경우 외래키 제약조건(`project_member` 참조 무결성) 에러가 발생합니다. (`BACKEND_PENDING_TODO.md` 5번 항목에 기록 완료)
* **프로젝트 초대 수락/거절 (`PATCH /api/v1/projects/{projectId}/invitations/{invitationId}`)**: 초대 수락/거절 API는 있으나, **나에게 온 초대 목록을 조회하는 GET API**가 없어 화면(알림 센터)에서 `invitationId`를 알 수 없음. 연동 보류. (`BACKEND_PENDING_TODO.md` 4번 항목 기록 완료)

---

## 3. 📝 결론 및 다음 단계

**💡 요약하자면:**
우리가 스킵한 기능들은 "연동을 대충 한 것"이 아니라, **"백엔드 API 스펙 누락 및 미구현(GET API 부재 등)"**으로 인해 프론트엔드에서 물리적으로 진행할 수 없어 `BACKEND_PENDING_TODO.md`에 정리해두고 전략적으로 넘어간 것들입니다. 그 외에 구현 가능한 명세는 100% 프론트엔드 코드에 반영해 두었습니다.

**🚀 다음으로 진행해야 할 작업 (진짜 남은 것):**
백엔드가 완벽하게 개발을 끝내놓은 **커뮤니티 도메인**입니다.
1. `GET /api/v1/community/datasets`: 데이터셋 목록 조회 및 검색/페이지네이션
2. `GET /api/v1/community/qna`: 전문가 Q&A 목록 조회 및 검색/페이지네이션
