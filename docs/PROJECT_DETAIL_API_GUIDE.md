# 프로젝트 상세 API 연동 가이드 (주니어 개발자용)

이 문서는 프로젝트 상세 페이지(`ProjectDetailPage.tsx`)에서 프로젝트의 기본 정보를 조회(`GET /api/v1/projects/{projectId}`)하고, 설정 모달을 통해 수정(`PUT /api/v1/projects/{projectId}`)하는 로직에 대한 상세 가이드입니다. 

## 1. 전역 상태 관리 (`useProjectStore.ts`)

프론트엔드에서는 전역 상태 관리 라이브러리인 **Zustand**를 사용하고 있습니다. 프로젝트 상세 정보를 다루기 위해 스토어에 상태와 함수를 추가했습니다.

### 1-1. 인터페이스 (타입 정의)
먼저 백엔드 응답 명세에 맞춰 타입을 정의합니다.
```typescript
interface ProjectDetailMember {
  userId: number;
  nickname: string | null;
  email: string | null;
  profileImageUrl: string | null;
  role: string;
}

interface ProjectDetail {
  projectId: number;
  title: string;
  description: string;
  bannerImageUrl: string | null;
  isPublic: boolean;
  role: string;
  isFavorited: boolean;
  members: ProjectDetailMember[];
}
```

### 1-2. 스토어 상태 및 API 호출 함수
Zustand 스토어 안에 `currentProject`라는 상태를 만들고, API 통신을 담당하는 함수들을 정의합니다.

```typescript
// 1. 상세 정보 조회
fetchProjectDetail: async (projectId: string) => {
  set({ isLoading: true, error: null });
  try {
    const response = await api.get(`/api/v1/projects/${projectId}`);
    set({ currentProject: response.data, isLoading: false });
  } catch (error: any) {
    set({ error: error.message, isLoading: false });
  }
},

// 2. 상세 정보 수정
updateProjectInfo: async (projectId: string, updateData) => {
  set({ isLoading: true, error: null });
  try {
    await api.put(`/api/v1/projects/${projectId}`, updateData);
    // 수정 성공 시 최신 데이터를 다시 불러옵니다!
    await get().fetchProjectDetail(projectId);
    set({ isLoading: false });
    return true;
  } catch (error: any) {
    set({ error: error.message, isLoading: false });
    return false;
  }
}
```
**핵심 포인트**: 정보를 `update` 한 뒤에는 `get().fetchProjectDetail(projectId)`를 호출하여 전역 상태를 최신화해 주어야 화면이 올바르게 갱신됩니다.

---

## 2. UI 컴포넌트 연동 (`ProjectDetailPage.tsx`)

상태와 통신 함수가 준비되었으니, 실제 화면(React 컴포넌트)에 연결합니다.

### 2-1. 초기 데이터 불러오기 (`useEffect`)
페이지에 진입할 때 URL에 있는 `projectId`를 가져와 `fetchProjectDetail`을 호출합니다.

```tsx
const { projectId } = useParams();
const { currentProject, fetchProjectDetail, updateProjectInfo } = useProjectStore();

useEffect(() => {
  if (projectId) {
    fetchProjectDetail(projectId); // 컴포넌트 마운트 시 데이터 요청
  }
}, [projectId, fetchProjectDetail]);
```

### 2-2. 화면 렌더링
받아온 `currentProject` 데이터를 바탕으로 화면에 출력합니다. 데이터가 아직 오지 않았을 수 있으므로 옵셔널 체이닝(`?.`)이나 기본값을 활용합니다.

```tsx
<h1 className="text-2xl font-black">
  {currentProject?.title || "로딩 중..."}
</h1>
<p className="text-sm">
  {currentProject?.description}
</p>
```

### 2-3. 수정 폼(설정 모달) 처리
수정 모달은 취소 버튼을 누르면 원래 데이터로 돌아가야 하므로, 컴포넌트 내부에 별도의 지역 상태(`useState`)를 둡니다.

```tsx
// 컴포넌트 내부의 임시 수정용 상태
const [editTitle, setEditTitle] = useState("");
const [editDescription, setEditDescription] = useState("");
const [coverImage, setCoverImage] = useState("");

// 전역 상태(currentProject)가 업데이트되면 지역 상태도 동기화합니다.
useEffect(() => {
  if (currentProject) {
    setEditTitle(currentProject.title || "");
    setEditDescription(currentProject.description || "");
    setCoverImage(currentProject.bannerImageUrl || "기본이미지URL");
  }
}, [currentProject]);
```

### 2-4. 저장 버튼 이벤트
사용자가 수정을 마치고 [저장]을 누르면 `updateProjectInfo`를 호출합니다.

```tsx
const handleSaveSettings = async () => {
  if (!projectId) return;
  
  // Zustand 스토어의 업데이트 함수 호출
  const success = await updateProjectInfo(projectId, {
    title: editTitle,
    description: editDescription,
    bannerImageUrl: coverImage,
  });
  
  if (success) {
    setIsSettingsOpen(false); // 모달 닫기
  } else {
    alert("설정 저장에 실패했습니다.");
  }
};
```
**주의사항**: `bannerImageUrl`의 경우 이미지 파일 객체를 그대로 보내는 것이 아니라, **이미지의 URL 텍스트**를 보내야 합니다. 너무 긴 Base64 문자열을 보내면 서버에서 에러가 발생할 수 있으니 텍스트 URL을 입력받도록 구현했습니다.

---

## 3. 요약 (데이터 흐름)
1. **페이지 진입** 👉 `ProjectDetailPage.tsx`에서 `projectId` 추출
2. **조회 요청** 👉 `useProjectStore`의 `fetchProjectDetail` 실행
3. **상태 업데이트** 👉 백엔드 데이터가 `currentProject`에 저장됨
4. **화면 갱신** 👉 `currentProject` 데이터를 활용해 제목/설명 렌더링 및 모달 폼 초기화
5. **데이터 수정** 👉 사용자가 모달에서 값을 변경하고 `handleSaveSettings` 실행
6. **수정 요청** 👉 `updateProjectInfo`가 API를 호출한 뒤, 완료되면 다시 `fetchProjectDetail`을 실행해 데이터를 최신화
