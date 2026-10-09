# API 명세서 대조표 — 2026-10-09

첨부한 Notion 화면과 최신 구현을 대조한 문서다. **원본 Notion을 수정한 것이 아니라, 수정할 내용을 정리한 표**다. FE 원격 main faaaf42, BE develop a7825f2/main b967864 기준이다. ML main a33ad89와 별도 Medfusion f473b60를 구분했다. 배포 서버 버전과 정상 작동을 증명하는 표는 아니다.

그룹 표시 합계는 91개지만, 사진에서 내용을 읽을 수 있는 것은 84개다. 데이터증강 1개, 마이페이지 6개는 행 내용이 없어 판정하지 않았다. 위치 수정 행은 일부만 보여 코드를 함께 확인했다.

## 표 읽는 법

- 화면·요청 연결: 화면에서 호출하며 주소/방식이 맞는 것으로 확인. 실제 저장·권한·실서버 성공까지 확인한 완료라는 뜻은 아님.
- 부분 연결: 응답 처리, 페이지 넘김, 빈 목록, 오류, 실제 번호 등에 남은 작업이 있음.
- 함수만 있음: 요청 함수는 있으나 실제 화면/버튼이 사용하지 않음.
- 규격 불일치: 주소·방식·항목·허용 대상이 서버와 다름.
- 예시: 서버 결과 대신 고정값/임시 자료가 보임.
- 기준 브랜치에 없음: 확인한 BE main/develop에 요청 접수 코드가 없음. 다른 별도 작업이 없다는 단정은 아님.

API는 화면과 서버의 통신 약속이다. GET은 조회, POST는 생성·접수, PUT은 교체·수정, PATCH는 특정 상태/항목 변경, DELETE는 삭제다. 괄호 속 {projectId} 등은 실제 번호를 넣는 자리이며 ?type=...는 조회 조건이다. 표에는 /api/v1까지 포함했다. AI 미구현 주소는 명세 요구이며 작동하는 현재 API가 아니다.

## 모델추론

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 1 | 완료된 학습 모델 목록 | 시작 전 | GET `/api/v1/projects/{projectId}/jobs?status=COMPLETED&type=TRAIN` | 기준 브랜치에 없음 | 예시 목록 | model-1/model-2 고정. BE 목록 구현 및 실제 model_id 연결 필요 |
| 2 | 추론 시작 | 시작 전 | 미확정 `FE: POST /api/v1/projects/{projectId}/jobs; ML: POST /api/v1/inference/run` | BE 연결부 없음 | 요청 코드·예시 전환 | 사진 내용 없이 장수만 전송. 실패하면 모의 성공. 명세 POST /jobs/inference와도 다름 |
| 3 | 추론 결과·코멘트 조회 | 시작 전 | GET `/api/v1/projects/{projectId}/jobs/{jobId}/inference?minConfidence=0.23` | 기준 브랜치에 없음 | 예시 결과 | 현재 이 주소 호출 없음. ML predictions의 실제 값으로 화면 구성 필요 |

근거: [FE 추론 설정](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/InferenceSetupPage.tsx), [FE Job 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useJobStore.ts), [BE JobController](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/job/controller/JobController.java).

## 모델학습

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 4 | 완료된 증강 데이터 목록 | 시작 전 | GET `/api/v1/projects/{projectId}/jobs?status=COMPLETED&type=AUGMENT` | 기준 브랜치에 없음 | 예시 목록 | JOB-001/002/003 고정. 증강 결과 dataset_id 필요 |
| 5 | 학습 시작 | 시작 전 | 미확정 `FE: POST /api/v1/projects/{projectId}/jobs; ML: POST /api/v1/training/run` | BE 연결부 없음 | 요청 코드·예시 전환 | 명세 POST /jobs/train와 다름. 진짜 dataset_id·이미지 전달 계약 필요 |
| 6 | 학습 결과·코멘트 조회 | 시작 전 | GET `/api/v1/projects/{projectId}/jobs/{jobId}/train` | 기준 브랜치에 없음 | 예시 결과 | 정확도 등 실제 metrics 조회 및 저장 연결 필요 |
| 7 | 학습 모델 다운로드 | 시작 전 | POST `/api/v1/projects/{projectId}/jobs/{jobId}/train/download` | 기준 브랜치에 없음 | 미연동 | ML model_url/best.pt와 다운로드 권한·확장자 계약 확정 |

