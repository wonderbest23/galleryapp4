"use client";
import { Card, CardBody, Divider, Skeleton, Spinner } from "@heroui/react";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";
import Link from "next/link";
import { FaPlusCircle } from "react-icons/fa";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import useBookmarkStore from "./bookmarkStore";
import { addToast } from "@heroui/react";
// 캐러셀용 아이콘 추가
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

export default function GalleryCards({ selectedTab, user }) {
  const [gallerys, setGallerys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 5;
  const supabase = createClient();
  
  // 캐러셀 관련 상태 추가
  const carouselRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Zustand 북마크 스토어에서 상태와 함수 가져오기
  const { bookmarks, setBookmarks } = useBookmarkStore();

  // 북마크 상태 확인하는 함수
  const isBookmarked = (galleryId) => {
    return bookmarks.some((bookmark) => bookmark.gallery_id === galleryId);
  };

  // ... 기존 북마크 관련 코드 유지 ...

  // 캐러셀 네비게이션 함수 추가
  const scrollToNext = () => {
    if (carouselRef.current && currentIndex < gallerys.length - 1) {
      setCurrentIndex(currentIndex + 1);
      carouselRef.current.scrollTo({
        left: (currentIndex + 1) * carouselRef.current.offsetWidth / 3,
        behavior: 'smooth'
      });
    }
  };

  const scrollToPrev = () => {
    if (carouselRef.current && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      carouselRef.current.scrollTo({
        left: (currentIndex - 1) * carouselRef.current.offsetWidth / 3,
        behavior: 'smooth'
      });
    }
  };

  // ... 기존 코드 유지 (fetchBookmarks, getGallerys, loadMore 등) ...

  return (
    <div className="flex flex-col items-center gap-4 w-full justify-center">
      {/* 캐러셀 네비게이션 버튼 */}
      <div className="flex justify-between w-full max-w-[900px]">
        <button 
          onClick={scrollToPrev} 
          disabled={currentIndex === 0 || loading}
          className={`p-2 rounded-full ${currentIndex === 0 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <IoIosArrowBack size={24} />
        </button>
        
        <button 
          onClick={scrollToNext} 
          disabled={currentIndex >= gallerys.length - 3 || loading}
          className={`p-2 rounded-full ${currentIndex >= gallerys.length - 3 ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'}`}
        >
          <IoIosArrowForward size={24} />
        </button>
      </div>
      
      {/* 캐러셀 컨테이너 */}
      <div 
        ref={carouselRef}
        className="w-full max-w-[900px] overflow-x-auto flex gap-4 snap-x snap-mandatory scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading && page === 1
          ? // 처음 로딩 중 스켈레톤 UI 표시
            Array(PAGE_SIZE)
              .fill()
              .map((_, index) => (
                <div
                  key={index}
                  className="min-w-[280px] flex-shrink-0 snap-center"
                >
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-40 w-full rounded-lg" />
                    <Skeleton className="h-4 w-36 rounded-lg" />
                    <Skeleton className="h-3 w-24 rounded-lg" />
                  </div>
                </div>
              ))
          : // 데이터 로드 완료 후 실제 갤러리 목록 표시 (캐러셀 형태)
            gallerys.map((gallery, index) => (
              <Card 
                key={index} 
                className="min-w-[280px] flex-shrink-0 snap-center shadow-md hover:shadow-lg transition-shadow"
              >
                <Link
                  href={`/galleries/${gallery.id || index + 1}`}
                  className="w-full h-full flex flex-col"
                >
                  <div className="relative">
                    <img
                      src={gallery.thumbnail || "/images/noimage.jpg"}
                      alt={gallery.name || "갤러리 이미지"}
                      className="w-full h-40 object-cover rounded-t-lg"
                    />
                    <div 
                      className="absolute top-2 right-2" 
                      onClick={(e) => toggleBookmark(e, gallery)}
                    >
                      {isBookmarked(gallery.id) ? (
                        <FaBookmark className="text-red-500 text-xl cursor-pointer" />
                      ) : (
                        <FaRegBookmark className="text-white text-xl cursor-pointer" />
                      )}
                    </div>
                  </div>
                  <CardBody className="flex flex-col p-3">
                    <div className="text-lg font-bold line-clamp-1">
                      {gallery.name || ""}
                    </div>
                    <Divider orientation="horizontal" className="bg-gray-300 my-2" />
                    <div className="text-xs flex flex-col gap-1">
                      <div className="flex flex-row gap-1 items-center">
                        <IoMdPin />
                        <span className="line-clamp-1">{gallery.address || "서울 강남구"}</span>
                      </div>
                      <div className="flex flex-row gap-1 items-center">
                        <FaRegStar />
                        {gallery.visitor_rating || "없음"}({gallery.blog_review_count || "없음"})
                      </div>
                    </div>
                  </CardBody>
                </Link>
              </Card>
            ))}
      </div>

      {/* 추가 데이터 로딩 중 표시 */}
      {loading && page > 1 && (
        <div className="flex justify-center w-full py-4">
          <Spinner variant="primary" size="lg" color="danger" />
        </div>
      )}

      {hasMore ? (
        <FaPlusCircle
          className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-8"
          onClick={loadMore}
        />
      ) : (
        <div className="text-gray-500 text-sm mb-8">
          모든 갤러리를 불러왔습니다
        </div>
      )}
    </div>
  );
} 