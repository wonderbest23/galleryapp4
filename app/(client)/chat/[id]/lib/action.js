"use server";

import { StreamChat } from 'stream-chat';

// GetStream 연결 정보
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "YOUR_API_KEY";
const apiSecret = process.env.STREAM_API_SECRET || "YOUR_API_SECRET";

/**
 * GetStream 토큰 생성 함수
 * @param {string} userId - 사용자 ID
 * @returns {string} - 생성된 토큰
 */
export async function createToken(userId) {
  try {
    // 서버 측 클라이언트 생성 (API 시크릿 사용)
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    
    // 사용자 토큰 생성
    const token = serverClient.createToken(userId);
    
    return token;
  } catch (error) {
    console.error("토큰 생성 오류:", error);
    throw new Error("토큰 생성에 실패했습니다");
  }
}

/**
 * 사용자 검색 함수
 * @param {string} query - 검색어
 * @returns {Array} - 검색된 사용자 목록
 */
export async function searchUsers(query) {
  try {
    // 서버 측 클라이언트 생성 (API 시크릿 사용)
    const serverClient = StreamChat.getInstance(apiKey, apiSecret);
    
    // 사용자 검색 쿼리
    const response = await serverClient.queryUsers(
      { 
        name: { $autocomplete: query }, 
        id: { $ne: 'abcd1234' } // 현재 사용자 제외
      },
      { id: 1 },
      { limit: 10 }
    );
    
    return response.users;
  } catch (error) {
    console.error("사용자 검색 오류:", error);
    throw new Error("사용자 검색에 실패했습니다");
  }
} 