근거: [FE 학습 설정](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/TrainSetupPage.tsx), [FE Job 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useJobStore.ts), [BE JobController](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/job/controller/JobController.java).

## 데이터증강

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 8 | 임시 이미지 업로드 | 시작 전 | POST `/api/v1/images/temp` | 기준 브랜치에 없음 | 미연동 | AI 설정은 파일 장수만 전송. 일반 파일 POST /files/temp와 구분 |
| 9 | 임시 이미지 삭제 | 시작 전 | DELETE `/api/v1/images/temp/{imageId}` | 기준 브랜치에 없음 | 미연동 | 일반 파일 API에 동일 삭제 주소가 있다고 볼 수 없음 |
| 10 | 증강 결과 기본 정보·코멘트 조회 | 시작 전 | GET `/api/v1/projects/{projectId}/jobs/{jobId}/augment` | 기준 브랜치에 없음 | 예시 결과 | ML dataset_url·preview_url·실제 수량을 BE에서 보존하고 연결 |
| 11 | NORMAL/ANOMALY 이미지 조회 | 시작 전 | GET `/api/v1/projects/{projectId}/jobs/{jobId}/images?type=NORMAL / ANOMALY` | 기준 브랜치에 없음 | 예시 이미지 | 이미지 목록·원본/합성 구분·라벨 계약 필요 |
| 12 | 증강 데이터 다운로드 | 시작 전 | POST `/api/v1/projects/{projectId}/jobs/{jobId}/download` | 기준 브랜치에 없음 | 미연동 | ML support_aug.npz 실제 산출물과 연결 필요 |

근거: [FE 증강 설정](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/AugmentSetupPage.tsx), [BE JobController](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/job/controller/JobController.java).

## 프로젝트 설정

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 13 | 이메일로 유저 검색 | 완료 | GET `/api/v1/users/search?email=...` | 구현 | 미연동 | 서버 검색 API를 화면에서 호출하지 않음. 현재 초대 메일 입력과 별도 기능 |
| 14 | 프로젝트 초대 생성 | 완료 | POST `/api/v1/projects/{projectId}/invitations` | 구현 | 화면·요청 연결 | 이메일 초대 요청 존재. 미가입/중복/권한 오류와 수신자 경로 실서버 확인 |
| 15 | 프로젝트 초대 수락/거절 | 진행 중 | PATCH `/api/v1/projects/{projectId}/invitations/{invitationId}` | 구현 | 미연동 | 수신자가 invitationId를 확보하는 조회/알림 경로까지 연결 필요 |
| 16 | 프로젝트 멤버 삭제 | 완료 | DELETE `/api/v1/projects/{projectId}/members/{userId}` | 구현 | 화면·요청 연결 | 명세 PUT은 오류. 실제 DELETE. 관리자·마지막 관리자 조건 확인 |
| 17 | 프로젝트 멤버 역할 변경 | 완료 | PUT `/api/v1/projects/{projectId}/members/{userId}` | 구현 | 화면·요청 연결 | 관리자 권한과 마지막 관리자 변경 제한 확인 |

근거: [FE 프로젝트 상태](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useProjectStore.ts), [BE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/project/controller/ProjectController.java), [BE 초대](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/project/controller/ProjectInvitationController.java), [BE 사용자 검색](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/controller/UserController.java).

