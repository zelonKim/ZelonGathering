"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Smartphone, X, ScanQrCode } from "lucide-react";
import { client } from "@/api/client";
import { setAccessToken } from "@/api/token";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 🍏 앱 다운로드 모달 관련 상태값
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ios" | "android">("ios");

  // 🍏 QR 이미지 로드 실패 방어용 상태값
  const [iosQrError, setIosQrError] = useState(false);
  const [androidQrError, setAndroidQrError] = useState(false);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#292524] flex flex-col items-center justify-start p-4 md:p-6 relative">
      {/* 🍊 [변경] 피치 오렌지 시그니처 앱 다운로드 버튼 */}
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
        {/* 1. 로고 & 타이틀 */}
        <header className="mb-[30px] mt-[10px]">
          <h1 className="text-[41px] font-black text-[#FF7A59] tracking-tight leading-[42px] whitespace-pre-line">
            Zelon {"\n"}Gathering
          </h1>
          <p className="text-lg font-bold text-[#292524] mt-3 mb-2 leading-6 whitespace-pre-line">
            외출 준비 완료! 🍑 {"\n"}지금 내 주변 힙한 소모임 속으로
          </p>
        </header>

        {/* 2. 입력 폼 섹션 */}
        <main className="flex-1 flex flex-col mt-1.5">
          <div className="flex flex-col gap-5">
            {/* 이메일 주소 인풋 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#78716C]">
                이메일 주소
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="이메일 주소를 입력하세요"
                disabled={isPending}
                className="w-full bg-white border border-[#E7E5E4] rounded-[14px] px-4 py-3.5 text-base font-semibold text-[#292524] placeholder-[#8d8d8d9b] focus:outline-none focus:ring-2 focus:ring-[#FF7A59]/20 focus:border-[#FF7A59] transition disabled:bg-stone-100"
              />
            </div>

            {/* 비밀번호 인풋 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-[#78716C]">
                비밀번호
              </label>
              <div className="w-full flex items-center bg-white border border-[#E7E5E4] rounded-[14px] px-4 focus-within:ring-2 focus-within:ring-[#FF7A59]/20 focus-within:border-[#FF7A59] transition">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="비밀번호를 입력하세요"
                  disabled={isPending}
                  className="flex-1 bg-transparent py-3.5 text-base font-semibold text-[#292524] placeholder-[#8d8d8d9b] focus:outline-none disabled:bg-stone-100"
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

            <button
              type="button"
              onClick={handleLogin}
              disabled={isPending}
              className="w-full bg-[#292524] hover:bg-[#1c1917] active:scale-[0.99] text-white py-4 rounded-[16px] font-bold text-[15px] flex justify-center items-center mt-2.5 shadow-[0_4px_10px_rgba(0,0,0,0.08)] transition disabled:opacity-70 disabled:pointer-events-none"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <div className="text-base">로그인하기</div>
              )}
            </button>
          </div>

          {/* 3. 하단 링크 */}
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

      {/* 🍑 [변경] 미니멀 라운드 & 언더라인 탭이 적용된 뉴 모달 디자인 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#292524]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-sm bg-white/95 rounded-[32px] p-6 relative shadow-2xl shadow-[#FF7A59]/10 border border-white/20">
            {/* 닫기 버튼 */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 p-1.5 rounded-full transition-all"
            >
              <X size={18} />
            </button>

            {/* 타이틀 영역 */}
            <div className="text-center mt-3 mb-6">
              <h3 className="text-xl font-bold text-[#292524] tracking-tight">
                Zelon Gathering 앱 설치
              </h3>
              <p className="text-xs font-semibold text-stone-400 mt-1.5">
                스마트폰 카메라로 QR 코드를 스캔하세요
              </p>
            </div>

            {/* 🍊 [NEW] 트렌디 미니멀 언더라인 탭 디자인 */}
            <div className="flex border-b border-stone-100 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("android")}
                className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
                  activeTab === "android"
                    ? "text-[#FF7A59]"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                Android
                {activeTab === "android" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF7A59] rounded-full animate-fadeIn" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ios")}
                className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
                  activeTab === "ios"
                    ? "text-[#FF7A59]"
                    : "text-stone-400 hover:text-stone-600"
                }`}
              >
                iOS
                {activeTab === "ios" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF7A59] rounded-full animate-fadeIn" />
                )}
              </button>
            </div>

            {/* 탭별 QR 코드 및 안내 카드 본문 */}
            <div className="flex flex-col items-center text-center">
              {activeTab === "ios" ? (
                <>
                  {/* 🍏 iOS 안내 카드 */}
                  <div className="w-40 h-40 bg-[#FBFBF9] border border-stone-100 rounded-3xl flex items-center justify-center p-3 mb-5 shadow-xs">
                    {iosQrError ? (
                      <span className="text-[11px] font-bold text-stone-400 px-4 text-center leading-relaxed">
                        TestFlight
                        <br />
                        <span className="text-[#FF7A59]">QR 준비 중</span>
                      </span>
                    ) : (
                      <img
                        src="/images/IOS_QR.png"
                        alt="iOS TestFlight QR"
                        className="w-full h-full object-contain"
                        onError={() => setIosQrError(true)}
                      />
                    )}
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 w-full text-left">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ScanQrCode size={15} className="text-[#FF7A59]" />
                      <span className="text-xs font-bold text-[#292524]">
                        iOS 설치 가이드
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-500 leading-relaxed font-medium">
                      1. 기본 카메라 앱으로 QR 코드를 인식합니다.
                      <br />
                      2.{" "}
                      <strong className="font-bold text-[#FF7A59]">
                        TestFlight
                      </strong>
                      를 수락하고 베타 버전을 다운로드 받아주세요.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* 🤖 Android 안내 카드 */}
                  <div className="w-40 h-40 bg-[#FBFBF9] border border-stone-100 rounded-3xl flex items-center justify-center p-3 mb-5 shadow-xs">
                    {androidQrError ? (
                      <span className="text-[11px] font-bold text-stone-400 px-4 text-center leading-relaxed">
                        Android
                        <br />
                        <span className="text-[#FF7A59]">QR 준비 중</span>
                      </span>
                    ) : (
                      <img
                        src="/images/Android_QR.png"
                        alt="Android QR"
                        className="w-full h-full object-contain"
                        onError={() => setAndroidQrError(true)}
                      />
                    )}
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 w-full text-left">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ScanQrCode size={15} className="text-[#FF7A59]" />
                      <span className="text-xs font-bold text-[#292524]">
                        Android 설치 가이드
                      </span>
                    </div>
                    <p className="text-[12px] text-stone-500 leading-relaxed font-medium">
                      1. 기본 카메라 앱으로 QR 코드를 인식합니다.
                      <br />
                      2. 링크에서 제공되는{" "}
                      <strong className="font-bold text-orange-500">
                        APK 설치 파일
                      </strong>
                      을 다운로드하여 실행해 주세요.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
