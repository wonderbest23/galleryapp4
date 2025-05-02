"use client";
import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { ExhibitionCarousel } from "./components/exhibition-carousel";
import { CategoryButtons } from "./components/category-buttons";
import { ExhibitionCards } from "./components/exhibition-cards";
import { GallerySection } from "./components/gallery-section";
import { MagazineCarousel } from "./components/magazine-carousel";
import { Input, Tabs, Tab, Card, CardBody, Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { useEffect, useState } from "react";
import GalleryCards from "./components/gallery-cards";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { FiPlus, FiMinus } from "react-icons/fi";
import Artists from "./components/Artists";
export default function Home() {
  const [exhibitionCategory, setExhibitionCategory] = useState("all");
  const [selectedTab, setSelectedTab] = useState("recommended");
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const exchangeRefundDisclosure = useDisclosure();
  const purchaseNoticeDisclosure = useDisclosure();
  const [ticketCount, setTicketCount] = useState(1);
  const [ticketPrice, setTicketPrice] = useState(15000); // 기본 티켓 가격
  const supabase = createClient();
  
  // 티켓 수량 증가
  const increaseTicket = () => {
    if (ticketCount < 10) { // 최대 10매로 제한
      setTicketCount(ticketCount + 1);
    }
  };
  
  // 티켓 수량 감소
  const decreaseTicket = () => {
    if (ticketCount > 1) { // 최소 1매로 제한
      setTicketCount(ticketCount - 1);
    }
  };
  
  // 총 금액 계산
  const totalPrice = ticketCount * ticketPrice;
  
  const getUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
    } else {
      setUser(data?.user);
    }
  };
  useEffect(() => {
    getUser();
  }, []);
  const getFavorites = async () => {
    const { data, error } = await supabase
      .from("favorite")
      .select("*")
      .eq("name", user.email);
    if (error) {
      console.error("Error fetching favorites:", error);
    } else {
      setFavorites(data || []);
    }
  };

  return (
    <div className="flex flex-col gap-3 justify-center items-center w-full">
      {/* Banner Carousel */}
      <ExhibitionCarousel user={user} />

      {/* Category Buttons */}
      <CategoryButtons />

      {/* Exhibition Tabs */}
      <div className="w-full flex flex-col mb-4 justify-center items-center mt-4">
        <div className="flex w-[90%] border-t border-gray-200 mb-2">
          <div className="w-1/6"></div>
          <div className="flex w-2/3">
            <button
              className={`text-[12px] flex-1 py-3 text-center font-medium ${exhibitionCategory === "all" ? "border-t-4 border-black text-black" : "text-gray-500"}`}
              onClick={() => setExhibitionCategory("all")}
            >
              전체전시
            </button>
            <button
              className={`text-[12px] flex-1 py-3 text-center font-medium ${exhibitionCategory === "free" ? "border-t-4 border-black text-black" : "text-gray-500"}`}
              onClick={() => setExhibitionCategory("free")}
            >
              무료전시
            </button>
            <button
              className={`text-[12px] flex-1 py-3 text-center font-medium ${exhibitionCategory === "recommended" ? "border-t-4 border-black text-black" : "text-gray-500"}`}
              onClick={() => setExhibitionCategory("recommended")}
            >
              추천전시
            </button>
          </div>
          <div className="w-1/6"></div>
        </div>
        
        <ExhibitionCards
          exhibitionCategory={exhibitionCategory}
          user={user}
        />
      </div>

      {/* Gallery Section */}
      <div className="w-full flex flex-col mb-4 justify-center items-center">
        <div className="flex w-[90%] border-t border-gray-200 mb-2">
          <div className="w-1/6"></div>
          <div className="flex w-2/3">
            <button
              className={`text-[12px] flex-1 py-3 text-center font-medium ${selectedTab === "recommended" ? "border-t-4 border-black text-black" : "text-gray-500"}`}
              onClick={() => setSelectedTab("recommended")}
            >
              추천갤러리
            </button>
            <button
              className={`text-[12px] flex-1 py-3 text-center font-medium ${selectedTab === "new" ? "border-t-4 border-black text-black" : "text-gray-500"}`}
              onClick={() => setSelectedTab("new")}
            >
              신규갤러리
            </button>
            <button
              className={`text-[12px] flex-1 py-3 text-center font-medium ${selectedTab === "now" ? "border-t-4 border-black text-black" : "text-gray-500"}`}
              onClick={() => setSelectedTab("now")}
            >
              전시갤러리
            </button>
          </div>
          <div className="w-1/6"></div>
        </div>
        
        <GalleryCards selectedTab={selectedTab} user={user} />
      </div>

      <Artists />

      {/* Magazine Section */}
      <MagazineCarousel />
      <div className="flex flex-row gap-4 pt-4 pb-[80px] bg-[hsl(0,0%,93%)] w-full justify-center items-center">
        <div className="w-[30%] h-full flex justify-center items-center ">
          <Image
            src="/footer/footer.png"
            alt="noimage"
            width={37}
            height={37}
          />
        </div>
        <div className="w-[70%] h-full text-[6px] flex flex-col justify-center items-start">
          <div className="flex flex-row justify-end w-full gap-x-4">
            <div className="cursor-pointer" onClick={exchangeRefundDisclosure.onOpen}>교환 및 반품</div>
            <div className="cursor-pointer" onClick={purchaseNoticeDisclosure.onOpen}>구매 전 유의사항</div>
          </div>
          <div>
          <p>(주) 아트앤브릿지  대표 : 박명서</p>
          <p>
            서울특별시 금천구 가산디지털 1 로 19, 16 층 1609-엘 04호 (가산동,
            대륭테크노타운 18 차 ){" "}
          </p>
          <p>사업자번호 137-87-03464 통신판매업 제2024-서울금천-2468호 </p>
          <p>이메일 rena35200@gmail.com / 개인정보보호책임자 : 김주홍</p>
          <p>고객센터,카카오채널 : 미술예술랭</p>
          </div>
        </div>
      </div>

      {/* 교환 및 반품 모달 */}
      <Modal isOpen={exchangeRefundDisclosure.isOpen} onClose={exchangeRefundDisclosure.onClose}>
        <ModalContent>
          <ModalHeader>교환 및 환불 안내</ModalHeader>
          <ModalBody>
            <div className="text-sm">
              <div className="mb-3">
                <h3 className="font-semibold mb-1">1. 환불 가능 기간</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>관람 1일 전까지 취소 시: 전액 환불 가능</li>
                  <li>관람 당일 취소: 환불 불가</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <h3 className="font-semibold mb-1">2. 환불 수수료</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>관람 3일 전까지: 100% 환불</li>
                  <li>관람 2일 전 ~ 1일 전: 취소 수수료 10% 차감 후 환불</li>
                  <li>관람 당일 및 이후: 환불 불가</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <h3 className="font-semibold mb-1">3. 교환/변경</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>날짜 및 시간 변경은 관람 2일 전까지 1회에 한하여 가능합니다.</li>
                  <li>예매자 본인의 요청에 한해 처리되며, 타인 명의로 변경은 불가합니다.</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <h3 className="font-semibold mb-1">4. 환불 방법</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>결제 수단에 따라 영업일 기준 3~7일 내 환불됩니다.</li>
                  <li>신용카드 결제 시, 카드사 사정에 따라 환불 일자가 상이할 수 있습니다.</li>
                </ul>
              </div>
              
              <div className="mb-3">
                <h3 className="font-semibold mb-1">5. 환불 불가 항목</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>본인의 착오로 인한 예매 (날짜/시간 착오 포함)</li>
                  <li>무단 미입장</li>
                  <li>외부 요인 (교통, 개인 사정 등)에 의한 취소</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={exchangeRefundDisclosure.onClose}>닫기</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 구매 전 유의사항 모달 */}
      <Modal isOpen={purchaseNoticeDisclosure.isOpen} onClose={purchaseNoticeDisclosure.onClose}>
        <ModalContent>
          <ModalHeader>티켓 구매 전 주의사항</ModalHeader>
          <ModalBody>
            <div className="text-sm">
              <ol className="list-decimal pl-5 space-y-2 mb-6">
                <li>본 티켓은 전시 관람을 위한 입장권으로, 지정된 날짜 및 시간에만 유효합니다.</li>
                <li>티켓은 1인 1매 기준이며, 중복 사용이 불가능합니다.</li>
                <li>전시 관람 시, 티켓과 함께 신분증(또는 QR코드)을 제시하셔야 입장 가능합니다.</li>
                <li>전시 관람 중 사진 촬영은 허용되나, 플래시/삼각대/영상촬영은 금지되어 있습니다.</li>
                <li>전시 특성상 소음, 통화, 음식물 반입 등은 제한될 수 있으니 양해 부탁드립니다.</li>
                <li>주최 측의 사정에 따라 사전 공지 없이 일부 작품이 변경되거나 관람이 제한될 수 있습니다.</li>
                <li>본 플랫폼은 티켓 예매 및 결제 시스템만을 제공하며, 전시 내용 및 운영은 주최 측의 책임 하에 진행됩니다.</li>
              </ol>
              
          
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={purchaseNoticeDisclosure.onClose}>닫기</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
