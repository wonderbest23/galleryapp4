"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import { Card, CardBody, Spinner } from "@heroui/react";

export function HorizontalCarousel({ items, renderItem, title, loading = false, link = null }) {
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // 스크롤 위치에 따라 화살표 표시 여부 업데이트
  const updateArrows = useCallback(() => {
    if (!carouselRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", updateArrows);
      // 초기 화살표 상태 설정
      updateArrows();
      return () => carousel.removeEventListener("scroll", updateArrows);
    }
  }, [updateArrows, items]);

  const handleMouseDown = useCallback((e) => {
    if (!carouselRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
    carouselRef.current.style.cursor = "grabbing";
    carouselRef.current.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !carouselRef.current) return;
    
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (carouselRef.current) {
      carouselRef.current.style.cursor = "grab";
      carouselRef.current.style.userSelect = "auto";
    }
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (!carouselRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].clientX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !carouselRef.current) return;
    
    const x = e.touches[0].clientX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -200,
        behavior: "smooth"
      });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: 200,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full relative">
      {/* 제목과 "모두 보기" 링크 */}
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="font-bold text-lg">{title}</h3>
        {link && (
          <Link href={link} className="text-[#007AFF] text-sm font-semibold">
            모두 보기
          </Link>
        )}
      </div>
      
      {/* 좌측 화살표 */}
      {showLeftArrow && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
          style={{ transform: 'translateY(-50%)' }}
        >
          <FaChevronLeft className="text-gray-700" />
        </button>
      )}
      
      {/* 우측 화살표 */}
      {showRightArrow && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 z-10 bg-white/80 rounded-full p-1 shadow-md"
          style={{ transform: 'translateY(-50%)' }}
        >
          <FaChevronRight className="text-gray-700" />
        </button>
      )}
      
      {/* 캐러셀 컨테이너 */}
      <div
        ref={carouselRef}
        className="flex overflow-x-auto pb-4 scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          scrollBehavior: "smooth",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: "grab",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {loading ? (
          <div className="flex justify-center items-center w-full h-32">
            <Spinner size="lg" color="primary" />
          </div>
        ) : (
          items?.map((item, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 snap-start mr-4 last:mr-0"
            >
              {renderItem(item, index)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function VerticalCardWithCarousel({ card, carouselItems, renderCarouselItem, loading = false }) {
  return (
    <Card className="w-full overflow-hidden shadow-md rounded-lg mb-6">
      {/* 세로 방향 카드 내용 */}
      <CardBody className="p-4">
        {card}
      </CardBody>
      
      {/* 가로 방향 캐러셀 */}
      <div className="mt-2 pb-4">
        <HorizontalCarousel 
          items={carouselItems}
          renderItem={renderCarouselItem}
          loading={loading}
        />
      </div>
    </Card>
  );
} 