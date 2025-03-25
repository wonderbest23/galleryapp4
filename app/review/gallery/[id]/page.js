"use client";
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  Divider,
  Image,
  Textarea,
  Skeleton,
} from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import Star from "./components/Star";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { addToast, ToastProvider } from "@heroui/react";

export default function page() {
  const [selectedFeelings, setSelectedFeelings] = useState([]);
  const { id } = useParams();
  const [gallery, setGallery] = useState(null);
  const [description, setDescription] = useState("");
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = React.useState(0);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [user, setUser] = useState(null);
  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
    } else {
      setUser(data.user);
    }
  };
  useEffect(() => {
    getUser();
  }, []);

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
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchGallery();
  }, [id]);

  const handleFeelingClick = (feeling) => {
    if (selectedFeelings.includes(feeling)) {
      setSelectedFeelings(selectedFeelings.filter((item) => item !== feeling));
    } else {
      setSelectedFeelings([...selectedFeelings, feeling]);
    }
  };

  const router = useRouter();
  console.log("feeling:", selectedFeelings);

  const handleReviewSubmit = async () => {
    const { data, error } = await supabase.from("gallery_review").insert({
      gallery_id: id,
      category: selectedFeelings,
      rating: rating,
      description: description,
      name:user?.email
    });
    if (error) {
      console.error("Error submitting review:", error);
    } else {
      console.log("Review submitted successfully");
      addToast({
        title: "리뷰 작성 완료",
        description: "리뷰가 성공적으로 작성되었습니다.",
        color: "success",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-y-4 w-full max-w-[375px] px-2">
      <ToastProvider placement="top-center" toastOffset={60} />

      <div className="bg-white flex items-center w-full justify-between">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => router.back()}
        >
          <IoClose className="text-xl" />
        </Button>
        <h2 className="text-lg font-bold text-center flex-grow">리뷰</h2>
        <div className="w-10"></div>
      </div>
      <div className="w-full flex flex-col gap-4 font-bold text-xl text-center">
        여기는 어떠셨나요?
      </div>
      {isLoading ? (
        <div className="max-w-[300px] w-full flex items-center gap-3 justify-center">
          <div>
            <Skeleton className="flex rounded-full w-12 h-12" />
          </div>
          <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-3 w-3/5 rounded-lg" />
            <Skeleton className="h-3 w-full rounded-lg" />
          </div>
        </div>
      ) : (
        <Card className="w-full m-0">
          <CardBody className="flex gap-4 flex-row">
            <img
              src={gallery?.thumbnail}
              alt={gallery?.title}
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex flex-col w-full">
              <div className="flex flex-row justify-between items-start">
                <div className="flex flex-col">
                  <div className="text-lg font-bold">{gallery?.name}</div>
                </div>
              </div>

              <Divider orientation="horizontal" className=" bg-gray-300" />
              <div className="text-xs flex flex-col my-2">
                <div className="flex flex-row gap-1">
                  <IoMdPin />
                  {gallery?.address}
                </div>
                <div className="flex flex-row gap-1">
                  <FaRegStar />
                  {gallery?.visitor_rating}({gallery?.blog_review_count})
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
      <div className="w-full flex flex-col gap-4">
        <Star rating={rating} hoverRating={hoverRating} setRating={setRating} setHoverRating={setHoverRating} />
      </div>
      <div className="w-full flex flex-col gap-4 font-bold text-xl text-center">
        어떤 부분이 느껴졌나요?
      </div>
      <div className="w-full flex flex-wrap gap-2 justify-center mb-6">
        {[
          "쾌적함",
          "프라이빗",
          "다양한경험",
          "친절",
          "애견동반",
          "주차편리",
          "높은수준",
          "시끌벅적",
          "별로",
        ].map((feeling) => (
          <Button
            key={feeling}
            variant="bordered"
            className={`${selectedFeelings.includes(feeling) ? "font-bold border-2 border-primary text-primary" : "border border-gray-300"}`}
            onPress={() => handleFeelingClick(feeling)}
          >
            {feeling}
          </Button>
        ))}
      </div>
      <div className="w-full flex flex-col gap-4 font-bold text-xl text-center">
        리뷰를 작성해주세요
      </div>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="리뷰 내용"
      />
      <div className="w-full flex flex-col gap-4 font-bold text-xl text-center">
        <Button
          color="primary"
          className="w-full font-bold"
          onPress={handleReviewSubmit}
        >
          리뷰작성하기
        </Button>
      </div>
    </div>
  );
}
