# BIFUSION 프로젝트 상세 화면 연동 가이드

이 문서는 대시보드에서 특정 프로젝트(예: '비전 AI 스터디')를 클릭했을 때 나타나는 **상세 페이지(`ProjectDetailPage.tsx`)**가 어떻게 만들어지는지 상세하게 풀어봅니다.

---

## 1. URL에서 프로젝트 번호(ID) 훔쳐오기 (`useParams`)

프로젝트 상세 페이지에 들어오면 주소창이 `/projects/15` 처럼 바뀝니다. 여기서 `15`라는 숫자가 바로 이 프로젝트의 고유 번호(ID)입니다. 백엔드에 데이터를 달라고 하려면 이 번호를 알아야 합니다.

```tsx
import { useParams } from 'react-router-dom';

export default function ProjectDetailPage() {
  // 주소창에서 projectId('15')를 쏙 뽑아옵니다.
  const { projectId } = useParams();

  // ...
}
```

---

## 2. 모달창(수정 폼)을 위한 투트랙 전략

상세 페이지에는 '설정' 버튼이 있고, 누르면 제목과 설명을 고칠 수 있는 팝업 모달창이 뜹니다.
여기서 아주 중요한 원칙이 있습니다. **"유저가 모달창에서 입력하다가 '취소'를 누르면, 수정하던 글자들이 깔끔하게 초기화되어야 한다"**는 것입니다.

이를 위해 상태를 2개(진짜 상태, 임시 상태)로 쪼개서 관리합니다.

### 💡 1번 트랙: 진짜 상태 (Zustand 전역 저장소)

백엔드에서 받아온 '진짜' 프로젝트 정보입니다. 서버에 저장을 눌러 성공했을 때만 바뀝니다.

```typescript
const { currentProject } = useProjectStore(); 
// currentProject = { title: "원래 제목", description: "원래 설명" }
```

### 💡 2번 트랙: 임시 상태 (컴포넌트 지역 `useState`)

모달창의 텍스트박스에 연결될 임시 변수입니다. 유저가 키보드를 칠 때마다 바뀝니다.

```tsx
const [editTitle, setEditTitle] = useState("");

// 꿀팁! 모달창이 처음 켜질 때, 임시 변수에 진짜 상태를 복사해 둡니다.
useEffect(() => {
  if (currentProject) {
    setEditTitle(currentProject.title);
  }
}, [currentProject]);
```

### 💡 유저가 "저장" 버튼을 눌렀을 때

그제서야 임시 변수에 든 값(`editTitle`)을 백엔드에 쏘아 올립니다(`PUT /projects/15`).
그리고 백엔드에서 "성공!"이라고 답변이 오면, 그때서야 진짜 상태(1번 트랙)를 업데이트하여 화면 전체를 깔끔하게 갱신합니다.

---

## 3. 화면의 부분 업데이트 (Spread Operator)

수정 통신이 성공했다고 해서, `GET /projects/15`를 통째로 다시 호출해서 모든 정보를 새로고침할 필요는 없습니다. (서버 비용 낭비!)

**우리가 방금 보낸 수정 데이터만 진짜 상태에 "덮어씌우면" 됩니다.** 이때 자바스크립트의 전개 연산자(`...`)를 아주 유용하게 씁니다.

```typescript
// 상태 덮어쓰기 로직
set((state) => ({
  currentProject: { 
    ...state.currentProject, // 기존 데이터 100개는 그대로 두고
    title: editTitle,        // 방금 유저가 수정한 제목만 쏙 덮어씌움!
  }
}));
```

이렇게 하면 백엔드 통신 없이도 프론트엔드 화면이 눈 깜짝할 사이에 갱신되는 마법(Optimistic Update와 유사)을 경험할 수 있습니다!
