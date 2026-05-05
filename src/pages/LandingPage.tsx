import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Zap, Shield, Share2, Terminal } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  const handleGoogleLogin = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
      return;
    }

    // [임시] 백엔드 수리 전까지 개발을 위해 Mock 로그인을 사용합니다.
    const isMock = true; 

    if (isMock) {
      console.warn("개발 모드: Mock 로그인을 진행합니다.");
      const mockResponse = {
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        user: {
          userId: 1,
          email: "yeom@bifusion.com",
          name: "염승빈",
          nickname: "승빈짱123",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      login(mockResponse);
      navigate("/dashboard");
      return;
    }

    // 백엔드 명세에 따른 실제 구글 로그인 엔드포인트
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    window.location.href = `${baseUrl}/api/v1/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors font-sans overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="relative lg:min-h-[640px] lg:w-[1120px] lg:max-w-full lg:mx-auto">
          <div className="w-full lg:max-w-[500px] lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 z-10">
            <div className="bg-card border border-border rounded-3xl px-8 py-10 lg:px-12 lg:py-12 shadow-xl transition-colors">
              <header className="mb-10">
                <h1 className="text-4xl lg:text-5xl font-bold font-hbios tracking-tighter mb-6 leading-none transition-colors flex flex-wrap items-end gap-x-2 gap-y-3">
                  <span className="text-[#101114] dark:text-foreground">
                    D0 y0u w
                  </span>
                  <span className="text-primary">ANT</span>
                  <span className="flex items-end gap-1 whitespace-nowrap">
                    <img
                      src="/logo1.png"
                      alt="Logo1"
                      className="h-12 lg:h-16 w-auto object-contain"
                    />
                    <span className="text-primary">?</span>
                  </span>
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed transition-colors">
                  {isAuthenticated ? "환영합니다! 이미 로그인되어 있습니다." : "구글 계정으로 즉시 시작하세요."}
                </p>
              </header>

              <div className="space-y-5">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full h-14 bg-card border border-border rounded-xl flex items-center justify-center gap-3 hover:bg-muted transition-all active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-base font-bold">
                    {isAuthenticated ? "대시보드로 이동하기" : "Google로 시작하기"}
                  </span>
                </button>
                <p className="text-[11px] text-center text-muted-foreground font-medium leading-relaxed transition-colors">
                  안전한 연구 환경에서 빠르게 워크스페이스를 시작하세요.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 mx-2 lg:mx-0 lg:mt-0 lg:ml-[340px] lg:w-[calc(100%-340px)] lg:max-w-[760px] min-h-[340px] lg:min-h-[640px] rounded-3xl border border-border bg-muted/40 shadow-inner transition-colors" />
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="bg-muted/30 border-y border-border py-24 px-6 transition-colors">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold font-hbios mb-4">Core Capabilities</h2>
            <p className="text-muted-foreground transition-colors">bifusion이 제공하는 혁신적인 의료 AI 개발 환경의 핵심 기능입니다.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard icon={<Zap className="text-primary" size={28} />} title="Data Augmentation" desc="의료 이미지에 특화된 고성능 증강 알고리즘을 통해 부족한 학습 데이터를 효과적으로 확장합니다." />
            <FeatureCard icon={<Shield className="text-primary" size={28} />} title="Private & Secure" desc="병원의 민감한 데이터를 외부 유출 없이 안전하게 학습시킬 수 있는 독립적인 보안 환경을 제공합니다." />
            <FeatureCard icon={<Share2 className="text-primary" size={28} />} title="Recipe Community" desc="최적의 학습 결과를 낳는 '증강 레시피'를 연구자들과 공유하고 자유롭게 포크할 수 있습니다." />
          </div>
        </div>
      </section>

      {/* PROCESS FLOW */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <h2 className="text-4xl font-bold font-hbios transition-colors text-foreground">How it <br /><span className="text-primary italic transition-colors">Works</span></h2>
              <div className="space-y-6">
                <ProcessStep number="01" title="Augment" desc="원본 데이터를 기반으로 다양한 증강 기법을 적용하여 풍부한 데이터셋을 구축합니다." />
                <ProcessStep number="02" title="Train" desc="구축된 데이터셋을 통해 고성능 AI 모델을 학습시키고 결과를 분석합니다." />
                <ProcessStep number="03" title="Inference" desc="학습 완료된 모델을 배포하고 실제 진단 보조 및 연구에 활용합니다." />
              </div>
            </div>
            <div className="flex-1 w-full aspect-square bg-card rounded-[3rem] border border-border flex items-center justify-center p-12 transition-colors">
              <Terminal className="text-primary/10 w-full h-full transition-colors" strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="bg-secondary py-24 px-6 text-[#f7f2e8] overflow-hidden transition-colors">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-hbios mb-4">Workspace Preview</h2>
            <p className="text-[#f7f2e8]/70">복잡한 과정을 직관적인 인터페이스로 해결하세요.</p>
          </div>
          <div className="max-w-6xl mx-auto bg-card rounded-t-2xl shadow-2xl overflow-hidden border border-[#f7f2e8]/15 transition-colors">
            <div className="bg-muted h-10 border-b border-border flex items-center px-4 gap-2 transition-colors">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="aspect-video bg-background flex items-center justify-center transition-colors">
              <span className="text-muted-foreground font-hbios text-sm tracking-widest italic opacity-50">bifusion_dashboard_preview.png</span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-6 text-center transition-colors">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl lg:text-6xl font-bold font-hbios mb-8 transition-colors">Ready to <span className="text-primary italic transition-colors">Fuse?</span></h2>
          <p className="text-muted-foreground text-xl mb-12 leading-relaxed transition-colors">더 빠르고 안전한 의료 AI 연구의 시작. <br />지금 바로 bifusion 워크스페이스에 참여하세요.</p>
          <button onClick={handleGoogleLogin} className="h-20 px-12 bg-card border-2 border-border rounded-3xl flex items-center justify-center gap-4 hover:bg-muted transition-all mx-auto active:scale-[0.98]">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-xl font-bold text-foreground transition-colors">Sign in with Google</span>
          </button>
        </div>
      </section>

      <footer className="container mx-auto px-6 py-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground transition-colors">
        <div className="flex items-center gap-2">
          <img src="/logo1.png" alt="Bifusion Logo" className="h-6 w-auto object-contain" />
          <span className="font-bold text-foreground tracking-tight transition-colors">bifusion</span>
        </div>
        <p className="font-medium">© 2026 bifusion. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string; }) {
  return (
    <div className="space-y-4">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center transition-colors">{icon}</div>
      <h3 className="text-xl font-bold font-hbios tracking-tight transition-colors">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm transition-colors">{desc}</p>
    </div>
  );
}

function ProcessStep({ number, title, desc }: { number: string; title: string; desc: string; }) {
  return (
    <div className="flex gap-6 group">
      <div className="text-primary/20 font-hbios text-4xl font-black transition-colors group-hover:text-primary/50">{number}</div>
      <div className="space-y-1 pt-1">
        <h4 className="font-bold text-lg font-hbios transition-colors">{title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed transition-colors">{desc}</p>
      </div>
    </div>
  );
}
