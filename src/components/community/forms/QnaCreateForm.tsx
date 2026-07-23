import React, { useState } from 'react';
import { useCommunityStore } from '../../../store/useCommunityStore';
import api from '../../../lib/axios';

export default function QnaCreateForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchQnaList } = useCommunityStore();

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/community/qna', {
        title,
        content,
        tags
      });
      alert('질문이 등록되었습니다!');
      fetchQnaList();
      onClose();
    } catch (error) {
      alert('질문 등록에 실패했습니다. 다시 시도해주세요.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-black text-gray-900 mb-2">전문가 Q&A 질문하기</h3>
      <p className="text-gray-500 mb-8 font-medium">해결되지 않는 연구 문제를 구체적으로 작성해 주세요.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">질문 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            placeholder="어떤 문제가 발생했나요?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">질문 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium h-48 resize-none"
            placeholder="발생한 에러 메시지나 시도해본 방법 등을 상세히 적어주세요."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">태그</label>
          <div className="w-full px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-wrap gap-2 items-center min-h-[52px]">
            {tags.map(tag => (
              <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="flex-1 min-w-[120px] outline-none font-medium text-sm bg-transparent"
              placeholder={tags.length === 0 ? "태그 입력 후 엔터..." : ""}
            />
          </div>
        </div>
        
        <div className="pt-4 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button 
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '질문 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
