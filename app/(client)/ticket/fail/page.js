"use client";
import React from "react";
import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { FaCircleXmark } from "react-icons/fa6";

export default function PaymentFailPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center mx-2">
      <div className="bg-white flex items-center w-[90%] justify-between">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => router.back()}
        >
          <FaArrowLeft className="text-xl" />
        </Button>
        <h2 className="text-lg font-bold text-center flex-grow">
          결제 실패
        </h2>
        <div className="w-10"></div>
      </div>
      
      <div className="w-[90%] flex flex-col gap-y-12 mt-6 h-[calc(100vh-150px)] justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="text-[36px] text-black font-bold">
            <div>결제 실패</div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-y-4">
          <FaCircleXmark className="text-red-500 text-[40px]" />
          <div className="text-[18px] text-black font-medium text-center">
            결제 처리 중 오류가 발생했습니다.<br />
            다시 시도해 주세요.
          </div>
        </div>

        <Button
          onPress={() => router.back()}
          className="w-full font-bold bg-white border-2 border-black text-black"
          size="lg"
        >
          다시 시도하기
        </Button>
      </div>
    </div>
  );
} 