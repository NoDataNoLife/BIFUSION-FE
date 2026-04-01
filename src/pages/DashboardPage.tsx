import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore'; // 아까 만든 지갑 가져오기
import { LayoutDashboard, Plus, Loader2 } from 'lucide-react';

/**
 * [1] "진짜" 데이터 가져오는 일꾼 함수
 * 이 함수는 "언젠가 데이터를 가져오겠다(Promise)"고 약속하는 함수입니다.
 * 실제 백엔드 API 명세서가 나오면 axios.get('/api/projects') 로 바꿉니다.
 */
const fetchProjects = async () => {
  // 1초 동안 기다려봅니다 (실제 인터넷 속도 흉내)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // 가짜 데이터를 반환합니다.
  return [
    { id: 1, name: 'Medical AI X-Ray', status: 'In Training', updatedAt: '2026-04-01' },
    { id: 2, name: 'Brain MRI Scan', status: 'Completed', updatedAt: '2026-03-30' },
  ];
};

export default function DashboardPage() {
  /**
   * [2] Zustand 지갑에서 '필요한 데이터만' 꺼내오기
   * 지갑(useAuthStore)에서 유저 정보(user)와 로그인 여부(isAuthenticated)를 쏙 뽑아옵니다.
   */
  const { user, isAuthenticated } = useAuthStore();

  /**
   * [3] TanStack Query 비서 부리기 (제일 중요!)
   * useQuery: 비서에게 "데이터 좀 가져와줘!"라고 명령하는 핵심 훅입니다.
   * 
   * queryKey: ['projects'] -> 이 데이터의 고유 이름입니다. 나중에 "아까 그 프로젝트 목록 다시 가져와!" 할 때 이 이름을 부릅니다.
   * queryFn: fetchProjects  -> 실제로 데이터를 가져올 때 어떤 일꾼 함수를 쓸지 정합니다.
   * 
   * 결과물:
   * data: 비서가 가져온 진짜 데이터 (처음엔 undefined이다가 데이터가 오면 채워짐)
   * isLoading: 데이터를 가져오는 중인지 알려줍니다 (true/false)
   * isError: 데이터 가져오다 사고 났는지 알려줍니다 (true/false)
   */
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* (A) 지갑에서 꺼낸 유저 정보를 화면에 보여주기 */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="text-primary" />
            {isAuthenticated ? `${user?.name}님, 안녕하세요!` : '환영합니다!'}
          </h1>
          <p className="text-muted-foreground mt-1">bifusion 워크스페이스 대시보드입니다.</p>
        </div>
      </header>

      {/* (B) 비서가 보고해주는 상태에 따라 화면을 다르게 보여주기 (분기 처리) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Case 1: 비서가 아직 배달 중일 때 (로딩 화면) */}
        {isLoading && (
          <div className="col-span-2 flex flex-col items-center py-20 gap-4 opacity-50">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p>데이터 배달 중입니다...</p>
          </div>
        )}

        {/* Case 2: 비서가 배달 사고 났을 때 (에러 화면) */}
        {isError && (
          <div className="col-span-2 text-center py-20 text-red-500 font-bold">
            배달 사고 발생! 백엔드 개발자에게 물어보세요.
          </div>
        )}

        {/* Case 3: 배달 완료! (진짜 데이터 보여주기) */}
        {projects?.map((project) => (
          <div key={project.id} className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-primary/30 transition-colors group cursor-pointer">
            <div className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors inline-block mb-4">
              {project.status}
            </div>
            <h3 className="text-xl font-bold mb-2">{project.name}</h3>
            <p className="text-sm text-muted-foreground italic">최근 업데이트: {project.updatedAt}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
