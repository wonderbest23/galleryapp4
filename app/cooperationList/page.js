"use client";
import React from "react";

import { Tabs, Tab, Button, Select, SelectItem,Textarea } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FaPlusCircle } from "react-icons/fa";
import { Input } from "@heroui/react";

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
        <h2 className="text-lg font-bold text-center flex-grow">제휴신청</h2>
        <div className="w-10"></div>
      </div>
      <div className="w-[90vw] flex justify-center items-center mt-4">
        <img src="/images/cooperation2.png" alt="cooperation" className="w-1/2 h-auto object-cover" />
      </div>
      <div className="w-[90vw] flex justify-center items-center mt-4">
        <Input  label="이름" placeholder="이름" className="w-full" />
      </div>
      <div className="w-[90vw] flex justify-center items-center mt-4">
        <Input  label="이메일" placeholder="이메일" className="w-full" />
      </div>
      <div className="w-[90vw] flex justify-center items-center mt-4">
        <Input  label="연락처" placeholder="연락처" className="w-full" />
      </div>
      <div className="w-[90vw] flex justify-center items-center mt-4">
        <Textarea  label="문의내용" placeholder="문의내용" className="w-full" />
      </div>
      <div className="w-[90vw] flex justify-center items-center mt-4 mb-24">
        <Button variant="solid" color="primary" className="w-full">문의접수</Button>
      </div>
      
    </div>
  );
}
