"use client";
import React, { useState, useEffect } from "react";
import { Card, CardBody, Divider } from "@heroui/react";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";
import Link from "next/link";
import { FaPlusCircle } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function BookmarkedExhibition({ user }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bookmarkedExhibitions, setBookmarkedExhibitions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [displayCount, setDisplayCount] = useState(5); // 한 번에 표시할 개수
  const supabase = createClient();
  // console.log('user22:', user)

  useEffect(() => {
    // 북마크 데이터를 가져오는 함수
    const fetchBookmarkedExhibitions = async () => {
      try {
        setIsLoading(true);
        
        // supabase에서 북마크 데이터 직접 가져오기
        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from('bookmark')
          .select('*')
          .eq('user_id', user.id);
          
        if (bookmarkError) {
          throw new Error('북마크 데이터를 불러오는데 실패했습니다');
        }
        
        // 북마크된 전시회 정보를 불러옴
        const exhibitionsData = await Promise.all(
          bookmarkData
            .filter(bookmark => bookmark.exhibition_id) // exhibition_id가 null이 아닌 항목만 필터링
            .map(async (bookmark) => {
              // supabase에서 전시회 정보 직접 가져오기
              const { data: exhibition, error: exhibitionError } = await supabase
                .from('exhibition')
                .select('*, gallery(*)')
                .eq('id', bookmark.exhibition_id)
                .single();
                
              if (exhibitionError || !exhibition) {
                return null;
              }
              
              return {
                ...exhibition,
                isBookmarked: true
              };
            })
        );
        
        // null 값 제거 후 상태 업데이트
        setBookmarkedExhibitions(exhibitionsData.filter(item => item !== null));
      } catch (error) {
        console.error('북마크 가져오기 오류:', error);
        // 오류 발생 시 빈 배열로 설정
        setBookmarkedExhibitions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookmarkedExhibitions();
  }, []);

  // 더보기 버튼 클릭 시 실행되는 함수
  const loadMoreExhibitions = () => {
    if (displayCount + 5 >= bookmarkedExhibitions.length) {
      setDisplayCount(bookmarkedExhibitions.length);
      setHasMore(false);
    } else {
      setDisplayCount(displayCount + 5);
    }
  };

  // 로딩 중일 때 표시할 컴포넌트
  if (isLoading) {
    return <div className="text-center py-4">북마크 정보를 불러오는 중...</div>;
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 w-full px-2 justify-center">
        <div className="grid gap-4 w-full justify-center items-center">
          {bookmarkedExhibitions.length > 0 ? (
            bookmarkedExhibitions.slice(0, displayCount).map((exhibition, index) => (
              <Card key={index} className="w-full">
                <Link href={`/exhibitions/${exhibition.id}`}>
                  <CardBody className="flex gap-4 flex-row justify-center items-center">
                    <img
                      src={exhibition.photo}
                      alt={exhibition.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col">
                          <div className="text-xs ">{exhibition.name}</div>
                          <div className="text-lg font-bold">
                            {exhibition.contents}
                          </div>
                        </div>
                        
                      </div>

                      <Divider
                        orientation="horizontal"
                        className=" bg-gray-300"
                      />
                      <div className="text-xs flex flex-col my-2">
                        <div className="flex flex-row gap-1">
                          <Image src="/exhibition/미니달력.svg" alt="calendar" width={15} height={15} />
                          {new Date(exhibition.start_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })} ~ {new Date(exhibition.end_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                        <div className="flex flex-row gap-1">
                          <Image src="/exhibition/미니지도.svg" alt="calendar" width={15} height={15} />
                          {exhibition.gallery.address}
                        </div>
                        <div className="flex flex-row gap-1">
                          <Image src="/exhibition/미니가격.png" alt="calendar" width={15} height={15} />
                          {exhibition.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Link>
              </Card>
            ))
          ) : (
            <div className="text-center py-4">북마크한 전시회가 없습니다.</div>
          )}
        </div>
        
        {bookmarkedExhibitions.length > 0 && (
          <div className="flex flex-col items-center my-2">
            {hasMore && displayCount < bookmarkedExhibitions.length ? (
              <FaPlusCircle 
                className="text-gray-500 text-2xl font-bold hover:cursor-pointer" 
                onClick={loadMoreExhibitions}
              />
            ) : displayCount > 0 && !hasMore && bookmarkedExhibitions.length > 5 ? (
              <div className="text-center py-2 text-gray-500">더 이상 표시할 전시회가 없습니다.</div>
            ) : null}
          </div>
        )}


      </div>
    </>
  );
}
