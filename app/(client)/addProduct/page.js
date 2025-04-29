"use client";
import React from "react";
import { Button, Skeleton, Input, Textarea, DatePicker, Spinner } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { Card, CardBody, Divider, Image, CardFooter } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { parseDate } from "@internationalized/date";
import { CiImageOn } from "react-icons/ci";
import { IoMdCloseCircleOutline } from "react-icons/io";

export default function MagazineList() {
  const [magazines, setMagazines] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [allLoaded, setAllLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("/noimage.jpg");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const router = useRouter();
  const supabase = createClient();
  const [topCards, setTopCards] = useState([]);
  const [visibleTopCards, setVisibleTopCards] = useState([]);

  const genres = [
    { id: 1, name: "현대미술" },
    { id: 2, name: "명화/동양화" },
    { id: 3, name: "추상화" },
    { id: 4, name: "사진/일러스트" },
    { id: 5, name: "기타" }
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
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      setIsUploading(true);

      const uploadedImages = [];
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        uploadedImages.push(publicUrl);
      }

      setProductImages([...productImages, ...uploadedImages]);
    } catch (error) {
      console.error('Error uploading image:', error);
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
          <div className="bg-white flex items-center w-[90%] justify-between">
            <Button
              isIconOnly
              variant="light"
              className="mr-2"
              onPress={() => router.back()}
            >
              <FaArrowLeft className="text-xl" />
            </Button>
            <h2 className="text-lg font-bold text-center flex-grow">
              신규작품 등록하기
            </h2>
            <div className="w-10"></div>
          </div>
          <div className="w-[90%] flex flex-col gap-y-4 mt-6">
            <div className="flex flex-col gap-y-2">
              <label className="text-sm text-[#747474] font-medium">작품 이미지</label>
              <div className="flex flex-wrap gap-4">
                {productImages.map((image, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={image}
                      alt={`작품 이미지 ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                      style={{ objectFit: 'cover', backgroundRepeat: 'repeat' }}
                    />
                    <button
                      onClick={() => {
                        const newImages = [...productImages];
                        newImages.splice(index, 1);
                        setProductImages(newImages);
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
                    >
                      <IoMdCloseCircleOutline className="text-gray-400 text-2xl" />
                    </button>
                  </div>
                ))}
                <div className="relative w-24 h-24">
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                    />
                    <CiImageOn className="text-2xl text-gray-400 mb-2" />
                    <span className="text-xs text-gray-400">이미지 추가</span>
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                      <Spinner size="sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-sm text-[#747474] font-medium">작품명</label>
              <Input
                type="text"
                variant="bordered"
                placeholder="작품명을 입력해주세요"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-sm text-[#747474] font-medium">사이즈</label>
              <Input
                type="tel"
                variant="bordered"
                placeholder="사이즈를 입력해주세요"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-sm text-[#747474] font-medium">소재</label>
              <Input
                type="tel"
                variant="bordered"
                placeholder="사이즈를 입력해주세요"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-sm text-[#747474] font-medium">제작일</label>
              <DatePicker
                variant="bordered"
                placeholder="제작일 선택해주세요"
                showMonthAndYearPickers
                minValue={parseDate("1900-01-01")}
                maxValue={parseDate(new Date().toISOString().split('T')[0])}
                defaultValue={parseDate("1990-01-01")}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-sm text-[#747474] font-medium">장르</label>
              <Input
                type="text"
                variant="bordered"
                placeholder="장르를 입력해주세요"
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <label className="text-sm text-[#747474] font-medium">작품금액</label>
              <Input
                type="text"
                variant="bordered"
                placeholder="작품금액을 입력해주세요"
              />
            </div>

            <Button
              color="primary"
              className="w-full mt-6 mb-24 bg-black text-white"
              size="lg"
            >
              신규 작품 등록하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
