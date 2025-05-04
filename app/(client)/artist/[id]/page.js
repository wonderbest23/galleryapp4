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
  Divider,
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
import Image from "next/image";
import { cn } from "@/utils/cn";
import Slider from "react-slick";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
import "./product-slider.css";

export default function App() {
  const [selected, setSelected] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState(null);
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [productsCount, setProductsCount] = useState(8);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
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
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    adaptiveHeight: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
        },
      },
    ],
    customPaging: (i) => (
      <div
        className={`w-2 h-2 mx-1 rounded-full ${
          i === currentSlide ? "bg-[#007AFF]" : "bg-white "
        }`}
      />
    ),
    dotsClass: "slick-dots custom-dots",
    beforeChange: (oldIndex, newIndex) => {
      setCurrentSlide(newIndex);
    },
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.log("프로필 불러오기 오류:", error);
        } else {
          setProfiles(data);
        }
      } catch (error) {
        console.log("프로필 불러오기 중 오류 발생:", error);
      }
    };
    fetchProfiles();

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("product")
          .select("*")
          .eq("artist_id", id);

        if (error) {
          console.log("작품 불러오기 오류:", error);
        } else {
          setProducts(data);
          setDisplayedProducts(data.slice(0, productsCount));
          setHasMoreProducts(data.length > productsCount);
          // 첫 번째 작품을 기본 선택
          if (data && data.length > 0) {
            setSelectedProduct(data[0]);
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.log("작품 불러오기 중 오류 발생:", error);
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [id, productsCount]);

  // 더 보기 버튼 클릭 핸들러
  const handleLoadMore = () => {
    const newCount = productsCount + 8;
    setProductsCount(newCount);
    setDisplayedProducts(products.slice(0, newCount));
    setHasMoreProducts(products.length > newCount);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  // 선택된 제품의 이미지 또는 기본 이미지
  const productImages =
    selectedProduct?.image?.length > 0
      ? selectedProduct.image
      : [profiles?.avatar_url || "/noimage.jpg"];

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

          {/* 이미지 슬라이더 */}
          <div className="w-full h-full">
            <Slider {...sliderSettings} className="h-full">
              {productImages.map((image, index) => (
                <div key={index} className="w-full h-[40vh] ">
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`작품 이미지 ${index + 1}`}
                      className="object-cover rounded-b-3xl"
                      fill
                      priority={index === 0}
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          {/* Artist Info */}
          <div className="w-[90%] flex flex-row justify-start my-4 gap-x-6">
            <div className="">
              <img
                src={profiles?.avatar_url || "/noimage.jpg"}
                alt="아티스트 이미지"
                className="w-[52px] aspect-square rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <p>{profiles?.artist_name}</p>
              <p>{profiles?.artist_birth}</p>
            </div>
          </div>
          <Divider orientation="horizontal" className="w-[90%] my-2" />
          <div className="flex flex-col w-[90%]">
            <p>{profiles?.artist_proof}</p>
          </div>
          <div className="w-[90%] flex flex-col gap-y-2">
            <div className="flex flex-col justify-center">
              <p>{profiles?.bio}</p>
            </div>

            {/* 작품 리스트 */}
            <div className="mt-4">
              <h3 className="font-medium mb-2">작품 목록</h3>
              <div className="grid grid-cols-4 gap-4">
                {displayedProducts.length > 0 ? (
                  displayedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`col-span-1 aspect-square mb-2 relative overflow-hidden rounded-lg w-full h-full cursor-pointer ${selectedProduct?.id === product.id ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => handleProductClick(product)}
                    >
                      <Image
                        src={
                          product.image && product.image.length > 0
                            ? product.image[0]
                            : "/noimage.jpg"
                        }
                        alt={product.title || "작품 이미지"}
                        fill
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-gray-500">
                    등록된 작품이 없습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center my-4">
            {hasMoreProducts ? (
              <FaPlusCircle
                onClick={handleLoadMore}
                className="text-gray-300 text-2xl font-bold hover:cursor-pointer hover:text-gray-400"
              />
            ) : (
              displayedProducts.length > 0 && (
                <p className="text-gray-500 text-sm">
                  더 이상 작품이 없습니다.
                </p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
