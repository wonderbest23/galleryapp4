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
  ToastProvider,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";
import { FaPlusCircle } from "react-icons/fa";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { FiMapPin } from "react-icons/fi";
import { LuClock4 } from "react-icons/lu";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { FaArrowLeft } from "react-icons/fa";
import { LuSend } from "react-icons/lu";
import { Divider } from "@heroui/react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { LuWallet } from "react-icons/lu";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";

// 리뷰 컴포넌트 추가
const Review = React.forwardRef(
  ({ review, createdAt, gallery, ...props }, ref) => (
    <Card ref={ref} {...props} className="px-4 pt-4 pb-2">
      <div className="flex flex-col">
        <div className="flex flex-row items-center gap-2 mb-2">
          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
            {gallery?.thumbnail ? (
              <img
                src={gallery?.thumbnail}
                alt="Gallery Thumbnail"
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon icon="mdi:image" className="text-2xl text-gray-400" />
            )}
          </div>
          <div className="flex flex-col w-full ml-4">
            <p className="text-[13px] font-bold">{gallery?.name}</p>
            <p className="text-[12px] text-default-400">
              {review.name || "익명"}님의 실제 방문 리뷰
            </p>
            <p className="text-[12px] text-default-400 text-end">
              {new Date(createdAt)
                .toLocaleDateString("ko-KR")
                .replace(/\./g, "년")
                .slice(0, -1) + "일"}
            </p>
          </div>
        </div>

        {/* 리뷰 내용 */}
        <div className="w-full">
          <p className="text-default-500">{review.description}</p>
        </div>

        {/* 별점 */}
        <div className="flex items-center gap-1 mb-3 justify-end">
          {Array.from({ length: 5 }, (_, i) => {
            const isSelected = i + 1 <= review.rating;

            return (
              <Icon
                key={i}
                className={cn(
                  "text-lg",
                  isSelected ? "text-blue-500" : "text-default-200"
                )}
                icon="solar:star-bold"
              />
            );
          })}
        </div>
      </div>
    </Card>
  )
);

Review.displayName = "Review";

