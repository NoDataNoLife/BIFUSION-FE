import React, { useState } from 'react';
import { X, Beaker, Users, Database, HelpCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import DatasetCreateForm from './forms/DatasetCreateForm';
import QnaCreateForm from './forms/QnaCreateForm';
import RecruitmentCreateForm from './forms/RecruitmentCreateForm';
import ShowcaseCreateForm from './forms/ShowcaseCreateForm';

type PostCategory = 'SHOWCASE' | 'QNA' | 'RECRUITMENT' | 'DATASET' | null;

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedCategory(null);
    onClose();
  };

  const renderCategorySelection = () => (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-foreground tracking-tight">새로운 게시글 작성</h2>
        <p className="text-muted-foreground mt-2 font-medium">어떤 유형의 게시글을 작성하시겠어요?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setSelectedCategory('SHOWCASE')}
          className="flex flex-col items-start p-6 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Beaker size={24} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">연구 쇼케이스</h3>
          <p className="text-muted-foreground text-sm font-medium">완성된 연구 결과물이나 파이프라인 레시피를 공유합니다.</p>
        </button>

        <button
          onClick={() => setSelectedCategory('QNA')}
          className="flex flex-col items-start p-6 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <HelpCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">전문가 Q&A</h3>
          <p className="text-muted-foreground text-sm font-medium">연구 중 막히는 부분을 전문가에게 직접 질문하고 답변을 받습니다.</p>
        </button>

        <button
          onClick={() => setSelectedCategory('RECRUITMENT')}
          className="flex flex-col items-start p-6 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-500 dark:text-green-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">팀원 모집</h3>
          <p className="text-muted-foreground text-sm font-medium">새로운 연구 프로젝트를 함께할 팀원을 모집합니다.</p>
        </button>

        <button
          onClick={() => setSelectedCategory('DATASET')}
          className="flex flex-col items-start p-6 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all group text-left"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-500 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Database size={24} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">데이터셋 공유</h3>
          <p className="text-muted-foreground text-sm font-medium">직접 가공한 고품질 데이터셋을 커뮤니티에 기여합니다.</p>
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 border border-border">
        
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
          {selectedCategory === 'SHOWCASE' && <ShowcaseCreateForm onClose={handleClose} />}
          {selectedCategory === 'QNA' && <QnaCreateForm onClose={handleClose} />}
          {selectedCategory === 'RECRUITMENT' && <RecruitmentCreateForm onClose={handleClose} />}
          {selectedCategory === 'DATASET' && <DatasetCreateForm onClose={handleClose} />}
        </div>
      </div>
    </div>
  );
}
