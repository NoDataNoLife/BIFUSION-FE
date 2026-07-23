import React, { useState } from 'react';
import { useCommunityStore } from '../../../store/useCommunityStore';
import api from '../../../lib/axios';

export default function RecruitmentCreateForm({ onClose }: { onClose: () => void }) {
  const [jobTitle, setJobTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [teamSize, setTeamSize] = useState<number>(1);
  const [deadline, setDeadline] = useState('');
  
  // List fields
  const [requirements, setRequirements] = useState<string[]>([]);
  const [responsibilities, setResponsibilities] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  // Input states for list fields
  const [reqInput, setReqInput] = useState('');
  const [respInput, setRespInput] = useState('');
  const [benInput, setBenInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { fetchRecruitmentList } = useCommunityStore();

  const handleAddToList = (
    e: React.KeyboardEvent<HTMLInputElement>,
    input: string,
    setInput: (val: string) => void,
    list: string[],
    setList: (val: string[]) => void
  ) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!list.includes(input.trim())) {
        setList([...list, input.trim()]);
      }
      setInput('');
    }
  };

  const handleRemoveFromList = (itemToRemove: string, list: string[], setList: (val: string[]) => void) => {
    setList(list.filter(item => item !== itemToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !organization.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await api.post('/api/v1/community/recruitments', {
        jobTitle,
        organization,
        description,
        requirements,
        responsibilities,
        benefits,
        teamSize,
        deadline: deadline || null,
        tags
      });
      alert('모집 공고가 등록되었습니다!');
      fetchRecruitmentList();
      onClose();
    } catch (error) {
      alert('공고 등록에 실패했습니다. 다시 시도해주세요.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-black text-gray-900 mb-2">팀원 모집 공고 올리기</h3>
      <p className="text-gray-500 mb-8 font-medium">연구 프로젝트를 함께 이끌어갈 우수한 인재를 모집하세요.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">포지션 제목</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="예: 의료 AI 논문 작성 파트너 구합니다"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">소속 / 기관</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              placeholder="예: 서울대학교병원, 개인 프로젝트 등"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">포지션 상세 설명</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium h-32 resize-none"
            placeholder="프로젝트의 목표와 찾고 있는 팀원에 대해 자세히 설명해주세요."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">모집 인원</label>
            <input
              type="number"
              min="1"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">마감일 (선택)</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
        </div>

        {/* List Inputs: Requirements, Responsibilities, Benefits, Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">자격 요건 (엔터로 추가)</label>
            <div className="w-full px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-wrap gap-2 items-center min-h-[52px]">
              {requirements.map(item => (
                <span key={item} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  {item}
                  <button type="button" onClick={() => handleRemoveFromList(item, requirements, setRequirements)} className="hover:text-gray-900">&times;</button>
                </span>
              ))}
              <input type="text" value={reqInput} onChange={(e) => setReqInput(e.target.value)} onKeyDown={(e) => handleAddToList(e, reqInput, setReqInput, requirements, setRequirements)} className="flex-1 min-w-[120px] outline-none font-medium text-sm bg-transparent" placeholder={requirements.length === 0 ? "예: PyTorch 능숙자" : ""} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">주요 업무 (엔터로 추가)</label>
            <div className="w-full px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-wrap gap-2 items-center min-h-[52px]">
              {responsibilities.map(item => (
                <span key={item} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  {item}
                  <button type="button" onClick={() => handleRemoveFromList(item, responsibilities, setResponsibilities)} className="hover:text-gray-900">&times;</button>
                </span>
              ))}
              <input type="text" value={respInput} onChange={(e) => setRespInput(e.target.value)} onKeyDown={(e) => handleAddToList(e, respInput, setRespInput, responsibilities, setResponsibilities)} className="flex-1 min-w-[120px] outline-none font-medium text-sm bg-transparent" placeholder={responsibilities.length === 0 ? "예: 데이터 전처리" : ""} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">제공 혜택 (엔터로 추가)</label>
            <div className="w-full px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-wrap gap-2 items-center min-h-[52px]">
              {benefits.map(item => (
                <span key={item} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  {item}
                  <button type="button" onClick={() => handleRemoveFromList(item, benefits, setBenefits)} className="hover:text-gray-900">&times;</button>
                </span>
              ))}
              <input type="text" value={benInput} onChange={(e) => setBenInput(e.target.value)} onKeyDown={(e) => handleAddToList(e, benInput, setBenInput, benefits, setBenefits)} className="flex-1 min-w-[120px] outline-none font-medium text-sm bg-transparent" placeholder={benefits.length === 0 ? "예: 논문 공저자 등재" : ""} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">태그 (엔터로 추가)</label>
            <div className="w-full px-4 py-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex flex-wrap gap-2 items-center min-h-[52px]">
              {tags.map(item => (
                <span key={item} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  {item}
                  <button type="button" onClick={() => handleRemoveFromList(item, tags, setTags)} className="hover:text-primary/70">&times;</button>
                </span>
              ))}
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => handleAddToList(e, tagInput, setTagInput, tags, setTags)} className="flex-1 min-w-[120px] outline-none font-medium text-sm bg-transparent" placeholder={tags.length === 0 ? "예: 의료AI" : ""} />
            </div>
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
            disabled={isSubmitting || !jobTitle.trim() || !organization.trim() || !description.trim()}
            className="px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? '등록 중...' : '공고 등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
