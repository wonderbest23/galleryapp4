"use client";
import React from "react";
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Button,
  Badge,
  Spinner,
  addToast,
  ToastProvider
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { useParams } from "next/navigation";
import { FiMapPin } from "react-icons/fi";
import { LuClock4 } from "react-icons/lu";
import { createClient } from "@/utils/supabase/client";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { HiOutlineCurrencyDollar } from "react-icons/hi2";
import CardReview from "./components/card-review";

export default function App() {
  const { id } = useParams();
  const [selected, setSelected] = useState("home");
  const router = useRouter();
  const [exhibition, setExhibition] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gallery, setGallery] = useState(null);
  const [notice, setNotice] = useState(null);
  const [displayedNoticeCount, setDisplayedNoticeCount] = useState(3);
  const [reviews, setReviews] = useState([]);
  const [displayedReviewCount, setDisplayedReviewCount] = useState(3);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const { data: noticeData, error: noticeError } = await supabase
          .from("gallery_notification")
          .select("*")
          .eq("naver_gallery_url", exhibition?.gallery?.url)
          .order("created_at", { ascending: false });
        console.log("noticeData:", noticeData);
        if (noticeError) {
          console.error("공지사항을 가져오는 중 오류 발생:", noticeError);
          return;
        }

        setNotice(noticeData);
      } catch (error) {
        console.error("공지사항을 가져오는 중 오류 발생:", error);
      }
    };

    fetchNotice();
  }, [exhibition]);

  console.log("exhibition:", exhibition);
  console.log("notice:", notice);

  useEffect(() => {
    const fetchExhibition = async () => {
      try {
        // 전시회 정보 가져오기
        const { data: exhibitionData, error: exhibitionError } = await supabase
          .from("exhibition")
          .select(
            `
            *,
            gallery:naver_gallery_url(*)
          `
          )
          .eq("id", id)
          .single();

        if (exhibitionError) {
          console.error(
            "전시회 정보를 가져오는 중 오류 발생:",
            exhibitionError
          );
          return;
        }

        // 리뷰 관련 필드가 없는 경우를 대비해 기본값 설정
        const enhancedData = {
          ...exhibitionData,
          review_count: exhibitionData.review_count || 0,
          review_average: exhibitionData.review_average || 0,
          review_5_count: exhibitionData.review_5_count || 0,
          review_4_count: exhibitionData.review_4_count || 0,
          review_3_count: exhibitionData.review_3_count || 0,
          review_2_count: exhibitionData.review_2_count || 0,
          review_1_count: exhibitionData.review_1_count || 0,
        };

        setExhibition(enhancedData);
        setGallery(exhibitionData.name);
        setIsLoading(false);
      } catch (error) {
        console.error("데이터를 가져오는 중 오류 발생:", error);
        setIsLoading(false);
      }
    };

    fetchExhibition();
    fetchBookmarkStatus();
  }, [id, supabase]);

  // 북마크 상태 확인 함수 추가
  const fetchBookmarkStatus = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (user && user.user) {
        const { data: bookmarks, error } = await supabase
          .from('bookmark')
          .select('*')
          .eq('user_id', user.user.id)
          .eq('exhibition_id', id);
        
        if (error) {
          console.error('북마크 정보를 가져오는 중 오류 발생:', error);
          return;
        }
        
        setIsBookmarked(bookmarks && bookmarks.length > 0);
      }
    } catch (error) {
      console.error('북마크 상태 확인 중 오류 발생:', error);
    }
  };

  // 북마크 토글 함수 추가
  const toggleBookmark = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user || !user.user) {
        // 로그인이 필요한 경우 처리
        alert('북마크를 위해 로그인이 필요합니다.');
        return;
      }
      
      if (isBookmarked) {
        // 북마크 삭제
        const { error } = await supabase
          .from('bookmark')
          .delete()
          .eq('user_id', user.user.id)
          .eq('exhibition_id', id);
          
        if (error) throw error;
        
        // 북마크 해제 토스트 메시지
        addToast({
          title: "북마크 해제",
          description: "북마크가 해제되었습니다.",
          color: "primary",
          
        });
      } else {
        // 북마크 추가
        const { error } = await supabase
          .from('bookmark')
          .insert({
            user_id: user.user.id,
            exhibition_id: id,
            created_at: new Date().toISOString()
          });
          
        if (error) throw error;
        
        // 북마크 추가 토스트 메시지
        addToast({
          title: "북마크 설정",
          description: "북마크가 설정되었습니다.",
          color: "success",
          
        });
      }
      
      // 북마크 상태 변경
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('북마크 토글 중 오류 발생:', error);
      
      // 에러 발생 시 토스트 메시지
      addToast({
        title: "오류 발생",
        description: "북마크 처리 중 오류가 발생했습니다.",
        color: "danger",
        icon: <Icon icon="mdi:alert-circle" />,
      });
    }
  };

  // 더 보기 버튼 클릭 핸들러
  const handleLoadMoreNotices = () => {
    setDisplayedNoticeCount((prev) => prev + 3);
  };

  // 리뷰 더 보기 버튼 클릭 핸들러
  const handleLoadMoreReviews = () => {
    setDisplayedReviewCount((prev) => prev + 3);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data: reviewData, error: reviewError } = await supabase
          .from("exhibition_review")
          .select("*")
          .eq("exhibition_id", id);

        if (reviewError) {
          console.error("리뷰를 가져오는 중 오류 발생:", reviewError);
          return;
        }

        setReviews(reviewData);
      } catch (error) {
        console.error("리뷰를 가져오는 중 오류 발생:", error);
      }
    };

    fetchReviews();
  }, [id]);

  return (
    <>
      {isLoading ? (
        <Spinner
          variant="wave"
          color="danger"
          className="w-full h-screen flex justify-center items-center"
        />
      ) : (
        <div className="max-w-md mx-auto bg-white min-h-screen">
          {/* 상단 네비게이션 바 */}
          <div className="bg-white flex items-center">
            <Button
              isIconOnly
              variant="light"
              className="mr-2"
              onPress={() => router.back()}
            >
              <FaChevronLeft className="text-xl" />
            </Button>
            <h2 className="text-lg font-medium"></h2>
          </div>

          {/* Hero Image Section */}
          <div className="relative w-full h-64">
            <img
              src={exhibition?.photo}
              alt="Restaurant"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button isIconOnly variant="flat" className="bg-white/80" onPress={toggleBookmark}>
                <Icon 
                  icon={isBookmarked ? "mdi:bookmark" : "mdi:bookmark-outline"} 
                  className="text-xl text-red-500" 
                />
              </Button>
              
            </div>
          </div>

          {/* Restaurant Info */}
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm text-gray-500">{gallery?.name}</h3>
                <h1 className="text-2xl font-bold">{exhibition?.contents}</h1>
                {/* <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Icon icon="lucide:star" className="text-yellow-400" />
                  <span className="ml-1">4.5</span>
                  <span className="text-gray-500">(91)</span>
                </div>
              </div> */}
                <div className="flex items-center gap-1 mt-1">
                  <div className="flex items-center">
                    <Icon icon="lucide:star" className="text-yellow-400" />
                    <span className="ml-1">
                      {exhibition?.review_average?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-gray-500">
                      ({exhibition?.review_count || 0})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-lg text-gray-500" />
                <span>{exhibition?.name?.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <LuClock4 className="text-lg text-gray-500" />
                <span>{exhibition?.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoMdInformationCircleOutline className="text-lg text-gray-500" />
                <span>{exhibition?.working_hour}</span>
              </div>
              <div className="flex items-center gap-2">
                <HiOutlineCurrencyDollar className="text-lg text-gray-500" />
                <span>{exhibition?.price}</span>
              </div>
            </div>

            <Button
              target="_blank"
              onPress={() => router.push(exhibition?.homepage_url)}
              className="w-full mt-4"
              color="primary"
              size="lg"
            >
              사이트연결
            </Button>
          </div>

          {/* Tabs Section */}
          <div className="mt-4 pb-16">
            <Tabs
              aria-label="Options"
              selectedKey={selected}
              onSelectionChange={setSelected}
              variant="underlined"
              fullWidth
            >
              <Tab key="home" title="홈">
                <Card className="my-4 mx-2">
                  <CardBody>
                    <h3 className="text-lg font-bold mb-2">전시회 안내</h3>
                    <p>{exhibition?.add_info}</p>
                  </CardBody>
                </Card>
              </Tab>
              <Tab key="gallery" title="전시회 공지">
                {notice &&
                  notice.slice(0, displayedNoticeCount).map((item, i) => (
                    <Card key={item.id || i} className="my-4 mx-2">
                      <CardBody>
                        <h3 className="text-lg font-bold">
                          {item.title || `공지사항 ${i + 1}`}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                        <p className="mt-2">
                          {item.content ||
                            "전시회 관람 시간 안내 및 주의사항입니다."}
                        </p>
                      </CardBody>
                    </Card>
                  ))}
                {notice && notice.length > displayedNoticeCount && (
                  <div className="flex justify-center items-center my-4">
                    <Button
                      isIconOnly
                      variant="light"
                      onPress={handleLoadMoreNotices}
                      className="hover:cursor-pointer"
                    >
                      <FaPlusCircle className="text-red-500 text-2xl font-bold" />
                    </Button>
                  </div>
                )}
              </Tab>
              <Tab key="reviews" title="리뷰">
                <Card className="my-4 mx-2">
                  <CardBody>
                    <div className="flex flex-col items-center gap-4">
                      <h3 className="text-lg font-bold mb-2">전시회 리뷰</h3>
                      <div className="flex items-center justify-center mb-2">
                        <div className="flex text-yellow-400 items-center">
                          {exhibition?.review_average &&
                            [...Array(5)].map((_, i) => (
                              <Icon
                                key={i}
                                icon="lucide:star"
                                className={`w-8 h-8 ${i < Math.floor(exhibition.review_average) ? "text-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold">
                          {exhibition?.review_average?.toFixed(1) || "0.0"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {exhibition?.review_count || 0}개의 리뷰
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
                <div className="flex flex-col items-center gap-2 mx-2">
                  {reviews.slice(0, displayedReviewCount).map((review, index) => (
                    <CardReview
                      key={index}
                      content={review.description}
                      createdAt={review.created_at}
                      rating={review.rating}
                      title={review.title}
                      user={{
                        name: review.name,
                        avatar:
                          "https://i.pravatar.cc/150?u=a04258114e29026708c",
                      }}
                    />
                  ))}
                </div>
                {reviews.length === 0 && (
                  <div className="flex justify-center items-center my-4">
                    <p className="text-gray-500">리뷰가 없습니다.</p>
                  </div>
                )}

                <div className="flex justify-center items-center my-4">
                  {reviews.length > displayedReviewCount ? (
                    <Button
                      isIconOnly
                      variant="light"
                      onPress={handleLoadMoreReviews}
                      className="hover:cursor-pointer"
                    >
                      <FaPlusCircle className="text-red-500 text-2xl font-bold" />
                    </Button>
                  ) : reviews.length > 0 && reviews.length <= displayedReviewCount ? (
                    <p className="text-gray-500">더 이상 리뷰가 없습니다.</p>
                  ) : null}
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      )}
    </>
  );
}
