"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Smartphone, User, Lock } from "lucide-react";
import { useLogin } from "@/hooks/useLogin";
import { MobileQrModal } from "@/components/MobileQrModal";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate: loginMutation, isPending: isLoginPending } = useLogin();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      alert("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }
    loginMutation({ email, password });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  //////////////////////////////////////////////////////////////////////

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#292524] flex flex-col items-center justify-start p-4 md:p-6 relative">
      <div className="absolute top-6 right-6 z-10">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#FF7A59] text-white text-sm font-bold hover:bg-[#e06848] transition-all shadow-md shadow-[#FF7A59]/20 active:scale-95"
        >
          <Smartphone className="w-4 h-4 text-white" />
          <span>앱 다운로드</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-[#FBFBF9] flex flex-col h-full px-4 pt-24 pb-20">
        <header className="mb-[30px] mt-[10px]">
          <h1 className="text-[41px] font-black text-[#FF7A59] tracking-tight leading-[42px] whitespace-pre-line">
            Zelon {"\n"}Gathering
          </h1>
          <p className="text-lg font-bold text-[#292524] mt-3 mb-2 leading-6 whitespace-pre-line">
            외출 준비 완료! 🍑 {"\n"}지금 내 주변 힙한 소모임 속으로
          </p>
        </header>

        <main className="flex-1 flex flex-col mt-1.5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#78716C]">
                이메일 주소
              </label>
              <div className="relative flex items-center w-full">
                <User className="absolute left-3.5 w-5 h-5 text-stone-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="이메일 주소를 입력하세요"
                  disabled={isLoginPending}
                  className="w-full bg-white border border-[#E7E5E4] rounded-[14px] pl-11 pr-4 py-3.5 text-base font-semibold text-[#292524] placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#FF7A59]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#78716C]">
                비밀번호
              </label>

              <div className="w-full flex items-center bg-white border border-[#E7E5E4] rounded-[14px] px-4 focus-within:ring-2 focus-within:ring-[#FF7A59]/20 focus-within:border-[#FF7A59] transition">
                <Lock className="w-5 h-5 text-stone-400 shrink-0 mr-2.5 pointer-events-none" />
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="비밀번호를 입력하세요"
                  disabled={isLoginPending}
                  className="flex-1 bg-transparent py-3.5 text-base font-semibold text-[#292524] placeholder-[#8d8d8d9b] focus:outline-none disabled:bg-stone-100"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  disabled={isLoginPending}
                  className="text-[#78716C] p-1 hover:text-[#292524] transition"
                >
                  {isPasswordVisible ? (
                    <Eye className="w-5 h-5 cursor-pointer hover:text-gray-900" />
                  ) : (
                    <EyeOff className="w-5 h-5  cursor-pointer hover:text-gray-900" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoginPending}
              className="w-full bg-[#292524] hover:bg-[#1c1917] active:scale-[0.99] text-white py-4 rounded-[16px] font-bold text-[15px] flex justify-center items-center mt-2.5 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoginPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="text-base">로그인하기</div>
              )}
            </button>
          </div>

          <footer className="flex justify-center items-center gap-1.5 mt-8 text-[15px]">
            <span className="text-[#78716C] font-medium">
              아직 계정이 없으신가요?
            </span>
            <Link
              href="/signup"
              className="text-[#FF7A59] font-bold hover:underline"
            >
              회원가입
            </Link>
          </footer>
        </main>
      </div>

      <MobileQrModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
