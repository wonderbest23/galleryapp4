'use client'

import React, { useState, useEffect } from "react";
import { MagazineList } from "../components/magazine-list";
import { MagazineDetail } from "../components/magazine-detail";

export default function Magazine() {
  const [selectedMagazine, setSelectedMagazine] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [refreshToggle, setRefreshToggle] = useState(false);
  const [refreshMagazineList, setRefreshMagazineList] = useState(null);

  // 신규 매거진 생성 함수
  const handleCreateMagazine = () => {
    // 기본 매거진 객체 생성
    const newMagazine = {
      id: null,
      title: "",
      summary: "",
      author: "",
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      content: "",
      thumbnail: "",
      viewCount: 0
    };
    setSelectedMagazine(newMagazine);
    setSelectedKeys(new Set([]));
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 py-20">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">매거진 관리</h1>

        {/* Magazine List Section */}
        <section className="rounded-lg">
          <MagazineList 
            onSelectMagazine={setSelectedMagazine}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            onCreateMagazine={handleCreateMagazine}
            onRefresh={(refreshFunc) => setRefreshMagazineList(refreshFunc)}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
          />
        </section>

        {/* Magazine Detail Section */}
        <section className="bg-content2 rounded-lg p-4">
          {selectedMagazine ? (
            <MagazineDetail
              magazine={selectedMagazine}
              onUpdate={(updated) => setSelectedMagazine(updated)}
              selectedMagazine={selectedMagazine}
              setSelectedMagazine={setSelectedMagazine}
              selectedKeys={selectedKeys}
              setSelectedKeys={setSelectedKeys}
              onRefresh={() => {
                // 매거진 목록 새로고침 함수 호출
                if (refreshMagazineList) {
                  console.log('부모 컴포넌트: 매거진 목록 새로고침 시도');
                  refreshMagazineList();
                  console.log('부모 컴포넌트: 매거진 목록 새로고침 완료');
                } else {
                  console.log('부모 컴포넌트: refreshMagazineList 함수가 없습니다');
                }
              }}
              refreshToggle={refreshToggle}
              setRefreshToggle={setRefreshToggle}
              onDelete={() => {
                setSelectedMagazine(null);
                setSelectedKeys(new Set([]));
                // 목록 새로고침
                setRefreshToggle(!refreshToggle);
              }}

            />
          ) : (
            <div className="text-center text-default-500 py-8">
              매거진을 선택하면 상세 정보가 표시됩니다.
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 