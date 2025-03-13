'use client'
import React from "react";
import { Card, CardBody, Tabs, Tab } from "@heroui/react";

export function MagazineCarousel() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);
  
  const slides = Array(5).fill({
    title: "미슐랭 매거진",
    description: "이번 달의 특집 기사",
  });

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

    if (isLeftSwipe && currentSlide < slides.length - 1) {
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
          <div className="relative"
               onTouchStart={onTouchStart}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEnd}>
            <Card className="w-full">
              <CardBody className="p-0">
                <img
                  src={`https://picsum.photos/800/400?random=${currentSlide + 10}`}
                  alt={slides[currentSlide].title}
                  className="w-full h-[300px] object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white">
                  <h3 className="text-xl font-bold">{slides[currentSlide].title}</h3>
                  <p>{slides[currentSlide].description}</p>
                </div>
              </CardBody>
            </Card>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
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
        </Tab>
      </Tabs>
    </div>
  );
}