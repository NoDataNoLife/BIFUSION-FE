**BIFUSION 프로젝트 현황과 후속 작업 — 2026년 10월 5일**

이 문서는 프론트엔드(FE, 사용자가 보는 화면), 백엔드(BE, 계정·권한·기록을 처리하는 서버), ML(기계학습 계산 서버)을 함께 검토한 결과다. 코드에 익숙하지 않은 담당자가 현재 상태를 이해하고 팀에 다음 작업을 요청하는 데 목적이 있다.

**후속 정정(2026-10-05):** 전문가 인증 신청 주소와 검수 승인·반려 요청 방식·항목이 BE와 다르다. 검수 신청은 BE가 증강 데이터만 지원한다. 레시피 상세·Fork 함수도 화면에서는 사용되지 않는다. 구체적인 연동 판정은 [BE 구현·FE 미연동 상세 목록](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/docs/2026-10-05_BE_Implemented_FE_Gaps.md)을 우선 참고한다.

**먼저 알아야 할 결론**

서비스 전체를 “연동 완료”로 보기 어렵다. 계정·커뮤니티·자산·검수 기능에는 실제 서버 연동이 많이 들어가 있지만, 핵심인 이미지 증강 → 모델 학습 → 새 이미지 분류 흐름은 연결이 끊겨 있고 화면용 가짜 결과도 남아 있다.

또한 ML에는 중요한 두 버전이 공존한다. 기본 main은 8월 30일 코드이고, 별도 Medfusion 브랜치에는 10월 2일 개선이 있다. 브랜치는 같은 프로젝트의 서로 다른 작업 버전이다. 최신 개선이 다른 브랜치에 있다는 사실만으로 현재 main을 실행하는 환경에 적용되지는 않는다.

가장 먼저 할 일은 ① 적용할 ML 버전 확정, ② 오류를 성공처럼 보여주는 동작 제거, ③ 실제 이미지 한 묶음으로 끝까지 연결, ④ 결과를 새로고침 후에도 다시 조회할 수 있게 만드는 것이다.

**1. 무엇을 근거로 확인했는가**

| 대상 | 확인 기준 | 해석 |
|---|---|---|
| BE 로컬 | develop / a7825f2 | 원격 develop과 같은 커밋 |
| BE 원격 main | b967864, 9월 4일 | develop과 소스 차이 없음. 실제 운영 서버가 이 커밋을 실행하는지는 미확인 |
| FE 로컬 | main / 69ec301 | 원격 main보다 커밋 2개 앞서지만 파일 차이는 진행률 제안 문서 1개뿐 |
| FE 원격 main | 28816ee | 이번에 본 FE 실행 코드와 같은 내용 |
| ML 로컬·원격 main | a33ad89, 8월 30일 | 구형 DDPM 구현 |
| ML 원격 Medfusion | f473b6024b31355c9be75a6bcb9779919c49131d, 10월 2일 | 원격 최신 기록을 가져와 실제 파일까지 읽음. main에는 미반영 |
| BE 별도 작업 | feature/#195-user-public-profile / 39e402a, 9월 8일 | 공개 프로필 확장 작업이 있으나 main/develop에 아직 포함되지 않음 |

사용자가 첨부한 ML 연동 답변, FE docs의 개발·장애 기록, 상위 trouble-shooting 문서도 대조했다. GitHub 연결 도구는 BE·ML 이슈 검색 권한 오류를 반환했고 FE 이슈 검색은 빈 결과였다. 따라서 이 문서의 “과거 이슈”는 첨부 자료·로컬 문서·커밋 기록을 기준으로 하며, 온라인 이슈의 댓글과 종료 상태까지 확인했다는 의미는 아니다. Git 원격 브랜치 조회는 별도로 성공했다.

애플리케이션 소스는 수정하지 않았다. ML 원격 기록을 갱신했고 이 보고서를 추가했다. 운영 서버 변경, 배포, 팀원에게 메시지 전송은 하지 않았다.

**2. 전체 구조를 쉽게 이해하기**

~~~mermaid
flowchart LR
    F["프론트엔드<br/>화면·파일 선택·진행률"]
    B["백엔드<br/>로그인·권한·프로젝트·기록"]
    D["PostgreSQL<br/>장기 보관하는 데이터베이스"]
    A["ML 접수 서버<br/>FastAPI"]
    Q["Redis + Celery<br/>작업 대기열과 실행 관리"]
    W["작업 실행 프로세스<br/>증강·학습·추론"]
    S["파일 저장소<br/>로컬 또는 S3"]
    F -->|"일반 기능 API"| B
    B --> D
    B -.->|"AI 작업 연결부 미구현"| A
    A --> Q
    Q --> W
    W --> S
~~~

API는 “다른 프로그램에게 일을 요청하고 결과를 받는 약속”이다. 예를 들어 “이 프로젝트의 학습을 시작해줘”라는 요청에는 프로젝트 번호, 이미지, 설정값을 어떤 이름으로 보낼지 정해져 있어야 한다.

