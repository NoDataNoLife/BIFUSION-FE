# 내가 요청한 검수 · 연결 규격

2026-10-27 BE 공유 문서 기준으로 FE 연결을 완료했습니다. 실서버 배포·실계정 검증은 별도입니다.

| 용도 | API | 화면 동작 |
|---|---|---|
| 목록 | GET /api/v1/inspections/me/requests | 이름 검색, 유형·상태 필터, 서버 페이지 |
| 건수 | GET /api/v1/inspections/me/requests/counts | 필터와 무관한 전체 신청 건수, 진입·새로고침·취소 후 갱신 |
| 상세 | GET /api/v1/inspections/me/requests/{inspectionRequestId} | 요청 메모·리워드·전문가 의견·반려 사유 |
| 취소 | PATCH /api/v1/inspections/requests/{inspectionRequestId}/cancel | PENDING만 확인 후 취소, 목록·건수·잔액 갱신 |

| 항목 | 계약 |
|---|---|
| 화면 경로 | /dashboard/inspections · 사이드바 My Inspections |
| 목록 파라미터 | targetType, status, keyword, page(0부터), size=10 |
| 페이지 응답 | content, page, totalElements, totalPages. pageNumber 아님 |
| 상태 | PENDING / IN_PROGRESS / APPROVED / REJECTED |
| 식별자 | inspectionRequestId 사용. 전문가 배정 ID inspectionId와 구분 |
| 증강 대상 | target.id는 AugmentationConfig ID, target.jobId로 작업 조회 후 프로젝트 경로 구성 |
| 삭제 대상 | target.deleted=true이면 삭제됨 표시, 대상 링크 숨김 |
| 결과 | result 또는 comment가 null이어도 승인·반려 상태는 서버값 유지 |
| 시간 | 오프셋 없는 시각은 KST로 해석 |
| 취소 요청 | 목록·건수·상세에서 제외. 상세 오류 시 목록 복귀·새로고침 제공 |
| 재신청 | 대상별 최신 한 건만 표시, 이전 회차 이력으로 안내하지 않음 |

예시 데이터·미리보기 모드는 제거했습니다. 목록 오류를 빈 목록으로 오인하지 않고 재시도 안내를 표시합니다.
