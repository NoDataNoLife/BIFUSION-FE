# 프로젝트 목록 조회 API 연동 상세 가이드 (Junior Developer 대상)

이 문서는 프로필 페이지(`ProfilePage.tsx`)와 나의 개미굴 페이지(`ProjectsPage.tsx`)에 백엔드의 프로젝트 목록 API(`GET /api/v1/projects`)를 어떻게 연결했는지, 아주 기초적인 단계부터 코드 레벨까지 자세히 설명합니다.

---

## 1. 전역 상태 관리 (Zustand 스토어 만들기)

### `src/store/useProjectStore.ts`

웹 어플리케이션을 만들 때, 서버에서 받아온 데이터를 여러 페이지(예: 프로필 화면, 내 프로젝트 화면 등)에서 똑같이 보여줘야 할 때가 많아요. 이 데이터를 페이지마다 각각 불러오면 비효율적이겠죠? 그래서 **Zustand**라는 상태 관리 라이브러리를 사용해서 '스토어(Store)'라는 공용 저장소를 만들었습니다.

```typescript
export const useProjectStore = create<ProjectState>((set) => ({
  managingProjects: [], // 내가 리더인 프로젝트 목록
  participatingProjects: [], // 내가 멤버인 프로젝트 목록
  isLoading: false,
  error: null,

  fetchMyProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/projects'); // 백엔드 API 호출!
      if (response.data.success) {
        const data = response.data.data;
        // 받아온 데이터를 스토어(전역 상태)에 저장합니다.
        set({
          managingProjects: data.managingProjects || [],
          participatingProjects: data.participatingProjects || [],
          isLoading: false
        });
        return true;
      }
      // ... 생략 (실패 시 에러 처리) ...
    } catch (error: unknown) {
      // TypeScript에서 에러를 'any' 대신 'unknown'으로 받아서,
      // Error 객체인지 확인(instanceof)한 뒤 안전하게 메시지를 가져옵니다.
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  }
}));
```

- **`fetchMyProjects` 함수:** 이 함수가 불리면 `api.get('/projects')`로 백엔드에 요청을 보냅니다. 백엔드는 `managingProjects`(관리중인 프로젝트)와 `participatingProjects`(참여중인 프로젝트)를 돌려줍니다.
- **`set({ ... })`:** Zustand에서 상태를 업데이트하는 함수입니다. 백엔드에서 받아온 데이터를 우리 스토어에 딱! 저장해두는 역할이에요.

---

## 2. 화면 컴포넌트에서 스토어 데이터 가져다 쓰기

이제 화면을 그리는 `ProfilePage.tsx`와 `ProjectsPage.tsx`에서 방금 만든 스토어를 사용해야 합니다.

### 데이터를 불러오는 타이밍 (`useEffect`)

```typescript
// ProjectsPage.tsx 내부
const { managingProjects, participatingProjects, fetchMyProjects } = useProjectStore();

useEffect(() => {
  fetchMyProjects(); // 화면이 처음 켜질 때 딱 한 번 실행!
}, [fetchMyProjects]);
```

- **`useProjectStore()`:** 우리가 만든 공용 저장소에서 데이터를 꺼내오는 Hook입니다.
- **`useEffect`:** 리액트에서 "이 컴포넌트가 처음 화면에 나타날 때(마운트될 때) 이 코드를 실행해라!"라고 명령할 때 씁니다. 여기서 `fetchMyProjects`를 불렀으니, 페이지에 들어오자마자 백엔드에 데이터를 요청하게 되겠죠.

### 받아온 데이터를 화면(UI) 규격에 맞게 변환하기 (데이터 매핑)

백엔드에서 주는 데이터의 이름(`projectId`, `bannerImageUrl` 등)과 우리가 화면을 그릴 때 필요한 데이터의 이름(`id`, `coverImage` 등)이 조금 다릅니다. 이걸 맞춰주는 작업이 필요해요.

