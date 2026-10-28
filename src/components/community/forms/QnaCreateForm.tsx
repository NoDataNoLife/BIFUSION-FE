import { LimitedInput, LimitedTextarea } from '../../common/LimitedTextField';
import { useAuthStore } from '../../../store/useAuthStore';
import { AntCostNotice, AntRequestError } from '../../common/AntActionNotice';
import { createQuestion } from '../../../lib/pointActions';
import React, { useRef, useState } from 'react';
import { useCommunityStore } from '../../../store/useCommunityStore';

export default function QnaCreateForm({ onClose }: { onClose: () => void }) {
  const points = useAuthStore(state => state.user?.points);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const lock = useRef(false);
  const [error, setError] = useState<unknown>(null);
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState('');
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
    if (lock.current || completed || !title.trim() || !content.trim()) return;
    lock.current = true; setError(null);

    setIsSubmitting(true);
    try {
      const { balanceRefreshed } = await createQuestion({ title: title.trim(), content: content.trim(), tags });
      setCompleted(true);
      void fetchQnaList();
      if (balanceRefreshed) onClose();
      else setNotice('질문이 등록되었습니다. 잔액을 갱신하지 못해 새로고침이 필요합니다. 다시 등록할 필요는 없습니다.');
    } catch (error) {
      setError(error);
    } finally {
      lock.current = false; setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-black text-foreground mb-2">전문가 Q&A 질문하기</h3>
      <p className="text-muted-foreground mb-8 font-medium">해결되지 않는 연구 문제를 구체적으로 작성해 주세요.</p>
      
      <AntCostNotice points={points} cost={100} label="질문 등록"/>
      <div className="my-4"><AntRequestError error={error} fallback="질문을 등록하지 못했습니다."/></div>
      {notice && <p role="status" className="mb-4 text-sm text-primary">{notice}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">질문 제목</label>
          <LimitedInput maxLength={100}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            placeholder="어떤 문제가 발생했나요?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">질문 내용</label>
          <LimitedTextarea maxLength={2000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium h-48 resize-none"
            placeholder="발생한 에러 메시지나 시도해본 방법 등을 상세히 적어주세요."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-foreground mb-2">태그</label>
          <div className="w-full px-4 py-3 rounded-xl border border-border focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-wrap gap-2 items-center min-h-13">
            {tags.map(tag => (
              <span key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                  &times;
                </button>
              </span>
            ))}
            <LimitedInput maxLength={50}
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="flex-1 min-w-30 outline-none font-medium text-sm bg-transparent"
              placeholder={tags.length === 0 ? "태그 입력 후 엔터..." : ""}
            />
          </div>
        </div>
        
        <div className="pt-4 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl font-bold text-muted-foreground bg-muted hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {completed ? '닫기' : '취소'}
          </button>
          <button 
            type="submit"
            disabled={completed || isSubmitting || !title.trim() || !content.trim()}
            className="px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '질문 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
