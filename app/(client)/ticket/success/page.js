"use client";
import React from "react";
import {
  Button,
  Skeleton,
  Input,
  Textarea,
  DatePicker,
  Spinner,
} from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  Divider,
  Image,
  CardFooter,
  NumberInput,
} from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { parseDate } from "@internationalized/date";
import { CiImageOn } from "react-icons/ci";
import { FaCircleCheck } from "react-icons/fa6";

export default function MagazineList() {
  const [magazines, setMagazines] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [allLoaded, setAllLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("/noimage.jpg");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const supabase = createClient();
  const [topCards, setTopCards] = useState([]);
  const [visibleTopCards, setVisibleTopCards] = useState([]);

  const genres = [
    { id: 1, name: "현대미술" },
    { id: 2, name: "명화/동양화" },
    { id: 3, name: "추상화" },
    { id: 4, name: "사진/일러스트" },
    { id: 5, name: "기타" },
  ];

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

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setIsUploading(true);

      // 파일 확장자 추출
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Supabase Storage에 이미지 업로드
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 업로드된 이미지의 public URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // 이미지 URL 상태 업데이트
      setProfileImage(publicUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mx-2">
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
          <div className="w-[90%] flex flex-col gap-y-12 mt-6 h-[calc(100vh-150px)] justify-center ">
            <div className="flex flex-col items-center justify-center">
              <div className="text-[36px] text-black font-bold">
                <div>결제 완료!</div>
                <div className="text-[10px] text-black font-medium">
                  최중섭:Layer landspace 전시회
                </div>
              </div>
            </div>

            <div className="text-[12px] text-black font-medium text-center">
              <p>성명:김주홍</p>
              <p>구매날짜:2025-03-05 16:01:12</p>
              <p>티켓 구매 수</p>
              <p>구매넘버:2352930492034</p>
            </div>
            <div className="flex flex-col items-center justify-center gap-y-4">
              <FaCircleCheck className="text-green-500 text-[40px]" />
              <div className="text-[18px] text-black font-medium">
                감사합니다.
              </div>
            </div>

            <Button
              onPress={() => router.push("/")}
              className="w-fullfont-bold bg-white border-2 border-black text-black"
              size="lg"
            >
              홈으로 돌아가기기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
