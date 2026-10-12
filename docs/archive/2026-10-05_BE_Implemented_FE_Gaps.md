**BE 구현 완료 기능 중 FE 미연동·불일치 목록 — 2026-10-05**

API는 화면이 서버에 요청하고 결과를 받는 통신 약속이다. 요청 주소, 요청 방식, 항목 이름이 모두 맞아야 작동한다. FE는 사용자가 보는 화면, BE는 계정·권한·데이터를 관리하는 서버를 뜻한다.

**확인 범위와 결론**

BE develop a7825f2와 원격 main b967864의 소스는 같고, 이번 조회에서도 원격 기준은 바뀌지 않았다. FE main 69ec301을 비교했다. 서버의 요청 접수 코드뿐 아니라 실제 처리 코드, FE 호출 함수와 화면 사용 여부를 대조했다. 실제 배포 서버에서 클릭·저장까지 시험한 결과는 아니다. 아래의 ‘BE 구현됨’은 해당 기준 코드에 처리 로직이 있다는 의미다.

미연동은 세 종류다. ① 서버 호출 자체가 없음, ② 호출 함수는 있지만 화면이 사용하지 않음, ③ 화면에서 호출하나 서버의 통신 약속과 다름. 세 경우 모두 ‘서버 구현 완료 = 사용자 사용 가능’은 아니다.

**1. FE에서 우선 연결하거나 수정할 수 있는 항목**

| 우선순위 | 기능 | BE 현재 구현 | FE 현재 상태 | 해야 할 작업 |
|---|---|---|---|---|
| 1 | 전문가 인증 신청 | 증빙 파일 제출, 검증, 저장, 신청 상태 관리 | 다른 주소로 요청 | `/users/me/expert`를 `/experts/me`로 맞추고 신청 후 상태 갱신 |
| 1 | 검수 승인·반려 요청 | 최종 판정 저장 및 보상 처리 | POST로 보내며 의견 항목 이름도 다름 | PATCH 방식과 `expertComment`로 맞춤. 실제 검수 번호 확보는 아래 별도 확인 필요 |
| 1 | 레시피 상세 | 상세 설명·설정·검수 결과 조회 | 조회 함수는 있으나 상세 화면에서 호출하지 않음. 목록에 예시 설정·설명을 붙여 표시 | 상세 진입 때 실제 상세를 조회하고 커뮤니티·내 자산 양쪽에 표시 |
| 1 | 레시피 Fork | 레시피를 내 비공개 자산으로 복사하고 기록 | 서버 호출 함수는 있으나 버튼은 화면 내부 목록만 변경 | 실제 복사 요청 후 내 자산 재조회. 새로고침 후에도 남는지 확인 |
| 1 | 검수 결과 표시 | 데이터셋·레시피 응답에 상태와 결과 포함 | 자산 결과 창에 예시 전문가·95점·날짜가 고정 | 실제 결과를 전달하고 점수가 없으면 ‘점수 없음’ 처리. 버튼 연결도 수정 |
| 2 | 전문가 성과 | 획득 포인트, 완료 건수, 상위 비율, 만족도 조회 | 성과 API 미호출. 12,500포인트·상위 5%·만족도 4.9 고정 | 성과 조회 후 실제 수치 표시. 만족도 데이터가 없으면 ‘평가 없음’ |
| 2 | 검수 상세 복원 | 저장한 의견, 실제 증강 설정, 이미지별 의견 반환 | 의견과 설정을 다른 항목 이름에서 읽거나 고정값 사용 | 실제 응답의 `expertComment`, `augmentationParams` 사용. 상세 번호 문제는 별도 해결 |
| 2 | 레시피 후기·답글 | 목록·작성·수정·삭제와 평점 처리 | 예시 후기 2개 표시. 실제 목록·작성·수정 연결 없음. 삭제만 서버 호출 | 실데이터 목록부터 연결하고 작성·수정·답글 연결. 실제 후기 번호로 본인 글만 삭제 |
| 3 | 프로젝트 배너 파일 | 이미지 파일 교체와 삭제 | URL 입력은 있으나 배너 파일 API 미호출 | 파일 선택·업로드·삭제 연결, 관리자 권한 반영 |
| 3 | 목록 더 보기·정렬 | 다음 페이지 및 정렬 기능 제공 | 여러 화면이 첫 10~20건만 가져오고 후속 조회 없음 | 다음 페이지/정렬을 서버 조회와 연결. 내 활동은 다음 조회 위치 값 사용 |

숫자가 작은 항목부터 처리하는 것을 권한다. 다만 검수의 전체 흐름은 2절의 BE 확인을 병행해야 한다.

**전문가 인증 신청과 최종 판정: 정확히 무엇이 다른가**

아래 주소는 공통 앞부분 `/api/v1`을 생략했다. POST와 PATCH는 서버에 요청을 보내는 방식의 이름이다. 주소가 같아도 서버가 정한 방식과 다르면 정상 처리되지 않는다.