현재 일반 기능은 FE가 BE에 요청하고 BE가 DB에 저장하거나 읽는 구조다. DB는 새로고침이나 재접속 후에도 기록을 유지하는 보관소다. 파일은 별도로 S3라는 클라우드 파일 창고에 저장하고, BE가 잠깐 사용할 수 있는 다운로드 주소를 발급하는 부분이 있다.

AI 작업은 오래 걸리므로 ML 접수 서버가 작업 번호(job_id)를 먼저 주고, Celery라는 작업 관리자와 워커라는 실행 프로세스가 뒤에서 계산한다. Redis는 작업 대기열과 일시적인 상태·결과 보관에 쓰인다. FE가 1.5초마다 상태를 묻는 방식이 구현돼 있는데, 이런 반복 조회를 폴링이라고 한다.

필요한 완성 흐름은 다음과 같다.

1. 실제 정상·비정상 이미지 업로드 → BE가 사용 권한과 파일 번호 확인.
2. BE가 ML에 증강 요청 → BE 작업 번호와 ML 작업 번호를 연결해 저장.
3. ML이 증강 결과 파일과 dataset_id(생성된 데이터 묶음 번호)를 반환.
4. 그 dataset_id로 학습 → model_id(학습된 모델 번호)와 실제 성능 수치를 반환.
5. 그 model_id와 새로운 이미지로 분류 → 이미지별 NORMAL/ANOMALY 결과 반환.
6. BE가 결과를 장기 저장 → FE는 기록을 조회하여 화면에 표시.

BE의 숫자형 jobId, ML의 문자열 job_id, 표시용 JOB-001 같은 이름은 같은 것이 아니다. 번호 사이의 대응관계를 BE가 관리해야 한다.

FE의 주요 도구는 React(화면 구성), TypeScript(데이터 형식 검사), Zustand(화면들이 함께 쓰는 임시 상태 저장), Axios(서버 통신)다. BE는 Java/Spring Boot로 구성돼 있다. ML은 Python/FastAPI, Celery, PyTorch를 쓴다. PyTorch는 모델 계산을 수행하는 도구다. 중요한 것은 도구 이름을 외우는 것보다 “어느 쪽이 무엇을 실제로 저장하고 계산하는가”를 구분하는 것이다.

**3. 현재 기능별로 어디까지 왔는가**

아래의 “연동 코드 있음”은 운영 환경에서 모든 동작을 재검증했다는 뜻이 아니다.

| 기능 | 현재 판정 | 인지해야 할 점 |
|---|---|---|
| 로그인·기본 회원 정보 | 실제 API 연동 코드 있음 | 쿠키로 로그인 유지, 일부 401 응답 때 로그인 갱신 처리. 새로고침 때 사용자 조회 |
| 프로젝트·멤버 관리 | 실제 API 연동 코드 있음 | 프로젝트 전체 삭제와 받은 초대 목록 흐름은 별도 미완료 |
| 커뮤니티·데이터셋·레시피 | 실제 API 연동 코드 있음 | 데이터셋 수정·다운로드, 레시피 삭제 등 반영. 모든 화면이 완성된 것은 아님 |
| 내 자산 | 실제 목록 API 사용 | 데이터셋·레시피 목록은 실데이터. 자산 상세의 검증 버튼 연결 오류 존재 |
| 전문가 검수 | API 호출은 있으나 요청·응답 불일치 존재 | 승인·반려 방식과 의견 항목, 신청 대상·포인트 항목, 상세 응답 이름, 검수 ID, 가짜 이미지 및 빌드 오류 문제 |
| 알림 | 실제 API와 가짜 기본값 혼재 | 조회 실패 때 가짜 알림이 남고, 읽음·삭제 실패도 화면에서는 성공처럼 처리 |
| 마이페이지 내 활동 | 첫 목록·공개 설정 요청 연결 | 빈 목록 처리, 다음 페이지, 식별자, 저장·조회 필드에 문제 |
| 별도 “최근 활동” 화면 | 고정 예시 데이터 | 마이페이지 활동 연동과 별개인 ActivitiesPage |
| AI 설정·진행 화면 | 화면 흐름과 API 호출 틀 있음 | 실패하면 자동 모의 작업으로 바뀜. 실제 파일 내용 미전송 |
| AI 결과·다운로드 | 고정 예시가 대부분 | 학습 94.2%, AUROC 0.982, 추론 표 등은 실제 결과 연결 안 됨 |
| BE↔ML AI 작업 연결 | main/develop에서 미구현 | 작업 생성·상태·취소 및 ML 조회·기록 갱신 구현이 없음 |
| ML 계산 | main과 Medfusion의 구현 수준이 다름 | 최신 브랜치의 개선을 구형 main 상태와 혼동하면 안 됨 |

**4. 최근 작업 내용 — 날짜순으로 기억할 것**

