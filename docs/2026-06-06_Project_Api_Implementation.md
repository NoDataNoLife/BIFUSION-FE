# BIFUSION 프론트엔드 프로젝트 연동 핵심 가이드

이 문서는 대시보드에서 '나의 프로젝트' 목록을 보여주는 화면이 어떻게 동작하는지 설명합니다. 서버에서 데이터를 받아와서 빈 화면 처리(Empty State)까지 진행되는 과정을 초보자도 알기 쉽게 단계별로 풀어봅니다.

---

## 1. 전역 창고(Store) 만들고 데이터 보관하기

리액트에서는 여러 컴포넌트가 데이터를 공유하기 위해 Zustand 같은 라이브러리를 써서 '창고(Store)'를 만듭니다.

### 💡 `useProjectStore` 분석하기
```typescript
import { create } from 'zustand';
import api from '../lib/axios';

export const useProjectStore = create((set) => ({
  managingProjects: [], // 내가 관리 중인 프로젝트들
  participatingProjects: [], // 내가 멤버로 참여 중인 프로젝트들
  isLoading: false,

  // 서버에서 내 프로젝트 목록을 가져오는 함수
  fetchMyProjects: async () => {
    set({ isLoading: true }); // 로딩 스피너 돌리기 시작!
    
    try {
      const response = await api.get('/projects/me');
      const data = response.data.data;
      
      // 서버가 준 진짜 데이터를 창고에 차곡차곡 저장합니다.
      set({
        managingProjects: data.managingProjects || [],
        participatingProjects: data.participatingProjects || [],
        isLoading: false
      });
    } catch (error) {
      set({ isLoading: false });
    }
  }
}));
```
이 코드를 작성해두면 어떤 컴포넌트에서든 `useProjectStore()`를 호출해서 방금 저장한 프로젝트 목록을 쏙쏙 빼다 쓸 수 있습니다.

---

## 2. 화면에 들어오자마자 데이터 불러오기 (`useEffect`)

화면(`ProjectsPage.tsx`)이 짠 하고 나타날 때 백엔드에 데이터를 달라고 요청해야 합니다. 이때 쓰는 리액트 문법이 바로 `useEffect`입니다.

```typescript
const { fetchMyProjects, managingProjects, participatingProjects } = useProjectStore();

useEffect(() => {
  // 화면이 처음 켜질 때 딱 한 번 이 함수를 실행시킵니다.
  fetchMyProjects(); 
}, [fetchMyProjects]);
```

---

## 3. 백엔드 데이터 예쁘게 포장하기 (Data Mapping)

백엔드에서 내려준 데이터의 이름표(`bannerImageUrl`)와 프론트엔드 화면에서 쓰기로 약속한 이름표(`coverImage`)가 다를 수 있습니다. 이럴 때는 프론트엔드에서 데이터를 한번 가공해 줘야 합니다.

```typescript
// 1. 관리 중인 것과 참여 중인 것을 하나의 거대한 배열로 합칩니다.
const allProjects = [...managingProjects, ...participatingProjects];

// 2. map 함수를 써서 화면에 그리기 편한 모양으로 옷을 갈아입힙니다.
const mappedProjects = allProjects.map(p => ({
  id: p.projectId.toString(), // 서버는 숫자를 주지만 화면 컴포넌트는 문자를 원하므로 변환!
  title: p.title,
  coverImage: p.bannerImageUrl || "https://기본이미지.jpg", // 이미지가 비어있을 때를 대비한 꼼꼼한 기본값 처리
  role: p.role === "MANAGER" ? "manager" : "member",
}));
```

---

## 4. 데이터가 텅 비었을 때의 대처법 (Empty State)

만약 내가 참여 중인 프로젝트가 단 하나도 없다면, 그냥 하얀 화면만 덩그러니 남게 됩니다. 이럴 땐 유저가 당황하지 않게 "데이터가 없어요"라고 친절히 알려주는 안내문(Empty State)을 띄워야 합니다.

```typescript
// 참여 중인(member) 프로젝트 개수가 0개인지 세어봅니다.
const isParticipatingEmpty = projects.filter(p => p.role === "member").length === 0;

return (
  <div>
    {/* 만약 0개라면 (참이라면) && 뒤에 있는 EmptyState 컴포넌트를 화면에 그립니다. */}
    {isParticipatingEmpty && (
      <EmptyState
        icon={<UsersIcon />} // 귀여운 아이콘
        title="아직 참여 중인 프로젝트가 없네요!"
      />
    )}
  </div>
);
```
조건부 렌더링(`&&`)을 활용하면 에러 없이 깔끔하게 화면을 통제할 수 있습니다. 
프론트엔드 개발자는 항상 **"데이터가 있을 때"**뿐만 아니라 **"데이터가 아직 안 왔을 때(로딩)"**, **"데이터가 아예 없을 때(Empty)"**, **"에러가 났을 때"**까지 총 4가지 경우의 수를 모두 고려해서 코드를 짜야 합니다!
