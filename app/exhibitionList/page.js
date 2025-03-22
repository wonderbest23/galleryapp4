"use client";
import React from "react";
import { ExhibitionCards } from "./components/exhibition-cards";
import { Tabs, Tab, Button, Select, SelectItem } from "@heroui/react";
import { FaChevronLeft, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { FaPlusCircle } from "react-icons/fa";


export default function ExhibitionList() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("all");
  const [exhibitions, setExhibitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");

  const supabase = createClient();

  useEffect(() => {
    // 탭이 변경될 때 페이지 초기화
    setPage(1);
    setExhibitions([]);
  }, [selectedTab]);

  useEffect(() => {
    const fetchExhibitions = async () => {
      let query = supabase
        .from("exhibition")
        .select("*,gallery:name(*)")
        .not('gallery', 'is', null);
      
      // 선택된 탭에 따라 필터 적용
      if (selectedTab === "free") {
        query = query.eq('isFree', true);
      } else if (selectedTab === "recommended") {
        query = query.eq('isRecommended', true);
      }
      // all 탭인 경우 추가 필터링 없음
      
      // 지역 필터 적용
      if (selectedRegion) {
        query = query.ilike('gallery.address', `%${selectedRegion}%`);
      }
      
      const { data, error } = await query
        .range((page - 1) * 5, page * 5 - 1);
      
      if (error) {
        console.error("Error fetching exhibitions:", error);
      } else {
        if (page === 1) {
          setExhibitions(data);
        } else {
          setExhibitions((prevExhibitions) => [...prevExhibitions, ...data]);
        }
        setHasMore(data.length === 5);
        setLoading(false);
      }
    };
    fetchExhibitions();
  }, [page, selectedTab, selectedRegion]);

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  console.log('exhibitions', exhibitions)
  console.log('selectedTab', selectedTab)
  console.log('selectedRegion', selectedRegion)

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
        <h2 className="text-lg font-bold text-center flex-grow">전시회</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex justify-end items-center w-[90vw] mb-4">
        <Select selectedKeys={[selectedRegion]} onChange={(e)=>setSelectedRegion(e.target.value)} className="w-1/3" placeholder="지역">
          <SelectItem key="서울" value="서울">서울</SelectItem>
          <SelectItem key="인천" value="인천">인천</SelectItem>
          <SelectItem key="경기" value="경기">경기</SelectItem>
          <SelectItem key="충청" value="충청">충청</SelectItem>
          <SelectItem key="경상" value="경상">경상</SelectItem>
          <SelectItem key="전라" value="전라">전라</SelectItem>
          <SelectItem key="강원" value="강원">강원</SelectItem>
          <SelectItem key="제주" value="제주">제주</SelectItem>
        </Select>
      </div>
      <Tabs
        aria-label="Exhibition options"
        variant="underlined"
        className="w-full flex justify-center items-center"
        selectedKey={selectedTab}
        onSelectionChange={setSelectedTab}
      >
        <Tab
          key="all"
          title="전시회"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards exhibitions={exhibitions} />
          {hasMore ? (
            <div className="flex justify-center items-center my-4">
              <FaPlusCircle 
                className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-4" 
                onClick={loadMore}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-500 mb-4">모든 전시회를 불러왔습니다</p>
            </div>
          )}
        </Tab>
        <Tab
          key="free"
          title="무료전시"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards exhibitions={exhibitions} />
          {hasMore ? (
            <div className="flex justify-center items-center my-4">
              <FaPlusCircle 
                className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-4" 
                onClick={loadMore}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-500 mb-4">모든 전시회를 불러왔습니다</p>
            </div>
          )}
        </Tab>
        <Tab
          key="recommended"
          title="추천전시"
          className="w-full justify-center items-center"
        >
          <ExhibitionCards exhibitions={exhibitions} />
          {hasMore ? (
            <div className="flex justify-center items-center my-4">
              <FaPlusCircle 
                className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-4" 
                onClick={loadMore}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-500 mb-4">모든 전시회를 불러왔습니다</p>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
