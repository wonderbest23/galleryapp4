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

    // 필터를 사용하여 더 안정적으로 쿼리 (조합 1: hostId/userId 또는 조합 2: userId/hostId)
    const { data: existingChats, error: fetchError } = await supabase
      .from("chat_list")
      .select("*")
      .eq("product_id", productId)
      .or(`host_id.eq.${hostId},user_id.eq.${userId},host_id.eq.${userId},user_id.eq.${hostId}`);

    console.log('existingChats:', existingChats);

    if (fetchError) {
      console.log("채팅 목록 조회 중 오류 발생:", fetchError);
      return NextResponse.json(
        { error: "채팅 목록 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 이미 존재하는 채팅이 있는지 확인
    if (existingChats && existingChats.length > 0) {
      return NextResponse.json({ chat: existingChats[0] });
    }

    // 채팅이 없는 경우 새로 생성
    const { data: newChat, error: insertError } = await supabase
      .from("chat_list")
      .insert({
        host_id: hostId,
        user_id: userId,
        combined_id: `${hostId}/${userId}`,
        product_id: parseInt(productId),
      })
      .select()
      .single();

    if (insertError) {
      console.log("채팅 생성 중 오류 발생:", insertError);
      return NextResponse.json(
        { error: "채팅 생성 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ chat: newChat });
  } catch (error) {
    console.log("서버 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
