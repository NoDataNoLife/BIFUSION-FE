import { cn } from '../lib/utils';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-muted flex flex-col items-center justify-center gap-8 p-4">
      {/* 로고 영역 (Frame 4 컨셉 재현) */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-primary text-8xl font-bold font-hbios">
          B
        </div>
        <p className="text-secondary font-medium tracking-tight">
          Bifusion
        </p>
      </div>

      {/* 컬러 시스템 테스트 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="px-6 py-2 bg-primary text-white rounded-md shadow-md hover:bg-primary/90 transition-colors">
          Primary (Orange)
        </button>
        
        <button className="px-6 py-2 bg-secondary text-white rounded-md shadow-md hover:bg-secondary/90 transition-colors">
          Secondary (Gray)
        </button>
        
        <button className="px-6 py-2 bg-accent text-white rounded-md shadow-md hover:bg-accent/90 transition-colors">
          Accent (Brown)
        </button>
      </div>

      {/* 폰트 테스트 */}
      <div className="mt-8 text-center space-y-2">
        <h1 className="text-2xl font-bold text-secondary">Font: Inter (Default)</h1>
        <h1 className="text-2xl font-hbios text-primary">Font: HBIOS-SYS (Retro/Dot)</h1>
      </div>
    </div>
  );
}
