"use client";

import { useCallback, useState } from "react";
import { 
  MessageDeleted, 
  MessageRepliesCountButton, 
  useMessageContext,
  Avatar,
  MessageText
} from "stream-chat-react";
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
  
  // 메시지가 없거나 undefined인 경우 처리
  if (!message) return null;
  
  // 삭제된 메시지 처리
  if (message.deleted_at) {
    return <MessageDeleted message={message} />;
  }
  
  const messageIsMine = isMyMessage();
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasReactions = message.latest_reactions && message.latest_reactions.length > 0;
  
  const messageClasses = `relative flex w-full my-2 ${
    messageIsMine ? 'justify-end' : 'justify-start'
  }`;
  
  return (
    <div className={messageClasses}
         onMouseEnter={() => setShowActions(true)}
         onMouseLeave={() => setShowActions(false)}>
      {/* 상대방 아바타 (내 메시지가 아닌 경우에만 표시) */}
      {!messageIsMine && (
        <div className="mr-2 flex-shrink-0">
          <Avatar 
            image="/artist.png"
            name={message.user?.name || message.user?.id} 
            size={36}
          />
        </div>
      )}
      
      {/* 메시지 컨텐츠 */}
      <div className={`flex flex-col max-w-[65%] ${messageIsMine ? 'items-end' : 'items-start'}`}>
        {/* 메시지 버블 */}
        <div 
          className={`relative px-6 py-4 max-w-full font-bold ${
            messageIsMine 
              ? 'bg-[#007AFF] text-white rounded-tl-full rounded-bl-full rounded-br-full' 
              : 'bg-[#EEEEEE] text-black rounded-tr-full rounded-bl-full rounded-br-full'
          }`}
        >
          {/* 메시지 텍스트 */}
          <div className="text-[13px] break-words whitespace-pre-wrap">
            {message.text}
          </div>
          
          
        </div>
        
        
        
        
      </div>
    </div>
  );
};

export default CustomMessage; 