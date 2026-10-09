# FE 브랜치 정리 기록 · 2026년 10월 9일

사용자 요청에 따라 **BIFUSION-FE**의 병합 완료 브랜치를 정리했습니다. BE·ML 브랜치는 변경하지 않았습니다.

## 결과와 기준

- 원격 브랜치 **15개 삭제**
- 로컬 브랜치 **19개 삭제**
- 모든 삭제 대상은 원격 main `faaaf424491c10d4ab3f562b053782c6082b8f12`에 포함된 커밋
- 정리 전 GitHub 조회에서 열린 PR 0개 확인
- 다른 작업 폴더에서 사용하는 브랜치 없음 확인
- 원격 삭제에 커밋 번호 조건을 걸어 확인 이후 변경된 브랜치 삭제를 방지
- 로컬 삭제는 병합 확인을 수행하는 `git branch -d` 사용

브랜치 삭제는 작업 갈래의 이름을 지우는 것이며, 아래 작업의 내용은 main의 커밋 이력에 남습니다.

## 삭제 목록

| 브랜치 | 삭제 범위 | 삭제 전 커밋 |
|---|---|---|
| `chore/landing-page-cleanup` | 원격·로컬 | `81ff748744e2ef87bc4a3c6daa238d430738a8a5` |
| `feat/asset-community-ispublic-api` | 원격·로컬 | `460f62a214056dfdbb6e306c29d86cf66466f333` |
| `feat/assets-and-inspection-refinement` | 원격·로컬 | `3061a16489dda2fec28890a7da485005c730fada` |
| `feat/augment-flow-dark-polish` | 원격·로컬 | `ce409e9ba134fcb7cb071b08a77c12e749d9157a` |
| `feat/expert-and-api-integration` | 원격·로컬 | `33db1ce55ef132f8fe3bd374a2a83a87c45c1500` |
| `feat/expert-and-dataset-api-integration` | 원격·로컬 | `2144e4d59ebbeb6927d5bd57d80d8876603b1d26` |
| `feat/job-pipeline-progress-polling` | 원격·로컬 | `711df1d0690fde7925b5d1beaf5ef6ecedfa1870` |
| `feat/mypage-activities-and-notifications` | 원격·로컬 | `13c5486a7f2aaad87e94d8468e5941d085302ff0` |
| `feat/notification-center-luxe-polish` | 원격·로컬 | `4ab316c0feb9f89f2c9aec0d722d23c57a82dcf8` |
| `feat/notion-issues-and-notifications` | 원격·로컬 | `9ea73e3fe881b068f2b528e79893abbeb1e3896d` |
| `feat/recipedetail-cleanup-and-verification` | 원격·로컬 | `857de3d4ffc7f81e1fb5b522430956703e9fbba4` |
| `feature/frontend-integration` | 로컬만 | `e5570f62810c20be61688480890ae39d68298e22` |
| `fix/dataset-update-and-verification-api` | 원격·로컬 | `6b6d7b2b8717936d23f1b344f56693c6343a4a58` |
| `fix/expert-tasks-and-assets-endpoints` | 원격·로컬 | `6d5ff0bd4720daacbf9bc1092705610e73127003` |
| `fix/oauth-session-initialization` | 원격·로컬 | `d7bb03cf4ed09604296432e06aad884efc61de20` |
| `fix/recruitment-ui` | 로컬만 | `80ef72f293bd04f9bd5b5ec44cf6fcfbba43a562` |
| `fix/ui-integration` | 로컬만 | `28816eedecd0dbae0196d4c4ac379d43a1f9f5f1` |
| `pr-53` | 로컬만 | `e13ca3749c4095997991c5198f375ce4e702f8f2` |
| `style/inference-train-pipeline-dark-theme` | 원격·로컬 | `972f62de9089ae2cd21f678bb33f27ff770b2fb5` |

## 유지한 브랜치

| 브랜치 | 유지 이유 |
|---|---|
| 원격 main | 기준 브랜치 |
| 로컬 main | 미공유 문서 커밋 `c3fd5e6`과 병합 기록 `69ec301` 보존 |
| 로컬·원격 fix/dataset-download-logic | 원격 main에 포함되지 않은 작업 있음 |
| codex/fe-api-quick-fixes | 이번 수정·문서 작업 브랜치 |

로컬 main은 원격과 다른 이력이 있으므로 강제 초기화하지 않았습니다. 이번 작업은 최신 원격 main에서 시작했습니다.

## 필요할 때 복구

삭제 전 번호로 `git branch <이름> <위_커밋번호>`를 실행하면 로컬 브랜치를 다시 만들 수 있습니다. 이 기록은 삭제 전 상태를 남기기 위한 자료입니다.
