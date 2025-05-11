"use client";
import React, { useState } from "react";
import { PaymentCreditList } from "../components/payment-credit-list";
import { PaymentCreditDetail } from "../components/payment-credit-detail";

export default function PaymentCreditPage() {
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [refreshToggle, setRefreshToggle] = useState(0);
  const [refreshFunction, setRefreshFunction] = useState(null);

  // 크레딧 결제 선택 시 호출
  const handleSelectCredit = (credit) => {
    setSelectedCredit(credit);
  };

  // 새로고침 함수 설정
  const handleSetRefreshFunction = (refreshFunc) => {
    setRefreshFunction(refreshFunc);
  };

  return (
    <div className="w-full h-full p-4 space-y-8 py-20">
      <div className="flex max-w-7xl mx-auto flex-col gap-6">
        {/* 왼쪽 영역 - 크레딧 구매 목록 */}
        <div className="w-full space-y-4">
          <h1 className="text-2xl font-bold">크레딧 구매 이력</h1>
          <PaymentCreditList
            onSelectCredit={handleSelectCredit}
            selectedKeys={selectedKeys}
            onSelectionChange={(keys) => setSelectedKeys(keys)}
            onRefresh={handleSetRefreshFunction}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
            selectedCredit={selectedCredit}
            setSelectedCredit={setSelectedCredit}
          />
        </div>
        {/* 오른쪽 영역 - 크레딧 상세 정보 */}
        <div className="w-full ">
          <section className="bg-content2 rounded-lg p-4">
            {selectedCredit ? (
              <PaymentCreditDetail
                credit={selectedCredit}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
                onRefresh={() => {
                  if (refreshFunction) {
                    refreshFunction();
                  }
                }}
                refreshToggle={refreshToggle}
                setRefreshToggle={setRefreshToggle}
                selectedCredit={selectedCredit}
                setSelectedCredit={setSelectedCredit}
              />
            ) : (
              <div className="text-center text-default-500 py-8">
                크레딧 구매 내역을 선택하면 상세 정보가 표시됩니다.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
} 