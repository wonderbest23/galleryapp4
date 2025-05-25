import React from "react";
import {
  Button,
  Skeleton,
} from "@heroui/react";
import { FaArrowLeft } from "react-icons/fa";
import { FaCircleCheck } from "react-icons/fa6";
import { createClient } from "@/utils/supabase/server";
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function processTicketPayment(orderId, amount, paymentKey, exhibitionId, userId, ticketCount) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        amount,
        paymentKey,
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '결제 처리 중 오류가 발생했습니다.');
    }

    // API 응답 데이터 가져오기
    const responseData = await response.json();
    
    // Supabase 클라이언트 생성
    const supabase = await createClient();

    // 전시회 정보 가져오기
    const { data: exhibitionData, error: exhibitionError } = await supabase
      .from("exhibition")
      .select("*, gallery:naver_gallery_url(*)")
      .eq("id", exhibitionId)
      .single();
    
    if (exhibitionError) {
      console.error("전시회 정보를 가져오는 중 오류 발생:", exhibitionError);
      throw new Error('전시회 정보를 가져오는 중 오류가 발생했습니다.');
    }
    
    // 사용자 정보 가져오기
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (userError) {
      console.error("사용자 정보를 가져오는 중 오류 발생:", userError);
    }
    
    // payment_ticket 테이블에 결제 정보 저장
    const { error: paymentError } = await supabase
      .from('payment_ticket')
      .upsert([
        {
          exhibition_id: exhibitionId,
          amount: amount,
          payment_key: paymentKey,
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
      console.error("결제 정보 저장 중 오류 발생:", paymentError);
      throw new Error('결제 정보 저장 중 오류가 발생했습니다.');
    }

    return {
      exhibition: exhibitionData,
      user: userData || { name: "게스트" },
      ticketCount: parseInt(ticketCount),
      purchaseDate: new Date().toISOString(),
      orderId: orderId
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

// 날짜 포맷 함수
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR') + ' ' + 
         date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default async function PaymentSuccessPage({ searchParams }) {
  const exhibitionId = searchParams.exhibition_id;
  const userId = searchParams.user_id;
  const ticketCount = searchParams.ticket_count || 1;
  const paymentKey = searchParams.paymentKey;
  const amount = searchParams.amount;
  const orderId = searchParams.orderId;
  
  let ticketInfo;
  
  try {
    // 결제 처리 및 티켓 정보 가져오기
    ticketInfo = await processTicketPayment(
      orderId, 
      amount, 
      paymentKey, 
      exhibitionId, 
      userId, 
      ticketCount
    );
  } catch (error) {
    console.error('결제 처리 오류:', error);
    redirect('/ticket/fail');
  }

  return (
    <div className="flex flex-col items-center justify-center mx-2">
      <div className="bg-white flex items-center w-[90%] justify-between">
        <Link href="/">
          <Button
            isIconOnly
            variant="light"
            className="mr-2"
          >
            <FaArrowLeft className="text-xl" />
          </Button>
        </Link>
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

        <Link href="/" className="w-full">
          <Button
            className="w-full font-bold bg-white border-2 border-black text-black"
            size="lg"
          >
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
