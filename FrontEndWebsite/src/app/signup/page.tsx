"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { client } from "@/api/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  // 회원가입 API 요청 함수
  const signupUser = async (signupData: any) => {
    const { data } = await client.post("/users/signup", signupData);
    return data;
  };

  // TanStack Query Mutation
  const { mutate: signupMutate, isPending } = useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      alert(data.message || "회원가입이 완료되었습니다! 🎉");
      router.replace("/login");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || "회원가입 중 오류가 발생했습니다.";
      alert(errorMessage);
    },
  });

  // 🌟 [변경] e.preventDefault() 없이 호출되는 순수 회원가입 핸들러 함수
  const handleSignup = () => {
    if (!email.trim() || !password.trim() || !passwordConfirm.trim()) {
      alert("이메일과 비밀번호를 모두 입력해 주세요.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("비밀번호는 영문과 숫자를 포함하여 8자리 이상이어야 합니다.");
      return;
    }

    if (password !== passwordConfirm) {
      alert("비밀번호가 서로 일치하지 않습니다");
      return;
    }

    signupMutate({
      email,
      password,
      passwordConfirm,
    });
  };

  // 🌟 인풋 창에서 엔터키를 쳤을 때도 자연스럽게 가입 프로세스가 작동하도록 가드 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#292524] flex flex-col items-center justify-start p-4 md:p-6">
      <div className="w-full max-w-md bg-[#FBFBF9] flex flex-col h-full">
        {/* 뒤로가기 버튼 헤더 */}
        <header className="h-14 flex items-center justify-start">
          <button
            onClick={() => router.back()}
            disabled={isPending}
            className="p-2 hover:bg-stone-200/50 rounded-full transition disabled:opacity-50"
          >
            <ArrowLeft className="w-6 h-6 text-[#292524]" />
          </button>
        </header>

        {/* 메인 영역 (form 태그를 div 박스로 전면 교체) */}
        <main className="flex-1 flex flex-col justify-center px-4 pt-4 pb-20">
          {/* 1. 타이틀 레이어 */}
          <section className="my-10">
            <h1 className="text-3xl font-black tracking-tight text-[#292524]">
              하이루 👋
            </h1>
            <p className="text-[15px] font-semibold text-[#78716C] mt-2">
              가입하고, 새로운 사람들과 인사해봐요.
            </p>
          </section>

          {/* 2. 회원가입 폼 컨테이너 (div) */}
          <div className="flex flex-col gap-[18px]">
            {/* 이메일 계정 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#78716C]">
                이메일 계정
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown} // 엔터키 이벤트 바인딩
                placeholder="example@zelon.com"
                disabled={isPending}
                className="w-full bg-white border border-[#E7E5E4] rounded-[14px] px-4 py-3.5 text-base font-semibold text-[#292524] placeholder-[#8d8d8d9b] focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/20 focus:border-[#FF7A59] transition disabled:bg-stone-100"
              />
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#78716C]">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown} // 엔터키 이벤트 바인딩
                placeholder="영문, 숫자 포함 8자 이상"
                disabled={isPending}
                className="w-full bg-white border border-[#E7E5E4] rounded-[14px] px-4 py-3.5 text-base font-semibold text-[#292524] placeholder-[#8d8d8d9b] focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/20 focus:border-[#FF7A59] transition disabled:bg-stone-100"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#78716C]">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                onKeyDown={handleKeyDown} // 엔터키 이벤트 바인딩
                placeholder="비밀번호를 한번 더 입력해 주세요"
                disabled={isPending}
                className="w-full bg-white border border-[#E7E5E4] rounded-[14px] px-4 py-3.5 text-base font-semibold text-[#292524] placeholder-[#8d8d8d9b] focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/20 focus:border-[#FF7A59] transition disabled:bg-stone-100"
              />
            </div>

            {/* 🌟 [변경] 기존 submit 타입 버튼을 순수 onClick 이벤트 기반의 버튼으로 튠업 */}
            <button
              type="button"
              onClick={handleSignup}
              disabled={isPending}
              className="w-full bg-[#FF7A59] hover:bg-[#e06848] active:scale-[0.99] text-white py-4 rounded-[16px] font-bold text-[15px] flex justify-center items-center mt-3 shadow-[0_4px_8px_rgba(255,122,89,0.15)] transition disabled:opacity-70 disabled:pointer-events-none"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                    <div className="text-base">가입하기</div>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
