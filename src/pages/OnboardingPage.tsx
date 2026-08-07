import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building2, Phone, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import api from "../lib/axios";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nickname: user?.nickname || "",
    organization: user?.organization || "",
    contact: user?.contact || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname.trim()) {
      setError("닉네임은 필수 항목입니다.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/onboarding", formData);
      const updatedUserData = response.data.data || response.data;
      
      updateUser(updatedUserData);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      if (err.response?.status === 409) {
        // 이미 온보딩된 경우, 성공으로 간주하고 대시보드로 이동
        console.warn("User already onboarded, redirecting to dashboard...");
        navigate("/dashboard", { replace: true });
        return;
      }
      console.error("Onboarding failed:", err);
      setError(err.response?.data?.message || "정보 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img src="/logo1.png" alt="Bifusion Logo" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            환영합니다! 👋
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            BIFUSION에서 사용할 추가 정보를 입력해주세요.<br />
            언제든지 프로필에서 수정할 수 있습니다.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-500/5 border border-gray-100 p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nickname */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Nickname <span className="text-primary">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="사용하실 닉네임을 입력하세요"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-gray-900"
                />
              </div>
            </div>

            {/* Organization */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Organization
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Building2 size={18} />
                </div>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="소속 기관 (예: 상명대학교)"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-gray-900"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                Contact
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                  <Phone size={18} />
                </div>
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="연락처 (예: 010-1234-5678)"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium text-gray-900"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-bold text-center animate-pulse">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-white rounded-3xl font-bold text-lg shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  시작하기
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-sm text-gray-400 font-medium">
          이미 계정이 있으신가요? <span className="text-primary hover:underline cursor-pointer">문의하기</span>
        </p>
      </div>
    </div>
  );
}
