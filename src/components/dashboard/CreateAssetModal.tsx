import React, { useState } from 'react';
import { X, Beaker, Database, ArrowLeft } from 'lucide-react';
import ShowcaseCreateForm from '../community/forms/ShowcaseCreateForm';
import DatasetCreateForm from '../community/forms/DatasetCreateForm';

type AssetCategory = 'RECIPE' | 'DATASET' | null;

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateAssetModal({ isOpen, onClose }: CreateAssetModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedCategory(null);
    onClose();
  };

  const renderCategorySelection = () => (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-foreground tracking-tight">새로운 자산 추가</h2>
        <p className="text-muted-foreground mt-2 font-medium">어떤 유형의 자산을 추가하시겠어요?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedCategory('RECIPE')}
          className="flex flex-col items-start p-6 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Beaker size={24} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">새 레시피 만들기</h3>
          <p className="text-muted-foreground text-sm font-medium">나만의 파이프라인 레시피를 등록하여 실험을 관리하세요.</p>
        </button>

        <button
          onClick={() => setSelectedCategory('DATASET')}
          className="flex flex-col items-start p-6 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Database size={24} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">새 데이터셋 추가</h3>
          <p className="text-muted-foreground text-sm font-medium">의료 데이터셋을 업로드하여 자산으로 활용하세요.</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border">
        
        {/* Header Navigation */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="p-2 hover:bg-background rounded-lg transition-colors text-muted-foreground flex items-center gap-1 font-bold text-sm"
              >
                <ArrowLeft size={16} /> 뒤로가기
              </button>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1">
          {!selectedCategory && renderCategorySelection()}
          {selectedCategory === 'RECIPE' && <ShowcaseCreateForm onClose={handleClose} />}
          {selectedCategory === 'DATASET' && <DatasetCreateForm onClose={handleClose} />}
        </div>
      </div>
    </div>
  );
}
