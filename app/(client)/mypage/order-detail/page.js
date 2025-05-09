"use client";
import React, { useEffect, useState } from "react";
import { Button, Skeleton } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { FaArrowLeft, FaCircleCheck } from "react-icons/fa6";
import Image from "next/image";

export default function OrderDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState({
    exhibition: null,
    user: null,
    peopleCount: 0,
    purchaseDate: null,
    orderId: "",
    amount: 0
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const exhibitionId = searchParams.get('exhibition_id');
        const userId = searchParams.get('user_id');
        const peopleCount = searchParams.get('people_count') || 1;
        const orderId = searchParams.get('order_id');
        const amount = searchParams.get('amount');
        const createdAt = searchParams.get('created_at');
        
        // 전시회 정보 가져오기
        const { data: exhibitionData, error: exhibitionError } = await supabase
          .from("exhibition")
          .select("*, gallery:naver_gallery_url(*)")
          .eq("id", exhibitionId)
          .single();
        
        if (exhibitionError) {
          console.log("전시회 정보를 가져오는 중 오류 발생:", exhibitionError);
          return;
        }
        
        // 사용자 정보 가져오기
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        
        if (userError) {
          console.log("사용자 정보를 가져오는 중 오류 발생:", userError);
        }
        
        // 주문 정보 저장
        setOrderInfo({
          exhibition: exhibitionData,
          user: userData || { name: "게스트" },
          peopleCount: parseInt(peopleCount),
          purchaseDate: createdAt,
          orderId: orderId,
          amount: amount,
          created_at: createdAt
        });
        
        setIsLoading(false);
      } catch (error) {
        console.log("데이터 가져오기 오류:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams]);



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
          
          
          <div className="w-[90%] flex flex-col gap-y-8 mt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="text-[36px] text-black font-bold">
                <h1 className='text-[36px] text-black font-bold text-center mt-2'>주문 상세</h1>
                <div className="text-[10px] text-black font-medium text-center mt-2">
                  {orderInfo.exhibition?.contents}
                </div>
              </div>
            </div>
          

            
            <div className="w-full py-8 text-[14px] text-black font-medium text-start bg-[#FAFAFA] px-8 rounded-2xl">
                <p>구매날짜: {orderInfo.created_at?.split('T')[0]}</p>
              <p>티켓 구매 수: {orderInfo.peopleCount}매</p>
              <p>구매번호: {orderInfo.orderId}</p>
              <p>총 결제금액: {Number(orderInfo.amount).toLocaleString()}원</p>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-y-4">
              <FaCircleCheck className="text-green-500 text-[40px]" />
              <div className="text-[18px] text-black font-medium">
                구매 완료된 티켓입니다.
              </div>
            </div>

            <Button
              onPress={() => router.back()}
              className="w-full font-bold bg-white border-2 border-black text-black mb-8"
              size="lg"
            >
              돌아가기
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 