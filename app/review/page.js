"use client";
import React, { useState } from "react";
import { Button, Card, CardBody, Divider, Image } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdPin } from "react-icons/io";
import { FaRegStar } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import Star from "./components/Star";

export default function page() {
  const [selectedFeelings, setSelectedFeelings] = useState([]);
  
  const handleFeelingClick = (feeling) => {
    if (selectedFeelings.includes(feeling)) {
      setSelectedFeelings(selectedFeelings.filter(item => item !== feeling));
    } else {
      setSelectedFeelings([...selectedFeelings, feeling]);
    }
  };
  
  const exhibition = {
    title: "수원 갤러리",
    subtitle: "김광석 초대전 전시회",
    date: "2024.03.15 - 2024.04.15",
    location: "서울 강남구",
    review: "4.0(225)",
  };
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <div className="bg-white flex items-center w-[90vw] justify-between">
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
      <div className="w-[90vw] flex flex-col gap-4 font-bold text-xl text-center">
        여기는 어떠셨나요?
      </div>
      <div className="w-[90vw] flex flex-col gap-4">
        <Card className="w-[90vw] m-0">
          <CardBody className="flex gap-4 flex-row">
            <img
              src={`https://picsum.photos/200/200?random=1`}
              alt={exhibition.title}
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex flex-col w-full">
              <div className="flex flex-row justify-between items-start">
                <div className="flex flex-col">
                  <div className="text-xs ">{exhibition.title}</div>
                  <div className="text-lg font-bold">{exhibition.subtitle}</div>
                </div>
              </div>

              <Divider orientation="horizontal" className=" bg-gray-300" />
              <div className="text-xs flex flex-col my-2">
                <div className="flex flex-row gap-1">
                  <FaRegCalendar />
                  {exhibition.date}
                </div>
                <div className="flex flex-row gap-1">
                  <IoMdPin />
                  {exhibition.location}
                </div>
                <div className="flex flex-row gap-1">
                  <FaRegStar />
                  {exhibition.review}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="w-[90vw] flex flex-col gap-4">
        <Star />
      </div>
      <div className="w-[90vw] flex flex-col gap-4 font-bold text-xl text-center">
        어떤 부분이 느껴졌나요?
      </div>
      <div className="w-[90vw] flex flex-wrap gap-2 justify-center mb-6">
        {["쾌적함", "프라이빗", "다양한경험", "친절", "애견동반", "주차편리", "높은수준", "시끌벅적", "별로"].map((feeling) => (
          <Button 
            key={feeling}
            variant="bordered" 
            className={`${selectedFeelings.includes(feeling) ? 'font-bold border-2 border-primary text-primary' : 'border border-gray-300'}`}
            onPress={() => handleFeelingClick(feeling)}
          >
            {feeling}
          </Button>
        ))}
      </div>
      <div className="w-[90vw] flex flex-col gap-4 font-bold text-xl text-center">
        <Button color="primary" className="w-full font-bold">리뷰작성하기</Button>
      </div>
    </div>
  );
}
