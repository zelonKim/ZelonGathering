"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 🚀 1. 백엔드 로그인 API 요청 함수
  const loginUser = async (loginData: any) => {
    const { data } = await client.post("/users/login", loginData);
    return data;
  };

  // 🔄 2. TanStack Query의 useMutation 훅 세팅
  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      if (data.accessToken) {
        await setAccessToken(data.accessToken);
      }
      router.replace("/");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  // 🌟 [변경] e.preventDefault()가 필요 없는 순수 일반 함수로 전환
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

    loginMutate({ email, password });
  };

  // 🌟 키보드 엔터키를 쳤을 때도 로그인이 풀리게 하고 싶다면 추가하는 보너스 함수 (선택 사항)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#292524] flex flex-col items-center justify-start p-4 md:p-6">
      <div className="w-full max-w-md bg-[#FBFBF9] flex flex-col h-full px-4 pt-12 pb-20">
        {/* 1. 감성 상단 로고 & 타이틀 */}
        <header className="mb-[30px] mt-[10px]">
          <h1 className="text-[36px] font-black text-[#FF7A59] tracking-tight leading-[42px] whitespace-pre-line">
            Zelon {"\n"}Gathering
          </h1>
          <p className="text-base font-bold text-[#292524] mt-3 leading-6 whitespace-pre-line">
            현생 탈출 완료!{"\n"}지금 내 주변 힙한 소모임 속으로 🚀
          </p>
        </header>

        {/* 2. 입력 폼 섹션 (div 컨테이너로 랩핑 변경) */}
        <main className="flex-1 flex flex-col mt-1.5">
          <div className="flex flex-col gap-5">
            {/* 이메일 주소 인풋 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#78716C]">
                이메일 주소
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown} // 엔터키 가드 연동
                placeholder="이메일 주소를 입력하세요"
                disabled={isPending}
                className="w-full bg-white border border-[#E7E5E4] rounded-[14px] px-4 py-3.5 text-sm font-semibold text-[#292524] placeholder-[#8d8d8d9b] focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/20 focus:border-[#FF7A59] transition disabled:bg-stone-100"
              />
            </div>

            {/* 비밀번호 인풋 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#78716C]">
                비밀번호
              </label>
              <div className="w-full flex items-center bg-white border border-[#E7E5E4] rounded-[14px] px-4 focus-within:ring-2 focus-within:ring-[#FF7A59]/20 focus-within:border-[#FF7A59] transition">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown} // 엔터키 가드 연동
                  placeholder="비밀번호를 입력하세요"
                  disabled={isPending}
                  className="flex-1 bg-transparent py-3.5 text-sm font-semibold text-[#292524] placeholder-[#8d8d8d9b] focus:outline-none disabled:bg-stone-100"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  disabled={isPending}
                  className="text-[#78716C] p-1 hover:text-[#292524] transition"
                >
                  {isPasswordVisible ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* 🌟 [변경] form submit이 아닌, 순수 onClick 이벤트로 실행되는 로그인 버튼 */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isPending}
              className="w-full bg-[#292524] hover:bg-[#1c1917] active:scale-[0.99] text-white py-4 rounded-[16px] font-bold text-[15px] flex justify-center items-center mt-2.5 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition disabled:opacity-70 disabled:pointer-events-none"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "로그인하기"
              )}
            </button>
          </div>

          {/* 3. 하단 링크 */}
          <footer className="flex justify-center items-center gap-1.5 mt-8 text-sm">
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
    </div>
  );
}
