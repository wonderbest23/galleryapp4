"use client";
import React from "react";
import {
  Button,
  Skeleton,
  Divider,
  NumberInput,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import { useState } from "react";

export default function PaymentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  // 수량 변경 핸들러
  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  // 총 금액 계산
  const totalAmount = quantity * 10000;

  return (
    <div className="flex flex-col items-center justify-center mx-2">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-full h-full gap-y-6 mt-12">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="max-w-[300px] w-full flex items-center gap-3"
            >
              <div>
                <Skeleton className="flex rounded-full w-12 h-12" />
              </div>
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="h-3 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
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
              결제하기
            </h2>
            <div className="w-10"></div>
          </div>
          <div className="w-[90%] flex flex-col gap-y-4 mt-6">
            <div className="flex flex-col gap-y-2">
              <label className="text-sm text-[#747474] font-medium">수량</label>
              <NumberInput
                className="w-full"
                placeholder="수량을 입력해주세요"
                variant="bordered"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-sm text-[#747474] font-medium">안내</label>
              <div className="text-sm text-[#747474] font-medium border-2 border-default-200 p-4 rounded-lg">
                10,000원 당 1회의 등록 크레딧이 추가됩니다.
              </div>
            </div>

            <div className="flex flex-col  gap-y-2">
              <label className="text-sm text-[#747474] font-medium">
                교환 및 반품
              </label>
              <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl border-2 border-default-200 overflow-y-auto max-h-[25vh] scrollbar-hide">
                <h2 className="text-xl font-semibold mb-4">💰 환불 정책</h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm leading-relaxed">
                  <li>
                     작품 등록 이용권(1건당 10,000원)은 선불 결제 방식으로
                    제공되며,
                    <strong>
                      사용(작품 등록) 완료 후에는 환불이 불가능합니다.
                    </strong>
                  </li>
                  <li>
                     <strong>결제 후 7일 이내</strong>이며, 해당 이용권을{" "}
                    <strong>사용하지 않은 경우</strong>에 한해 전액 환불이
                    가능합니다.
                    <br />
                    <span className="text-gray-500 text-xs">
                       예: 충전 후 작품을 한 건도 등록하지 않은 경우
                    </span>
                  </li>
                  <li>
                     환불을 원하시는 경우 <strong>고객센터 또는 이메일</strong>로
                    문의해주세요.
                  </li>
                </ul>

                <h3 className="mt-6 font-semibold text-gray-800">
                  ⚠️ 환불이 불가능한 경우
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm leading-relaxed mt-2">
                  <li> 이용권을 일부 또는 전부 사용한 경우</li>
                  <li> 결제일로부터 7일이 경과한 경우</li>
                  <li>
                    이벤트, 프로모션 등을 통해 무상 제공된 포인트나 이용권
                  </li>
                </ul>

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">
                    ℹ️ 부득이한 사정(서비스 장애 등)으로 사용이 불가능한 경우,
                    <br />
                    <strong>
                      👉 당사 판단에 따라 유효기간 연장 또는 환불 가능
                    </strong>
                  </p>
                </div>

                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    💡 환불 시 결제 수단에 따라{" "}
                    <strong>
                      일부 수수료가 발생할 수 있으며, 이는 사용자에게 사전 고지
                    </strong>
                    됩니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">주문금액</span>
                <span className="font-medium">{totalAmount.toLocaleString()}원</span>
              </div>
              <Divider className="my-2"/>
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-medium">총 결제금액</span>
                <span className="text-lg font-bold text-blue-600">{totalAmount.toLocaleString()}원</span>
              </div>
            </div>

            <Button
              onPress={() => router.push("/payment/process")}
              className="w-full mt-6 mb-24  text-white font-bold bg-[#007AFF]"
              size="lg"
            >
              결제하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}