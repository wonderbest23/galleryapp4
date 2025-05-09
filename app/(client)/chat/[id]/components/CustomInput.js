"use client";

import { useState, useCallback, useRef } from "react";
import { EmojiPicker, useMessageInputContext } from "stream-chat-react";
import { FiSend, FiImage, FiSmile } from "react-icons/fi";

const CustomInput = () => {
  const {
    text,
    handleSubmit,
    handleChange,
    uploadNewFiles,
    cooldownRemaining,
    maxFilesLeft,
    isUploadEnabled,
  } = useMessageInputContext();
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  
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
  const onSubmit = useCallback(
    (event) => {
      event.preventDefault();
      handleSubmit();
    },
    [handleSubmit]
  );
  
  return (
    <div className="p-2 border-t bg-white">
      <form onSubmit={onSubmit} className="flex items-end gap-2">
        {/* 메시지 입력 영역 */}
        <div className="flex-1 relative">
          <textarea
            className="w-full p-3 border rounded-lg resize-none min-h-[52px] max-h-32"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="메시지를 입력하세요..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                onSubmit(e);
              }
            }}
            disabled={cooldownRemaining > 0}
          />
          
          {/* 이모지 선택기 버튼 */}
          <button
            type="button"
            className="absolute bottom-3 right-3 text-gray-500 hover:text-gray-700"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FiSmile size={20} />
          </button>
          
          {/* 이모지 선택기 */}
          {showEmojiPicker && (
            <div className="absolute bottom-14 right-0">
              <EmojiPicker onSelect={handleEmojiSelect} />
            </div>
          )}
        </div>
        
        {/* 파일 업로드 버튼 */}
        {isUploadEnabled && maxFilesLeft > 0 && (
          <button
            type="button"
            className="p-3 text-gray-600 hover:text-gray-800 bg-gray-100 rounded-full"
            onClick={handleFileUpload}
          >
            <FiImage size={20} />
          </button>
        )}
        
        {/* 숨겨진 파일 입력 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={!isUploadEnabled || maxFilesLeft <= 0}
        />
        
        {/* 전송 버튼 */}
        <button
          type="submit"
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400"
          disabled={!text.trim() || cooldownRemaining > 0}
        >
          <FiSend size={20} />
        </button>
      </form>
      
      {/* 쿨다운 표시 */}
      {cooldownRemaining > 0 && (
        <div className="text-xs text-red-500 mt-1 text-center">
          {cooldownRemaining}초 후에 메시지를 보낼 수 있습니다.
        </div>
      )}
    </div>
  );
};

export default CustomInput; 