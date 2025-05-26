import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "@/app/globals.css";
import { HeroUIProvider } from "@heroui/react";
import { Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FaRegBookmark } from "react-icons/fa";
import BottomNavigation from "@/app/(client)/components/BottomNavigationbar";
import Providers from "@/app/(client)/components/providers";
import Link from "next/link";
import Navbar from "@/app/(client)/components/Navbar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "미슐미술랭",
  description: "갤러리 전시회 정보를 손쉽게 찾아보세요",
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    // 추가적인 동적 설정이 필요할 경우 여기에 로직 추가
  };
}

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <Providers>
            {/* 데스크톱에서만 표시되는 배경 및 소개 */}
            <div className="min-h-screen flex bg-gradient-to-br from-yellow-200 via-yellow-100 to-green-200 lg:flex hidden scrollbar-hide">
              {/* 배경 요소 - 장식용 원 */}
              <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-pink-200 opacity-30 blur-xl"></div>
              <div className="absolute bottom-20 right-[60%] w-72 h-72 rounded-full bg-blue-200 opacity-30 blur-xl"></div>

              {/* 앱 제목과 설명 */}
              <div className="absolute top-1/4 left-[15%] transform -translate-y-1/2">
                <h1 className="text-4xl font-bold mb-2 text-gray-800">
                  미술미슐랭
                </h1>
                <p className="text-xl text-gray-600">
                  당신의 모든 전시회&갤러리 정보를 한눈에
                </p>
              </div>

              {/* 모바일 앱 내용 - 우측 1/3 지점에 위치 */}
              <div className="absolute right-[33%] transform translate-x-1/2 h-screen w-full w-full max-w-md bg-white overflow-hidden shadow-2xl">
                {/* 앱 내용 */}
                <div className=" overflow-y-auto h-full w-full max-w-md scrollbar-hide">
                  <main className="w-full h-full pb-16">
                    <Navbar />
                    
                    {children}
                  </main>
                  <BottomNavigation />
                </div>
              </div>
            </div>

            {/* 모바일에서 표시되는 화면 */}
            <div className="lg:hidden block h-screen w-full">
              <main className="w-full h-full pb-16">
                <Navbar></Navbar>
                {children}
              </main>
              <BottomNavigation />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
