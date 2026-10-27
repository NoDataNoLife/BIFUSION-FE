import { create } from 'zustand';
import api from '../lib/axios';
import { requestMessage } from '../lib/liveData';
import { invitationRolesEnabled } from '../lib/backendFeatures';

export interface ProjectMember {
  userId: number;
  nickname: string | null;
  profileImageUrl: string | null;
}

export interface ProjectDetailMember {
  userId: number;
  nickname: string | null;
  email: string | null;
  profileImageUrl: string | null;
  role: string;
}

export interface ProjectDetail {
  projectId: number;
  title: string;
  description: string;
  bannerImageUrl: string | null;
  members: ProjectDetailMember[];
}

export interface Project {
  projectId: number;
  title: string;
  description: string;
  role: "MANAGER" | "MEMBER";
  bannerImageUrl: string | null;
  isFavorited: boolean;
  memberCount: number;
  members: ProjectMember[];
  lastActivityAt: string | null;
}

export interface ProjectResponseData {
  managingProjects: Project[];
  participatingProjects: Project[];
}

interface ProjectState {
  managingProjects: Project[];
  participatingProjects: Project[];
  currentProject: ProjectDetail | null;
  isLoading: boolean;
  error: string | null;
  fetchMyProjects: () => Promise<boolean>;
  fetchProjectDetail: (projectId: string) => Promise<boolean>;
  createProject: (data: any) => Promise<boolean>;
  updateProjectInfo: (projectId: string, data: any) => Promise<boolean>;
  updateProjectBanner: (projectId: string, file: File | null) => Promise<boolean>;
  inviteMember: (projectId: string, email: string, role?: "MEMBER" | "MANAGER") => Promise<boolean>;
  removeMember: (projectId: string, userId: number) => Promise<boolean>;
  updateMemberRole: (projectId: string, userId: number, role: string) => Promise<boolean>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  managingProjects: [],
  participatingProjects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchMyProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/projects');
      if (response.data.success) {
        const data: ProjectResponseData = response.data.data;
        set({
          managingProjects: data.managingProjects || [],
          participatingProjects: data.participatingProjects || [],
          isLoading: false
        });
        return true;
      } else {
        set({ error: 'Failed to load projects', isLoading: false });
        return false;
      }
    } catch (error: unknown) {
      console.error('Failed to fetch projects:', error);
      const errorMessage = requestMessage(error, 'An error occurred');
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  createProject: async (projectData: any) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        title: projectData.name,
        description: projectData.description,
        isPublic: true,

      };

      const response = await api.post('/projects', payload);
      if (response.data.success) {
        const projectId = response.data.data?.projectId;
        const warnings: string[] = [];
        if (!projectId) {
          set({ error: '프로젝트는 생성되었지만 번호를 확인하지 못했습니다. 목록에서 확인해 주세요.', isLoading: false });
          return true;
        }
        if (projectData.coverFile) {
          const ok = await get().updateProjectBanner(String(projectId), projectData.coverFile);
          if (!ok) warnings.push('배경 이미지 저장 실패: ' + get().error);
        }
        for (const member of projectData.teamMembers || []) {
          if (!member.email?.trim()) continue;
          const ok = await get().inviteMember(String(projectId), member.email.trim(), member.role);
          if (!ok) warnings.push('초대 실패 (' + member.email + '): ' + get().error);
        }
        set({ isLoading: false, error: warnings.length ? '프로젝트는 생성되었습니다. ' + warnings.join(' / ') + ' 프로젝트 설정에서 다시 시도해 주세요.' : null });
        return true;
      } else {
        set({ error: 'Failed to create project', isLoading: false });
        return false;
      }
    } catch (error: unknown) {
      console.error('Failed to create project:', error);
      const errorMessage = requestMessage(error, 'An error occurred');
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  fetchProjectDetail: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/projects/${projectId}`);
      if (response.data.success) {
        set({ currentProject: response.data.data, isLoading: false });
        return true;
      } else {
        set({ error: 'Failed to load project details', isLoading: false });
        return false;
      }
    } catch (error: unknown) {
      console.error('Failed to fetch project detail:', error);
      const errorMessage = requestMessage(error, 'An error occurred');
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateProjectInfo: async (projectId: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        title: data.title,
        description: data.description
      };
      const response = await api.put(`/projects/${projectId}`, payload);
      if (response.data.success) {
        set((state) => ({
          currentProject: state.currentProject?.projectId === Number(projectId)
            ? { ...state.currentProject, ...payload } : state.currentProject,
          managingProjects: state.managingProjects.map(project => project.projectId === Number(projectId) ? { ...project, ...payload } : project),
          participatingProjects: state.participatingProjects.map(project => project.projectId === Number(projectId) ? { ...project, ...payload } : project),
          isLoading: false
        }));
        return true;
      }
      set({ error: '프로젝트 설정을 저장하지 못했습니다.', isLoading: false });
      return false;
    } catch (error: unknown) {
      console.error('Failed to update project detail:', error);
      const errorMessage = requestMessage(error, 'An error occurred');
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateProjectBanner: async (projectId, file) => {
    set({ isLoading: true, error: null });
    try {
      const form = new FormData();
      if (file) form.append('file', file);
      const response = await api.patch(`/projects/${projectId}/banner`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (!response.data.success) throw new Error(response.data.message || '배경 이미지 저장에 실패했습니다.');
      const bannerImageUrl = response.data.data?.bannerImageUrl ?? null;
      set(state => ({
        currentProject: state.currentProject?.projectId === Number(projectId) ? { ...state.currentProject, bannerImageUrl } : state.currentProject,
        managingProjects: state.managingProjects.map(p => p.projectId === Number(projectId) ? { ...p, bannerImageUrl } : p),
        participatingProjects: state.participatingProjects.map(p => p.projectId === Number(projectId) ? { ...p, bannerImageUrl } : p),
        isLoading: false,
      }));
      return true;
    } catch (error) { set({ error: requestMessage(error, '배경 이미지 저장에 실패했습니다.'), isLoading: false }); return false; }
  },

  inviteMember: async (projectId: string, email: string, role = "MEMBER") => {
    if (role === "MANAGER" && !invitationRolesEnabled) {
      set({ error: "관리자 초대는 서버 반영 후 사용할 수 있습니다." }); return false;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/projects/${projectId}/invitations`, { email, role });
      if (response.data.success) {
        set({ isLoading: false });
        return true;
      }
      set({ error: '초대를 보내지 못했습니다.', isLoading: false });
      return false;
    } catch (error: unknown) {
      const errorMessage = requestMessage(error, '초대를 보내지 못했습니다.');
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  removeMember: async (projectId: string, userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.delete(`/projects/${projectId}/members/${userId}`);
      if (response.data.success) {
        // 성공 시 로컬 상태에서 멤버 제거
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                members: state.currentProject.members.filter(m => m.userId !== userId)
              }
            : null,
          isLoading: false
        }));
        return true;
      }
      return false;
    } catch (error: unknown) {
      const errorMessage = requestMessage(error, 'An error occurred');
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateMemberRole: async (projectId: string, userId: number, role: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/projects/${projectId}/members/${userId}`, { role });
      if (response.data.success) {
        // 성공 시 로컬 상태의 멤버 역할 업데이트
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                members: state.currentProject.members.map(m =>
                  m.userId === userId ? { ...m, role: role } : m
                )
              }
            : null,
          isLoading: false
        }));
        return true;
      }
      return false;
    } catch (error: unknown) {
      const errorMessage = requestMessage(error, 'An error occurred');
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  }
}));
