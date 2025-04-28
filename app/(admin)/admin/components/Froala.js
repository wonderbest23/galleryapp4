//Froala.js
'use client'
import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Supabase 클라이언트 설정
const supabase = createClient();

// FroalaEditor를 동적으로 임포트
const FroalaEditor = dynamic(
  async () => {
    const mod = await import('react-froala-wysiwyg');
    // CSS 및 플러그인 임포트
    await import('froala-editor/css/froala_style.min.css');
    await import('froala-editor/css/froala_editor.pkgd.min.css');
    await import('froala-editor/js/plugins.pkgd.min.js');
    await import('froala-editor/js/plugins/font_size.min.js');
    await import('froala-editor/js/plugins/image.min.js');
    await import('froala-editor/js/plugins/colors.min.js');
    await import('froala-editor/js/plugins/emoticons.min.js');
    await import('froala-editor/js/plugins/line_height.min.js');
    await import('froala-editor/js/plugins/file.min.js');
    await import('froala-editor/js/plugins/table.min.js');
    await import('froala-editor/js/plugins/video.min.js');
    await import('froala-editor/js/plugins/link.min.js');
    await import('froala-editor/js/plugins/lists.min.js');
    await import('froala-editor/js/plugins/paragraph_format.min.js');
    await import('froala-editor/js/plugins/align.min.js');
    await import('froala-editor/js/plugins/quote.min.js');
    await import('froala-editor/js/plugins/code_view.min.js');
    await import('froala-editor/js/languages/ko.js');
    return mod.default;
  },
  {
    ssr: false,
    loading: () => <p>에디터 로딩 중...</p>
  }
);

