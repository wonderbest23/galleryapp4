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
  const [profileImage, setProfileImage] = useState("/noimage.jpg");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState("");
  const [size, setSize] = useState("");
  const [makeMaterial, setMakeMaterial] = useState("");
  const [makeDate, setMakeDate] = useState("");
  const [genre, setGenre] = useState("현대미술");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genres = [
    { id: 1, name: "현대미술" },
    { id: 2, name: "명화/동양화" },
    { id: 3, name: "추상화" },
    { id: 4, name: "사진/일러스트" },
    { id: 5, name: "기타" },
  ];

  const handleImageUpload = async (e) => {
    try {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      setIsUploading(true);

      const uploadedImages = [];
      for (const file of files) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        uploadedImages.push(publicUrl);
      }

      setProductImages([...productImages, ...uploadedImages]);
    } catch (error) {
      console.log("Error uploading image:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // 현재 로그인한 사용자 정보 가져오기
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("로그인이 필요합니다.");
      }

      // 프로필 정보 가져오기
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('artist_credit')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profile.artist_credit < 1) {
        throw new Error("작가 크레딧이 부족합니다.");
      }

      // 작품 정보 저장
      const { error: productError } = await supabase
        .from('product')
        .insert([
          {
            name,
            size,
            make_material: makeMaterial,
            make_date: makeDate,
            genre,
            price: parseInt(price),
            image: productImages,
            artist_id: user.id
          }
        ]);

      if (productError) throw productError;

      // 작가 크레딧 차감
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ artist_credit: profile.artist_credit - 1 })
        .eq('id', user.id);

      if (creditError) throw creditError;

      router.push('/mypage/success');
    } catch (error) {
      console.log('Error submitting product:', error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mx-2">
      <div className="bg-white flex items-center w-[90%] justify-between">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => router.push("/mypage/success")}
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
          <label className="text-sm text-[#747474] font-medium">
            작품 이미지
          </label>
          <div className="flex flex-wrap gap-4">
            {productImages.map((image, index) => (
              <div key={index} className="relative w-24 h-24">
                <img
                  src={image}
                  alt={`작품 이미지 ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                  style={{ objectFit: "cover", backgroundRepeat: "repeat" }}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-sm text-[#747474] font-medium">사이즈</label>
          <Input
            type="tel"
            variant="bordered"
            placeholder="사이즈를 입력해주세요"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-sm text-[#747474] font-medium">소재</label>
          <Input
            type="tel"
            variant="bordered"
            placeholder="소재를 입력해주세요"
            value={makeMaterial}
            onChange={(e) => setMakeMaterial(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-sm text-[#747474] font-medium">제작일</label>
          <Input
            type="text"
            variant="bordered"
            placeholder="YYYYMMDD 형식으로 입력해주세요"
            value={makeDate}
            onChange={(e) => setMakeDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-sm text-[#747474] font-medium">장르</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <Button
                key={g.id}
                size="sm"
                variant={genre === g.name ? "solid" : "bordered"}
                className={`${
                  genre === g.name
                    ? "bg-black text-white"
                    : "border-gray-300 text-gray-600"
                }`}
                onPress={() => setGenre(g.name)}
              >
                {g.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-y-2">
          <label className="text-sm text-[#747474] font-medium">작품금액</label>
          <Input
            type="text"
            variant="bordered"
            placeholder="작품금액을 입력해주세요"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <Button
          color="primary"
          className="w-full mt-6 mb-24 bg-black text-white"
          size="lg"
          onPress={handleSubmit}
          isLoading={isSubmitting}
        >
          신규 작품 등록하기
        </Button>
      </div>
    </div>
  );
}
