'use client'
import React, { useState, useEffect } from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export function ExhibitionCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const getBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("banner").select("*").order("id", { ascending: false });
      if (error) {
        console.error("Error fetching banners:", error);
      }
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBanners();
  }, []);

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) { // 왼쪽으로 스와이프
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }

    if (touchStart - touchEnd < -75) { // 오른쪽으로 스와이프
      setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    }
  };

  return (
    <div 
      className="relative p-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Card className="w-full" shadow="none">
        <CardBody className="p-0">
          {loading ? (
            <Card className="w-[90vw] space-y-5 p-4" radius="lg" >
              <Skeleton className="rounded-lg">
                <div className="h-48 rounded-lg bg-default-300" />
              </Skeleton>
              <div className="space-y-3">
                <Skeleton className="w-3/5 rounded-lg">
                  <div className="h-3 w-3/5 rounded-lg bg-default-200" />
                </Skeleton>
                <Skeleton className="w-4/5 rounded-lg">
                  <div className="h-3 w-4/5 rounded-lg bg-default-200" />
                </Skeleton>
                <Skeleton className="w-2/5 rounded-lg">
                  <div className="h-3 w-2/5 rounded-lg bg-default-300" />
                </Skeleton>
              </div>
            </Card>
          ) : banners.length > 0 && (
            
              <img
                src={banners[currentSlide]?.url || `https://picsum.photos/800/400?random=${currentSlide}`}
                alt={banners[currentSlide]?.title || `Slide ${currentSlide + 1}`}
                className="w-[90vw] h-48 object-cover"
              />
            
          )}
        </CardBody>
      </Card>
      {!loading && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, index) => (
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
      )}
    </div>
  );
}