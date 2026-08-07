import React from 'react';

export default function ShowcaseCreateForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-black text-gray-900 mb-6">연구 쇼케이스 작성</h3>
      <p className="text-gray-500 mb-8">완성된 연구 결과물이나 노하우를 커뮤니티에 공유해 보세요.</p>
      
      {/* Form will be implemented here */}
      <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">쇼케이스 작성 폼 준비 중...</p>
      </div>
      
      <div className="mt-8 flex justify-end gap-3">
        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">
          취소
        </button>
        <button className="px-6 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90">
          게시글 등록
        </button>
      </div>
    </div>
  );
}
