"use client";
import React, { useState } from "react";
import { PaymentTicketList } from "../components/payment-ticket-list";
import { PaymentTicketDetail } from "../components/payment-ticket-detail";

export default function PaymentTicketPage() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [refreshToggle, setRefreshToggle] = useState(0);
  const [refreshFunction, setRefreshFunction] = useState(null);

  // 티켓 선택 시 호출
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  // 새로고침 함수 설정
  const handleSetRefreshFunction = (refreshFunc) => {
    setRefreshFunction(refreshFunc);
  };

  return (
    <div className="w-full h-full p-4 space-y-8 py-20">
      <div className="flex max-w-7xl mx-auto flex-col gap-6">
        {/* 왼쪽 영역 - 티켓 구매 목록 */}
        <div className="w-full space-y-4">
          <h1 className="text-2xl font-bold">티켓 구매 이력</h1>
          <PaymentTicketList
            onSelectTicket={handleSelectTicket}
            selectedKeys={selectedKeys}
            onSelectionChange={(keys) => setSelectedKeys(keys)}
            onRefresh={handleSetRefreshFunction}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
            selectedTicket={selectedTicket}
            setSelectedTicket={setSelectedTicket}
          />
        </div>
        {/* 오른쪽 영역 - 티켓 상세 정보 */}
        <div className="w-full ">
          <section className="bg-content2 rounded-lg p-4">
            {selectedTicket ? (
              <PaymentTicketDetail
                ticket={selectedTicket}
                selectedKeys={selectedKeys}
                setSelectedKeys={setSelectedKeys}
                onRefresh={() => {
                  if (refreshFunction) {
                    refreshFunction();
                  }
                }}
                refreshToggle={refreshToggle}
                setRefreshToggle={setRefreshToggle}
                selectedTicket={selectedTicket}
                setSelectedTicket={setSelectedTicket}
              />
            ) : (
              <div className="text-center text-default-500 py-8">
                티켓을 선택하면 상세 정보가 표시됩니다.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
} 