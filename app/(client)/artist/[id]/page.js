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

  // 북마크 토글 함수
  const toggleBookmark = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();

      if (!user || !user.user) {
        // 로그인이 필요한 경우 처리
        alert("북마크를 위해 로그인이 필요합니다.");
        return;
      }

      if (isBookmarked) {
        // 북마크 삭제
        const { error } = await supabase
          .from("bookmark")
          .delete()
          .eq("user_id", user.user.id)
          .eq("gallery_id", id);

        if (error) throw error;

        // 북마크 해제 토스트 메시지
        addToast({
          title: "북마크 해제",
          description: "북마크가 해제되었습니다.",
          color: "primary",
        });
      } else {
        // 북마크 추가
        const { error } = await supabase.from("bookmark").insert({
          user_id: user.user.id,
          gallery_id: id,
          created_at: new Date().toISOString(),
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
      console.log("북마크 토글 중 오류 발생:", error);

      // 에러 발생 시 토스트 메시지
      addToast({
        title: "오류 발생",
        description: "북마크 처리 중 오류가 발생했습니다.",
        color: "danger",
        icon: <Icon icon="mdi:alert-circle" />,
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: gallery.name,
          text: gallery.description,
          url: window.location.href,
        });
      } else {
        // Web Share API를 지원하지 않는 경우 클립보드에 복사
        await navigator.clipboard.writeText(window.location.href);
        alert("링크가 클립보드에 복사되었습니다.");
      }
    } catch (error) {
      console.log("공유하기 실패:", error);
    }
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

          {/* Hero Image Section */}
          <div className="relative w-full h-64">
            <img
              src="/noimage.jpg"
              alt="Restaurant"
              className="w-full h-full object-cover rounded-b-3xl"
            />
          </div>

          {/* Restaurant Info */}
          <div className="w-[90%] flex flex-row justify-start my-4 gap-x-6">
            <div className="">
              <img
                src="/noimage.jpg"
                alt="아티스트 이미지"
                className="w-[52px] aspect-square rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <p>이희성</p>
              <p>대한민국 b 1994</p>
            </div>
          </div>
          <Divider orientation="horizontal" className="w-[90%] my-2" />
          <div className="w-[90%] flex flex-col gap-y-2">
            <div className="flex flex-col justify-center">
              <p>안녕이작가는 매우유명하다, 이작가는</p>
              <p>
                어쩌구 저쩌구 정말로 유명하기 때문에
              </p>
            </div>
            <div className="flex flex-row justify-end font-bold hover:cursor-pointer">
              더보기
            </div>
            <div className="grid grid-cols-4 justify-between gap-2">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="col-span-1 aspect-square">
                  <img
                    src="/noimage.jpg"
                    alt={`작품 이미지 ${index + 1}`}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
