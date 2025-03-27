"use client";
import React, { Suspense } from "react";
import { GalleryCards } from "./components/gallery-cards";
import { Tabs, Tab, Button, Select, SelectItem, Spinner, Checkbox, addToast } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FaPlusCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";

function GalleryListContent() {
  const router = useRouter();
  const searchParams = useSearchParams({ suspense: true });
  const isBookmarkParam = searchParams.get('isBookmark');
  
  const [selectedTab, setSelectedTab] = useState("all");
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [isBookmark, setIsBookmark] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  useEffect(() => {
    if (isBookmarkParam) {
      setIsBookmark(true);
    }
  }, [isBookmarkParam]);

  const supabase = createClient();

  useEffect(() => {
    // 탭이 변경될 때 페이지 초기화
    setPage(1);
    setGalleries([]);
  }, [selectedTab, isBookmark, selectedRegion]);

  useEffect(() => {
    const fetchGalleries = async () => {
      setLoading(true);
      
      try {
        // 북마크 필터가 활성화되어 있지만 사용자가 로그인하지 않은 경우
        if (isBookmark && !user) {
          setGalleries([]);
          setHasMore(false);
          setLoading(false);
          return;
        }
        
        // 북마크 필터가 활성화되어 있지만 북마크 데이터가 아직 로드되지 않은 경우
        if (isBookmark && loadingBookmarks) {
          return; // 북마크 데이터가 로드될 때까지 대기
        }
        
        let query = supabase
          .from("gallery")
          .select("*");
        
        // 선택된 탭에 따라 필터 적용
        if (selectedTab === "now") {
          query = query.eq('isNow', true);
        } else if (selectedTab === "new") {
          query = query.eq('isNew', true);
        }
        // all 탭인 경우 추가 필터링 없음
        
        // 지역 필터 적용
        if (selectedRegion) {
          query = query.ilike('address', `%${selectedRegion}%`);
        }
        
        // 북마크 필터 적용
        if (isBookmark && user) {
          // null이 아닌 유효한 gallery_id만 필터링
          const bookmarkedIds = bookmarks
            .filter(b => b.gallery_id !== null)
            .map(b => b.gallery_id);
          
          if (bookmarkedIds.length === 0) {
            // 북마크가 없거나 모두 null인 경우 빈 결과 반환
            setGalleries([]);
            setHasMore(false);
            setLoading(false);
            return;
          }
          
          query = query.in('id', bookmarkedIds);
        }
        
        const { data, error } = await query
          .range((page - 1) * 5, page * 5 - 1);
        
        if (error) throw error;
        
        if (page === 1) {
          setGalleries(data);
        } else {
          setGalleries((prevGalleries) => [...prevGalleries, ...data]);
        }
        
        setHasMore(data.length === 5);
      } catch (error) {
        console.error("갤러리 데이터를 가져오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGalleries();
  }, [page, selectedTab, selectedRegion, isBookmark, bookmarks, user, loadingBookmarks]);

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    fetchUser();
  }, []);

  // 사용자의 북마크 목록 가져오기
  const fetchBookmarks = async () => {
    if (!user) return;
    
    try {
      setLoadingBookmarks(true);
      
      const { data, error } = await supabase
        .from('bookmark')
        .select('*')
        .eq('user_id', user.id)
        .not('gallery_id', 'is', null);
        
      if (error) throw error;
      
      setBookmarks(data || []);
    } catch (error) {
      console.error('북마크 로드 에러:', error);
    } finally {
      setLoadingBookmarks(false);
    }
  };
  
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
        
        // 북마크 목록에서 제거
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
        
        // 북마크 목록에 추가
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

  // 컴포넌트 마운트 시 북마크 로드
  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Spinner variant="wave" size="lg" color="danger" />
      </div>
    );
  }

  console.log('galleries', galleries)
  console.log('selectedTab', selectedTab)
  console.log('selectedRegion', selectedRegion)
  console.log('isBookmark', isBookmark)

  return (
    <div className="flex flex-col items-center justify-center">
      
      <div className="bg-white flex items-center w-[90vw] justify-between">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => router.back()}
        >
          <FaChevronLeft className="text-xl" />
        </Button>
        <h2 className="text-lg font-bold text-center flex-grow">갤러리</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex justify-between items-center w-[90%] mb-4">
        <Checkbox 
          color="primary" 
          isSelected={isBookmark} 
          onChange={(e)=>setIsBookmark(e.target.checked)}
          size="md"
        >
          북마크
        </Checkbox>
        <Select
          selectedKeys={[selectedRegion]}
          onChange={(e)=>setSelectedRegion(e.target.value)}
          className="w-1/3"
          placeholder="지역"
        >
          <SelectItem key="서울" value="서울">서울</SelectItem>
          <SelectItem key="인천" value="인천">인천</SelectItem>
          <SelectItem key="경기" value="경기">경기</SelectItem>
          <SelectItem key="충청" value="충청">충청</SelectItem>
          <SelectItem key="경상" value="경상">경상</SelectItem>
          <SelectItem key="전라" value="전라">전라</SelectItem>
          <SelectItem key="강원" value="강원">강원</SelectItem>
          <SelectItem key="제주" value="제주">제주</SelectItem>
        </Select>
      </div>
      <Tabs
        aria-label="Exhibition options"
        variant="underlined"
        className="w-full flex justify-center items-center"
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
      >
        <Tab
          key="all"
          title="전체"
          className="w-full justify-center items-center"
        >
          <GalleryCards 
            galleries={galleries} 
            user={user} 
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            isBookmarked={isBookmarked}
          />
          {hasMore ? (
            <div className="flex justify-center items-center my-4">
              <FaPlusCircle 
                className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-4" 
                onClick={loadMore}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-500 mb-4">모든 갤러리를 불러왔습니다</p>
            </div>
          )}
        </Tab>
        <Tab
          key="now"
          title="전시중"
          className="w-full justify-center items-center"
        >
          <GalleryCards 
            galleries={galleries} 
            user={user} 
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            isBookmarked={isBookmarked}
          />
          {hasMore ? (
            <div className="flex justify-center items-center my-4">
              <FaPlusCircle 
                className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-4" 
                onClick={loadMore}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-500 mb-4">모든 갤러리를 불러왔습니다</p>
            </div>
          )}
        </Tab>
        <Tab
          key="new"
          title="신규"
          className="w-full justify-center items-center"
        >
          <GalleryCards 
            galleries={galleries} 
            user={user} 
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            isBookmarked={isBookmarked}
          />
          {hasMore ? (
            <div className="flex justify-center items-center my-4">
              <FaPlusCircle 
                className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-4" 
                onClick={loadMore}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-500 mb-4">모든 갤러리를 불러왔습니다</p>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className="w-full flex justify-center items-center h-[90vh]">
      <Spinner variant="wave" color="danger" />
    </div>
  );
}

export default function GalleryList() {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <GalleryListContent />
    </Suspense>
  );
}