## 프로젝트 상세

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 18 | 프로젝트 기본 정보 조회 | 완료 | GET `/api/v1/projects/{projectId}` | 구현 | 화면·요청 연결 | 실서버 해당 프로젝트 권한별 확인 |
| 19 | 프로젝트 기본 정보 수정 | 완료 | PUT `/api/v1/projects/{projectId}` | 구현 | 화면·요청 연결 | 배너 파일은 별도 API. 기본 정보 수정으로 파일 업로드 완료 판정하지 않음 |
| 20 | 임시 파일 업로드 | 완료 | POST `/api/v1/files/temp` | 구현 | 화면·요청 연결 | multipart files 실제 업로드 후 fileId 확보. AI 이미지 업로드 화면은 아직 다름 |
| 21 | 상태별 Job 목록 | 시작 전 | GET `/api/v1/projects/{projectId}/jobs?status=ALL&type=ALL&page=0&size=10` | 기준 브랜치에 없음 | 예시 목록 | 명세 BE 보류와 일치. FE 시연 목록을 저장된 기록으로 교체 |
| 22 | SSE Job 진행률 실시간 업데이트 | 시작 전 | 미확정 `SSE 주소 미구현; FE GET /api/v1/jobs/{jobId}` | 기준 브랜치에 없음 | 폴링 요청·예시 전환 | SSE 아님. 1.5초 반복 조회. GET 목록과 SSE 행의 동일 URL은 확정 규격으로 사용 불가 |
| 23 | 팀 코멘트 작성 | 시작 전 | POST `/api/v1/projects/{projectId}/jobs/{jobId}/comments` | 구현 | 미연동 | 명세 빈 URL 보완. JobController에는 댓글 API만 존재 |
| 24 | 팀 코멘트 수정 | 시작 전 | PUT `/api/v1/projects/{projectId}/jobs/{jobId}/comments/{commentId}` | 구현 | 미연동 | 실제 코멘트 ID·작성자 제한·오류 표시 필요 |
| 25 | 팀 코멘트 삭제 | 시작 전 | DELETE `/api/v1/projects/{projectId}/jobs/{jobId}/comments/{commentId}` | 구현 | 미연동 | 실제 코멘트만 대상으로 연결 |

근거: [FE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useProjectStore.ts), [FE Job](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useJobStore.ts), [BE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/project/controller/ProjectController.java), [BE 댓글](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/job/controller/JobController.java), [BE 파일](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/file/controller/FileController.java).

## 알림

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 26 | 알림 목록·필터 조회 | 시작 전 | GET `/api/v1/notifications` | 구현 | 부분 연결 | 조회 UI 있음. BE page와 FE number 불일치, 페이지 내 안읽음만 집계, 실패 시 예시 잔존 |
| 27 | 알림 전체 읽음 처리 | 시작 전 | PATCH `/api/v1/notifications/read-all` | 구현 | 부분 연결 | API 실패해도 로컬 읽음 성공 처리. 실패 표시/되돌리기 필요 |
| 28 | 알림 단건 읽음 처리 | 시작 전 | PATCH `/api/v1/notifications/{notificationId}/read` | 구현 | 부분 연결 | API 실패해도 로컬 성공 처리. 새로고침 후 상태 확인 |
| 29 | 알림 전체 영구 삭제 | 시작 전 | DELETE `/api/v1/notifications` | 구현 | 함수만 있음 | hardDeleteAll 함수는 화면 사용 확인되지 않음 |
| 30 | 알림 단건 영구 삭제 | 시작 전 | DELETE `/api/v1/notifications?notificationId={notificationId}` | 구현 | 부분 연결 | 명세 /notifications/{id}는 오류. 실제 query 사용. 실패해도 로컬 삭제 가능 |

근거: [FE 알림](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useNotificationStore.ts), [BE 알림](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/notification/controller/NotificationController.java).

