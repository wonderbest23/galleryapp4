import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";
import { HeroUIProvider } from "@heroui/react";
import { Input } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FaRegBookmark } from "react-icons/fa";
import  BottomNavigation  from "@/app/components/BottomNavigationbar";
const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
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
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HeroUIProvider>
            <main className="w-full h-full">
              <div className="flex justify-center items-center gap-x-4 h-6 mt-6 mb-2 mx-4">
                <img src="/logo/logo.png" alt="logo" className="w-16 h-10" />

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
        </ThemeProvider>
      </body>
    </html>
  );
}