| 기간 | 작업 | 현재 의미 |
|---|---|---|
| 7월 23일 | S3 이미지 주소를 재가공하지 않도록 수정 | 서명된 임시 주소를 훼손하던 문제에 대응 |
| 8월 초 | 배포 주소 설정, 새로고침 경로 처리 | VITE_API_URL 및 vercel.json 반영. 실제 배포 설정은 별도 확인 필요 |
| 8월 13~25일 | 커뮤니티·내 자산·다운로드·검수 API 연동 | 일반 서비스 기능을 실제 API로 교체한 구간 |
| 8월 25~26일 BE | 알림, 내 활동 조회, 검수 관련 오류 수정 | FE가 맞춰야 할 실제 응답 형식의 기준 |
| 8월 30일 ML main | 증강·학습·추론 워커, 상태 API, 테스트 | 실행 골격 마련. 잘못된 입력을 임의 데이터로 대체하는 문제 포함 |
| 9월 4일 BE | 검수·전문가·초대 조회의 빈 값/중복 키 오류 수정 | main/develop 코드에 반영됨 |
| 9월 8일 BE 별도 브랜치 | 공개 프로필 활동 응답 개편 | 아직 main/develop 반영 전 |
| 9월 13~14일 FE | Job 폴링, 학습·추론 화면 흐름, 내 활동·알림 연동 | 화면 전환과 API 요청이 추가됐지만 실제 전체 연결 완료는 아님 |
| 9월 22~25일 ML Medfusion | 생성 모델 교체, 가짜 데이터 대체 제거, K-shot 학습 개선 | main에 없는 중요한 개선 |
| 10월 2일 ML Medfusion | eye VAE 기반 업로드별 추가 학습과 증강 | 최신 구현. 외부 모델 코드·가중치와 배포 준비가 더 필요 |

커밋은 저장된 변경 묶음, 병합은 다른 브랜치의 변경을 합치는 작업이다. “커밋이 존재함”, “기본 브랜치에 병합됨”, “서버에 배포됨”, “실제 입력으로 검증됨”은 각각 별도 상태다.

**5. 프론트엔드에서 우선 고칠 문제**

**A. 서버 실패가 가짜 성공으로 바뀐다 — 최우선**

useJobStore의 createJob은 서버 요청이 실패하면 예외를 잡고 임의 작업 번호를 만든다. 이후 서버를 확인하는 대신 메모리에 있는 진행률을 무작위로 높여 SUCCESS로 끝낸다. 로그인 오류, 없는 API, 서버 오류 등이 실제 실패로 드러나지 않을 수 있다.

상태 조회 실패 시에도 직전 작업이나 “50% 진행 중” 임시 객체를 반환한다. 취소 API 실패는 무시된다. 모의 작업 기록은 브라우저 메모리에만 있으므로 새로고침하면 사라진다.

조치: 실제 서비스 모드에서는 실패를 사용자에게 표시하고, 시연용 모드는 명시적으로 분리한다. 시연 결과에는 시연임을 표시한다. 새로고침은 BE의 저장된 작업 기록으로 복원한다.

근거: [useJobStore.ts](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useJobStore.ts:77)

**B. 업로드 화면은 있지만 실제 이미지 내용은 보내지 않는다**

증강은 normalCount/anomalyCount, 학습은 queryCount, 추론은 imageCount를 전송한다. 파일을 선택했다는 사실과 장수만 보내며, AI에 필요한 이미지 내용이나 저장된 파일 번호는 전달하지 않는다.

학습 데이터 선택지는 JOB-001 같은 고정 목록이고, 추론 모델 선택지도 model-1/model-2 같은 고정 목록이다. 바로 앞 단계에서 생성한 실제 dataset_id/model_id와 연결되지 않는다.

조치: 이미지 전송 방식을 BE와 확정하고, 실제 업로드된 파일을 작업 요청에 연결한다. 선택 목록은 서버에서 성공한 데이터셋·모델을 조회해 채운다.

근거: [증강 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/AugmentSetupPage.tsx:41), [학습 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/TrainSetupPage.tsx:28), [추론 요청](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/InferenceSetupPage.tsx:34)

**C. 결과 화면의 수치는 실험 결과가 아니다**

TrainResultPage의 정확도 94.2%, AUROC 0.982는 코드에 직접 적힌 값이다. AUROC는 정상과 비정상을 구분하는 정도를 평가하는 지표인데, 여기서는 실제 계산 결과를 표시하지 않는다. InferenceResultPage의 정확도 88%, 예측 목록도 고정값이다. AugmentResultPage의 장수·시간·용량도 예시다.

세 결과 화면의 다운로드 버튼에는 실제 다운로드 동작이 연결되지 않았다. 팀 댓글도 해당 화면의 임시 상태만 바뀐다. ML이 진짜 결과를 주더라도 결과 화면 연결 작업이 별도로 필요하다.

근거: [학습 결과](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/TrainResultPage.tsx:103), [추론 결과](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/InferenceResultPage.tsx:41)

**D. 100%만으로 성공 처리한다**

