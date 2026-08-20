import { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Award, 
  Star, 
  Eye, 
  MessageSquare 
} from 'lucide-react';
import ReviewDetailPage from '../../components/dashboard/ReviewDetailPage';

interface ReviewRequest {
  id: string;
  requester: {
    name: string;
    avatar: string;
    email: string;
  };
  dataType: string;
  project: string;
  thumbnail: string;
  parameters: {
    imagesPerClass: number;
    samplingSteps: number;
    guidanceScale: number;
  };
  requestDate: string;
  status: 'pending' | 'reviewing' | 'completed';
  reviewResult?: 'approved' | 'rejected';
  feedback?: string;
}

const mockReviewRequests: ReviewRequest[] = [
  {
    id: 'REV-001',
    requester: {
      name: '염승빈',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yeom',
      email: 'yeom@biffusion.com',
    },
    dataType: 'CT Scan',
    project: '심장 질환 예측 모델',
    thumbnail: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&q=80',
    parameters: {
      imagesPerClass: 50,
      samplingSteps: 100,
      guidanceScale: 7.5,
    },
    requestDate: '2026-02-02',
    status: 'pending',
  },
  {
    id: 'REV-002',
    requester: {
      name: '권나현',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kwon',
      email: 'kwon@biffusion.com',
    },
    dataType: 'X-Ray',
    project: '폐 질환 진단 시스템',
    thumbnail: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80',
    parameters: {
      imagesPerClass: 100,
      samplingSteps: 150,
      guidanceScale: 10.0,
    },
    requestDate: '2026-02-01',
    status: 'pending',
  },
];

export default function ExpertDashboard() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'reviewing' | 'completed'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ReviewRequest | null>(null);
  const [reviewRequests, setReviewRequests] = useState<ReviewRequest[]>(mockReviewRequests);
  const [showDetailPage, setShowDetailPage] = useState(false);

  const pendingRequests = reviewRequests.filter(r => r.status === 'pending');
  const reviewingRequests = reviewRequests.filter(r => r.status === 'reviewing');
  const completedRequests = reviewRequests.filter(r => r.status === 'completed');

  const filteredRequests = selectedTab === 'pending' 
    ? pendingRequests 
    : selectedTab === 'reviewing' 
    ? reviewingRequests 
    : completedRequests;

  const handleStartReview = (requestId: string) => {
    setReviewRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'reviewing' as const } : req
      )
    );
    setSelectedTab('reviewing');
  };

  const handleContinueReview = (request: ReviewRequest) => {
    setSelectedRequest(request);
    setShowDetailPage(true);
  };

  const handleBackToDashboard = () => {
    setShowDetailPage(false);
    setSelectedRequest(null);
  };

  const handleApprove = (comment: string) => {
    if (selectedRequest) {
      setReviewRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'completed' as const, reviewResult: 'approved' as const, feedback: comment } 
            : req
        )
      );
      setShowDetailPage(false);
      setSelectedRequest(null);
    }
  };

  const handleReject = (comment: string) => {
    if (selectedRequest) {
      setReviewRequests(prev => 
        prev.map(req => 
          req.id === selectedRequest.id 
            ? { ...req, status: 'completed' as const, reviewResult: 'rejected' as const, feedback: comment } 
            : req
        )
      );
      setShowDetailPage(false);
      setSelectedRequest(null);
    }
  };

  if (showDetailPage && selectedRequest) {
    return (
      <ReviewDetailPage
        request={selectedRequest}
        onBack={handleBackToDashboard}
        onApprove={handleApprove}
        onReject={handleReject}
        onSaveDraft={(comment) => console.log('Draft saved:', comment)}
      />
    );
  }

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">전문가 대시보드</h1>
          <p className="text-muted-foreground mt-1 font-medium">데이터 증강 결과 검수 및 리워드 관리</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
          <Award className="w-5 h-5" />
          <span className="font-black text-sm">전문가 인증 완료</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary rounded-3xl p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
          <Award className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-2">총 획득 리워드</p>
          <p className="text-4xl font-black">12,500 <span className="text-lg font-bold opacity-70">P</span></p>
          <div className="mt-6 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
            <TrendingUp size={14} /> 상위 5% 전문가
          </div>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 mb-6">
            <CheckCircle size={24} />
          </div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">검수 완료 건수</p>
          <p className="text-3xl font-black text-foreground">48 <span className="text-sm font-bold text-muted-foreground ml-1">건</span></p>
        </div>

        <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
          <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500 mb-6">
            <Star size={24} />
          </div>
          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">피드백 만족도</p>
          <p className="text-3xl font-black text-foreground">4.9 <span className="text-sm font-bold text-muted-foreground ml-1">/ 5.0</span></p>
        </div>
      </div>

      {/* Main List Section */}
      <div className="bg-card rounded-4xl border border-border shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="px-8 pt-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex gap-8">
            {(['pending', 'reviewing', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`pb-6 text-sm font-black transition-all relative ${
                  selectedTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-gray-600'
                }`}
              >
                {tab === 'pending' ? '검수 대기' : tab === 'reviewing' ? '검수 중' : '검수 완료'}
                {selectedTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* List Content */}
        <div className="p-8">
          {filteredRequests.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <MessageSquare className="w-16 h-16 text-gray-100 mx-auto" />
              <p className="text-muted-foreground font-bold">해당하는 검수 요청이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredRequests.map((request) => (
                <div key={request.id} className="group bg-gray-50/50 rounded-3xl border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <img src={request.requester.avatar} alt={request.requester.name} className="w-12 h-12 rounded-2xl ring-4 ring-white" />
                      <div>
                        <p className="font-black text-foreground">{request.requester.name}</p>
                        <p className="text-xs text-muted-foreground font-bold tracking-tight">{request.requester.email}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-card border border-border rounded-lg text-[10px] font-black text-muted-foreground">{request.id}</span>
                  </div>

                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                    <img src={request.thumbnail} alt={request.project} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>

                  <h3 className="text-lg font-black text-foreground mb-2 line-clamp-1">{request.project}</h3>
                  <p className="text-xs text-primary font-bold mb-6">요청일: {request.requestDate}</p>

                  {request.status === 'pending' ? (
                    <button onClick={() => handleStartReview(request.id)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-primary transition-all flex items-center justify-center gap-2 group/btn">
                      <Eye size={18} className="group-hover/btn:scale-110 transition-transform" /> 검수 시작하기
                    </button>
                  ) : request.status === 'reviewing' ? (
                    <button onClick={() => handleContinueReview(request)} className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group/btn">
                      <Eye size={18} className="group-hover/btn:scale-110 transition-transform" /> 검수 계속하기
                    </button>
                  ) : (
                    <div className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-sm ${request.reviewResult === 'approved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {request.reviewResult === 'approved' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                      {request.reviewResult === 'approved' ? '승인 완료' : '거절됨'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
