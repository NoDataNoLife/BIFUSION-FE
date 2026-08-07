import { useState } from 'react';
import { ArrowLeft, Users, MapPin, Briefcase, Clock, CheckCircle, Send, Calendar } from 'lucide-react';
import api from '../../lib/axios';

interface RecruitmentDetailProps {
  recruitmentPost: {
    id: string;
    title: string;
    organization: string;
    tags: string[];
    memberCount: string;
    deadline: string;
  };
  onBack: () => void;
}

export default function RecruitmentDetail({ recruitmentPost, onBack }: RecruitmentDetailProps) {
  const [applicationName, setApplicationName] = useState('');
  const [applicationEmail, setApplicationEmail] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationName || !applicationEmail || !applicationMessage) return;

    setIsSubmitting(true);
    try {
      await api.post(`/community/recruitments/${recruitmentPost.id}/apply`, {
        fullName: applicationName,
        email: applicationEmail,
        resumeUrl: resumeUrl || null,
        motivation: applicationMessage,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('지원 실패:', error);
      alert('지원에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
        <div className="max-w-xl w-full bg-white rounded-[3rem] p-12 text-center border border-gray-100 shadow-2xl space-y-8">
          <div className="w-24 h-24 bg-green-50 rounded-4xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">지원이 완료되었습니다!</h1>
            <p className="text-gray-500 font-medium leading-relaxed">
              <span className="text-primary font-bold">{recruitmentPost.organization}</span> 팀에 소중한 지원서가 전달되었습니다. 
              검토 후 연락드리겠습니다.
            </p>
          </div>
          <button
            onClick={onBack}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-all shadow-xl shadow-gray-200"
          >
            커뮤니티로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-primary transition-all group font-bold text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            커뮤니티로 돌아가기
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
        {/* Job Header */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-24 h-24 bg-primary/10 rounded-4xl flex items-center justify-center shrink-0">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-4 flex-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">{recruitmentPost.title}</h1>
              <div className="flex flex-wrap gap-6 text-gray-400 font-bold text-sm uppercase tracking-widest">
                <div className="flex items-center gap-2 text-primary">
                  <Briefcase size={18} /> {recruitmentPost.organization}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} /> {recruitmentPost.tags[0]}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} /> {recruitmentPost.deadline} 까지
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col items-center justify-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">모집 현황</p>
              <p className="text-2xl font-black text-gray-900">{recruitmentPost.memberCount}</p>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-50 space-y-10">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-gray-900 mb-6">프로젝트 및 포지션 소개</h2>
              <p className="text-gray-600 font-medium leading-loose">
                저희 팀은 {recruitmentPost.title.toLowerCase()} 연구를 함께 이끌어갈 열정적인 동료를 찾고 있습니다. 
                최신 의료 AI 기술을 실제 임상 현장에 적용하기 위한 도전적인 과제를 수행하고 있으며, 
                다양한 분야의 전문가들과 함께 성장할 수 있는 기회를 제공합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-gray-50 rounded-4xl border border-gray-100 space-y-6">
                <h3 className="text-lg font-black text-gray-900">핵심 자격 요건</h3>
                <ul className="space-y-4">
                  {['의료 AI 또는 딥러닝 관련 기초 지식', '팀 협업 및 원활한 커뮤니케이션 능력', '새로운 기술에 대한 호기심과 학습 의지', '프로젝트 일정 준수 및 책임감'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-gray-600 font-medium text-sm leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 bg-primary/5 rounded-4xl border border-primary/10 space-y-6">
                <h3 className="text-lg font-black text-primary">팀 활동 혜택</h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: '유연한 일정', desc: '비대면 협업을 통한 효율적인 시간 관리' },
                    { label: '전문가 네트워킹', desc: '해당 분야 최고 전문가들과의 직접 소통' },
                    { label: '논문 공동 저자', desc: '연구 성과에 따른 논문 참여 기회 제공' }
                  ].map((benefit, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{benefit.label}</p>
                        <p className="text-xs text-gray-500 font-medium">{benefit.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-gray-900 rounded-[3rem] p-12 shadow-2xl space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">팀 합류 지원하기</h2>
            <p className="text-gray-400 font-medium">당신의 연구 여정을 Bifusion 팀과 함께 시작하세요</p>
          </div>

          <form onSubmit={handleSubmitApplication} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">성함</label>
                <input
                  type="text"
                  value={applicationName}
                  onChange={(e) => setApplicationName(e.target.value)}
                  placeholder="홍길동"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">이메일 주소</label>
                <input
                  type="email"
                  value={applicationEmail}
                  onChange={(e) => setApplicationEmail(e.target.value)}
                  placeholder="researcher@example.com"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">지원 동기 및 포부</label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                placeholder="이 프로젝트에 참여하고 싶은 이유와 기여하고 싶은 부분을 자유롭게 적어주세요..."
                className="w-full h-48 px-6 py-5 bg-white/5 border border-white/10 rounded-3xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-2">이력서 URL <span className="text-gray-600 normal-case tracking-normal">(선택)</span></label>
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isSubmitting || !applicationName || !applicationEmail || !applicationMessage}
                className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-4xl font-black text-lg hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send size={24} /> {isSubmitting ? '제출 중...' : '지원서 제출하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
