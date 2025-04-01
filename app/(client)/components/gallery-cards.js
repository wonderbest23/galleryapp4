"use client";
import { Card, CardBody, Divider, Skeleton, Spinner } from "@heroui/react";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";
import Link from "next/link";
import { FaPlusCircle } from "react-icons/fa";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import useBookmarkStore from "./bookmarkStore";
import { addToast } from "@heroui/react";

export default function GalleryCards({ selectedTab, user }) {
  const [gallerys, setGallerys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 5;
  const supabase = createClient();

  // Zustand 북마크 스토어에서 상태와 함수 가져오기
  const { bookmarks, setBookmarks } = useBookmarkStore();
  
  // 북마크 상태 확인하는 함수
  const isBookmarked = (galleryId) => {
    return bookmarks.some(bookmark => bookmark.gallery_id === galleryId);
  };
  
  // 북마크 토글 함수
  const toggleBookmark = async (e, gallery) => {
    e.preventDefault(); // 링크 이벤트 방지
    e.stopPropagation(); // 이벤트 버블링 방지
    
    if (!user) {
      // 사용자가 로그인하지 않은 경우 처리
      alert('북마크를 추가하려면 로그인이 필요합니다.');
      return;
    }
    
    const isCurrentlyBookmarked = isBookmarked(gallery.id);
    
    try {
      if (isCurrentlyBookmarked) {
        // 북마크 삭제
        const { error } = await supabase
          .from('bookmark')
          .delete()
          .eq('user_id', user.id)
          .eq('gallery_id', gallery.id);
          
        if (error) throw error;
        
        // Zustand 스토어에서 북마크 제거
        setBookmarks(bookmarks.filter(bookmark => bookmark.gallery_id !== gallery.id));
        
        // 북마크 삭제 토스트 표시
        addToast({
          title: "북마크 삭제",
          description: `${gallery.name} 북마크가 삭제되었습니다.`,
          color: "danger",
        });
      } else {
        // 북마크 추가
        const { data, error } = await supabase
          .from('bookmark')
          .insert({
            user_id: user.id,
            gallery_id: gallery.id,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (error) throw error;
        
        // Zustand 스토어에 북마크 추가
        setBookmarks([...bookmarks, data[0]]);
        
        // 북마크 추가 토스트 표시
        addToast({
          title: "북마크 추가",
          description: `${gallery.name} 북마크에 추가되었습니다.`,
          color: "success",
        });
      }
    } catch (error) {
      console.error('북마크 토글 에러:', error);
      
      // 에러 토스트 표시
      addToast({
        title: "오류 발생",
        description: "북마크 처리 중 오류가 발생했습니다.",
        color: "danger",
        variant: "solid",
        timeout: 3000
      });
    }
  };
  
  // 사용자의 북마크 목록 가져오기
  const fetchBookmarks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('bookmark')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // 북마크 데이터를 Zustand 스토어에 저장
      setBookmarks(data || []);
    } catch (error) {
      console.error('북마크 로드 에러:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 컴포넌트 마운트 시 북마크 로드
  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const getGallerys = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        setLoading(true);

        // 페이지네이션을 위한 범위 계산
        const from = (pageNum - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // 기본 쿼리 시작
        let query = supabase.from("gallery").select("*", { count: "exact" });

        // selectedTab에 따라 쿼리 조건 추가
        if (selectedTab === "recommended") {
          query = query.eq("isRecommended", true);
        } else if (selectedTab === "new") {
          query = query.eq("isNew", true);
        } else if (selectedTab === "now") {
          query = query.eq("isNow", true);
        }

        // 페이지네이션 적용
        const { data, error, count } = await query.range(from, to);

        if (error) {
          console.log(
            "갤러리 데이터를 불러오는 중 오류가 발생했습니다:",
            error
          );
          return;
        }

        // 더 불러올 데이터가 있는지 확인
        setHasMore(count > from + data.length);

        // 데이터 설정 (추가 또는 덮어쓰기)
        if (append) {
          setGallerys((prev) => [...prev, ...(data || [])]);
        } else {
          setGallerys(data || []);
        }
      } finally {
        setLoading(false);
      }
    },
    [selectedTab, supabase, PAGE_SIZE]
  );

  // 더 많은 데이터 로드하는 함수
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    getGallerys(nextPage, true);
  }, [loading, hasMore, page, getGallerys]);

  useEffect(() => {
    // 탭이 변경되면 페이지를 1로 리셋하고 데이터를 다시 불러옵니다
    setPage(1);
    getGallerys(1);
  }, [getGallerys]);

  // 실제 데이터가 없을 경우 대비 기본 데이터 (실제 데이터가 있으면 사용하지 않음)
  const defaultExhibitions = Array(5).fill({
    title: "수원 갤러리",
    subtitle: "전국 최대 규모 갤러리",
    date: "2024.03.15 - 2024.04.15",
    location: "서울 강남구",
    review: "4.0(225)",
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full justify-center">
      <div className="grid gap-4 w-full max-w-[900px] mx-auto justify-items-center">
        {loading && page === 1
          ? // 처음 로딩 중 스켈레톤 UI 표시
            Array(PAGE_SIZE)
              .fill()
              .map((_, index) => (
                <div
                  key={index}
                  className="w-full max-w-[600px] flex items-center gap-3 justify-center mx-auto"
                >
                  <div>
                    <Skeleton className="flex rounded-full w-12 h-12" />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-3 w-36 rounded-lg" />
                    <Skeleton className="h-3 w-24 rounded-lg" />
                  </div>
                </div>
              ))
          : // 데이터 로드 완료 후 실제 갤러리 목록 표시
            gallerys.map((gallery, index) => (
              <Card key={index} className="w-full max-w-[600px] mx-auto">
                <Link
                  href={`/gallery/${gallery.id || index + 1}`}
                  className="w-full"
                >
                  <CardBody className="flex gap-4 flex-row w-full h-full">
                    <img
                      src={gallery.thumbnail || "/images/noimage.jpg"}
                      alt={gallery.name || "갤러리 이미지"}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col">
                          <div className="text-lg font-bold">
                            {gallery.name || ""}
                          </div>
                        </div>
                        <div onClick={(e) => toggleBookmark(e, gallery)}>
                          {isBookmarked(gallery.id) ? (
                            <FaBookmark className="text-red-500 text-medium cursor-pointer" />
                          ) : (
                            <FaRegBookmark className="text-gray-500 text-medium cursor-pointer" />
                          )}
                        </div>
                      </div>

                      <Divider
                        orientation="horizontal"
                        className=" bg-gray-300"
                      />
                      <div className="text-xs flex flex-col my-2">
                        <div className="flex flex-row gap-1">
                          <IoMdPin />
                          {gallery.address || "서울 강남구"}
                        </div>
                        <div className="flex flex-row gap-1">
                          <FaRegStar />
                          {gallery.visitor_rating || "없음"}(
                          {gallery.blog_review_count || "없음"})
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Link>
              </Card>
            ))}

        {/* 추가 데이터 로딩 중 표시 */}
        {loading && page > 1 && (
          <div className="flex justify-center w-full py-4">
            <Spinner variant="wave" size="lg" color="danger" />
          </div>
        )}
      </div>

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
