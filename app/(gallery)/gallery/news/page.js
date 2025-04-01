'use client'

import React from "react";
import { MagazineList } from "../components/magazine-list";
import { MagazineDetail } from "../components/magazine-detail";

export default function NewsPage() {
  const [selectedNews, setSelectedNews] = React.useState(null);
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));

  // 소식 선택 처리 함수
  const handleSelectNews = (news) => {
    setSelectedNews(news);
    if (news && news.id) {
      setSelectedKeys(new Set([news.id.toString()]));
    } else {
      setSelectedKeys(new Set([]));
    }
  };

  // 소식 업데이트 처리 함수
  const handleNewsUpdate = (updatedNews) => {
    setSelectedNews(updatedNews);
    if (updatedNews && updatedNews.id) {
      setSelectedKeys(new Set([updatedNews.id.toString()]));
    }
  };

  // 소식 삭제 처리 함수
  const handleNewsDelete = () => {
    setSelectedNews(null);
    setSelectedKeys(new Set([]));
  };

  console.log('selectedKeys', selectedKeys)
  return (
    <div className="w-full h-full flex flex-col gap-4 py-20">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">소식 관리</h1>

        {/* News List Section */}
        <section className="rounded-lg">
          <MagazineList 
            onSelectMagazine={handleSelectNews} 
            selectedKeys={selectedKeys}
          />
        </section>

        {/* News Detail Section */}
        <section className="bg-content2 rounded-lg p-4">
          {selectedNews ? (
            <MagazineDetail
              magazine={selectedNews}
              onUpdate={handleNewsUpdate}
              onDelete={handleNewsDelete}
              selectedKeys={selectedKeys}
            />
          ) : (
            <div className="text-center text-default-500 py-8">
              소식을 선택하거나 새 소식을 등록해주세요.
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 