| 기능 | FE가 현재 보내는 요청 | BE가 받는 요청 |
|---|---|---|
| 전문가 인증 | `POST /users/me/expert` | `POST /experts/me` |
| 검수 승인 | `POST /inspections/{번호}/approve`, `finalComment` | `PATCH /inspections/{번호}/approve`, `expertComment` |
| 검수 반려 | `POST /inspections/{번호}/reject`, `rejectionReason` | `PATCH /inspections/{번호}/reject`, `expertComment` |

인증 신청의 파일 항목 `certificationFile`은 이미 맞다. 검수 시작·임시 저장의 PATCH 요청은 존재하므로 검수 기능 전체가 아예 없는 것은 아니다. 최종 제출 부분은 별도로 수정해야 한다.

근거: [FE 인증 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useAuthStore.ts:226), [FE 판정 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useExpertStore.ts:138), [BE 전문가 API](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/controller/ExpertController.java:41), [BE 판정 API](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/controller/InspectionController.java:115).

**레시피 상세·Fork·후기는 각각 따로 연결해야 한다**

Fork는 원본 레시피를 내 자산으로 복사하는 기능이다. 현재 버튼은 임시 상태만 바꾸므로 서버에 복사본이 생기지 않는다. 서버 호출 함수가 있다는 사실만 확인하면 연동 완료로 오인하기 쉽다. 서버에는 복사와 중복 방지 처리가 있고, 취소 요청은 확인되지 않았으므로 단순한 켜기/끄기 버튼처럼 취급해서는 안 된다.

상세 역시 `fetchRecipeDetail` 함수는 있지만 화면 진입에서 사용하지 않는다. 커뮤니티와 내 자산 화면이 목록 데이터를 상세 모양으로 만들면서 설명·평점·설정에 예시값을 넣는다. 실제 상세 조회를 연결해야 한다. 서버의 후기 개수 `reviewCount`는 아직 0 고정 처리이므로 개수까지 완성됐다고 볼 수는 없다.

후기는 화면의 예시 번호를 실제 삭제 API로 보낼 수 있는 구조다. 실데이터 목록을 연결하기 전에는 예시 후기의 삭제가 서버 작업으로 이어지지 않도록 해야 한다. 작성은 평점이 필요하며 답글에는 평점을 보내지 않는 서버 규칙도 맞춰야 한다.

근거: [FE 상세·Fork 함수](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useCommunityStore.ts:376), [실제 상세 화면과 Fork 버튼](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/components/dashboard/RecipeDetail.tsx:42), [커뮤니티 목록 가공](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/CommunityPage.tsx:55), [BE 후기 API](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/recipe/controller/RecipeReviewController.java).

**검수 결과와 전문가 성과는 실제 값으로 교체 가능하다**

자산의 검수 결과 창은 실제 조회 결과를 받지 않고 전문가 이름·점수·날짜를 고정해서 보여준다. BE의 `inspectionResult`를 연결해야 한다. 새 판정 결과에는 점수가 없을 수도 있으므로 무조건 숫자를 보여주지 않아야 한다.

전문가 성과는 `GET /experts/me/performance`가 있는데 FE 호출이 없다. 완료 건수도 현재 화면에 올라온 작업을 세는 방식 대신 서버 집계를 사용하는 것이 맞다.

검수 상세 응답의 저장 의견은 `expertComment`, 생성 설정은 `augmentationParams`다. FE가 읽는 `draftComment`/`finalComment` 등과 맞지 않아 저장 의견이 복원되지 않거나 실제 설정 대신 예시 설정을 보여줄 수 있다. 서버 호출 실패·빈 이미지일 때 예시 이미지를 실제 검수 대상으로 보여주는 동작도 제거해야 한다.

근거: [예시 검수 결과](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/components/community/modals/VerificationResultModal.tsx:8), [전문가 화면](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/ExpertPage.tsx:148), [검수 상세 화면](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/components/dashboard/ReviewDetailPage.tsx:69), [BE 상세 응답](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/dto/response/InspectionDetailResponse.java).

**목록·배너·보조 기능**

페이지 나누기는 목록 전체를 한 번에 보내지 않고 일부씩 보내는 기능이다. 현재 커뮤니티는 첫 10건, 내 자산은 기본 첫 20건을 조회하는 흐름이다. 서버의 다음 페이지 정보를 화면에서 활용하지 않아 이후 항목을 못 볼 수 있다. 알림의 후속 페이지 조회, 내 활동의 `nextCursor`도 연결해야 한다. `nextCursor`는 ‘다음 조회를 어디서부터 시작할지’ 알려주는 값이며, 이미 가져온 20개를 화면에서 더 보여주는 것과 다르다.

프로젝트 배너는 `PATCH /projects/{projectId}/banner`로 파일을 보내며, 파일 없이 요청하면 제거한다. 현재 URL 입력 기능과 별개로 파일 업로드 기능이 비어 있다.

