"use client";
import React, { useState } from "react";
import { Input, Button, useDisclosure, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/utils/toast";

export function PaymentCreditDetail({
  credit,
  selectedKeys,
  setSelectedKeys,
  onRefresh,
  refreshToggle,
  setRefreshToggle,
  selectedCredit,
  setSelectedCredit,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const toast = useToast();
  
  // 취소 확인 모달 관련 상태
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isResultOpen, onOpen: onResultOpen, onClose: onResultClose } = useDisclosure();
  const [resultMessage, setResultMessage] = useState("");

  if (!credit) return null;

  const handleCancel = () => {
    setSelectedCredit(null);
    setSelectedKeys(new Set([]));
  };

  // 결제 취소 모달 표시
  const showCancelConfirmation = () => {
    if (!credit.payment_key || credit.status === "cancel") {
      toast.error("취소 불가", "취소할 수 없는 결제입니다.");
      return;
    }
    onOpen();
  };

  // 결제 취소 처리 함수
  const handlePaymentCancel = async () => {
    onClose(); // 확인 모달 닫기
    setIsLoading(true);
    try {
      // API 엔드포인트를 통한 결제 취소 요청
      const response = await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey: credit.payment_key,
          cancelReason: "관리자 취소",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResultMessage(`결제 취소 중 오류가 발생했습니다: ${data.message || '알 수 없는 오류'}`);
        onResultOpen();
        setIsLoading(false);
        return;
      }

      if (data.success) {
        toast.success("결제 취소 완료", "결제가 성공적으로 취소되었습니다.");
        
        // 크레딧 상태를 최신 정보로 업데이트
        const { data: updatedCredit, error: creditError } = await supabase
          .from("payment_credit")
          .select("*, profiles(*)")
          .eq("id", credit.id)
          .single();
          
        if (!creditError && updatedCredit) {
          // 선택된 크레딧 정보 업데이트
          setSelectedCredit(updatedCredit);
        }
        
        // 부모 컴포넌트의 새로고침 함수 호출
        if (onRefresh) {
          onRefresh();
          // 새로고침 토글 상태를 변경하여 리스트 업데이트 트리거
          setRefreshToggle(prev => prev + 1);
        }
      } else {
        setResultMessage(`결제 취소 실패: ${data.message}`);
        onResultOpen();
      }
    } catch (error) {
      console.error('결제 취소 처리 오류:', error);
      setResultMessage(`결제 취소 처리 중 오류가 발생했습니다: ${error.message}`);
      onResultOpen();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">크레딧 구매 상세 정보</h2>
        <Button variant="flat" onPress={handleCancel}>
          <Icon icon="lucide:x" className="text-lg mr-1" />
          닫기
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <Input
          className="col-span-2 md:col-span-1"
          label="ID"
          value={credit.id || ""}
          isDisabled
        />
        <Input
          className="col-span-2 md:col-span-1"
          label="구매일시"
          value={credit.created_at ? new Date(credit.created_at).toLocaleString() : ""}
          isDisabled
        />
        <Input
          className="col-span-2 md:col-span-1"
          label="주문ID"
          value={credit.order_id || ""}
          isDisabled
        />
        <Input
          className="col-span-2 md:col-span-1"
          label="결제키"
          value={credit.payment_key || ""}
          isDisabled
        />
        <Input
          className="col-span-2 md:col-span-1"
          label="아티스트 ID"
          value={credit.artist_id || ""}
          isDisabled
        />
        <Input
          className="col-span-2 md:col-span-1"
          label="아티스트 이름"
          value={credit.profiles?.artist_name || ""}
          isDisabled
        />
        <Input
          className="col-span-2 md:col-span-1"
          label="아티스트 전화번호"
          value={credit.profiles?.artist_phone || ""}
          isDisabled
        />
        <Input
          className="col-span-2 md:col-span-1"
          label="금액"
          value={credit.amount ? `${credit.amount.toLocaleString()}원` : "0원"}
          isDisabled
        />
        <Input
          className="col-span-2 md:col-span-1"
          label="상태"
          value={credit.status || ""}
          isDisabled
        />
        <Input
          className="col-span-2"
          label="변환된 크레딧 (10,000원 = 1 크레딧)"
          value={credit.amount ? `${(credit.amount / 10000).toLocaleString()} 크레딧` : "0 크레딧"}
          isDisabled
        />
        <Button 
          color="danger" 
          className="col-span-2" 
          variant="flat" 
          onPress={showCancelConfirmation}
          isDisabled={isLoading || credit.status === "cancel"}
          isLoading={isLoading}
        >
          결제취소
        </Button>
      </div>

      {/* 결제 취소 확인 모달 */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader>결제 취소 확인</ModalHeader>
          <ModalBody>
            <p>정말로 이 결제를 취소하시겠습니까?</p>
            <p className="text-sm text-default-500 mt-2">
              결제번호: {credit.payment_key}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onClose}>
              취소
            </Button>
            <Button color="danger" onPress={handlePaymentCancel}>
              결제취소
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 결제 취소 결과 모달 */}
      <Modal isOpen={isResultOpen} onClose={onResultClose} size="sm">
        <ModalContent>
          <ModalHeader>결제 취소 결과</ModalHeader>
          <ModalBody>
            <p>{resultMessage}</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onResultClose}>
              확인
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 