export default function App() {
  const [selected, setSelected] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    gallery: false,
    bookmark: false,
    notifications: false,
    reviews: false,
  });
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClient();

  // 캐러셀 관련 상태 추가
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  // 마우스 드래그 관련 상태 추가
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // 임시 이미지 배열
  const demoImages = [
    "https://picsum.photos/800/400?random=1",
    "https://picsum.photos/800/400?random=2",
    "https://picsum.photos/800/400?random=3",
    "https://picsum.photos/800/400?random=4",
  ];

  const [gallery, setGallery] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationPage, setNotificationPage] = useState(1);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  const notificationsPerPage = 3;

  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const reviewsPerPage = 3;
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    count: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStars: 0,
  });

  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.log("Error fetching gallery:", error);
        } else {
          setGallery(data);
        }
        setDataLoaded((prev) => ({ ...prev, gallery: true }));
      } catch (error) {
        console.log("갤러리 불러오기 중 오류 발생:", error);
        setDataLoaded((prev) => ({ ...prev, gallery: true }));
      }
    };
    fetchGallery();
  }, [id]);

  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();

        if (user && user.user) {
          const { data: bookmarks, error } = await supabase
            .from("bookmark")
            .select("*")
            .eq("user_id", user.user.id)
            .eq("gallery_id", id);

          if (error) {
            console.log("북마크 정보를 가져오는 중 오류 발생:", error);
          } else {
            setIsBookmarked(bookmarks && bookmarks.length > 0);
          }
        }
        setDataLoaded((prev) => ({ ...prev, bookmark: true }));
      } catch (error) {
        console.log("북마크 상태 확인 중 오류 발생:", error);
        setDataLoaded((prev) => ({ ...prev, bookmark: true }));
      }
    };
    fetchBookmarkStatus();
  }, [id]);

  useEffect(() => {
    const initialFetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery_notification")
          .select("*")
          .eq("gallery_id", id)
          .order("created_at", { ascending: false })
          .range(0, notificationsPerPage - 1);

        if (error) {
          console.log("알림 불러오기 오류:", error);
        } else {
          if (data.length < notificationsPerPage) {
            setHasMoreNotifications(false);
          }
          setNotifications(data);
        }
        setDataLoaded((prev) => ({ ...prev, notifications: true }));
      } catch (error) {
        console.log("알림 불러오기 중 오류 발생:", error);
        setDataLoaded((prev) => ({ ...prev, notifications: true }));
      }
    };
    initialFetchNotifications();
  }, [id]);

  useEffect(() => {
    const initialFetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery_review")
          .select("*")
          .eq("gallery_id", id)
          .order("created_at", { ascending: false })
          .range(0, reviewsPerPage - 1);

        if (error) {
          console.log("리뷰 불러오기 오류:", error);
        } else {
          if (data.length < reviewsPerPage) {
            setHasMoreReviews(false);
          }
          setReviews(data);
        }

        // 리뷰 통계 계산
        await calculateReviewStats();
        setDataLoaded((prev) => ({ ...prev, reviews: true }));
      } catch (error) {
        console.log("리뷰 불러오기 중 오류 발생:", error);
        setDataLoaded((prev) => ({ ...prev, reviews: true }));
      }
    };
    initialFetchReviews();
  }, [id]);

  // 모든 데이터가 로드되었는지 확인하는 useEffect
  useEffect(() => {
    if (
      dataLoaded.gallery &&
      dataLoaded.bookmark &&
      dataLoaded.notifications &&
      dataLoaded.reviews
    ) {
      setIsLoading(false);
    }
  }, [dataLoaded]);

  const calculateReviewStats = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_review")
        .select("rating")
        .eq("gallery_id", id);

      if (error) {
        console.log("리뷰 통계 불러오기 오류:", error);
        return;
      }

      if (data.length === 0) return;

      const count = data.length;
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / count;

      const fiveStars = data.filter((review) => review.rating === 5).length;
      const fourStars = data.filter((review) => review.rating === 4).length;
      const threeStars = data.filter((review) => review.rating === 3).length;
      const twoStars = data.filter((review) => review.rating === 2).length;
      const oneStars = data.filter((review) => review.rating === 1).length;

      setReviewStats({
        average,
        count,
        fiveStars,
        fourStars,
        threeStars,
        twoStars,
        oneStars,
      });
    } catch (error) {
      console.log("리뷰 통계 계산 중 오류 발생:", error);
    }
  };

  const loadMoreNotifications = async () => {
    try {
      const nextPage = notificationPage + 1;
      const start = (nextPage - 1) * notificationsPerPage;
      const end = start + notificationsPerPage - 1;

      const { data, error } = await supabase
        .from("gallery_notification")
        .select("*")
        .eq("gallery_id", id)
        .order("created_at", { ascending: false })
        .range(start, end);

      if (error) {
        console.log("추가 알림 불러오기 오류:", error);
        return;
      }

      if (data.length < notificationsPerPage) {
        setHasMoreNotifications(false);
      }

      setNotifications((prev) => [...prev, ...data]);
      setNotificationPage(nextPage);
    } catch (error) {
      console.log("추가 알림 불러오기 중 오류 발생:", error);
    }
  };

  const loadMoreReviews = async () => {
    try {
      const nextPage = reviewPage + 1;
      const start = (nextPage - 1) * reviewsPerPage;
      const end = start + reviewsPerPage - 1;

      const { data, error } = await supabase
        .from("gallery_review")
        .select("*")
        .eq("gallery_id", id)
        .order("created_at", { ascending: false })
        .range(start, end);

      if (error) {
        console.log("추가 리뷰 불러오기 오류:", error);
        return;
      }

      if (data.length < reviewsPerPage) {
        setHasMoreReviews(false);
      }

      setReviews((prev) => [...prev, ...data]);
      setReviewPage(nextPage);
    } catch (error) {
      console.log("추가 리뷰 불러오기 중 오류 발생:", error);
    }
  };

  // 자동 슬라이딩을 위한 타이머 설정
  useEffect(() => {
    let intervalId;
    
    if (demoImages.length > 0 && !isPaused) {
      intervalId = setInterval(() => {
        setCurrentSlide((prev) => (prev === demoImages.length - 1 ? 0 : prev + 1));
      }, 3000); // 3초마다 슬라이드 변경
    }
    
    // 컴포넌트가 언마운트되거나 의존성이 변경될 때 타이머 정리
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [demoImages.length, isPaused]);

  // 터치 이벤트 핸들러
  const handleTouchStart = (e) => {
    setIsPaused(true); // 터치 시작할 때 자동 슬라이딩 일시 중지
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // 왼쪽으로 스와이프
      setCurrentSlide((prev) => (prev === demoImages.length - 1 ? 0 : prev + 1));
    }

    if (touchStart - touchEnd < -75) {
      // 오른쪽으로 스와이프
      setCurrentSlide((prev) => (prev === 0 ? demoImages.length - 1 : prev - 1));
    }
    
    // 터치 끝난 후 3초 후에 자동 슬라이딩 재개
    setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  // 마우스 드래그 이벤트 핸들러
  const handleMouseDown = (e) => {
    setIsPaused(true); // 마우스 드래그 시작할 때 자동 슬라이딩 일시 중지
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault(); // 드래그 중 텍스트 선택 방지
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    
    const dragDistance = e.clientX - dragStartX;
    
    if (dragDistance > 75) {
      // 오른쪽으로 드래그
      setCurrentSlide((prev) => (prev === 0 ? demoImages.length - 1 : prev - 1));
    } else if (dragDistance < -75) {
      // 왼쪽으로 드래그
      setCurrentSlide((prev) => (prev === demoImages.length - 1 ? 0 : prev + 1));
    }
    
    setIsDragging(false);
    
    // 마우스 드래그 끝난 후 3초 후에 자동 슬라이딩 재개
    setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  // 마우스 오버 시 자동 슬라이딩 일시 중지
  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  // 마우스 아웃 시 자동 슬라이딩 재개
  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  // 캐러셀 이동 함수
  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsPaused(true);
    
    // 선택 후 3초 후에 자동 슬라이딩 재개
    setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  console.log("gallery:", gallery);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {isLoading ? (
        <Spinner
          variant="wave"
          color="primary"
          className="w-full h-screen flex justify-center items-center"
        />
      ) : (
        <div className="flex flex-col items-center justify-center">
          {/* 상단 네비게이션 바 */}
          <div className="bg-white flex items-center justify-between w-full">
            <Button
              isIconOnly
              variant="light"
              className="mr-2"
              onPress={() => router.back()}
            >
              <FaArrowLeft className="text-xl" />
            </Button>
            <h2 className="text-lg font-medium"></h2>
          </div>

          {/* Hero Image Section - 캐러셀로 교체 */}
          <div 
            className="relative w-full aspect-square"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            <div className="w-full h-full overflow-hidden">
              <div 
                className="flex h-full w-full"
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)`,
                  transition: "transform 0.5s ease-in-out"
                }}
              >
                {demoImages.map((image, index) => (
                  <div key={index} className="w-full h-full flex-shrink-0">
                    <img
                      src={image}
                      alt={`Gallery Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-bl-3xl"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Dot Pagination - 스타일 수정 */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
              {demoImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    currentSlide === index
                      ? "bg-[#007AFF]"
                      : "bg-[#B8B8B8]"
                  }`}
                  aria-label={`이미지 ${index + 1}로 이동`}
                />
              ))}
            </div>
          </div>
          <div className="w-[90%] h-full mt-4">
            <div className="w-full h-full">
              <div className="text-[18px] font-bold">별이 빛나는 밤에(2025.05.05)</div>
            </div>
            <div className="w-[90%] h-full mt-2">
              <div className="text-[10px]">제작방식:Offset print</div>
              <div className="text-[10px]">소재:라쿠 세라믹(재질)</div>
              <div className="text-[10px]">사이즈:Image 70x50cm / Frame 71.6x51.6cm</div>
            </div>
            <div className="w-full h-full mt-2 flex flex-row justify-between items-center">
              
              <div className="text-[25px] font-bold">₩500,000</div>
              <div className="text-[10px] flex flex-row gap-x-2 items-center">
                <LuWallet className="text-black text-lg" />
                <p>진위성 인증서</p>
              </div>
            </div>
          </div>
          <Divider orientation="horizontal" className="w-[90%] my-2" />
          {/* Restaurant Info */}
          <div className="w-[90%] flex flex-row justify-start items-center my-2 gap-x-4">
            <div className="">
              <img
                src="/noimage.jpg"
                alt="아티스트 이미지"
                className="w-[52px] aspect-square rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-[15px] font-bold">이희성</p>
              <p className="text-[10px]">대한민국 b 1994</p>
            </div>
          </div>
          <div className="w-[90%] flex flex-col gap-y-2">
            <div className="flex flex-col justify-center text-[14px] mt-2">
              <p>안녕이작가는 매우유명하다, 이작가는</p>
              <p>
                어쩌구 저쩌구 정말로 유명하기 때문에
              </p>
            </div>
            
            
          </div>
          <div className="w-[90%] flex flex-row justify-between items-center gap-x-4 my-4 h-14">
            <Button isIconOnly className="bg-gray-200 w-[20%] h-full text-[20px] font-bold">
              {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
            </Button>
            <Button className="bg-[#007AFF] text-white w-[80%] h-full text-[20px] font-bold">
              구매연결
            </Button>
          </div>
            
        </div>
      )}
    </div>
  );
}
