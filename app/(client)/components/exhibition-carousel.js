'use client'
import React, { useState, useEffect } from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
export function ExhibitionCarousel() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const getBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("banner").select("*").order("id", { ascending: false });
      if (error) {
        console.log("Error fetching banners:", error);
      }
      setBanners(data || []);
    } catch (error) {
      console.log("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getBanners();
  }, []);

  // Slick 설정
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    pauseOnHover: true,
    arrows: false,
    dotsClass: "slick-dots custom-dots",
    customPaging: (i) => (
      <div className="dot-button" />
    )
  };

  return (
    <div className="relative py-5 w-full flex justify-center items-center">
      <Card className="w-full" shadow="none">
        <CardBody className="p-0 w-full flex justify-center items-center">
          {loading ? (
            <Card className="w-[300px] space-y-5 p-4" radius="lg" shadow="none" >
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
          ) : (
            <div className="w-[90%] relative">
              <Slider {...settings}>
                {banners.map((banner, index) => (
                  <div key={index}>
                    <Image
                      src={banner?.url || `https://picsum.photos/800/400?random=${index}`}
                      alt={banner?.title || `Slide ${index + 1}`}
                      className="w-full h-[200px] object-cover rounded-2xl"
                      style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
                      width={800}
                      height={400}
                      priority={index === 0}
                    />
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </CardBody>
      </Card>
      <style jsx global>{`
        .custom-dots {
          position: absolute;
          bottom: 10px;
          display: flex !important;
          justify-content: center;
          align-items: center;
          width: 100%;
          padding: 0;
          margin: 0;
          list-style: none;
          text-align: center;
          z-index: 10;
        }
        .custom-dots li {
          position: relative;
          display: inline-block;
          width: 12px;
          height: 12px;
          margin: 0 3px;
          padding: 0;
          cursor: pointer;
        }
        .custom-dots li button {
          font-size: 0;
          line-height: 0;
          display: block;
          width: 12px;
          height: 12px;
          padding: 0;
          cursor: pointer;
          color: transparent;
          border: 0;
          outline: none;
          background: transparent;
        }
        .custom-dots li .dot-button {
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: white;
          
        }
        .custom-dots li.slick-active .dot-button {
          background-color: #007AFF !important;
          width: 10px;
          height: 10px;
        }
        
        /* 이미지 클릭 시 하이라이트 제거 */
        img {
          -webkit-tap-highlight-color: transparent;
          outline: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
}