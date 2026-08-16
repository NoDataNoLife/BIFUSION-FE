# 자산 관리 페이지 (Assets) 빈 화면 개선 및 추가 UI

## 개요
자산 관리(`AssetsPage.tsx`)에서 내 레시피(`uploaded-recipes`) 탭이나 업로드 데이터(`datasets`) 탭에 아무런 데이터가 없을 때, 단순히 "데이터가 없습니다"라고 표시하는 대신 사용자가 새로운 자산을 손쉽게 추가할 수 있도록 유도하는 카드형 버튼 UI와 더미 데이터를 추가했습니다.

## 주요 변경 사항

### 1. `[새 자산 추가]` 카드 인라인 UI 반영 (`AssetsPage.tsx`)
```typescript
{/* 내 레시피 탭 활성화 시 렌더링되는 새 레시피 만들기 카드 */}
{activeTab === 'uploaded-recipes' && (
  <div onClick={() => alert('새 레시피 만들기 모달 오픈')} className="...스타일...">
    <Plus size={32} />
    <h3>새 레시피 만들기</h3>
    <p>나만의 레시피를 등록하세요</p>
  </div>
)}
```
* 빈 데이터를 렌더링하는 대신 리스트의 가장 첫 번째 항목(카드)으로 **새 자산 추가** 역할을 하는 큼지막한 영역을 구현하여 사용자 경험(UX)을 향상시켰습니다.

### 2. 항상 표시되는 더미 데이터 (Mock) 연결
```typescript
const filteredRecipes = ALL_RECIPES.filter(r => {
  if (activeTab === 'uploaded-recipes') {
    // 실제 유저의 레시피이거나, 테스트용 더미 데이터(ID 1, 2) 노출
    return (r.author === user?.name || r.id === '1' || r.id === '2') && matchesSearch;
  }
});
```
* API 연동 전이나, 데이터가 부족한 초기 진입 환경에서도 UI를 확인할 수 있도록 더미 데이터 2개가 무조건 내 레시피 탭에 뜨도록 필터링 로직을 수정했습니다.

## 기대 효과
* 빈 상태(Empty State) 디자인이 개선되어 신규 자산 생성을 자연스럽게 유도합니다.
* 개발 시 UI 레이아웃이 텅 비어 보이는 문제를 방지합니다.
