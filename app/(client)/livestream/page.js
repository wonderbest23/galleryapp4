"use client";

import { useState, useEffect, useCallback } from "react";
import { StreamChat } from "stream-chat";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useCreateChatClient
} from "stream-chat-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import CustomMessage from "../chat/[id]/components/CustomMessage";
import CustomInput from "../chat/[id]/components/CustomInput";
import "stream-chat-react/dist/css/v2/index.css";

// GetStream 연결 정보
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "YOUR_API_KEY";
// 고정 사용자 ID 사용 (실제 앱에서는 인증된 사용자 ID를 사용해야 함)
const staticUserId = "abcd1234";
const userName = "테스트 사용자";

export default function LivestreamPage() {
  const router = useRouter();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState("");
  
  // 사용자 정보
  const user = {
    id: staticUserId,
    name: userName,
    image: `https://getstream.io/random_png/?name=${userName}`,
  };
  
  // 토큰 제공자 함수
  const tokenProvider = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: staticUserId }),
      });
      
      if (!response.ok) {
        throw new Error("토큰 요청에 실패했습니다");
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("토큰 요청 오류:", error);
      setError("채팅 서비스 연결에 실패했습니다. 다시 시도해 주세요.");
      return null;
    }
  }, []);
  
  // 클라이언트 생성
  const chatClient = useCreateChatClient({
    apiKey,
    tokenOrProvider: tokenProvider,
    userData: user,
  });
  
  // 라이브 채널 연결
  useEffect(() => {
    if (!chatClient) return;
    
    const connectLiveChannel = async () => {
      try {
        // 라이브 스트림 채널 접속 (이미 있으면 참여, 없으면 생성)
        const liveChannel = chatClient.channel('livestream', 'live', {
          name: '라이브 스트림 채팅',
          created_by_id: 'system',
        });
        
        await liveChannel.watch();
        setChannel(liveChannel);
      } catch (error) {
        console.error("라이브 채널 연결 오류:", error);
        setError("라이브 채팅 연결에 실패했습니다. 다시 시도해 주세요.");
      }
    };
    
    connectLiveChannel();
    
    // 컴포넌트 언마운트 시 채널 연결 종료
    return () => {
      if (channel) {
        channel.stopWatching();
      }
    };
  }, [chatClient]);
  
  if (!chatClient) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-screen">
        <p className="text-xl">채팅 클라이언트 초기화 중...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          다시 시도
        </button>
      </div>
    );
  }
  
  return (
    <div className="w-full h-screen flex flex-col">
      <header className="bg-red-600 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">라이브 스트림 채팅</h1>
          <nav>
            <Link
              href="/chat/1"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              일반 채팅으로 돌아가기
            </Link>
          </nav>
        </div>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        {/* 라이브 스트림 영상 영역 */}
        <div className="w-2/3 bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">라이브 스트림</h2>
            <p className="mb-2">
              이 영역에 실제 라이브 스트림 영상이 표시됩니다.
            </p>
            <p className="text-sm text-gray-400">
              (데모 버전에서는 영상 재생을 지원하지 않습니다)
            </p>
          </div>
        </div>
        
        {/* 채팅 영역 */}
        <div className="w-1/3 bg-white border-l">
          {channel ? (
            <Chat client={chatClient} theme="messaging light">
              <Channel channel={channel} Message={CustomMessage}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput Input={CustomInput} />
                </Window>
                <Thread />
              </Channel>
            </Chat>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>채팅 로딩 중...</p>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-gray-100 p-2 text-center text-sm text-gray-600">
        라이브 스트림 채팅 © {new Date().getFullYear()}
      </footer>
    </div>
  );
} 