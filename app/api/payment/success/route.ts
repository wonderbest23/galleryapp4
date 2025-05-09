import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentKey = url.searchParams.get("paymentKey");
    const orderId = url.searchParams.get("orderId");
    const amount = url.searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: "필수 매개변수가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 결제 승인 요청 (실제 구현 시 토스페이먼츠 API 호출)
    // 실제 구현에서는 서버 측에서 안전하게 처리해야 함
    
    // 데이터베이스 업데이트 (이 부분은 실제 구현 필요)
    // await updatePaymentStatus(orderId, 'DONE');

    return NextResponse.json({
      status: "success",
      message: "결제가 성공적으로 완료되었습니다.",
    });
  } catch (error) {
    console.error("결제 승인 오류:", error);
    return NextResponse.json(
      { error: "결제 승인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 