## 커뮤니티

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 31 | 데이터셋 업로드 | 완료 | POST `/api/v1/datasets` | 구현 | 화면·요청 연결 | 명세 /community/datasets POST 잘못됨. /files/temp → fileId로 /datasets 등록 |
| 32 | 데이터셋 상세 단건 조회 | 시작 전 | GET `/api/v1/datasets/{datasetId}` | 구현 | 부분 연결 | 명세 community 경로 잘못됨. 내 자산은 상세 조회, 커뮤니티는 목록 기반 초기 상세·예시 혼합 |
| 33 | 데이터셋 목록 조회 | 완료 | GET `/api/v1/community/datasets` | 구현 | 부분 연결 | 첫 페이지·검색 요청 존재. 서버 정렬/다음 페이지 연결과 상세 값 확인 |
| 34 | 데이터셋 삭제 | 시작 전 | DELETE `/api/v1/datasets/{datasetId}` | 구현 | 화면·요청 연결 | 명세 community 경로 수정. 실제 소유자 권한 확인 |
| 35 | Q&A 상세 조회 | 시작 전 | GET `/api/v1/community/qna/{qnaId}` | 구현 | 화면·요청 연결 | 상세 진입 API 요청 존재 |
| 36 | Q&A 질문 등록 | 완료 | POST `/api/v1/community/qna` | 구현 | 화면·요청 연결 | 저장 후 상세/목록 재조회 확인 |
| 37 | Q&A 질문 삭제 | 시작 전 | DELETE `/api/v1/community/qna/{qnaId}` | 구현 | 화면·요청 연결 | API 연결됨. 소유자 권한 확인 |
| 38 | Q&A 전문가 답변 작성 | 진행 중 | POST `/api/v1/community/qna/{qnaId}/answers` | 구현 | 화면·요청 연결 | 전문가 권한·오류 표시 및 저장 후 재조회 확인 |
| 39 | Q&A 목록 조회 | 완료 | GET `/api/v1/community/qna` | 구현 | 부분 연결 | 첫 페이지·검색 존재. 정렬/다음 페이지 확인 |
| 40 | 팀원 모집글 등록 | 완료 | POST `/api/v1/community/recruitments` | 구현 | 화면·요청 연결 | 등록 API 요청 존재 |
| 41 | 팀원 모집글 삭제 | 시작 전 | DELETE `/api/v1/community/recruitments/{recruitmentId}` | 구현 | 화면·요청 연결 | 삭제 API 요청 존재 |
| 42 | 팀원 모집 목록 조회 | 진행 중 | GET `/api/v1/community/recruitments` | 구현 | 부분 연결 | API 목록 존재. 서버 정렬/다음 페이지 후속 |
| 43 | 팀원 모집 상세 조회 | 진행 중 | GET `/api/v1/community/recruitments/{recruitmentId}` | 구현 | 화면·요청 연결 | 상세 및 지원자 데이터 조회 존재 |
| 44 | 팀원 지원하기 | 진행 중 | POST `/api/v1/community/recruitments/{recruitmentId}/apply` | 구현 | 화면·요청 연결 | 중복 지원 409 처리 포함. 승인 후 프로젝트 가입 방식은 별도 확인 |
| 45 | 팀원 승인/거절 | 시작 전 | PATCH `/api/v1/community/recruitments/{recruitmentId}/applications/{applicationId}/status` | 구현 | 화면·요청 연결 | ACCEPTED/REJECTED 요청 존재. 상태 변경과 자동 프로젝트 합류는 별도 사항 |
| 46 | 레시피 상세 조회 | 시작 전 | GET `/api/v1/community/recipes/{recipeId}` | 구현 | 함수만 있음 | 명세 /recipes 경로 수정. fetchRecipeDetail을 상세 화면에서 사용하지 않음 |
| 47 | 레시피 Fork | 시작 전 | POST `/api/v1/community/recipes/{recipeId}/fork` | 구현 | 함수만 있음·예시 버튼 | 현재 버튼은 로컬 toggleFork만 실행. 실제 복사·중복·새로고침 지속성 연결 필요 |
| 48 | 레시피 등록 | 시작 전 | POST `/api/v1/community/recipes` | 구현 | 화면·요청 연결 | 명세 /recipes 경로 수정. ShowcaseCreateForm 등록 존재 |
| 49 | 레시피 삭제 | 시작 전 | DELETE `/api/v1/community/recipes/{recipeId}` | 구현 | 화면·요청 연결 | 화면 API 요청 존재. 소유자 권한 확인 |
| 50 | Fork 기반 새 레시피 등록 | 시작 전 | POST `/api/v1/community/recipes` | 기존 등록 API 재사용 | 미연동 | 명세 PUT /recipes/{id} 미구현. forkedFromId 포함 POST로 새 글 등록. 기존 레시피 수정 API와 구분 |
| 51 | 연구 쇼케이스 목록 | 시작 전 | GET `/api/v1/community/recipes` | 구현 | 부분 연결 | 목록/검색 있음. MOST_FORKED 등 서버 정렬·페이지 연결, 목록의 가짜 상세값 제거 |

