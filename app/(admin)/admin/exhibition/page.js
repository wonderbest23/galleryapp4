'use client'
import React, { useState } from "react";
import { HiUsers, HiPhotograph, HiClock, HiThumbUp } from "react-icons/hi";
import { ExhibitionList } from "../components/exhibition-list";
import { ExhibitionDetail } from "../components/exhibition-detail";
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

export default function AdminDashboard() {
  // 실제로는 서버에서 데이터를 가져올 것입니다
  const stats = [
    {
      title: "총 사용자",
      value: "1,248",
      icon: <HiUsers className="w-6 h-6 text-white" />,
      color: "bg-blue-500",
    },
    {
      title: "총 갤러리 항목",
      value: "342",
      icon: <HiPhotograph className="w-6 h-6 text-white" />,
      color: "bg-green-500",
    },
    {
      title: "이번 달 방문자",
      value: "8,492",
      icon: <HiClock className="w-6 h-6 text-white" />,
      color: "bg-purple-500",
    },
    {
      title: "좋아요 수",
      value: "2,350",
      icon: <HiThumbUp className="w-6 h-6 text-white" />,
      color: "bg-pink-500",
    },
  ];

  const [selectedExhibition, setSelectedExhibition] = React.useState(null);
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [refreshExhibitionList, setRefreshExhibitionList] = React.useState(null);
  const [refreshToggle, setRefreshToggle] = useState(1);

  // 전시회가 선택되었을 때 호출되는 함수
  const handleSelectionChange = (keys) => {
    setSelectedKeys(keys);
    
    // 선택된 키가 있으면 해당 전시회 정보를 가져옴
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      // 실제 구현에서는 API 호출 등으로 전시회 정보를 가져올 수 있음
      // 여기서는 해당 함수가 ExhibitionList에서 받은 exhibition 객체를 그대로 사용
    }
  };

  // 신규 전시회 등록 처리
  const handleCreateExhibition = () => {
    // 빈 전시회 객체 생성 (신규 등록용)
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
      naver_gallery_url:"",
      price:0
    };
    
    setSelectedExhibition(newExhibition);
    setSelectedKeys(new Set([])); // 테이블 선택 초기화
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 py-20">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">전시회 관리</h1>
        

        {/* Exhibition List Section */}
        <section className="rounded-lg">
          <ExhibitionList 
            onSelectExhibition={setSelectedExhibition} 
            selectedKeys={selectedKeys} 
            onSelectionChange={handleSelectionChange}
            onCreateExhibition={handleCreateExhibition}
            onRefresh={setRefreshExhibitionList}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
            
          />
        </section>

        {/* Exhibition Detail Section */}
        <section className="bg-content2 rounded-lg p-4">
          {selectedExhibition ? (
            <ExhibitionDetail
              exhibition={selectedExhibition}
              onUpdate={(updated) => setSelectedExhibition(updated)}
              selectedExhibition={selectedExhibition}
              setSelectedExhibition={setSelectedExhibition}
              selectedKeys={selectedKeys}
              setSelectedKeys={setSelectedKeys}
              onRefresh={() => {
                // 전시회 목록 새로고침 함수 호출
                if (refreshExhibitionList) {
                  console.log('부모 컴포넌트: 전시회 목록 새로고침 시도');
                  refreshExhibitionList();
                  console.log('부모 컴포넌트: 전시회 목록 새로고침 완료');
                } else {
                  console.log('부모 컴포넌트: refreshExhibitionList 함수가 없습니다');
                }
              }}
              refreshToggle={refreshToggle}
              setRefreshToggle={setRefreshToggle}
            />
          ) : (
            <div className="text-center text-default-500 py-8">
              전시회를 선택하면 상세 정보가 표시됩니다.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
