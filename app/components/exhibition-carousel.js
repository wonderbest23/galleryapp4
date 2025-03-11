'use client'
import React, { useState } from "react";
import { Card, CardBody } from "@heroui/react";
import Link from "next/link";
export function ExhibitionCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const slides = [1, 2, 3, 4, 5];

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) { // 왼쪽으로 스와이프
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }

    if (touchStart - touchEnd < -75) { // 오른쪽으로 스와이프
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    }
  };

  return (
    <div 
      className="relative p-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card className="w-full">
        <CardBody className="p-0">
          <Link href={`/gallery/${currentSlide + 1}`}>
          <img
            src={`https://picsum.photos/800/400?random=${currentSlide}`}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-48 object-cover"
          />
          </Link>
        </CardBody>
      </Card>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              currentSlide === index ? 'bg-red-500' : 'bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
    </div>
  );
}