```typescript
useEffect(() => {
  // 1. 관리중인 프로젝트와 참여중인 프로젝트를 하나의 배열로 합칩니다.
  const allProjects = [...managingProjects, ...participatingProjects];
  
  // 2. map 함수를 써서, 백엔드 데이터를 UI용 데이터로 하나씩 변환합니다.
  const mappedProjects = allProjects.map(p => ({
    id: p.projectId.toString(), // 숫자를 문자로!
    title: p.title,
    description: p.description,
    coverImage: p.bannerImageUrl || "https://images.unsplash.com/...", // 이미지가 없으면 기본 이미지!
    teamMembers: p.members?.map(m => ({
      name: m.nickname || "사용자",
      avatar: m.profileImageUrl || `https://api.dicebear.com/...`
    })) || [],
    status: "Running",
    role: p.role === "LEADER" ? "manager" : "member",
    isFavorite: p.isFavorited,
    lastActivity: p.lastActivityAt ? new Date(p.lastActivityAt).toLocaleDateString() : "방금 전"
  }));
  
  // 3. 변환된 데이터를 화면에 보여줄 로컬 상태(projects)에 저장합니다.
  setProjects(mappedProjects);
}, [managingProjects, participatingProjects]);
```

- **`[...managingProjects, ...participatingProjects]`:** 두 배열을 전개 구문(`...`)을 써서 하나의 큰 배열로 합칩니다.
- 위 `useEffect`는 뒤에 적힌 `[managingProjects, participatingProjects]`가 **변경될 때마다** 실행됩니다. 즉, API 요청이 끝나서 스토어에 데이터가 채워지면, 이 코드가 돌면서 예쁘게 포장된 데이터를 `projects`라는 상태에 저장하고, 리액트가 화면을 다시 그리게 됩니다.

---

## 3. 빈 화면(Empty State) 예외 처리 추가

만약 내가 참여중인 프로젝트가 하나도 없다면 어떨까요? 텅 빈 하얀 화면만 보이면 유저는 고장났다고 생각할 수도 있습니다. 그래서 "데이터가 없습니다"라고 친절하게 알려주는 UI가 필요합니다.

```typescript
{projects.filter((p) => p.role === "member").length === 0 && (
  <EmptyState
    icon={<Users />}
    title="참여중인 개미굴이 없습니다"
  />
)}
```

- **`projects.filter((p) => p.role === "member").length === 0`:** 전체 프로젝트 중에서 내 역할이 멤버(`member`)인 것만 걸러내서 개수(`length`)를 셉니다. 만약 그게 0개라면?
- **`&& (...)`:** 조건이 참일 때 괄호 안의 `<EmptyState />` 컴포넌트를 화면에 그립니다. 이렇게 하면 데이터가 없을 때 회색 박스 안에 아이콘과 문구가 예쁘게 나오게 되죠!

### 요약
1. 백엔드랑 통신하는 창구(`useProjectStore`)를 만들고
2. 화면이 켜지면 데이터를 달라고 요청(`useEffect`)한 뒤
3. 받은 데이터를 화면에 맞게 예쁘게 가공(`map`)해서
4. 화면에 그립니다. 데이터가 없으면 '없다'고 띄워줍니다(`EmptyState`).

---

## 4. [진행 현황] 마이페이지 프로젝트 API 개선

현재 연동된 프로필 노출용 페이지네이션 API(`GET /api/v1/projects/me`) 응답에는 `isPublic`(공개 여부) 필드가 포함되어 있으며, 일괄 변경 API(`PUT /api/v1/users/me/projects/visibility`)도 연동 완료되었습니다.

하지만 **목록 조회 시 필터링 파라미터가 아직 미구현** 상태입니다.

### 백엔드 API 개선 요청 사항 (잔여)

1. **프로필 노출용 페이지네이션 API(`GET /api/v1/projects/me`)에 필터링 파라미터 추가**
   - `?isPublic=true` 파라미터를 넘기면 서버에서 "공개" 처리된 프로젝트만 넘겨주도록 개선이 필요합니다.
   - (이유: 페이지네이션(size=6)으로 데이터를 가져온 뒤 프론트엔드에서 강제로 비공개 프로젝트를 필터링(`filter(p => p.isPublic)`)하면, 화면에는 1~2개만 뜨게 되어 '더보기' 버튼 및 커서 페이징 로직에 심각한 버그를 유발합니다.)

**현재 임시 조치 사항:**

- 프론트엔드 단독 필터링이 유발하는 페이징 버그를 감수하고, 일단 비공개 프로젝트는 노출하지 않도록(`isPublic === true` 필터 적용) 처리했습니다.
- 백엔드 파라미터 추가가 완료되면 프론트엔드에서 `?isPublic=true`를 붙여서 호출하도록 즉시 수정해야 합니다.

---

## 5. 프로젝트 생성 API (`POST /api/v1/projects`) 연동 및 버그 수정 완료 내역

백엔드 프로젝트 생성 API 명세에 맞춰 프론트엔드 모달창 폼을 개선하고, 생성 시 발생하던 각종 버그를 수정했습니다.

### 주요 수정 내역
1. **옵셔널 필드(Cover Image, Team Members) 복구 및 연동**
   - 백엔드 명세에 존재하는 선택적 입력값(`bannerImageUrl`, 팀원 초대를 위한 `email`, `role`)을 모달창 UI에 다시 추가하고 상태 관리 스토어에 연결했습니다.
   - 단, `bannerImageUrl`의 경우 아직 파일 업로드용 분리된 API 엔드포인트가 확정되지 않아, **직접 URL 텍스트를 입력받는 형태**로 연동해둔 상태입니다.
2. **권한(Role) 매핑 버그 수정 (`LEADER` -> `MANAGER`)**
   - 백엔드에서 생성된 프로젝트의 관리자 권한을 `MANAGER`라는 문자열로 반환하고 있었으나, 기존 코드에서 `LEADER`로 비교(`p.role === "LEADER"`)하고 있었습니다.
   - 이로 인해 방금 생성한 프로젝트가 일반 멤버인 '참여중인 개미굴'로 오분류되는 버그가 있어, 비교 기준을 `MANAGER`로 전부 수정했습니다.
3. **더블 클릭 시 프로젝트 중복 생성 방지 (`isLoading` 처리)**
   - API 요청이 진행 중일 때 사용자가 생성 버튼을 연타하여 동일 프로젝트가 여러 개 생기는 것을 막기 위해, `useProjectStore`의 `isLoading` 상태를 모달창에 넘겨 생성 중에는 **버튼을 비활성화(disabled)** 하도록 안전장치를 추가했습니다.
