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
    product: false,
    bookmark: false,
  });
  const [product, setProduct] = useState(null);
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
          i === currentSlide ? 'bg-[#007AFF]' : 'bg-[#B8B8B8] opacity-30'
        }`} 
      />
    ),
    dotsClass: "slick-dots custom-dots",
    beforeChange: (oldIndex, newIndex) => {
      setCurrentSlide(newIndex);
    }
  };

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
        }
        setDataLoaded((prev) => ({ ...prev, product: true }));
      } catch (error) {
        console.log("제품 불러오기 중 오류 발생:", error);
        setDataLoaded((prev) => ({ ...prev, product: true }));
      }
    };
    fetchProduct();
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

  console.log("product:", product)

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
              <div className="text-[10px]">사이즈:{product?.make_size} / Frame:{product?.make_frame}</div>
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
