import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to");
  
  console.log("Auth 콜백 호출됨, 리다이렉트 경로:", redirectTo);
  console.log("전체 URL:", request.url);
  
  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
    console.log("인증 코드 교환 완료");
  }
  
  // 리다이렉트 경로가 있는 경우 해당 경로로 이동
  if (redirectTo) {
    const fullRedirectUrl = `${origin}${redirectTo}`;
    console.log("리다이렉트 처리: ", fullRedirectUrl);
    return NextResponse.redirect(fullRedirectUrl);
  }

  // 기본 리다이렉트 경로
  console.log("기본 경로로 리다이렉트");
  return NextResponse.redirect(`${origin}/mypage/success`);
}
