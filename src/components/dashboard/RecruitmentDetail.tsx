import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Briefcase, Clock, CheckCircle, Send, Calendar, Edit2, Trash2, Tag } from 'lucide-react';
import api from '../../lib/axios';
import axios from 'axios';
import { useCommunityStore } from '../../store/useCommunityStore';
import { useAuthStore } from '../../store/useAuthStore';

interface RecruitmentDetailProps {
  recruitmentId: number;
  onBack: () => void;
  onDelete?: () => void;
}

export default function RecruitmentDetail({ recruitmentId, onBack, onDelete }: RecruitmentDetailProps) {
  const { recruitmentDetail, isLoadingDetail, fetchRecruitmentDetail, updateApplicationStatus, error } = useCommunityStore();
  const { user } = useAuthStore();
  const [applicationName, setApplicationName] = useState('');
  const [applicationEmail, setApplicationEmail] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRecruitmentDetail(recruitmentId);
  }, [recruitmentId, fetchRecruitmentDetail]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicationName || !applicationEmail || !applicationMessage) return;

    setIsSubmitting(true);
    try {
      await api.post(`/community/recruitments/${recruitmentId}/apply`, {
        fullName: applicationName,
        email: applicationEmail,
        resumeUrl: resumeUrl || null,
        motivation: applicationMessage,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error('지원 실패:', error);
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        alert('이미 지원한 모집글입니다.');
      } else {
        alert('지원에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const myApplication = recruitmentDetail?.applications?.find(
    (app) => app.applicant.userId === user?.userId
  );

  if (error && !recruitmentDetail) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <div className="text-xl font-bold text-red-500">데이터를 불러오는 데 실패했습니다.</div>
        <div className="text-muted-foreground">{error}</div>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-all">
          돌아가기
        </button>
      </div>
    );
  }

  if (isLoadingDetail || !recruitmentDetail) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl font-bold text-muted-foreground">데이터를 불러오는 중입니다...</div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-xl w-full bg-card rounded-[3rem] p-12 text-center border border-border shadow-2xl space-y-8">
          <div className="w-24 h-24 bg-green-50 rounded-4xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-foreground tracking-tight">지원이 완료되었습니다!</h1>
            <p className="text-muted-foreground font-medium leading-relaxed">
              <span className="text-primary font-bold">{recruitmentDetail.organization}</span> 팀에 소중한 지원서가 전달되었습니다. 
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-8 py-6 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all group font-bold text-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            커뮤니티로 돌아가기
          </button>

          {user?.userId === recruitmentDetail.author?.userId && (
            <div className="flex items-center gap-4">
              <button 
                className="flex items-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground hover:text-primary hover:bg-white rounded-xl font-bold transition-all text-sm border border-transparent hover:border-border"
              >
                <Edit2 size={18} /> 수정
              </button>
              <button 
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all text-sm border border-transparent hover:border-red-100"
              >
                <Trash2 size={18} /> 삭제
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">
        {/* Job Header */}
        <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="w-24 h-24 bg-primary/10 rounded-4xl flex items-center justify-center shrink-0">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-4 flex-1">
              <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">{recruitmentDetail.jobTitle}</h1>
              <div className="flex flex-wrap gap-6 text-muted-foreground font-bold text-sm uppercase tracking-widest">
                <div className="flex items-center gap-2 text-primary">
                  <Briefcase size={18} /> {recruitmentDetail.organization}
                </div>
                {recruitmentDetail.tags && recruitmentDetail.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag size={18} /> {recruitmentDetail.tags.join(', ')}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={18} /> {recruitmentDetail.deadline} 까지
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-muted border border-border rounded-2xl flex flex-col items-center justify-center">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">지원자 수</p>
              <p className="text-2xl font-black text-foreground">{recruitmentDetail.applications?.length || 0} 명</p>
            </div>
          </div>

          <div className="pt-10 border-t border-gray-50 space-y-10">
            <div className="prose prose-slate max-w-none">
              <h2 className="text-2xl font-black text-foreground mb-6">프로젝트 및 포지션 소개</h2>
              <div className="text-muted-foreground font-medium leading-loose whitespace-pre-wrap">
                {recruitmentDetail.content || recruitmentDetail.description}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recruitmentDetail.requirements && recruitmentDetail.requirements.length > 0 && (
                <div className="p-8 bg-muted rounded-4xl border border-border space-y-6">
                  <h3 className="text-lg font-black text-foreground">핵심 자격 요건</h3>
                  <ul className="space-y-4">
                    {recruitmentDetail.requirements.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground font-medium text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recruitmentDetail.responsibilities && recruitmentDetail.responsibilities.length > 0 && (
                <div className="p-8 bg-muted rounded-4xl border border-border space-y-6">
                  <h3 className="text-lg font-black text-foreground">주요 업무</h3>
                  <ul className="space-y-4">
                    {recruitmentDetail.responsibilities.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground font-medium text-sm leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {recruitmentDetail.benefits && recruitmentDetail.benefits.length > 0 && (
                <div className="p-8 bg-primary/5 rounded-4xl border border-primary/10 space-y-6">
                  <h3 className="text-lg font-black text-primary">팀 활동 혜택</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {recruitmentDetail.benefits.map((benefit, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">{benefit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conditional Rendering: Application Form or Applicant List */}
        {user?.userId === recruitmentDetail.author?.userId ? (
          <div className="bg-muted rounded-[3rem] p-12 shadow-sm border border-border space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight">지원자 목록</h2>
              <p className="text-muted-foreground font-medium">총 {recruitmentDetail.applications?.length || 0}명의 연구자가 지원했습니다</p>
            </div>

            {recruitmentDetail.applications?.length === 0 ? (
              <div className="text-center py-10 font-bold text-muted-foreground">아직 지원자가 없습니다.</div>
            ) : (
              <div className="space-y-4">
                {recruitmentDetail.applications?.map(app => (
                  <div key={app.applicationId} className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="flex items-start gap-4 flex-1">
                      <img src={app.applicant.profileImageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'} alt={app.applicant.nickname} className="w-12 h-12 rounded-xl shrink-0" />
                      <div className="space-y-2">
                        <h4 className="font-bold text-foreground text-lg">{app.applicant.nickname}</h4>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{app.message}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 justify-center">
                      <span className={`text-center py-1 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                        app.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
                        app.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'
                      }`}>
                        {app.status}
                      </span>
                      {app.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateApplicationStatus(recruitmentId, app.applicationId, 'ACCEPTED')} className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors">수락</button>
                          <button onClick={() => updateApplicationStatus(recruitmentId, app.applicationId, 'REJECTED')} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-colors">거절</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : myApplication ? (
          <div className="bg-muted/30 border border-border rounded-[3rem] p-12 text-center flex flex-col items-center justify-center space-y-6 shadow-sm">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-2 ${
              myApplication.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
              myApplication.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
              'bg-blue-100 text-blue-600'
            }`}>
              <CheckCircle size={40} />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-foreground">이미 지원을 완료하셨습니다</h3>
              <p className="text-muted-foreground font-medium text-lg max-w-md mx-auto">
                {myApplication.status === 'ACCEPTED' ? '축하합니다! 팀 합류가 수락되었습니다. 작성자의 별도 연락을 기다려주세요.' :
                 myApplication.status === 'REJECTED' ? '아쉽게도 이번 팀 합류는 거절되었습니다. 다음 기회에 함께해요!' :
                 '작성자님의 검토를 기다리고 있습니다. 좋은 결과가 있기를 바랍니다!'}
              </p>
            </div>
            <div className="pt-6">
              <span className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest ${
                myApplication.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
                myApplication.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'
              }`}>
                상태: {myApplication.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-[3rem] border border-border p-12 shadow-sm space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground tracking-tight">팀 합류 지원하기</h2>
              <p className="text-muted-foreground font-medium">당신의 연구 여정을 Bifusion 팀과 함께 시작하세요</p>
            </div>

            <form onSubmit={handleSubmitApplication} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-muted-foreground uppercase tracking-widest ml-2">성함</label>
                  <input
                    type="text"
                    value={applicationName}
                    onChange={(e) => setApplicationName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-6 py-4 bg-muted border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-black text-muted-foreground uppercase tracking-widest ml-2">이메일 주소</label>
                  <input
                    type="email"
                    value={applicationEmail}
                    onChange={(e) => setApplicationEmail(e.target.value)}
                    placeholder="researcher@example.com"
                    className="w-full px-6 py-4 bg-muted border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-muted-foreground uppercase tracking-widest ml-2">지원 동기 및 포부</label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  placeholder="이 프로젝트에 참여하고 싶은 이유와 기여하고 싶은 부분을 자유롭게 적어주세요..."
                  className="w-full h-48 px-6 py-5 bg-muted border border-border rounded-3xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none"
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-black text-muted-foreground uppercase tracking-widest ml-2">이력서 URL <span className="text-muted-foreground normal-case tracking-normal">(선택)</span></label>
                <input
                  type="url"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-6 py-4 bg-muted border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
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
        )}
      </div>
    </div>
  );
}
