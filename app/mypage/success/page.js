"use client";
import React from "react";
import { ExhibitionCards } from "./components/exhibition-cards";
import { Tabs, Tab, Button, Select, SelectItem, Divider } from "@heroui/react";
import { FaChevronLeft, FaFileContract } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { FiLogOut } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function Success() {
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
        <h2 className="text-lg font-bold text-center flex-grow">마이페이지</h2>
        <div className="w-10"></div>
      </div>
      <div className="w-[90vw] h-auto flex justify-center items-center my-6 flex-col gap-y-4">
        <div className="w-24 h-24 flex justify-center items-center bg-black rounded-full"></div>
        <div className="text-lg font-bold">아무개123123123**</div>
      </div>

      <Tabs
        aria-label="Exhibition options"
        variant="underlined"
        className="w-full flex justify-center items-center"
      >
        <Tab
          key="favorite"
          title="나의즐겨찾기"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards />
        </Tab>
        <Tab
          key="review"
          title="리뷰"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards />
        </Tab>
      </Tabs>

      <Tabs
        aria-label="Exhibition options"
        variant="underlined"
        className="w-full flex justify-center items-center"
      >
        <Tab
          key="recommended"
          title="추천갤러리"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards />
        </Tab>
        <Tab
          key="new"
          title="신규갤러리"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards />
        </Tab>
        <Tab
          key="ongoing"
          title="전시중갤러리"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards />
        </Tab>
      </Tabs>

      <div className="w-[90vw] h-auto flex justify-center items-center flex-col gap-y-4 mb-24">
        <div className="flex items-center gap-x-2 w-full">
          <FaFileContract className="text-gray-600" size={20} />
          <span>이용약관 및 정책</span>
        </div>
        <Divider></Divider>
        <div className="flex items-center gap-x-2 w-full">
          <BiSupport className="text-gray-600" size={20} />
          <span>고객센터</span>
        </div>
        <Divider></Divider>
        <div className="flex items-center gap-x-2 w-full">
          <FiLogOut className="text-gray-600" size={20} />
          <span>로그아웃</span>
        </div>
      </div>
    </div>
  );
}
