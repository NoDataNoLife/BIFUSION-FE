import React from 'react';

interface ShowcaseCreateFormProps {
  onClose: () => void;
  context?: 'COMMUNITY' | 'ASSET';
}

export default function ShowcaseCreateForm({ onClose, context = 'COMMUNITY' }: ShowcaseCreateFormProps) {
  const isAsset = context === 'ASSET';
  
  return (
    <div className="p-8">
      <h3 className="text-2xl font-black text-foreground mb-6">
        {isAsset ? '새 레시피 만들기' : '연구 쇼케이스 작성'}
      </h3>
      <p className="text-muted-foreground mb-8">
        {isAsset 
          ? '나만의 파이프라인 레시피를 만들어 개인 작업실에 안전하게 저장하세요.'
          : '완성된 연구 결과물이나 노하우를 커뮤니티에 공유해 보세요.'}
      </p>
      
      {/* Form will be implemented here */}
      <div className="bg-muted rounded-xl p-8 text-center border-2 border-dashed border-border">
        <p className="text-muted-foreground font-medium">쇼케이스 작성 폼 준비 중...</p>
      </div>
      
      <div className="mt-8 flex justify-end gap-3">
        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-muted-foreground bg-muted hover:bg-gray-200 transition-colors">
          취소
        </button>
        <button 
          onClick={() => {
            alert(isAsset ? '새 레시피가 내 작업실에 저장되었습니다! (Mock)' : '쇼케이스가 등록되었습니다! (Mock)');
            onClose();
          }}
          className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          {isAsset ? '레시피 저장' : '게시글 등록'}
        </button>
      </div>
    </div>
  );
}
