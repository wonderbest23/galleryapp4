"use client";
import React from "react";
import { Button, Skeleton } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Card, CardBody, Divider, Image, CardFooter } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
export default function MagazineList() {
  const [magazines, setMagazines] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [allLoaded, setAllLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  const [topCards, setTopCards] = useState([]);
  const [visibleTopCards, setVisibleTopCards] = useState([]);

  // 더미 데이터 - 20개의 탑 카드 아이템
  const dummyTopCards = [
    { id: 1, name: "김작가", photo: "/noimage.jpg" },
    { id: 2, name: "이작가", photo: "/noimage.jpg" },
    { id: 3, name: "박작가", photo: "/noimage.jpg" },
    { id: 4, name: "최작가", photo: "/noimage.jpg" },
    { id: 5, name: "정작가", photo: "/noimage.jpg" },
    { id: 6, name: "강작가", photo: "/noimage.jpg" },
    { id: 7, name: "조작가", photo: "/noimage.jpg" },
    { id: 8, name: "윤작가", photo: "/noimage.jpg" },
    { id: 9, name: "장작가", photo: "/noimage.jpg" },
    { id: 10, name: "임작가", photo: "/noimage.jpg" },
    { id: 11, name: "한작가", photo: "/noimage.jpg" },
    { id: 12, name: "오작가", photo: "/noimage.jpg" },
    { id: 13, name: "서작가", photo: "/noimage.jpg" },
    { id: 14, name: "신작가", photo: "/noimage.jpg" },
    { id: 15, name: "권작가", photo: "/noimage.jpg" },
    { id: 16, name: "황작가", photo: "/noimage.jpg" },
    { id: 17, name: "안작가", photo: "/noimage.jpg" },
    { id: 18, name: "송작가", photo: "/noimage.jpg" },
    { id: 19, name: "전작가", photo: "/noimage.jpg" },
    { id: 20, name: "홍작가", photo: "/noimage.jpg" },
  ];

  useEffect(() => {
    setTopCards(dummyTopCards);
    setVisibleTopCards(dummyTopCards.slice(0, visibleCount));
    setAllLoaded(dummyTopCards.length <= visibleCount);
  }, [visibleCount]);

  const getMagazines = async () => {
    const { data, error } = await supabase
      .from("magazine")
      .select("*")
      .order("created_at", { ascending: false });
    setMagazines(data);
    setAllLoaded(data.length <= visibleCount);
    setIsLoading(false);
  };

  useEffect(() => {
    getMagazines();
  }, []);

  console.log("magazines:", magazines);

  const loadMore = () => {
    const newVisibleCount = visibleCount + 12;
    setVisibleCount(newVisibleCount);
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center w-full h-full gap-y-6 mt-12">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="max-w-[300px] w-full flex items-center gap-3"
            >
              <div>
                <Skeleton className="flex rounded-full w-12 h-12" />
              </div>
              <div className="w-full flex flex-col gap-2">
                <Skeleton className="h-3 w-3/5 rounded-lg" />
                <Skeleton className="h-3 w-4/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="bg-white flex items-center w-[90%] justify-between">
            <Button
              isIconOnly
              variant="light"
              className="mr-2"
              onPress={() => router.back()}
            >
              <FaArrowLeft className="text-xl" />
            </Button>
            <h2 className="text-lg font-bold text-center flex-grow">아티스트</h2>
            <div className="w-10"></div>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4 w-[90%] mt-4">
            {visibleTopCards.map((exhibition, index) => (
              <Card
                key={`top-card-${index}`}
                classNames={{ base: "m-1" }}
                shadow="sm"
                radius="lg"
                isPressable
                onPress={() => router.push(`/artist/${exhibition.id}`)}
                className="hover:cursor-pointer"
              >
                <CardBody className="p-2">
                  <img
                    src="/noimage.jpg"
                    alt="아티스트 이미지"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                 <div className="flex flex-col items-center justify-center my-2">
                    <p className="text-[14px] font-medium line-clamp-1 text-[#606060] text-center">
                      {exhibition.name}
                    </p>
                   
                 </div>
                </CardBody>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center my-4">
            <div
              
              
              onClick={loadMore}
              className="mb-4"
            >
              <FaPlusCircle 
                className="text-gray-500 text-2xl font-bold hover:cursor-pointer"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
