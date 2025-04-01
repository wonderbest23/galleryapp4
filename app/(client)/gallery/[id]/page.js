"use client";
import React from "react";
import { Tabs, Tab, Card, CardBody, Button, Badge,Spinner, addToast, ToastProvider } from "@heroui/react";
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


export default function App() {
  const [selected, setSelected] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
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
    oneStars: 0
  });

  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .eq("id", id)
        .single();    

      if (error) {
        console.error("Error fetching gallery:", error);
      } else {
        setGallery(data);
      }
    };
    fetchGallery();
    fetchBookmarkStatus();
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    fetchNotifications();
  }, [id, notificationPage]);
  
  useEffect(() => {
    fetchReviews();
  }, [id,reviewPage]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_notification")
        .select("*")
        .eq("gallery_id", id)
        .order('created_at', { ascending: false })
        .range((notificationPage - 1) * notificationsPerPage, notificationPage * notificationsPerPage - 1);

      if (error) {
        console.error("알림 불러오기 오류:", error);
        return;
      }

      if (data.length < notificationsPerPage) {
        setHasMoreNotifications(false);
      }

      if (notificationPage === 1) {
        setNotifications(data);
      } else {
        setNotifications(prev => [...prev, ...data]);
      }
    } catch (error) {
      console.error("알림 불러오기 중 오류 발생:", error);
    }
  };

  const loadMoreNotifications = () => {
    setNotificationPage(prev => prev + 1);
  };
  
  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_review")
        .select("*")
        .eq("gallery_id", id)
        .order('created_at', { ascending: false })
        .range((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage - 1);

      if (error) {
        console.error("리뷰 불러오기 오류:", error);
        return;
      }

      if (data.length < reviewsPerPage) {
        setHasMoreReviews(false);
      }

      if (reviewPage === 1) {
        setReviews(data);
      } else {
        setReviews(prev => [...prev, ...data]);
      }
      
      // 리뷰 통계 계산
      calculateReviewStats();
    } catch (error) {
      console.error("리뷰 불러오기 중 오류 발생:", error);
    }
  };

  const loadMoreReviews = () => {
    setReviewPage(prev => prev + 1);
  };

  const calculateReviewStats = async () => {
    try {
      const { data, error } = await supabase
        .from("gallery_review")
        .select("rating")
        .eq("gallery_id", id);
      
      if (error) {
        console.error("리뷰 통계 불러오기 오류:", error);
        return;
      }
      
      if (data.length === 0) return;
      
      const count = data.length;
      const sum = data.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / count;
      
      const fiveStars = data.filter(review => review.rating === 5).length;
      const fourStars = data.filter(review => review.rating === 4).length;
      const threeStars = data.filter(review => review.rating === 3).length;
      const twoStars = data.filter(review => review.rating === 2).length;
      const oneStars = data.filter(review => review.rating === 1).length;
      
      setReviewStats({
        average,
        count,
        fiveStars,
        fourStars,
        threeStars,
        twoStars,
        oneStars
      });
    } catch (error) {
      console.error("리뷰 통계 계산 중 오류 발생:", error);
    }
  };

  // 북마크 상태 확인 함수
  const fetchBookmarkStatus = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (user && user.user) {
        const { data: bookmarks, error } = await supabase
          .from('bookmark')
          .select('*')
          .eq('user_id', user.user.id)
          .eq('gallery_id', id);
        
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

  // 북마크 토글 함수
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
          .eq('gallery_id', id);
          
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
            gallery_id: id,
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

  console.log('gallery:',gallery);


  
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {isLoading ? (
        <Spinner variant="wave" color="danger" className="w-full h-screen flex justify-center items-center" />
      ) : (
      <>
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
          src={gallery?.thumbnail}
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
            <h1 className="text-2xl font-bold">{gallery?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center">
                <Icon icon="lucide:star" className="text-yellow-400" />
                <span className="ml-1">{gallery?.visitor_rating === 0 ? "1.0" : gallery?.visitor_rating?.toFixed(1)}</span>
                <span className="text-gray-500">({gallery?.blog_review_count})</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div>
            <FiMapPin className="text-lg text-gray-500" />
            </div>
            <span>{gallery?.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <div>
            <LuClock4 className="text-lg text-gray-500" />
            </div>
            
            <span>{gallery?.workinghour}</span>
          </div>
          {/* <div className="flex items-center gap-2">
            <Icon icon="lucide:info" />
            <span>평일/주말: 오후12:00부터 오후 6시까지(1시간 평균 소요)</span>
          </div> */}
        </div>

        <Button onPress={() => router.push(gallery?.homepage_url)} className="w-full mt-4" color="primary" size="lg">
          사이트연결
        </Button>
      </div>

      {/* Tabs Section */}
      <div className="mt-4 mb-16">
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
                <h3 className="text-lg font-bold mb-2">시설 안내</h3>
                <p>
                  {gallery?.add_info}
                </p>
              </CardBody>
            </Card>
          </Tab>
          <Tab key="gallery" title="갤러리공지">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card key={notification.id} className="my-4 mx-2">
                  <CardBody>
                    <h3 className="text-lg font-bold">{notification.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleDateString('ko-KR')}
                    </p>
                    <p className="mt-2">{notification.content}</p>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="flex justify-center items-center p-8 text-gray-500">
                등록된 공지사항이 없습니다.
              </div>
            )}
            
            {hasMoreNotifications && notifications.length > 0 && (
              <div className="flex justify-center items-center my-4">
                <FaPlusCircle 
                  className="text-red-500 text-2xl font-bold hover:cursor-pointer" 
                  onClick={loadMoreNotifications}
                />
              </div>
            )}
          </Tab>
          <Tab key="reviews" title="리뷰">
            <Card className="my-4 mx-2">
              <CardBody>
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-lg font-bold mb-2">갤러리 리뷰</h3>
                  <div className="flex items-center justify-center mb-2">
                    <div className="flex text-yellow-400 items-center">
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          icon="lucide:star"
                          className={`w-8 h-8 ${i < Math.floor(reviewStats.average) ? "text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{reviewStats.average.toFixed(1)}</p>
                    <p className="text-sm text-gray-500">{reviewStats.count}개의 리뷰</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card key={review.id} className="my-4 mx-2">
                  <CardBody>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{review.name || '익명'}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(review.created_at).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Icon
                            key={i}
                            icon="lucide:star"
                            className={`h-4 w-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-2">{review.title}</p>
                    <p className="mt-1 text-sm text-gray-700">{review.description}</p>
                  </CardBody>
                </Card>
              ))
            ) : (
              <div className="flex justify-center items-center p-8 text-gray-500">
                등록된 리뷰가 없습니다.
              </div>
            )}
            
            {reviews.length > 0 && (
              <div className="flex justify-center items-center my-4">
                {hasMoreReviews ? (
                  <FaPlusCircle 
                    className="text-red-500 text-2xl font-bold hover:cursor-pointer" 
                    onClick={loadMoreReviews}
                  />
                ) : (
                  <p className="text-gray-500">더 이상 리뷰가 없습니다.</p>
                )}
              </div>
            )}
          </Tab>
        </Tabs>
      </div>
      </>
      )}
    </div>
  );
}
