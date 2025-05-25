"use client";
import React, { useState } from "react";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
export default function EventCarousel({event}) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  // event.photo 배열에서 슬라이드 생성
  const slides = event?.photo || event?.photos || [];
  
  // 이미지 URL 가져오기 (event 구조에 따라 다를 수 있음)
  const getImageUrl = (slideIndex) => {
    if (slides && slides[slideIndex] && slides[slideIndex].url) {
      return slides[slideIndex].url;
    } else if (slides && slides[slideIndex] && typeof slides[slideIndex] === 'string') {
      return slides[slideIndex];
    } else if (event && event.image_url) {
      return event.image_url;
    } else {
      return `https://picsum.photos/800/400?random=${slideIndex}`;
    }
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // 왼쪽으로 스와이프
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }

    if (touchStart - touchEnd < -75) {
      // 오른쪽으로 스와이프
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }
  };

  return (
    
    <div
      className="relative pt-2 pb-4" 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {slides.length > 0 ? (
        <Card classNames={{base: "w-full rounded-none p-0"}} className="w-full rounded-none" >
          <CardBody className="p-0 rounded-none">
            <Link href={`/gallery/${event?.id || currentSlide + 1}`}>
              <img
                src={getImageUrl(currentSlide)}
                alt={`${event?.title || ''} - 이미지 ${currentSlide + 1}`}
                className="w-full h-48 object-cover rounded-none"
              />
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Card className="w-full">
          <CardBody className="p-0">
            <img
              src={`https://picsum.photos/800/400?random=1`}
              alt="기본 이미지"
              className="w-full h-48 object-cover"
            />
          </CardBody>
        </Card>
      )}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              currentSlide === index
                ? "bg-red-500"
                : "bg-white border border-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
    </div>
  );
}
