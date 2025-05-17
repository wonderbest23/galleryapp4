import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { StreamChat } from 'stream-chat';
import {createClient} from '@/utils/supabase/server'

// GetStream API 클라이언트 생성
const getStreamClient = () => {
  const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_STREAM_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.log('Stream API 키가 설정되지 않았습니다');
    return null;
  }

  return StreamChat.getInstance(apiKey, apiSecret);
};

export async function DELETE(request, { params }) {
  const {id} = await params;
  const chatId = id;
  let requestData = {};
  
  const supabase = await createClient();

  try {
    // 요청 본문에서 데이터 가져오기
    try {
      requestData = await request.json();
      console.log('받은 요청 데이터:', requestData);
    } catch (e) {
      console.log('요청 본문 파싱 오류:', e);
    }

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: '인증된 사용자만 채팅을 삭제할 수 있습니다.' },
        { status: 401 }
      );
    }

    // 사용자가 해당 채팅의 소유자인지 확인 (보내는 사람 또는 받는 사람)
    

    try {
      // GetStream 채널 삭제
      const client = getStreamClient();
      console.log('requestData:', requestData);
      // 참여자 ID 설정
      const senderId = requestData.senderId;
      const receiverId = requestData.receiverId;
      const productId = requestData.productId;
      
      // 제품 판매자와 구매 희망자 간의 채팅 채널 ID 생성
      const channelId = `product-${productId}`;
      const cid = `messaging:${channelId}`;
      
      // 서버 측에서 하드 삭제 수행 - 올바른 채널 ID 형식 사용
      const response = await client.deleteChannels([cid], {
        hard_delete: true,
      });
      
      console.log(`GetStream 채널 삭제 요청됨: ${cid}`);
      
      // 작업 상태 확인
      if (response && response.task_id) {
        const result = await client.getTask(response.task_id);
        console.log('GetStream 채널 삭제 상태:', result.status);
      }
    } catch (streamError) {
      console.log('GetStream 채널 삭제 중 오류:', streamError);
      // GetStream 채널 삭제 실패해도 Supabase의 데이터는 계속 삭제
    }

    // 채팅 메시지 삭제
    const { error: messagesDeleteError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('chat_id', chatId);

    if (messagesDeleteError) {
      return NextResponse.json(
        { message: '채팅 메시지 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 채팅 삭제
    const { error: chatDeleteError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (chatDeleteError) {
      return NextResponse.json(
        { message: '채팅 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: '채팅이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.log('채팅 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { message: '채팅 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 