근거: [FE API 함수](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useCommunityStore.ts), [FE 커뮤니티 화면](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/CommunityPage.tsx), [FE 레시피 상세](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/components/dashboard/RecipeDetail.tsx), [BE 데이터셋](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/dataset/controller/DatasetController.java), [BE 레시피](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/recipe/controller/CommunityRecipeController.java), [BE Q&A](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/qna/controller/ExpertQnAController.java), [BE 모집](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/recruitment/controller/RecruitmentController.java).

## 전문가

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 52 | 전문가 활동 실적 | 시작 전 | GET `/api/v1/experts/me/performance` | 구현 | 미연동·예시 통계 | 12,500 포인트·상위 5%·만족도 4.9 등 고정. 실제 집계 연결 |
| 53 | 검수 요청 목록 | 시작 전 | GET `/api/v1/experts/me/tasks` | 구현 | 부분 연결 | 명세 status=PENDING 필터 없음. PENDING/IN_PROGRESS/COMPLETED 묶음. 실제 taskId 응답 필요 |
| 54 | 검수 시작 | 시작 전 | PATCH `/api/v1/experts/me/tasks/{taskId}/start` | 구현 | 부분 연결·번호 위험 | 요청 방식 맞음. reviewCode 숫자를 DB taskId로 추정하는 문제 |
| 55 | 검수 상세 조회 | 시작 전 | GET `/api/v1/inspections/{inspectionId}` | 구현 | 규격 불일치 | 명세 tasks/{id} 주소 수정. expertComment/augmentationParams/requester.name 등 응답 이름 맞춰야 함 |
| 56 | 최종 코멘트 임시 저장 | 시작 전 | PATCH `/api/v1/inspections/{inspectionId}/draft` | 구현 | 부분 연결 | expertComment 요청은 맞음. 저장된 의견 복원·실제 번호·실패 표시 확인 |
| 57 | 최종 승인/거절 | 시작 전 | PATCH `/api/v1/inspections/{inspectionId}/approve 또는 /reject` | 구현 | 규격 불일치 | 명세 tasks/.../complete 대신 두 API. FE POST→PATCH, finalComment/rejectionReason→expertComment |

근거: [FE 검수](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useExpertStore.ts), [FE 전문가 화면](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/ExpertPage.tsx), [FE 검수 상세](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/components/dashboard/ReviewDetailPage.tsx), [BE 전문가](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/controller/ExpertController.java), [BE 검수](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/controller/InspectionController.java), [BE 작업 응답](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/dto/response/ExpertTaskSummaryResponse.java).

