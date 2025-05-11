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
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardBody, Divider, Image, CardFooter } from "@heroui/react";
import { FaPlusCircle } from "react-icons/fa";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { parseDate } from "@internationalized/date";
import { CiImageOn } from "react-icons/ci";
import { IoMdCloseCircleOutline } from "react-icons/io";
import ChatComplete from "./components/ChatComplete";

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hostId = searchParams.get("hostId");
  const userId = searchParams.get("userId");
  const productId = searchParams.get("productId");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatData, setChatData] = useState(null);

  console.log("hostId:", hostId);
  console.log("userId:", userId);
  console.log("productId:", productId);

  // 채팅 존재 확인 및 생성
  useEffect(() => {
    if (!hostId || !userId) {
      console.log("hostId 또는 userId가 없습니다");
      // 필요에 따라 리다이렉트 처리
      // router.push("/");
      return;
    }

    const checkOrCreateChat = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chat/check-or-create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            hostId,
            userId,
            productId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "채팅 생성 중 오류가 발생했습니다.");
        }

        setChatData(data.chat);
        console.log("채팅 데이터:", data.chat);
      } catch (err) {
        console.log("채팅 확인/생성 중 오류:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkOrCreateChat();
  }, [hostId, userId, productId, router]);

  return (
    <div className="flex flex-col items-center justify-center mx-2">
      <div className="bg-white flex items-center w-full justify-between">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => router.back()}
        >
          <FaArrowLeft className="text-xl" />
        </Button>
        <h2 className="text-lg font-bold text-center flex-grow">구매연결</h2>
        <div className="w-10"></div>
      </div>

      <ChatComplete
        hostId={hostId}
        userId={userId}
        productId={productId}
        chatData={chatData}
      />
    </div>
  );
}
