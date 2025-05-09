"use client";

import { useState } from "react";
import { useChatContext } from "stream-chat-react";
import { searchUsers } from "../lib/action";

export default function CreateChannel({ onSuccess }) {
  const { client } = useChatContext();
  const [channelName, setChannelName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // 사용자 검색 핸들러
  const handleUserSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      setIsLoading(true);
      setError("");
      const users = await searchUsers(searchTerm);
      setSearchResults(users);
    } catch (err) {
      setError("사용자 검색 중 오류가 발생했습니다");
      console.error("사용자 검색 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // 사용자 선택 핸들러
  const handleUserSelect = (user) => {
    // 이미 선택된 사용자인지 확인
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  
  // 채널 생성 핸들러
  const handleCreateChannel = async (e) => {
    e.preventDefault();
    
    if (!channelName.trim()) {
      setError("채팅방 이름을 입력해주세요");
      return;
    }
    
    if (selectedUsers.length === 0) {
      setError("최소 한 명의 사용자를 선택해주세요");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      // 선택된 사용자 ID 목록 생성
      const memberIds = selectedUsers.map(user => user.id);
      // 현재 사용자 ID 추가
      memberIds.push(client.userID);
      
      // 채널 생성
      const channel = client.channel('messaging', {
        name: channelName,
        members: memberIds,
        created_by_id: client.userID,
      });
      
      // 채널 생성 및 상태 초기화
      await channel.create();
      
      // 성공 시 부모 컴포넌트에 채널 전달
      if (onSuccess) {
        onSuccess(channel);
      }
      
      // 상태 초기화
      setChannelName("");
      setSelectedUsers([]);
      setSearchTerm("");
      setSearchResults([]);
    } catch (err) {
      setError("채팅방 생성 중 오류가 발생했습니다");
      console.error("채널 생성 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-3">새 채팅방 만들기</h3>
      
      {/* 오류 메시지 */}
      {error && (
        <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleCreateChannel}>
        {/* 채널명 입력 */}
        <div className="mb-3">
          <label htmlFor="channel-name" className="block text-sm font-medium mb-1">
            채팅방 이름
          </label>
          <input
            id="channel-name"
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="채팅방 이름을 입력하세요"
            disabled={isLoading}
          />
        </div>
        
        {/* 사용자 검색 */}
        <div className="mb-3">
          <label htmlFor="user-search" className="block text-sm font-medium mb-1">
            대화 상대 찾기
          </label>
          <div className="flex space-x-2">
            <input
              id="user-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="사용자 이름으로 검색"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleUserSearch}
              className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
              disabled={isLoading}
            >
              {isLoading ? "검색 중..." : "검색"}
            </button>
          </div>
        </div>
        
        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="mb-3 border rounded max-h-40 overflow-y-auto">
            <h4 className="p-2 bg-gray-100 text-sm font-medium">검색 결과</h4>
            <ul>
              {searchResults.map((user) => (
                <li key={user.id} className="p-2 border-t">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.some(u => u.id === user.id)}
                      onChange={() => handleUserSelect(user)}
                      className="h-4 w-4"
                    />
                    <span>{user.name || user.id}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* 선택된 사용자 목록 */}
        {selectedUsers.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">선택된 사용자</h4>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {user.name || user.id}
                  <button
                    type="button"
                    onClick={() => handleUserSelect(user)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* 제출 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "생성 중..." : "채팅방 생성"}
          </button>
        </div>
      </form>
    </div>
  );
} 