## 데이터관리

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 58 | 레시피 후기 목록 | 시작 전 | GET `/api/v1/community/recipes/{recipeId}/reviews?page=0&size=10` | 구현 | 미연동·예시 후기 | 명세 community 앞부분 누락. 후기 2개 고정. 실제 목록부터 연결 |
| 59 | 레시피 후기/답글 작성 | 시작 전 | POST `/api/v1/community/recipes/{recipeId}/reviews` | 구현 | 미연동 | 후기는 rating 1~5 필수, 답글은 parentReviewId 및 별점 금지 조건 확인 |
| 60 | 레시피 후기/답글 삭제 | 시작 전 | DELETE `/api/v1/community/recipes/{recipeId}/reviews/{reviewId}` | 구현 | 부분 연결·예시 ID 위험 | 삭제만 호출 존재. 예시 reviewId나 기본값 1을 실제 삭제에 보내지 않아야 함 |
| 61 | 레시피 후기/답글 수정 | 시작 전 | PUT `/api/v1/community/recipes/{recipeId}/reviews/{reviewId}` | 구현 | 미연동 | 실제 후기 번호와 소유자 검증 필요 |
| 62 | 데이터셋 파일 다운로드 | 시작 전 | POST `/api/v1/files/{fileId}/download` | 구현 | 화면·요청 연결 | 명세 /datasets/{id}/download 미구현. datasetId가 아닌 실제 fileId. 응답 presignedUrl 사용 |
| 63 | 업로드 데이터셋 수정 | 시작 전 | PUT `/api/v1/datasets/{datasetId}/upload` | 구현 | 화면·요청 연결 | 명세 /datasets/{id} 수정. 기존 fileId 생략 가능, title/description 필수 |
| 64 | 전문가 검수 신청 | 시작 전 | POST `/api/v1/inspections` | 증강 데이터만 구현 | 규격 불일치 | FE RECIPE/DATASET·reward는 미지원. AUGMENTED_DATA·실제 증강 설정 ID·rewardPoints 필요 |
| 65 | 내 업로드 데이터셋 목록 | 시작 전 | GET `/api/v1/assets/datasets?type=UPLOADED&page=0&size=10` | 구현 | 부분 연결 | 명세 /datasets?type=uploaded 수정. 실제 목록 호출, 후속 페이지 확인 |
| 66 | 내 증강 데이터셋 목록 | 시작 전 | GET `/api/v1/assets/datasets?type=AUGMENTED&page=0&size=10` | 구현 | 부분 연결 | 명세 /datasets?type=augmented 수정. 실데이터 생성은 AI 연결에 의존 |
| 67 | 내 Fork 레시피 목록 | 시작 전 | GET `/api/v1/assets/recipes?type=FORKED&page=0&size=10` | 구현 | 부분 연결 | 명세 /recipes?type=forked 수정. 목록 API 존재, Fork 버튼 실제 등록과 별도 |
| 68 | 내 레시피 목록 | 시작 전 | GET `/api/v1/assets/recipes?type=MINE&page=0&size=10` | 구현 | 부분 연결 | 명세 /recipes?type=uploaded 수정. MINE 사용 |

근거: [FE 자산](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAssetStore.ts), [FE 커뮤니티](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useCommunityStore.ts), [BE 내 데이터셋](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/dataset/controller/AssetDatasetController.java), [BE 내 레시피](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/recipe/controller/AssetRecipeController.java), [BE 후기](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/recipe/controller/RecipeReviewController.java), [BE 검수](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/controller/InspectionController.java), [BE 파일](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/file/controller/FileController.java).

## 내 프로젝트

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 69 | 프로젝트 배너 파일 교체/삭제 | 시작 전 | PATCH `/api/v1/projects/{projectId}/banner` | 구현 | 미연동 | 배너 파일 API 호출 없음. 일반 URL 입력과 별개 |
| 70 | 관리/참여 프로젝트 목록 | 완료 | GET `/api/v1/projects` | 구현 | 화면·요청 연결 | 실제 프로젝트 목록 호출. 대시보드 예시 프로젝트 목록은 별도 교체 필요 |
| 71 | 프로젝트 생성 | 진행 중 | POST `/api/v1/projects` | 구현 | 화면·요청 연결 | 생성 폼과 서버 요청 존재. 초대·권한 포함 끝까지 확인 |

근거: [FE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useProjectStore.ts), [BE 프로젝트](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/project/controller/ProjectController.java).

