"use client";
import React from "react";
import {
  Button,
  Skeleton,
  Input,
  Textarea,
  DatePicker,
  Spinner,
} from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardBody,
  Divider,
  Image,
  CardFooter,
  NumberInput,
} from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { parseDate } from "@internationalized/date";
import { CiImageOn } from "react-icons/ci";
import { FaCircleCheck } from "react-icons/fa6";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [ticketInfo, setTicketInfo] = useState({
    exhibition: null,
    user: null,
    ticketCount: 0,
    purchaseDate: new Date().toISOString(),
    orderId: ""
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const exhibitionId = searchParams.get('exhibition_id');
        const userId = searchParams.get('user_id');
        const ticketCount = searchParams.get('ticket_count') || 1;
        const paymentKey = searchParams.get('paymentKey');
        const amount= searchParams.get('amount');
        const orderId = searchParams.get('orderId');
        console.log('orderId:', orderId)
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
        
        // 티켓 정보 저장
        
        setTicketInfo({
          exhibition: exhibitionData,
          user: userData || { name: "게스트" },
          ticketCount: parseInt(ticketCount),
          purchaseDate: new Date().toISOString(),
          orderId: orderId
        });
        

        
        // payment_credit 테이블에 결제 정보 저장
        const { error: paymentError } = await supabase
          .from('payment_ticket')
          .upsert([
            {
              exhibition_id: exhibitionId,
              amount: amount,
              payment_key: paymentKey, // 결제 키로 orderId 사용
              order_id: orderId,
              status: 'success',
              people_count: ticketCount,
              user_id: userId,
              
            }
          ], { 
            onConflict: 'order_id',
            ignoreDuplicates: false 
          });
        
        if (paymentError) {
          console.log("결제 정보 저장 중 오류 발생:", paymentError);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.log("데이터 가져오기 오류:", error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams]);

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR') + ' ' + 
           date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

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
              onPress={() => router.push("/")}
            >
              <FaArrowLeft className="text-xl" />
            </Button>
            <h2 className="text-lg font-bold text-center flex-grow">
              결제 완료
            </h2>
            <div className="w-10"></div>
          </div>
          
          <div className="w-[90%] flex flex-col gap-y-10 mt-6 h-[calc(100vh-150px)] justify-center">
            <div className="flex flex-col items-center justify-center">
              <div className="text-[36px] text-black font-bold">
                <div>결제 완료!</div>
                <div className="text-[14px] text-black font-medium text-center mt-2">
                  {ticketInfo.exhibition?.contents}
                </div>
              </div>
            </div>
          
            <div className="w-full h-[200px] py-12 text-[12px] text-black font-medium text-start bg-[#FAFAFA] px-20 rounded-2xl">
              <p>성명: {ticketInfo.user?.name || "게스트"}</p>
              <p>구매날짜: {formatDate(ticketInfo.purchaseDate)}</p>
              <p>티켓 구매 수: {ticketInfo.ticketCount}매</p>
              <p>구매번호: {ticketInfo.orderId}</p>
              <p>총 결제금액: {(ticketInfo.exhibition?.price * ticketInfo.ticketCount).toLocaleString()}원</p>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-y-4">
              <FaCircleCheck className="text-green-500 text-[40px]" />
              <div className="text-[18px] text-black font-medium">
                감사합니다.
              </div>
            </div>

            <Button
              onPress={() => router.push("/")}
              className="w-full font-bold bg-white border-2 border-black text-black"
              size="lg"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
