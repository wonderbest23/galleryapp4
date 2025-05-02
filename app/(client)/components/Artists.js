"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { FaChevronRight } from "react-icons/fa";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Artists = () => {
  const router = useRouter();
  const artistSliderRef = useRef(null);
  const workSliderRef = useRef(null);
  const anotherSliderRef = useRef(null);
  const isDraggingRef = useRef(false);
  const isSliderClickRef = useRef(false);
  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 더미 데이터 생성
    const dummyArtists = Array(10)
      .fill(null)
      .map((_, index) => ({
        id: index + 1,
        name: `아티스트 ${index + 1}`,
        field: `작품 분야 ${index + 1}`,
        photo: `/artists/artist${(index % 5) + 1}.jpg`,
        title: `작품명 ${index + 1}`,
        size: `${100 + index * 10} x ${150 + index * 10} cm`,
        price: `${(index + 1) * 10000}원`,
      }));
    setArtists(dummyArtists);
    setIsLoading(false);
  }, []);

  const handleMouseDown = useCallback((e, ref) => {
    isSliderClickRef.current = true;
    e.preventDefault();
    if (ref.current) {
      isDraggingRef.current = false;
      ref.current.style.cursor = "grabbing";
      const slider = ref.current;
      const startX = e.pageX;
      const scrollLeft = slider.scrollLeft;
      const onMouseMove = (e) => {
        if (!isSliderClickRef.current) return;
        e.preventDefault();
        isDraggingRef.current = true;
        const x = e.pageX;
        const walk = startX - x;
        slider.scrollLeft = scrollLeft + walk;
      };
      const onMouseUp = () => {
        isSliderClickRef.current = false;
        slider.style.cursor = "grab";
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

  const handleTouchStart = useCallback((e, ref) => {
    isSliderClickRef.current = true;
    if (ref.current) {
      isDraggingRef.current = false;
      const slider = ref.current;
      const startX = e.touches[0].clientX;
      const scrollLeft = slider.scrollLeft;
      const onTouchMove = (e) => {
        if (!isSliderClickRef.current) return;
        isDraggingRef.current = true;
        const x = e.touches[0].clientX;
        const walk = startX - x;
        slider.scrollLeft = scrollLeft + walk;
      };
      const onTouchEnd = () => {
        isSliderClickRef.current = false;
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-[90%]">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-col items-center justify-center text-[18px] font-bold">
            아티스트
          </div>
          <div  className="flex flex-row items-center justify-center ">
            <p className="text-[#007AFF] text-sm font-bold">SEE ALL</p>
            <FaChevronRight className="text-[#007AFF] text-sm font-bold" />
          </div>
        </div>
        <div className="w-full overflow-x-auto no-scrollbar mt-4 scrollbar-hide">
          <div className="flex gap-4 pb-4">
            {Array(5)
              .fill(null)
              .map((_, index) => (
                <div key={index} className="flex-shrink-0">
                  <Skeleton className="w-[200px] h-[200px] rounded-lg" />
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[90%] max-w-full overflow-hidden my-4">
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-col items-center justify-center text-[18px] font-bold">
          아티스트
        </div>
        <div onClick={() => router.push("/artists")} className="flex flex-row items-center justify-center cursor-pointer">
          <p className="text-[#007AFF] text-sm font-bold">SEE ALL</p>
          <FaChevronRight className="text-[#007AFF] text-sm font-bold" />
        </div>
      </div>
      {/* 아티스트 가로방향 캐러샐*/}
      <div className="w-full relative overflow-hidden mt-4">
        <div
          ref={artistSliderRef}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide h-full slider-container p-1"
          style={{
            scrollSnapType: "x mandatory",
            scrollBehavior: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            cursor: "grab",
            touchAction: "pan-x",
          }}
          onMouseDown={(e) => handleMouseDown(e, artistSliderRef)}
          onTouchStart={(e) => handleTouchStart(e, artistSliderRef)}
        >
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="flex-shrink-0 w-[100px] h-full block"
            >
              <Card  className="h-full overflow-hidden shadow transition-shadow rounded-xl ">
                <div onClick={() => router.push(`/artist/${artist.id}`)} className="relative cursor-pointer">
                  <Image
                    src="/noimage.jpg"
                    alt={artist.name}
                    width={100}
                    height={100}
                    full
                    className="object-cover rounded-lg"
                    draggable="false"
                  />
                </div>
                <CardBody className="flex flex-col justify-between  p-3">
                  <h3 className="text-sm font-bold w-full text-center">
                    {artist.name}
                  </h3>
                </CardBody>
              </Card>
            </div>
          ))}
        </div>
      </div>
      {/* 작품 가로방향 캐러샐 */}
      <div className="w-full relative overflow-hidden mt-4">
        <div
          ref={workSliderRef}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide h-full slider-container p-1"
          style={{
            scrollSnapType: "x mandatory",
            scrollBehavior: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            cursor: "grab",
            touchAction: "pan-x",
          }}
          onMouseDown={(e) => handleMouseDown(e, workSliderRef)}
          onTouchStart={(e) => handleTouchStart(e, workSliderRef)}
        >
          {artists.map((artist) => (
            <div key={artist.id} className="flex w-[150px] h-full block">
              <Card
                className="h-full w-[150px] overflow-hidden  transition-shadow rounded-xl"
                shadow="none"
              >
                <div onClick={() => router.push(`/product/${artist.id}`)} className="relative cursor-pointer h-[200px] w-[150px]">
                  <Image
                    src="/noimage.jpg"
                    alt={artist.name}
                    fill
                    className="object-cover rounded-lg"
                    draggable="false"
                  />
                </div>
                <div className="flex flex-col justify-between p-3">
                  <h3 className="text-[13px] w-full text-start">
                    {artist.name}
                  </h3>
                  <p className="text-[10px] text-start">
                    {artist.title} {artist.size}
                  </p>

                  <p className="text-[14px] text-start font-bold">
                    ₩
                    {artist.price
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      {/* // 아티스트 가로방향 캐러샐샐 */}
      <div className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-col items-center justify-center text-[18px] font-bold">
          Top of Week
        </div>
        <div onClick={() => router.push("/artstore")} className="flex flex-row items-center justify-center cursor-pointer">
          <p className="text-[#007AFF] text-sm font-bold">SEE ALL</p>
          <FaChevronRight className="text-[#007AFF] text-sm font-bold" />
        </div>
      </div>
      <div className="w-full relative overflow-hidden mt-4">
        <div
          ref={anotherSliderRef}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide h-full slider-container p-1"
          style={{
            scrollSnapType: "x mandatory",
            scrollBehavior: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            cursor: "grab",
            touchAction: "pan-x",
          }}
          onMouseDown={(e) => handleMouseDown(e, anotherSliderRef)}
          onTouchStart={(e) => handleTouchStart(e, anotherSliderRef)}
        >
          {artists.map((artist) => (
            <div key={artist.id} className="flex w-[150px] h-full block">
              <Card
                className="h-full w-[125px] overflow-hidden  transition-shadow rounded-xl"
                shadow="none"
              >
                <div onClick={() => router.push(`/product/${artist.id}`)} className="relative cursor-pointer h-[150px] w-[125px]">
                  <Image
                    src="/noimage.jpg"
                    alt={artist.name}
                    fill
                    className="object-cover rounded-lg"
                    draggable="false"
                  />
                </div>
                <div className="flex flex-col justify-between p-3">
                  <h3 className="text-[14px] w-full text-start">
                    {artist.name}
                  </h3>
                  

                  <p className="text-[12px] text-start font-bold">
                    ₩
                    {artist.price
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Artists;
