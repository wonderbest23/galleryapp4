"use client";
import React from "react";

import { Tabs, Tab, Button, Select, SelectItem } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FaPlusCircle } from "react-icons/fa";
import EventCarousel from "./components/event-carousel";

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
        <h2 className="text-lg font-bold text-center flex-grow">이벤트</h2>
        <div className="w-10"></div>
      </div>
      <div className="w-[90vw] flex justify-center items-center mt-4">
        <Select placeholder="2025" className="w-1/3">
            <SelectItem>2025</SelectItem>
            <SelectItem>2024</SelectItem>
            <SelectItem>2023</SelectItem>
        </Select>
      </div>
      <EventCarousel />
      
    </div>
  );
}
