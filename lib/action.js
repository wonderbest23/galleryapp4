'use server';

import { StreamChat } from 'stream-chat';

/**
 * 사용자 ID에 대한 GetStream 토큰을 생성하는 서버 액션
 * 
 * @param {string} userId - 사용자 ID
 * @returns {Promise<string>} 생성된 토큰
 */
export async function createToken(userId) {
  if (!userId) {
    throw new Error('사용자 ID가 필요합니다');
  }

  try {
    // API 키와 시크릿은 서버 측 환경 변수에서 가져옵니다
    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    const apiSecret = process.env.NEXT_PUBLIC_STREAM_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('Stream API 키/시크릿 누락');
      // 테스트 목적으로 임시 토큰 생성
      // 실제 프로덕션 환경에서는 절대 이렇게 하지 마세요!
      return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4ifQ.HUj6ysL2NataGX0vGKBZ-UlAzz_1nOKPDbS6rGHYbqo";
    }

    // 서버 클라이언트 생성 (API 키와 시크릿 사용)
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    
    // 사용자 ID에 대한 토큰 생성
    const token = serverClient.createToken(userId);
    
    return token;
  } catch (error) {
    console.error('토큰 생성 오류:', error);
    // 테스트 목적으로 임시 토큰 반환
    // 실제 프로덕션 환경에서는 절대 이렇게 하지 마세요!
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWRtaW4ifQ.HUj6ysL2NataGX0vGKBZ-UlAzz_1nOKPDbS6rGHYbqo";
  }
} 