'use client'
import React from "react";
import { HiUsers, HiPhotograph, HiClock, HiCurrencyDollar } from "react-icons/hi";
import { ProductList } from "../components/product-list";
import { ProductDetail } from "../components/product-detail";
import {useState, useEffect} from 'react'

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

export default function ProductAdminPage() {
  // 실제로는 서버에서 데이터를 가져올 것입니다
  const stats = [
    {
      title: "총 작품 수",
      value: "27",
      icon: <HiPhotograph className="w-6 h-6 text-white" />,
      color: "bg-green-500",
    },
    {
      title: "이번 달 신규 작품",
      value: "12",
      icon: <HiClock className="w-6 h-6 text-white" />,
      color: "bg-purple-500",
    },
    {
      title: "총 판매 금액",
      value: "₩4,350,000",
      icon: <HiCurrencyDollar className="w-6 h-6 text-white" />,
      color: "bg-pink-500",
    },
    {
      title: "등록된 아티스트",
      value: "8",
      icon: <HiUsers className="w-6 h-6 text-white" />,
      color: "bg-blue-500",
    },
  ];

  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [refreshProductList, setRefreshProductList] = React.useState(null);
  const [refreshToggle, setRefreshToggle] = useState(1);

  // 컴포넌트 마운트 시 스토리지 버킷 확인
  useEffect(() => {
    const checkStorageBucket = async () => {
      try {
        // 스토리지 버킷 확인 API 호출
        const response = await fetch('/api/product/storage');
        const data = await response.json();
        
        console.log('스토리지 버킷 상태:', data.message);
      } catch (error) {
        console.log('스토리지 버킷 확인 중 오류:', error);
      }
    };

    checkStorageBucket();
  }, []);

  // 신규 상품 등록 처리
  const handleCreateProduct = () => {
    // 빈 상품 객체 생성 (신규 등록용)
    const newProduct = {
      id: "",
      name: "",
      price: "",
      size: "",
      artist_id: "",
      image: [],
      make_method: "",
      make_material: "",
      make_frame: "",
      isRecommended: false,
      isTopOfWeek: false,
      make_date: "null",
      genre: "null",
      created_at: new Date().toISOString(),
    };
    
    setSelectedProduct(newProduct);
    setSelectedKeys(new Set([])); // 테이블 선택 초기화
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 py-20">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">상품 관리</h1>


        {/* Product List Section */}
        <section className="rounded-lg">
          <ProductList 
            onSelectProduct={setSelectedProduct} 
            selectedKeys={selectedKeys} 
            onSelectionChange={setSelectedKeys}
            onCreateProduct={handleCreateProduct}
            onRefresh={setRefreshProductList}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
          />
        </section>

        {/* Product Detail Section */}
        <section className="bg-content2 rounded-lg p-4">
          {selectedProduct ? (
            <ProductDetail
              product={selectedProduct}
              onUpdate={(updated) => setSelectedProduct(updated)}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
              selectedKeys={selectedKeys}
              setSelectedKeys={setSelectedKeys}
              onRefresh={() => {
                // 상품 목록 새로고침 함수 호출
                if (refreshProductList) {
                  console.log('부모 컴포넌트: 상품 목록 새로고침 시도');
                  refreshProductList();
                  console.log('부모 컴포넌트: 상품 목록 새로고침 완료');
                } else {
                  console.log('부모 컴포넌트: refreshProductList 함수가 없습니다');
                }
              }}
              refreshToggle={refreshToggle}
              setRefreshToggle={setRefreshToggle}
            />
          ) : (
            <div className="text-center text-default-500 py-8">
              상품을 선택하면 상세 정보가 표시됩니다.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}