import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { StreamChat } from 'stream-chat';

// GetStream 클라이언트 초기화
const serverClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY,
  process.env.NEXT_PUBLIC_STREAM_API_SECRET
);

export async function DELETE(request) {
  try {
    // Supabase 클라이언트 초기화
    const supabase = await createClient();
    
    // 요청 본문 파싱
    const { chatId, channelId, userId, hostId, productId } = await request.json();
    
    if (!chatId) {
      return NextResponse.json({ error: '채팅 ID가 필요합니다.' }, { status: 400 });
    }

    // 사용자 인증 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
    }

    const authenticatedUserId = session.user.id;
    
    // 요청한 사용자가 채팅의 참여자인지 확인
    if (authenticatedUserId !== userId && authenticatedUserId !== hostId) {
      return NextResponse.json({ error: '이 채팅을 삭제할 권한이 없습니다.' }, { status: 403 });
    }
    
    // 1. GetStream 채널 삭제 (서버 측에서는 관리자 권한으로 삭제 가능)
    let channelDeleted = false;
    
    if (channelId) {
      try {
        // 채널 생성 및 삭제
        const channel = serverClient.channel('messaging', channelId);
        await channel.delete();
        console.log('GetStream 채널 삭제 완료:', channelId);
        channelDeleted = true;
      } catch (error) {
        console.log('GetStream 채널 삭제 오류:', error);
        // 채널 삭제 실패해도 Supabase 데이터 삭제는 계속 진행
      }
    }
    
    console.log("chatId:", chatId);
    
    // 2. Supabase에서 채팅 데이터 삭제
    const { error: deleteError } = await supabase
      .from('chat_list')
      .delete()
      .eq('id', chatId);
      
    if (deleteError) {
      console.log('Supabase 채팅 삭제 오류:', deleteError);
      return NextResponse.json(
        { error: '채팅 데이터를 삭제하는 중 오류가 발생했습니다.' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: '채팅이 성공적으로 삭제되었습니다.',
      channelDeleted: channelDeleted,
      chatId: chatId
    });
    
  } catch (error) {
    console.log('채팅 삭제 중 서버 오류:', error);
    return NextResponse.json(
      { error: '채팅을 삭제하는 중 서버 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 