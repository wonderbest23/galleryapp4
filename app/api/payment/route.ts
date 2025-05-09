//app/api/payment/route.js
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { paymentKey, orderId, amount, customerData } = await request.json();
    const secretKey = process.env.NEXT_PUBLIC_TOSSPAYMENTS_SECRET_KEY;
    // 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
    // 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
    // @docs https://docs.tosspayments.com/reference/using-api/authorization#%EC%9D%B8%EC%A6%9D
    
    const encryptedSecretKey =
      'Basic ' + Buffer.from(secretKey + ':').toString('base64');

    // ------ 결제 승인 API 호출 ------
    // @docs https://docs.tosspayments.com/guides/payment-widget/integration#3-결제-승인하기
    const response = await fetch(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        method: 'POST',
        body: JSON.stringify({ orderId, amount, paymentKey }),
        headers: {
          Authorization: encryptedSecretKey,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Payment API Error:', errorData);
      return NextResponse.json(
        { message: '결제 처리 중 오류가 발생했습니다.' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log("confirm data:", data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment Processing Error:', error);
    return NextResponse.json(
      { message: '결제 요청을 처리할 수 없습니다.' },
      { status: 400 }
    );
  }
}