'use client'
import React from "react";
import { HiUsers, HiPhotograph, HiClock, HiThumbUp } from "react-icons/hi";
import { GalleryList } from "../components/gallery-list";
import { GalleryDetail } from "../components/gallery-detail";
import {useState,useEffect} from 'react'
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

  const [selectedGallery, setSelectedGallery] = React.useState(null);
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [refreshGalleryList, setRefreshGalleryList] = React.useState(null);
  const [refreshToggle, setRefreshToggle] = useState(1);

  // 갤러리가 선택되었을 때 호출되는 함수
  const handleSelectionChange = (keys) => {
    setSelectedKeys(keys);
    
    // 선택된 키가 있으면 해당 갤러리 정보를 가져옴
    const selectedKey = Array.from(keys)[0];
    if (selectedKey) {
      // 실제 구현에서는 API 호출 등으로 갤러리 정보를 가져올 수 있음
      // 여기서는 해당 함수가 GalleryList에서 받은 gallery 객체를 그대로 사용
    }
  };

  // 신규 갤러리 등록 처리
  const handleCreateGallery = () => {
    // 빈 갤러리 객체 생성 (신규 등록용)
    const newGallery = {
      id: "",
      name: "",
      url: "",
      address: "",
      phone: "",
      workinghour: "",
      thumbnail: "",
      visitor_rating: "",
      blog_review_count: "",
      homepage_url: "",
      status: "pending",
      description: "",
      shop_info: "",
      add_info: "",
      createdAt: new Date().toISOString().split('T')[0],
      isNew: false,
      isRecommend: false,
      isNow: false
    };
    
    setSelectedGallery(newGallery);
    setSelectedKeys(new Set([])); // 테이블 선택 초기화
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 py-20">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">갤러리 관리</h1>
        

        {/* Gallery List Section */}
        <section className="rounded-lg">
          <GalleryList 
            onSelectGallery={setSelectedGallery} 
            selectedKeys={selectedKeys} 
            onSelectionChange={handleSelectionChange}
            onCreateGallery={handleCreateGallery}
            onRefresh={setRefreshGalleryList}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
          />
        </section>

        {/* Gallery Detail Section */}
        <section className="bg-content2 rounded-lg p-4">
          {selectedGallery ? (
            <GalleryDetail
              gallery={selectedGallery}
              onUpdate={(updated) => setSelectedGallery(updated)}
              selectedGallery={selectedGallery}
              setSelectedGallery={setSelectedGallery}
              selectedKeys={selectedKeys}
              setSelectedKeys={setSelectedKeys}
              onRefresh={() => {
                // 갤러리 목록 새로고침 함수 호출
                if (refreshGalleryList) {
                  console.log('부모 컴포넌트: 갤러리 목록 새로고침 시도');
                  refreshGalleryList();
                  console.log('부모 컴포넌트: 갤러리 목록 새로고침 완료');
                } else {
                  console.log('부모 컴포넌트: refreshGalleryList 함수가 없습니다');
                }
              }}
              refreshToggle={refreshToggle}
              setRefreshToggle={setRefreshToggle}
            />
          ) : (
            <div className="text-center text-default-500 py-8">
              갤러리를 선택하면 상세 정보가 표시됩니다.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
