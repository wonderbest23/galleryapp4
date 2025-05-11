"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { EmojiPicker, useMessageInputContext, useChannelStateContext } from "stream-chat-react";
import { FiSmile } from "react-icons/fi";
import Image from "next/image";

const CustomInput = () => {
  const {
    text,
    handleSubmit,
    handleChange,
    setText,
    uploadNewFiles,
    cooldownRemaining,
    maxFilesLeft,
    isUploadEnabled,
    textareaRef,
    handleKeyDown,
    disabled,
    linkPreviews,
    dismissLinkPreview,
  } = useMessageInputContext();
  
  const { channel } = useChannelStateContext();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);
  
  useEffect(() => {
    if (textareaRef?.current) {
      textareaRef.current.focus();
      
      // 자동 높이 조절
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [textareaRef, text]);

  // 이모지 선택 핸들러
  const handleEmojiSelect = useCallback(
    (emoji) => {
      handleChange(text + emoji.native);
      setShowEmojiPicker(false);
    },
    [text, handleChange]
  );
  
  // 파일 선택 핸들러
  const handleFileUpload = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  // 파일 변경 핸들러
  const handleFileChange = useCallback(
    (event) => {
      if (event.target.files) {
        uploadNewFiles(event.target.files);
        event.target.value = "";
      }
    },
    [uploadNewFiles]
  );
  
  // 메시지 전송 핸들러
  const handleFormSubmit = useCallback(
    (event) => {
      event.preventDefault();
      handleSubmit();
    },
    [handleSubmit]
  );

  // 채널 타이틀 표시를 위한 상대방 정보 얻기
  const getRecipientName = () => {
    if (!channel?.state?.members) return '';
    
    const members = Object.values(channel.state.members)
      .filter(member => member.user?.id !== channel.clientID);
    
    if (members.length === 0) return '';
    
    return members[0]?.user?.name || members[0]?.user?.id || '';
  };
  
  // 링크 미리보기 렌더링
  const renderLinkPreviews = () => {
    const previews = Array.from(linkPreviews?.values() || []);
    
    if (!previews.length) return null;
    
    return (
      <div className="mb-2">
        {previews.map((preview) => {
          if (preview.state !== 'loaded') return null;
          
          return (
            <div 
              key={preview.og_scrape_url} 
              className="flex items-center p-2 border rounded-lg bg-gray-50 relative group"
            >
              <div className="flex-1 overflow-hidden">
                <div className="font-medium text-sm truncate">{preview.title || preview.og_scrape_url}</div>
                {preview.text && (
                  <div className="text-xs text-gray-500 truncate">{preview.text}</div>
                )}
                <div className="text-xs text-blue-500 truncate">{preview.og_scrape_url}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const isDisabled = disabled || cooldownRemaining > 0;
  
  return (
    <div className="px-3 pt-2 pb-3 bg-transparent">
      {/* 링크 미리보기 */}
      {renderLinkPreviews()}
      
      {/* 입력 폼 */}
      <form onSubmit={handleFormSubmit} className="flex items-center mb-2">
        {/* 텍스트 입력 영역 */}
        <div 
          className={`flex-1 flex items-center justify-between rounded-full transition-all shadow-md ${isFocused ? 'shadow-lg' : ''} px-4 h-12`}
        >
          <textarea
            ref={textareaRef}
            className="w-full py-0 resize-none bg-transparent text-sm focus:outline-none max-h-24 min-h-[40px] my-auto flex items-center"
            value={text}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setText(e.target.value);
              // 높이 자동 조절
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown || ((e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                handleFormSubmit(e);
              }
            })}
            placeholder="메시지를 입력하세요..."
            disabled={isDisabled}
            style={{
              overflow: 'auto',
              height: 'auto',
              display: 'flex',
              alignItems: 'center',
              paddingTop: '10px',
              paddingBottom: '10px',
            }}
          />
          


          
          {/* 전송 버튼 */}
          <button
            className={`ml-1 w-8 h-8 rounded-full flex items-center justify-center ${text.trim() ? 'text-white hover:bg-gray-200' : 'text-gray-500'} transition-colors flex-shrink-0 cursor-pointer`}
            type="submit"
            disabled={!text.trim() || isDisabled}
          >
            <Image src="/send.png" alt="send" width={20} height={20} />
          </button>
        </div>
      </form>
      

      

      
      {/* 쿨다운 표시 */}
      {cooldownRemaining > 0 && (
        <div className="text-xs text-gray-500 mt-1 text-center">
          {cooldownRemaining}초 후에 메시지를 보낼 수 있습니다
        </div>
      )}
    </div>
  );
};

export default CustomInput; 