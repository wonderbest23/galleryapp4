import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { hostId, userId, productId } = await request.json();
    
    if (!hostId || !userId) {
      return NextResponse.json(
        { error: "hostId와 userId는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // 기존 채팅이 있는지 확인
    const { data: existingChat, error: fetchError } = await supabase
      .from("chat_list")
      .select("id")
      .eq("host_id", hostId)
      .eq("user_id", userId)
      
    
    
    if (fetchError) {
      console.log("채팅 목록 조회 중 오류 발생:", fetchError);
      return NextResponse.json(
        { error: "채팅 목록 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }
    
    let chatData = existingChat;
    console.log("existingChat:", existingChat);
    // 채팅이 없는 경우 새로 생성
    if (!existingChat || existingChat.length === 0) {
      const { data: newChat, error: insertError } = await supabase
        .from("chat_list")
        .upsert(
          { 
            host_id: hostId, 
            user_id: userId,
            combined_id: `${hostId}/${userId}`,
          },
          { onConflict: 'combined_id' }
        )
      
      if (insertError) {
        console.log("채팅 생성 중 오류 발생:", insertError);
        return NextResponse.json(
          { error: "채팅 생성 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
      
      chatData = newChat;
    }
    
    return NextResponse.json({ chat: chatData });
  } catch (error) {
    console.log("서버 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 