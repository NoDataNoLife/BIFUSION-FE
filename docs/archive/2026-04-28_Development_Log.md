# BIFUSION 프론트엔드 개발 일지: 데이터 정합성과 영구 저장(Persist)

이 문서는 2026-04-28에 진행된 프론트엔드 리팩토링 및 기능 추가 내역을 담고 있습니다. 프론트엔드에서 데이터를 잃어버리지 않고 보존하는 방법과, 여러 페이지에서 같은 데이터를 띄울 때 생길 수 있는 문제를 어떻게 해결했는지 코드와 함께 알아봅니다.

---

## 1. 새로고침해도 데이터를 기억하게 만들기 (Zustand Persist)

사용자가 남이 만든 멋진 AI 레시피를 'Fork(가져오기)' 했다고 가정해 봅시다. 그런데 브라우저를 껐다가 켜면 그 기록이 날아간다면 안 되겠죠?
이를 방지하기 위해 Zustand의 `persist` 기능을 도입하여 브라우저의 저장소(LocalStorage)에 기록을 남겼습니다.

**[실제 동작 로직: `useAssetStore.ts`]**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AssetStore {
  forkedRecipeIds: number[]; // 유저가 Fork한 레시피들의 ID 번호 목록
  toggleFork: (id: number) => void;
  isForked: (id: number) => boolean;
}

export const useAssetStore = create<AssetStore>()(
  // persist로 감싸주기만 하면 새로고침해도 데이터가 날아가지 않습니다!
  persist(
    (set, get) => ({
      forkedRecipeIds: [], // 처음엔 빈 배열
      
      // 토글 로직: 이미 있다면 빼고, 없다면 배열에 추가합니다.
      toggleFork: (id) => set((state) => {
        const isExist = state.forkedRecipeIds.includes(id);
        return {
          forkedRecipeIds: isExist 
            ? state.forkedRecipeIds.filter(recipeId => recipeId !== id)
            : [...state.forkedRecipeIds, id]
        };
      }),
      
      // 현재 레시피가 내가 Fork한 녀석인지 확인하는 헬퍼 함수
      isForked: (id) => get().forkedRecipeIds.includes(id),
    }),
    { name: 'asset-storage' } // LocalStorage에 저장될 키(이름)
  )
);
```

---

## 2. 통합 모의 데이터(Mock Data) 시스템 구축

### 🚨 어떤 문제가 있었나요?

커뮤니티 페이지에서 'Lung Cancer' 레시피를 보고 Fork를 눌렀는데, 내 자산(Assets) 페이지에 가보니 뜬금없이 '심장 질환' 레시피가 들어와 있는 황당한 버그가 있었습니다.

### 💡 원인과 해결 방법

원인은 커뮤니티 페이지와 자산 페이지가 **각각 따로 만든 가짜 데이터(Mock Data)를 쓰고 있었기 때문**입니다. 커뮤니티에서는 1번 레시피가 'Lung Cancer'였는데, 자산 페이지에서는 1번이 '심장 질환'으로 설정되어 있었던 거죠.

이러한 **데이터 불일치(정합성 깨짐)**를 막기 위해, 프로젝트 전체가 공유하는 단 하나의 거대한 가짜 데이터 파일(`src/store/mockData.ts`)을 만들었습니다. 이제 모든 페이지가 하나의 출처에서 데이터를 꺼내 쓰기 때문에 화면마다 데이터가 다르게 나오는 버그를 원천 차단했습니다.

---

## 3. 내 것만 골라보기: 필터링 로직

Assets(내 자산) 페이지에는 '내가 만든 레시피'와 '남의 것을 Fork해온 레시피' 두 가지 탭이 있습니다. 앞서 만든 통합 데이터를 바탕으로 화면에 뿌려주는 로직을 구현했습니다.

**[실제 동작 로직: `AssetsPage.tsx`]**

```tsx
import { ALL_RECIPES } from '../../store/mockData';
import { useAssetStore } from '../../store/useAssetStore';
import { useAuthStore } from '../../store/useAuthStore';

// 1. 현재 로그인한 내 정보와, 내가 Fork한 ID 목록을 꺼내옵니다.
const { user } = useAuthStore();
const { forkedRecipeIds } = useAssetStore();

// 2. '내 레시피' 탭: 전체 데이터 중 작성자(author)가 '나'인 것만 걸러냅니다.
const myRecipes = ALL_RECIPES.filter(recipe => recipe.author === user?.name);

// 3. 'Fork한 레시피' 탭: 전체 데이터 중 ID가 'forkedRecipeIds' 안에 있는 것만 걸러냅니다.
const forkedRecipes = ALL_RECIPES.filter(recipe => forkedRecipeIds.includes(recipe.id));
```

이렇게 하면 복잡한 백엔드 API 없이도, 프론트엔드 단독으로 그럴싸한 분류 시스템을 완벽하게 흉내 낼 수 있습니다!

---

## 4. 백엔드 스펙에 맞춘 리팩토링

이후 백엔드 개발자분들과 회의를 거쳐 확정된 실제 API JSON 명세에 맞춰, 프론트엔드 데이터의 이름표를 싹 고쳤습니다.

* `name` ➡️ `title` (이름 대신 제목으로 변경)
* `thumbnail` ➡️ `thumbnailUrl` (단순한 텍스트가 아니라 URL임을 명시)
* `forkCount` ➡️ `forkedCount`

이 작업을 미리 해두었기 때문에, 나중에 가짜 데이터를 지우고 진짜 백엔드 서버를 붙일 때 코드를 거의 수정하지 않아도 됩니다.
