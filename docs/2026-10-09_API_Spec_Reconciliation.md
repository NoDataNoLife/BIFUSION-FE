# API 명세 대조 자료 · 기능별 상세

**기준일 · 2026년 10월 9일**  
[회의 준비 자료로 돌아가기](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/docs/2026-10-09_Integrated_Meeting_Brief.md)

사진의 그룹 합계는 **91개**입니다. 읽을 수 있는 **84개**를 대조했습니다. 데이터증강 1개·마이페이지 6개는 내용이 보이지 않아 판정하지 않았습니다.

**10월 9일 후속 수정:** 전문가 인증 주소, 알림 page 항목, 내 활동 빈 응답 처리를 반영했습니다. 실서버 검증은 별도입니다. [수정 상세](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/docs/2026-10-09_Quickfix_Followup.md)

**읽는 순서:** 각 기능에서 **현재 FE 판정 → 수정·남은 일 → 요청 규격**을 확인하세요.  
주소가 맞더라도 화면에서 사용하지 않거나 실제 결과 대신 예시를 보여주는 경우가 있습니다.

## 판정의 의미

| 표현 | 의미 |
|---|---|
| 화면·요청 연결 | 화면에 서버 요청 코드가 있습니다. 실서버 완료 판정은 별도입니다. |
| 부분 연결 | 일부 요청은 있지만 목록·저장·재조회 등 남은 흐름이 있습니다. |
| 규격 불일치 | 주소·요청 방식·항목·번호가 서버와 다릅니다. |
| 함수만 있음 / 미연동 | 요청 함수가 있어도 화면에서 사용하지 않거나 요청이 없습니다. |
| 예시 / 모의 실행 | 실제 결과 대신 고정 자료나 가짜 진행을 보여줍니다. |
| 기준 브랜치에 없음 | 현재 확인한 BE 기준 코드에서 구현을 찾지 못했습니다. |

FE는 화면, BE는 일반 서버, ML은 계산 서버입니다. API는 이들이 주고받는 통신 약속입니다.  
GET은 조회, POST는 생성·실행, PUT·PATCH는 수정, DELETE는 삭제 요청 방식입니다.  
`{projectId}` 같은 항목은 실제 번호로 바꿔야 합니다. `?page=0` 뒤의 값은 조회 조건입니다.  
‘사진 FE’는 첨부 명세의 이전 표시이고, ‘현재 FE’는 코드 대조 판정입니다.

## 기능 찾기

