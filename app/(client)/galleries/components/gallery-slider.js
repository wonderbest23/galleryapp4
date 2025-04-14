"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";
import Link from "next/link";

export function GallerySlider({ galleries, loading, user, toggleBookmark, isBookmarked }) {
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // 모바일 터치 이벤트 핸들러
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="w-full px-4">
      {loading ? (
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {Array(5)
            .fill(null)
            .map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[200px]">
                <Card className="w-[200px] h-[240px]">
                  <Skeleton className="w-full h-[140px]" />
                  <CardBody className="p-3">
                    <Skeleton className="w-3/4 h-4 mb-2" />
                    <Skeleton className="w-1/2 h-3" />
                  </CardBody>
                </Card>
              </div>
            ))}
        </div>
      ) : (
        <div
          className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {galleries.length === 0 ? (
            <div className="text-center py-10 w-full">
              <p className="text-gray-500">갤러리가 없습니다</p>
            </div>
          ) : (
            galleries.map((gallery, index) => (
              <div key={index} className="flex-shrink-0 w-[200px]">
                <Card className="w-[200px] h-[240px] overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  <Link href={`/galleries/${gallery.id}`}>
                    <div className="relative">
                      <img
                        src={gallery.thumbnail || `https://picsum.photos/400/300?random=${index}`}
                        alt={gallery.name || "갤러리 이미지"}
                        className="w-full h-[140px] object-cover"
                      />
                      <div 
                        className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white/70"
                        onClick={(e) => toggleBookmark(e, gallery)}
                      >
                        {user && isBookmarked && isBookmarked(gallery.id) ? (
                          <FaBookmark className="text-red-500 text-lg" />
                        ) : (
                          <FaRegBookmark className="text-gray-600 text-lg" />
                        )}
                      </div>
                    </div>
                    <CardBody className="p-3">
                      <h3 className="font-bold text-md line-clamp-1">{gallery.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{gallery.address}</p>
                    </CardBody>
                  </Link>
                </Card>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 