useJobPolling은 성공 상태뿐 아니라 progress가 100 이상이어도 완료 화면으로 이동한다. ML 학습은 마지막 학습 반복이 끝나면 파일 저장 전에 100을 기록할 수 있다. 저장 실패가 뒤따라도 FE가 먼저 성공 화면으로 갈 수 있다.

조치: SUCCESS 또는 BE가 합의한 COMPLETED 상태에서만 완료 처리한다. 진행률은 표시용 숫자다. 취소도 서버의 중단 확인과 화면 이탈을 구분한다.

근거: [useJobPolling.ts](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/hooks/useJobPolling.ts:46)

**6. ML의 구형 main과 최신 Medfusion을 구분하기**

| 항목 | 현재 체크아웃된 main | 최신 Medfusion 브랜치 |
|---|---|---|
| 이미지 생성 | DDPM: 잡음에서 이미지를 만드는 생성 모델 | Medfusion: 압축된 이미지 표현을 이용하는 생성 모델 |
| 업로드 이미지 활용 | 생성 조건으로 사용하지 않고 원본과 생성물을 합침 | 정상/비정상 각각 업로드를 이용해 모델을 추가 학습한 뒤 원본의 변형본 생성 |
| 정상/비정상 합성 구분 | 한 번에 생성 후 앞뒤 절반에 임의 라벨 | 클래스마다 별도 업로드로 생성 호출 |
| 입력·모델·데이터 없음 | 노이즈·임의 데이터·초기 모델로 대체하는 코드 존재 | 주요 대체 로직 제거, 명시적인 실패 처리 |
| K-shot | 값을 받지만 실제 학습 표본 선택에는 미사용 | 클래스당 기준 이미지 수로 실제 사용 |
| 색상 | 흑백 1채널 | 기본 RGB 3채널 |
| 배포 의존성 | 자체 DDPM 구현과 모델 파일 | 별도 bifusion 패키지, medical_diffusion 코드, 생성·복원용 모델 파일 2개 필요 |
| 취소/등록부/S3 입력/기록 보완 | 미구현 | 관련 파일 변경 없어 여전히 미구현 |

K-shot은 정상·비정상 각각 몇 개의 기준 예시를 이용해 학습할지를 뜻한다. ProtoNet은 이미지 특징을 숫자로 바꾼 후, 각 클래스의 평균 특징과 얼마나 가까운지로 분류하는 방식이다. 최신 브랜치는 기준 이미지와 연습 문제 이미지를 나누어 반복 학습하도록 개선됐다.

최신 증강에서는 VAE라는 이미지 압축·복원 모델을 고정하고, 생성 모델을 업로드 이미지에 맞춰 추가 학습한다. 이를 파인튜닝이라고 한다. 이후 원본 이미지를 바탕으로 변형 이미지를 만드는 img2img 과정을 사용한다. 웹 서버 코드에서는 실제 계산을 별도 bifusion 패키지에 위임한다.

**최신 브랜치를 가져오기만 하면 끝나지 않는 이유**

- 별도 bifusion 패키지와 medical_diffusion 소스가 현재 세 저장소 안에 포함돼 있지 않다. 생성 코드의 내부 동작·실측 품질은 이번에 검증하지 못했다.
- 설정 기본 경로는 다른 개발자의 Windows 로컬 경로다. 배포 서버에서 실제 존재하는 경로로 바꿔야 한다.
- Dockerfile/Compose에는 외부 코드·가중치를 준비하는 추가 구성이 없다. Docker 컨테이너는 프로그램 실행에 필요한 파일과 환경을 묶은 공간이다.
- 증강·학습·추론 워커끼리 결과 storage를 공유하는 설정이 없다. 학습·진단은 여전히 로컬 파일만 찾고 S3에서 이전 결과를 내려받지 않는다.
- FE가 보내는 증강 sampling_steps/guidance_scale은 최신 증강 워커에서 읽지 않는다. 실제 생성은 서버의 MEDFUSION_* 설정을 사용한다. 화면에서 값을 바꿨는데 적용되지 않을 수 있다.
- query_images_base64와 has_query_labels는 최신 학습 워커에서도 사용하지 않는다. “검증 이미지와 정답을 업로드하면 성능을 계산한다”는 화면 약속을 그대로 충족하지 않는다.
- 최신 K-shot 학습도 이미지가 부족하면 중복 표본을 채우므로 기준·문제 이미지가 겹칠 수 있다. 원본과 그 변형본의 학습/평가 분리 정책도 별도 확인해야 한다. 개선된 구현과 검증된 모델 성능은 다르다.
- 최신 코드도 깨진 이미지 일부를 건너뛴다. 유효 이미지가 0장일 때의 실패와 “일부 입력이 누락됐는지 알 수 있는가”는 별도 문제다.

**인수인계 문서의 오류도 수정해야 한다**

Medfusion MIGRATION.md와 README는 API 실패값을 FAILURE로 설명하지만 실제 라우터와 응답 형식은 FAILED다. 내부 작업 관리자의 FAILURE를 외부 API의 FAILED로 바꾼다. FE에 FAILURE 처리만 추가하라고 요청하면 실제 응답과 어긋난다.

