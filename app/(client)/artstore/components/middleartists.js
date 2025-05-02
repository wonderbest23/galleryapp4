"use client";
import { Card, CardBody, Skeleton, CardFooter, Divider } from "@heroui/react";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { FaRegBookmark, FaBookmark } from "react-icons/fa6";
import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
export default function ExhibitionLayout({ exhibitions, user, bookmarks, toggleBookmark, isBookmarked }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [topCards, setTopCards] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);
  const carouselRef = useRef(null);
  const [bookmarkedProducts, setBookmarkedProducts] = useState({});
  const router = useRouter();
  // 더미 데이터 - 3개의 캐러셀 아이템
  const dummyItems = [
    { id: 1, name: "전시회 1", contents: "전시회 내용 1", photo: "/noimage.jpg" },
    { id: 2, name: "전시회 2", contents: "전시회 내용 2", photo: "/noimage.jpg" },
    { id: 3, name: "전시회 3", contents: "전시회 내용 3", photo: "/noimage.jpg" }
  ];
  
  // 상단 카드와 캐러셀 아이템 설정
  useEffect(() => {
    if (exhibitions && exhibitions.length) {
      setTopCards(exhibitions.slice(0, 3));
      setCarouselItems(exhibitions.slice(3));
    } else {
      // 더미 데이터 사용
      setTopCards(dummyItems);
      setCarouselItems(dummyItems);
    }
  }, [exhibitions]);

  // 캐러셀 슬라이드 변경 핸들러
  const handleSlideChange = useCallback((index) => {
    setCurrentSlide(index);
    
    // 캐러셀 스크롤 이동
    if (carouselRef.current) {
      carouselRef.current.scrollTo({
        left: index * carouselRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  }, []);

  // 캐러셀 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (carouselRef.current && carouselItems.length) {
      const scrollPosition = carouselRef.current.scrollLeft;
      const slideWidth = carouselRef.current.offsetWidth;
      const newSlide = Math.round(scrollPosition / slideWidth);
      
      if (newSlide !== currentSlide) {
        setCurrentSlide(newSlide);
      }
    }
  }, [currentSlide, carouselItems.length]);

  const products = [
    { 
      id: 1, 
      name: "미술작품미술작품", 
      contents: "이현경 72x60cm", 
      price: "₩80,000",
      photo: "/noimage.jpg" 
    },
    { 
      id: 2, 
      name: "설산과 집", 
      contents: "이현경 72x60cm",
      price: "₩80,000", 
      photo: "/noimage.jpg" 
    },
    { 
      id: 3, 
      name: "설산과 집", 
      contents: "이현경 72x60cm",
      price: "₩80,000", 
      photo: "/noimage.jpg" 
    },
    { 
      id: 4, 
      name: "설산과 집", 
      contents: "이현경 72x60cm",
      price: "₩80,000", 
      photo: "/noimage.jpg" 
    },
    { 
      id: 5, 
      name: "설산과 집", 
      contents: "이현경 72x60cm",
      price: "₩80,000", 
      photo: "/noimage.jpg" 
    }
  ];

  // 북마크 토글 함수
  const toggleProductBookmark = (productId) => {
    setBookmarkedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // 로딩 상태에서 사용할 스켈레톤 UI 컴포넌트
  const SkeletonCard = () => (
    <div className="w-full h-[180px]">
      <Card className="w-full space-y-5 p-4" radius="lg" shadow="none">
        <Skeleton className="rounded-lg">
          <div className="h-24 rounded-lg bg-default-300" />
        </Skeleton>
        <div className="space-y-3">
          <Skeleton className="w-3/5 rounded-lg">
            <div className="h-3 w-3/5 rounded-lg bg-default-200" />
          </Skeleton>
          <Skeleton className="w-4/5 rounded-lg">
            <div className="h-3 w-4/5 rounded-lg bg-default-200" />
          </Skeleton>
        </div>
      </Card>
    </div>
  );

  // 전시회 카드 컴포넌트
  const ExhibitionCard = useCallback(({ exhibition }) => (
    <Link href={`/exhibition/${exhibition.id}`} className="block w-full">
      <Card className="h-[240px] overflow-hidden shadow hover:shadow-lg transition-shadow rounded-xl">
        <div className="relative">
          <img
            src={exhibition.photo || "/images/noimage.jpg"}
            alt={exhibition.name || "전시회 이미지"}
            className="h-[140px] w-full object-cover"
          />
        </div>
        <CardBody className="flex flex-col justify-between h-[100px] p-3">
          <div className="text-[16px] font-bold line-clamp-1">{exhibition.contents}</div>
          <div className="text-[10px]">
            <p className="line-clamp-1 text-[#BDBDBD]">
              {exhibition.gallery?.address || "주소 정보 없음"}
            </p>
          </div>
          <div className="flex text-sm justify-between items-center">
            <div className="rounded-md text-[10px] text-[#BDBDBD]">평균별점</div>
            <div className="flex items-center gap-x-1">
              <span className="text-[10px] text-[#007AFF]">{exhibition.review_average || "1.0"}</span>
              <FaStar className="text-[#007AFF]" />
            </div>
          </div>
        </CardBody>
      </Card>
    </Link>
  ), []);

  // 이미지만 있는 간단한 캐러셀 아이템 컴포넌트
  const SimpleCarouselItem = useCallback(({ exhibition }) => (
    <div className="w-full flex-shrink-0 relative">
      <img
        src={exhibition.photo || "/noimage.jpg"}
        alt={exhibition.name || "이미지"}
        className="w-full aspect-[335/148] object-cover rounded-xl"
      />
    </div>
  ), []);

  // 캐러셀 아이템 컴포넌트
  const CarouselItem = useCallback(({ exhibition }) => (
    <div className="w-full flex-shrink-0">
      <ExhibitionCard exhibition={exhibition} />
    </div>
  ), []);

  return (
    <div className="w-full max-w-full overflow-hidden my-4">
      <div className="w-full">
        {/* 상단 3개 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {topCards.map((exhibition, index) => (
            <Card isPressable onPress={() => router.push(`/artist/${exhibition.id}`)} key={`top-card-${index}`} classNames={{base: 'm-1'}} shadow="sm" radius="lg">
              <CardBody className="p-0">
                <img src="/noimage.jpg" alt="아티스트 이미지" className="w-full h-full object-cover p-3 rounded-[24px]" />
              </CardBody>
              <CardFooter >  
                <p className="text-[14px] font-medium line-clamp-1 text-[#606060]">작가이름</p>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* 캐러셀 섹션 */}
        <div className="w-full relative p-1">
          {/* 캐러셀 슬라이더 */}
          <div 
            ref={carouselRef}
            className="w-full overflow-x-auto scrollbar-hide relative shadow-s"
            style={{
              display: 'flex',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
            }}
            onScroll={handleScroll}
          >
            {carouselItems.map((exhibition, index) => (
              <SimpleCarouselItem key={`carousel-${index}`} exhibition={exhibition} />
            ))}
            
            {/* 닷 페이지네이션 - 이미지 내부 하단에 배치 */}
            <div className="flex justify-center absolute bottom-2 left-0 right-0 z-10">
              {carouselItems.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  className={`w-2 h-2 mx-1 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-[#007AFF]' : 'bg-white'
                  }`}
                  onClick={() => handleSlideChange(index)}
                  aria-label={`슬라이드 ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        <Divider orientation="horizontal" className="my-4" />
        <div className="w-full">
          {products.map((product, index) => (
            <Card isPressable onPress={() => router.push(`/product/${product.id}`)} key={`product-${index}`} shadow="none" classNames={{base: 'gap-x-2 w-full',body: 'gap-x-2'}}>
              <CardBody className="flex flex-row justify-center items-center">
                <img src="/noimage.jpg" alt={product.name} className="w-[80px] h-[80px] object-cover " />
                <div className="flex flex-col flex-grow ml-2">
                  <p className="text-[14px] font-medium line-clamp-1 text-[#606060]">{product.name}</p>
                  <p className="text-[14px] font-medium line-clamp-1 text-[#606060]">{product.contents}</p>
                  <p className="text-[14px] font-medium line-clamp-1 text-[#606060]">{product.price}</p>
                </div>
                <div className="items-center bg-gray-300 rounded-lg p-2 h-[30px] w-[30px] flex justify-center items-center">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      toggleProductBookmark(product.id);
                    }}
                    className="text-lg text-gray-500 hover:text-[#007AFF]"
                  >
                    {bookmarkedProducts[product.id] ? (
                      <FaBookmark className="text-[#007AFF]" />
                    ) : (
                      <FaRegBookmark className="text-white" />
                    )}
                  </button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 