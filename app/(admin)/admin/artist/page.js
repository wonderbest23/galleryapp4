"use client";
import React, { useState, useEffect } from "react";
import { HiUsers, HiPhotograph, HiClock, HiThumbUp } from "react-icons/hi";
import { ArtistList } from "../components/artist-list";
import { ArtistDetail } from "../components/artist-detail";
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

export default function Artist() {
  // Supabase 클라이언트 생성
  const supabase = createClient();

  // 상태 관리
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [refreshToggle, setRefreshToggle] = useState(0);
  const [refreshFunction, setRefreshFunction] = useState(null);

  // 작가 선택 시 호출되는 함수
  const handleSelectArtist = (artist) => {
    console.log("메인 컴포넌트: 작가 선택됨", artist);
    setSelectedArtist(artist);
  };

  // 작가 업데이트 시 호출되는 함수
  const handleUpdateArtist = (updatedArtist) => {
    setSelectedArtist(updatedArtist);
  };

  // 신규 작가 등록 시 호출되는 함수
  const handleCreateArtist = () => {
    // 새 작가 객체 생성 (빈 값으로 초기화)
    const newArtist = {
      artist_name: "",
      artist_phone: "",
      artist_intro: "",
      artist_birth: "",
      artist_genre: "",
      artist_proof: "",
      artist_credit: "",
      isArtistApproval: false,
    };

    setSelectedArtist(newArtist);
    setSelectedKeys(new Set([]));
  };

  // 새로고침 함수 설정
  const handleSetRefreshFunction = (refreshFunc) => {
    setRefreshFunction(refreshFunc);
  };

  return (
    <div className="w-full h-full p-4 space-y-8 py-20">
      <div className="flex max-w-7xl mx-auto flex-col gap-6">
        {/* 왼쪽 영역 - 작가 목록 */}
        <div className="w-full space-y-4">
          <h1 className="text-2xl font-bold">작가 관리</h1>
          <ArtistList
            onSelectArtist={handleSelectArtist}
            selectedKeys={selectedKeys}
            onSelectionChange={(keys) => {
              console.log("메인 컴포넌트: 선택 키 변경됨", keys);
              setSelectedKeys(keys);
            }}
            onCreateArtist={handleCreateArtist}
            onRefresh={handleSetRefreshFunction}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
            selectedArtist={selectedArtist}
            setSelectedArtist={setSelectedArtist}
          />
        </div>

        {/* 오른쪽 영역 - 작가 상세 정보 */}
        <div className="w-full ">
          <section className="bg-content2 rounded-lg p-4">
            {selectedArtist ? (
              <ArtistDetail
                artist={selectedArtist}
                onUpdate={handleUpdateArtist}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
                onRefresh={() => {
                  // 작가 목록 새로고침 함수 호출
                  if (refreshFunction) {
                    console.log('부모 컴포넌트: 작가 목록 새로고침 시도');
                    refreshFunction();
                    console.log('부모 컴포넌트: 작가 목록 새로고침 완료');
                  } else {
                    console.log('부모 컴포넌트: refreshFunction 함수가 없습니다');
                  }
                }}
                refreshToggle={refreshToggle}
                setRefreshToggle={setRefreshToggle}
                selectedArtist={selectedArtist}
                setSelectedArtist={setSelectedArtist}
              />
            ) : (
              <div className="text-center text-default-500 py-8">
                작가를 선택하면 상세 정보가 표시됩니다.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
} 