import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers"; // 🌟 1단계에서 만든 Providers 임포트

const fontGeist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fontGeistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zelon Gathering",
  description: "현생 탈출 완료! 지금 내 주변 힙한 소모임 속으로 🚀",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${fontGeist.variable} ${fontGeistMono.variable} antialiased`}
      > 
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