const FroalaEditorComponent = ({ 
  value, 
  onChange, 
  placeholder = '내용을 입력해주세요...', 
  height = 400,
  imageUploadURL = null,
  imageUploadParams = {},
  imageUploadMethod = 'POST',
  events = {},
  onSave = null // 저장 콜백 추가
}) => {
  const [editorContent, setEditorContent] = useState(value || '');
  const [uploadedImages, setUploadedImages] = useState([]); // 업로드된 이미지 목록 추적
  const [isMounted, setIsMounted] = useState(false); // 클라이언트 측 렌더링 확인용
  const editorRef = useRef(null);

  // 클라이언트 측 렌더링 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setEditorContent(value || '');
  }, [value]);

  const handleModelChange = (model) => {
    setEditorContent(model);
    if (onChange) {
      onChange(model);
    }
  };

  // Supabase에 이미지를 업로드하는 함수
  const uploadImageToSupabase = async (file) => {
    try {
      // 파일 확장자 추출
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // UUID를 사용하여 고유한 파일명 생성
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      
      // Supabase에 업로드
      const { data, error } = await supabase.storage
        .from('magazine')
        .upload(uniqueFileName, file);

      if (error) {
        console.error('Error uploading image:', error.message);
        return null;
      }
      
      const publicURL = "https://teaelrzxuigiocnukwha.supabase.co/storage/v1/object/public/magazine/"+data.path;
      console.log('Image uploaded successfully. URL:', publicURL);
      
      // 업로드된 이미지 정보 추적
      setUploadedImages(prev => [...prev, {
        originalName: file.name,
        storagePath: data.path,
        publicURL: publicURL,
        uploadedAt: new Date().toISOString()
      }]);
      
      return publicURL;
    } catch (error) {
      console.error('이미지 업로드 중 예외 발생:', error);
      return null;
    }
  };

  // Base64 이미지 추출 및 업로드 함수
  const extractAndUploadImages = async (htmlContent) => {
    if (!htmlContent || !isMounted) return htmlContent;
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const imgTags = doc.querySelectorAll('img');
      
      if (!imgTags || imgTags.length === 0) return htmlContent;
      
      // 모든 이미지 태그를 처리
      const uploadPromises = Array.from(imgTags).map(async (img) => {
        const imgSrc = img.getAttribute('src');
        if (!imgSrc) return { original: '', uploaded: '' };
        
        // 이미 업로드된 이미지인지 확인 (URL이 Supabase를 가리키는지)
        if (imgSrc.includes('teaelrzxuigiocnukwha.supabase.co')) {
          return { original: imgSrc, uploaded: imgSrc };
        }
        
        // Base64 이미지인지 확인
        if (imgSrc.startsWith('data:image')) {
          try {
            // Base64를 파일로 변환
            const res = await fetch(imgSrc);
            const blob = await res.blob();
            const fileExtension = imgSrc.split(';')[0].split('/')[1] || 'png';
            const file = new File([blob], `image-${Date.now()}.${fileExtension}`, { type: `image/${fileExtension}` });
            
            // Supabase에 업로드
            const uploadedUrl = await uploadImageToSupabase(file);
            if (uploadedUrl) {
              return { original: imgSrc, uploaded: uploadedUrl };
            }
          } catch (error) {
            console.error('Base64 이미지 처리 중 오류:', error);
          }
        }
        
        return { original: imgSrc, uploaded: imgSrc };
      });
      
      // 모든 업로드 완료 대기
      const results = await Promise.all(uploadPromises);
      
      // 이미지 URL 대체
      results.forEach(({ original, uploaded }) => {
        if (original && uploaded && original !== uploaded) {
          Array.from(imgTags).forEach(img => {
            if (img.getAttribute('src') === original) {
              img.setAttribute('src', uploaded);
            }
          });
        }
      });
      
      return doc.body.innerHTML;
    } catch (error) {
      console.error('이미지 추출/업로드 중 오류:', error);
      return htmlContent; // 오류 발생 시 원본 내용 반환
    }
  };

  // 콘텐츠 저장 전 이미지 처리 함수
  const processContentBeforeSave = async () => {
    if (!editorContent || !isMounted) return { content: "", images: [] };
    
    try {
      // 현재 에디터 콘텐츠에서 이미지 추출 및 업로드
      const processedContent = await extractAndUploadImages(editorContent);
      
      // 처리된 콘텐츠 업데이트
      setEditorContent(processedContent);
      if (onChange) {
        onChange(processedContent);
      }
      
      return {
        content: processedContent,
        images: uploadedImages
      };
    } catch (error) {
      console.error('콘텐츠 처리 중 오류:', error);
      return {
        content: editorContent,
        images: uploadedImages
      };
    }
  };

  // 이미지 업로드 핸들러 설정
  useEffect(() => {
    if (!isMounted) return; // 마운트되지 않았으면 이벤트 설정 건너뛰기
    
    let isImageBeingUploaded = false;
    let editorInitialized = false;

    const setupEditor = () => {
      if (!editorRef.current || !editorRef.current.editor) {
        // 에디터가 아직 초기화되지 않았으면 재시도
        setTimeout(setupEditor, 100);
        return;
      }

      // 이미 초기화된 경우 중복 실행 방지
      if (editorInitialized) return;
      editorInitialized = true;

      const editor = editorRef.current.editor;
      
      // 이미지 업로드 커스텀 핸들러 등록
      editor.events.on('image.beforeUpload', async function(images) {
        // 이미 업로드 중이면 중복 방지
        if (isImageBeingUploaded) return false;
        
        isImageBeingUploaded = true;
        
        try {
          // 각 이미지를 Supabase에 업로드
          for (let i = 0; i < images.length; i++) {
            const file = images[i];
            const imageUrl = await uploadImageToSupabase(file);
            
            if (imageUrl) {
              // 업로드된 이미지 URL을 에디터에 삽입
              editor.image.insert(imageUrl, null, null, editor.image.get());
            }
          }
        } catch (error) {
          console.error('이미지 업로드 중 오류 발생:', error);
        } finally {
          isImageBeingUploaded = false;
        }
        
        // 기본 업로드 방식 중단
        return false;
      });

      // 이미지 삽입 방지 (중복 방지)
      editor.events.on('image.uploaded', function(response) {
        // 이미 커스텀 핸들러에서 이미지를 삽입했으므로 여기서는 아무것도 하지 않음
        return false;
      });

      // 이미지 업로드 에러 처리
      editor.events.on('image.error', function(error, response) {
        console.error('Froala 이미지 업로드 에러:', error, response);
        isImageBeingUploaded = false;
      });
      
      // 붙여넣기 이벤트 처리 (클립보드 이미지 처리)
      editor.events.on('paste.beforeCleanup', function(clipboard_html) {
        return clipboard_html;
      });
      
      // 이미지 붙여넣기 후 처리
      editor.events.on('paste.after', function() {
        // 안전하게 HTML 가져오기 위해 타임아웃 사용 및 에디터/HTML 존재 여부 확인
        setTimeout(async () => {
          if (editorRef.current && editorRef.current.editor && editorRef.current.editor.html) {
            try {
              const currentContent = editor.html.get();
              const processedContent = await extractAndUploadImages(currentContent);
              if (currentContent !== processedContent) {
                editor.html.set(processedContent);
              }
            } catch (error) {
              console.error('붙여넣기 후 이미지 처리 중 오류:', error);
            }
          }
        }, 300);
      });
    };
    
    // 에디터가 초기화된 후에 이벤트 핸들러 설정
    // 더 긴 타임아웃으로 변경하여 에디터가 완전히 초기화될 시간 확보
    setTimeout(setupEditor, 500);
    
    return () => {
      if (editorRef.current && editorRef.current.editor) {
        try {
          editorRef.current.editor.events.off('image.beforeUpload');
          editorRef.current.editor.events.off('image.uploaded');
          editorRef.current.editor.events.off('image.error');
          editorRef.current.editor.events.off('paste.beforeCleanup');
          editorRef.current.editor.events.off('paste.after');
        } catch (error) {
          console.error('에디터 이벤트 해제 중 오류:', error);
        }
      }
    };
  }, [isMounted]); // isMounted 의존성 추가

  // 에디터 설정
  const config = {
    placeholderText: placeholder,
    heightMin: height,
    language: 'ko',
    toolbarSticky: true,
    toolbarStickyOffset: 50,
    toolbarButtons: [
      ['bold', 'fontSize', 'textColor', 'insertImage', 'align'],
      ['undo', 'redo']
    ],
    fontSizeSelection: true,
    fontSizeDefaultSelection: '16',
    fontSize: ['8', '10', '12', '14', '16', '18', '20', '24', '30', '36', '48', '60', '72', '96'],
    // 이미지 업로드 설정
    imageUploadURL: null, // 기본 업로드 URL 비활성화
    imageUploadToS3: false, // S3 업로드 비활성화
    imageUploadMethod: 'POST',
    imageMaxSize: 5 * 1024 * 1024, // 5MB
    imageAllowedTypes: ['jpeg', 'jpg', 'png', 'gif', 'webp'],
    // 붙여넣기 이미지 처리 활성화
    pastePlain: false,
    pasteAllowedStyleProps: ['font-family', 'font-size', 'color', 'text-align', 'background-color'],
    imagePaste: true,
    imageDefaultWidth: 0, // 원본 크기 유지
    // 이미지 업로드 파라미터 설정
    imageUploadParams: {},
    // 이미지 업로드 관련 추가 설정
    imageInsertButtons: ['imageUpload'], // 이미지 삽입 버튼 설정
    
    // 정렬 관련 설정 - 클래스 대신 인라인 스타일 사용
    useClasses: false,
    htmlUseStyle: true,
    
    // 이미지 정렬 시 스타일 직접 적용
    imageStyles: {
      'fr-fil': 'style="float: left; margin: 5px 20px 5px 0;"',
      'fr-fic': 'style="text-align: center; display: block; margin: 5px auto;"',
      'fr-fir': 'style="float: right; margin: 5px 0 5px 20px;"'
    },
    
    // 텍스트 정렬 시 스타일 직접 적용
    paragraphStyles: {
      'fr-text-left': 'text-align: left;',
      'fr-text-center': 'text-align: center;',
      'fr-text-right': 'text-align: right;',
      'fr-text-justify': 'text-align: justify;'
    },
    
    events: {
      'initialized': function() {
        // 에디터 초기화 후 실행할 코드
        if (events.initialized) events.initialized();
        
        // 워터마크 요소 제거
        setTimeout(() => {
          try {
            const watermarkElements = document.querySelectorAll('.fr-wrapper::before, .fr-wrapper::after, .fr-second-toolbar');
            watermarkElements.forEach(el => {
              if (el) el.style.display = 'none';
            });
          } catch (error) {
            console.error('워터마크 제거 중 오류:', error);
          }
        }, 300);
      },
      'focus': function() {
        // 에디터에 포커스가 갔을 때 실행할 코드
        if (events.focus) events.focus();
      },
      'blur': function() {
        // 에디터에서 포커스가 빠졌을 때 실행할 코드
        if (events.blur) events.blur();
      },
      ...events
    },
    // 모바일 환경에서의 설정
    pluginsEnabled: [
      'colors', 'fontSize', 'image', 'align', 'bold'
    ],
    // preview 기능 비활성화
    htmlAllowedEmptyTags: ['textarea', 'a', 'iframe', 'object', 'video', 'style', 'script'],
    htmlDoNotWrapTags: ['script', 'style'],
    htmlSimpleAmpersand: false,
    // 미리보기 버튼 제거
    quickInsertButtons: ['image', 'table', 'ul', 'ol', 'hr'],
    // 테마 설정
    theme: 'royal',
    // 커스텀 스타일
    zIndex: 9999,
    attribution: false, // Froala 로고 제거
    // 미리보기 기능 비활성화
    preview: false,
    // 코드 뷰 비활성화 (HTML 미리보기 기능)
    codeView: false,
    // 라이센스 키 설정 (워터마크 제거)
    licenseKey: 'X-XXXXXXXXXXX-XXXXXXXXX',
  };

  // 콘텐츠 저장 함수 노출
  useEffect(() => {
    // 부모 컴포넌트에서 접근할 수 있도록 저장 함수 노출
    if (onSave) {
      onSave.current = async () => {
        try {
          return await processContentBeforeSave();
        } catch (error) {
          console.error('저장 전 처리 중 오류:', error);
          return {
            content: editorContent,
            images: uploadedImages
          };
        }
      };
    }
  }, [editorContent, uploadedImages, onSave]);

  // 클라이언트 측 렌더링에서만 에디터 표시
  if (!isMounted) {
    return <div className="froala-editor-loading">에디터 준비 중...</div>;
  }

  return (
    <div className="froala-editor-container">
      <FroalaEditor
        ref={editorRef}
        tag='textarea'
        model={editorContent}
        onModelChange={handleModelChange}
        config={{
          ...config,
          key: 'X-XXXXXXXXXXX-XXXXXXXXX', // Froala 라이센스 키
          attribution: false,
          heightMin: height,
          heightMax: 800,
          toolbarSticky: true,
          toolbarStickyOffset: 50,
          placeholderText: placeholder,
          // 이벤트 핸들러는 setupEditor에서 구성하므로 여기서는 최소화
          events: {
            'initialized': function() {
              // 워터마크 요소 제거
              setTimeout(() => {
                try {
                  const watermarkElements = document.querySelectorAll('.fr-wrapper::before, .fr-wrapper::after, .fr-second-toolbar');
                  watermarkElements.forEach(el => {
                    if (el) el.style.display = 'none';
                  });
                } catch (error) {
                  console.error('워터마크 제거 중 오류:', error);
                }
              }, 300);
              
              if (events.initialized) events.initialized();
            }
          }
        }}
      />
      <style jsx>{`
        :global(.fr-box) {
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
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
          color: #228be6 !important;
          background: #e7f5ff !important;
        }
        /* 미리보기 관련 요소 숨기기 */
        :global(.fr-preview) {
          display: none !important;
        }
        /* 라이센스 워터마크 숨기기 */
        :global(.fr-wrapper::before),
        :global(.fr-wrapper::after),
        :global(.fr-second-toolbar) {
          display: none !important;
        }
        .froala-editor-loading {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          text-align: center;
          color: #6c757d;
          height: ${height}px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 1px solid #ced4da;
        }
      `}</style>
    </div>
  );
};

export default FroalaEditorComponent;