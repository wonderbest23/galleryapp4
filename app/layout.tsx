import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { HeroUIProvider } from "@heroui/react";
import { Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FaRegBookmark } from "react-icons/fa";
import BottomNavigation from "@/app/components/BottomNavigationbar";
import Providers from "@/app/components/providers";
import Link from "next/link";
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "미슐미술랭",
  description: "갤러리 전시회 정보를 손쉽게 찾아보세요",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 데스크톱에서만 표시되는 배경 및 소개 */}
          <div className="min-h-screen flex bg-gradient-to-br from-yellow-200 via-yellow-100 to-green-200 lg:flex hidden">
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
            <div className="absolute right-[33%] transform translate-x-1/2 h-screen w-[375px] bg-white overflow-hidden shadow-2xl">
              {/* 앱 내용 */}
              <div className="flex-1 overflow-y-auto h-full">
                <Providers>
                  <main className="w-full h-full pb-16">
                    <div className="flex justify-center items-center gap-x-4 h-6 mt-6 mb-2 mx-4">
                      <img
                        src="/logo/logo.png"
                        alt="logo"
                        className="w-16 h-10"
                      />

                      <Input
                        placeholder="둘러보기"
                        startContent={
                          <Icon
                            icon="lucide:search"
                            className="text-default-400"
                          />
                        }
                        size="sm"
                        radius="lg"
                        className="w-full"
                      />

                      <div className="w-8 flex justify-center items-center">
                        <Link href="/exhibitionList">
                          <FaRegBookmark className="text-xl text-gray-400" />
                        </Link>
                      </div>
                    </div>
                    {children}
                  </main>
                  <BottomNavigation />
                </Providers>
              </div>
            </div>
          </div>

          {/* 모바일에서 표시되는 화면 */}
          <div className="lg:hidden block h-screen w-full">
            <HeroUIProvider>
              <main className="w-full h-full pb-16">
                <div className="flex justify-center items-center gap-x-4 h-6 mt-6 mb-2 mx-4">
                  <Link href="/">
                    <img
                      src="/logo/logo.png"
                      alt="logo"
                      className="w-16 h-10"
                    />
                  </Link>
                  <Input
                    placeholder="둘러보기"
                    startContent={
                      <Icon icon="lucide:search" className="text-default-400" />
                    }
                    size="sm"
                    radius="lg"
                    className="w-full"
                  />
                  <div className="w-8 flex justify-center items-center">
                    <FaRegBookmark className="text-xl text-gray-400" />
                  </div>
                </div>
                {children}
              </main>
              <BottomNavigation />
            </HeroUIProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
