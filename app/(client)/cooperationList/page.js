"use client";
import React from "react";

import { Tabs, Tab, Button, Select, SelectItem, Textarea } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FaPlusCircle } from "react-icons/fa";
import { Input } from "@heroui/react";
import { addToast, ToastProvider } from "@heroui/react";
import {createClient} from "@/utils/supabase/client";
export default function GalleryList() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [description, setDescription] = React.useState("");
  const supabase = createClient();

  const handleSubmit = async () => {
    if (name === "" || email === "" || phone === "" || description === "") {
      addToast({
        color:'danger',
        title: "제휴신청",
        description: "모든 필드를 입력해주세요.",
      });
      return;
    }
    const { data, error } = await supabase
      .from("cooperation")
      .insert({ name, email, phone, description });
    if (error) {
      console.log(error);
    } else {
      addToast({
        color:'success',
        title: "제휴신청",
        description: "제휴신청이 완료되었습니다.",
      });
      setName("");
      setEmail("");
      setPhone("");
      setDescription("");
    }
  };


  return (
    <div className="flex flex-col items-center justify-center mx-2">

      <div className="bg-white flex items-center w-[90%] justify-between">
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
      <div className="w-full flex justify-center items-center mt-4">
        <img
          src="/images/cooperation2.png"
          alt="cooperation"
          className="w-1/2 h-auto object-cover"
        />
      </div>
      <div className="w-full flex justify-center items-center mt-4">
        <Input value={name} onChange={(e) => setName(e.target.value)} label="이름" placeholder="이름" className="w-full" />
      </div>
      <div className="w-full flex justify-center items-center mt-4">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} label="이메일" placeholder="이메일" className="w-full" />
      </div>
      <div className="w-full flex justify-center items-center mt-4">
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} label="연락처" placeholder="연락처" className="w-full" />
      </div>
      <div className="w-full flex justify-center items-center mt-4">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} label="문의내용" placeholder="문의내용" className="w-full" />
      </div>
      <div className="w-full flex justify-center items-center mt-4 mb-24">
        <Button
          onPress={() => {
              handleSubmit();
          }}
          variant="solid"
          color="primary"
          className="w-full"
        >
          문의접수
        </Button>
      </div>
    </div>
  );
}
