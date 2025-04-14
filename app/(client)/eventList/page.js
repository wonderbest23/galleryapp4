"use client";
import React from "react";

import { Button, Select, SelectItem, Spinner } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FaPlusCircle } from "react-icons/fa";
import EventCarousel from "./components/event-carousel";
import { createClient } from "@/utils/supabase/client";
import {useState,useEffect} from 'react'
export default function GalleryList() {
  const router = useRouter();
  const supabase = createClient();
  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [allLoaded, setAllLoaded] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const getEvents = async () => {
    // 선택된 연도의 시작일과 끝일 계산
    const startDate = `${selectedYear}-01-01`;
    const endDate = `${selectedYear}-12-31`;
    
    const { data, error } = await supabase
      .from("event")
      .select("*")
      .gte('created_at', startDate) // 선택된 연도 이상
      .lte('created_at', endDate)   // 선택된 연도 이하
      .order("created_at", { ascending: false });
      
    if (error) {
      console.log("이벤트 로딩 에러:", error);
      return;
    }
    
    setEvents(data || []);
    setAllLoaded(data?.length <= visibleCount);
    setLoading(false);
  };

  useEffect(() => {
    getEvents();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Spinner variant="wave" size="lg" color="primary" />
      </div>
    );
  }

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
        <Select  placeholder="2025" className="w-1/3" selectedKeys={[selectedYear]} onChange={(e) => setSelectedYear(e.target.value)}>
            <SelectItem key="2025" value="2025">2025</SelectItem>
            <SelectItem key="2024" value="2024">2024</SelectItem>
            <SelectItem key="2023" value="2023">2023</SelectItem>
        </Select>
      </div>
      <EventCarousel events={events} />
      
    </div>
  );
}
