import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardBody, Skeleton, CardFooter, Divider } from "@heroui/react";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";

export default function LowerCarousel() {
  const scrollRef = useRef(null);
  // 드래그 상태를 추적하는 ref
  const isDraggingRef = useRef(false);
  // 슬라이더 요소에서만 동작하도록 체크하는 ref
  const isSliderClickRef = useRef(false);
  
  const [artItems, setArtItems] = useState([
    {
      id: 1,
      image: "/noimage.jpg",
      title: "꽃이 있는 풍경",
      artist: "김예술",
      price: "₩250,000",
      liked: false,
      bookmarked: false,
    },
    {
      id: 2,
      image: "/noimage.jpg",
      title: "바다의 소리",
      artist: "이창작",
      price: "₩180,000",
      liked: false,
      bookmarked: false,
    },
    {
      id: 3,
      image: "/noimage.jpg",
      title: "가을 숲",
      artist: "박작가",
      price: "₩320,000",
      liked: false,
      bookmarked: false,
    },
    {
      id: 4,
      image: "/noimage.jpg",
      title: "도시의 야경",
      artist: "정아트",
      price: "₩210,000",
      liked: false,
      bookmarked: false,
    },
    {
      id: 5,
      image: "/noimage.jpg",
      title: "서울의 밤",
      artist: "홍미술",
      price: "₩280,000",
      liked: false,
      bookmarked: false,
    },
    {
      id: 6,
      image: "/noimage.jpg",
      title: "산과 바다",
      artist: "최화가",
      price: "₩195,000",
      liked: false,
      bookmarked: false,
    },
  ]);

  const toggleLike = (id) => {
    setArtItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, liked: !item.liked } : item
      )
    );
  };

  const toggleBookmark = (id) => {
    setArtItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, bookmarked: !item.bookmarked } : item
      )
    );
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = useCallback((e) => {
    isSliderClickRef.current = true;
    e.preventDefault();
    
    if (scrollRef.current) {
      isDraggingRef.current = false;
      scrollRef.current.style.cursor = "grabbing";
      
      const slider = scrollRef.current;
      const startX = e.pageX;
      const scrollLeft = slider.scrollLeft;
      
      // 마우스 이동 이벤트 핸들러
      const onMouseMove = (e) => {
        if (!isSliderClickRef.current) return;
        
        e.preventDefault();
        isDraggingRef.current = true;
        
        const x = e.pageX;
        // 자연스러운 1:1 이동으로 변경
        const walk = startX - x;
        slider.scrollLeft = scrollLeft + walk;
      };
      
      // 마우스 업 이벤트 핸들러
      const onMouseUp = (e) => {
        isSliderClickRef.current = false;
        slider.style.cursor = "grab";
        
        // 드래그 상태 해제 시간 단축
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 10);
        
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    }
  }, []);

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback((e) => {
    isSliderClickRef.current = true;
    
    if (scrollRef.current) {
      isDraggingRef.current = false;
      const slider = scrollRef.current;
      const startX = e.touches[0].clientX;
      const scrollLeft = slider.scrollLeft;
      
      // 터치 이동 이벤트 핸들러
      const onTouchMove = (e) => {
        if (!isSliderClickRef.current) return;
        
        isDraggingRef.current = true;
        
        const x = e.touches[0].clientX;
        // 자연스러운 1:1 이동으로 변경
        const walk = startX - x;
        slider.scrollLeft = scrollLeft + walk;
      };
      
      // 터치 종료 이벤트 핸들러
      const onTouchEnd = () => {
        isSliderClickRef.current = false;
        
        // 지연시간 최소화
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 10);
        
        slider.removeEventListener("touchmove", onTouchMove);
        slider.removeEventListener("touchend", onTouchEnd);
      };
      
      slider.addEventListener("touchmove", onTouchMove, { passive: false });
      slider.addEventListener("touchend", onTouchEnd);
    }
  }, []);

  return (
    <div className="w-full overflow-hidden my-4">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          cursor: "grab",
          touchAction: "pan-x",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex gap-4 pr-8 relative z-10">
          {artItems.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0"
              onClick={(e) => {
                // 드래그 중에는 클릭 이벤트 방지
                if (isDraggingRef.current) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <Card className="rounded-xl overflow-hidden shadow-sm h-full flex flex-col">
                <div className="relative w-[127px] h-[150px] mx-auto">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                <CardBody className="p-3">
                  <p className="text-[14px] font-medium line-clamp-1 text-[#606060]">
                    {item.title}
                  </p>
                  <p className="text-[14px] text-black font-bold mt-1">
                    {item.price}
                  </p>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
