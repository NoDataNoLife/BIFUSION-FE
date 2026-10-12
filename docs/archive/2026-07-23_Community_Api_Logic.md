# BIFUSION 프론트엔드 커뮤니티 API 연동 가이드

이 문서는 커뮤니티(QnA, 데이터셋, 팀원 모집) 페이지에서 프론트엔드와 백엔드가 어떻게 데이터를 주고받는지 초보자의 시선에서 쉽게 풀어쓴 가이드입니다.

---

## 1. 폼(Form) 데이터 전송 원리

사용자가 '질문 등록' 버튼을 누르면 화면에 입력한 제목과 내용이 백엔드로 날아갑니다. 프론트엔드에서는 폼 관리를 위해 보통 리액트 상태(`useState`)를 씁니다.

### 💡 입력부터 전송까지의 흐름

1. **사용자 입력**: 유저가 키보드를 칠 때마다 `onChange` 이벤트가 발생해서 제목 상태(`title`)가 실시간으로 바뀝니다.
2. **버튼 클릭**: 폼의 `onSubmit` 이벤트가 발생합니다.
3. **API 호출**: Axios를 통해 백엔드 주소로 데이터를 `POST` 전송합니다.

**[코드 예시: `QnaCreateForm.tsx`]**

```tsx
import { useState } from 'react';
import api from '../../lib/axios';

export default function QnaCreateForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 폼이 제출(Submit)될 때 실행되는 함수
  const handleSubmit = async (e) => {
    e.preventDefault(); // 화면이 깜빡이며 새로고침되는 것을 막아줍니다.

    try {
      // 백엔드로 보낼 데이터를 예쁘게 포장합니다.
      const requestData = { title, content };
      
      // Axios로 데이터를 쏩니다! (POST 요청)
      await api.post('/community/qna', requestData);
      alert('등록 성공!');
      
    } catch (error) {
      alert('앗, 등록에 실패했어요.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} // 유저가 칠 때마다 title이 바뀜
      />
      <button type="submit">등록하기</button>
    </form>
  );
}
```

---

## 2. API 주소 중복의 함정 (`/api/v1/api/v1/...`)

초기 연동 시 가장 많이 겪는 에러는 `404 Not Found`입니다. 백엔드 주소를 정확히 입력했는데 왜 못 찾는다고 할까요?

### 💡 범인은 전역 설정(baseURL)

우리 프로젝트는 `src/lib/axios.ts` 파일에서 "앞으로 모든 요청 앞에는 무조건 `/api/v1`을 붙여!"라고 설정해 두었습니다.
그런데 컴포넌트에서 호출할 때 습관적으로 `api.post('/api/v1/community/qna')`라고 적어버리면, 브라우저는 이 둘을 합쳐서 `/api/v1/api/v1/community/qna`라는 이상한 곳으로 데이터를 보내게 됩니다.

따라서 컴포넌트 내부에서는 **공통 주소를 생략하고 뒷부분(`/community/qna`)만 적어야 한다는 점**을 꼭 기억해야 합니다!

---

## 3. 리스트 화면을 그리는 마법 (`map`)

백엔드에서 팀원 모집 목록을 성공적으로 받아오면 배열(Array) 형태가 됩니다. 이 배열을 화면의 예쁜 카드 모양으로 여러 개 찍어내려면 리액트의 `map` 함수를 씁니다.

```tsx
// 1. 상태 창고(Zustand)에서 백엔드 데이터를 꺼내옵니다.
const { qnaList } = useCommunityStore();

return (
  <div>
    {/* 2. map 함수로 배열 안의 데이터를 하나씩 꺼내서 태그로 만듭니다. */}
    {qnaList.map((qna) => (
      <div key={qna.qnaId} className="card">
        <h3>{qna.title}</h3>
        <p>작성자: {qna.author.nickname}</p>
      </div>
    ))}
  </div>
);
```

이처럼 프론트엔드 연동은 **1. 백엔드에서 배열을 받아오고 ➡️ 2. 상태에 저장하고 ➡️ 3. map으로 화면에 그린다**는 3단계 규칙만 기억하면 아주 쉽습니다.
