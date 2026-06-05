import { create } from 'zustand';
import api from '../lib/axios';

export interface ProjectMember {
  userId: number;
  nickname: string | null;
  profileImageUrl: string | null;
}

export interface Project {
  projectId: number;
  title: string;
  description: string;
  role: "LEADER" | "MEMBER";
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
  isLoading: boolean;
  error: string | null;
  fetchMyProjects: () => Promise<boolean>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  managingProjects: [],
  participatingProjects: [],
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
  }
}));
