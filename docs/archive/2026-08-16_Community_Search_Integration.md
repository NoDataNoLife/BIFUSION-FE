# 커뮤니티 검색 기능 연동 (Debounce 적용)

## 개요
커뮤니티 페이지(`CommunityPage.tsx`)의 상단 검색창에 입력한 키워드를 바탕으로 실제 목록 조회 API를 호출하도록 연동하였습니다. 불필요한 API 호출(타이핑마다 호출되는 현상)을 방지하기 위해 커스텀 디바운스 로직을 추가했습니다.

## 주요 변경 사항

### 1. Debounce 로직 적용 (`CommunityPage.tsx`)
```typescript
const [searchQuery, setSearchQuery] = useState('');
const [debouncedQuery, setDebouncedQuery] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(searchQuery);
  }, 400);

  return () => clearTimeout(timer);
}, [searchQuery]);
```
* **동작 원리:** 사용자가 타이핑을 할 때마다 `searchQuery` 상태가 업데이트됩니다. 하지만 `setTimeout`을 통해 400ms 동안 추가 입력이 없을 때만 `debouncedQuery` 상태를 업데이트합니다.

### 2. API 호출 연동
```typescript
useEffect(() => {
  if (activeTab === 'qna') fetchQnaList(0, 10, 'LATEST', debouncedQuery);
  else if (activeTab === 'datasets') fetchDatasetList(0, 10, 'LATEST', debouncedQuery);
  else if (activeTab === 'recruitment') fetchRecruitmentList(0, 10, 'LATEST', debouncedQuery);
}, [activeTab, debouncedQuery, fetchQnaList, fetchDatasetList, fetchRecruitmentList]);
```
* **동작 원리:** 탭(`activeTab`)이 변경되거나, 디바운스가 완료된 검색어(`debouncedQuery`)가 변경될 때만 해당하는 탭의 목록 조회 API(`fetchQnaList`, `fetchDatasetList`, `fetchRecruitmentList`)를 호출하여 백엔드에 쿼리를 전달합니다.

## 기대 효과
* 검색어 입력 시 발생하는 과도한 트래픽 및 서버 부하 감소.
* 사용자 타이핑 경험 개선 (버벅임 방지).
