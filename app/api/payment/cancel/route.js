import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request) {
  try {
    const { paymentKey, cancelReason = "관리자 취소" } = await request.json();
    const secretKey = process.env.NEXT_PUBLIC_TOSSPAYMENTS_SECRET_KEY;
    
    // 시크릿 키 인코딩
    const encryptedSecretKey = 'Basic ' + Buffer.from(secretKey + ':').toString('base64');

    // 토스페이먼츠 결제 취소 API 호출
    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': encryptedSecretKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason,
        }),
      }
    );

    // 토스페이먼츠 API 응답 처리
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Payment Cancel API Error:', responseData);
      return NextResponse.json(
        { 
          success: false, 
          message: responseData.message || '결제 취소 중 오류가 발생했습니다.' 
        },
        { status: response.status }
      );
    }
    
    // Supabase 클라이언트 생성
    const supabase = await createClient();
    
    // payment_ticket 테이블 상태 업데이트
    const { error: ticketUpdateError } = await supabase
      .from('payment_ticket')
      .update({ status: 'cancel' })
      .eq('payment_key', paymentKey);
      
    // payment_credit 테이블 상태 업데이트
    const { data: creditData, error: creditFetchError } = await supabase
      .from('payment_credit')
      .select('artist_id, amount')
      .eq('payment_key', paymentKey)
      .single();
      
    if (!creditFetchError && creditData) {
      // 크레딧 상태 업데이트
      const { error: creditUpdateError } = await supabase
        .from('payment_credit')
        .update({ status: 'cancel' })
        .eq('payment_key', paymentKey);
      
      // 아티스트 크레딧 차감 (결제 취소이므로 크레딧 차감)
      if (!creditUpdateError && creditData.artist_id && creditData.amount) {
        // 현재 아티스트 크레딧 조회
        const { data: profileData, error: profileFetchError } = await supabase
          .from('profiles')
          .select('artist_credit')
          .eq('id', creditData.artist_id)
          .single();
          
        if (!profileFetchError && profileData) {
          const creditToRemove = Number(creditData.amount) / 10000;
          const updatedCredit = Math.max(0, (profileData.artist_credit || 0) - creditToRemove);
          
          // 아티스트 크레딧 업데이트
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ artist_credit: updatedCredit })
            .eq('id', creditData.artist_id);
            
          if (profileUpdateError) {
            console.error('Profile Credit Update Error:', profileUpdateError);
          }
        }
      }
    }
    
    if (ticketUpdateError && creditFetchError) {
      console.error('DB Update Error:', ticketUpdateError || creditFetchError);
      return NextResponse.json(
        { 
          success: false, 
          message: '결제 취소는 성공했으나 DB 업데이트 중 오류가 발생했습니다.',
          paymentData: responseData
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '결제가 성공적으로 취소되었습니다.',
      data: responseData 
    });
  } catch (error) {
    console.error('Payment Cancel Processing Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '결제 취소 요청을 처리할 수 없습니다.' 
      },
      { status: 500 }
    );
  }
} 