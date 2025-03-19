"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardBody, Divider, Skeleton,Spinner } from "@heroui/react";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import Link from "next/link";
import { FaPlusCircle } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";

export function ExhibitionCards({ exhibitionCategory }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 5;

  const supabase = createClient();

  const getExhibitions = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      
      // 페이지네이션을 위한 범위 계산
      const from = (pageNum - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      // 기본 쿼리 시작
      let query = supabase
        .from("exhibition")
        .select("*", { count: 'exact' });
      
      // exhibitionCategory에 따라 필터 적용
      if (exhibitionCategory === 'free') {
        query = query.eq('isFree', true);
      } else if (exhibitionCategory === 'recommended') {
        query = query.eq('isRecommend', true);
      }
      // 'all'인 경우는 추가 필터 없음
      
      // 페이지네이션 적용
      const { data, error, count } = await query.range(from, to);
        
      if (error) {
        console.error("Error fetching exhibitions:", error);
        return;
      }
      
      // 더 불러올 데이터가 있는지 확인
      setHasMore(count > from + data.length);
      
      // 데이터 설정 (추가 또는 덮어쓰기)
      if (append) {
        setExhibitions(prev => [...prev, ...(data || [])]);
      } else {
        setExhibitions(data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [exhibitionCategory, supabase, PAGE_SIZE]);

  // 더 많은 데이터 로드하는 함수
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    getExhibitions(nextPage, true);
  }, [loading, hasMore, page, getExhibitions]);

  useEffect(() => {
    // 카테고리가 변경되면 페이지를 1로 리셋하고 데이터를 다시 불러옵니다
    setPage(1);
    getExhibitions(1);
  }, [getExhibitions]);

  return (
    <>
      <div className="flex flex-col items-center gap-4 w-full justify-center">
        <div className="grid gap-4 w-full max-w-[900px] mx-auto justify-items-center">
          {loading && page === 1
            ? // 처음 로딩 중 스켈레톤 UI 표시
              Array(5)
                .fill()
                .map((_, index) => (
                  <div key={index} className="w-full max-w-[600px] flex items-center gap-3 justify-center mx-auto">
                    <div>
                      <Skeleton className="flex rounded-full w-12 h-12" />
                    </div>
                    <div className="w-full flex flex-col gap-2">
                      <Skeleton className="h-3 w-36 rounded-lg" />
                      <Skeleton className="h-3 w-24 rounded-lg" />
                    </div>
                  </div>
                ))
            : // 데이터 로드 완료 후 실제 전시회 목록 표시
              exhibitions.map((exhibition, index) => (
                <Card key={index} className="w-full max-w-[600px] mx-auto">
                  <Link href={`/exhibition/${index + 1}`} className="w-full">
                    <CardBody className="flex gap-4 flex-row w-full h-full">
                      <div className="flex w-1/2 aspect-square overflow-hidden rounded justify-center items-center">
                        <img
                          src={exhibition.photo || "/images/noimage.jpg"}
                          alt={exhibition.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col w-full justify-center items-center h-auto">
                        <div className="flex flex-row justify-between items-start w-full">
                          <div className="flex flex-col">
                            <div className="text-xs ">{exhibition.name}</div>
                            <div className="text-medium font-bold">
                              {exhibition.contents}
                            </div>
                          </div>
                          <div>
                            <FaRegBookmark className="text-gray-500 text-medium" />
                          </div>
                        </div>

                        <Divider
                          orientation="horizontal"
                          className=" bg-gray-300"
                        />
                        <div className="text-xs flex flex-col my-2 w-full">
                          <div className="flex flex-row gap-1">
                            <FaRegCalendar />
                            {exhibition.date}
                          </div>
                          {/* <div className="flex flex-row gap-1">
                            <IoMdPin />
                            {exhibition.location}
                          </div>
                          <div className="flex flex-row gap-1">
                            <FaRegStar />
                            {exhibition.review}
                          </div> */}
                        </div>
                      </div>
                    </CardBody>
                  </Link>
                </Card>
              ))}
              
          {/* 추가 데이터 로딩 중 표시 */}
          {loading && page > 1 && (
            <div className="flex justify-center w-full py-4">
              {/* <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div> */}
              <Spinner variant="wave" size="lg" color='danger' />
            </div>
          )}
        </div>
        {/* <div className="flex gap-2 mt-4">
          {exhibitions.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentIndex === index ? "bg-red-500" : "bg-gray-300"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div> */}
        {/* <button
          className="mt-4 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          onClick={() => console.log("플러스 버튼 클릭")}
        >
          +
        </button> */}
        {hasMore ? (
          <FaPlusCircle 
            className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-8"
            onClick={loadMore}
          />
        ) : (
          <div className="text-gray-500 text-sm mb-8">모든 전시회를 불러왔습니다</div>
        )}
      </div>
    </>
  );
}
