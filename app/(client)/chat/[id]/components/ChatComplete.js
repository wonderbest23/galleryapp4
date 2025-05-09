"use client";

import { useState, useEffect, useCallback } from "react";
import { init, SearchIndex } from "emoji-mart";
import data from "@emoji-mart/data";
import Picker from '@emoji-mart/react';
import Link from "next/link";

import {
  Chat,
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  Window,
  useCreateChatClient,
  useChatContext,
} from "stream-chat-react";
import { EmojiPicker } from "stream-chat-react/emojis";

import { createToken } from "@/lib/action";
import CreateChannel from "./CreateChannel";
import CustomMessage from "./CustomMessage";
import CustomInput from "./CustomInput";
import "stream-chat-react/dist/css/v2/index.css";

// 초기화
init({ data });

// GetStream 연결 정보
// 실제 프로젝트에서는 환경 변수나 안전한 방법으로 관리해야 합니다
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "YOUR_API_KEY"; // 실제 키로 교체 필요
// 고정 사용자 ID 사용
const staticUserId = "abcd1234";
const userName = "테스트 사용자";
console.log("apiKey:", apiKey);

export default function Home() {
  const [token, setToken] = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isMessageViewActive, setIsMessageViewActive] = useState(false);
  
  // 토큰 제공자 콜백 함수
  const tokenProvider = useCallback(async () => {
    try {
      console.log("토큰 제공자 함수 실행");
      // 서버 액션을 통해 토큰 생성
      const token = await createToken(staticUserId);
      console.log("토큰 생성 성공:", !!token);
      setToken(token);
      return token;
    } catch (error) {
      console.error("토큰 제공자 오류:", error);
      return null;
    }
  }, []);
  
  const user = {
    id: staticUserId,
    name: userName,
    image: `https://getstream.io/random_png/?name=${userName}`,
  };

  // 필터 및 정렬 설정
  const filters = { type: "messaging", members: { $in: [staticUserId] } };
  const sort = { last_message_at: -1 };
  const options = { limit: 10 };

  // 클라이언트 생성 - 토큰 제공자 사용
  const chatClient = useCreateChatClient({
    apiKey,
    tokenOrProvider: tokenProvider,
    userData: user,
  });

  useEffect(() => {
    console.log("chatClient 상태 변경:", !!chatClient);
  }, [chatClient]);

  // 채널 생성 완료 처리
  const handleChannelCreated = (channel) => {
    setActiveChannel(channel);
    setShowCreateForm(false);
    setIsMessageViewActive(true);
  };

  // 채널 선택 처리
  const handleChannelSelect = (channel) => {
    setActiveChannel(channel);
    setIsMessageViewActive(true);
    console.log("선택된 채널:", channel.id, "멤버:", channel.state.members);
  };

  // 채널 목록으로 돌아가기
  const handleBackToChannelList = () => {
    setIsMessageViewActive(false);
  };

  // 채널 삭제 처리
  const deleteChannel = async (channel, e) => {
    try {
      e.stopPropagation();
      await channel.delete();
      if (activeChannel?.cid === channel.cid) {
        setActiveChannel(null);
        setIsMessageViewActive(false);
      }
      console.log("채널이 삭제되었습니다");
    } catch (error) {
      console.error("채널 삭제 중 오류 발생:", error);
    }
  };

  // 사용자 정의 ChannelPreview 컴포넌트
  const CustomChannelPreview = (props) => {
    const { channel, active } = props;
    
    const lastMessage = channel.state.messages[channel.state.messages.length - 1];
    const lastMessageText = lastMessage
      ? lastMessage.text.length > 30
        ? lastMessage.text.substring(0, 30) + "..."
        : lastMessage.text
      : "메시지 없음";
    
    return (
      <div 
        className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
          active ? "bg-blue-50" : ""
        }`}
        onClick={() => handleChannelSelect(channel)}
      >
        <div className="flex justify-between items-center">
          <div className="font-medium">
            {channel.data.name || "이름 없는 채널"}
          </div>
          <button
            className="px-2 py-1 bg-red-500 text-white text-xs rounded"
            onClick={(e) => deleteChannel(channel, e)}
          >
            삭제
          </button>
        </div>
        <div className="text-sm text-gray-500 truncate">{lastMessageText}</div>
      </div>
    );
  };

  if (!chatClient) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-screen">
        <p className="text-xl">채팅 클라이언트 초기화 중...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col">
      
      <main className="flex-1 overflow-hidden">
        <Chat client={chatClient} theme="messaging light">
          <div className="flex h-full">
            {/* 채널 목록 - 모바일에서는 메시지 뷰가 활성화되면 숨김 */}
            <div className={`border-r border-gray-200 flex flex-col ${isMessageViewActive ? 'hidden md:flex md:w-1/4' : 'w-full md:w-1/4'}`}>
              <div className="p-4 bg-gray-100 border-b">
                <div className="mb-2 text-sm">
                  내 ID:{" "}
                  <span className="font-mono bg-gray-200 px-1 py-0.5 rounded">
                    {staticUserId}
                  </span>
                </div>
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md"
                >
                  {showCreateForm ? "- 폼 닫기" : "+ 새 채팅방 만들기"}
                </button>
              </div>
              
              {showCreateForm && (
                <div className="p-4 border-b">
                  <CreateChannel onSuccess={handleChannelCreated} />
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto">
                <div className="p-3 bg-blue-50 border-b">
                  <h3 className="font-bold text-sm mb-1">채팅방 목록</h3>
                  <p className="text-xs text-gray-500">
                    다른 사용자와 채팅하려면 '새 채팅방 만들기'를 클릭하세요.
                  </p>
                </div>
                <ChannelList 
                  filters={filters} 
                  sort={sort}
                  options={options}
                  Preview={CustomChannelPreview}
                  setActiveChannel={handleChannelSelect}
                  EmptyStateIndicator={() => (
                    <div className="p-6 text-center text-gray-500">
                      <p className="mb-4">채팅방이 없습니다</p>
                      <p className="text-sm">
                        채팅방을 만들어 대화를 시작하세요
                      </p>
                    </div>
                  )}
                />
              </div>
            </div>

            {/* 메시지 뷰 - 모바일에서는 채널 선택 시에만 표시 */}
            <div className={`flex flex-col ${isMessageViewActive ? 'w-full md:w-3/4' : 'hidden md:flex md:w-3/4'}`}>
              {activeChannel ? (
                <Channel 
                  channel={activeChannel}
                  key={activeChannel.cid}
                  Message={CustomMessage}
                >
                  <Window>
                    <div className="flex items-center border-b md:hidden">
                      <button 
                        onClick={handleBackToChannelList}
                        className="mr-3 text-gray-600"
                      >
                        ←
                      </button>
                      <h3 className="font-bold">
                        {activeChannel.data.name || "채팅방"}
                      </h3>
                    </div>
                    <ChannelHeader />
                    <MessageList />
                    <MessageInput Input={CustomInput} />
                  </Window>
                  
                </Channel>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center p-8 max-w-md">
                    <h2 className="text-2xl font-bold mb-4">
                      GetStream 채팅에 오신 것을 환영합니다!
                    </h2>
                    <p className="mb-6 text-gray-600">
                      왼쪽에서 채팅방을 선택하거나 새 채팅방을 만들어 대화를
                      시작하세요.
                    </p>
                    <div className="p-4 bg-blue-50 rounded-lg text-sm">
                      <p className="font-medium mb-2">사용 방법:</p>
                      <ol className="list-decimal list-inside text-left space-y-2 text-gray-700">
                        <li>왼쪽의 '새 채팅방 만들기' 버튼을 클릭합니다.</li>
                        <li>채팅방 이름과 대화 상대의 ID를 입력합니다.</li>
                        <li>
                          '사용자 검색' 버튼으로 대화 가능한 사용자를 찾을 수
                          있습니다.
                        </li>
                        <li>채팅방이 생성되면 메시지를 보낼 수 있습니다.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Chat>
      </main>
      
      <footer className="bg-gray-100 p-2 text-center text-sm text-gray-600">
        GetStream 채팅 애플리케이션 © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
