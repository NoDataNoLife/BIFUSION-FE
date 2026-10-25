import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle, Clock, FileCheck, RefreshCw, ShieldCheck } from 'lucide-react';
import api from '../../lib/axios';
import { requestMessage } from '../../lib/liveData';
import { useAuthStore } from '../../store/useAuthStore';

const messages = {
  NONE: {
    title: '전문가로 함께해 주세요',
    description: '전문가 인증을 받으면 증강 데이터의 품질을 검토하고, 검수 활동에 따른 앤트 보상을 받을 수 있어요.',
    action: '전문가 인증 신청하기',
  },
  PENDING: {
    title: '전문가 인증 심사 중입니다',
    description: '제출하신 서류를 확인하고 있어요. 인증이 완료되면 검수 요청과 활동 내역을 확인할 수 있습니다.',
    action: '신청 상태 확인하기',
  },
  REJECTED: {
    title: '인증 서류를 다시 확인해 주세요',
    description: '전문가 인증이 승인되지 않았습니다. 신청 화면에서 서류를 확인하고 다시 신청해 주세요.',
    action: '서류 확인하고 다시 신청하기',
  },
};

export default function ExpertAccessGate() {
  const { user, updateUser } = useAuthStore();
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const status = user?.expertStatus === 'PENDING' || user?.expertStatus === 'REJECTED' ? user.expertStatus : 'NONE';
  const message = messages[status];
  const checkStatus = async () => {
    if (checking || !user) return;
    setChecking(true); setNotice(null); setError(null);
    try {
      const response = await api.get('/users/me');
      const data = response.data?.data;
      if (response.data?.success === false || data?.userId !== user.userId) throw new Error('인증 상태를 확인하지 못했습니다. 다시 시도해 주세요.');
      updateUser({ ...user, ...data });
      if (data.expertStatus !== 'APPROVED') setNotice(data.expertStatus === 'PENDING' ? '현재 인증 심사가 진행 중입니다.' : '최신 인증 상태를 확인했습니다.');
    } catch (err) {
      setError(requestMessage(err, '인증 상태를 확인하지 못했습니다.'));
    } finally { setChecking(false); }
  };

  return <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
    <header><h1 className="text-3xl font-black text-foreground tracking-tight">전문가 대시보드</h1><p className="mt-1 text-muted-foreground font-medium">데이터 증강 결과 검수 및 앤트 보상 관리</p></header>
    <div className="relative isolate overflow-hidden rounded-4xl border border-border min-h-[36rem]">
      {/* Structural preview only. Protected data and controls are never mounted here. */}
      <div aria-hidden="true" inert className="absolute inset-0 p-5 sm:p-8 space-y-8 blur-sm opacity-45 pointer-events-none select-none">
        <div className="grid sm:grid-cols-3 gap-6">{[Award, CheckCircle, FileCheck].map((Icon, index) => <div key={index} className={`rounded-3xl p-7 min-h-40 border border-border ${index === 0 ? 'bg-primary/70' : 'bg-card'}`}><Icon className={index === 0 ? 'text-white' : 'text-primary'} size={28}/><div className={`h-3 w-24 rounded mt-6 ${index === 0 ? 'bg-white/40' : 'bg-muted'}`}/><div className={`h-6 w-16 rounded mt-4 ${index === 0 ? 'bg-white/40' : 'bg-muted'}`}/></div>)}</div>
        <div className="bg-card rounded-4xl border border-border p-8 space-y-8"><div className="flex gap-6"><span className="w-20 h-3 bg-primary/30 rounded"/><span className="w-20 h-3 bg-muted rounded"/></div>{[0,1,2].map(index => <div key={index} className="h-16 bg-muted/70 rounded-2xl"/>)}</div>
      </div>
      <div className="relative min-h-[36rem] flex items-center justify-center p-5 sm:p-10 bg-background/25">
        <section aria-labelledby="expert-access-title" className="w-full max-w-lg bg-card/95 backdrop-blur-md border border-border rounded-4xl shadow-xl p-6 sm:p-10 text-center space-y-6">
          <div className="w-18 h-18 mx-auto rounded-3xl bg-primary/10 text-primary flex items-center justify-center">{status === 'PENDING' ? <Clock size={34}/> : <ShieldCheck size={34}/>}</div>
          <div className="space-y-3"><h2 id="expert-access-title" className="text-2xl font-black text-foreground break-keep">{message.title}</h2><p className="text-sm text-muted-foreground leading-relaxed break-keep">{message.description}</p></div>
          <Link to="/dashboard/profile?settings=verification" className="block px-5 py-4 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors">{message.action}</Link>
          <button onClick={() => void checkStatus()} disabled={checking} className="mx-auto flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary disabled:opacity-50"><RefreshCw size={16} className={checking ? 'animate-spin' : ''}/>{checking ? '인증 상태 확인 중…' : '인증 상태 새로고침'}</button>
          {notice && <p role="status" className="text-sm text-primary">{notice}</p>}
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        </section>
      </div>
    </div>
  </div>;
}