## 마이페이지

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 72 | 다른 사용자 공개 프로필 | 시작 전 | GET `/api/v1/users/{userId}` | 기본 구현·확장 별도 브랜치 | 부분 연결 | 명세 BE 진행 중은 기본/확장 분리. #195 publicActivities 확장은 기본 브랜치 미병합 |
| 73 | 닉네임 수정 | 완료 | PUT `/api/v1/profile/nickname` | 구현 | 화면·요청 연결 | nickname 요청·재조회 확인 |
| 74 | 소개글 수정 | 완료 | PUT `/api/v1/profile/introduction` | 구현 | 화면·요청 연결 | body의 항목 이름 bio |
| 75 | 위치 수정 | 완료 | PUT `/api/v1/profile/location` | 구현 | 화면·요청 연결 | 스크린샷 하단 일부만 보이는 행. 위치=location |
| 76 | 프로젝트 프로필 노출 설정 | 완료 | PUT `/api/v1/users/me/projects/visibility` | 구현 | 화면·요청 연결 | 프로젝트 자체 비공개와 프로필 노출 공개를 구분 |
| 77 | 내 활동 목록 | 시작 전 | GET `/api/v1/mypage/activities?size=20&cursor=...` | 본인 목록 구현 | 부분 연결 | 명세 /users/{id}/activities 없음. items/hasNext/nextCursor. 현재 첫 20건만, 빈 목록에도 예시 잔존 |
| 78 | 활동 프로필 노출 설정 | 시작 전 | PATCH `/api/v1/users/me/activities/visibility` | 구현·응답 불일치 | 부분 연결 | 서버 isMyPageVisible 변경, 목록 isPublic 반환. FE type+id 아닌 id만 사용해 항목 충돌 가능 |

근거: [FE 프로필](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/ProfilePage.tsx), [FE 사용자](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAuthStore.ts), [BE 사용자](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/controller/UserController.java), [BE 활동 응답](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/dto/response/MyActivityListResponse.java).

## 로그인

| 번호 | 기능 | 사진 FE | 현재 방식·주소 또는 예정 규격 | BE 코드 | FE 판정 | 수정·남은 일 |
|---|---|---|---|---|---|---|
| 79 | 로그아웃 | 완료 | POST `/auth/logout` | 구현 | 화면·요청 연결 | 쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도 |
| 80 | 토큰 재발급 | 완료 | POST `/auth/refresh` | 구현 | 화면·요청 연결 | 쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도 |
| 81 | 구글 로그인 | 완료 | GET `/oauth2/authorization/google` | 구현 | 화면·요청 연결 | 쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도 |
| 82 | 내 정보 조회 | 완료 | GET `/api/v1/users/me` | 구현 | 화면·요청 연결 | 쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도 |
| 83 | 최초 회원 정보 입력 | 완료 | POST `/api/v1/onboarding` | 구현 | 화면·요청 연결 | 쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도 |
| 84 | 계정 탈퇴 | 완료 | DELETE `/api/v1/users/me` | 구현 | 화면·요청 연결 | 쿠키 인증 요청 존재. 기능별 저장·만료·재조회 실서버 확인은 별도 |

근거: [FE 사용자](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAuthStore.ts), [FE 통신](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/lib/axios.ts), [BE 인증](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/auth/controller/AuthController.java), [BE 사용자](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/controller/UserController.java).

## 사진 외에 추가할 API·주의사항

| 기능 | 현재 코드 | 필요한 반영 |
|---|---|---|
| 전문가 인증 | POST /api/v1/experts/me, multipart certificationFile | FE /users/me/expert 주소 수정. PDF/JPG/JPEG/PNG 최대 10MB |
| 이미지별 검수 의견 | PATCH /api/v1/inspections/{id}/images/{imageId}/comment, {comment} | 호출 있음. 실제 작업/이미지 번호로 재조회 검증 |
| 팝업 알림 숨김 | DELETE /api/v1/notifications/popup?notificationId=... | 단건 연결. 번호 생략은 전체 숨김. 영구 삭제와 구분 |
| 웹사이트·사진 | PUT /api/v1/profile/website의 websiteUrl; PUT /api/v1/profile/image의 파일 image | 호출 있음. 숨겨진 원본 행의 상태까지는 판정 불가 |
| BASIC/PRO 변경 | PUT /api/v1/users/me/plan, planType | 호출 있음. 실제 결제 구현이라는 뜻은 아님 |
| 프로필 내 프로젝트 | GET /api/v1/projects/me?size=6&isPublic=true&cursor=... | FE 다음 cursor 조회 존재. 타인 프로필에서도 /me를 사용하는 범위 확인 |
| AI 생성·상태·취소 | FE POST /projects/{id}/jobs, GET /jobs/{id}, POST /jobs/{id}/cancel 가정 | 해당 BE 접수 API 없음. 정식 계약 합의 |

