"use client";
import React from "react";
import { GalleryCards } from "./components/gallery-cards";
import { Tabs, Tab, Button, Select, SelectItem, Spinner } from "@heroui/react";
import { FaChevronLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { FaPlusCircle } from "react-icons/fa";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function GalleryList() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("all");
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("");

  const supabase = createClient();

  useEffect(() => {
    // 탭이 변경될 때 페이지 초기화
    setPage(1);
    setGalleries([]);
  }, [selectedTab]);

  useEffect(() => {
    const fetchGalleries = async () => {
      let query = supabase
        .from("gallery")
        .select("*");
      
      // 선택된 탭에 따라 필터 적용
      if (selectedTab === "now") {
        query = query.eq('isNow', true);
      } else if (selectedTab === "new") {
        query = query.eq('isNew', true);
      }
      // all 탭인 경우 추가 필터링 없음
      
      // 지역 필터 적용
      if (selectedRegion) {
        query = query.ilike('address', `%${selectedRegion}%`);
      }
      
      const { data, error } = await query
        .range((page - 1) * 5, page * 5 - 1);
      
      if (error) {
        console.log("Error fetching galleries:", error);
      } else {
        if (page === 1) {
          setGalleries(data);
        } else {
          setGalleries((prevGalleries) => [...prevGalleries, ...data]);
        }
        setHasMore(data.length === 5);
        setLoading(false);
      }
    };
    fetchGalleries();
  }, [page, selectedTab, selectedRegion]);

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  console.log('galleries', galleries)
  console.log('selectedTab', selectedTab)
  console.log('selectedRegion', selectedRegion)

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <Spinner variant="wave" size="lg" color="danger" />
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
        <h2 className="text-lg font-bold text-center flex-grow">갤러리</h2>
        <div className="w-10"></div>
      </div>
      <div className="flex justify-end items-center w-[90vw] mb-4">
        <Select
          selectedKeys={[selectedRegion]}
          onChange={(e)=>setSelectedRegion(e.target.value)}
          className="w-1/3"
          placeholder="지역"
        >
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
          title="전체"
          className="w-full justify-center items-center"
        >
          <GalleryCards galleries={galleries} />
          {hasMore ? (
            <div className="flex justify-center items-center my-4">
              <FaPlusCircle 
                className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-4" 
                onClick={loadMore}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-500 mb-4">모든 갤러리를 불러왔습니다</p>
            </div>
          )}
        </Tab>
        <Tab
          key="now"
          title="전시중"
          className="w-full justify-center items-center"
        >
          <GalleryCards galleries={galleries} />
          {hasMore ? (
            <div className="flex justify-center items-center my-4">
              <FaPlusCircle 
                className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-4" 
                onClick={loadMore}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-500 mb-4">모든 갤러리를 불러왔습니다</p>
            </div>
          )}
        </Tab>
        <Tab
          key="new"
          title="신규"
          className="w-full justify-center items-center"
        >
          <GalleryCards galleries={galleries} />
          {hasMore ? (
            <div className="flex justify-center items-center my-4">
              <FaPlusCircle 
                className="text-red-500 text-2xl font-bold hover:cursor-pointer mb-4" 
                onClick={loadMore}
              />
            </div>
          ) : (
            <div className="flex justify-center items-center my-4">
              <p className="text-gray-500 mb-4">모든 갤러리를 불러왔습니다</p>
            </div>
          )}
        </Tab>
      </Tabs>
    </div>
  );
}
