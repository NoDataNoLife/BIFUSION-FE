import { create } from 'zustand';
import api from '../lib/axios';

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
  inviteMember: (projectId: string, email: string) => Promise<boolean>;
  removeMember: (projectId: string, userId: number) => Promise<boolean>;
  updateMemberRole: (projectId: string, userId: number, role: string) => Promise<boolean>;
}

export const useProjectStore = create<ProjectState>((set) => ({
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
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
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
        ...(projectData.coverImageUrl && { bannerImageUrl: projectData.coverImageUrl }),
        ...(projectData.teamMembers && projectData.teamMembers.length > 0 && projectData.teamMembers[0].email && {
          email: projectData.teamMembers[0].email,
          role: projectData.teamMembers[0].role.toUpperCase()
        })
      };

      const response = await api.post('/projects', payload);
      if (response.data.success) {
        set({ isLoading: false });
        return true;
      } else {
        set({ error: 'Failed to create project', isLoading: false });
        return false;
      }
    } catch (error: unknown) {
      console.error('Failed to create project:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
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
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateProjectInfo: async (projectId: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        title: data.title,
        description: data.description,
        bannerImageUrl: data.bannerImageUrl
      };
      const response = await api.put(`/projects/${projectId}`, payload);
      if (response.data.success) {
        set((state) => ({
          currentProject: state.currentProject ? { ...state.currentProject, ...payload } : null,
          isLoading: false
        }));
        return true;
      }
      return false;
    } catch (error: unknown) {
      console.error('Failed to update project detail:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  inviteMember: async (projectId: string, email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/projects/${projectId}/invitations`, { email });
      if (response.data.success) {
        set({ isLoading: false });
        return true;
      }
      return false;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
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
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
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
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  }
}));
