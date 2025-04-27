"use client";
import React from "react";
import { Button, Card, CardBody, Divider, Image, Spinner } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import MagazineCarousel from "./components/magazine-carousel";
import { useEffect, useState, use } from "react";
import { createClient } from "@/utils/supabase/client";
import {FaArrowLeft} from "react-icons/fa";
export default function page({params}) {
  const magazineId = use(params)['id'];
  const [magazine, setMagazine] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();
  
  const getMagazineData = async() => {
    try {
      const {data, error} = await supabase.from('magazine').select('*').eq('id', magazineId).single();
      setMagazine(data);
    } catch (error) {
      console.error("매거진 데이터 로드 중 오류:", error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    getMagazineData();
  }, []);
  console.log('magazine:',magazine);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Spinner variant="wave" size="lg" color="primary" />
      </div>
    );
  }
  
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
        <h2 className="text-lg font-bold text-center flex-grow">매거진</h2>
        <div className="w-10"></div>
      </div>
      <div className="w-[100%] flex flex-col gap-4">
        <MagazineCarousel magazine={magazine}/>
      </div>
      <div className="flex flex-col gap-2 my-4 w-[100%] mb-24 px-8">
        <div className="text-[20px] font-bold">{magazine.title}</div>
        <div className="text-[15px] font-medium text-gray-500">{magazine.subtitle}</div>
        <div className="text-end text-[10px] text-[#494949]">작성일 :{" "}{new Date(magazine.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <Divider orientation="horizontal" className="w-full my-2"/>
        <div className="text-[14px] text-black">
          {/<[a-z][\s\S]*>/i.test(magazine.contents) || magazine.contents?.includes('<') ? (
            <div dangerouslySetInnerHTML={{ __html: magazine.contents }} />
          ) : (
            magazine.contents
          )}
        </div>
      </div>
    </div>
  );
}
