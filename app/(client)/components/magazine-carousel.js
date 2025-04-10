'use client'
import React from "react";
import { Card, CardBody, Tabs, Tab,Skeleton,Spinner,Link } from "@heroui/react";
import { createClient } from "@/utils/supabase/client";
import { useEffect,useState } from "react";

export function MagazineCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);
  const [magazines, setMagazines] = React.useState([]);
  const supabase = createClient();
  useEffect(() => {
    const fetchMagazines = async () => {
      const { data, error } = await supabase.from('magazine').select('*').order('created_at', { ascending: false }).limit(5)
      if (error) {
        console.error('Error fetching magazines:', error);
      } else {
        setMagazines(data || []);
      }
    };

    fetchMagazines();
  }, []);
  
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < magazines.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
    
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  return (
    <div className="space-y-4 w-full justify-center items-center p-6 mb-12">
      <Tabs className="w-full justify-center items-center" aria-label="Magazine options" variant="underlined">
        <Tab key="michelin" title="미슐랭매거진">
          {magazines.length > 0 ? (
            <div className="relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}>
              <Card className="w-full">
                <CardBody className="p-0">
                  <Link href={`/magazine/${magazines[currentSlide].id}`}>
                  <img
                    src={magazines[currentSlide]?.photo[0]['url'] || `/images/noimage.jpg`}
                    alt={magazines[currentSlide]?.title}
                    className="w-full h-[450px] object-cover"
                  />
                  </Link>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                    <h3 className="text-xl font-bold">{magazines[currentSlide].title}</h3>
                    <p>{magazines[currentSlide].subtitle || '매거진 내용'}</p>
                  </div>
                </CardBody>
              </Card>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {magazines.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      currentSlide === index ? "bg-red-500" : "bg-white border border-gray-300"
                    }`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-[300px]">
              <Skeleton className="w-full h-[300px]"></Skeleton>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}