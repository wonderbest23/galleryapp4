import { StreamChat } from 'stream-chat';
import { NextResponse } from 'next/server';

// GetStream 연결 정보
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "YOUR_API_KEY"; 
const apiSecret = process.env.STREAM_API_SECRET || "YOUR_API_SECRET"; 

export async function POST(request) {
  try {
    // 요청 본문에서 userId 추출
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID가 필요합니다" },
        { status: 400 }
      );
    }
    
    // 서버 측 클라이언트 생성 (API 시크릿 사용)
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    
    // 사용자 토큰 생성
    const token = serverClient.createToken(userId);
    
    // 응답으로 토큰 반환
    return NextResponse.json({ token });
  } catch (error) {
    console.error("토큰 생성 오류:", error);
    return NextResponse.json(
      { error: "토큰 생성에 실패했습니다" },
      { status: 500 }
    );
  }
} 