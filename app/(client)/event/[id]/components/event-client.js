"use client";
import React from "react";
import { Button, Card, CardBody, Divider, Image, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import EventCarousel from "./event-carousel";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { FaArrowLeft } from "react-icons/fa";

export default function EventClient({ eventId }) {
  console.log("전달받은 eventId:", eventId);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClient();

  const getEventData = async () => {
    try {
      if (!eventId) {
        console.error("이벤트 ID가 없습니다!");
        setError("이벤트 ID가 없습니다");
        setLoading(false);
        return;
      }

      console.log("Supabase 쿼리 실행:", `from("event").select("*").eq("id", ${eventId})`);
      const { data, error } = await supabase
        .from("event")
        .select("*")
        .eq("id", eventId)
        .single();
      console.log("Supabase 응답:", data, "에러:", error);
      console.log("이벤트 데이터 구조:", JSON.stringify(data, null, 2));
      if (error) {
        console.error("Supabase 에러:", error);
        setError(error.message);
      }
      setEvent(data);
    } catch (error) {
      console.error("이벤트 데이터 로드 중 오류:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  console.log("event:", event);

  useEffect(() => {
    getEventData();
  }, [eventId]); // eventId가 변경될 때마다 데이터를 다시 가져옵니다

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-white flex items-center w-[100%] justify-between">
        <Button
          isIconOnly
          variant="light"
          className="mr-2"
          onPress={() => router.back()}
        >
          <FaArrowLeft className="text-xl" />
        </Button>
        <h2 className="text-lg font-bold text-center flex-grow">이벤트</h2>
        <div className="w-10"></div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner variant="wave" size="lg" color="primary" />
        </div>
      ) : event ? (
        <>
          <div className="w-[100%] flex flex-col gap-4 relative">
            {/* <EventCarousel event={event} /> */}
            <Image src={event.photo} alt={event.title} fill className="object-cover rounded-none" />
          </div>
          <div className="flex flex-col gap-2 my-4 w-[100%] mb-24 px-8">
            <div className="text-[20px] font-bold">{event.title}</div>
            <div className="text-[15px] font-medium text-gray-500">
              {event.subtitle}
            </div>
            <div className="text-end text-[10px] text-[#494949]">
              작성일 :{" "}
              {new Date(event.created_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <Divider orientation="horizontal" className="w-full my-2" />
            <div className="text-[12px] text-black">{event.description}</div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center">
          <p className="text-lg font-medium text-gray-700">이벤트를 찾을 수 없습니다.</p>
          <p className="text-sm text-gray-500">ID: {eventId}</p>
          {error && <p className="text-sm text-red-500 mt-2">오류: {error}</p>}
        </div>
      )}
    </div>
  );
} 