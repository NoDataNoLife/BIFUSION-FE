import HeroCover from "../components/landing/HeroCover";
import FeatureCards from "../components/landing/FeatureCards";
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Zap, Shield, Share2, Terminal } from "lucide-react";

function Workflow() {
  const workflowRef = useRef<HTMLDivElement>(null);
  const antRef = useRef<HTMLImageElement>(null);

  // 클릭 전 / 클릭 후
  const droppedRef = useRef(false);

  // 낙하 진행도
  const dropProgressRef = useRef(0);

  // 걷기 진행도
  const walkProgressRef = useRef(0);

  // 현재 개미 프레임
  const antFrameRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    let frameId = 0;

    const animate = (time: number) => {
      if (!antRef.current) {
        frameId = requestAnimationFrame(animate);
        return;
      }

      /*
       * ==========================
       * 개미 다리 움직임
       * ==========================
       *
       * 8bitant / 8bitant2 번갈아 표시
       */
      if (time - lastFrameTimeRef.current > 140) {
        antFrameRef.current = antFrameRef.current === 0 ? 1 : 0;

        antRef.current.src =
          antFrameRef.current === 0 ? "/8bitant.png" : "/8bitant2.png";

        lastFrameTimeRef.current = time;
      }

      /*
       * ==========================
       * 1. 클릭 전
       * ==========================
       *
       * 공중에서 아둥바둥
       */
      if (!droppedRef.current) {
        antRef.current.style.left = "7%";
        antRef.current.style.top = "24%";

        antRef.current.style.transform = `
          translate(-50%, -50%)
        `;

        antRef.current.style.clipPath = "none";
      } else {
        /*
         * ==========================
         * 2. 클릭 후
         * ==========================
         */
        /*
         * --------------------------
         * 낙하
         * --------------------------
         */
        if (dropProgressRef.current < 1) {
          dropProgressRef.current += 0.012;

          const dropProgress = Math.min(dropProgressRef.current, 1);

          /*
           * 낙하가 자연스럽게 가속/감속
           */
          const dropEase = 1 - Math.pow(1 - dropProgress, 3);

          const startY = 24;
          const endY = 73;

          const currentY = startY + (endY - startY) * dropEase;

          antRef.current.style.left = "7%";
          antRef.current.style.top = `${currentY}%`;

          antRef.current.style.transform = `
            translate(-50%, -50%)
          `;

          antRef.current.style.clipPath = "none";
        } else {
          /*
           * --------------------------
           * 낙하 완료 → 걷기
           * --------------------------
           */
          /*
           * 아주 느린 속도로 이동
           */
          walkProgressRef.current += 0.00032;

          /*
           * 전체 이동 진행도
           */
          const progress = Math.min(walkProgressRef.current, 1);

          /*
           * ==========================
           * 개미의 전체 경로
           * ==========================
           *
           * 0.00 ~ 0.18
           * → 직선 위로 1번 통과
           *
           * 0.18 ~ 0.40
           * → 2번 사각형 동선
           *
           * 0.40 ~ 0.72
           * → 3번 통과
           *
           * 0.72 ~ 0.88
           * → 4번 wall 점프
           *
           * 0.88 ~ 1.00
           * → 오른쪽 포털로 빨려 들어감
           */

          let x = 7;
          let y = 73;

          let rotation = 0;

          /*
           * ==========================
           * STEP 1
           * ==========================
           *
           * 직선 위를 그냥 이동
           */
          if (progress < 0.18) {
            const p = progress / 0.18;

            x = 7 + (23 - 7) * p;
            y = 73;
            rotation = 0;
          } else if (progress < 0.4) {
            /*
             * ==========================
             * STEP 2
             * ==========================
             *
             * 완전 직각 동선
             *
             *       ┌───────────┐
             *       │           │
             * ──────┘           └──────
             *
             * 1. 위로
             * 2. 오른쪽으로
             * 3. 아래로
             */
            const p = (progress - 0.18) / (0.4 - 0.18);

            /*
             * 구간 1: 위로
             */
            if (p < 0.25) {
              const local = p / 0.25;

              x = 23;
              y = 73 - 24 * local;

              // 머리가 위를 향함
              rotation = -90;
            } else if (p < 0.75) {
              /*
               * 구간 2: 오른쪽
               */
              const local = (p - 0.25) / 0.5;

              x = 23 + 15 * local;
              y = 49;

              // 머리가 오른쪽
              rotation = 0;
            } else {
              /*
               * 구간 3: 아래
               */
              const local = (p - 0.75) / 0.25;

              x = 38;
              y = 49 + 24 * local;

              // 머리가 아래를 향함
              rotation = 90;
            }
          } else if (progress < 0.72) {
            /*
             * ==========================
             * STEP 3
             * ==========================
             *
             * 다시 직선 위
             */
            const p = (progress - 0.4) / (0.72 - 0.4);

            x = 38 + (66 - 38) * p;
            y = 73;
            rotation = 0;
          } else if (progress < 0.88) {
            /*
             * ==========================
             * STEP 4
             * ==========================
             *
             * wall 중앙까지 직선
             * → 위로 직각 점프
             * → 잠깐 정지
             * → 아래로 직각 하강
             */
            const p = (progress - 0.72) / (0.88 - 0.72);

            /*
             * 1. wall 바로 아래까지
             */
            if (p < 0.35) {
              const local = p / 0.35;

              x = 66 + (90 - 66) * local;
              y = 73;
              rotation = 0;
            } else if (p < 0.55) {
              /*
               * 2. wall 위로 올라감
               */
              const local = (p - 0.35) / 0.2;

              x = 90;
              y = 73 - 30 * local;

              // 머리가 위
              rotation = -90;
            } else if (p < 0.68) {
              /*
               * 3. wall 위에서 잠깐 정지
               */
              x = 90;
              y = 43;

              rotation = -90;
            } else {
              /*
               * 4. 다시 아래로 내려옴
               */
              const local = (p - 0.68) / 0.32;

              x = 90;
              y = 43 + 30 * local;

              // 머리가 아래
              rotation = 90;
            }
          } else {
            /*
             * ==========================
             * STEP 5
             * ==========================
             *
             * 직선 끝으로 이동
             * → 머리부터 포털에 빨려 들어감
             */
            const p = (progress - 0.88) / (1 - 0.88);

            x = 90 + 7 * p;
            y = 73;
            rotation = 0;

            /*
             * 마지막 40%에서
             * 개미의 오른쪽(머리)부터 사라짐
             */
            if (p > 0.6) {
              const disappearProgress = (p - 0.6) / 0.4;

              antRef.current.style.clipPath = `inset(0 ${
                disappearProgress * 100
              }% 0 0)`;
            } else {
              antRef.current.style.clipPath = "none";
            }
          }

          /*
           * ==========================
           * 실제 위치 적용
           * ==========================
           */
          antRef.current.style.left = `${x}%`;

          antRef.current.style.top = `${y}%`;

          antRef.current.style.transform = `
            translate(-50%, -50%)
            rotate(${rotation}deg)
          `;
        }
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, []);

  /*
   * ==========================
   * 개미 클릭
   * ==========================
   */
  const handleAntClick = () => {
    if (droppedRef.current) return;

    droppedRef.current = true;
  };

  return (
    <div
      ref={workflowRef}
      className="
        relative
        mt-10
        h-[430px]
        w-full
        max-w-[1000px]
        mx-auto
      "
    >
      {/* =========================
          구름
      ========================== */}

      <img
        src="/cloud1.png"
        alt=""
        className="
          absolute
          left-[9%]
          top-[15%]
          w-[58px]
          object-contain
        "
      />

      <img
        src="/cloud2.png"
        alt=""
        className="
          absolute
          left-[48%]
          top-[23%]
          w-[58px]
          object-contain
        "
      />

      <img
        src="/cloud3.png"
        alt=""
        className="
          absolute
          right-[7%]
          top-[10%]
          w-[58px]
          object-contain
        "
      />

      {/* =========================
          직선 길
      ========================== */}

      <div
        className="
          absolute
          left-[2%]
          right-[2%]
          top-[73%]
          h-[4px]
          rounded-full
          bg-[#B7B9BB]
        "
      />

      {/* =========================
          1번
          숫자 + 텍스트
      ========================== */}

      <div
        className="
          absolute
          left-[15%]
          bottom-[22%]
          z-20
          flex
          -translate-x-1/2
          items-center
          justify-center
        "
      >
        <div
          className="
            font-hbios
            text-[120px]
            leading-[120px]
            text-[#4A5565]
          "
        >
          1
        </div>

        <div
          className="
            ml-[0px]
            translate-y-[5px]
            whitespace-nowrap
            text-center
            font-hbios
            text-[27px]
            leading-[28px]
            text-[#4A5565]
          "
        >
          데이터
          <br />
          업로드
        </div>

        {/* 텍스트의 '드' 부분을 살짝 가림 */}
        <img
          src="/grass.png"
          alt=""
          className="
            absolute
            left-[108%]
            top-[56.1%]
            z-50
            w-[52px]
            -translate-x-1/2
            object-contain
          "
        />
      </div>

      {/* =========================
          2번
          텍스트 + 숫자
          선을 관통
      ========================== */}

      <div
        className="
          absolute
          left-[40%]
          top-[53%]
          z-20
          flex
          -translate-x-1/2
          flex-col
          items-center
          justify-center
          text-center
        "
      >
        <div
          className="
            translate-y-[20px]
            whitespace-nowrap
            font-hbios
            text-[27px]
            leading-[28px]
            text-[#4A5565]
          "
        >
          AI 처리
        </div>

        <div
          className="
            mt-[2px]
            font-hbios
            text-[120px]
            leading-[120px]
            text-[#4A5565]
          "
        >
          2
        </div>
      </div>

      {/* =========================
          3번
          숫자 + 텍스트 + 풀숲
      ========================== */}

      <div
        className="
          absolute
          left-[66%]
          bottom-[27%]
          z-20
          flex
          -translate-x-1/2
          flex-col
          items-center
          justify-end
          text-center
        "
      >
        <div
          className="
            font-hbios
            text-[120px]
            leading-[120px]
            text-[#4A5565]
          "
        >
          3
        </div>

        <div
          className="
            translate-y-[-20px]
            mt-[0px]
            whitespace-nowrap
            font-hbios
            text-[27px]
            leading-[28px]
            text-[#4A5565]
          "
        >
          전문가 검토
        </div>

        {/* 풀숲 2개 */}
        <div className="absolute left-[...] top-[...] z-30 flex items-end justify-center translate-y-[10px]">
          <img src="/grass.png" className="w-[...]" />
          <img src="/grass.png" className="w-[...] -ml-[12px]" />
        </div>
      </div>

      {/* =========================
    4번
    wall + 숫자 + 텍스트
========================== */}

      <div
        className="
    absolute
    left-[90%]
    bottom-[27%]
    z-20
    flex
    -translate-x-1/2
    flex-col
    items-center
    justify-end
    text-center
  "
      >
        {/* wall */}
        <img
          src="/wall.png"
          alt=""
          className="
      mb-[5px]
      w-[76px]
      object-contain
    "
        />

        {/* 숫자 + 텍스트 */}
        <div className="relative flex flex-col items-center justify-center">
          {/* 숫자 */}
          <div
            className="
        font-hbios
        text-[120px]
        leading-[120px]
        text-[#4A5565]
      "
          >
            4
          </div>

          {/* 텍스트 */}
          <div
            className="
        mt-[0px]
        whitespace-nowrap
        font-hbios
        text-[27px]
        leading-[28px]
        text-[#4A5565]
      "
          >
            다운로드 및
            <br />
            배포
          </div>

          {/* 풀숲 */}
          <img
            src="/grass.png"
            alt=""
            className="
        absolute
        left-[100%]
        bottom-[0px]
        ml-[5px]
        w-[50px]
        object-contain
      "
          />
        </div>
      </div>

      {/* =========================
          개미
      ========================== */}

      <img
        ref={antRef}
        src="/8bitant.png"
        alt=""
        onClick={handleAntClick}
        className="
          absolute
          left-[7%]
          top-[24%]
          z-[60]
          w-[52px]
          cursor-pointer
          object-contain
          will-change-transform
        "
      />
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasUrlToken =
      params.get("accessToken") ||
      params.get("access_token") ||
      params.get("token");

    if (hasUrlToken) {
      // URL에 토큰이 있는 경우 (OAuth2 리다이렉트 상황)
      navigate(`/oauth2/redirect${location.search}`, { replace: true });
    }
  }, [location, navigate]);

  const handleGoogleLogin = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
      return;
    }

    // [임시] 백엔드 수리 전까지 개발을 위해 Mock 로그인을 사용합니다.
    const isMock = false;

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
          points: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
      login(mockResponse);
      navigate("/dashboard");
      return;
    }

    // 백엔드 명세에 따른 실제 구글 로그인 엔드포인트
    const baseUrl =
      import.meta.env.VITE_API_URL || "https://bifusion.duckdns.org";
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 transition-colors font-sans overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="container mx-auto px-6 lg:px-8 py-20 lg:py-28">
        <div className="relative lg:min-h-[640px] lg:w-[1000px] lg:max-w-full lg:mx-auto">
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
                  {isAuthenticated
                    ? "환영합니다! 이미 로그인되어 있습니다."
                    : "구글 계정으로 즉시 시작하세요."}
                </p>
              </header>

              <div className="space-y-5">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full h-14 bg-card border border-border rounded-xl flex items-center justify-center gap-3 hover:bg-muted transition-all active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-base font-bold">
                    {isAuthenticated
                      ? "대시보드로 이동하기"
                      : "Google로 시작하기"}
                  </span>
                </button>
                <p className="text-[11px] text-center text-muted-foreground font-medium leading-relaxed transition-colors">
                  안전한 연구 환경에서 빠르게 워크스페이스를 시작하세요.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 mx-2 lg:mx-0 lg:mt-0 lg:ml-[450px] lg:w-[calc(100%-450px)] lg:max-w-[500px] lg:translate-y-[20px] aspect-[784/929] rounded-3xl border border-border bg-muted/40 shadow-inner transition-colors overflow-hidden">
            <HeroCover />
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="bg-muted/30 border-y border-border py-24 px-6 transition-colors">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-[#FFDEA8] px-5 py-2 text-[16px] leading-[20px] text-[#B27D29]">
              주요 기능
            </div>

            <h2 className="mt-6 font-hbios text-[48px] leading-[48px] text-[#101828]">
              의료 AI에 필요한 모든 것
            </h2>

            <p className="mt-4 font-hbios text-[20px] leading-[28px] text-[#4A5565]">
              의료 연구자와 의료 AI 개발자를 위해 특별히 설계된 강력한 기능
            </p>

            <FeatureCards />
          </div>
        </div>
      </section>

      {/* PROCESS FLOW */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          {/* 상단 텍스트 */}
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-[#FFDEA8] px-5 py-2 text-[16px] leading-[20px] text-[#B27D29]">
              작동 방식
            </div>

            <h2 className="mt-6 font-hbios text-[48px] leading-[48px] text-[#101828]">
              4단계로 데이터에서 인사이트까지
            </h2>

            <p className="mt-4 font-hbios text-[20px] leading-[28px] text-[#4A5565]">
              의료 연구를 위해 설계된 간단하고 효율적인 워크플로우
            </p>
          </div>

          {/* WORKFLOW */}
          <Workflow />
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="bg-secondary py-24 px-6 text-[#f7f2e8] overflow-hidden transition-colors">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-hbios mb-4">
              Workspace Preview
            </h2>
            <p className="text-[#f7f2e8]/70">
              복잡한 과정을 직관적인 인터페이스로 해결하세요.
            </p>
          </div>
          <div className="max-w-6xl mx-auto bg-card rounded-t-2xl shadow-2xl overflow-hidden border border-[#f7f2e8]/15 transition-colors">
            <div className="bg-muted h-10 border-b border-border flex items-center px-4 gap-2 transition-colors">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="aspect-video bg-background flex items-center justify-center transition-colors">
              <span className="text-muted-foreground font-hbios text-sm tracking-widest italic opacity-50">
                bifusion_dashboard_preview.png
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 px-6 text-center transition-colors">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-4xl lg:text-6xl font-bold font-hbios mb-8 transition-colors">
            Ready to{" "}
            <span className="text-primary italic transition-colors">Fuse?</span>
          </h2>
          <p className="text-muted-foreground text-xl mb-12 leading-relaxed transition-colors">
            더 빠르고 안전한 의료 AI 연구의 시작. <br />
            지금 바로 bifusion 워크스페이스에 참여하세요.
          </p>
          <button
            onClick={handleGoogleLogin}
            className="h-20 px-12 bg-card border-2 border-border rounded-3xl flex items-center justify-center gap-4 hover:bg-muted transition-all mx-auto active:scale-[0.98]"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-xl font-bold text-foreground transition-colors">
              Sign in with Google
            </span>
          </button>
        </div>
      </section>

      <footer className="container mx-auto px-6 py-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground transition-colors">
        <div className="flex items-center gap-2">
          <img
            src="/logo1.png"
            alt="Bifusion Logo"
            className="h-6 w-auto object-contain"
          />
          <span className="font-bold text-foreground tracking-tight transition-colors">
            bifusion
          </span>
        </div>
        <p className="font-medium">© 2026 bifusion. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="space-y-4">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-hbios tracking-tight transition-colors">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed text-sm transition-colors">
        {desc}
      </p>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  desc,
}: {
  number: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-6 group">
      <div className="text-primary/20 font-hbios text-4xl font-black transition-colors group-hover:text-primary/50">
        {number}
      </div>
      <div className="space-y-1 pt-1">
        <h4 className="font-bold text-lg font-hbios transition-colors">
          {title}
        </h4>
        <p className="text-muted-foreground text-sm leading-relaxed transition-colors">
          {desc}
        </p>
      </div>
    </div>
  );
}
