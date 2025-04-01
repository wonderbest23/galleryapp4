"use client";
import React, { useState, useEffect } from "react";
import { Card, CardBody, Divider } from "@heroui/react";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

export default function Reviews({ user }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [displayCount, setDisplayCount] = useState(5); // 한 번에 표시할 개수
  const supabase = createClient();
  // console.log("user22:", user);

  useEffect(() => {
    // 유저의 리뷰 데이터를 가져오는 함수
    const fetchUserReviews = async () => {
      try {
        setIsLoading(true);

        // supabase에서 exhibition_review 데이터 직접 가져오기
        const { data: reviewData, error: reviewError } = await supabase
          .from("exhibition_review")
          .select("*,exhibition_id(*)")
          .eq("user_id", user.id);

        if (reviewError) {
          throw new Error("리뷰 데이터를 불러오는데 실패했습니다");
        }

        setReviews(reviewData || []);
      } catch (error) {
        console.error("리뷰 가져오기 오류:", error);
        // 오류 발생 시 빈 배열로 설정
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserReviews();
  }, [user.id]);

  // 더보기 버튼 클릭 시 실행되는 함수
  const loadMoreReviews = () => {
    if (displayCount + 5 >= reviews.length) {
      setDisplayCount(reviews.length);
      setHasMore(false);
    } else {
      setDisplayCount(displayCount + 5);
    }
  };

  // 로딩 중일 때 표시할 컴포넌트
  if (isLoading) {
    return <div className="text-center py-4">리뷰 정보를 불러오는 중...</div>;
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4 w-full px-2">
        <div className="flex flex-col gap-4 w-full justify-center items-center">
          {reviews.length > 0 ? (
            reviews.slice(0, displayCount).map((review, index) => (
              <Card key={index} className="w-full" fullWidth>
                <CardBody className="flex gap-4 flex-row w-full">
                  <div className="flex flex-row w-full justify-between items-center gap-x-4">
                    <img src={review.exhibition_id.photo} alt="" className="w-12 h-12 rounded-full"/>
                    <div className="flex flex-col w-full">
                      <div className="flex flex-row justify-between items-start">
                        <div className="flex flex-col">
                          <div className="text-sm font-bold">
                            전시회명:{review.exhibition_id.contents}
                          </div>
                          <div className="text-xs flex items-center gap-1">
                            평점: 
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>
                                {i < review.rating ? (
                                  <span className="text-yellow-400">★</span>
                                ) : (
                                  <span className="text-gray-300">★</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <Divider
                        orientation="horizontal"
                        className=" bg-gray-300"
                      />
                      <div className="text-xs flex flex-col ">
                        리뷰내용:{review.description}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))
          ) : (
            <div className="text-center py-4">작성한 리뷰가 없습니다.</div>
          )}
        </div>

        {reviews.length > 0 && (
          <div className="flex flex-col items-center mt-4 ">
            {hasMore && displayCount < reviews.length ? (
              <FaPlusCircle
                className="text-red-500 text-2xl font-bold hover:cursor-pointer"
                onClick={loadMoreReviews}
              />
            ) : displayCount > 0 && !hasMore && reviews.length > 5 ? (
              <div className="text-center py-2 text-gray-500">
                더 이상 표시할 리뷰가 없습니다.
              </div>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
