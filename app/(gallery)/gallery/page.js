'use client'
import React from "react";
import { HiUsers, HiPhotograph, HiClock, HiThumbUp } from "react-icons/hi";
import { GalleryList } from "./components/gallery-list";
import { GalleryDetail } from "./components/gallery-detail";
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

  // 사용자의 기본 갤러리 데이터
  const userGallery = {
    id: 0,
    title: "내 갤러리",
    name: "사용자 갤러리",
    url: "my-gallery",
    address: "서울특별시 강남구",
    phone: "02-1234-5678",
    workinghour: "10:00 - 18:00",
    thumbnail: "/images/gallery/default.jpg",
    homepage_url: "https://mygallery.com",
    status: "active",
    createdAt: "2024-01-01",
    shop_info: "여기는 사용자의 갤러리 정보입니다.",
    add_info: "추가 정보를 입력해 주세요.",
    description: "이 갤러리는 사용자의 기본 갤러리입니다."
  };

  const [selectedGallery, setSelectedGallery] = React.useState(userGallery);

  return (
    <div className="w-full h-full flex flex-col gap-4 py-20">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">갤러리 관리</h1>
        

        {/* Gallery List Section */}
        {/* <section className="rounded-lg">
          <GalleryList onSelectGallery={setSelectedGallery} />
        </section> */}

        {/* Gallery Detail Section */}
        <section className="bg-content2 rounded-lg p-4">
          <GalleryDetail
            gallery={selectedGallery}
            onUpdate={(updated) => setSelectedGallery(updated)}
            onDelete={() => setSelectedGallery(userGallery)}
          />
        </section>
      </div>
    </div>
  );
}
