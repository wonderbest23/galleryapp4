import React from "react";
import Link from "next/link";
import { Button } from "@heroui/react";
import { FaTimesCircle } from "react-icons/fa";

export default async function PaymentFailPage({ searchParams }) {
  const params = await searchParams;
  const { message, orderId } = params;
  const getErrorMessage = (code) => {
    const errorMessages = {
      PAY_PROCESS_CANCELED: "결제가 취소되었습니다.",
      PAY_PROCESS_ABORTED: "결제 처리 중 오류가 발생했습니다.",
      REJECT_CARD_COMPANY: "카드사에서 결제를 거부했습니다.",
    };

    return (
      errorMessages[code] ||
      errorInfo?.message ||
      "알 수 없는 오류가 발생했습니다."
    );
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[70vh] px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg">
        <div className="flex flex-col items-center mb-6">
          <FaTimesCircle className="text-5xl text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-center">
            결제에 실패했습니다
          </h1>
          <p className="text-gray-500 text-center mt-2">{params.message}</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">오류 코드</span>
            <span className="font-medium">
              {params.message || "알 수 없음"}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link href="/payment">
            <Button className="w-full bg-black text-white font-bold" size="lg">
              다시 시도하기
            </Button>
          </Link>

          <Link href="/">
            <Button
              className="w-full bg-white border border-gray-300 text-gray-700"
              size="lg"
            >
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
