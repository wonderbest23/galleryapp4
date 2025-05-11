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
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
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
import Slider from "react-slick";
import "./product-slider.css";

// 리뷰 컴포넌트 추가


export default function App() {
  const [selected, setSelected] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState({
    product: false,
    bookmark: false,
  });
  const [product, setProduct] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
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
  const [hostId, setHostId] = useState(null);
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

  const [currentSlide, setCurrentSlide] = useState(0);

  // 커스텀 화살표 컴포넌트
  const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", left: "10px", zIndex: 1 }}
        onClick={onClick}
      >
        <FaChevronLeft className="text-white text-xl" />
      </div>
    );
  };

  const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div
        className={className}
        style={{ ...style, display: "block", right: "10px", zIndex: 1 }}
        onClick={onClick}
      >
        <FaChevronRight className="text-white text-xl" />
      </div>
    );
  };

  // 슬라이더 설정
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        }
      }
    ],
    customPaging: (i) => (
      <div 
        className={`w-2 h-2 mx-1 rounded-full ${
          i === currentSlide ? 'bg-[#007AFF]' : 'bg-white '
        }`} 
      />
    ),
    dotsClass: "slick-dots custom-dots",
    beforeChange: (oldIndex, newIndex) => {
      setCurrentSlide(newIndex);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: user } = await supabase.auth.getUser();
      setUser(user);
      setUserId(user?.user?.id);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("product")
          .select("*,artist_id(*)")
          .eq("id", id)
          .single();

        if (error) {
          console.log("Error fetching product:", error);
        } else {
          setProduct(data);
          setHostId(data.artist_id.id);
        }
        setDataLoaded((prev) => ({ ...prev, product: true }));
      } catch (error) {
        console.log("제품 불러오기 중 오류 발생:", error);
        setDataLoaded((prev) => ({ ...prev, product: true }));
      }
    };
    fetchProduct();
  }, [id]);


  console.log('setIsBookmarked',isBookmarked)
  useEffect(() => {
    const fetchBookmarkStatus = async () => {
      try {
        const { data: user } = await supabase.auth.getUser();

        if (user && user.user) {
          const { data: bookmarks, error } = await supabase
            .from("bookmark")
            .select("*")
            .eq("user_id", user.user.id)
            .eq("product_id", id);

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

  

  

  // 모든 데이터가 로드되었는지 확인하는 useEffect
  useEffect(() => {
    if (
      dataLoaded.product &&
      dataLoaded.bookmark 
    ) {
      setIsLoading(false);
    }
  }, [dataLoaded]);

  
  

  // 제품 이미지 없는 경우 기본 이미지 설정
  const productImages = product?.image?.length > 0 
    ? product.image 
    : ['/noimage.jpg'];

  // 북마크 토글 함수
  const toggleBookmark = async () => {
    try {
      // 사용자 확인
      if (!user || !user.user) {
        // 로그인이 필요한 경우 처리
        addToast({
          title: "로그인이 필요합니다",
          description: "북마크 기능을 위해 로그인해주세요",
          variant: "warning",
        });
        router.push('/mypage?redirect_to=/product/' + id);
        return;
      }

      if (isBookmarked) {
        // 북마크 삭제
        const { error } = await supabase
          .from("bookmark")
          .delete()
          .eq("user_id", user.user.id)
          .eq("product_id", id);

        if (error) throw error;

        // 북마크 해제 토스트 메시지
        addToast({
          title: "북마크 해제",
          description: "북마크가 해제되었습니다.",
          color: "success",
        });
      } else {
        // 북마크 추가
        const { error } = await supabase.from("bookmark").insert({
          user_id: user.user.id,
          product_id: id,
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
        variant: "danger",
      });
    }
  };

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

          {/* 이미지 슬라이더 - React Slick 사용 */}
          <div className="w-full aspect-square">
            <Slider {...sliderSettings} className="product-slider">
              {productImages.map((image, index) => (
                <div key={index} className="w-full h-full">
                  <div className="relative w-full aspect-square">
                    <Image 
                      src={image} 
                      alt={`제품 이미지 ${index + 1}`}
                      className="object-cover rounded-bl-3xl"
                      fill
                      priority={index === 0}
                      unoptimized
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          <div className="w-[90%] h-full mt-4">
            <div className="w-full h-full">
              <div className="text-[18px] font-bold">별이 빛나는 밤에(2025.05.05)</div>
            </div>
            <div className="w-[90%] h-full mt-2">
              <div className="text-[10px]">제작방식:{product?.make_method}</div>
              <div className="text-[10px]">소재:{product?.make_material}</div>
            </div>
            <div className="w-full h-full mt-2 flex flex-row justify-between items-center">
              
              <div className="text-[25px] font-bold">₩{product?.price?.toLocaleString()}</div>
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
                src={product?.artist_id?.avatar_url}
                alt="아티스트 이미지"
                className="w-[52px] aspect-square rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <p className="text-[15px] font-bold">{product?.artist_id?.artist_name}</p>
              <p className="text-[10px]">{product?.artist_id?.artist_birth}</p>
            </div>
          </div>
          <div className="w-[90%] flex flex-col gap-y-2">
            <div className="flex flex-col justify-center text-[14px] mt-2">
              <p>{product?.artist_id?.artist_proof}</p>
            </div>
            
            
          </div>
          <div className="w-[90%] flex flex-row justify-between items-center gap-x-4 my-4 h-14 mb-20">
            <Button isIconOnly className="bg-gray-200 w-[20%] h-full text-[20px] font-bold" onPress={toggleBookmark}>
              {isBookmarked ? <FaBookmark className="text-red-500" /> : <FaRegBookmark />}
            </Button>
            <Button 
              className="bg-[#007AFF] text-white w-[80%] h-full text-[16px] font-bold"
              onPress={() => {
                if (userId) {
                  router.push(`/chat?hostId=${hostId}&userId=${userId}&productId=${id}`);
                } else {
                  router.push('/mypage?redirect_to=/product/' + id);
                  addToast({
                    title: "로그인이 필요합니다",
                    description: "구매 연결을 위해 로그인해주세요",
                    color: "warning",
                  });
                }
              }}
            >
              구매연결
            </Button>
          </div>
            
        </div>
      )}
    </div>
  );
}