추가로 이메일 기반 사용자 확인 `GET /users/search?email=...`은 FE에서 사용하지 않는다. 초대 전 사용자 존재 여부 안내에 활용할 수 있으나, 현재 이메일 초대 요청을 보내기 위한 필수 단계는 아니다. 알림 전체 삭제 함수도 있지만 화면 연결이 확인되지 않는다. 작성자 프로필 링크 일부는 실제 작성자 번호 대신 `/dashboard/profile/2`로 고정돼 있어 수정 대상이다. 이 항목들은 핵심 흐름을 연결한 다음 처리할 수 있다.

근거: [BE 배너 API](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/project/controller/ProjectController.java:120), [FE 배너 안내](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/ProjectsPage.tsx:426), [FE 내 활동 조회](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/ProfilePage.tsx:469).

**2. 서버의 일부 기능은 있지만 FE만 고쳐서 완성된다고 말하기 어려운 항목**

| 기능 | 확인된 문제 | 다음 확인/작업 |
|---|---|---|
| 검수 신청 대상 | 서버는 `AUGMENTED_DATA`만 허용. FE는 `RECIPE` 또는 서버에 없는 `DATASET`을 보냄 | 증강 데이터만 신청할지, 레시피·업로드 데이터까지 서버가 지원할지 범위 확정 |
| 검수 신청 값 | 서버는 `rewardPoints`, FE는 `reward`. 대상 번호는 서버의 증강 설정 번호인데 FE는 레시피/데이터셋 번호를 보냄 | 항목 이름 수정 + 실제 증강 설정 번호를 어느 응답에서 얻는지 확정. 문자열만 바꿔서는 해결 안 됨 |
| 검수 작업 번호 | 상세·시작·판정에는 실제 작업 번호가 필요. 목록 응답에는 `reviewCode`가 있고 FE는 숫자만 추출해 사용 | 목록에 실제 `taskId`를 내려주거나 표시 코드와 실제 번호의 대응을 보장. 임의 숫자 추출 제거 |
| 프로젝트 초대 수락·거절 | 처리 API는 있지만 FE에서 받은 초대와 `invitationId`를 안정적으로 얻는 조회 흐름이 부족 | 받은 초대 조회 또는 알림의 초대 번호 제공 후 수락·거절 화면 연결 |
| AI 작업 댓글 | 댓글 작성·수정·삭제는 있지만 실작업 번호와 댓글 조회 흐름이 연결되지 않음 | 실제 작업 조회·댓글 조회 경로를 먼저 마련. 결과 화면의 임시 댓글만 교체해서는 부족 |

검수 신청 BE는 보유 포인트 확인·차감과 중복 신청 방지까지 구현돼 있다. 따라서 지금 만든 모든 검수 버튼을 같은 요청으로 연결할 수 있다고 이해하면 안 된다. ‘증강 데이터 검수 접수’라는 지원 범위와 번호를 먼저 맞춰야 한다.

근거: [FE 신청 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useCommunityStore.ts:408), [BE 필수 요청값](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/dto/request/InspectionCreateRequest.java), [BE 대상 제한과 처리](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/service/InspectionServiceImpl.java:76), [BE 검수 목록 항목](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/dto/response/ExpertTaskSummaryResponse.java).

**3. 이번 ‘BE 완료·FE 미연동’ 목록에서 제외한 것**

- AI 작업 생성·진행 조회·취소 및 BE↔ML 연결: 기준 BE에 필요한 구현이 없어 FE만의 누락으로 분류하지 않았다.
- 프로젝트 전체 삭제: 기준 BE API 부재.
- 공개 프로필 확장 #195: 별도 브랜치에 있고 main/develop 미반영. 이미 있는 기본 프로필 조회·작성자 링크 문제와 구분한다.
- 내 활동 공개 설정의 저장값/조회값 불일치: BE 응답도 수정해야 한다.

**4. 작업 완료를 판단할 기준**

1. 요청이 성공하면 서버에 실제 기록이 생기고, 새로고침 후 조회해도 유지된다.
2. 실패하면 성공 표시나 예시 데이터로 바뀌지 않고 실패 이유를 보여준다.
3. 다른 사용자로 확인할 때 권한과 작성자 표시가 맞다.
4. 목록에 예시 데이터보다 많은 기록을 넣어 다음 페이지까지 볼 수 있다.
5. 검수는 실제 증강 설정 번호 → 신청 → 실제 검수 작업 번호 → 저장 의견 복원 → 판정 → 신청자 결과 조회까지 연결돼야 완료다.

이 문서는 분석 결과이며 앱 소스는 변경하지 않았다. 운영 환경에서 실제 요청을 보내 검수·포인트·복사 기록을 만들지는 않았다.

**이전 보고서 정정**

이전 전체 현황 보고서의 ‘검수 승인·반려 POST 반영’ 표현은 연동 완료로 오해하게 하는 잘못된 설명이었다. 현재 BE는 PATCH와 `expertComment`를 요구하고 FE는 다른 요청을 보내므로 수정이 필요하다. 이전 보고서의 해당 행도 정정했다. API 호출 코드가 있는 것과 화면에서 정상적으로 사용하는 것을 구분한 이번 상세 목록을 우선 기준으로 삼는다.
