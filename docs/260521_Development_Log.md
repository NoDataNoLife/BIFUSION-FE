# BIFUSION 개발 일지 (2026-05-21)

## 1. 개요
마이페이지에서 프로필 사진 수정(업로드) 기능은 정상적으로 작동하나, 새로고침하거나 페이지를 다시 로드할 때 프로필 이미지가 항상 기본 이미지로 원복되는 현상을 발견함. 이를 해결하기 위해 프론트엔드의 상태 관리 로직(Zustand)과 백엔드 조회 API(`GET /api/v1/users/{userId}`)의 상태 불일치 문제를 분석하고, 주니어 개발자를 위한 교훈과 협업 요청 사양을 기록함.

---

## 2. 작업 상세 내역 및 코드 분석

### 2.1 문제 현상과 원인 분석
*   **현상**: 사용자가 프로필 수정 버튼을 눌러 사진을 업로드하면 화면에 반영되지만, 새로고침을 하거나 다른 페이지를 방문했다가 프로필로 돌아오면 다시 기본 이미지(`/defaultUserProfile.png`)로 변경됨.
*   **원인**: 
    1.  **수정 API**(`PUT /profile/image`)는 업로드된 이미지의 URL(`profileImageUrl`)을 올바르게 반환하여 Zustand 스토어 상태를 임시로 업데이트함.
    2.  하지만 새로고침 시 화면 진입 과정에서 **조회 API**(`GET /api/v1/users/{userId}`)가 재호출되는데, 이 API의 응답 스펙에는 프로필 이미지 URL 필드가 누락되어 있음.
    3.  따라서 프론트엔드는 서버로부터 해당 유저의 프로필 사진 정보를 내려받지 못해 상태를 기본 이미지로 덮어쓰게 됨.

---

### 2.2 코드 레벨에서의 동작 분석

#### 1) 프로필 이미지 업로드 (상태 수정 및 임시 저장)
사용자가 이미지를 업로드하면 아래의 `updateProfileImage` 액션이 실행됩니다.
```typescript
// src/store/useAuthStore.ts
updateProfileImage: async (file: File) => {
  try {
    const user = get().user;
    if (!user) return false;

    const formData = new FormData();
    formData.append('image', file);

    const response = await api.put('/profile/image', formData, {
      headers: { 'Content-Type': undefined },
    });

    if (response.data.success) {
      // 1. 백엔드에서 업로드 완료 후 S3 주소(profileImageUrl)를 돌려줌
      const newProfileImageUrl = response.data.data.profileImageUrl;
      
      // 2. 프론트엔드 Zustand 스토어의 user.profileImage를 임시로 업데이트
      set((state) => ({
        user: state.user ? { ...state.user, profileImage: safeEncodeUrl(newProfileImageUrl) } : null
      }));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to update profile image:', error);
    return false;
  }
}
```

#### 2) 프로필 조회 및 정보 동기화 (상태의 초기화 및 손실)
새로고침을 하거나 마이페이지 진입 시 아래의 `fetchUserProfile`이 호출됩니다.
```typescript
// src/store/useAuthStore.ts
fetchUserProfile: async (userId: number) => {
  try {
    const response = await api.get(`/users/${userId}`);
    if (response.data.success) {
      const profileData = response.data.data;
      set((state) => ({
        user: state.user ? {
          ...state.user,
          ...profileData, // profileData에 이미지 정보가 없기 때문에 기존 데이터 유실 위험 존재
          bio: profileData.introduction ?? state.user.bio,
          organization: profileData.location ?? state.user.organization,
          websiteUrl: profileData.website ?? state.user.websiteUrl,
          isExpert: profileData.isExpert ?? state.user.isExpert,
          createdAt: profileData.createdAt ?? state.user.createdAt,
        } : {
          userId: profileData.userId,
          name: profileData.name,
          nickname: profileData.nickname,
          email: '',
          bio: profileData.introduction,
          introduction: profileData.introduction,
          organization: profileData.location,
          location: profileData.location,
          websiteUrl: profileData.website,
          website: profileData.website,
          createdAt: profileData.createdAt,
          isExpert: profileData.isExpert,
          // 3. API 응답(profileData)에 이미지 정보가 없으므로, 새 상태 구성 시 기본 이미지로 강제 세팅됨
          profileImage: '/defaultUserProfile.png', 
        } as User
      }));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return false;
  }
}
```

---

## 3. 💡 주니어 개발자를 위한 아키텍처 레슨

### Lesson 1: "쓰기(CUD)"와 "읽기(R)" API의 일치성 (State Consistency)
*   웹 서비스 개발 시 **"정보를 바꾸는 것(수정)"**과 **"정보를 화면에 보여주는 것(조회)"**은 동전의 양면과 같습니다.
*   아무리 수정 API가 성공적으로 데이터베이스를 바꾸고 새로운 값을 프론트에 바로 넘겨주더라도, 화면의 생명주기(새로고침, 세션 만료, 컴포넌트 재마운트 등)에 의해 다시 서버에 해당 리소스를 달라고 조회(`GET`)를 요청하게 됩니다.
*   따라서 특정 리소스의 속성을 변경하는 API를 만들었다면, **해당 리소스를 조회하는 API 스펙에도 변경 항목이 빠짐없이 포함**되어야 최종적인 상태 일관성(Consistency)이 유지됩니다.

### Lesson 2: 클라이언트 상태(Zustand)의 한계와 서버 상태 동기화 (Server State Synchronization)
*   Zustand, Redux, Recoil 등 프론트엔드의 전역 상태 관리 라이브러리는 브라우저의 메모리상에 상태(State)를 보관합니다.
*   새로고침을 하거나 다른 세션에서 진입하게 되면 메모리가 완전히 클리어되므로, 이전의 상태는 사라지고 초기 상태로 복구됩니다.
*   이를 방지하고 지속성(Persistence)을 갖게 하려면 로컬 스토리지에 캐시하거나 백엔드 데이터베이스를 원천 소스(Source of Truth)로 바라보고 매번 조회 API를 통하여 상태를 재구축해야 합니다. 이때 조회 API 스펙이 불충분하면 프론트엔드는 유효한 상태를 복원할 수 없습니다.

---

## 4. 백엔드 협업 요청 사양

현재 동기화 에러를 해결하기 위해 백엔드 파트에 아래 스펙 추가를 요청함.

*   **요청 API**: `GET /api/v1/users/{userId}`
*   **요청 사양**: 기존 `data` 응답 필드 내에 유저가 등록한 프로필 이미지의 S3 URL 필드 추가 반환
*   **응답 데이터 예시**:
    ```json
    {
        "success": true,
        "data": {
            "userId": 11,
            "name": "조현희",
            "nickname": "hehe",
            "introduction": null,
            "location": "대한민국, 부산",
            "website": null,
            "createdAt": "2026년 5월 가입",
            "isExpert": false,
            "profileImageUrl": "https://.../profile/5990e122-dd15-4f56.jpg" // 추가 요청 필드
        },
        "message": "마이페이지 조회 성공!"
    }
    ```

---
*마지막 업데이트: 2026-05-21*
