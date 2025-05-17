import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Spinner } from '@heroui/react';
import { PiSirenFill } from "react-icons/pi";
import { MdDeleteForever } from "react-icons/md";
import {addToast} from "@heroui/react"

export default function ChatHeader({ productId, chatData, userId, hostId, channel }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (chatData) {
      console.log("ChatHeader에서 채팅 데이터:", chatData);
    }
  }, [chatData]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!productId) return;
        
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          throw new Error('제품을 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (error) {
        console.log('제품 정보 가져오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // 제품 이미지 추출
  const getProductImageUrl = () => {
    if (!product || !product.image) return null;
    
    try {
      // JSON 문자열일 경우 파싱
      const imageData = typeof product.image === 'string' 
        ? JSON.parse(product.image) 
        : product.image;
        
      // 배열인 경우 첫 번째 이미지 가져오기
      if (Array.isArray(imageData) && imageData.length > 0) {
        return imageData[0];
      }
      
      // 객체인 경우 첫 번째 키 또는 URL 속성 찾기
      if (typeof imageData === 'object') {
        const firstValue = Object.values(imageData)[0];
        return firstValue || null;
      }
      
      return null;
    } catch (error) {
      console.log('이미지 처리 오류:', error);
      return null;
    }
  };

  const imageUrl = product ? getProductImageUrl() : null;
  console.log("chatData:", chatData)
  // 채팅 삭제 핸들러
  const handleDeleteChat = async () => {
    if (isDeleting) return; // 이미 삭제 처리 중이면 중복 요청 방지
    
    try {
      setIsDeleting(true);
    
      if (!chatData || !chatData.id) {
        addToast({
          title: "오류 발생",
          description: "채팅 정보를 찾을 수 없습니다.",
          color: "danger",
        });
        return;
      }

      // 서버 측 API를 통해 채팅 삭제 요청
      const response = await fetch('/api/chat/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatData.id,
          channelId: channel?.id,
          userId: userId,
          hostId: hostId,
          productId: chatData.product_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        addToast({
          title: "삭제 실패",
          description: errorData.error || "채팅 삭제 중 오류가 발생했습니다.",
          color: "danger",
        });
        return;
      }

      const result = await response.json();
      console.log("채팅 삭제 결과:", result);

      addToast({
        title: "삭제 완료",
        description: "채팅이 성공적으로 삭제되었습니다.",
        color: "success",
      });

      // 채널이 성공적으로 삭제되었는지 확인
      if (result.channelDeleted) {
        console.log("GetStream 채널이 삭제되었습니다.");
      }

      // 삭제 후 즉시 채팅 목록 페이지로 리다이렉트
      router.push('/mypage/success');
      
    } catch (error) {
      console.log("채팅 삭제 오류:", error);
      addToast({
        title: "오류 발생",
        description: "채팅 삭제 중 문제가 발생했습니다.",
        color: "danger",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 신고하기 핸들러
  const handleReport = () => {
    window.open('https://pf.kakao.com/_sBnXn', '_blank');
  };

  return (
    <div className="flex items-center justify-between px-4 pt-4 bg-white w-full">
      {/* 왼쪽 공간 - 빈 공간으로 유지 */}
      <div className="w-1/4"></div>
      
      {/* 중앙 상품 정보 */}
      <div className="flex-1 flex justify-center items-center">
        {loading ? (
          <div className="flex items-center space-x-3">
            <Spinner variant="wave" color="primary" />
          </div>
        ) : product ? (
          <div className="flex items-center space-x-3">
            {imageUrl ? (
              <div className="relative h-10 w-10 rounded-lg overflow-hidden">
                <Image 
                  src={imageUrl} 
                  alt={product.name || '제품 이미지'} 
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm text-gray-600">이미지 없음</span>
              </div>
            )}
            <div className='flex flex-col'>
              <h2 className="text-[14px]">{product.name || '제품 정보 없음'}</h2>
              <p className='text-[16px] font-bold'>₩{product.price?.toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div>제품 정보를 찾을 수 없습니다.</div>
        )}
      </div>
      
      {/* 우측 상단 아이콘 영역 */}
      <div className="w-1/4 flex justify-end space-x-4">
        <button 
          onClick={handleReport}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="신고하기"
        >
          <PiSirenFill size={20} />
        </button>
        <button 
          onClick={handleDeleteChat}
          disabled={isDeleting}
          className={`text-gray-500 hover:text-gray-700 transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label="채팅 삭제"
        >
          {isDeleting ? (
            <Spinner size="sm" color="primary" className="mr-2" />
          ) : (
            <MdDeleteForever size={22} className='text-[#007AFF] hover:scale-110' />
          )}
        </button>
      </div>
    </div>
  );
}