README에는 이전 흑백·무조건부 생성 설명과 설정 기본값도 남아 있다. 실제 최신 코드는 RGB 기본값과 업로드별 추가 학습 호출을 사용한다. 모델 품질·처리 시간에 관한 문서의 실측 주장은 이번 검토에서 재현하지 않았다.

근거: [최신 증강 워커](https://github.com/NoDataNoLife/BIFUSION-ML/blob/f473b6024b31355c9be75a6bcb9779919c49131d/app/workers/augmentation_worker.py), [생성 패키지 연결부](https://github.com/NoDataNoLife/BIFUSION-ML/blob/f473b6024b31355c9be75a6bcb9779919c49131d/app/services/medfusion_service.py), [최신 학습 로직](https://github.com/NoDataNoLife/BIFUSION-ML/blob/f473b6024b31355c9be75a6bcb9779919c49131d/app/services/protonet_service.py), [실제 상태 변환](https://github.com/NoDataNoLife/BIFUSION-ML/blob/f473b6024b31355c9be75a6bcb9779919c49131d/app/routers/augmentation.py)

**7. 최신 BE를 기준으로 FE가 반영·수정할 항목**

| 항목 | 이미 있는 부분 | 추가 작업 |
|---|---|---|
| 데이터셋 | 생성·상세·수정·삭제를 /datasets로 요청 | 자산 상세 검증 카드 버튼 이름 수정 및 실제 동작 확인 |
| 레시피 자산 목록 | FE의 MY 선택값을 BE의 MINE으로 변환 | 실제 목록·상세 재조회 확인 |
| 검수 API | 시작·임시저장 PATCH 호출 존재. 승인·반려 FE 요청은 BE와 불일치 | BE는 PATCH + expertComment, FE는 POST + finalComment/rejectionReason. 요청 수정 및 실제 검수 번호 연결 필요 |
| 알림 | 조회·읽음·팝업 삭제·영구 삭제 API 경로 반영 | page 필드 매핑, 실패 표시, 가짜 초기값 제거 |
| 내 활동 | /mypage/activities 및 공개 여부 변경 호출 | 빈 목록·다음 페이지·종류별 ID·공개 여부 의미 수정 |
| 공개 프로필 확장 | FE가 publicActivities를 읽으려는 코드 있음 | BE #195 브랜치 반영 여부 확정 후 activityId/type에 맞춤 |
| AI 작업 | FE에서 생성·조회·취소 주소를 호출 | BE가 실제 API·ML 호출·기록 저장을 먼저 제공해야 함 |

**검수 상세: 실제 필드와 화면이 다르다**

BE는 expertComment를 반환하지만 ReviewDetailPage는 draftComment/finalComment를 읽는다. 즉 저장한 글이 상세 재조회에서 복원되지 않을 수 있고, TypeScript 빌드도 여기서 실패한다. BE의 augmentationParams.sampling/guidance와 FE의 parameters.samplingSteps/guidanceScale도 다르다. 상세 화면은 목록에서 만든 고정 파라미터를 보여주는 부분이 있다.

검수 목록은 reviewCode만 주고 FE가 그 문자열에서 숫자를 추출하여 실제 검수 번호로 사용한다. BE 상세 API가 요구하는 것은 ExpertTask의 DB 번호다. 표시 코드와 DB 번호가 같다는 보장 대신 실제 taskId를 응답에 넣고 쓰도록 맞추는 것이 필요하다.

이미지가 없거나 조회가 실패하면 검수 화면이 샘플 이미지 6개를 만든다. 검수할 실제 파일이 없는 상황을 예시 화면으로 가리지 않아야 한다.

근거: [BE 검수 상세 형식](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/expert/dto/response/InspectionDetailResponse.java:20), [FE 검수 상세](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/components/dashboard/ReviewDetailPage.tsx:77), [FE 검수 목록](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/ExpertPage.tsx:91)

**활동 공개 여부: BE 자체의 저장·조회 의미도 맞춰야 한다**

콘텐츠 자체가 공개인지(isPublic)와 내 프로필에 그 콘텐츠를 노출할지(isMyPageVisible)는 서로 다른 설정이다. 변경 API는 isMyPageVisible을 저장하는데, 목록 API는 isPublic을 반환하고 FE는 그것을 공개 설정 스위치의 값으로 사용한다. 숨김 설정 후 새로고침하면 다른 값으로 보일 수 있다.

또한 FE는 activityId 숫자만 식별자로 쓴다. 레시피 1번과 데이터셋 1번은 다른 항목이므로 type + activityId를 함께 써야 한다. 현재는 같은 숫자를 가진 다른 종류의 항목까지 화면 상태가 바뀔 수 있다.

내 활동 조회는 처음 20개만 요청하고 BE의 nextCursor를 사용하지 않는다. 커서는 다음 목록을 이어받기 위한 책갈피다. 현재 “더 보기”는 받아 둔 항목을 5개씩 더 보여줄 뿐 서버의 다음 페이지를 가져오지 않는다. 빈 응답이면 기존 예시 활동도 지워지지 않는다.

공개 프로필 확장 브랜치는 activityId/type을 주는데 FE는 id/activityType을 읽는다. 해당 브랜치 병합 전에 함께 고쳐야 한다.

근거: [활동 조회 형식](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/dto/response/MyActivityListResponse.java:56), [공개 여부 저장](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/domain/user/service/MyActivityVisibilityServiceImpl.java:75), [FE 내 활동](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/pages/dashboard/ProfilePage.tsx:469)

**알림: 요청 경로는 맞지만 상태 처리가 불완전하다**

BE는 페이지 번호를 page로 반환하는데 FE는 number를 읽어 현재 페이지를 0으로 처리한다. 읽지 않은 개수도 전체 목록이 아니라 지금 받아 온 페이지에서만 계산한다. 읽음·삭제 실패를 무시하고 항상 성공 반환하는 동작도 수정해야 한다.

근거: [알림 저장소](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-FE/src/store/useNotificationStore.ts:114), [BE 공통 목록 응답](//wsl.localhost/Ubuntu-24.04/home/ysb/projects/BIFUSION/BIFUSION-BE/src/main/java/com/nodatanolife/bifusion_be/global/dto/response/PageResponse.java:7)

**8. 첨부한 ML 질문·답변의 후속 상태**

최신 Medfusion에서도 라우터·응답 형식·Celery 설정·스토리지·Compose는 main과 같다. 아래 미구현 항목은 최신 브랜치로 바꾸어도 남는다.

| 이전 문의 | 지금 확인한 상태 | 다음 담당/완료 기준 |
|---|---|---|
| 첫 연락 1: 취소 주소 | 세 작업 모두 취소 API 없음 | ML: 세 cancel 주소 구현 후 BE가 연결 |
| 첫 연락 2: 대기·실행·종료 상태별 취소 | 등록부와 중단 처리 없음 | ML: 대기 중 실행 방지, 실행 중 중단, 종료 후 충돌 처리 |
| 첫 연락 3: 취소 응답·진행률 | 취소 시 마지막 진행률 보존 없음 | ML: 마지막 숫자와 최종 상태를 함께 보존 |
| 첫 연락 4: 취소 후 GET | REVOKED→CANCELLED 변환만 존재 | ML: 취소된 작업 조회를 실제로 검증 |
| 첫 연락 5: GPU 회수 | 실행 검증 없음 | ML/배포: 취소 후 다음 작업 성공 및 메모리 누적 확인 |
| 첫 연락 6: 부분 파일 정리 | 취소에 따른 자동 정리 없음 | ML/BE: 작업 중단 확인 후 해당 작업 파일만 삭제 |
| 추가 문의 1: 상태값 | PENDING/STARTED/RUNNING/SUCCESS/FAILED/CANCELLED | BE: 상태 변환 합의. FAILURE는 내부값 |
| 추가 문의 2: 오류 형식 | 문자열 error, error_code 없음 | ML: 오류 종류 코드 추가 여부 결정. Medfusion의 주요 가짜 대체는 제거됨 |
| 추가 문의 3: 없는 ID | 알 수 없는 작업도 PENDING 반환 가능 | ML: 작업 등록부와 404 필요. 만료와 미존재 구분 |
| 추가 문의 4: 결과 보존 | result_expires 명시 없음. 로컬 Celery 기본값 1일 확인 | ML: 기간 명시와 Redis 재시작 보존. BE: 완료 결과 DB 보관 |
| 추가 문의 5: S3 key | URL만 반환, key/bucket 응답 없음 | ML: key/bucket 제공. BE: 필요할 때 새 다운로드 주소 발급 |
| 추가 문의 6: 이미지 전달 | base64 목록만 지원, S3 key 입력 없음 | FE/BE/ML: 실제 이미지 전달 합의. 크기·장수 제한 추가 |
| 추가 문의 7: 동시 실행 | 큐 3개, 각 워커 concurrency=1 | ML/배포: 전체 GPU 사용 제한. “전체 1개만 실행”이 아님 |
| 추가 문의 8: 배포 | 코드 포트 8000, API 인증 없음 | 배포 담당: 접근 가능한 주소·허용 범위·인증·GPU 환경 확정 |
| 추가 문의 9: 저장 방식 | 기본 local, 현재 로컬 .env 없음 | ML/배포: 공유 파일 또는 S3 읽기 구현. 외부 모델 소스와 가중치 준비 |
| 추가 문의 10: currentStep | 워커 message는 있으나 GET에서 빠짐 | ML: 실제 단계 문구 반환. Medfusion은 이제 클래스별 단계가 있음 |
| 추가 문의 11: progress | 계산 단계별 갱신. 저장 전 100 가능 | ML: 저장 단계 포함, FE: 상태로 완료 판단 |

base64는 이미지 파일을 요청 본문에 담을 수 있도록 문자로 바꾸는 방식이다. S3 key는 파일 창고 안의 파일 경로다. Presigned URL은 해당 파일을 일정 시간만 열 수 있게 해 주는 임시 주소다. 이 주소는 만료되므로 장기 기록에는 파일 위치를 저장하고 필요할 때 주소를 다시 발급하는 연결이 필요하다.

현재 저장 규칙은 증강 datasets/{job_id}/support_aug.npz, 학습 models/{job_id}/best.pt, 생성 추론 inferences/{job_id}/… 형태다. S3에서는 기본 outputs/가 앞에 붙는다. 파일 이름 규칙이 있다는 것과 다음 워커가 그 파일을 실제로 읽을 수 있다는 것은 다르다.

**9. 다른 과거 이슈의 재분류**

| 과거 이슈 | 현재 코드 판정 | 후속 확인 |
|---|---|---|
| 프로필 이미지·요금제·전문가 상태가 새로고침 후 사라짐 | UserResponse에 관련 필드와 FE 매핑 있음 | 계정별 저장 후 새로고침 재검증 |
| S3 이미지 403 | 서명된 URL을 다시 인코딩하지 않는 코드 있음 | 만료 시 재조회 흐름 별도 확인 |
| 데이터셋 다운로드 | /files/{fileId}/download 호출 있음 | 실제 파일 다운로드 확인. ML 결과 다운로드 버튼과는 별개 |
| 데이터셋 경로 이전·수정, 레시피 삭제 | 현재 FE 경로·함수에 반영 | 자산 상세 검증 버튼 문제는 별도 수정 |
| 팀원 모집 중복 지원 | 이미 지원한 상태 표시 및 409 안내 있음 | 409는 현재 상태와 요청이 충돌한다는 응답 |
| 검수·전문가·초대 목록 500 | BE 9월 4일 수정 포함 | 500은 서버 처리 중 오류. 실제 배포 버전·데이터로 재검증 |
| 프로젝트 초대 수락·거절 연결 끊김 | BE 생성·응답 API는 있으나 받은 초대 목록 API 확인 안 됨 | FE가 projectId와 invitationId를 확보할 경로 필요 |
| 프로젝트 전체 삭제 | 현재 ProjectController에 없음 | 삭제 대상과 연관 기록 보존 규칙 합의 후 BE 구현 |
| 배포 화면 새로고침 404 | vercel.json 경로 처리 있음 | 새로고침의 화면 경로 문제와 AI 작업 복구 문제는 별개 |
| 과거 로그인 502 | 과거 문서에 서버 재가동으로 해결 기록 | 현재 장애라고 단정하지 않음. 이번 운영 재현 없음 |

**10. 담당자별 실행 순서와 완료 기준**

아래 우선순위는 이번 분석의 제안이며 팀의 확정 일정은 아니다.

| 순서 | 주 담당 | 구체적인 작업 | 완료 판정 |
|---|---|---|---|
| 1 | 사용자·ML 담당 | Medfusion을 적용할 기준 버전으로 할지 확정, 외부 패키지 버전·가중치 확보 | 어느 커밋과 모델로 실행하는지 한 곳에 기록 |
| 2 | FE 담당 | 가짜 성공·결과 제거 또는 명시적 시연 모드 분리 | 서버를 끄면 성공하지 않고 오류가 보임 |
| 3 | FE 담당 | TypeScript 빌드 오류, 검수 필드·버튼 이름 수정 | npm run build 성공 |
| 4 | BE 담당 | 작업 생성·단건 상태·취소·목록/결과 API, ML 호출과 번호 대응 저장 | 실제 BE 요청으로 ML 작업 번호가 DB에 남음 |
| 5 | FE·BE·ML | 파일 업로드와 입력 전달, 성공한 dataset_id/model_id 연결 | 선택한 파일의 장수와 내용이 ML 수신 내용과 일치 |
| 6 | ML·배포 담당 | 워커 간 결과 공유, 외부 모델 준비, GPU 실행 구성 | 분리된 실행 환경에서도 증강 결과로 학습·추론 성공 |
| 7 | FE·BE | 실제 결과·다운로드·재접속 복원 | 결과 파일을 열 수 있고 새로고침 후 같은 결과 조회 |
| 8 | ML·BE | 취소·없는 작업·보존 기간·오류 코드 | 취소 후 다음 작업 성공, 잘못된 ID는 명확한 실패 |
| 9 | FE·BE | 활동·검수·알림 불일치 정리 | 빈 데이터·실패·재조회·다음 페이지가 정확하게 표시 |
| 10 | ML 담당 | 원본/변형본 분리 평가 및 실제 품질 검증 | 테스트 데이터와 측정 방식이 명확한 성능 보고 |

초기 목표는 기능 수를 늘리는 것보다 “실제 이미지 한 묶음을 업로드하여 증강 → 학습 → 분류 → 파일 다운로드 → 새로고침 후 기록 조회”를 성공시키는 것이다. 이 전체 연결 시험을 보통 E2E 테스트라고 한다.

사용자는 코드를 직접 작성하는 대신 아래 증거를 요구하면 된다.

- 화면에서 사용한 파일 이름·장수와 서버가 받은 파일이 일치하는가?
- 작업 번호로 서버 기록을 다시 조회할 수 있는가?
- 결과 수치가 어떤 모델·데이터로 계산됐는지 확인 가능한가?
- 서버 오류, 없는 파일, 잘못된 작업 번호가 실제 실패로 표시되는가?
- 취소한 뒤 계산이 멈추고 다음 작업을 정상 실행할 수 있는가?
- 새로고침과 재로그인 후에도 같은 결과를 확인할 수 있는가?

디자인 담당자는 작업 상태별 화면을 정리할 수 있다. 대기·실행·실패·취소 중·취소 완료·결과 없음·서버 연결 실패를 각각 구분하고, 실제 자료가 없을 때 예시를 보여주는 대신 이유와 다음 행동을 표시하는 작업이 필요하다.

**11. 팀에 전달할 수 있는 문구**

아래 문구는 전달용 초안이며 실제 발송하지 않았다.

BE 담당자에게:

> 현재 원격 main/develop 기준으로 AI Job 생성·단건 상태·취소와 ML 연결부가 확인되지 않았습니다. 별도 작업 위치가 있다면 브랜치나 PR을 공유 부탁드립니다. FE는 해당 API 실패 때 모의 작업으로 전환되고 있어 실연동 완료로 보기는 어렵습니다. BE jobId와 ML job_id 대응, 입력 이미지 전달, 결과 파일 위치 저장, 최종 상태 보존까지 포함한 요청/응답 예시를 먼저 맞추고 싶습니다. 일반 기능은 검수의 실제 taskId 제공, expertComment/augmentationParams 필드, 활동의 콘텐츠 공개와 프로필 노출 설정 구분, 공개 프로필 #195 반영 여부도 확인 부탁드립니다.

ML 담당자에게:

> 10월 2일 Medfusion 브랜치의 업로드별 파인튜닝 증강과 K-shot 학습 개선을 확인했습니다. main 적용 여부와 bifusion 패키지·medical_diffusion 코드·가중치의 배포 위치/버전을 공유 부탁드립니다. 현재 API 실패값은 문서의 FAILURE와 달리 FAILED입니다. 취소, 없는 작업 404, 결과 보존, S3 key 응답과 이전 결과 읽기, currentStep은 아직 남아 있습니다. FE 증강 설정의 sampling_steps/guidance_scale을 실제로 지원할지, 학습 query_images_base64/has_query_labels를 사용할지도 확정이 필요합니다.

FE 작업을 AI에게 요청할 때 사용할 범위 예시:

> 먼저 실제 서비스 모드에서 Job API 오류가 가짜 성공으로 바뀌지 않도록 수정하고, 존재하지 않는 BE API를 임의로 완성된 것으로 가정하지 마세요. 실제 이미지 전달 계약이 없는 부분은 명확히 표시하세요. 완료 판단은 진행률이 아닌 최종 상태로 하세요. 검수 응답은 BE 코드에 맞추고 npm run build를 통과시키세요. 변경 후 정상·실패·취소·새로고침의 확인 결과와 남아 있는 BE/ML 의존 작업을 분리해 보고하세요.

**12. 이번에 실행한 검증과 한계**

- FE: Linux Node v22.20.0으로 npm run build 실행 → 실패. 미사용 변수·가져오기 오류 외에 AssetDatasetDetail의 버튼 속성 이름 불일치, ReviewDetailPage의 draftComment/finalComment 형식 오류 확인.
- 과거 문서에는 npx vite build 성공 기록이 있다. 현재 npm run build는 TypeScript 형식 검사(tsc -b)를 먼저 실행하므로 같은 검사 수준이 아니다. “예전 빌드 성공” 기록만으로 현재 정상이라고 판단할 수 없다.
- ML main: 기존 tests/test_api_endpoints.py 실행 → 4개 통과, 경고 1개. 상태 확인 1개와 모의 작업 접수 3개이며 실제 Celery/Redis·GPU·S3 연결 시험은 아니다.
- ML 최신 Medfusion: 원격 코드 정적 검토만 수행. 정적 검토는 실행하지 않고 소스를 읽는 검사다. 외부 패키지·가중치·GPU 실행을 검증하지 않았다.
- 로컬 ML .env 파일은 없음. 모델 파일은 있지만 파일 존재만으로 실제 학습된 모델임을 증명할 수 없다. main에는 같은 이름의 더미 모델 생성 스크립트도 있어 출처 확인이 필요하다.
- BE 운영 DB, 실제 배포 커밋, 로그인된 사용자 흐름과 서버 간 전체 연결은 이번에 실행하지 않았다.

이 보고서의 “구현 확인”은 코드를 읽어 확인한 상태, “테스트 통과”는 위에 명시한 좁은 실행 범위, “제안”은 앞으로 합의·구현할 일이다. 이 세 가지를 계속 구분해 관리하면 AI가 작성한 변경도 훨씬 안전하게 인수인계할 수 있다.


