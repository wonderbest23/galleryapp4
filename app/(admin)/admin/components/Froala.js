'use client'
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import {Spinner} from "@heroui/react";
// Froala 에디터를 클라이언트 측에서만 동적으로 로드
const FroalaEditor = dynamic(
  async () => {
    // CSS 스타일 임포트
    await import('froala-editor/css/froala_style.min.css');
    await import('froala-editor/css/froala_editor.pkgd.min.css');
    
    // JS 플러그인 임포트
    await import('froala-editor/js/plugins.pkgd.min.js');
    await import('froala-editor/js/plugins/font_size.min.js');
    await import('froala-editor/js/plugins/image.min.js');
    await import('froala-editor/js/plugins/colors.min.js');
    await import('froala-editor/js/plugins/line_height.min.js');
    await import('froala-editor/js/plugins/table.min.js');
    await import('froala-editor/js/plugins/video.min.js');
    await import('froala-editor/js/plugins/link.min.js');
    await import('froala-editor/js/plugins/lists.min.js');
    await import('froala-editor/js/plugins/paragraph_format.min.js');
    await import('froala-editor/js/plugins/align.min.js');
    await import('froala-editor/js/plugins/code_view.min.js');
    await import('froala-editor/js/languages/ko.js');
    
    // 리액트 Froala 에디터 컴포넌트 임포트
    return (await import('react-froala-wysiwyg')).default;
  },
  { ssr: false } // SSR 비활성화 (서버에서 로드하지 않음)
);

const Froala = ({ value, onChange, onLoad }) => {
  const [editorContent, setEditorContent] = useState(value || '');
  const [supabase, setSupabase] = useState(null);
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  
  useEffect(() => {
    // Supabase 클라이언트 초기화
    setSupabase(createClient());
    // 에디터가 로드됨을 표시
    setIsEditorLoaded(true);
    // onLoad 콜백은 에디터가 완전히 초기화된 후 events.initialized에서 호출됨
  }, []);

  useEffect(() => {
    // 외부에서 전달된 값으로 에디터 내용 업데이트
    if (value !== editorContent) {
      console.log('Froala 에디터 내용 업데이트: ', value ? value.substring(0, 30) + '...' : '빈 내용');
      setEditorContent(value || '');
    }
  }, [value]);

  const handleModelChange = (model) => {
    setEditorContent(model);
    if (onChange) {
      onChange(model);
    }
  };

  // 이미지 업로드 처리 함수
  const handleImageUpload = async (images, editor) => {
    if (!supabase) return;
    
    const promises = Array.from(images).map(async (image) => {
      try {
        // 파일 이름은 고유하게 생성 (UUID + 원본 파일명)
        const fileExt = image.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `magazine/content/${fileName}`;
        
        // Supabase storage에 이미지 업로드
        const { data, error } = await supabase.storage
          .from('magazine')
          .upload(filePath, image, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('이미지 업로드 오류:', error);
          return null;
        }

        // 업로드된 이미지의 공개 URL 생성
        const { data: publicUrlData } = supabase.storage
          .from('magazine')
          .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
      } catch (error) {
        console.error('이미지 업로드 중 오류 발생:', error);
        return null;
      }
    });

    const urls = await Promise.all(promises);
    const validUrls = urls.filter(url => url !== null);
    
    // 에디터에 이미지 삽입
    editor.image.insert(validUrls, null, null, editor.image.get());
    
    return validUrls;
  };

  const config = {
    placeholderText: '내용을 입력해주세요...',
    heightMin: 400,
    language: 'ko',
    toolbarSticky: true,
    toolbarStickyOffset: 50,
    toolbarButtons: [
      ['bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript'],
      ['fontFamily', 'fontSize', 'textColor', 'backgroundColor'],
      ['paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote'],
      ['insertLink', 'insertImage', 'insertTable', 'insertVideo'],
      ['undo', 'redo', 'fullscreen', 'html']
    ],
    fontSizeSelection: true,
    fontSizeDefaultSelection: '16',
    fontSize: ['8', '10', '12', '14', '16', '18', '20', '24', '30', '36', '48'],
    fontFamily: {
      'Noto Sans KR, sans-serif': 'Noto Sans KR',
      'Arial,Helvetica,sans-serif': 'Arial',
      "'Courier New',Courier,monospace": 'Courier New',
      'Georgia,serif': 'Georgia',
      "'Spoqa Han Sans Neo', sans-serif": 'Spoqa Han Sans Neo'
    },
    imageUploadToS3: false,
    imageUploadParam: 'image',
    imageUploadMethod: 'POST',
    imageMaxSize: 5 * 1024 * 1024,
    imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    events: {
      'image.beforeUpload': function(images) {
        return handleImageUpload(images, this);
      },
      'initialized': function() {
        // 에디터가 완전히 초기화되었을 때 호출
        console.log('Froala 에디터 초기화 완료');
        if (onLoad && typeof onLoad === 'function') {
          onLoad();
        }
      }
    },
    pluginsEnabled: [
      'align', 'codeView', 'colors', 'fontFamily', 'fontSize', 
      'image', 'lineHeight', 'link', 'lists', 'paragraphFormat',
      'table', 'video'
    ],
    attribution: false
  };

  // 에디터가 로드될 때까지 로딩 상태 표시
  if (!isEditorLoaded) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-[400px] border border-gray-200 rounded-lg bg-gray-50">
        <Spinner size="lg" color="primary" />
        <p className="mt-4 text-gray-500">에디터를 로드 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="froala-editor-container">
      <FroalaEditor
        tag='textarea'
        model={editorContent}
        onModelChange={handleModelChange}
        config={config}
      />
      <style jsx>{`
        :global(.fr-box) {
          border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        :global(.fr-toolbar) {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }
        :global(.fr-wrapper) {
          background-color: #ffffff;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
        }
        :global(.fr-element) {
          font-family: 'Noto Sans KR', sans-serif;
          color: #343a40;
          line-height: 1.6;
          padding: 16px;
        }
        :global(.fr-btn-grp) {
          margin: 0 4px;
        }
        :global(.fr-btn) {
          color: #495057;
          transition: all 0.2s ease;
        }
        :global(.fr-btn:hover) {
          background-color: #e9ecef;
        }
        :global(.fr-active) {
          color: #1c7ed6 !important;
          background: #e7f5ff !important;
        }
      `}</style>
    </div>
  );
};

export default Froala;
