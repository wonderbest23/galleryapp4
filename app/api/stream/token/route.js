import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { StreamChat } from 'stream-chat';

// GetStream 클라이언트 초기화
const serverClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY,
  process.env.NEXT_PUBLIC_STREAM_API_SECRET
);

export async function POST(request) {
  try {
    // Supabase 클라이언트 초기화
    const supabase = await createClient();
    
    // 세션 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }
    
    // 요청 본문 파싱
    const { userId } = await request.json();
    
    // 요청한 사용자와 인증된 사용자가 일치하는지 확인
    if (session.user.id !== userId) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }
    
    // 사용자 정보 가져오기
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.log('사용자 프로필 가져오기 오류:', error);
      return NextResponse.json({ error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' }, { status: 500 });
    }
    
    // Stream 사용자 데이터 준비
    const userData = {
      id: userId,
      name: profile.full_name || '사용자',
      image: profile.avatar_url || '',
    };
    
    // Stream 토큰 생성
    const token = serverClient.createToken(userId);
    
    return NextResponse.json({ 
      token, 
      user: userData
    });
    
  } catch (error) {
    console.log('Stream 토큰 생성 중 오류:', error);
    return NextResponse.json(
      { error: '토큰을 생성하는 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 