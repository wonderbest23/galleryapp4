'use client'
import React from "react";
// Button import 임시 제거
// import { Button } from "@heroui/react";
// react-icons 직접 가져오기
import { MdOutlineImage } from "react-icons/md";
import { IoImagesOutline } from "react-icons/io5";
import { BiBookOpen } from "react-icons/bi";
import { FiGift } from "react-icons/fi";
import { TbHandshake } from "react-icons/tb";
import { FaRegCalendar } from "react-icons/fa";

import { 
  GalleryHorizontalEnd, // 갤러리, 작품 나열
  Image,                // 이미지, 작품, 전시회
  Frame,                // 전시, 액자
  Palette,              // 예술 관련
  Newspaper,            // 매거진, 잡지
  BookOpen,             // 매거진, 브로셔
  CalendarDays,         // 이벤트 일정
  Ticket,               // 티켓, 이벤트 입장권
  Handshake,            // 제휴, 협력
  Users,                 // 제휴, 협력, 커뮤니티
  PanelLeft
} from 'lucide-react';
import { RiShoppingBag2Line } from "react-icons/ri";
import { LuBook } from "react-icons/lu";
import { LuAlarmClock } from "react-icons/lu";
import { PiSwatches } from "react-icons/pi";

import Link from "next/link";
export function CategoryButtons() {
  return (
    <div className="grid grid-cols-5 gap-2 px-4 w-full">
      <Link href="/exhibitions">
        <div className="flex flex-col items-center gap-1 py-2 w-full text-sm bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
          {/* <MdOutlineImage size={20} /> */}
          <FaRegCalendar className="text-gray-500 text-xl" />

          <span>전시회</span>
        </div>
      </Link>
      <Link href="/galleries">
        <div className="flex flex-col items-center gap-1 py-2 w-full text-sm bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
          {/* <IoImagesOutline size={20} /> */}
          <RiShoppingBag2Line className="text-gray-500 text-xl" />
          <span>갤러리</span>
        </div>
      </Link>
      <Link href="/magazineList">
        <div className="flex flex-col items-center gap-1 py-2 w-full text-sm bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
          {/* <BiBookOpen size={20} /> */}
          <LuBook className="text-gray-500 text-xl" />
          <span>매거진</span>
        </div>
      </Link>
      <Link href="/eventList">
      <div className="flex flex-col items-center gap-1 py-2 w-full text-sm bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
        {/* <FiGift size={20} /> */}
        <LuAlarmClock className="text-gray-500 text-xl" />
        <span>이벤트</span>
      </div>
      </Link>
      <Link href="/cooperationList">
        <div className="flex flex-col items-center gap-1 py-2 w-full text-sm bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200">
          {/* <TbHandshake size={20} /> */}
          <PiSwatches className="text-gray-500 text-xl" />
          <span>제휴</span>
        </div>
      </Link>

    </div>
  );
}