검수 신청의 현재 요청은 {targetType:"AUGMENTED_DATA", targetId:실제_증강설정번호, reason:"요청 메모", rewardPoints:포인트}다. targetId는 현재 처리 코드가 찾는 AugmentationConfig의 DB 번호다. 커뮤니티 datasetId나 JOB-001 같은 표시 번호와 바꿔 쓰면 안 된다. 본인 증강 데이터만 지원하며, 중복/소유자/포인트 검증과 신청 즉시 포인트 차감이 있다.

승인/반려는 PATCH /inspections/{inspectionId}/approve 또는 /reject에 {expertComment:"의견"}을 보낸다. 반려 의견은 필수다. inspectionId는 ExpertTask의 DB 번호이며 시작 API의 taskId와 같은 자원을 가리킨다. reviewCode에서 숫자를 추출하는 현재 FE 대신 목록에서 실제 ID를 받아야 한다.

내 활동 조회 응답은 {items,hasNext,nextCursor}다. 다음 요청에 nextCursor를 그대로 넣는다. 현재 FE는 첫 20개 안에서 표시 개수만 늘린다. isPublic(콘텐츠 자체 공개)과 isMyPageVisible(프로필에 표시)을 구분해야 한다. BE 변경은 프로필 노출값을 저장하지만 목록은 콘텐츠 공개값을 반환해 응답 보완이 필요하다.

알림 PageResponse의 페이지 번호는 page다. FE number와 맞춰야 한다. 소프트 삭제는 기록을 남기고 숨김, 하드 삭제는 영구 삭제다. 조회/읽음/삭제 실패가 로컬 성공으로 보이는 흐름을 수정한다.

ML 응답은 job_id이며 FE jobId와 직접 호환되지 않는다. **README/MIGRATION에는 FAILURE를 외부 API 상태처럼 쓴 부분이 있지만, 실제 라우터는 내부 FAILURE를 외부 FAILED로 변환한다.** 현재 외부 상태는 PENDING/STARTED/RUNNING/SUCCESS/FAILED/CANCELLED다. 서버 문서도 코드에 맞춰 정정한다. BE가 COMPLETED 등으로 바꾸면 변환표를 명세에 추가한다.

## Notion 반영 순서

1. 시작 전을 일괄 완료로 바꾸지 말고, 이 표의 부분 연결/규격 불일치/함수만 있음을 구분한다.
2. URL·Method·요청 항목은 구현으로 수정한다. 미구현 AI는 예정 규격으로 표시한다.
3. 실서버 확인 열을 추가해 저장 후 새로고침·실패·권한·재조회 검증 날짜/증거를 남긴다.
4. 보이지 않는 7개는 원본 행을 확인한 후 판정한다.
5. CSV는 비교용 별도 표로 가져오거나 복사한다. 원본 행을 무조건 덮어쓰지 않는다.

자세한 작업 흐름·담당자별 과제는 같은 폴더의 2026-10-09_Meeting_Followup.md를 참고한다.

## 추가 첨부 ML 자료 반영

취소 문의6개·추가 연동 문의11개와 초기 ML 소개/명세 문서를 합친 [최신 통합본](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/docs/2026-10-09_Integrated_Meeting_Brief.md)을 함께 참고한다.

추가로 확인한 내용: 최신 증강의 sampling_steps/guidance_scale/model_name은 요청 스키마에 있지만 증강 계산에 전달되지 않는다. 학습 query_images_base64/has_query_labels도 학습 워커 미사용이다. 현재 컨테이너 간 storage 공유와 S3 이전 결과 다운로드가 빠져 있어 실제 증강→학습→분류 연결이 필요하다. health의 ok와 모의 접수 테스트 성공은 GPU·워커·S3·BE 전체 연결 완료를 의미하지 않는다.
