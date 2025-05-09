"use client";

import { useCallback, useState } from "react";
import { MessageDeleted, MessageRepliesCountButton, useMessageContext } from "stream-chat-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const CustomMessage = () => {
  const {
    message,
    handleOpenThread,
    isMyMessage,
    handleDelete,
    handleFlag,
    handleMute,
    handleEdit,
    handleReaction,
    initialMessage,
  } = useMessageContext();
  
  const [showActions, setShowActions] = useState(false);
  
  // 메시지 시간 포맷팅
  const formatDate = useCallback((date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const now = new Date();
    
    // 오늘 날짜인 경우 시간만 표시
    if (messageDate.toDateString() === now.toDateString()) {
      return format(messageDate, "a h:mm", { locale: ko });
    }
    
    // 1주일 이내인 경우 요일과 시간 표시
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (messageDate > oneWeekAgo) {
      return format(messageDate, "EEE a h:mm", { locale: ko });
    }
    
    // 그 외의 경우 전체 날짜 표시
    return format(messageDate, "yyyy-MM-dd a h:mm", { locale: ko });
  }, []);
  
  // 삭제된 메시지 처리
  if (message.deleted_at) {
    return <MessageDeleted message={message} />;
  }
  
  return (
    <div
      className={`py-2 px-3 my-1 max-w-[80%] rounded-lg ${
        isMyMessage()
          ? "ml-auto bg-blue-500 text-white"
          : "mr-auto bg-gray-100"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 메시지 헤더 */}
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-medium ${isMyMessage() ? "text-blue-100" : "text-gray-600"}`}>
          {message.user?.name || "알 수 없는 사용자"}
        </span>
        <span className={`text-xs ${isMyMessage() ? "text-blue-100" : "text-gray-500"}`}>
          {formatDate(message.created_at)}
        </span>
      </div>
      
      {/* 메시지 내용 */}
      <div className="break-words">
        {message.text}
      </div>
      
      {/* 메시지 하단 (답장, 좋아요 등) */}
      <div className="flex justify-between items-center mt-1">
        {/* 스레드 답장 버튼 */}
        {message.reply_count > 0 && (
          <MessageRepliesCountButton
            onClick={handleOpenThread}
            reply_count={message.reply_count}
          />
        )}
        
        {/* 메시지 액션 버튼 (호버 시 표시) */}
        {showActions && (
          <div className={`flex gap-2 text-xs ${isMyMessage() ? "text-blue-100" : "text-gray-500"}`}>
            <button
              className="hover:underline"
              onClick={handleOpenThread}
            >
              답장
            </button>
            
            {isMyMessage() && (
              <>
                <button
                  className="hover:underline"
                  onClick={handleEdit}
                >
                  수정
                </button>
                <button
                  className="hover:underline text-red-300"
                  onClick={handleDelete}
                >
                  삭제
                </button>
              </>
            )}
            
            {!isMyMessage() && (
              <>
                <button
                  className="hover:underline"
                  onClick={handleFlag}
                >
                  신고
                </button>
                <button
                  className="hover:underline"
                  onClick={handleMute}
                >
                  음소거
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMessage; 