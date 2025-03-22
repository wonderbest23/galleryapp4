'use client'
import React, { useState } from "react";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
export default function EventCarousel({ events }) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) { // 왼쪽으로 스와이프
      setCurrentSlide((prev) => (prev === events.length - 1 ? 0 : prev + 1));
    }

    if (touchStart - touchEnd < -75) { // 오른쪽으로 스와이프
      setCurrentSlide((prev) => (prev === 0 ? events.length - 1 : prev - 1));
    }
  };

  if (!events || events.length === 0) {
    return <div className="p-6">등록된 이벤트가 없습니다.</div>;
  }

  return (
    <div 
      className="relative p-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card className="w-full">
        <CardBody className="p-0">
          <Link 
            href={`/events/${events[currentSlide].id}`}
            aria-label={`${events[currentSlide].title || `이벤트 ${currentSlide + 1}`} 상세보기`}
          >
            <div 
              className="relative w-full" 
              style={{ height: '300px', width: '300px', margin: '0 auto' }}
              role="img"
              aria-label={events[currentSlide].title || `이벤트 ${currentSlide + 1}`}
            >
              <img
                src={events[currentSlide].photo}
                alt={events[currentSlide].title || `이벤트 ${currentSlide + 1}`}
                className="w-full h-full object-cover"
                style={{ 
                  objectPosition: 'center center',
                  width: '300px', 
                  height: '300px'
                }}
              />
              
            </div>
          </Link>
        </CardBody>
      </Card>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              currentSlide === index ? 'bg-red-500' : 'bg-white border border-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
    </div>
  );
}