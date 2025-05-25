import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const message = url.searchParams.get("message");
    const orderId = url.searchParams.get("orderId");

    console.error(`결제 실패: ${code} - ${message}`);

    // 데이터베이스 업데이트 (이 부분은 실제 구현 필요)
    // await updatePaymentStatus(orderId, 'FAILED', { code, message });

    return NextResponse.json({
      status: "fail",
      message: "결제가 실패했습니다.",
      code,
      errorMessage: message,
    });
  } catch (error) {
    console.error("결제 실패 처리 오류:", error);
    return NextResponse.json(
      { error: "결제 실패 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 