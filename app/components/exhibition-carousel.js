"use client";
import React, { useState, useEffect } from "react";
import { VerticalCardWithCarousel, HorizontalCarousel } from "./carousel";
import { Card, CardBody, Divider, Skeleton, Spinner, Button, Badge } from "@heroui/react";
import { FaRegCalendar, FaRegBookmark, FaBookmark, FaStar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function ExhibitionWithGalleries({ exhibitionId, user }) {
  const [exhibition, setExhibition] = useState(null);
  const [relatedGalleries, setRelatedGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingGalleries, setLoadingGalleries] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const supabase = createClient();

  // 전시회 데이터 가져오기
  useEffect(() => {
    const fetchExhibition = async () => {
      if (!exhibitionId) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("exhibition")
          .select("*, gallery:naver_gallery_url(*)")
          .eq("id", exhibitionId)
          .single();
          
        if (error) throw error;
        setExhibition(data);
        
        // 이 전시회가 북마크되었는지 확인
        if (user) {
          const { data: bookmarkData } = await supabase
            .from("bookmark")
            .select("*")
            .eq("user_id", user.id)
            .eq("exhibition_id", exhibitionId)
            .maybeSingle();
            
          setIsBookmarked(!!bookmarkData);
        }
      } catch (error) {
        console.error("전시회 데이터를 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExhibition();
  }, [exhibitionId, user]);

  // 같은 지역의 관련 갤러리 데이터 가져오기
  useEffect(() => {
    const fetchRelatedGalleries = async () => {
      if (!exhibition?.gallery?.address) return;
      
      try {
        setLoadingGalleries(true);
        // 주소에서 지역(시/도) 추출
        const region = exhibition.gallery.address.split(' ')[0];
        
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .ilike("address", `${region}%`)
          .neq("id", exhibition.gallery.id) // 현재 갤러리 제외
          .order("blog_review_count", { ascending: false })
          .limit(10);
          
        if (error) throw error;
        setRelatedGalleries(data);
      } catch (error) {
        console.error("관련 갤러리 데이터를 가져오는 중 오류 발생:", error);
      } finally {
        setLoadingGalleries(false);
      }
    };
    
    if (exhibition) {
      fetchRelatedGalleries();
    }
  }, [exhibition]);

  // 북마크 토글 처리
  const toggleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert("북마크를 추가하려면 로그인이 필요합니다.");
      return;
    }
    
    try {
      if (isBookmarked) {
        // 북마크 삭제
        await supabase
          .from("bookmark")
          .delete()
          .eq("user_id", user.id)
          .eq("exhibition_id", exhibitionId);
      } else {
        // 북마크 추가
        await supabase
          .from("bookmark")
          .insert({
            user_id: user.id,
            exhibition_id: exhibitionId,
            created_at: new Date().toISOString(),
          });
      }
      
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("북마크 처리 중 오류 발생:", error);
    }
  };

  // 세로 카드 내용 렌더링
  const renderExhibitionCard = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
          <Skeleton className="h-4 w-2/3 rounded-lg" />
        </div>
      );
    }
    
    if (!exhibition) {
      return <div className="text-center p-4">전시회 정보를 찾을 수 없습니다.</div>;
    }
    
    return (
      <div className="space-y-4">
        <div className="relative">
          <img 
            src={exhibition.image_url || "/images/noimage.jpg"} 
            alt={exhibition.name || "전시회 이미지"} 
            className="w-full h-64 object-cover rounded-lg"
          />
          <Button
            isIconOnly
            variant="light"
            className="absolute top-2 right-2 bg-white/70 rounded-full"
            onClick={toggleBookmark}
          >
            {isBookmarked ? (
              <FaBookmark className="text-red-500" />
            ) : (
              <FaRegBookmark className="text-gray-600" />
            )}
          </Button>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-bold">{exhibition.name}</h1>
          
          <div className="flex items-center text-gray-600 gap-2">
            <FaRegCalendar className="text-gray-400" />
            <span className="text-sm">
              {new Date(exhibition.start_date).toLocaleDateString()} ~ 
              {new Date(exhibition.end_date).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600 gap-2">
            <IoMdPin className="text-gray-400" />
            <span className="text-sm">{exhibition.gallery?.name || "갤러리 정보 없음"}</span>
          </div>
          
          <div className="flex items-center text-gray-600 gap-2">
            <FaStar className="text-yellow-400" />
            <span className="text-sm">{exhibition.visitor_rating || "평점 없음"}</span>
          </div>
          
          {exhibition.isFree && (
            <Badge color="success" variant="flat">무료 전시</Badge>
          )}
          
          {exhibition.isRecommended && (
            <Badge color="primary" variant="flat">추천 전시</Badge>
          )}
        </div>
        
        <Divider />
        
        <div>
          <h3 className="font-bold mb-1">전시회 정보</h3>
          <p className="text-sm text-gray-700">{exhibition.description || "상세 설명이 없습니다."}</p>
        </div>
      </div>
    );
  };

  // 갤러리 카드 렌더링 함수 (캐러셀 아이템)
  const renderGalleryCard = (gallery) => (
    <Link href={`/galleries/${gallery.id}`} className="block w-48">
      <Card className="h-36 overflow-hidden shadow hover:shadow-md transition-shadow">
        <div className="h-20">
          <img
            src={gallery.thumbnail || "/images/noimage.jpg"}
            alt={gallery.name || "갤러리 이미지"}
            className="w-full h-full object-cover"
          />
        </div>
        <CardBody className="p-2">
          <h4 className="text-sm font-bold line-clamp-1">{gallery.name}</h4>
          <p className="text-xs text-gray-500 line-clamp-1">{gallery.address}</p>
        </CardBody>
      </Card>
    </Link>
  );

  return (
    <div className="w-full max-w-xl mx-auto p-4">
      <VerticalCardWithCarousel
        card={renderExhibitionCard()}
        carouselItems={relatedGalleries}
        renderCarouselItem={renderGalleryCard}
        loading={loadingGalleries}
      />
    </div>
  );
} 