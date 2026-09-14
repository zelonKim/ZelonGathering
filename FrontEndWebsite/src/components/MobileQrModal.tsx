import React, { useState, useEffect } from "react";
import { X, ScanQrCode } from "lucide-react";
import { OS } from "@/types/ConfigOS";
import { MOBILE_OS } from "./mobileOS";
import { MobileQrModalProps } from "@/types/MobileQrModalProps";

export function MobileQrModal({ isOpen, onClose }: MobileQrModalProps) {
  const [activeTab, setActiveTab] = useState<OS>("android");
  const [qrErrors, setQrErrors] = useState<Record<OS, boolean>>({
    android: false,
    ios: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentConfig = MOBILE_OS[activeTab];
  const hasError = qrErrors[activeTab];

  //////////////////////////////////////////////////////////////////////

  return (
    <div className="fixed inset-0 bg-[#292524]/40 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-sm bg-white/95 rounded-[32px] p-6 relative shadow-2xl shadow-[#FF7A59]/10 border border-white/20">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 bg-stone-50 hover:bg-stone-100 p-1.5 rounded-full transition-all"
        >
          <X size={18} />
        </button>

        <div className="text-center mt-3 mb-6">
          <h3 className="text-xl font-bold text-[#292524] tracking-tight">
            Zelon Gathering 앱 설치
          </h3>
          <p className="text-xs font-semibold text-stone-400 mt-1.5">
            스마트폰 카메라로 QR 코드를 스캔하세요
          </p>
        </div>

        <div className="flex border-b border-stone-100 mb-6">
          {(Object.keys(MOBILE_OS) as OS[]).map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => setActiveTab(platform)}
              className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
                activeTab === platform
                  ? "text-[#FF7A59]"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {MOBILE_OS[platform].label}
              {activeTab === platform && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#FF7A59] rounded-full animate-fadeIn" />
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-40 h-40 bg-[#FBFBF9] border border-stone-100 rounded-3xl flex items-center justify-center p-3 mb-5 shadow-xs">
            {hasError ? (
              <span className="text-[11px] font-bold text-stone-400 px-4 text-center leading-relaxed">
                {currentConfig.label}
                <br />
                <span className="text-[#FF7A59]">QR 준비 중</span>
              </span>
            ) : (
              <img
                src={currentConfig.qrPath}
                alt={currentConfig.qrAlt}
                className="w-full h-full object-contain"
                onError={() =>
                  setQrErrors((prev) => ({ ...prev, [activeTab]: true }))
                }
              />
            )}
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 w-full text-left">
            <div className="flex items-center gap-1.5 mb-1.5">
              <ScanQrCode size={15} className="text-[#FF7A59]" />
              <span className="text-xs font-bold text-[#292524]">
                {currentConfig.title}
              </span>
            </div>
            <p className="text-[12px] text-stone-500 leading-relaxed font-medium">
              {currentConfig.guide}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
