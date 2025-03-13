"use client";
import React from "react";
import { GalleryCards } from "./components/gallery-cards";
import { Tabs, Tab, Button, Select, SelectItem } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FaPlusCircle } from "react-icons/fa";

export default function GalleryList() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white flex items-center w-[90vw] justify-between">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => router.back()}
        >
          <FaChevronLeft className="text-xl" />
        </Button>
        <h2 className="text-lg font-bold text-center flex-grow">갤러리</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex justify-end items-center w-[90vw] mb-4">
        <Select
          className="w-1/3"
          placeholder="지역"
        >
          <SelectItem>서울</SelectItem>
          <SelectItem>인천</SelectItem>
          <SelectItem>경기</SelectItem>
          <SelectItem>충청</SelectItem>
          <SelectItem>경상</SelectItem>
          <SelectItem>전라</SelectItem>
          <SelectItem>강원</SelectItem>
          <SelectItem>제주</SelectItem>
        </Select>
      </div>
      <Tabs
        aria-label="Exhibition options"
        variant="underlined"
        className="w-full flex justify-center items-center"
      >
        <Tab
          key="all"
          title="전체"
          className="w-full justify-center items-center"
        >
          <GalleryCards />
        </Tab>
        <Tab
          key="free"
          title="전시중"
          className="w-full justify-center items-center"
        >
          <GalleryCards />
        </Tab>
        <Tab
          key="recommended"
          title="신규"
          className="w-full justify-center items-center"
        >
          <GalleryCards />
        </Tab>
      </Tabs>
    </div>
  );
}
