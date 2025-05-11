import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Spinner } from '@heroui/spinner';
export default function ChatHeader({ productId, chatData }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex items-center px-4 pt-4 bg-white w-full justify-center">
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
  );
};




