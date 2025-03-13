"use client";
import React from "react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function mypage() {
  const router = useRouter();
  return (
    <div className="w-full flex justify-center items-centerh-full">
      <div className="w-[90vw] flex justify-center items-center h-[90vh]">
        <Button
          className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-black font-medium py-2 rounded-md hover:bg-[#F6D33F] transition-colors"
          onPress={() => router.push("/mypage/success")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 256 256"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M128 36C70.562 36 24 72.713 24 118.304C24 147.994 43.725 174.08 73.213 187.175C71.774 192.02 66.31 211.071 65.297 215.368C64.073 220.56 68.962 225.116 73.741 222.051C77.62 219.571 100.709 204.886 108.271 200.026C114.661 201.334 121.28 202 128 202C185.438 202 232 165.287 232 118.304C232 72.713 185.438 36 128 36Z"
              fill="black"
            />
          </svg>
          카카오톡 로그인
        </Button>
      </div>
    </div>
  );
}
