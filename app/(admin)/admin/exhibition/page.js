'use client'
import React, { useState, useEffect } from "react";
import { HiUsers, HiPhotograph, HiClock, HiThumbUp } from "react-icons/hi";
import { ExhibitionList } from "../components/exhibition-list";
import { ExhibitionDetail } from "../components/exhibition-detail";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";

// 통계 카드 컴포넌트
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6 flex items-center">
    <div className={`rounded-full p-3 ${color}`}>{icon}</div>
    <div className="ml-4">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default function Exhibition() {
  // Supabase 클라이언트 생성
  const supabase = createClient();

  // 상태 관리
  const [selectedExhibition, setSelectedExhibition] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [refreshToggle, setRefreshToggle] = useState(0);
  const [refreshFunction, setRefreshFunction] = useState(null);

  // 전시회 선택 시 호출되는 함수
  const handleSelectExhibition = (exhibition) => {
    setSelectedExhibition(exhibition);
  };

  // 전시회 업데이트 시 호출되는 함수
  const handleUpdateExhibition = (updatedExhibition) => {
    setSelectedExhibition(updatedExhibition);
  };

  // 신규 전시회 등록 시 호출되는 함수
  const handleCreateExhibition = () => {
    // 새 전시회 객체 생성 (빈 값으로 초기화)
    const newExhibition = {
      name: "",
      contents: "",
      photo: "",
      date: "",
      working_hour: "",
      off_date: "",
      add_info: "",
      homepage_url: "",
      isFree: false,
      isRecommended: false,
      review_count: 0,
      review_average: 0,
      naver_gallery_url: "",
      price: 0
    };
    
    setSelectedExhibition(newExhibition);
    setSelectedKeys(new Set([]));
  };

  // 새로고침 함수 설정
  const handleSetRefreshFunction = (refreshFunc) => {
    setRefreshFunction(refreshFunc);
  };

  return (
    <div className="w-full h-full p-4 space-y-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* 왼쪽 영역 - 전시회 목록 */}
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-2xl font-bold">전시회 관리</h1>
          <ExhibitionList
            onSelectExhibition={handleSelectExhibition}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            onCreateExhibition={handleCreateExhibition}
            onRefresh={handleSetRefreshFunction}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
          />
        </div>

        {/* 오른쪽 영역 - 전시회 상세 정보 */}
        <div className="w-full md:w-1/2 bg-content1 p-4 rounded-lg border-1 border-default-200">
          {selectedExhibition ? (
            <ExhibitionDetail
              exhibition={selectedExhibition}
              onUpdate={handleUpdateExhibition}
              selectedKeys={selectedKeys}
              setSelectedKeys={setSelectedKeys}
              onRefresh={refreshFunction}
              refreshToggle={refreshToggle}
              setRefreshToggle={setRefreshToggle}
              selectedExhibition={selectedExhibition}
              setSelectedExhibition={setSelectedExhibition}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Icon icon="lucide:image" className="text-6xl mb-4 text-default-400" />
              <h3 className="text-xl font-semibold mb-2">전시회 선택 안됨</h3>
              <p className="text-default-500 mb-6">
                좌측 목록에서 전시회를 선택하거나 신규 등록 버튼을 클릭하세요.
              </p>
              <Button 
                color="primary" 
                onPress={handleCreateExhibition}
                className="flex items-center"
              >
                <Icon icon="lucide:plus" className="mr-1" />
                전시회 신규 등록
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
