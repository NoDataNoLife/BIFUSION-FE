import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AssetStore {
  forkedRecipeIds: string[];
  toggleFork: (recipeId: string) => void;
  isForked: (recipeId: string) => boolean;
}

export const useAssetStore = create<AssetStore>()(
  persist(
    (set, get) => ({
      forkedRecipeIds: [],
      toggleFork: (recipeId: string) => {
        const { forkedRecipeIds } = get();
        const isAlreadyForked = forkedRecipeIds.includes(recipeId);
        
        if (isAlreadyForked) {
          set({
            forkedRecipeIds: forkedRecipeIds.filter(id => id !== recipeId)
          });
        } else {
          set({
            forkedRecipeIds: [...forkedRecipeIds, recipeId]
          });
        }
      },
      isForked: (recipeId: string) => {
        return get().forkedRecipeIds.includes(recipeId);
      },
    }),
    {
      name: 'bifusion-asset-storage',
    }
  )
);