| 영역 | 대조 번호 | 개수 |
|---|---|---|
| [모델추론](#모델추론) | 1–3 | 3 |
| [모델학습](#모델학습) | 4–7 | 4 |
| [데이터증강](#데이터증강) | 8–12 | 5 |
| [프로젝트 설정](#프로젝트-설정) | 13–17 | 5 |
| [프로젝트 상세](#프로젝트-상세) | 18–25 | 8 |
| [알림](#알림) | 26–30 | 5 |
| [커뮤니티](#커뮤니티) | 31–51 | 21 |
| [전문가](#전문가) | 52–57 | 6 |
| [데이터관리](#데이터관리) | 58–68 | 11 |
| [내 프로젝트](#내-프로젝트) | 69–71 | 3 |
| [마이페이지](#마이페이지) | 72–78 | 7 |
| [로그인](#로그인) | 79–84 | 6 |

[CSV 비교표](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/docs/2026-10-09_API_Spec_Reconciliation.csv)는 기존 84행을 그대로 유지했습니다.

---

## 모델추론

### 01 · 완료된 학습 모델 목록

**현재 FE · 예시 목록**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
model-1/model-2 고정. BE 목록 구현 및 실제 model_id 연결 필요

**요청 방식 · GET**  
`/api/v1/projects/{projectId}/jobs?status=COMPLETED&type=TRAIN`

---

### 02 · 추론 시작

**현재 FE · 요청 코드·예시 전환**  
BE: BE 연결부 없음 · 사진 FE: 시작 전

**수정·남은 일**  
사진 내용 없이 장수만 전송. 실패하면 모의 성공. 명세 POST /jobs/inference와도 다름

**요청 방식 · 미확정**  
FE: POST /api/v1/projects/{projectId}/jobs; ML: POST /api/v1/inference/run

---

### 03 · 추론 결과·코멘트 조회

**현재 FE · 예시 결과**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
현재 이 주소 호출 없음. ML predictions의 실제 값으로 화면 구성 필요

**요청 방식 · GET**  
`/api/v1/projects/{projectId}/jobs/{jobId}/inference?minConfidence=0.23`

---

**코드 근거**

- [FE 추론 설정](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/InferenceSetupPage.tsx)
- [FE Job 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useJobStore.ts)
- [BE JobController](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/job/controller/JobController.java)

## 모델학습

### 04 · 완료된 증강 데이터 목록

**현재 FE · 예시 목록**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
JOB-001/002/003 고정. 증강 결과 dataset_id 필요

**요청 방식 · GET**  
`/api/v1/projects/{projectId}/jobs?status=COMPLETED&type=AUGMENT`

---

### 05 · 학습 시작

**현재 FE · 요청 코드·예시 전환**  
BE: BE 연결부 없음 · 사진 FE: 시작 전

**수정·남은 일**  
명세 POST /jobs/train와 다름. 진짜 dataset_id·이미지 전달 계약 필요

**요청 방식 · 미확정**  
FE: POST /api/v1/projects/{projectId}/jobs; ML: POST /api/v1/training/run

---

### 06 · 학습 결과·코멘트 조회

**현재 FE · 예시 결과**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
정확도 등 실제 metrics 조회 및 저장 연결 필요

**요청 방식 · GET**  
`/api/v1/projects/{projectId}/jobs/{jobId}/train`

---

### 07 · 학습 모델 다운로드

**현재 FE · 미연동**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
ML model_url/best.pt와 다운로드 권한·확장자 계약 확정

**요청 방식 · POST**  
`/api/v1/projects/{projectId}/jobs/{jobId}/train/download`

---

**코드 근거**

- [FE 학습 설정](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/TrainSetupPage.tsx)
- [FE Job 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useJobStore.ts)
- [BE JobController](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/job/controller/JobController.java)

## 데이터증강

### 08 · 임시 이미지 업로드

**현재 FE · 미연동**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
AI 설정은 파일 장수만 전송. 일반 파일 POST /files/temp와 구분

**요청 방식 · POST**  
`/api/v1/images/temp`

---

### 09 · 임시 이미지 삭제

**현재 FE · 미연동**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
일반 파일 API에 동일 삭제 주소가 있다고 볼 수 없음

**요청 방식 · DELETE**  
`/api/v1/images/temp/{imageId}`

---

### 10 · 증강 결과 기본 정보·코멘트 조회

**현재 FE · 예시 결과**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
ML dataset_url·preview_url·실제 수량을 BE에서 보존하고 연결

**요청 방식 · GET**  
`/api/v1/projects/{projectId}/jobs/{jobId}/augment`

---

### 11 · NORMAL/ANOMALY 이미지 조회

**현재 FE · 예시 이미지**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
이미지 목록·원본/합성 구분·라벨 계약 필요

**요청 방식 · GET**  
`/api/v1/projects/{projectId}/jobs/{jobId}/images?type=NORMAL|ANOMALY`

---

### 12 · 증강 데이터 다운로드

**현재 FE · 미연동**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
ML support_aug.npz 실제 산출물과 연결 필요

**요청 방식 · POST**  
`/api/v1/projects/{projectId}/jobs/{jobId}/download`

---

**코드 근거**

- [FE 증강 설정](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/AugmentSetupPage.tsx)
- [BE JobController](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/job/controller/JobController.java)

## 프로젝트 설정

### 13 · 이메일로 유저 검색

**현재 FE · 미연동**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
서버 검색 API를 화면에서 호출하지 않음. 현재 초대 메일 입력과 별도 기능

**요청 방식 · GET**  
`/api/v1/users/search?email=...`

---

### 14 · 프로젝트 초대 생성

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
이메일 초대 요청 존재. 미가입/중복/권한 오류와 수신자 경로 실서버 확인

**요청 방식 · POST**  
`/api/v1/projects/{projectId}/invitations`

---

### 15 · 프로젝트 초대 수락/거절

**현재 FE · 미연동**  
BE: 구현 · 사진 FE: 진행 중

**수정·남은 일**  
수신자가 invitationId를 확보하는 조회/알림 경로까지 연결 필요

**요청 방식 · PATCH**  
`/api/v1/projects/{projectId}/invitations/{invitationId}`

---

### 16 · 프로젝트 멤버 삭제

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
명세 PUT은 오류. 실제 DELETE. 관리자·마지막 관리자 조건 확인

**요청 방식 · DELETE**  
`/api/v1/projects/{projectId}/members/{userId}`

---

### 17 · 프로젝트 멤버 역할 변경

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
관리자 권한과 마지막 관리자 변경 제한 확인

**요청 방식 · PUT**  
`/api/v1/projects/{projectId}/members/{userId}`

---

**코드 근거**

- [FE 프로젝트 상태](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useProjectStore.ts)
- [BE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/project/controller/ProjectController.java)
- [BE 초대](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/project/controller/ProjectInvitationController.java)
- [BE 사용자 검색](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/controller/UserController.java)

## 프로젝트 상세

### 18 · 프로젝트 기본 정보 조회

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
실서버 해당 프로젝트 권한별 확인

**요청 방식 · GET**  
`/api/v1/projects/{projectId}`

---

### 19 · 프로젝트 기본 정보 수정

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
배너 파일은 별도 API. 기본 정보 수정으로 파일 업로드 완료 판정하지 않음

**요청 방식 · PUT**  
`/api/v1/projects/{projectId}`

---

### 20 · 임시 파일 업로드

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
multipart files 실제 업로드 후 fileId 확보. AI 이미지 업로드 화면은 아직 다름

**요청 방식 · POST**  
`/api/v1/files/temp`

---

### 21 · 상태별 Job 목록

**현재 FE · 예시 목록**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
명세 BE 보류와 일치. FE 시연 목록을 저장된 기록으로 교체

**요청 방식 · GET**  
`/api/v1/projects/{projectId}/jobs?status=ALL&type=ALL&page=0&size=10`

---

### 22 · SSE Job 진행률 실시간 업데이트

**현재 FE · 폴링 요청·예시 전환**  
BE: 기준 브랜치에 없음 · 사진 FE: 시작 전

**수정·남은 일**  
SSE 아님. 1.5초 반복 조회. GET 목록과 SSE 행의 동일 URL은 확정 규격으로 사용 불가

**요청 방식 · 미확정**  
SSE 주소 미구현; FE GET /api/v1/jobs/{jobId}

---

### 23 · 팀 코멘트 작성

**현재 FE · 미연동**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 빈 URL 보완. JobController에는 댓글 API만 존재

**요청 방식 · POST**  
`/api/v1/projects/{projectId}/jobs/{jobId}/comments`

---

### 24 · 팀 코멘트 수정

**현재 FE · 미연동**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
실제 코멘트 ID·작성자 제한·오류 표시 필요

**요청 방식 · PUT**  
`/api/v1/projects/{projectId}/jobs/{jobId}/comments/{commentId}`

---

### 25 · 팀 코멘트 삭제

**현재 FE · 미연동**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
실제 코멘트만 대상으로 연결

**요청 방식 · DELETE**  
`/api/v1/projects/{projectId}/jobs/{jobId}/comments/{commentId}`

---

**코드 근거**

- [FE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useProjectStore.ts)
- [FE Job](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useJobStore.ts)
- [BE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/project/controller/ProjectController.java)
- [BE 댓글](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/job/controller/JobController.java)
- [BE 파일](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/file/controller/FileController.java)

## 알림

### 26 · 알림 목록·필터 조회

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
조회 UI 있음. 10/9 BE page 항목 반영. 다음 페이지 UI·페이지 내 안읽음 집계·조회 실패 시 예시 잔존은 남음

**요청 방식 · GET**  
`/api/v1/notifications`

---

### 27 · 알림 전체 읽음 처리

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
API 실패해도 로컬 읽음 성공 처리. 실패 표시/되돌리기 필요

**요청 방식 · PATCH**  
`/api/v1/notifications/read-all`

---

### 28 · 알림 단건 읽음 처리

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
API 실패해도 로컬 성공 처리. 새로고침 후 상태 확인

**요청 방식 · PATCH**  
`/api/v1/notifications/{notificationId}/read`

---

### 29 · 알림 전체 영구 삭제

**현재 FE · 함수만 있음**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
hardDeleteAll 함수는 화면 사용 확인되지 않음

**요청 방식 · DELETE**  
`/api/v1/notifications`

---

### 30 · 알림 단건 영구 삭제

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /notifications/{id}는 오류. 실제 query 사용. 실패해도 로컬 삭제 가능

**요청 방식 · DELETE**  
`/api/v1/notifications?notificationId={notificationId}`

---

**코드 근거**

- [FE 알림](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useNotificationStore.ts)
- [BE 알림](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/notification/controller/NotificationController.java)

## 커뮤니티

### 31 · 데이터셋 업로드

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
명세 /community/datasets POST 잘못됨. /files/temp → fileId로 /datasets 등록

**요청 방식 · POST**  
`/api/v1/datasets`

---

### 32 · 데이터셋 상세 단건 조회

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 community 경로 잘못됨. 내 자산은 상세 조회, 커뮤니티는 목록 기반 초기 상세·예시 혼합

**요청 방식 · GET**  
`/api/v1/datasets/{datasetId}`

---

### 33 · 데이터셋 목록 조회

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
첫 페이지·검색 요청 존재. 서버 정렬/다음 페이지 연결과 상세 값 확인

**요청 방식 · GET**  
`/api/v1/community/datasets`

---

### 34 · 데이터셋 삭제

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 community 경로 수정. 실제 소유자 권한 확인

**요청 방식 · DELETE**  
`/api/v1/datasets/{datasetId}`

---

### 35 · Q&A 상세 조회

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
상세 진입 API 요청 존재

**요청 방식 · GET**  
`/api/v1/community/qna/{qnaId}`

---

### 36 · Q&A 질문 등록

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
저장 후 상세/목록 재조회 확인

**요청 방식 · POST**  
`/api/v1/community/qna`

---

### 37 · Q&A 질문 삭제

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
API 연결됨. 소유자 권한 확인

**요청 방식 · DELETE**  
`/api/v1/community/qna/{qnaId}`

---

### 38 · Q&A 전문가 답변 작성

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 진행 중

**수정·남은 일**  
전문가 권한·오류 표시 및 저장 후 재조회 확인

**요청 방식 · POST**  
`/api/v1/community/qna/{qnaId}/answers`

---

### 39 · Q&A 목록 조회

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
첫 페이지·검색 존재. 정렬/다음 페이지 확인

**요청 방식 · GET**  
`/api/v1/community/qna`

---

### 40 · 팀원 모집글 등록

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
등록 API 요청 존재

**요청 방식 · POST**  
`/api/v1/community/recruitments`

---

### 41 · 팀원 모집글 삭제

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
삭제 API 요청 존재

**요청 방식 · DELETE**  
`/api/v1/community/recruitments/{recruitmentId}`

---

### 42 · 팀원 모집 목록 조회

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 진행 중

**수정·남은 일**  
API 목록 존재. 서버 정렬/다음 페이지 후속

**요청 방식 · GET**  
`/api/v1/community/recruitments`

---

### 43 · 팀원 모집 상세 조회

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 진행 중

**수정·남은 일**  
상세 및 지원자 데이터 조회 존재

**요청 방식 · GET**  
`/api/v1/community/recruitments/{recruitmentId}`

---

### 44 · 팀원 지원하기

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 진행 중

**수정·남은 일**  
중복 지원 409 처리 포함. 승인 후 프로젝트 가입 방식은 별도 확인

**요청 방식 · POST**  
`/api/v1/community/recruitments/{recruitmentId}/apply`

---

### 45 · 팀원 승인/거절

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
ACCEPTED/REJECTED 요청 존재. 상태 변경과 자동 프로젝트 합류는 별도 사항

**요청 방식 · PATCH**  
`/api/v1/community/recruitments/{recruitmentId}/applications/{applicationId}/status`

---

### 46 · 레시피 상세 조회

**현재 FE · 함수만 있음**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /recipes 경로 수정. fetchRecipeDetail을 상세 화면에서 사용하지 않음

**요청 방식 · GET**  
`/api/v1/community/recipes/{recipeId}`

---

### 47 · 레시피 Fork

**현재 FE · 함수만 있음·예시 버튼**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
현재 버튼은 로컬 toggleFork만 실행. 실제 복사·중복·새로고침 지속성 연결 필요

**요청 방식 · POST**  
`/api/v1/community/recipes/{recipeId}/fork`

---

### 48 · 레시피 등록

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /recipes 경로 수정. ShowcaseCreateForm 등록 존재

**요청 방식 · POST**  
`/api/v1/community/recipes`

---

### 49 · 레시피 삭제

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
화면 API 요청 존재. 소유자 권한 확인

**요청 방식 · DELETE**  
`/api/v1/community/recipes/{recipeId}`

---

### 50 · Fork 기반 새 레시피 등록

**현재 FE · 미연동**  
BE: 기존 등록 API 재사용 · 사진 FE: 시작 전

**수정·남은 일**  
명세 PUT /recipes/{id} 미구현. forkedFromId 포함 POST로 새 글 등록. 기존 레시피 수정 API와 구분

**요청 방식 · POST**  
`/api/v1/community/recipes`

---

### 51 · 연구 쇼케이스 목록

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
목록/검색 있음. MOST_FORKED 등 서버 정렬·페이지 연결, 목록의 가짜 상세값 제거

**요청 방식 · GET**  
`/api/v1/community/recipes`

---

**코드 근거**

- [FE API 함수](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useCommunityStore.ts)
- [FE 커뮤니티 화면](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/CommunityPage.tsx)
- [FE 레시피 상세](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/components/dashboard/RecipeDetail.tsx)
- [BE 데이터셋](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/dataset/controller/DatasetController.java)
- [BE 레시피](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/recipe/controller/CommunityRecipeController.java)
- [BE Q&A](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/qna/controller/ExpertQnAController.java)
- [BE 모집](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/recruitment/controller/RecruitmentController.java)

## 전문가

### 52 · 전문가 활동 실적

**현재 FE · 미연동·예시 통계**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
12,500 포인트·상위 5%·만족도 4.9 등 고정. 실제 집계 연결

**요청 방식 · GET**  
`/api/v1/experts/me/performance`

---

### 53 · 검수 요청 목록

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 status=PENDING 필터 없음. PENDING/IN_PROGRESS/COMPLETED 묶음. 실제 taskId 응답 필요

**요청 방식 · GET**  
`/api/v1/experts/me/tasks`

---

### 54 · 검수 시작

**현재 FE · 부분 연결·번호 위험**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
요청 방식 맞음. reviewCode 숫자를 DB taskId로 추정하는 문제

**요청 방식 · PATCH**  
`/api/v1/experts/me/tasks/{taskId}/start`

---

### 55 · 검수 상세 조회

**현재 FE · 규격 불일치**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 tasks/{id} 주소 수정. expertComment/augmentationParams/requester.name 등 응답 이름 맞춰야 함

**요청 방식 · GET**  
`/api/v1/inspections/{inspectionId}`

---

### 56 · 최종 코멘트 임시 저장

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
expertComment 요청은 맞음. 저장된 의견 복원·실제 번호·실패 표시 확인

**요청 방식 · PATCH**  
`/api/v1/inspections/{inspectionId}/draft`

---

### 57 · 최종 승인/거절

**현재 FE · 규격 불일치**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 tasks/.../complete 대신 두 API. FE POST→PATCH, finalComment/rejectionReason→expertComment

**요청 방식 · PATCH**  
`/api/v1/inspections/{inspectionId}/approve 또는 /reject`

---

**코드 근거**

- [FE 검수](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useExpertStore.ts)
- [FE 전문가 화면](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/ExpertPage.tsx)
- [FE 검수 상세](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/components/dashboard/ReviewDetailPage.tsx)
- [BE 전문가](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/controller/ExpertController.java)
- [BE 검수](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/controller/InspectionController.java)
- [BE 작업 응답](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/dto/response/ExpertTaskSummaryResponse.java)

## 데이터관리

### 58 · 레시피 후기 목록

**현재 FE · 미연동·예시 후기**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 community 앞부분 누락. 후기 2개 고정. 실제 목록부터 연결

**요청 방식 · GET**  
`/api/v1/community/recipes/{recipeId}/reviews?page=0&size=10`

---

### 59 · 레시피 후기/답글 작성

**현재 FE · 미연동**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
후기는 rating 1~5 필수, 답글은 parentReviewId 및 별점 금지 조건 확인

**요청 방식 · POST**  
`/api/v1/community/recipes/{recipeId}/reviews`

---

### 60 · 레시피 후기/답글 삭제

**현재 FE · 부분 연결·예시 ID 위험**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
삭제만 호출 존재. 예시 reviewId나 기본값 1을 실제 삭제에 보내지 않아야 함

**요청 방식 · DELETE**  
`/api/v1/community/recipes/{recipeId}/reviews/{reviewId}`

---

### 61 · 레시피 후기/답글 수정

**현재 FE · 미연동**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
실제 후기 번호와 소유자 검증 필요

**요청 방식 · PUT**  
`/api/v1/community/recipes/{recipeId}/reviews/{reviewId}`

---

### 62 · 데이터셋 파일 다운로드

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /datasets/{id}/download 미구현. datasetId가 아닌 실제 fileId. 응답 presignedUrl 사용

**요청 방식 · POST**  
`/api/v1/files/{fileId}/download`

---

### 63 · 업로드 데이터셋 수정

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /datasets/{id} 수정. 기존 fileId 생략 가능, title/description 필수

**요청 방식 · PUT**  
`/api/v1/datasets/{datasetId}/upload`

---

### 64 · 전문가 검수 신청

**현재 FE · 규격 불일치**  
BE: 증강 데이터만 구현 · 사진 FE: 시작 전

**수정·남은 일**  
FE RECIPE/DATASET·reward는 미지원. AUGMENTED_DATA·실제 증강 설정 ID·rewardPoints 필요

**요청 방식 · POST**  
`/api/v1/inspections`

---

### 65 · 내 업로드 데이터셋 목록

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /datasets?type=uploaded 수정. 실제 목록 호출, 후속 페이지 확인

**요청 방식 · GET**  
`/api/v1/assets/datasets?type=UPLOADED&page=0&size=10`

---

### 66 · 내 증강 데이터셋 목록

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /datasets?type=augmented 수정. 실데이터 생성은 AI 연결에 의존

**요청 방식 · GET**  
`/api/v1/assets/datasets?type=AUGMENTED&page=0&size=10`

---

### 67 · 내 Fork 레시피 목록

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /recipes?type=forked 수정. 목록 API 존재, Fork 버튼 실제 등록과 별도

**요청 방식 · GET**  
`/api/v1/assets/recipes?type=FORKED&page=0&size=10`

---

### 68 · 내 레시피 목록

**현재 FE · 부분 연결**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /recipes?type=uploaded 수정. MINE 사용

**요청 방식 · GET**  
`/api/v1/assets/recipes?type=MINE&page=0&size=10`

---

**코드 근거**

- [FE 자산](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAssetStore.ts)
- [FE 커뮤니티](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useCommunityStore.ts)
- [BE 내 데이터셋](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/dataset/controller/AssetDatasetController.java)
- [BE 내 레시피](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/recipe/controller/AssetRecipeController.java)
- [BE 후기](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/recipe/controller/RecipeReviewController.java)
- [BE 검수](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/controller/InspectionController.java)
- [BE 파일](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/file/controller/FileController.java)

## 내 프로젝트

### 69 · 프로젝트 배너 파일 교체/삭제

**현재 FE · 미연동**  
BE: 구현 · 사진 FE: 시작 전

**수정·남은 일**  
배너 파일 API 호출 없음. 일반 URL 입력과 별개

**요청 방식 · PATCH**  
`/api/v1/projects/{projectId}/banner`

---

### 70 · 관리/참여 프로젝트 목록

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
실제 프로젝트 목록 호출. 대시보드 예시 프로젝트 목록은 별도 교체 필요

**요청 방식 · GET**  
`/api/v1/projects`

---

### 71 · 프로젝트 생성

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 진행 중

**수정·남은 일**  
생성 폼과 서버 요청 존재. 초대·권한 포함 끝까지 확인

**요청 방식 · POST**  
`/api/v1/projects`

---

**코드 근거**

- [FE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useProjectStore.ts)
- [BE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/project/controller/ProjectController.java)

## 마이페이지

### 72 · 다른 사용자 공개 프로필

**현재 FE · 부분 연결**  
BE: 기본 구현·확장 별도 브랜치 · 사진 FE: 시작 전

**수정·남은 일**  
명세 BE 진행 중은 기본/확장 분리. #195 publicActivities 확장은 기본 브랜치 미병합

**요청 방식 · GET**  
`/api/v1/users/{userId}`

---

### 73 · 닉네임 수정

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
nickname 요청·재조회 확인

**요청 방식 · PUT**  
`/api/v1/profile/nickname`

---

### 74 · 소개글 수정

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
body의 항목 이름 bio

**요청 방식 · PUT**  
`/api/v1/profile/introduction`

---

### 75 · 위치 수정

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
스크린샷 하단 일부만 보이는 행. 위치=location

**요청 방식 · PUT**  
`/api/v1/profile/location`

---

### 76 · 프로젝트 프로필 노출 설정

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
프로젝트 자체 비공개와 프로필 노출 공개를 구분

**요청 방식 · PUT**  
`/api/v1/users/me/projects/visibility`

---

### 77 · 내 활동 목록

**현재 FE · 부분 연결**  
BE: 본인 목록 구현 · 사진 FE: 시작 전

**수정·남은 일**  
명세 /users/{id}/activities 없음. items/hasNext/nextCursor. 10/9 빈 응답 반영·안내 추가. 첫 20건·다음 cursor 미사용·조회 오류 시 예시는 남음

**요청 방식 · GET**  
`/api/v1/mypage/activities?size=20&cursor=...`

---

### 78 · 활동 프로필 노출 설정

**현재 FE · 부분 연결**  
BE: 구현·응답 불일치 · 사진 FE: 시작 전

**수정·남은 일**  
서버 isMyPageVisible 변경, 목록 isPublic 반환. FE type+id 아닌 id만 사용해 항목 충돌 가능

**요청 방식 · PATCH**  
`/api/v1/users/me/activities/visibility`

---

**코드 근거**

- [FE 프로필](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/ProfilePage.tsx)
- [FE 사용자](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAuthStore.ts)
- [BE 사용자](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/controller/UserController.java)
- [BE 활동 응답](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/dto/response/MyActivityListResponse.java)

## 로그인

### 79 · 로그아웃

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도

**요청 방식 · POST**  
`/auth/logout`

---

### 80 · 토큰 재발급

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도

**요청 방식 · POST**  
`/auth/refresh`

---

### 81 · 구글 로그인

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도

**요청 방식 · GET**  
`/oauth2/authorization/google`

---

### 82 · 내 정보 조회

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도

**요청 방식 · GET**  
`/api/v1/users/me`

---

### 83 · 최초 회원 정보 입력

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도

**요청 방식 · POST**  
`/api/v1/onboarding`

---

### 84 · 계정 탈퇴

**현재 FE · 화면·요청 연결**  
BE: 구현 · 사진 FE: 완료

**수정·남은 일**  
쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도

**요청 방식 · DELETE**  
`/api/v1/users/me`

---

**코드 근거**

- [FE 사용자](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAuthStore.ts)
- [FE 통신](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/lib/axios.ts)
- [BE 인증](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/auth/controller/AuthController.java)
- [BE 사용자](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/controller/UserController.java)

## 사진 외에 추가할 API·주의사항

### 전문가 인증

**현재 코드**  
POST /api/v1/experts/me, multipart certificationFile

**반영할 내용**  
10/9 FE 주소를 /experts/me로 정정. PDF/JPG/JPEG/PNG 최대 10MB. 실서버 신청·재조회 확인은 별도

### 이미지별 검수 의견

**현재 코드**  
PATCH /api/v1/inspections/{id}/images/{imageId}/comment, {comment}

**반영할 내용**  
호출 있음. 실제 작업/이미지 번호로 재조회 검증

### 팝업 알림 숨김

**현재 코드**  
DELETE /api/v1/notifications/popup?notificationId=...

**반영할 내용**  
단건 연결. 번호 생략은 전체 숨김. 영구 삭제와 구분

### 웹사이트·사진

**현재 코드**  
PUT /api/v1/profile/website의 websiteUrl; PUT /api/v1/profile/image의 파일 image

**반영할 내용**  
호출 있음. 숨겨진 원본 행의 상태까지는 판정 불가

### BASIC/PRO 변경

**현재 코드**  
PUT /api/v1/users/me/plan, planType

**반영할 내용**  
호출 있음. 실제 결제 구현이라는 뜻은 아님

### 프로필 내 프로젝트

**현재 코드**  
GET /api/v1/projects/me?size=6&isPublic=true&cursor=...

**반영할 내용**  
FE 다음 cursor 조회 존재. 타인 프로필에서도 /me를 사용하는 범위 확인

### AI 생성·상태·취소

**현재 코드**  
FE POST /projects/{id}/jobs, GET /jobs/{id}, POST /jobs/{id}/cancel 가정

**반영할 내용**  
해당 BE 접수 API 없음. 정식 계약 합의


### 검수 신청·판정에서 구분할 번호

검수 신청의 현재 요청은 {targetType:"AUGMENTED_DATA", targetId:실제_증강설정번호, reason:"요청 메모", rewardPoints:포인트}다. targetId는 현재 처리 코드가 찾는 AugmentationConfig의 DB 번호다. 커뮤니티 datasetId나 JOB-001 같은 표시 번호와 바꿔 쓰면 안 된다. 본인 증강 데이터만 지원하며, 중복/소유자/포인트 검증과 신청 즉시 포인트 차감이 있다.

승인/반려는 PATCH /inspections/{inspectionId}/approve 또는 /reject에 {expertComment:"의견"}을 보낸다. 반려 의견은 필수다. inspectionId는 ExpertTask의 DB 번호이며 시작 API의 taskId와 같은 자원을 가리킨다. reviewCode에서 숫자를 추출하는 현재 FE 대신 목록에서 실제 ID를 받아야 한다.

### 마이페이지의 목록·공개 설정

내 활동 조회 응답은 {items,hasNext,nextCursor}다. 다음 요청에 nextCursor를 그대로 넣는다. 현재 FE는 첫 20개 안에서 표시 개수만 늘린다. isPublic(콘텐츠 자체 공개)과 isMyPageVisible(프로필에 표시)을 구분해야 한다. BE 변경은 프로필 노출값을 저장하지만 목록은 콘텐츠 공개값을 반환해 응답 보완이 필요하다.

### 알림의 페이지·삭제 처리

알림 PageResponse의 페이지 번호는 page다. 10/9 FE가 page를 읽도록 수정했다. 다음 페이지 UI는 별도 연결이 필요하다. 소프트 삭제는 기록을 남기고 숨김, 하드 삭제는 영구 삭제다. 조회/읽음/삭제 실패가 로컬 성공으로 보이는 흐름을 수정한다.

### ML 작업 상태

ML 응답은 job_id이며 FE jobId와 직접 호환되지 않는다. **README/MIGRATION에는 FAILURE를 외부 API 상태처럼 쓴 부분이 있지만, 실제 라우터는 내부 FAILURE를 외부 FAILED로 변환한다.** 현재 외부 상태는 PENDING/STARTED/RUNNING/SUCCESS/FAILED/CANCELLED다. 서버 문서도 코드에 맞춰 정정한다. BE가 COMPLETED 등으로 바꾸면 변환표를 명세에 추가한다.

## Notion 반영 순서

1. 시작 전을 일괄 완료로 바꾸지 말고, 이 자료의 부분 연결/규격 불일치/함수만 있음을 구분한다.
2. URL·Method·요청 항목은 구현으로 수정한다. 미구현 AI는 예정 규격으로 표시한다.
3. 실서버 확인 열을 추가해 저장 후 새로고침·실패·권한·재조회 검증 날짜/증거를 남긴다.
4. 보이지 않는 7개는 원본 행을 확인한 후 판정한다.
5. CSV는 비교용 별도 표로 가져오거나 복사한다. 원본 행을 무조건 덮어쓰지 않는다.

[회의 준비 자료](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/docs/2026-10-09_Integrated_Meeting_Brief.md)에서 작업 흐름과 담당자별 과제를 확인할 수 있습니다.


## 추가 ML 문의와 MIGRATION.md

최신 Medfusion의 증강 설정 일부와 학습 Query 입력은 요청 형식에 있지만 계산에는 전달되지 않습니다. 컨테이너 사이의 파일 공유·S3 이전 결과 다운로드도 추가 연결이 필요합니다.

- [변경 내용·MIGRATION.md 대조](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/docs/2026-10-09_Integrated_Meeting_Brief.md)
- [취소·추가 연동 문의 17개](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/docs/2026-10-09_ML_Inquiry_Followup.md)

health 응답과 모의 접수 테스트 성공만으로 GPU·워커·파일·BE 전체 연결 완료를 판정할 수 없습니다.
